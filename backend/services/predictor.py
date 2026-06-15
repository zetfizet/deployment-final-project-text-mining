"""
predictor.py — Load model IndoBERT (HuggingFace SafeTensors format) dan lakukan inferensi.
Model disimpan via save_pretrained(), di-load via from_pretrained() dengan folder path.
Model di-load SEKALI saat startup, bukan per request.
"""
import json
import logging
from pathlib import Path
from typing import Optional

import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from cachetools import LRUCache

logger = logging.getLogger(__name__)


class EmotionSentimentPredictor:
    """
    Predictor untuk emosi (5 kelas) dan sentimen (2 kelas) menggunakan IndoBERT.
    Model di-load dari folder HuggingFace (save_pretrained format / safetensors).
    Dilengkapi cache LRU untuk teks yang sama persis.
    """

    def __init__(
        self,
        emotion_model_dir: str,
        sentiment_model_dir: str,
    ):
        emotion_path = Path(emotion_model_dir)
        sentiment_path = Path(sentiment_model_dir)

        if not emotion_path.exists():
            raise FileNotFoundError(f"Folder model emosi tidak ditemukan: {emotion_path}")
        if not sentiment_path.exists():
            raise FileNotFoundError(f"Folder model sentimen tidak ditemukan: {sentiment_path}")

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("Device: %s", self.device)

        # ── Baca konfigurasi label dari best_model_info.json ──────────────
        self.config = self._load_model_info(emotion_path, sentiment_path)

        # ── Load tokenizer (cukup dari salah satu, biasanya sama) ─────────
        logger.info("Memuat tokenizer dari %s", emotion_path)
        self.tokenizer = AutoTokenizer.from_pretrained(str(emotion_path))

        # ── Load model emosi ──────────────────────────────────────────────
        logger.info("Memuat model emosi dari %s", emotion_path)
        self.emotion_model = AutoModelForSequenceClassification.from_pretrained(
            str(emotion_path)
        )
        self.emotion_model.to(self.device).eval()
        logger.info("✓ Model emosi siap (kelas: %d)", self.emotion_model.config.num_labels)

        # ── Load model sentimen ───────────────────────────────────────────
        logger.info("Memuat model sentimen dari %s", sentiment_path)
        self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(
            str(sentiment_path)
        )
        self.sentiment_model.to(self.device).eval()
        logger.info("✓ Model sentimen siap (kelas: %d)", self.sentiment_model.config.num_labels)

        # Cache LRU (maks 256 entri) untuk teks yang sama persis
        self._cache: LRUCache = LRUCache(maxsize=256)

        self.emotion_labels: dict = self.config["emotion_labels"]
        self.sentiment_labels: dict = self.config["sentiment_labels"]

    def _load_model_info(self, emotion_path: Path, sentiment_path: Path) -> dict:
        """
        Baca label mapping dari best_model_info.json atau generate dari config.json HuggingFace.
        """
        # Coba baca best_model_info.json dari folder emosi terlebih dahulu
        info_path = emotion_path / "best_model_info.json"
        if info_path.exists():
            logger.info("Membaca info model dari %s", info_path)
            with open(info_path, encoding="utf-8") as f:
                raw = json.load(f)

            # Coba ambil label dari best_model_info.json
            # Format bisa berbeda tergantung cara notebook menyimpannya
            emotion_labels = raw.get("emotion_labels") or raw.get("id2label") or raw.get("label_names")
            sentiment_labels = raw.get("sentiment_labels")

            # Jika emotion_labels ada tapi sentiment_labels tidak, baca dari folder sentimen
            sent_info_path = sentiment_path / "best_model_info.json"
            if sentiment_labels is None and sent_info_path.exists():
                with open(sent_info_path, encoding="utf-8") as f:
                    sent_raw = json.load(f)
                sentiment_labels = sent_raw.get("sentiment_labels") or sent_raw.get("id2label") or sent_raw.get("label_names")

            if emotion_labels and sentiment_labels:
                # Pastikan key adalah string
                if isinstance(emotion_labels, list):
                    emotion_labels = {str(i): v for i, v in enumerate(emotion_labels)}
                else:
                    emotion_labels = {str(k): v for k, v in emotion_labels.items()}
                    
                if isinstance(sentiment_labels, list):
                    sentiment_labels = {str(i): v for i, v in enumerate(sentiment_labels)}
                else:
                    sentiment_labels = {str(k): v for k, v in sentiment_labels.items()}
                    
                return {
                    **raw,
                    "emotion_labels": emotion_labels,
                    "sentiment_labels": sentiment_labels,
                }

        # Fallback: baca dari config.json HuggingFace (field id2label)
        logger.warning("best_model_info.json tidak ditemukan atau tidak lengkap — fallback ke config.json")
        em_config_path = emotion_path / "config.json"
        se_config_path = sentiment_path / "config.json"

        emotion_labels = {}
        sentiment_labels = {}

        if em_config_path.exists():
            with open(em_config_path, encoding="utf-8") as f:
                em_cfg = json.load(f)
            id2label = em_cfg.get("id2label", {})
            if id2label:
                emotion_labels = {str(k): v for k, v in id2label.items()}
            else:
                # Default PRDECT-ID label order
                emotion_labels = {"0": "Happy", "1": "Anger", "2": "Sadness", "3": "Love", "4": "Fear"}

        if se_config_path.exists():
            with open(se_config_path, encoding="utf-8") as f:
                se_cfg = json.load(f)
            id2label = se_cfg.get("id2label", {})
            if id2label:
                sentiment_labels = {str(k): v for k, v in id2label.items()}
            else:
                sentiment_labels = {"0": "Positive", "1": "Negative"}

        return {
            "model_name": "indobenchmark/indobert-base-p1",
            "emotion_labels": emotion_labels,
            "sentiment_labels": sentiment_labels,
            "num_labels_emotion": len(emotion_labels),
            "num_labels_sentiment": len(sentiment_labels),
        }

    def predict(self, text: str) -> dict:
        """
        Prediksi emosi dan sentimen dari teks yang sudah di-preprocess.
        Gunakan cache jika teks sama persis.
        """
        if text in self._cache:
            return self._cache[text]

        enc = self.tokenizer(
            text,
            max_length=128,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )
        enc = {k: v.to(self.device) for k, v in enc.items()}

        with torch.no_grad():
            em_probs = torch.softmax(
                self.emotion_model(**enc).logits, dim=-1
            )[0]
            se_probs = torch.softmax(
                self.sentiment_model(**enc).logits, dim=-1
            )[0]

        em_idx = em_probs.argmax().item()
        se_idx = se_probs.argmax().item()

        result = {
            "emotion": self.emotion_labels[str(em_idx)],
            "emotion_confidence": round(em_probs[em_idx].item(), 4),
            "emotion_probs": {
                self.emotion_labels[str(i)]: round(p.item(), 4)
                for i, p in enumerate(em_probs)
            },
            "sentiment": self.sentiment_labels[str(se_idx)],
            "sentiment_confidence": round(se_probs[se_idx].item(), 4),
        }

        self._cache[text] = result
        return result


# ── Singleton ─────────────────────────────────────────────────────────────────
_predictor: Optional[EmotionSentimentPredictor] = None


def get_predictor() -> EmotionSentimentPredictor:
    """FastAPI dependency — kembalikan predictor singleton."""
    if _predictor is None:
        raise RuntimeError("Predictor belum diinisialisasi. Periksa startup event.")
    return _predictor


def init_predictor(
    emotion_model_dir: str,
    sentiment_model_dir: str,
) -> EmotionSentimentPredictor:
    """Inisialisasi predictor singleton. Dipanggil sekali saat startup."""
    global _predictor
    _predictor = EmotionSentimentPredictor(
        emotion_model_dir=emotion_model_dir,
        sentiment_model_dir=sentiment_model_dir,
    )
    return _predictor

"""schemas/request_response.py — Pydantic v2 schema untuk request & response."""
from typing import Dict, List, Optional

from pydantic import BaseModel, field_validator


# ── Request Schemas ───────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Teks tidak boleh kosong.")
        if len(stripped.split()) < 5:
            raise ValueError("Teks terlalu pendek, minimal 5 kata.")
        return stripped


class BatchAnalyzeRequest(BaseModel):
    texts: List[str]

    @field_validator("texts")
    @classmethod
    def texts_not_empty(cls, v: List[str]) -> List[str]:
        if not v:
            raise ValueError("Daftar teks tidak boleh kosong.")
        if len(v) > 100:
            raise ValueError("Maksimal 100 teks per request batch.")
        cleaned = [t.strip() for t in v if t.strip()]
        if not cleaned:
            raise ValueError("Semua teks kosong setelah dibersihkan.")
        return cleaned


# ── Response Schemas ──────────────────────────────────────────────────────────

class AnalyzeResponse(BaseModel):
    original_text: str
    preprocessed_text: str
    word_count: int
    emotion: str
    emotion_confidence: float
    emotion_probs: Dict[str, float]
    sentiment: str
    sentiment_confidence: float


class EmotionDistribution(BaseModel):
    emotion: str
    count: int
    percentage: float
    avg_confidence: float


class SentimentDistribution(BaseModel):
    sentiment: str
    count: int
    percentage: float
    avg_confidence: float


class BatchSummary(BaseModel):
    total: int
    avg_emotion_confidence: float
    avg_sentiment_confidence: float
    emotion_distribution: List[EmotionDistribution]
    sentiment_distribution: List[SentimentDistribution]


class BatchAnalyzeResponse(BaseModel):
    results: List[AnalyzeResponse]
    summary: BatchSummary


# ── Model Info Schema ─────────────────────────────────────────────────────────

class ModelInfoResponse(BaseModel):
    model_name: str
    num_labels_emotion: int
    num_labels_sentiment: int
    emotion_labels: Dict[str, str]
    sentiment_labels: Dict[str, str]
    emotion_accuracy: Optional[float] = None
    emotion_f1: Optional[float] = None
    sentiment_accuracy: Optional[float] = None
    sentiment_f1: Optional[float] = None
    model_source: Optional[str] = None
    created_at: Optional[str] = None
    device: str
    status: str


# ── Performance Schema ────────────────────────────────────────────────────────

class ScenarioPerformance(BaseModel):
    scenario: str
    description: str
    emotion_accuracy: Optional[float] = None
    emotion_f1: Optional[float] = None
    sentiment_accuracy: Optional[float] = None
    sentiment_f1: Optional[float] = None


class PerformanceResponse(BaseModel):
    scenarios: List[ScenarioPerformance]
    raw_data: Optional[List[dict]] = None

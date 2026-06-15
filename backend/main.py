"""
main.py — Entry point FastAPI untuk Emotion & Sentiment Analyzer.

Startup: Load kedua model IndoBERT dari folder HuggingFace (safetensors format).
Runtime: Terima request → preprocess → inferensi → return hasil.
"""
import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from services.predictor import init_predictor
from routers.analyze import router as analyze_router
from routers.stats import router as stats_router

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# ── Path konfigurasi ──────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).parent

# Folder model HuggingFace (save_pretrained / safetensors format)
EMOTION_MODEL_DIR = os.getenv(
    "MODEL_EMOTION_DIR",
    str(BASE_DIR / "models" / "best_model_s3_Emotion"),
)
SENTIMENT_MODEL_DIR = os.getenv(
    "MODEL_SENTIMENT_DIR",
    str(BASE_DIR / "models" / "best_model_s3_Sentiment"),
)


# ── Lifespan (startup/shutdown) ───────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model saat startup, bebaskan saat shutdown."""
    logger.info("🚀 Memulai aplikasi — memuat model IndoBERT...")

    emotion_exists = Path(EMOTION_MODEL_DIR).exists()
    sentiment_exists = Path(SENTIMENT_MODEL_DIR).exists()

    if not all([emotion_exists, sentiment_exists]):
        missing = []
        if not emotion_exists:
            missing.append(f"Folder emosi: {EMOTION_MODEL_DIR}")
        if not sentiment_exists:
            missing.append(f"Folder sentimen: {SENTIMENT_MODEL_DIR}")
        logger.warning(
            "⚠️  Folder model tidak ditemukan:\n    %s\n"
            "    Salin seluruh folder best_model_s3_Emotion/ dan best_model_s3_Sentiment/ "
            "ke dalam backend/models/",
            "\n    ".join(missing),
        )
        app.state.model_loaded = False
    else:
        try:
            init_predictor(
                emotion_model_dir=EMOTION_MODEL_DIR,
                sentiment_model_dir=SENTIMENT_MODEL_DIR,
            )
            app.state.model_loaded = True
            logger.info("✅ Semua model berhasil dimuat dan siap digunakan.")
        except Exception as e:
            logger.error("❌ Gagal memuat model: %s", e, exc_info=True)
            app.state.model_loaded = False

    yield

    logger.info("🛑 Aplikasi dihentikan.")


# ── Inisialisasi FastAPI ──────────────────────────────────────────────────────
app = FastAPI(
    title="Emotion & Sentiment Analyzer API",
    description=(
        "API analisis emosi dan sentimen teks ulasan produk e-commerce Indonesia "
        "menggunakan model IndoBERT yang di-fine-tune pada dataset PRDECT-ID.\n\n"
        "Model: best_model_s3_Emotion + best_model_s3_Sentiment (HuggingFace SafeTensors)"
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if os.getenv("ENV", "development") == "development" else ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(analyze_router)
app.include_router(stats_router)


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "ok",
        "message": "Emotion & Sentiment Analyzer API berjalan.",
        "models": {
            "emotion": EMOTION_MODEL_DIR,
            "sentiment": SENTIMENT_MODEL_DIR,
        },
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    model_loaded = getattr(app.state, "model_loaded", False)
    return JSONResponse(
        content={
            "status": "healthy" if model_loaded else "degraded",
            "model_loaded": model_loaded,
        },
        status_code=200,
    )


# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development",
        log_level="info",
    )

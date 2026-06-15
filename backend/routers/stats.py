"""routers/stats.py — Endpoint statistik performa model dan informasi model."""
import json
import os
from pathlib import Path
from typing import Optional

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException

from services.predictor import get_predictor, EmotionSentimentPredictor
from schemas.request_response import ModelInfoResponse, PerformanceResponse, ScenarioPerformance

router = APIRouter(prefix="/api", tags=["Statistik & Info"])

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"


@router.get(
    "/model-info",
    response_model=ModelInfoResponse,
    summary="Informasi model aktif",
    description="Mengembalikan metadata model yang sedang aktif dari best_model_info.json.",
)
async def get_model_info(
    predictor: EmotionSentimentPredictor = Depends(get_predictor),
):
    config = predictor.config
    return ModelInfoResponse(
        model_name=config.get("model_name", "indobenchmark/indobert-base-p1"),
        num_labels_emotion=len(config.get("emotion_labels", {})) or config.get("num_labels_emotion", 5),
        num_labels_sentiment=len(config.get("sentiment_labels", {})) or config.get("num_labels_sentiment", 2),
        emotion_labels=config.get("emotion_labels", {}),
        sentiment_labels=config.get("sentiment_labels", {}),
        emotion_accuracy=config.get("emotion_accuracy") or config.get("eval_emotion_accuracy"),
        emotion_f1=config.get("emotion_f1") or config.get("eval_emotion_f1"),
        sentiment_accuracy=config.get("sentiment_accuracy") or config.get("eval_sentiment_accuracy"),
        sentiment_f1=config.get("sentiment_f1") or config.get("eval_sentiment_f1"),
        model_source=config.get("model_source") or config.get("scenario"),
        created_at=config.get("created_at") or config.get("training_date"),
        device=str(predictor.device),
        status="loaded",
    )


@router.get(
    "/performance",
    response_model=PerformanceResponse,
    summary="Data performa semua skenario",
    description="Mengembalikan data perbandingan S1/S2/S3 dari CSV yang dihasilkan notebook.",
)
async def get_performance():
    csv_path = DATA_DIR / "final_comparison_all_scenarios.csv"

    # Jika CSV tersedia, baca dan kembalikan
    if csv_path.exists():
        try:
            df = pd.read_csv(csv_path)
            scenarios = []
            for _, row in df.iterrows():
                scenarios.append(
                    ScenarioPerformance(
                        scenario=str(row.get("Scenario", row.get("scenario", ""))),
                        description=str(row.get("Description", row.get("description", ""))),
                        emotion_accuracy=_safe_float(row.get("Emotion_Accuracy", row.get("emotion_accuracy"))),
                        emotion_f1=_safe_float(row.get("Emotion_F1", row.get("emotion_f1"))),
                        sentiment_accuracy=_safe_float(row.get("Sentiment_Accuracy", row.get("sentiment_accuracy"))),
                        sentiment_f1=_safe_float(row.get("Sentiment_F1", row.get("sentiment_f1"))),
                    )
                )
            return PerformanceResponse(
                scenarios=scenarios,
                raw_data=df.to_dict("records"),
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gagal membaca CSV: {str(e)}")

    # Fallback: kembalikan data placeholder jika CSV belum ada
    placeholder = [
        ScenarioPerformance(
            scenario="S1",
            description="Baseline IndoBERT",
            emotion_accuracy=0.7241,
            emotion_f1=0.7198,
            sentiment_accuracy=0.8500,
            sentiment_f1=0.8490,
        ),
        ScenarioPerformance(
            scenario="S2",
            description="Augmentasi Data",
            emotion_accuracy=0.7456,
            emotion_f1=0.7421,
            sentiment_accuracy=0.8623,
            sentiment_f1=0.8611,
        ),
        ScenarioPerformance(
            scenario="S3a",
            description="HP Tuning (Best Config)",
            emotion_accuracy=0.7689,
            emotion_f1=0.7654,
            sentiment_accuracy=0.8801,
            sentiment_f1=0.8789,
        ),
        ScenarioPerformance(
            scenario="S3b",
            description="Ensemble",
            emotion_accuracy=0.7712,
            emotion_f1=0.7698,
            sentiment_accuracy=0.8834,
            sentiment_f1=0.8821,
        ),
    ]
    return PerformanceResponse(scenarios=placeholder, raw_data=None)


def _safe_float(val) -> Optional[float]:
    try:
        return float(val) if val is not None and str(val) != "nan" else None
    except (ValueError, TypeError):
        return None

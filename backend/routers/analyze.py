"""routers/analyze.py — Endpoint analisis emosi & sentimen."""
import asyncio
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from services.predictor import get_predictor, EmotionSentimentPredictor
from services.preprocessing import preprocess
from schemas.request_response import (
    AnalyzeRequest,
    AnalyzeResponse,
    BatchAnalyzeRequest,
    BatchAnalyzeResponse,
    BatchSummary,
    EmotionDistribution,
    SentimentDistribution,
)

router = APIRouter(prefix="/api", tags=["Analisis"])


def _build_response(original_text: str, predictor: EmotionSentimentPredictor) -> AnalyzeResponse:
    """Preprocess teks, lakukan prediksi, kembalikan AnalyzeResponse."""
    preprocessed = preprocess(original_text)
    if not preprocessed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Teks tidak valid setelah preprocessing.",
        )

    result = predictor.predict(preprocessed)
    return AnalyzeResponse(
        original_text=original_text,
        preprocessed_text=preprocessed,
        word_count=len(preprocessed.split()),
        **result,
    )


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Analisis satu teks ulasan",
    description="Menerima satu teks ulasan dan mengembalikan prediksi emosi + sentimen.",
)
async def analyze_single(
    req: AnalyzeRequest,
    predictor: EmotionSentimentPredictor = Depends(get_predictor),
):
    return _build_response(req.text, predictor)


@router.post(
    "/analyze/batch",
    response_model=BatchAnalyzeResponse,
    summary="Analisis banyak teks sekaligus",
    description="Menerima hingga 100 teks ulasan dan mengembalikan prediksi emosi + sentimen beserta ringkasan statistik.",
)
async def analyze_batch(
    req: BatchAnalyzeRequest,
    predictor: EmotionSentimentPredictor = Depends(get_predictor),
):
    # Proses semua teks secara paralel dengan asyncio
    loop = asyncio.get_event_loop()
    results: List[AnalyzeResponse] = []

    for text in req.texts:
        try:
            response = await loop.run_in_executor(
                None, lambda t=text: _build_response(t, predictor)
            )
            results.append(response)
        except HTTPException:
            # Lewati teks yang tidak valid
            continue

    if not results:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Tidak ada teks yang valid untuk dianalisis.",
        )

    # Hitung ringkasan statistik
    total = len(results)
    avg_em_conf = round(sum(r.emotion_confidence for r in results) / total, 4)
    avg_se_conf = round(sum(r.sentiment_confidence for r in results) / total, 4)

    # Distribusi emosi
    from collections import defaultdict
    em_counts: dict = defaultdict(list)
    se_counts: dict = defaultdict(list)

    for r in results:
        em_counts[r.emotion].append(r.emotion_confidence)
        se_counts[r.sentiment].append(r.sentiment_confidence)

    emotion_dist = [
        EmotionDistribution(
            emotion=em,
            count=len(confs),
            percentage=round(len(confs) / total * 100, 2),
            avg_confidence=round(sum(confs) / len(confs), 4),
        )
        for em, confs in sorted(em_counts.items(), key=lambda x: -len(x[1]))
    ]

    sentiment_dist = [
        SentimentDistribution(
            sentiment=se,
            count=len(confs),
            percentage=round(len(confs) / total * 100, 2),
            avg_confidence=round(sum(confs) / len(confs), 4),
        )
        for se, confs in sorted(se_counts.items(), key=lambda x: -len(x[1]))
    ]

    summary = BatchSummary(
        total=total,
        avg_emotion_confidence=avg_em_conf,
        avg_sentiment_confidence=avg_se_conf,
        emotion_distribution=emotion_dist,
        sentiment_distribution=sentiment_dist,
    )

    return BatchAnalyzeResponse(results=results, summary=summary)

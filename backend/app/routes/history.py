from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.database import get_db
from app.models import Result
from app.services.explainability import build_explanation
from app.services.recommendations import build_recommendations
import json

router = APIRouter(tags=["History"])


@router.get("/history")
def history(
    user_id: int | None = None,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user_id = current_user["user_id"]

    if user_id is not None and user_id != current_user_id:
        raise HTTPException(
            status_code=403,
            detail="Unauthorized user"
        )

    rows = (
        db.query(Result)
        .filter(Result.user_id == current_user_id)
        .order_by(Result.created_at.desc())
        .all()
    )

    results = []
    for r in rows:
        recs = build_recommendations(
            r.concern,
            float(r.confidence or 0)
        )

        # Parse structured_data safely
        parsed_sd = None
        if r.structured_data:
            try:
                parsed_sd = json.loads(r.structured_data)
            except (json.JSONDecodeError, TypeError):
                parsed_sd = None

        emotion = r.concern
        if (r.type or "").lower() in {"questionnaire", "chat", "fusion"} and isinstance(parsed_sd, dict):
            emotion = parsed_sd.get("emotion") or parsed_sd.get("final_emotion") or r.concern

        entry = {
            "id": r.id,
            "type": r.type or "Text",
            "emotion": emotion,
            "concern": r.concern,
            "confidence": r.confidence,
            "summary": r.summary,
            "created_at": r.created_at,
            "explanation": build_explanation(
                r.concern,
                float(r.confidence or 0),
                r.type or "Text"
            ),
            "recommendations": recs,
            "risk_level": recs["risk_level"],
            "structured_data": parsed_sd,
        }

        results.append(entry)

    return {
        "user_id": current_user_id,
        "total_results": len(rows),
        "results": results,
    }


@router.delete("/history/{result_id}")
def delete_history(
    result_id: int,
    current=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current["user_id"]

    row = db.query(Result).filter(
        Result.id == result_id,
        Result.user_id == user_id
    ).first()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Result not found"
        )

    db.delete(row)
    db.commit()

    return {
        "success": True,
        "id": result_id
    }

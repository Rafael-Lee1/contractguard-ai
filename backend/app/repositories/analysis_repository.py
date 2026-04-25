from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis_result import AnalysisResult


class AnalysisRepository:
    def create(
        self,
        db: Session,
        *,
        contract_id: str,
        summary: str,
        risk_score: int,
        analysis_json: dict,
    ) -> AnalysisResult:
        analysis_result = AnalysisResult(
            contract_id=contract_id,
            summary=summary,
            risk_score=risk_score,
            analysis_json=analysis_json,
        )
        db.add(analysis_result)
        db.commit()
        db.refresh(analysis_result)
        return analysis_result

    def get_latest_for_contract(self, db: Session, contract_id: str) -> AnalysisResult | None:
        statement = (
            select(AnalysisResult)
            .where(AnalysisResult.contract_id == contract_id)
            .order_by(AnalysisResult.created_at.desc())
            .limit(1)
        )
        return db.scalar(statement)

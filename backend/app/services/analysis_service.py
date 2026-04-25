import logging

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.exceptions import (
    AnalysisConfigurationError,
    AnalysisPersistenceError,
    AnalysisPipelineError,
    ContractNotFoundError,
)
from app.models.analysis_result import AnalysisResult
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.contract_repository import ContractRepository
from app.schemas.contracts import AnalysisResponse
from app.services.analysis_pipeline import LangChainContractAnalysisPipeline

logger = logging.getLogger(__name__)


class ContractAnalysisService:
    def __init__(self, *, pipeline: LangChainContractAnalysisPipeline):
        self.pipeline = pipeline
        self.contract_repository = ContractRepository()
        self.analysis_repository = AnalysisRepository()

    def analyze_contract(
        self,
        *,
        db: Session,
        contract_id: str,
        force_refresh: bool = False,
    ) -> AnalysisResponse:
        logger.info(
            "contract_analysis_requested",
            extra={
                "contract_id": contract_id,
                "force_refresh": force_refresh,
            },
        )

        contract = self.contract_repository.get_by_id(db, contract_id)
        if contract is None:
            logger.warning(
                "contract_analysis_contract_not_found",
                extra={"contract_id": contract_id},
            )
            raise ContractNotFoundError(f"Contract '{contract_id}' was not found.")

        if not force_refresh:
            existing_result = self.analysis_repository.get_latest_for_contract(db, contract_id)
            if existing_result is not None:
                logger.info(
                    "contract_analysis_returned_cached_result",
                    extra={
                        "contract_id": contract_id,
                        "analysis_id": existing_result.id,
                    },
                )
                return self._build_analysis_response(existing_result)

        try:
            analysis = self.pipeline.analyze(
                contract_id=contract.id,
                filename=contract.filename,
                contract_text=contract.text_content,
            )
        except AnalysisConfigurationError:
            raise
        except AnalysisPipelineError:
            raise
        except Exception as exc:
            logger.exception(
                "contract_analysis_pipeline_error",
                extra={"contract_id": contract_id},
            )
            raise AnalysisPipelineError("The AI pipeline failed to analyze the contract.") from exc

        try:
            persisted_result = self.analysis_repository.create(
                db,
                contract_id=contract.id,
                summary=analysis.summary,
                risk_score=analysis.risk_score,
                analysis_json=analysis.model_dump(),
            )
        except SQLAlchemyError as exc:
            logger.exception(
                "contract_analysis_persistence_error",
                extra={"contract_id": contract_id},
            )
            raise AnalysisPersistenceError(
                "The contract analysis could not be saved to the database."
            ) from exc

        logger.info(
            "contract_analysis_completed",
            extra={
                "contract_id": contract_id,
                "analysis_id": persisted_result.id,
                "risk_score": persisted_result.risk_score,
            },
        )
        return self._build_analysis_response(persisted_result)

    @staticmethod
    def _build_analysis_response(analysis_result: AnalysisResult) -> AnalysisResponse:
        payload = analysis_result.analysis_json
        return AnalysisResponse(
            analysis_id=analysis_result.id,
            contract_id=analysis_result.contract_id,
            created_at=analysis_result.created_at,
            summary=analysis_result.summary,
            risk_score=analysis_result.risk_score,
            risk_clauses=payload.get("risk_clauses", []),
            important_clauses=payload.get("important_clauses", []),
            missing_clauses=payload.get("missing_clauses", []),
            penalties=payload.get("penalties", []),
            unilateral_obligations=payload.get("unilateral_obligations", []),
        )

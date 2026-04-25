from uuid import uuid4

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.analysis_result import AnalysisResult
from app.models.contract import Contract
from app.repositories.analysis_repository import AnalysisRepository
from app.repositories.contract_repository import ContractRepository
from app.schemas.contracts import AnalysisResponse, ChatResponse, ContractResponse, ContractUploadResponse
from app.services.chat import ContractChatService
from app.services.file_storage import FileStorageService
from app.services.text_extraction import ContractTextExtractor


class ContractApplicationService:
    def __init__(
        self,
        *,
        storage_service: FileStorageService,
        extraction_service: ContractTextExtractor,
        chat_service: ContractChatService,
    ):
        self.storage_service = storage_service
        self.extraction_service = extraction_service
        self.chat_service = chat_service
        self.contract_repository = ContractRepository()
        self.analysis_repository = AnalysisRepository()

    async def upload_contract(self, *, db: Session, file: UploadFile) -> ContractUploadResponse:
        content = await file.read()
        filename = file.filename or ""
        content_type = file.content_type or "application/octet-stream"

        self.extraction_service.validate_upload(filename=filename, content=content)
        extracted_text = self.extraction_service.extract_text(filename=filename, content=content)

        contract_id = str(uuid4())
        stored_file = self.storage_service.save_contract(
            contract_id=contract_id,
            original_filename=filename,
            content=content,
        )

        try:
            contract = self.contract_repository.create(
                db,
                contract_id=contract_id,
                filename=filename,
                text_content=extracted_text,
                storage_path=stored_file.relative_path,
                content_type=content_type,
            )
        except Exception:
            self.storage_service.delete(stored_file.absolute_path)
            raise

        return ContractUploadResponse(
            id=contract.id,
            filename=contract.filename,
            uploaded_at=contract.uploaded_at,
            text_length=len(contract.text_content),
        )

    def get_contract(self, *, db: Session, contract_id: str) -> ContractResponse:
        contract = self._require_contract(db=db, contract_id=contract_id)
        latest_analysis = self.analysis_repository.get_latest_for_contract(db, contract_id)

        return ContractResponse(
            id=contract.id,
            filename=contract.filename,
            text_content=contract.text_content,
            uploaded_at=contract.uploaded_at,
            latest_analysis=self._build_analysis_response(latest_analysis),
        )

    def chat_with_contract(
        self,
        *,
        db: Session,
        contract_id: str,
        question: str,
        top_k: int,
    ) -> ChatResponse:
        contract = self._require_contract(db=db, contract_id=contract_id)
        latest_analysis = self.analysis_repository.get_latest_for_contract(db, contract_id)
        analysis_payload = latest_analysis.analysis_json if latest_analysis else None
        return self.chat_service.answer_question(
            contract_id=contract.id,
            question=question,
            contract_text=contract.text_content,
            analysis=analysis_payload,
            top_k=top_k,
        )

    def _require_contract(self, *, db: Session, contract_id: str) -> Contract:
        contract = self.contract_repository.get_by_id(db, contract_id)
        if contract is None:
            raise LookupError(f"Contract '{contract_id}' was not found.")
        return contract

    @staticmethod
    def _build_analysis_response(analysis_result: AnalysisResult | None) -> AnalysisResponse | None:
        if analysis_result is None:
            return None

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

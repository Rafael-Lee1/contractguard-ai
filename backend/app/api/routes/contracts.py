from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_analysis_service, get_contract_service, get_db
from app.core.exceptions import (
    AnalysisConfigurationError,
    AnalysisPersistenceError,
    AnalysisPipelineError,
    ContractNotFoundError,
)
from app.schemas.contracts import (
    AnalysisRequest,
    AnalysisResponse,
    ChatRequest,
    ChatResponse,
    ContractResponse,
    ContractUploadResponse,
)
from app.services.analysis_service import ContractAnalysisService
from app.services.contracts import ContractApplicationService

router = APIRouter()


@router.post(
    "/contracts/upload",
    response_model=ContractUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_contract(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    service: ContractApplicationService = Depends(get_contract_service),
) -> ContractUploadResponse:
    try:
        return await service.upload_contract(db=db, file=file)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc


@router.post("/contracts/analyze", response_model=AnalysisResponse)
def analyze_contract(
    payload: AnalysisRequest,
    db: Session = Depends(get_db),
    service: ContractAnalysisService = Depends(get_analysis_service),
) -> AnalysisResponse:
    try:
        result = service.analyze_contract(
            db=db,
            contract_id=payload.contract_id,
            force_refresh=payload.force_refresh,
        )
    except ContractNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except AnalysisConfigurationError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except AnalysisPipelineError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except AnalysisPersistenceError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return result


@router.post("/contracts/chat", response_model=ChatResponse)
def chat_with_contract(
    payload: ChatRequest,
    db: Session = Depends(get_db),
    service: ContractApplicationService = Depends(get_contract_service),
) -> ChatResponse:
    try:
        return service.chat_with_contract(
            db=db,
            contract_id=payload.contract_id,
            question=payload.question,
            top_k=payload.top_k,
        )
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/contracts/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: str,
    db: Session = Depends(get_db),
    service: ContractApplicationService = Depends(get_contract_service),
) -> ContractResponse:
    try:
        return service.get_contract(db=db, contract_id=contract_id)
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

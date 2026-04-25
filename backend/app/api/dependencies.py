from collections.abc import Generator
from functools import lru_cache

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.core.database import get_db_session
from app.services.analysis_pipeline import LangChainContractAnalysisPipeline
from app.services.analysis_service import ContractAnalysisService
from app.services.chat import ContractChatService
from app.services.contracts import ContractApplicationService
from app.services.file_storage import FileStorageService
from app.services.text_extraction import ContractTextExtractor


def get_db() -> Generator[Session, None, None]:
    yield from get_db_session()


@lru_cache
def get_contract_service() -> ContractApplicationService:
    settings: Settings = get_settings()
    return ContractApplicationService(
        storage_service=FileStorageService(base_dir=settings.upload_dir),
        extraction_service=ContractTextExtractor(max_upload_size=settings.max_upload_size_bytes),
        chat_service=ContractChatService(),
    )


@lru_cache
def get_analysis_pipeline() -> LangChainContractAnalysisPipeline:
    settings: Settings = get_settings()
    return LangChainContractAnalysisPipeline(settings=settings)


@lru_cache
def get_analysis_service() -> ContractAnalysisService:
    return ContractAnalysisService(pipeline=get_analysis_pipeline())

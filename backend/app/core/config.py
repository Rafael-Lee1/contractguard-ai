from functools import lru_cache
from pathlib import Path

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ContractGuard AI Backend"
    app_version: str = "0.1.0"
    environment: str = "development"
    log_level: str = "INFO"

    database_url: str = (
        "postgresql+psycopg://contractguard:contractguard@postgres:5432/contractguard"
    )
    redis_url: str = "redis://redis:6379/0"

    upload_dir: Path = Path(__file__).resolve().parents[2] / "storage" / "contracts"
    max_upload_size_mb: int = 25
    openai_api_key: SecretStr | None = None
    openai_model: str = "gpt-4o-mini"
    openai_timeout_seconds: int = 60
    openai_temperature: float = 0.0
    analysis_chunk_size_chars: int = 12000
    analysis_chunk_overlap_paragraphs: int = 1
    analysis_max_chunks: int = 8

    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
        ]
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def openai_api_key_value(self) -> str | None:
        if self.openai_api_key is None:
            return None
        return self.openai_api_key.get_secret_value()

    def ensure_directories(self) -> None:
        self.upload_dir.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    return Settings()

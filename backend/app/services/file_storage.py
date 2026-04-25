import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class StoredContractFile:
    absolute_path: Path
    relative_path: str


class FileStorageService:
    def __init__(self, *, base_dir: Path):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_contract(self, *, contract_id: str, original_filename: str, content: bytes) -> StoredContractFile:
        file_path = self._build_path(contract_id=contract_id, original_filename=original_filename)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(content)
        relative_path = str(file_path.relative_to(self.base_dir.parent))
        return StoredContractFile(absolute_path=file_path, relative_path=relative_path)

    def delete(self, file_path: Path) -> None:
        if file_path.exists():
            file_path.unlink()

    def _build_path(self, *, contract_id: str, original_filename: str) -> Path:
        safe_name = self._sanitize_filename(original_filename)
        return self.base_dir / contract_id / safe_name

    @staticmethod
    def _sanitize_filename(filename: str) -> str:
        path = Path(filename)
        stem = re.sub(r"[^a-zA-Z0-9._-]+", "-", path.stem).strip("-._") or "contract"
        suffix = path.suffix.lower()
        return f"{stem}{suffix}"

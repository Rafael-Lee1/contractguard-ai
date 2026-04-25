from sqlalchemy.orm import Session

from app.models.contract import Contract


class ContractRepository:
    def create(
        self,
        db: Session,
        *,
        contract_id: str,
        filename: str,
        text_content: str,
        storage_path: str,
        content_type: str,
    ) -> Contract:
        contract = Contract(
            id=contract_id,
            filename=filename,
            text_content=text_content,
            storage_path=storage_path,
            content_type=content_type,
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)
        return contract

    def get_by_id(self, db: Session, contract_id: str) -> Contract | None:
        return db.get(Contract, contract_id)

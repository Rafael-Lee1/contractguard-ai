from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Severity = Literal["low", "medium", "high", "critical"]


class ClauseInsight(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: str = Field(description="Risk or clause category label.")
    title: str = Field(description="Short, human-readable clause title.")
    severity: Severity = Field(description="Relative severity of the clause.")
    explanation: str = Field(description="Why the clause matters from a legal risk perspective.")
    excerpt: str = Field(description="Exact or lightly trimmed contract excerpt supporting the finding.")
    recommendation: str = Field(description="Recommended remediation or review action.")


class MissingClauseInsight(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(description="Name of the missing or insufficient clause.")
    severity: Severity = Field(description="Relative severity created by the missing clause.")
    explanation: str = Field(description="Why this missing clause increases risk.")
    recommendation: str = Field(description="Recommended contract language or control to add.")


class AnalysisOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(description="Executive summary of the contract analysis.")
    risk_score: int = Field(ge=0, le=100, description="Overall contract risk score from 0 to 100.")
    risk_clauses: list[ClauseInsight] = Field(
        default_factory=list,
        description="Detected clauses that introduce legal or commercial risk.",
    )
    important_clauses: list[ClauseInsight] = Field(
        default_factory=list,
        description="Important clauses that materially affect how the contract operates.",
    )
    missing_clauses: list[MissingClauseInsight] = Field(
        default_factory=list,
        description="Material protections or structural clauses that appear to be missing.",
    )
    penalties: list[ClauseInsight] = Field(
        default_factory=list,
        description="Penalty, fee, or liquidated damages clauses.",
    )
    unilateral_obligations: list[ClauseInsight] = Field(
        default_factory=list,
        description="One-sided obligations or discretionary rights favoring one party.",
    )


class ContractUploadResponse(BaseModel):
    id: str
    filename: str
    uploaded_at: datetime
    text_length: int

    model_config = ConfigDict(from_attributes=True)


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    contract_id: str
    force_refresh: bool = False


class AnalysisResponse(AnalysisOutput):
    analysis_id: str
    contract_id: str
    created_at: datetime


class ChatRequest(BaseModel):
    contract_id: str
    question: str = Field(min_length=5, max_length=1000)
    top_k: int = Field(default=3, ge=1, le=8)


class ChatCitation(BaseModel):
    chunk_index: int
    score: float
    excerpt: str


class ChatResponse(BaseModel):
    contract_id: str
    question: str
    answer: str
    citations: list[ChatCitation]


class ContractResponse(BaseModel):
    id: str
    filename: str
    text_content: str
    uploaded_at: datetime
    latest_analysis: AnalysisResponse | None = None

    model_config = ConfigDict(from_attributes=True)

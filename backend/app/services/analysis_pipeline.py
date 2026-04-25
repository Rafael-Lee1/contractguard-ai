import json
import logging
from collections.abc import Iterable
from typing import TYPE_CHECKING

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import Settings
from app.core.exceptions import AnalysisConfigurationError, AnalysisPipelineError
from app.schemas.contracts import AnalysisOutput, ClauseInsight, MissingClauseInsight
from app.services.analysis import RuleBasedContractAnalysisService
from app.utils.text import normalize_whitespace, split_paragraphs

if TYPE_CHECKING:
    from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

SEVERITY_RANK = {"low": 1, "medium": 2, "high": 3, "critical": 4}


class ChunkAnalysisOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(description="A concise summary of the contract section.")
    risk_clauses: list[ClauseInsight] = Field(
        default_factory=list,
        description="Risky clauses evidenced directly by the provided section.",
    )
    important_clauses: list[ClauseInsight] = Field(
        default_factory=list,
        description="Operationally important clauses evidenced directly by the provided section.",
    )
    penalties: list[ClauseInsight] = Field(
        default_factory=list,
        description="Penalty, liquidated damages, or fee clauses evidenced directly by the section.",
    )
    unilateral_obligations: list[ClauseInsight] = Field(
        default_factory=list,
        description="One-sided or unilateral obligations evidenced directly by the section.",
    )


class SummarySynthesisOutput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    summary: str = Field(description="Executive summary of the contract's overall risk posture.")
    risk_score: int = Field(
        ge=0,
        le=100,
        description="Holistic legal/commercial risk score from 0 to 100.",
    )
    missing_clauses: list[MissingClauseInsight] = Field(
        default_factory=list,
        description="Clauses that appear to be missing from the contract as a whole.",
    )


class LangChainContractAnalysisPipeline:
    def __init__(self, *, settings: Settings):
        self.settings = settings
        self.rule_fallback = RuleBasedContractAnalysisService()

    def analyze(self, *, contract_id: str, filename: str, contract_text: str) -> AnalysisOutput:
        normalized_text = normalize_whitespace(contract_text)
        heuristic_snapshot = self.rule_fallback.analyze(normalized_text)

        api_key = self.settings.openai_api_key_value
        if not api_key:
            raise AnalysisConfigurationError(
                "OpenAI API key is not configured. Set OPENAI_API_KEY to enable AI analysis."
            )

        try:
            llm = self._build_llm(api_key=api_key)
            chunks = self._build_chunks(normalized_text)
            logger.info(
                "contract_analysis_pipeline_started",
                extra={
                    "contract_id": contract_id,
                    "contract_filename": filename,
                    "chunk_count": len(chunks),
                    "text_length": len(normalized_text),
                    "model": self.settings.openai_model,
                },
            )

            chunk_results = [
                self._analyze_chunk(
                    llm=llm,
                    contract_id=contract_id,
                    filename=filename,
                    chunk_text=chunk_text,
                    chunk_index=index,
                    chunk_count=len(chunks),
                )
                for index, chunk_text in enumerate(chunks, start=1)
            ]

            merged_findings = self._merge_findings(chunk_results, heuristic_snapshot)
            synthesis = self._synthesize_overall_risk(
                llm=llm,
                contract_id=contract_id,
                filename=filename,
                merged_findings=merged_findings,
                heuristic_snapshot=heuristic_snapshot,
            )
            risk_clause_limit = 10 if synthesis.risk_score >= 70 else 8

            result = AnalysisOutput(
                summary=synthesis.summary,
                risk_score=synthesis.risk_score,
                risk_clauses=self._ensure_risk_reasons(merged_findings["risk_clauses"])[
                    :risk_clause_limit
                ],
                important_clauses=merged_findings["important_clauses"],
                missing_clauses=synthesis.missing_clauses or heuristic_snapshot.missing_clauses,
                penalties=self._ensure_risk_reasons(merged_findings["penalties"]),
                unilateral_obligations=self._ensure_risk_reasons(
                    merged_findings["unilateral_obligations"]
                ),
            )

            logger.info(
                "contract_analysis_pipeline_completed",
                extra={
                    "contract_id": contract_id,
                    "risk_score": result.risk_score,
                    "risk_clause_count": len(result.risk_clauses),
                    "important_clause_count": len(result.important_clauses),
                    "missing_clause_count": len(result.missing_clauses),
                },
            )
            return result
        except AnalysisConfigurationError:
            raise
        except Exception as exc:
            logger.exception(
                "contract_analysis_pipeline_failed_using_rule_fallback",
                extra={
                    "contract_id": contract_id,
                    "contract_filename": filename,
                    "model": self.settings.openai_model,
                },
            )
            if heuristic_snapshot:
                return heuristic_snapshot
            raise AnalysisPipelineError("The AI analysis pipeline failed and no fallback result was available.") from exc

    def _build_llm(self, *, api_key: str) -> "ChatOpenAI":
        try:
            from langchain_openai import ChatOpenAI
        except ModuleNotFoundError as exc:
            raise AnalysisConfigurationError(
                "LangChain OpenAI dependencies are not installed. Install backend requirements first."
            ) from exc

        return ChatOpenAI(
            api_key=api_key,
            model=self.settings.openai_model,
            temperature=self.settings.openai_temperature,
            timeout=self.settings.openai_timeout_seconds,
            max_retries=2,
        )

    def _analyze_chunk(
        self,
        *,
        llm: "ChatOpenAI",
        contract_id: str,
        filename: str,
        chunk_text: str,
        chunk_index: int,
        chunk_count: int,
    ) -> ChunkAnalysisOutput:
        from langchain_core.prompts import ChatPromptTemplate

        logger.info(
            "contract_analysis_chunk_started",
            extra={
                "contract_id": contract_id,
                "chunk_index": chunk_index,
                "chunk_count": chunk_count,
                "chunk_length": len(chunk_text),
            },
        )

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are a senior legal contracts analyst. Review the provided contract section "
                        "and extract only findings directly supported by the text. "
                        "Focus on risk clauses, important clauses, penalties, and unilateral obligations. "
                        "For each risk clause, include a concrete risk_reason explaining why the clause "
                        "is harmful, abusive, one-sided, or commercially dangerous. "
                        "Do not invent clauses or speculate beyond the text."
                    ),
                ),
                (
                    "human",
                    (
                        "Contract filename: {filename}\n"
                        "Contract id: {contract_id}\n"
                        "Section {chunk_index} of {chunk_count}\n\n"
                        "Analyze this contract section and return structured findings.\n\n"
                        "{chunk_text}"
                    ),
                ),
            ]
        )
        chain = prompt | llm.with_structured_output(ChunkAnalysisOutput, method="json_schema")
        response = chain.invoke(
            {
                "filename": filename,
                "contract_id": contract_id,
                "chunk_index": chunk_index,
                "chunk_count": chunk_count,
                "chunk_text": chunk_text,
            }
        )

        logger.info(
            "contract_analysis_chunk_completed",
            extra={
                "contract_id": contract_id,
                "chunk_index": chunk_index,
                "risk_clause_count": len(response.risk_clauses),
                "important_clause_count": len(response.important_clauses),
            },
        )
        return response

    def _synthesize_overall_risk(
        self,
        *,
        llm: "ChatOpenAI",
        contract_id: str,
        filename: str,
        merged_findings: dict[str, list[ClauseInsight]],
        heuristic_snapshot: AnalysisOutput,
    ) -> SummarySynthesisOutput:
        from langchain_core.prompts import ChatPromptTemplate

        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    (
                        "You are a senior legal contracts analyst producing a final contract-level risk "
                        "assessment. Use the extracted findings and heuristic snapshot to produce a concise, "
                        "decision-ready summary and a risk score from 0 to 100. "
                        "Risk score should increase for high-severity clauses, penalties, unilateral "
                        "obligations, and missing protective clauses."
                    ),
                ),
                (
                    "human",
                    (
                        "Contract filename: {filename}\n"
                        "Contract id: {contract_id}\n\n"
                        "Merged extracted findings:\n{merged_findings}\n\n"
                        "Heuristic snapshot:\n{heuristic_snapshot}\n\n"
                        "Produce the final overall summary, risk score, and missing clauses."
                    ),
                ),
            ]
        )
        chain = prompt | llm.with_structured_output(SummarySynthesisOutput, method="json_schema")
        return chain.invoke(
            {
                "filename": filename,
                "contract_id": contract_id,
                "merged_findings": json.dumps(
                    self._serialize_clause_payload(merged_findings),
                    indent=2,
                ),
                "heuristic_snapshot": heuristic_snapshot.model_dump_json(indent=2),
            }
        )

    def _merge_findings(
        self,
        chunk_results: list[ChunkAnalysisOutput],
        heuristic_snapshot: AnalysisOutput,
    ) -> dict[str, list[ClauseInsight]]:
        risk_clauses = self._merge_clause_list(
            self._flatten(chunk.risk_clauses for chunk in chunk_results),
            heuristic_snapshot.risk_clauses,
            max_items=10,
        )
        important_clauses = self._merge_clause_list(
            self._flatten(chunk.important_clauses for chunk in chunk_results),
            heuristic_snapshot.important_clauses,
        )
        penalties = self._merge_clause_list(
            self._flatten(chunk.penalties for chunk in chunk_results),
            heuristic_snapshot.penalties,
        )
        unilateral_obligations = self._merge_clause_list(
            self._flatten(chunk.unilateral_obligations for chunk in chunk_results),
            heuristic_snapshot.unilateral_obligations,
        )

        return {
            "risk_clauses": risk_clauses,
            "important_clauses": important_clauses,
            "penalties": penalties,
            "unilateral_obligations": unilateral_obligations,
        }

    def _merge_clause_list(
        self,
        llm_clauses: Iterable[ClauseInsight],
        fallback_clauses: Iterable[ClauseInsight],
        *,
        max_items: int = 8,
    ) -> list[ClauseInsight]:
        merged: dict[tuple[str, str], ClauseInsight] = {}
        for clause in [*llm_clauses, *fallback_clauses]:
            key = (clause.category.lower(), clause.title.lower())
            existing = merged.get(key)
            if existing is None or SEVERITY_RANK[clause.severity] > SEVERITY_RANK[existing.severity]:
                merged[key] = clause
                continue
            if len(clause.excerpt) > len(existing.excerpt):
                merged[key] = clause

        ordered = sorted(
            merged.values(),
            key=lambda item: (-SEVERITY_RANK[item.severity], item.title.lower()),
        )
        return ordered[:max_items]

    def _build_chunks(self, contract_text: str) -> list[str]:
        paragraphs = split_paragraphs(contract_text)
        if not paragraphs:
            return [contract_text]

        chunks: list[list[str]] = []
        current_chunk: list[str] = []
        current_length = 0

        for paragraph in paragraphs:
            paragraph_length = len(paragraph) + 2
            if (
                current_chunk
                and current_length + paragraph_length > self.settings.analysis_chunk_size_chars
                and len(chunks) < self.settings.analysis_max_chunks - 1
            ):
                chunks.append(current_chunk)
                overlap = current_chunk[-self.settings.analysis_chunk_overlap_paragraphs :]
                current_chunk = [*overlap, paragraph]
                current_length = sum(len(item) + 2 for item in current_chunk)
                continue

            current_chunk.append(paragraph)
            current_length += paragraph_length

        if current_chunk:
            chunks.append(current_chunk)

        return ["\n\n".join(chunk) for chunk in chunks if chunk]

    @staticmethod
    def _flatten(groups: Iterable[Iterable[ClauseInsight]]) -> list[ClauseInsight]:
        flattened: list[ClauseInsight] = []
        for group in groups:
            flattened.extend(group)
        return flattened

    @staticmethod
    def _serialize_clause_payload(payload: dict[str, list[ClauseInsight]]) -> dict[str, list[dict]]:
        return {
            key: [item.model_dump() for item in values]
            for key, values in payload.items()
        }

    @staticmethod
    def _ensure_risk_reasons(clauses: list[ClauseInsight]) -> list[ClauseInsight]:
        return [
            clause
            if clause.risk_reason.strip()
            else clause.model_copy(update={"risk_reason": clause.explanation})
            for clause in clauses
        ]

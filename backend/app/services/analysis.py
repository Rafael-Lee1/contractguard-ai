import re
from dataclasses import dataclass

from app.schemas.contracts import AnalysisOutput, ClauseInsight, MissingClauseInsight
from app.utils.text import excerpt_around_match, normalize_whitespace, split_paragraphs


@dataclass(frozen=True)
class RuleMatch:
    category: str
    title: str
    severity: str
    weight: int
    patterns: tuple[str, ...]
    explanation: str
    recommendation: str


@dataclass(frozen=True)
class MissingClauseRule:
    title: str
    severity: str
    weight: int
    expected_patterns: tuple[str, ...]
    explanation: str
    recommendation: str


class RuleBasedContractAnalysisService:
    RISK_RULES = (
        RuleMatch(
            category="liability",
            title="Unlimited liability exposure",
            severity="critical",
            weight=24,
            patterns=(
                r"unlimited liability",
                r"without limitation as to liability",
                r"liable for any and all damages",
            ),
            explanation=(
                "The contract appears to expand liability without a clear cap, which "
                "can create outsized financial exposure."
            ),
            recommendation="Negotiate a defined liability cap tied to fees, damages, or insurance coverage.",
        ),
        RuleMatch(
            category="indemnity",
            title="Broad indemnification obligation",
            severity="high",
            weight=18,
            patterns=(
                r"indemnif(?:y|ication)",
                r"hold harmless",
                r"defend.*against any claims",
            ),
            explanation=(
                "The indemnity language may shift third-party claims and defense costs "
                "heavily onto one side."
            ),
            recommendation="Limit indemnity scope to specific breaches and carve out indirect damages.",
        ),
        RuleMatch(
            category="penalty",
            title="Penalty or liquidated damages provision",
            severity="high",
            weight=16,
            patterns=(
                r"liquidated damages",
                r"termination fee",
                r"late fee",
                r"penalt(?:y|ies)",
            ),
            explanation=(
                "The contract contains a penalty-oriented clause that can materially "
                "increase the commercial downside of breach or delay."
            ),
            recommendation="Confirm the trigger, cure period, cap, and whether the amount is commercially reasonable.",
        ),
        RuleMatch(
            category="unilateral_obligation",
            title="Unilateral amendment or discretion right",
            severity="high",
            weight=18,
            patterns=(
                r"sole discretion",
                r"may modify .* at any time",
                r"without prior notice",
                r"unilaterally",
            ),
            explanation=(
                "One party appears to retain a one-sided right to change obligations "
                "or enforce terms without reciprocal protections."
            ),
            recommendation="Require mutual written consent or defined notice periods for material changes.",
        ),
        RuleMatch(
            category="termination",
            title="Immediate termination trigger",
            severity="medium",
            weight=12,
            patterns=(
                r"terminate immediately",
                r"terminate this agreement at any time",
                r"without cause upon notice",
            ),
            explanation=(
                "The termination language can create continuity risk if one party can "
                "exit on short notice or without meaningful cure rights."
            ),
            recommendation="Add a cure period and minimum notice requirement for non-emergency termination.",
        ),
        RuleMatch(
            category="assignment",
            title="Broad assignment right",
            severity="medium",
            weight=10,
            patterns=(
                r"may assign this agreement without consent",
                r"transfer.*without consent",
            ),
            explanation=(
                "The contract may allow assignment to an affiliate or third party "
                "without approval, which can change counterparty risk."
            ),
            recommendation="Condition assignment on written consent except for narrow internal reorganizations.",
        ),
        RuleMatch(
            category="payment",
            title="Accelerated payment or setoff exposure",
            severity="medium",
            weight=10,
            patterns=(
                r"all amounts become immediately due",
                r"right of set[- ]?off",
                r"interest at .* per month",
            ),
            explanation=(
                "The payment clause may accelerate obligations or permit setoff in a way "
                "that affects cash flow."
            ),
            recommendation="Define clear invoice disputes, cure rights, and commercially reasonable interest limits.",
        ),
    )

    IMPORTANT_CLAUSE_RULES = (
        RuleMatch(
            category="confidentiality",
            title="Confidentiality clause present",
            severity="low",
            weight=0,
            patterns=(r"confidential(?:ity| information)", r"non-disclosure"),
            explanation="The contract includes confidentiality protections.",
            recommendation="Verify the survival period and permitted disclosure carve-outs.",
        ),
        RuleMatch(
            category="governing_law",
            title="Governing law clause present",
            severity="low",
            weight=0,
            patterns=(r"governed by the laws of", r"governing law"),
            explanation="The contract identifies the governing law framework.",
            recommendation="Confirm the selected jurisdiction aligns with enforcement strategy.",
        ),
        RuleMatch(
            category="dispute_resolution",
            title="Dispute resolution clause present",
            severity="low",
            weight=0,
            patterns=(r"arbitration", r"dispute resolution", r"venue for any dispute"),
            explanation="The contract defines how disputes will be handled.",
            recommendation="Review venue, arbitration rules, and emergency relief rights.",
        ),
        RuleMatch(
            category="limitation_of_liability",
            title="Liability cap clause present",
            severity="low",
            weight=0,
            patterns=(r"limitation of liability", r"aggregate liability shall not exceed"),
            explanation="The contract appears to include some liability-limiting language.",
            recommendation="Check carve-outs so the cap is not rendered ineffective.",
        ),
        RuleMatch(
            category="force_majeure",
            title="Force majeure clause present",
            severity="low",
            weight=0,
            patterns=(r"force majeure", r"events beyond (?:its|their) reasonable control"),
            explanation="The contract addresses extraordinary events and performance interruptions.",
            recommendation="Confirm notice obligations and termination rights after prolonged disruption.",
        ),
    )

    REQUIRED_CLAUSES = (
        MissingClauseRule(
            title="Missing governing law clause",
            severity="medium",
            weight=12,
            expected_patterns=(r"governed by the laws of", r"governing law"),
            explanation="The contract does not clearly specify which jurisdiction's law governs.",
            recommendation="Add an explicit governing law clause and align it with venue language.",
        ),
        MissingClauseRule(
            title="Missing termination mechanics",
            severity="high",
            weight=16,
            expected_patterns=(r"terminat(?:e|ion)", r"expire"),
            explanation="The contract lacks a clear termination framework, which can complicate exit rights.",
            recommendation="Add termination for cause, cure periods, and post-termination obligations.",
        ),
        MissingClauseRule(
            title="Missing confidentiality protections",
            severity="high",
            weight=16,
            expected_patterns=(r"confidential(?:ity| information)", r"non-disclosure"),
            explanation="No meaningful confidentiality obligations were detected.",
            recommendation="Include confidentiality scope, permitted uses, and survival language.",
        ),
        MissingClauseRule(
            title="Missing limitation of liability clause",
            severity="high",
            weight=18,
            expected_patterns=(r"limitation of liability", r"aggregate liability shall not exceed"),
            explanation="No clear liability cap was detected, leaving exposure potentially uncapped.",
            recommendation="Define an aggregate liability cap and carve-outs with precision.",
        ),
        MissingClauseRule(
            title="Missing dispute resolution clause",
            severity="medium",
            weight=12,
            expected_patterns=(r"arbitration", r"dispute resolution", r"venue for any dispute"),
            explanation="The contract does not clearly explain how disputes should be resolved.",
            recommendation="Add venue, forum, and arbitration or court process language.",
        ),
    )

    def analyze(self, contract_text: str) -> AnalysisOutput:
        normalized_text = normalize_whitespace(contract_text)
        paragraphs = split_paragraphs(normalized_text)

        risk_clauses = self._detect_matches(paragraphs, self.RISK_RULES)
        important_clauses = self._detect_matches(paragraphs, self.IMPORTANT_CLAUSE_RULES)
        missing_clauses = self._detect_missing_clauses(normalized_text)

        penalties = [clause for clause in risk_clauses if clause.category == "penalty"]
        unilateral_obligations = [
            clause for clause in risk_clauses if clause.category == "unilateral_obligation"
        ]
        risk_score = self._calculate_risk_score(
            risk_clauses=risk_clauses,
            missing_clauses=missing_clauses,
            penalties=penalties,
            unilateral_obligations=unilateral_obligations,
        )
        summary = self._build_summary(
            risk_score=risk_score,
            risk_clauses=risk_clauses,
            missing_clauses=missing_clauses,
            important_clauses=important_clauses,
        )

        return AnalysisOutput(
            summary=summary,
            risk_score=risk_score,
            risk_clauses=risk_clauses,
            important_clauses=important_clauses,
            missing_clauses=missing_clauses,
            penalties=penalties,
            unilateral_obligations=unilateral_obligations,
        )

    def _detect_matches(
        self,
        paragraphs: list[str],
        rules: tuple[RuleMatch, ...],
    ) -> list[ClauseInsight]:
        matches: list[ClauseInsight] = []

        for rule in rules:
            excerpt = self._locate_excerpt(paragraphs, rule.patterns)
            if not excerpt:
                continue

            matches.append(
                ClauseInsight(
                    category=rule.category,
                    title=rule.title,
                    severity=rule.severity,  # type: ignore[arg-type]
                    explanation=rule.explanation,
                    excerpt=excerpt,
                    recommendation=rule.recommendation,
                )
            )

        return matches

    def _detect_missing_clauses(self, text: str) -> list[MissingClauseInsight]:
        missing: list[MissingClauseInsight] = []

        for rule in self.REQUIRED_CLAUSES:
            if any(re.search(pattern, text, flags=re.IGNORECASE) for pattern in rule.expected_patterns):
                continue

            missing.append(
                MissingClauseInsight(
                    title=rule.title,
                    severity=rule.severity,  # type: ignore[arg-type]
                    explanation=rule.explanation,
                    recommendation=rule.recommendation,
                )
            )

        return missing

    def _locate_excerpt(self, paragraphs: list[str], patterns: tuple[str, ...]) -> str | None:
        for paragraph in paragraphs:
            if any(re.search(pattern, paragraph, flags=re.IGNORECASE) for pattern in patterns):
                candidate = paragraph if len(paragraph) <= 320 else excerpt_around_match(paragraph, patterns[0])
                return candidate
        return None

    def _calculate_risk_score(
        self,
        *,
        risk_clauses: list[ClauseInsight],
        missing_clauses: list[MissingClauseInsight],
        penalties: list[ClauseInsight],
        unilateral_obligations: list[ClauseInsight],
    ) -> int:
        severity_weights = {"low": 6, "medium": 12, "high": 18, "critical": 25}

        score = sum(severity_weights[item.severity] for item in risk_clauses)
        score += sum(severity_weights[item.severity] for item in missing_clauses)
        score += min(len(penalties) * 4, 8)
        score += min(len(unilateral_obligations) * 5, 10)

        if not risk_clauses and not missing_clauses:
            return 8

        return max(0, min(score, 100))

    def _build_summary(
        self,
        *,
        risk_score: int,
        risk_clauses: list[ClauseInsight],
        missing_clauses: list[MissingClauseInsight],
        important_clauses: list[ClauseInsight],
    ) -> str:
        if risk_score >= 75:
            posture = "high-risk"
        elif risk_score >= 45:
            posture = "moderate-risk"
        else:
            posture = "lower-risk"

        risk_titles = ", ".join(item.title.lower() for item in risk_clauses[:3]) or "no major risk clauses"
        missing_titles = ", ".join(item.title.lower() for item in missing_clauses[:2]) or "no major missing clauses"
        important_titles = ", ".join(item.title.lower() for item in important_clauses[:2]) or "few protective clauses"

        return (
            f"This contract currently presents a {posture} posture with a risk score of {risk_score}/100. "
            f"Key detected risk areas include {risk_titles}. "
            f"Structural gaps were identified around {missing_titles}. "
            f"Notable protective clauses include {important_titles}."
        )

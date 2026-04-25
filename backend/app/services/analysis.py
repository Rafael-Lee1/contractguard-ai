import logging
import re
from dataclasses import dataclass

from app.schemas.contracts import AnalysisOutput, ClauseInsight, MissingClauseInsight
from app.utils.text import excerpt_around_match, normalize_whitespace, split_paragraphs

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RuleMatch:
    category: str
    title: str
    severity: str
    weight: int
    patterns: tuple[str, ...]
    explanation: str
    risk_reason: str
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
    STRONG_LEGAL_SEVERITY_PATTERNS = (
        r"liable\s+for\s+all\s+damages",
        r"sole\s+discretion",
        r"without\s+notice",
    )

    RISK_RULES = (
        RuleMatch(
            category="liability",
            title="Unlimited liability exposure",
            severity="critical",
            weight=24,
            patterns=(
                r"unlimited.{0,30}liabilit(?:y|ies)",
                r"without.{0,30}limitation.{0,30}liabilit(?:y|ies)",
                r"liable.{0,40}(?:any|all).{0,40}damages",
                r"liability.{0,30}(?:shall|will|is).{0,30}not.{0,20}(?:limited|capped)",
                r"no.{0,30}(?:cap|limit).{0,30}(?:liability|damages)",
                r"(?:direct|indirect|consequential|special|incidental).{0,60}damages",
            ),
            explanation=(
                "The contract appears to expand liability without a clear cap, which "
                "can create outsized financial exposure."
            ),
            risk_reason=(
                "Uncapped liability can make one party responsible for losses far beyond "
                "the value of the contract, including indirect or unpredictable damages."
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
                r"defend.{0,80}against.{0,40}(?:any|all).{0,30}claims",
                r"(?:assume|bear).{0,50}(?:all|any).{0,40}(?:claims|losses|costs|expenses)",
            ),
            explanation=(
                "The indemnity language may shift third-party claims and defense costs "
                "heavily onto one side."
            ),
            risk_reason=(
                "A broad indemnity can require payment for claims, losses, and defense costs "
                "even when the indemnified party contributed to the problem."
            ),
            recommendation="Limit indemnity scope to specific breaches and carve out indirect damages.",
        ),
        RuleMatch(
            category="penalty",
            title="Penalty or liquidated damages provision",
            severity="high",
            weight=16,
            patterns=(
                r"liquidated.{0,20}damages",
                r"termination.{0,20}fee",
                r"late.{0,20}fee",
                r"penalt(?:y|ies)",
                r"default.{0,40}(?:fee|charge)",
                r"service.{0,20}charge",
                r"(?:daily|monthly|annual).{0,30}(?:fine|penalty|charge)",
            ),
            explanation=(
                "The contract contains a penalty-oriented clause that can materially "
                "increase the commercial downside of breach or delay."
            ),
            risk_reason=(
                "Penalty provisions can impose disproportionate charges that are triggered "
                "automatically and may exceed actual damages."
            ),
            recommendation="Confirm the trigger, cure period, cap, and whether the amount is commercially reasonable.",
        ),
        RuleMatch(
            category="unilateral_obligation",
            title="Unilateral amendment or discretion right",
            severity="high",
            weight=18,
            patterns=(
                r"at (?:its|our|their) sole discretion",
                r"sole discretion",
                r"may.{0,40}(?:modify|amend|revise|update|change|alter).{0,80}(?:at any time|from time to time)",
                r"(?:modify|amend|revise|update|change|alter).{0,80}without.{0,40}(?:notice|consent|approval)",
                r"without.{0,30}(?:prior|advance|written).{0,30}notice",
                r"unilaterally",
                r"binding upon.{0,80}without.{0,40}consent",
                r"(?:we|provider|company|landlord|seller|supplier).{0,30}may.{0,60}(?:determine|decide|withhold|approve).{0,30}(?:in its discretion|at its discretion)",
            ),
            explanation=(
                "One party appears to retain a one-sided right to change obligations "
                "or enforce terms without reciprocal protections."
            ),
            risk_reason=(
                "Unilateral control allows one party to alter key terms or decide compliance "
                "without meaningful consent, notice, or appeal rights."
            ),
            recommendation="Require mutual written consent or defined notice periods for material changes.",
        ),
        RuleMatch(
            category="possession_rights",
            title="Abusive possession or seizure right",
            severity="critical",
            weight=24,
            patterns=(
                r"right to (?:enter|access|inspect|use).{0,100}(?:premises|property|site|facility|location|equipment)",
                r"(?:enter|access|use).{0,80}(?:premises|property|site|facility).{0,80}without.{0,40}(?:notice|consent|approval)",
                r"(?:take|retake|retain|seize|repossess|remove|disable).{0,100}(?:possession|property|goods|equipment|assets|inventory|materials)",
                r"without (?:court order|judicial process|prior notice)",
                r"self[- ]help",
                r"peaceably.{0,40}(?:enter|retake|repossess)",
            ),
            explanation=(
                "The contract may allow one party to access, seize, retain, or repossess "
                "property without ordinary procedural protections."
            ),
            risk_reason=(
                "Self-help possession rights can disrupt operations, create property loss, "
                "and bypass court or notice safeguards that normally protect the counterparty."
            ),
            recommendation=(
                "Require prior written notice, a reasonable cure period, lawful process, "
                "and clear limits on any access or repossession remedy."
            ),
        ),
        RuleMatch(
            category="unfair_penalty",
            title="Unfair penalty or excessive fee",
            severity="high",
            weight=18,
            patterns=(
                r"non[- ]refundable (?:fee|deposit|charge)",
                r"administrative fee",
                r"convenience fee",
                r"early termination fee",
                r"cancellation fee",
                r"processing fee",
                r"restocking fee",
                r"penalt(?:y|ies).{0,80}(?:per day|daily|monthly)",
                r"(?:fee|charge).{0,40}(?:notwithstanding|regardless of).{0,60}(?:actual|incurred) damages",
                r"(?:fee|charge|penalty).{0,80}(?:sole discretion|from time to time)",
            ),
            explanation=(
                "The contract includes fee or penalty language that may be disproportionate "
                "or detached from actual loss."
            ),
            risk_reason=(
                "Excessive or non-refundable fees can punish routine cancellation, delay, "
                "or dispute activity rather than compensating real damages."
            ),
            recommendation=(
                "Tie any fee to documented costs, add a cap, and include notice and cure rights "
                "before charges accrue."
            ),
        ),
        RuleMatch(
            category="foreign_jurisdiction",
            title="Foreign or distant jurisdiction requirement",
            severity="high",
            weight=16,
            patterns=(
                r"governed by the laws of (?!.*(?:United States|USA|U\.S\.|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming))[^.]{2,120}",
                r"(?:exclusive|sole).{0,30}jurisdiction.{0,80}(?:England|Wales|Singapore|Hong Kong|Cayman|British Virgin Islands|BVI|Ireland|Switzerland|Luxembourg|Netherlands|Germany|France|Brazil|Mexico|Canada|India|China|UAE|Dubai)",
                r"venue.{0,40}(?:shall|will|must).{0,40}(?:exclusively )?in.{0,30}(?:England|Wales|Singapore|Hong Kong|Cayman|British Virgin Islands|BVI|Ireland|Switzerland|Luxembourg|Netherlands|Germany|France|Brazil|Mexico|Canada|India|China|UAE|Dubai)",
                r"(?:disputes|claims).{0,80}(?:submitted|brought|filed).{0,80}(?:England|Wales|Singapore|Hong Kong|Cayman|British Virgin Islands|BVI|Ireland|Switzerland|Luxembourg|Netherlands|Germany|France|Brazil|Mexico|Canada|India|China|UAE|Dubai)",
            ),
            explanation=(
                "The contract appears to require governing law, venue, or courts outside "
                "the user's home jurisdiction."
            ),
            risk_reason=(
                "A foreign or distant forum can make enforcement more expensive, slower, "
                "and strategically unfavorable for the local party."
            ),
            recommendation=(
                "Negotiate governing law and venue in the user's country or add a neutral, "
                "mutually convenient dispute forum."
            ),
        ),
        RuleMatch(
            category="waiver_of_rights",
            title="Waiver of legal rights or remedies",
            severity="critical",
            weight=22,
            patterns=(
                r"waive(?:s|r)? (?:any|all|its|their).{0,100}(?:rights|claims|defenses|remedies|protections)",
                r"waiver of (?:jury trial|class action|counterclaims|set[- ]?off|statutory rights)",
                r"irrevocably waives",
                r"no right to (?:contest|appeal|object|withhold|set[- ]?off)",
                r"release(?:s)? .* from any and all claims",
                r"(?:final|binding).{0,60}(?:no appeal|not appealable)",
            ),
            explanation=(
                "The contract may require one party to give up important legal rights, "
                "claims, defenses, or remedies."
            ),
            risk_reason=(
                "Broad waivers can prevent a party from challenging misconduct, joining claims, "
                "using defenses, or seeking ordinary legal remedies."
            ),
            recommendation=(
                "Narrow waivers to specific, informed, and legally permissible rights; preserve "
                "fraud, willful misconduct, statutory, and payment dispute remedies."
            ),
        ),
        RuleMatch(
            category="automatic_charges",
            title="Automatic charges or hidden fees",
            severity="high",
            weight=18,
            patterns=(
                r"automatically (?:charge|debit|bill|renew)",
                r"(?:charge|debit|bill).{0,80}automatically",
                r"auto[- ]renew",
                r"automatic renewal",
                r"recurring (?:fee|charge|payment)",
                r"without further (?:notice|authorization|consent|approval)",
                r"(?:fees|charges).{0,80}(?:may apply|as determined by|from time to time)",
                r"additional (?:fees|charges).{0,80}(?:not listed|not disclosed|at our discretion)",
                r"(?:credit card|bank account|payment method).{0,80}(?:on file|automatically)",
            ),
            explanation=(
                "The contract may allow recurring, automatic, or discretionary charges that "
                "are not clearly disclosed upfront."
            ),
            risk_reason=(
                "Automatic or hidden charges can create unexpected payment obligations and make "
                "it difficult to dispute or stop billing."
            ),
            recommendation=(
                "Require clear fee schedules, affirmative renewal consent, advance notice of new "
                "charges, and easy cancellation or dispute rights."
            ),
        ),
        RuleMatch(
            category="termination",
            title="Immediate termination trigger",
            severity="medium",
            weight=12,
            patterns=(
                r"(?:terminate|cancel|suspend).{0,40}immediately",
                r"(?:terminate|cancel|suspend).{0,80}(?:at any time|for convenience|without cause)",
                r"without cause.{0,40}(?:upon|with).{0,30}notice",
                r"(?:no|without).{0,30}(?:cure period|opportunity to cure|right to cure)",
                r"(?:services|access|account).{0,50}(?:suspended|disabled|terminated).{0,50}(?:immediately|without notice)",
            ),
            explanation=(
                "The termination language can create continuity risk if one party can "
                "exit on short notice or without meaningful cure rights."
            ),
            risk_reason=(
                "Immediate termination can interrupt services, accelerate obligations, or cause "
                "commercial disruption before the affected party has a chance to cure."
            ),
            recommendation="Add a cure period and minimum notice requirement for non-emergency termination.",
        ),
        RuleMatch(
            category="assignment",
            title="Broad assignment right",
            severity="medium",
            weight=10,
            patterns=(
                r"may.{0,40}assign.{0,80}without.{0,40}consent",
                r"(?:transfer|delegate).{0,80}without.{0,40}consent",
                r"assignment.{0,80}(?:no consent|required consent shall not be required)",
            ),
            explanation=(
                "The contract may allow assignment to an affiliate or third party "
                "without approval, which can change counterparty risk."
            ),
            risk_reason=(
                "Assignment without consent can move obligations to an unknown or less reliable "
                "counterparty while leaving the original party exposed."
            ),
            recommendation="Condition assignment on written consent except for narrow internal reorganizations.",
        ),
        RuleMatch(
            category="payment",
            title="Accelerated payment or setoff exposure",
            severity="medium",
            weight=10,
            patterns=(
                r"all amounts.{0,40}(?:become|are).{0,40}immediately due",
                r"right of set[- ]?off",
                r"interest.{0,50}per month",
                r"accelerat(?:e|ion).{0,80}(?:payment|amounts|balance|obligations)",
                r"(?:payment|invoice).{0,80}(?:due immediately|immediately payable)",
                r"withhold.{0,60}(?:payment|amounts).{0,60}(?:sole discretion|without notice)",
            ),
            explanation=(
                "The payment clause may accelerate obligations or permit setoff in a way "
                "that affects cash flow."
            ),
            risk_reason=(
                "Acceleration and unilateral setoff can force immediate payment or deductions "
                "before the amount is verified or disputed."
            ),
            recommendation="Define clear invoice disputes, cure rights, and commercially reasonable interest limits.",
        ),
    )

    FALLBACK_RISK_RULES = (
        RuleMatch(
            category="liability",
            title="Potential liability exposure",
            severity="high",
            weight=16,
            patterns=(r"liability", r"damages", r"losses", r"responsible", r"obligations"),
            explanation="The contract language suggests possible liability or damages exposure.",
            risk_reason="Liability language can create financial exposure if caps, exclusions, or carve-outs are unclear.",
            recommendation="Review liability caps, exclusions, indemnity overlap, and damages carve-outs.",
        ),
        RuleMatch(
            category="termination",
            title="Potential termination or suspension risk",
            severity="medium",
            weight=12,
            patterns=(r"terminate", r"termination", r"cancel", r"suspend", r"expire", r"default"),
            explanation="The contract language suggests possible termination, suspension, or default consequences.",
            risk_reason="Termination and suspension rights can disrupt service or trigger payment obligations.",
            recommendation="Confirm notice, cure periods, refund rights, and post-termination obligations.",
        ),
        RuleMatch(
            category="payment",
            title="Potential payment or fee risk",
            severity="medium",
            weight=12,
            patterns=(r"payment", r"fee", r"charge", r"invoice", r"interest", r"deposit", r"costs"),
            explanation="The contract language suggests possible payment, fee, or cost exposure.",
            risk_reason="Payment terms can create unexpected charges, interest, acceleration, or dispute leverage.",
            recommendation="Confirm all fees are disclosed, capped, disputed amounts can be withheld, and charges require notice.",
        ),
        RuleMatch(
            category="obligations",
            title="Potential one-sided obligation",
            severity="medium",
            weight=12,
            patterns=(r"shall", r"must", r"required", r"obligation", r"responsible", r"comply"),
            explanation="The contract language suggests operational obligations that may be one-sided or broad.",
            risk_reason="Broad obligations can shift operational burden without matching rights or protections.",
            recommendation="Clarify scope, add mutuality where appropriate, and include reasonable exceptions.",
        ),
        RuleMatch(
            category="rights_control",
            title="Potential unilateral control right",
            severity="high",
            weight=16,
            patterns=(r"discretion", r"right", r"access", r"enter", r"use premises", r"consent", r"approval"),
            explanation="The contract language suggests one party may hold broad control or access rights.",
            risk_reason="Unilateral control rights can let one party make decisions or access property without balanced safeguards.",
            recommendation="Require objective standards, prior notice, written consent, and reasonable limits.",
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
            risk_reason="",
            recommendation="Verify the survival period and permitted disclosure carve-outs.",
        ),
        RuleMatch(
            category="governing_law",
            title="Governing law clause present",
            severity="low",
            weight=0,
            patterns=(r"governed by the laws of", r"governing law"),
            explanation="The contract identifies the governing law framework.",
            risk_reason="",
            recommendation="Confirm the selected jurisdiction aligns with enforcement strategy.",
        ),
        RuleMatch(
            category="dispute_resolution",
            title="Dispute resolution clause present",
            severity="low",
            weight=0,
            patterns=(r"arbitration", r"dispute resolution", r"venue for any dispute"),
            explanation="The contract defines how disputes will be handled.",
            risk_reason="",
            recommendation="Review venue, arbitration rules, and emergency relief rights.",
        ),
        RuleMatch(
            category="limitation_of_liability",
            title="Liability cap clause present",
            severity="low",
            weight=0,
            patterns=(r"limitation of liability", r"aggregate liability shall not exceed"),
            explanation="The contract appears to include some liability-limiting language.",
            risk_reason="",
            recommendation="Check carve-outs so the cap is not rendered ineffective.",
        ),
        RuleMatch(
            category="force_majeure",
            title="Force majeure clause present",
            severity="low",
            weight=0,
            patterns=(r"force majeure", r"events beyond (?:its|their) reasonable control"),
            explanation="The contract addresses extraordinary events and performance interruptions.",
            risk_reason="",
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
        normalized_text = self._normalize_contract_text(contract_text)
        paragraphs = split_paragraphs(normalized_text)
        fallback_limit = 5 if len(normalized_text) > 3000 else 3

        risk_clauses = self._detect_matches(paragraphs, self.RISK_RULES)
        important_clauses = self._detect_matches(paragraphs, self.IMPORTANT_CLAUSE_RULES)
        missing_clauses = self._detect_missing_clauses(normalized_text)
        if not risk_clauses:
            logger.info(
                "risk_clause_fallback_triggered",
                extra={
                    "reason": "no_regex_matches",
                    "paragraph_count": len(paragraphs),
                },
            )
            risk_clauses = self._fallback_potential_risks(paragraphs, limit=fallback_limit)

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
        if risk_score >= 60 and not risk_clauses:
            logger.info(
                "risk_clause_fallback_triggered",
                extra={
                    "reason": "high_score_without_risk_clauses",
                    "risk_score": risk_score,
                    "paragraph_count": len(paragraphs),
                },
            )
            risk_clauses = self._fallback_potential_risks(paragraphs, limit=1)
            penalties = [clause for clause in risk_clauses if clause.category in {"penalty", "unfair_penalty"}]
            unilateral_obligations = [
                clause for clause in risk_clauses if clause.category in {"unilateral_obligation", "obligations"}
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
        pattern_match_count = 0

        for rule in rules:
            excerpt = self._locate_excerpt(paragraphs, rule.patterns)
            if not excerpt:
                continue
            pattern_match_count += 1

            matches.append(
                ClauseInsight(
                    category=rule.category,
                    title=rule.title,
                    severity=self._severity_for_text(rule.severity, excerpt),  # type: ignore[arg-type]
                    explanation=rule.explanation,
                    risk_reason=rule.risk_reason,
                    excerpt=excerpt,
                    recommendation=rule.recommendation,
                )
            )

        logger.debug(
            "contract_rule_matching_completed",
            extra={
                "rule_count": len(rules),
                "matched_rule_count": pattern_match_count,
                "clause_count": len(matches),
            },
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
            searchable_paragraph = self._normalize_for_matching(paragraph)
            for pattern in patterns:
                if re.search(pattern, searchable_paragraph, flags=re.IGNORECASE):
                    return self._meaningful_excerpt(paragraph, pattern)
        return None

    def _fallback_potential_risks(self, paragraphs: list[str], *, limit: int) -> list[ClauseInsight]:
        preferred_categories = ("liability", "payment", "termination", "obligations")
        strong_duplicate_threshold = 2
        per_category_limit = 2
        scored_candidates: list[tuple[int, int, RuleMatch, str]] = []

        for paragraph_index, paragraph in enumerate(paragraphs):
            searchable_paragraph = self._normalize_for_matching(paragraph)
            if len(searchable_paragraph) < 40:
                continue

            for rule in self.FALLBACK_RISK_RULES:
                score = sum(
                    1
                    for pattern in rule.patterns
                    if re.search(pattern, searchable_paragraph, flags=re.IGNORECASE)
                )
                if score <= 0:
                    continue
                scored_candidates.append((score, -paragraph_index, rule, paragraph))

        scored_candidates.sort(key=lambda item: (item[0], item[2].weight, item[1]), reverse=True)
        selected: list[ClauseInsight] = []
        category_counts: dict[str, int] = {}
        selected_keys: set[tuple[str, str]] = set()

        def append_clause(rule: RuleMatch, paragraph: str) -> None:
            excerpt = self._meaningful_excerpt(paragraph, rule.patterns[0])
            selected_keys.add((rule.category, paragraph))
            selected.append(
                ClauseInsight(
                    category=rule.category,
                    title=rule.title,
                    severity=self._severity_for_text(rule.severity, excerpt),  # type: ignore[arg-type]
                    explanation=rule.explanation,
                    risk_reason=rule.risk_reason,
                    excerpt=excerpt,
                    recommendation=rule.recommendation,
                )
            )

        # Prioritize broad coverage for core risk areas when evidence exists.
        for category in preferred_categories:
            if len(selected) >= limit:
                break
            for _, _, rule, paragraph in scored_candidates:
                if rule.category != category:
                    continue
                if category_counts.get(rule.category, 0) > 0:
                    continue
                if (rule.category, paragraph) in selected_keys:
                    continue
                append_clause(rule, paragraph)
                category_counts[rule.category] = category_counts.get(rule.category, 0) + 1
                break

        # Keep diversity first by selecting one item per unseen category.
        for _, _, rule, paragraph in scored_candidates:
            if len(selected) >= limit:
                break
            if category_counts.get(rule.category, 0) > 0:
                continue
            if (rule.category, paragraph) in selected_keys:
                continue
            append_clause(rule, paragraph)
            category_counts[rule.category] = category_counts.get(rule.category, 0) + 1

        # Allow duplicate categories only when signal strength is clearly strong.
        for score, _, rule, paragraph in scored_candidates:
            if len(selected) >= limit:
                break
            if score < strong_duplicate_threshold:
                continue
            if category_counts.get(rule.category, 0) >= per_category_limit:
                continue
            if (rule.category, paragraph) in selected_keys:
                continue
            append_clause(rule, paragraph)
            category_counts[rule.category] = category_counts.get(rule.category, 0) + 1

        if selected:
            logger.info(
                "risk_clause_fallback_completed",
                extra={
                    "candidate_count": len(scored_candidates),
                    "fallback_clause_count": len(selected),
                },
            )
            return selected

        fallback_excerpt = self._first_meaningful_paragraph(paragraphs)
        if not fallback_excerpt:
            return []

        logger.info(
            "risk_clause_fallback_completed",
            extra={
                "candidate_count": 0,
                "fallback_clause_count": 1,
            },
        )
        return [
            ClauseInsight(
                category="general_contract_risk",
                title="Potential contract risk requiring review",
                severity="medium",
                explanation="The contract has a high overall risk posture but no single explicit regex pattern was isolated.",
                risk_reason=(
                    "A high-risk contract can contain cumulative or subtle risk across obligations, "
                    "payments, remedies, or missing protections even when wording varies from known patterns."
                ),
                excerpt=fallback_excerpt,
                recommendation="Review the contract manually for one-sided obligations, fee exposure, remedies, and missing protections.",
            )
        ]

    @staticmethod
    def _normalize_contract_text(text: str) -> str:
        normalized = normalize_whitespace(text).lower()
        replacements = {
            "\u2018": "'",
            "\u2019": "'",
            "\u201c": '"',
            "\u201d": '"',
            "\u2013": "-",
            "\u2014": "-",
            "\u00a0": " ",
        }
        for source, target in replacements.items():
            normalized = normalized.replace(source, target)
        normalized = re.sub(r"[;:,\u2022]+", ". ", normalized)
        normalized = re.sub(r"[ \t]+", " ", normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)
        normalized = re.sub(r"[ \t]*\.[ \t]*", ". ", normalized)
        return normalized.strip()

    @classmethod
    def _normalize_for_matching(cls, text: str) -> str:
        normalized = cls._normalize_contract_text(text)
        normalized = re.sub(r"[/()\\[\\]{}]", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized)
        return normalized.strip()

    @classmethod
    def _meaningful_excerpt(cls, paragraph: str, pattern: str) -> str:
        normalized_paragraph = normalize_whitespace(paragraph)
        if len(normalized_paragraph) <= 420:
            return normalized_paragraph

        sentences = [
            sentence.strip()
            for sentence in re.split(r"(?<=[.!?])\s+", normalized_paragraph)
            if len(sentence.strip()) >= 30
        ]
        for sentence in sentences:
            if re.search(pattern, cls._normalize_for_matching(sentence), flags=re.IGNORECASE):
                return sentence if len(sentence) <= 420 else excerpt_around_match(sentence, pattern, max_chars=420)

        excerpt = excerpt_around_match(normalized_paragraph, pattern, max_chars=420)
        if len(excerpt.strip()) >= 40:
            return excerpt
        return normalized_paragraph[:420].strip()

    @staticmethod
    def _first_meaningful_paragraph(paragraphs: list[str]) -> str:
        for paragraph in paragraphs:
            normalized = normalize_whitespace(paragraph)
            if len(normalized) >= 40:
                return normalized[:420].strip()
        return normalize_whitespace(" ".join(paragraphs))[:420].strip()

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

    @classmethod
    def _severity_for_text(cls, base_severity: str, text: str) -> str:
        if base_severity == "critical":
            return base_severity

        searchable_text = cls._normalize_for_matching(text)
        if any(
            re.search(pattern, searchable_text, flags=re.IGNORECASE)
            for pattern in cls.STRONG_LEGAL_SEVERITY_PATTERNS
        ):
            return "high"

        return base_severity

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

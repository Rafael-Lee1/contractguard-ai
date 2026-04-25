from app.schemas.contracts import ChatCitation, ChatResponse
from app.utils.text import chunk_text, normalize_whitespace, score_overlap, split_sentences, tokenize


class ContractChatService:
    def answer_question(
        self,
        *,
        contract_id: str,
        question: str,
        contract_text: str,
        analysis: dict | None,
        top_k: int,
    ) -> ChatResponse:
        normalized_question = normalize_whitespace(question)
        query_tokens = tokenize(normalized_question)

        chunks = chunk_text(contract_text)
        ranked_citations = self._rank_chunks(chunks=chunks, query_tokens=query_tokens, top_k=top_k)
        answer = self._compose_answer(
            question=normalized_question,
            citations=ranked_citations,
            analysis=analysis,
        )

        return ChatResponse(
            contract_id=contract_id,
            question=normalized_question,
            answer=answer,
            citations=ranked_citations,
        )

    def _rank_chunks(
        self,
        *,
        chunks: list[str],
        query_tokens: list[str],
        top_k: int,
    ) -> list[ChatCitation]:
        scored_chunks: list[tuple[int, float, str]] = []
        for index, chunk in enumerate(chunks):
            score = score_overlap(query_tokens, chunk)
            if score <= 0:
                continue
            scored_chunks.append((index, score, chunk))

        scored_chunks.sort(key=lambda item: item[1], reverse=True)

        return [
            ChatCitation(
                chunk_index=index,
                score=round(score, 3),
                excerpt=chunk[:600].strip(),
            )
            for index, score, chunk in scored_chunks[:top_k]
        ]

    def _compose_answer(
        self,
        *,
        question: str,
        citations: list[ChatCitation],
        analysis: dict | None,
    ) -> str:
        if analysis and "risk score" in question.lower():
            return (
                "The latest analysis assigned this contract a risk score of "
                f"{analysis.get('risk_score', 'unknown')}/100. "
                f"{analysis.get('summary', '')}"
            ).strip()

        if not citations:
            fallback = "I could not find contract language that directly answers that question."
            if analysis:
                summary = analysis.get("summary")
                if summary:
                    return f"{fallback} The latest analysis summary says: {summary}"
            return fallback

        relevant_sentences: list[str] = []
        query_terms = set(tokenize(question))
        for citation in citations:
            sentences = split_sentences(citation.excerpt)
            prioritized = [
                sentence
                for sentence in sentences
                if any(term in sentence.lower() for term in query_terms)
            ]
            chosen = prioritized or sentences[:1]
            for sentence in chosen:
                if sentence not in relevant_sentences:
                    relevant_sentences.append(sentence)
                if len(relevant_sentences) >= 3:
                    break
            if len(relevant_sentences) >= 3:
                break

        answer = " ".join(relevant_sentences[:3]).strip()
        if analysis:
            related_findings = [
                item["title"]
                for item in analysis.get("risk_clauses", [])
                if any(term in item["title"].lower() for term in query_terms)
            ]
            if related_findings:
                findings = ", ".join(related_findings[:2])
                answer = f"{answer} Related flagged risks include {findings}."

        return answer or "I found relevant contract sections, but they need manual legal interpretation."

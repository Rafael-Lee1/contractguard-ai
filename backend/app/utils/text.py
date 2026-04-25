import re
from collections.abc import Iterable


STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "if",
    "in",
    "into",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "their",
    "this",
    "to",
    "with",
}


def normalize_whitespace(text: str) -> str:
    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def split_paragraphs(text: str) -> list[str]:
    normalized = normalize_whitespace(text)
    return [part.strip() for part in normalized.split("\n\n") if part.strip()]


def split_sentences(text: str) -> list[str]:
    normalized = normalize_whitespace(text)
    return [sentence.strip() for sentence in re.split(r"(?<=[.!?])\s+", normalized) if sentence.strip()]


def tokenize(text: str) -> list[str]:
    return [
        token
        for token in re.findall(r"[a-zA-Z0-9']+", text.lower())
        if token not in STOPWORDS and len(token) > 1
    ]


def chunk_text(text: str, *, chunk_size: int = 220, overlap: int = 40) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    step = max(chunk_size - overlap, 1)
    for start in range(0, len(words), step):
        window = words[start : start + chunk_size]
        if not window:
            continue
        chunks.append(" ".join(window))
        if start + chunk_size >= len(words):
            break
    return chunks


def score_overlap(query_tokens: Iterable[str], text: str) -> float:
    tokens = set(tokenize(text))
    query_token_set = set(query_tokens)
    if not tokens or not query_token_set:
        return 0.0
    shared = query_token_set & tokens
    return len(shared) / max(len(query_token_set), 1)


def excerpt_around_match(text: str, pattern: str, *, max_chars: int = 320) -> str:
    match = re.search(pattern, text, flags=re.IGNORECASE)
    if not match:
        return text[:max_chars].strip()

    start = max(match.start() - max_chars // 2, 0)
    end = min(match.end() + max_chars // 2, len(text))
    excerpt = text[start:end].strip()
    if start > 0:
        excerpt = f"...{excerpt}"
    if end < len(text):
        excerpt = f"{excerpt}..."
    return excerpt

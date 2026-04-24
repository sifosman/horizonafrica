import re
import os
import numpy as np
from openai import OpenAI

CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_EMBEDDING_MODEL = os.getenv("OPENROUTER_EMBEDDING_MODEL", "openai/text-embedding-3-small")
OPENROUTER_EMBEDDING_DIMENSIONS = int(os.getenv("OPENROUTER_EMBEDDING_DIMENSIONS", "768"))
OPENROUTER_APP_NAME = os.getenv("OPENROUTER_APP_NAME", "sa-aesthetics-bot")
OPENROUTER_APP_URL = os.getenv("OPENROUTER_APP_URL", "http://localhost:8000")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list:
    sentences = re.split(r'(?<=[.!?])\s+', text)
    chunks = []
    current_chunk = []
    current_len = 0

    for sentence in sentences:
        sentence_len = len(sentence)
        if current_len + sentence_len > chunk_size and current_chunk:
            chunks.append(" ".join(current_chunk))
            overlap_sentences = current_chunk[-overlap:] if len(current_chunk) > overlap else current_chunk
            current_chunk = overlap_sentences + [sentence]
            current_len = sum(len(s) for s in current_chunk)
        else:
            current_chunk.append(sentence)
            current_len += sentence_len

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks


def embed_text(text: str) -> list:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is required for embeddings")

    client = OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
    )
    request_kwargs = {
        "model": OPENROUTER_EMBEDDING_MODEL,
        "input": text,
        "extra_headers": {
            "HTTP-Referer": OPENROUTER_APP_URL,
            "X-Title": OPENROUTER_APP_NAME,
        },
    }

    if OPENROUTER_EMBEDDING_DIMENSIONS > 0:
        request_kwargs["dimensions"] = OPENROUTER_EMBEDDING_DIMENSIONS

    response = client.embeddings.create(**request_kwargs)
    embedding = response.data[0].embedding
    vec = np.array(embedding, dtype=np.float32)
    vec = vec / np.linalg.norm(vec)
    return vec.tolist()


def embed_chunks(chunks: list) -> list:
    return [embed_text(chunk) for chunk in chunks]


def extract_pdf_text(content: bytes) -> str:
    try:
        from pypdf import PdfReader
        from io import BytesIO
        reader = PdfReader(BytesIO(content))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def extract_docx_text(content: bytes) -> str:
    try:
        from docx import Document
        from io import BytesIO
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        return f"[DOCX extraction error: {e}]"


def process_document(content: bytes, filename: str, mime_type: str) -> str:
    if mime_type == "application/pdf" or filename.endswith(".pdf"):
        return extract_pdf_text(content)
    elif mime_type in ("application/vnd.openxmlformats-officedocument.wordprocessingml.document",) or filename.endswith(".docx"):
        return extract_docx_text(content)
    else:
        try:
            return content.decode("utf-8")
        except UnicodeDecodeError:
            return content.decode("latin-1")

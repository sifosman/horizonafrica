import os
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from rag_pipeline import chunk_text, embed_chunks, embed_text, process_document

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://fohutiwjeizctiuquqtf.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_CHAT_MODEL = os.getenv("OPENROUTER_CHAT_MODEL", "moonshotai/kimi-k2.5")
OPENROUTER_APP_NAME = os.getenv("OPENROUTER_APP_NAME", "sa-aesthetics-bot")
OPENROUTER_APP_URL = os.getenv("OPENROUTER_APP_URL", "http://localhost:8000")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="SA Aesthetics Bot API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TextEntryPayload(BaseModel):
    tenant_id: str
    document_id: str
    title: str
    document_type: str = "general"
    content: str


class DemoSeedPayload(BaseModel):
    clinic_name: str = "Demo Aesthetics Clinic"
    slug: str = "demo-aesthetics-clinic"
    whatsapp_number: str = "+27110000000"
    title: str = "Botox Pricing FAQ"
    document_type: str = "pricing"
    content: str = (
        "Botox consultations at Demo Aesthetics Clinic start from R450. "
        "Treatment pricing usually ranges from R950 to R3500 depending on the area treated. "
        "We recommend an in-person consultation before confirming final pricing."
    )


class RagContextPayload(BaseModel):
    tenant_id: str
    query: str
    top_k: int = 3


class AssistantReplyPayload(BaseModel):
    tenant_id: str
    message_body: str
    patient_name: str | None = None
    consent_given: bool = False
    top_k: int = 3


class LeadUpsertPayload(BaseModel):
    tenant_id: str
    phone_number: str
    patient_id: str | None = None
    source: str = "whatsapp_inbound"
    lead_score: str = "cold"
    status: str = "new"
    interest_service: str | None = None
    budget_indication: str = "unknown"
    notes: str | None = None

def persist_chunks(
    *,
    tenant_id: str,
    document_id: str,
    source_type: str,
    source_title: str,
    text: str,
    metadata: dict,
):
    chunks = chunk_text(text)
    embeddings = embed_chunks(chunks)

    chunk_records = []
    for i, (chunk_text_content, embedding) in enumerate(zip(chunks, embeddings)):
        chunk_id = str(uuid.uuid4())
        chunk_records.append({
            "id": chunk_id,
            "tenant_id": tenant_id,
            "document_id": document_id,
            "source_type": source_type,
            "source_title": source_title,
            "content": chunk_text_content,
            "chunk_index": i,
            "embedding": embedding,
            "metadata": metadata,
        })

    if chunk_records:
        for chunk in chunk_records:
            supabase.table("knowledge_base_chunks").insert(chunk).execute()

    supabase.table("knowledge_base_documents").update({
        "processing_status": "completed",
        "chunk_count": len(chunk_records),
        "document_type": source_type,
    }).eq("id", document_id).execute()

    return len(chunk_records)


def get_openrouter_client() -> OpenAI:
    if not OPENROUTER_API_KEY:
        raise RuntimeError("OPENROUTER_API_KEY is required for chat completions")

    return OpenAI(
        api_key=OPENROUTER_API_KEY,
        base_url=OPENROUTER_BASE_URL,
    )


def fetch_rag_matches(tenant_id: str, query: str, top_k: int = 3):
    query_embedding = embed_text(query)
    result = supabase.rpc("match_kb_chunks", {
        "query_embedding": query_embedding,
        "match_threshold": 0.5,
        "match_count": top_k,
        "tenant_filter": tenant_id,
    }).execute()
    return result.data or []


def build_rag_context(matches: list[dict]) -> str:
    if not matches:
        return "No clinic knowledge base context was found."

    context_blocks = []
    for match in matches:
        title = match.get("source_title") or "Untitled"
        content = (match.get("content") or "").strip()
        if content:
            context_blocks.append(f"Title: {title}\nContent: {content}")

    return "\n\n".join(context_blocks) if context_blocks else "No clinic knowledge base context was found."


def generate_assistant_reply(payload: AssistantReplyPayload):
    rag_matches = fetch_rag_matches(payload.tenant_id, payload.message_body, payload.top_k)
    context = build_rag_context(rag_matches)
    client = get_openrouter_client()
    completion = client.chat.completions.create(
        model=OPENROUTER_CHAT_MODEL,
        extra_headers={
            "HTTP-Referer": OPENROUTER_APP_URL,
            "X-Title": OPENROUTER_APP_NAME,
        },
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are the Phase 0 intake assistant for a South African aesthetics WhatsApp bot. "
                    "Classify the user message into one of: faq, book, cancel, reschedule, pricing, medical_aid, human_handoff, lead, media, consent. "
                    "If consent_given is false and the message is not clearly a consent response, guide the user to provide POPIA consent before sensitive data capture. "
                    "Use the clinic knowledge base context when answering factual clinic questions. "
                    "Return JSON only with keys: intent, reply, confidence, consent_required, rag_used."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Patient name: {payload.patient_name or 'Unknown'}\n"
                    f"Consent given: {str(payload.consent_given).lower()}\n"
                    f"Clinic knowledge base context:\n{context}\n\n"
                    f"Patient message: {payload.message_body}"
                ),
            },
        ],
    )
    content = completion.choices[0].message.content
    return {
        "ai_result": content,
        "rag_matches": rag_matches,
        "model": OPENROUTER_CHAT_MODEL,
    }


def upsert_lead_record(payload: LeadUpsertPayload):
    existing = supabase.table("leads").select("id, status").eq("tenant_id", payload.tenant_id).eq("phone_number", payload.phone_number).order("created_at", desc=True).limit(1).execute()
    existing_data = existing.data or []
    current_timestamp = datetime.now(timezone.utc).isoformat()

    lead_payload = {
        "tenant_id": payload.tenant_id,
        "patient_id": payload.patient_id,
        "phone_number": payload.phone_number,
        "source": payload.source,
        "lead_score": payload.lead_score,
        "status": payload.status,
        "interest_service": payload.interest_service,
        "budget_indication": payload.budget_indication,
        "notes": payload.notes,
        "last_contact_at": current_timestamp,
    }

    if existing_data:
        lead_id = existing_data[0]["id"]
        update_payload = {key: value for key, value in lead_payload.items() if value is not None and key != "tenant_id" and key != "phone_number"}
        response = supabase.table("leads").update(update_payload).eq("id", lead_id).execute()
        return response.data[0] if response.data else {"id": lead_id}

    insert_payload = {key: value for key, value in lead_payload.items() if value is not None}
    response = supabase.table("leads").insert(insert_payload).execute()
    return response.data[0]

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/process-document")
async def process_doc(
    tenant_id: str = Form(...),
    document_id: str = Form(...),
    file: UploadFile = File(...),
):
    content = await file.read()
    text = process_document(content, file.filename, file.content_type)
    chunks_created = persist_chunks(
        tenant_id=tenant_id,
        document_id=document_id,
        source_type="general",
        source_title=file.filename,
        text=text,
        metadata={"filename": file.filename, "mime_type": file.content_type},
    )

    return {"chunks_created": chunks_created}


@app.post("/process-text-entry")
async def process_text_entry(payload: TextEntryPayload):
    text_content = payload.content.strip()
    if not text_content:
        raise HTTPException(status_code=400, detail="Content is required")

    chunks_created = persist_chunks(
        tenant_id=payload.tenant_id,
        document_id=payload.document_id,
        source_type=payload.document_type,
        source_title=payload.title,
        text=text_content,
        metadata={"title": payload.title, "entry_type": "inline_text"},
    )

    return {"chunks_created": chunks_created}


@app.post("/seed-demo-rag")
async def seed_demo_rag(payload: DemoSeedPayload):
    tenant_result = supabase.table("tenants").select("id, slug").eq("slug", payload.slug).limit(1).execute()
    tenant_data = tenant_result.data or []

    if tenant_data:
        tenant_id = tenant_data[0]["id"]
    else:
        inserted_tenant = supabase.table("tenants").insert({
            "name": payload.clinic_name,
            "slug": payload.slug,
            "whatsapp_number": payload.whatsapp_number,
        }).execute()
        tenant_id = inserted_tenant.data[0]["id"]

    document_insert = supabase.table("knowledge_base_documents").insert({
        "tenant_id": tenant_id,
        "filename": payload.title,
        "mime_type": "text/plain",
        "document_type": payload.document_type,
        "processing_status": "pending",
    }).execute()
    document_id = document_insert.data[0]["id"]

    chunks_created = persist_chunks(
        tenant_id=tenant_id,
        document_id=document_id,
        source_type=payload.document_type,
        source_title=payload.title,
        text=payload.content.strip(),
        metadata={"title": payload.title, "entry_type": "demo_seed"},
    )

    return {
        "tenant_id": tenant_id,
        "document_id": document_id,
        "chunks_created": chunks_created,
    }

@app.post("/rag-query")
async def rag_query(tenant_id: str = Form(...), query: str = Form(...), top_k: int = 3):
    return {"results": fetch_rag_matches(tenant_id, query, top_k)}


@app.post("/rag-context")
async def rag_context(payload: RagContextPayload):
    matches = fetch_rag_matches(payload.tenant_id, payload.query, payload.top_k)
    return {
        "results": matches,
        "context": build_rag_context(matches),
    }


@app.post("/assistant-reply")
async def assistant_reply(payload: AssistantReplyPayload):
    if not payload.message_body.strip():
        raise HTTPException(status_code=400, detail="Message body is required")

    try:
        return generate_assistant_reply(payload)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/upsert-lead")
async def upsert_lead(payload: LeadUpsertPayload):
    if not payload.phone_number.strip():
        raise HTTPException(status_code=400, detail="Phone number is required")

    try:
        lead = upsert_lead_record(payload)
        return {"lead": lead}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

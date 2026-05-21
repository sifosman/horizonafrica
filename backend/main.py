import os
import uuid
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import requests


def load_env_file() -> None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ.setdefault(key.strip(), value.strip())


load_env_file()

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from rag_pipeline import chunk_text, embed_chunks, embed_text, process_document

import json
import hashlib
import urllib.parse

# PayFast Constants
PAYFAST_MERCHANT_ID = os.getenv("PAYFAST_MERCHANT_ID", "")
PAYFAST_MERCHANT_KEY = os.getenv("PAYFAST_MERCHANT_KEY", "")
PAYFAST_PASSPHRASE = os.getenv("PAYFAST_PASSPHRASE", "")
PAYFAST_SANDBOX = os.getenv("PAYFAST_SANDBOX", "true").lower() == "true"
PAYFAST_NOTIFY_URL = os.getenv("PAYFAST_NOTIFY_URL", "")
PAYFAST_RETURN_URL = os.getenv("PAYFAST_RETURN_URL", "")
PAYFAST_CANCEL_URL = os.getenv("PAYFAST_CANCEL_URL", "")

def generate_payfast_url(payment_id: str, amount: float, item_name: str, patient_name: str = ""):
    """Generates a PayFast payment URL with a secure signature."""
    base_url = "https://sandbox.payfast.co.za/eng/process" if PAYFAST_SANDBOX else "https://www.payfast.co.za/eng/process"
    
    data = {
        "merchant_id": PAYFAST_MERCHANT_ID,
        "merchant_key": PAYFAST_MERCHANT_KEY,
        "return_url": PAYFAST_RETURN_URL,
        "cancel_url": PAYFAST_CANCEL_URL,
        "notify_url": PAYFAST_NOTIFY_URL,
        "name_first": patient_name,
        "m_payment_id": payment_id,
        "amount": f"{amount:.2f}",
        "item_name": item_name,
    }
    
    # Generate signature
    pf_params = []
    for key, value in data.items():
        if value:
            pf_params.append(f"{key}={urllib.parse.quote_plus(str(value).strip())}")
    
    pf_string = "&".join(pf_params)
    if PAYFAST_PASSPHRASE:
        pf_string += f"&passphrase={urllib.parse.quote_plus(PAYFAST_PASSPHRASE.strip())}"
    
    signature = hashlib.md5(pf_string.encode()).hexdigest()
    return f"{base_url}?{pf_string}&signature={signature}"

class AssistantReplyPayload(BaseModel):
    tenant_id: str
    phone_number: str  # Added phone number
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

def _clean_optional_string(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None

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


def parse_ai_result(content: str | None) -> dict:
    if not content:
        return {}

    try:
        parsed = json.loads(content)
        if isinstance(parsed, dict):
            return parsed
    except json.JSONDecodeError:
        pass

    return {"reply": content}


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
                    "You are Zara, a friendly and consultative WhatsApp assistant for OWD Aesthetics clinic. "
                    "Your goal is to engage patients, understand their needs, and guide them toward booking consultations and treatments. "
                    "\n\n"
                    "When patients ask about services (Botox, fillers, peels, etc.): "
                    "- ALWAYS provide specific pricing from the knowledge base "
                    "- Explain benefits and what to expect "
                    "- Be enthusiastic and consultative - you're helping them look and feel their best "
                    "- Guide them toward booking a consultation "
                    "\n\n"
                    "When discussing bookings: "
                    "- Only mention the R500 consultation fee if the user explicitly asks about consultation costs OR when you are providing the final PayFast link to secure the booking. "
                    "- Focus primarily on the service benefits, availability, and booking logistics. "
                    "- NEVER say payment is handled in-clinic - ALWAYS offer upfront PayFast payment to secure the booking when they are ready to finalize. "
                    "\n\n"
                    "Classify the user message into one of: faq, book, cancel, reschedule, pricing, medical_aid, human_handoff, lead, media, consent. "
                    "\n\n"
                    "If the user wants to book, extract: "
                    "- service_name "
                    "- preferred_date (YYYY-MM-DD if mentioned) "
                    "- preferred_time (HH:MM if mentioned) "
                    "\n\n"
                    "If consent_given is false and the message is not clearly a consent response, guide the user to provide POPIA consent before sensitive data capture. "
                    "Use the clinic knowledge base context when answering factual clinic questions. "
                    "Return JSON only with keys: intent, reply, confidence, consent_required, rag_used, booking_details (optional object with service_name, date, time)."
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
    parsed_result = parse_ai_result(content)
    
    reply_text = parsed_result.get("reply") or content
    intent = parsed_result.get("intent")
    booking_details = parsed_result.get("booking_details")
    payment_url = None
    
    # Handle Booking Intent
    if intent == "book" and booking_details:
        service_name = booking_details.get("service_name") or "Consultation"
        
        # Create proposed appointment in Supabase
        # First find the patient ID
        patient_res = supabase.table("patients").select("id").eq("phone_number", payload.phone_number).eq("tenant_id", payload.tenant_id).execute()
        patient_id = patient_res.data[0]["id"] if patient_res.data else None
        
        if patient_id:
            # Generate a new appointment ID
            appt_id = str(uuid.uuid4())
            
            # Create the appointment record
            appt_data = {
                "id": appt_id,
                "tenant_id": payload.tenant_id,
                "patient_id": patient_id,
                "service_name": service_name,
                "status": "proposed",
                "deposit_amount_cents": 50000, # R500 in cents
            }
            
            # Parse scheduled_at if date/time provided
            if booking_details.get("date") and booking_details.get("time"):
                try:
                    dt_str = f"{booking_details['date']}T{booking_details['time']}:00Z"
                    appt_data["scheduled_at"] = dt_str
                except:
                    pass
            
            supabase.table("appointments").insert(appt_data).execute()
            
            # Generate PayFast link
            payment_url = generate_payfast_url(
                payment_id=appt_id,
                amount=500.00,
                item_name=f"Deposit: {service_name}",
                patient_name=payload.patient_name or ""
            )
            
            reply_text += f"\n\nTo secure your booking, please pay the R500 deposit here: {payment_url}"

    return {
        "ai_result": content,
        "content": reply_text,
        "intent": intent,
        "confidence": parsed_result.get("confidence"),
        "consent_required": parsed_result.get("consent_required"),
        "rag_used": parsed_result.get("rag_used"),
        "rag_matches": rag_matches,
        "payment_url": payment_url,
        "model": OPENROUTER_CHAT_MODEL,
    }


def onboard_clinic(payload: OnboardClinicPayload):
    clinic_name = payload.clinic_name.strip()
    slug = payload.slug.strip().lower()
    whatsapp_number = payload.whatsapp_number.strip()
    admin_email = payload.admin_email.strip().lower()
    admin_password = payload.admin_password

    if not clinic_name or not slug or not whatsapp_number or not admin_email or not admin_password:
        raise ValueError("All onboarding fields are required")

    existing_tenant = supabase.table("tenants").select("id, name, slug, whatsapp_number").eq("slug", slug).limit(1).execute()
    tenant = existing_tenant.data[0] if existing_tenant.data else None

    if not tenant:
        tenant_insert = supabase.table("tenants").insert({
            "name": clinic_name,
            "slug": slug,
            "whatsapp_number": whatsapp_number,
        }).execute()
        tenant = tenant_insert.data[0] if tenant_insert.data else None
        if not tenant:
            raise RuntimeError("Failed to create clinic")

    try:
        # Check if public.users record already exists
        existing_staff = supabase.table("users").select("id, tenant_id, email, role").eq("email", admin_email).limit(1).execute()
        created_user = existing_staff.data[0] if existing_staff.data else None

        if not created_user:
            # Try to create auth user (may already exist)
            try:
                auth_response = supabase.auth.admin.create_user({
                    "email": admin_email,
                    "password": admin_password,
                    "email_confirm": True,
                })
            except Exception as auth_exc:
                # User likely already exists in auth; continue
                pass

            # Use direct HTTP POST to bypass Python client permission issues
            headers = {
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
            }
            user_data = {
                "tenant_id": tenant["id"],
                "email": admin_email,
                "role": "admin",
            }
            response = requests.post(
                f"{SUPABASE_URL}/rest/v1/users",
                json=user_data,
                headers=headers
            )
            response.raise_for_status()
            created_user = response.json()

        return {
            "tenant": tenant,
            "user": created_user,
        }
    except Exception:
        if not existing_tenant.data:
            supabase.table("tenants").delete().eq("id", tenant["id"]).execute()
        raise


def upsert_lead_record(payload: LeadUpsertPayload):
    tenant_id = _clean_optional_string(payload.tenant_id)
    patient_id = _clean_optional_string(payload.patient_id)

    if tenant_id is None:
        raise ValueError("tenant_id is required")

    existing = supabase.table("leads").select("id, status").eq("tenant_id", tenant_id).eq("phone_number", payload.phone_number).order("created_at", desc=True).limit(1).execute()
    existing_data = existing.data or []
    current_timestamp = datetime.now(timezone.utc).isoformat()

    lead_payload = {
        "tenant_id": tenant_id,
        "patient_id": patient_id,
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


@app.post("/onboard-clinic")
async def onboard_clinic_endpoint(payload: OnboardClinicPayload):
    try:
        return onboard_clinic(payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

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

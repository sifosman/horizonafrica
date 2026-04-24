# Development Plan: SA Aesthetics WhatsApp Patient Intake & Triage Bot

## 1. Executive Summary

A **multi-tenant SaaS platform** that uses natural language AI (via OpenRouter + RAG) on WhatsApp to solve the documented "hair on fire" problems of South African aesthetic clinics:

1. **After-hours lead loss** — 24/7 instant qualification captures leads that currently go to competitors.
2. **Tyre-kicker overload** — AI handles repetitive pricing/service questions, freeing receptionists to convert serious leads.
3. **No-shows** — automated reminders + Yoco deposit collection at booking.
4. **Slow WhatsApp responses** — instant, structured replies with zero "blue ticks".
5. **Manual data entry** — every conversation auto-syncs to a custom CRM dashboard with full patient profiles.
6. **No formal records** — POPIA-compliant digital trail replaces informal WhatsApp chaos.

**Pricing**: R2,500/month (pilot/early adopter), R3,500/month (standard).

**Tech Stack**: N8n (automation engine), React (CRM dashboard), Supabase (database/auth), Vercel (hosting), OpenRouter (LLM access), Google Calendar + Outlook APIs, Yoco (payments), Evolution API (demo only), Official Meta API via BSP (production).

---

## 2. Hair-on-Fire Problems & How We Solve Them

| # | Problem | Evidence | Our Solution | Impact |
|---|---|---|---|---|
| 1 | **After-hours leads die** | Wazzy: "Inquiries after hours end up with the competition" | Bot qualifies leads 24/7, books preliminary consults into calendar | Capture leads that currently convert to competitors |
| 2 | **Receptionists drown in tyre-kickers** | High volume of price-only inquiries that never book | RAG-powered FAQ + intent detection filters unqualified leads instantly | Receptionists focus only on converting qualified patients |
| 3 | **No-shows cost R34,500/month** | ITWeb: R750/appointment × 10/day = R1,725/day lost | Automated reminders (24h, 4h, 1h) + one-click confirm/reschedule + Yoco deposits | Reduce no-shows from ~5-16% to <2% |
| 4 | **WhatsApp blue-tick frustration** | HelloPeter review: "They blue tick you...send dozens of messages like a damn fool" | Instant structured response to every message; no message goes unanswered | Patient satisfaction + trust |
| 5 | **Manual data entry & lost records** | KZ-N study: "If I delete WhatsApp, all that information is lost" | Every conversation auto-saves to CRM; medical aid details, service history, appointments | Compliant, searchable, permanent records |
| 6 | **Medical aid confusion** | Patients don't understand co-pays, GAP cover, GEMS referrals | Knowledge-base financial triage: plan-specific guidance + shortfall estimates | Reduce admin calls, set expectations before visit |
| 7 | **Lead management chaos** | No lead scoring, no funnel visibility, leads slip through cracks | Auto-qualify every inquiry, score leads (hot/warm/cold), track full funnel in CRM dashboard | Clinic knows exactly which leads to chase and which to ignore |
| 8 | **Aftercare follow-up burden** | Front desk calls each patient post-treatment one by one (Wazzy: "overwhelmed by calling patients one by one") | Automated aftercare messages with detailed care instructions per procedure; patients can send photos/questions back securely | Better outcomes, fewer complaints, photos organized in CRM for practitioner review |

---

## 3. Architecture Overview

### 3.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PATIENT (WhatsApp)                              │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │   WhatsApp Message In       │
                    │  (Evolution API = Demo)     │
                    │  (Meta API + BSP = Prod)    │
                    └─────────────┬─────────────┘
                                  │ Webhook
                    ┌─────────────▼─────────────┐
                    │      N8n Workflow Engine   │
                    │  ┌─────────────────────┐   │
                    │  │  Intent Router      │   │
                    │  │  (NLP/Keyword match)│   │
                    │  └─────────────────────┘   │
                    │           │                 │
                    │  ┌────────▼────────┐        │
                    │  │   RAG Context   │        │
                    │  │  Builder (N8n)  │        │
                    │  │  - Clinic KB    │        │
                    │  │  - Service list │        │
                    │  │  - Pricing      │        │
                    │  │  - Medical aid  │        │
                    │  └────────┬────────┘        │
                    │           │                 │
                    │  ┌────────▼────────┐        │
                    │  │   LLM Call      │        │
                    │  │ (OpenRouter:    │        │
                    │  │  Kimi/Qwen/DS)  │        │
                    │  └────────┬────────┘        │
                    │           │                 │
                    │  ┌────────▼────────┐        │
                    │  │ Response Builder│        │
                    │  │ + Action Router │        │
                    │  │ (Book? Cancel?  │        │
                    │  │  FAQ? Escalate?)│        │
                    │  └────────┬────────┘        │
                    └───────────┼─────────────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
    ┌─────────▼────────┐ ┌────▼─────┐ ┌─────────▼────────┐
    │  Supabase (DB)   │ │  CRM API │ │ Calendar APIs    │
    │  - Patients      │ │ (React)  │ │ - Google Cal     │
    │  - Conversations │ │          │ │ - Outlook        │
    │  - Appointments  │ │          │ │                  │
    │  - Clinics (MT)  │ │          │ │                  │
    └──────────────────┘ └──────────┘ └──────────────────┘
              │                 │                 │
              │         ┌───────▼───────┐        │
              │         │  Yoco Payments │        │
              │         │  (Deposits)    │        │
              │         └───────────────┘        │
              │                                  │
    ┌─────────▼────────┐              ┌──────────▼───────┐
    │  Dashboard (Vercel)            │  Clinic Staff     │
    │  - React + Supabase           │  (WhatsApp reply  │
    │  - Role-based access          │   to confirm)     │
    │  - Analytics, CRM, Settings   │                   │
    └──────────────────┘            └───────────────────┘
```

### 3.2 Multi-Tenancy Model

Each clinic is a **tenant** with isolated data:

| Entity | Tenant Isolation | Notes |
|---|---|---|
| **Patients** | Per clinic (phone number unique per clinic) | Same person at 2 clinics = 2 separate records |
| **Conversations** | Per clinic | Linked to clinic's WhatsApp number |
| **Appointments** | Per clinic | Synced to clinic's calendar |
| **Knowledge Base** | Per clinic | Services, pricing, practitioners, business rules |
| **Staff/Users** | Per clinic | Role-based: Admin, Manager, Receptionist, Practitioner |
| **Settings** | Per clinic | Hours, deposit policy, auto-booking toggle, reminder schedule |

---

## 4. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Orchestration** | N8n (self-hosted or cloud) | Message routing, RAG context building, LLM calls, calendar sync, action execution |
| **LLM** | OpenRouter API | Unified access to Kimi K2.5, Qwen 2.5, DeepSeek V3 — cheap, fast, good for structured output |
| **Database** | Supabase (PostgreSQL + PostgREST) | Multi-tenant data, auth, real-time subscriptions, RLS policies |
| **Frontend (CRM)** | React (Next.js) on Vercel | Dashboard, patient management, analytics, settings |
| **Auth** | Supabase Auth | Clinic staff login, role-based access |
| **WhatsApp (Demo)** | Evolution API | Free demo with personal WhatsApp number |
| **WhatsApp (Prod)** | Official Meta API via BSP | 360Dialog / Twilio / BotSailor with embedded signup |
| **Calendar** | Google Calendar API + Microsoft Graph API | Bi-directional sync for both Google and Outlook |
| **Payments** | Yoco API | Deposit collection at booking |
| **Hosting** | Vercel (frontend), N8n cloud/self-hosted | Serverless React, workflow automation |
| **Vector Store (RAG)** | Supabase pgvector | Store clinic knowledge embeddings for semantic search |

---

## 5. Phased Development Plan

### Phase 0: Foundation (Weeks 1–2)
**Goal**: Architecture, tenant model, and N8n workflow skeleton.

| Task | Deliverable | Effort |
|---|---|---|
| Set up Supabase project with multi-tenant schema | DB with tenants, patients, conversations, appointments, KB tables | 2 days |
| Configure N8n instance + OpenRouter connection | Working N8n workflow that calls OpenRouter with test prompt | 1 day |
| Set up Next.js project on Vercel with Supabase auth | Empty dashboard shell with login/signup, role-based routes | 2 days |
| Build tenant onboarding flow (dashboard) | Clinic can sign up, add their business details, get a tenant ID | 2 days |
| **Create basic knowledge base CRUD in dashboard** | Clinic can add services, pricing, practitioner list, FAQ items | 2 days |
| **Document Upload & RAG Pipeline Setup** | Dashboard: clinic uploads PDFs/Word docs; backend extracts text, chunks, embeds into pgvector per tenant | 2 days |
| Set up Evolution API for demo | N8n webhook receives messages from Evolution API | 1 day |
| Document POPIA consent flow design | Consent message template, data minimization rules | 1 day |

**Phase 0 Success Criteria**: 
- N8n receives a WhatsApp message (via Evolution API) → logs to Supabase → sends a basic AI reply.
- Dashboard allows clinic signup, login, and KB management.
- RAG pipeline retrieves relevant KB docs for a test query.

---

### Phase 1: MVP Demo (Weeks 3–5)
**Goal**: Working demo bot with core conversational flows + calendar integration.

| Task | Deliverable | Effort |
|---|---|---|
| **Intent Router (N8n)** | Classify incoming messages: `faq`, `book`, `cancel`, `reschedule`, `pricing`, `medical_aid`, `human_handoff`, `lead`, `media` | 2 days |
| **RAG Pipeline** | Embed clinic KB docs into pgvector; retrieve top-3 relevant chunks for every query | 2 days |
| **LLM Response Builder** | Structured prompt that injects RAG context + business rules; outputs reply + action intent | 2 days |
| **Conversation State Manager** | Track where the patient is in a flow (booking step 1, step 2, etc.) | 2 days |
| **Google Calendar Integration** | Check availability, create appointments, bi-directional sync (webhook when manually blocked) | 3 days |
| **POPIA Consent Flow** | First interaction: "By continuing, you consent..." → no data stored until consent given | 1 day |
| **Booking Flow** | Capture: service needed → preferred date/time → check calendar → propose slot → confirm → create event | 3 days |
| **FAQ Flow** | General questions answered from KB (services, pricing, hours, location, prep instructions) | 2 days |
| **Medical Aid Guidance Flow** | Ask which medical aid → provide plan-specific guidance (Discovery/GEMS/GAP) from hardcoded knowledge | 2 days |
| **Lead Management V1** | Auto-create lead on first inbound; score hot/warm/cold; track status (new → qualified → booked → converted/lost); staff assignment | 2 days |
| **Dashboard V1 (CRM)** | Patient list, conversation history viewer, appointment list, lead pipeline board, basic analytics (conversations/day, bookings, lead conversion) | 4 days |
| **Human Handoff** | Patient says "I want to speak to a human" → bot stops, notifies staff via WhatsApp, pauses automation | 2 days |
| **Demo Script & Test** | End-to-end test with 3-5 real users, refine responses | 2 days |

**Phase 1 Success Criteria**:
- A real person can message the demo number, get instant AI replies, go through booking flow, and see their appointment in Google Calendar.
- Clinic staff can log into the dashboard and see the conversation + patient record.
- POPIA consent is enforced before any data capture.
- Human handoff works seamlessly.

---

### Phase 2: Production Platform (Weeks 6–10)
**Goal**: Migrate to official Meta API, multi-tenant security, payment integration, advanced features.

| Task | Deliverable | Effort |
|---|---|---|
| **BSP Integration** | Set up 360Dialog or BotSailor; implement embedded signup flow for new clinics | 3 days |
| **Template Message System** | Submit and manage Meta-approved templates (appointment reminders, confirmations) | 2 days |
| **No-Show Prevention System** | 3-layer defense: 24h/4h/1h reminder templates with CONFIRM/RESCHEDULE/CANCEL buttons; at-risk alerts to staff; waitlist auto-backfill | 4 days |
| **Yoco Deposit Integration** | Collect deposit at booking confirmation; payment link via WhatsApp; mark paid in CRM | 3 days |
| **Bi-Directional Calendar Sync** | Google Calendar webhook: if clinic manually blocks a slot, bot immediately knows; Outlook integration | 3 days |
| **Multi-Practitioner Scheduling** | Assign appointments to specific practitioners/rooms with individual availability calendars | 3 days |
| **Advanced CRM Dashboard** | Patient detail view (full profile, medical aid details, conversation history, appointment history), staff role management | 4 days |
| **Analytics & Reporting** | Conversion funnel (inquiry → qualified → booked → showed), no-show rate, response time, revenue saved | 3 days |
| **Auto-Booking Toggle** | Clinic can choose "human-in-the-loop" (bot proposes, staff confirms) or "auto-book" | 2 days |
| **Waiting List / Smart Fill** | When a slot is cancelled, automatically notify waiting list patients via WhatsApp | 2 days |
| **Aftercare Messaging System** | Configurable multi-step aftercare per service (T+0h, T+24h, T+72h, T+7d); detailed care instructions; review request at T+7d | 3 days |
| **Secure Media Transfer** | Patient sends photos/voice notes → bot stores in Supabase Storage (tenant-isolated) → notifies practitioner in dashboard; NO AI diagnosis | 3 days |
| **Lead Management V2** | Full lead pipeline dashboard: score history, source attribution (utm), staff assignment, follow-up reminders, conversion funnel | 2 days |
| **POPIA Compliance Suite** | Data retention policies, patient data export (right to access), deletion (right to be forgotten), audit logs | 3 days |
| **Security Hardening** | RLS policies in Supabase, encrypted fields, API rate limiting, webhook signature validation | 2 days |

**Phase 2 Success Criteria**:
- A new clinic can sign up, click "Connect WhatsApp," go through embedded Meta signup, and have their bot live within 5-10 business days.
- Deposit collection works end-to-end via Yoco.
- Reminders reduce no-shows measurably.
- All data is POPIA-compliant with audit trails.

---

### Phase 3: Scale & Optimize (Weeks 11+)
**Goal**: Acquire first 5-10 paying clinics, iterate based on feedback, build SA-specific moats.

| Task | Deliverable | Effort |
|---|---|---|
| **Pilot Programme Launch** | Offer R2,500/month to 3-5 Gauteng solo practitioners; 14-day free trial | Ongoing |
| **GoodX / RecoMed Partnership Outreach** | Begin formal partnership discussions for direct PMS integration | Ongoing |
| **ROI Calculator Dashboard** | Show each clinic: "You saved X hours, recovered RY from no-shows, converted Z leads this month" | 1 week |
| **Voice Note Support** | Transcribe patient voice notes ( Whisper-style via OpenRouter ) → text for LLM processing | 3 days |
| **Treatment Photo Triage** | Patient sends photo of concern → AI routes to appropriate practitioner with urgency flag | 1 week |
| **A/B Testing Response Prompts** | Test different greeting styles, reminder wording, booking flows for conversion optimization | Ongoing |
| **Referral Program** | Existing clinic gets discount for referring another clinic | 2 days |
| **Zapier / Make Integration** | Allow clinics to connect their own tools without code | 1 week |
| **Mobile App (PWA)** | Clinic staff can manage patients and appointments from phone | 2 weeks |

---

## 6. Detailed Data Model (Supabase)

### Core Tables

**`tenants` (Clinics)**
```
id (UUID, PK)
name (text)
slug (text, unique)
whatsapp_number (text)
meta_waba_id (text) — for production API
meta_phone_number_id (text)
calendar_provider (enum: google, outlook)
calendar_sync_token (text)
business_hours (jsonb) — { "monday": { "open": "08:00", "close": "17:00" } }
deposit_required (boolean)
deposit_amount (integer) — cents
auto_booking_enabled (boolean)
reminder_schedule (jsonb) — { "24h": true, "4h": true, "1h": true }
created_at (timestamp)
```

**`patients` (per clinic)**
```
id (UUID, PK)
tenant_id (UUID, FK → tenants)
phone_number (text) — normalized +27 format
name (text)
email (text)
medical_aid_provider (text) — "Discovery", "GEMS", "Bonitas", etc.
medical_aid_plan (text) — "Classic Comprehensive", etc.
gap_cover (boolean)
consent_given (boolean)
consent_timestamp (timestamp)
conversation_state (jsonb) — current flow state
 tags (text[])
created_at (timestamp)
updated_at (timestamp)
```

**`conversations`**
```
id (UUID, PK)
tenant_id (UUID, FK)
patient_id (UUID, FK)
message_direction (enum: inbound, outbound)
message_type (enum: text, image, voice, template, action)
content (text)
raw_payload (jsonb) — full WhatsApp webhook payload
intent_detected (text) — faq, book, cancel, etc.
rag_chunks_used (uuid[]) — references to KB chunks
llm_model_used (text)
processing_time_ms (integer)
created_at (timestamp)
```

**`appointments`**
```
id (UUID, PK)
tenant_id (UUID, FK)
patient_id (UUID, FK)
practitioner_id (UUID, FK) — nullable
service_name (text)
scheduled_at (timestamp)
duration_minutes (integer)
status (enum: proposed, confirmed, cancelled, completed, no_show)
calendar_event_id (text) — Google/Outlook event ID
deposit_paid (boolean)
deposit_amount_cents (integer)
deposit_payment_id (text) — Yoco payment reference
reminders_sent (jsonb) — { "24h": true, "4h": false, "1h": true }
created_at (timestamp)
```

**`knowledge_base_documents` (Clinic-Uploaded Source Documents)**
```
id (UUID, PK)
tenant_id (UUID, FK)
filename (text) — original uploaded filename
storage_path (text) — Supabase Storage path
mime_type (text) — application/pdf, text/plain, etc.
file_size_bytes (integer)
document_type (enum: services, pricing, policies, aftercare, faq, general)
processing_status (enum: pending, processing, completed, failed)
chunk_count (integer) — number of chunks extracted
uploaded_by_user_id (UUID, FK → users)
created_at (timestamp)
updated_at (timestamp)
```

**`knowledge_base_chunks`**
```
id (UUID, PK)
tenant_id (UUID, FK)
document_id (UUID, FK → knowledge_base_documents) — links back to source file
source_type (enum: service, pricing, faq, policy, medical_aid, aftercare)
source_title (text)
content (text)
chunk_index (integer) — position within document
embedding (vector(768)) — or 1024 depending on model
metadata (jsonb) — page number, section heading, etc.
created_at (timestamp)
```

**`users` (Clinic Staff)**
```
id (UUID, PK)
tenant_id (UUID, FK)
email (text)
role (enum: admin, manager, receptionist, practitioner)
phone_number (text)
active (boolean)
last_login_at (timestamp)
```

**`leads` (Lead Pipeline)**
```
id (UUID, PK)
tenant_id (UUID, FK)
patient_id (UUID, FK) — nullable until patient consents
phone_number (text)
source (enum: whatsapp_inbound, referral, social_media, walk_in)
lead_score (enum: hot, warm, cold)
status (enum: new, qualified, contacted, booked, converted, lost)
interest_service (text)
budget_indication (enum: low, medium, high, unknown)
utm_source (text) — for tracking marketing channel
first_contact_at (timestamp)
last_contact_at (timestamp)
converted_to_patient_at (timestamp)
assigned_to_user_id (UUID, FK → users) — staff member assigned
notes (text)
created_at (timestamp)
```

**`aftercare_messages`**
```
id (UUID, PK)
tenant_id (UUID, FK)
service_name (text) — matches service in KB
message_sequence (integer) — 1, 2, 3... for multi-step aftercare
send_after_hours (integer) — hours after appointment completion
content_source (enum: kb_chunk, custom_text) — where the content comes from
kb_chunk_id (UUID, FK → knowledge_base_chunks) — references clinic's uploaded aftercare doc
content (text) — the aftercare message text (copied from KB chunk or custom)
requires_photo (boolean) — does this step ask patient to send a progress photo?
additional_consent_required (boolean) — for photos/sensitive info
```

**`media_uploads` (Patient Photos/Documents)**
```
id (UUID, PK)
tenant_id (UUID, FK)
patient_id (UUID, FK)
appointment_id (UUID, FK) — nullable
upload_type (enum: photo, voice_note, document)
storage_path (text) — Supabase Storage path
mime_type (text)
file_size_bytes (integer)
context (enum: pre_consultation, post_treatment_followup, general_inquiry)
practitioner_reviewed (boolean)
reviewed_by_user_id (UUID, FK → users)
reviewed_at (timestamp)
practitioner_notes (text) — what the practitioner saw/notes
ai_processed (boolean) — false by design; only human review
consent_given (boolean) — explicit additional consent for health images
uploaded_at (timestamp)
```

---

## 7. N8n Workflow Architecture

### 7.1 Main Orchestration Flow

```
[WhatsApp Webhook] → [Validate Signature] → [Identify Tenant]
                                          ↓
                              [Check: Is this a reply to a template?]
                                          ↓
                              [Load Patient (by phone + tenant)]
                                          ↓
                              [Check Consent? No → Send Consent Request]
                                          ↓
                              [Load Conversation State]
                                          ↓
                              [Intent Classification Node]
                                          ↓
        ┌─────────┬──────────┼──────────┬─────────┬──────────┬─────────┐
        ↓         ↓          ↓          ↓         ↓          ↓         ↓
     [FAQ]    [BOOK]    [CANCEL]  [MEDICAL]  [HUMAN]   [MEDIA]   [LEAD]
        ↓         ↓          ↓          ↓         ↓          ↓         ↓
   [RAG Retr] [Booking  [Cancel   [KB Lookup  [Notify  [Secure   [Score
    + LLM]    Flow]     Flow]     + Reply]    Staff]   Upload]   + Track]
        ↓         ↓          ↓          ↓         ↓          ↓         ↓
   [Save Msg] [Save Msg] [Save Msg] [Save Msg] [Save Msg] [Save Msg] [Save Msg]
        ↓         ↓          ↓          ↓         ↓          ↓         ↓
   [Send Reply] ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### 7.1a Lead Management Flow

Every first-time inbound message (unknown phone number) triggers lead creation:

```
[New Inbound Message] → [Lead exists?] → [No] → [Create Lead Record]
                              ↓
                    [Intent Classification]
                              ↓
              [Is this a price/service inquiry?]
                              ↓
          [Yes] → [Lead Score = Warm/Cold based on intent clarity]
              ↓
          [Engage with FAQ/Booking Flow]
                              ↓
          [Update Lead: status=qualified, interest_service=X]
                              ↓
          [If booking confirmed] → [Update Lead: status=booked, patient_id=created]
                              ↓
          [If 48h no response] → [Mark lead status=lost, send re-engagement?]
```

**Lead Scoring Rules (hardcoded in N8n)**:
| Signal | Score Impact | Example |
|---|---|---|
| Asks about specific service + availability | Hot | "When can I book Botox with Dr. Smith?" |
| Asks about pricing only | Warm | "How much is a consultation?" |
| Vague inquiry | Cold | "What do you do?" |
| Books appointment immediately | Hot → Converted | Confirms slot + pays deposit |
| No response after 2 messages | Warm/Cold → Lost | Ghosted after initial reply |

**Dashboard View**: Leads table shows all leads with score, status, last activity, assigned staff. Staff can click "Call Now" or "Send Follow-up" to convert warm leads.

---

### 7.2 Booking Flow Detail

```
[Intent = BOOK] → [Load Available Slots from Calendar API]
                           ↓
              [Ask: Which service?] → [Validate against KB]
                           ↓
              [Ask: Preferred date?] → [Check business hours]
                           ↓
              [Show 3 available slots] → [Soft-lock selected slot (2 min)]
                           ↓
              [Ask: Confirm?] → [If deposit required → Yoco payment link]
                           ↓
              [Create Calendar Event] → [Save Appointment (status=confirmed)]
                           ↓
              [Send Confirmation + Calendar Invite]
```

### 7.3 No-Show Prevention: Reminder & Confirmation Flow

The no-show system is a **3-layer defense** that runs automatically before every appointment:

```
[Appointment Confirmed] → [Schedule Reminder Jobs]
                              ↓
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   [T-24h Trigger]      [T-4h Trigger]       [T-1h Trigger]
        ↓                     ↓                     ↓
   [Check: reminder_sent?] [Check: reminder_sent?] [Check: reminder_sent?]
        ↓                     ↓                     ↓
   [Send Template Msg]   [Send Template Msg]    [Send Template Msg]
        ↓                     ↓                     ↓
   [Buttons: CONFIRM /  [Buttons: CONFIRM /   [Buttons: CONFIRM /
    RESCHEDULE / CANCEL]   RESCHEDULE / CANCEL]  RESCHEDULE / CANCEL]
        ↓                     ↓                     ↓
   [Wait for reply]      [Wait for reply]      [Wait for reply]
        ↓                     ↓                     ↓
   [No reply in 2h]     [No reply in 1h]      [No reply in 30min]
        ↓                     ↓                     ↓
   [Mark: at_risk]      [Mark: high_risk]     [Mark: likely_no_show]
        ↓                     ↓                     ↓
   [Notify clinic staff] [Notify clinic staff]  [Notify clinic staff + offer slot to waitlist]
```

**Reminder Message Template (Meta-Approved)**:
> "Hi [Name], this is a friendly reminder about your [Service] appointment with [Practitioner] on [Date] at [Time] at [Clinic Name].
>
> Please confirm your attendance:
> ✅ Confirm — I'm coming
> 🔄 Reschedule — I need a different time
> ❌ Cancel — I can't make it"

**Patient Reply Handling**:
| Reply | Bot Action | Calendar Action | Lead/CRM Update |
|---|---|---|---|
| "Confirm" / ✅ | "Great, see you at [Time]!" | Event stays confirmed | Appointment status = confirmed |
| "Reschedule" / 🔄 | "No problem. Here are 3 alternative slots..." | Cancel old event; offer new slots | Status = rescheduled; lead status updated |
| "Cancel" / ❌ | "Sorry to hear that. Your appointment has been cancelled. Would you like to rebook?" | Cancel event; open slot | Status = cancelled; reason captured if given |
| No reply (24h) | (silent) | Event stays; staff alerted via dashboard + WhatsApp | Status = at_risk |
| No reply (1h) | (silent) | Event stays; HIGH priority alert to staff | Status = likely_no_show |

**Waitlist Backfill** (if slot opens due to cancellation/reschedule):
```
[Slot Freed] → [Query waitlist for same service/practitioner/date]
              ↓
      [Sort by: requested_date proximity, then registration_time]
              ↓
      [Send WhatsApp to top 3 waitlist patients]
              ↓
      ["A slot has opened for [Service] on [Date] at [Time]. Reply BOOK to claim it."]
              ↓
      [First to reply BOOK → auto-book; notify others "Sorry, this slot was claimed"]
```

---

### 7.4 Aftercare & Secure Media Transfer Flow

After every `completed` appointment, the aftercare sequence triggers automatically based on the service performed.

```
[Appointment Marked: completed]
                              ↓
              [Query aftercare_messages WHERE service_name = X, ORDER BY sequence]
                              ↓
              [Schedule each message: now + send_after_hours]
                              ↓
      [T+0h: Immediate aftercare] → [Send detailed care instructions for [Service]]
                              ↓
      [T+24h: Check-in] → ["How are you feeling? Any concerns? Reply PHOTO if you'd like us to review."]
                              ↓
      [T+72h: Progress check] → ["It's been 3 days. Here's what to expect now... Reply with any questions."]
                              ↓
      [T+7 days: Review request] → ["If you're happy with your experience, please leave us a review: [Google Maps link]"]
```

**Aftercare Message Content Examples** (clinic-configurable per service):
| Service | T+0h Message | T+24h Message | T+72h Message |
|---|---|---|---|
| **Botox** | "Avoid touching the area for 6 hours. No exercise, alcohol, or lying down for 4 hours." | "Any bruising or swelling should be subsiding. Avoid facials and massage for 48 more hours." | "Results typically visible now. If you notice asymmetry or have concerns, reply and we'll arrange a review." |
| **Fillers** | "Ice the area for 10 min every hour today. Sleep on your back. Avoid makeup for 12 hours." | "Swelling and bruising are normal. Arnica cream can help. Avoid extreme temperatures." | "Final results settling in. If lumps or unevenness persist, reply PHOTO for practitioner review." |
| **360 Lipo** | "Wear compression garment 24/7 for first week. Stay hydrated. Walk lightly — no strenuous exercise." | "Drainage and swelling expected. Keep incision sites clean. Report excessive bleeding or fever immediately." | "Swelling peaks around day 3-5. This is normal. Gentle lymphatic massage can help from day 7." |

**Secure Photo/Document Upload Flow** (patient-initiated or aftercare-prompted):

```
[Patient sends photo/voice note/document] → [Check: is this aftercare-related?]
                                              ↓
                              [Yes] → [Check: additional_consent for health images?]
                                              ↓
                              [No consent] → ["To share photos for review, please reply CONSENT PHOTO"]
                                              ↓
                              [Consented] → [Save to Supabase Storage in tenant-isolated bucket]
                                              ↓
                                              [Save media_uploads record: ai_processed = FALSE]
                                              ↓
                                              [Notify assigned practitioner via WhatsApp + Dashboard]
                                              ↓
          [Practitioner Dashboard Notification]:
          "New patient upload from [Name] ([Service], [Date] post-op).
           Review in dashboard: [link]"
                                              ↓
          [Practitioner reviews photo in CRM → adds notes → marks reviewed = TRUE]
                                              ↓
          [Optional: Practitioner clicks "Reply to Patient" → types message → bot sends via WhatsApp]
                                              ↓
          [Patient receives]: "Dr. [Name] has reviewed your photo. [Practitioner's message]"
```

**Critical: No AI Diagnosis on Photos**
- The bot NEVER attempts to analyze, diagnose, or interpret patient photos.
- Photos are stored securely (encrypted at rest in Supabase Storage) and only accessible to the assigned practitioner.
- Bot's only role: acknowledge receipt, confirm it was saved safely, and notify the practitioner.
- Example bot reply to photo: "Thank you for sending that. It has been securely forwarded to your practitioner for review. You will hear back shortly."

---

## 8. Security & POPIA Compliance

### 8.1 Consent-First Design
- **No data stored until consent is given.** First message from unknown number triggers consent request.
- **Consent message**: "By continuing this conversation, you consent to [Clinic Name] processing your personal information via WhatsApp for appointment scheduling and patient care. View our privacy policy: [link]. Reply YES to continue or STOP to opt out."
- **STOP handling**: Immediate data deletion + opt-out flag.

### 8.1a Additional Consent for Health Information (Photos)
- **General consent covers**: name, phone, appointment scheduling, basic service inquiries.
- **Photo/media consent is separate**: Before accepting any patient photo or health-related image, the bot must request explicit additional consent: "To share photos of your treatment area for practitioner review, please reply CONSENT PHOTO. This is optional and separate from appointment scheduling."
- **Storage**: All media stored in tenant-isolated Supabase Storage buckets. Practitioner-only access. No AI processing.
- **Retention**: Media auto-deleted 90 days after practitioner marks reviewed, or 1 year if unreviewed (configurable).

### 8.2 Data Minimization
- Bot only asks for: name, phone, service needed, preferred time, medical aid (optional for pricing guidance).
- No ID numbers, no medical history, no diagnostic data in WhatsApp.
- Health info (photos, symptoms) only handled in "human handoff" mode with explicit additional consent.

### 8.3 Technical Safeguards
- **Supabase RLS**: Every table has tenant-isolated policies; users can only access their own clinic's data.
- **Encryption at rest**: Supabase default.
- **Encryption in transit**: HTTPS for all APIs, webhook signature validation.
- **Audit logs**: All data access and modifications logged in `audit_logs` table.
- **Retention**: Auto-delete conversation content after 5 years (configurable per clinic); patient profile retained for legal obligation.
- **Right of access/deletion**: Dashboard feature for staff to export patient data (CSV) or delete all records.

### 8.4 Cross-Border Data Transfer (POPIA Section 72)
- Supabase can be hosted in `af-south-1` (Johannesburg) region to avoid cross-border transfer issues.
- If using Supabase US/EU region: document binding corporate rules or standard contractual clauses.
- N8n Cloud: confirm data residency or self-host in SA.

---

## 9. Integration Details

### 9.1 WhatsApp APIs

**Demo: Evolution API**
- Endpoint: `POST http://evolution-api:8080/message/sendText/{instance_name}`
- Webhook: Configure Evolution API to POST to N8n webhook URL on message receive.
- Limitation: Only for demo/testing; number can be blocked by Meta.

**Production: Official Meta API via BSP (e.g., 360Dialog)**
- **Embedded Signup**: Clinic clicks button → Meta OAuth → Business verification (1-3 days) → WABA created → Phone number registered.
- **Webhook**: 360Dialog forwards all events to N8n.
- **Template messages**: Pre-approved for reminders/confirmations (required for outbound messages outside 24h window).
- **Costs**: ~$0.005–0.08 per conversation (user-initiated cheaper). BSP may add platform fee.

### 9.2 Google Calendar
- **Read availability**: `events.list` with `timeMin`, `timeMax`, `singleEvents=true`.
- **Create event**: `events.insert` with patient name in summary, service in description.
- **Watch for changes**: `events.watch` to get push notifications when clinic manually edits calendar → update bot availability cache.

### 9.3 Outlook Calendar (Microsoft Graph)
- Same pattern as Google Calendar using `me/events` endpoints.
- OAuth2 flow in dashboard for clinic admin to connect.

### 9.4 Yoco Payments
- **Create payment link**: `POST /checkout/links` with amount, description, redirect URL.
- **Webhook**: Yoco sends `payment.success` → bot marks appointment deposit_paid = true.
- **SA-focused**: Supports EFT, card, Apple Pay, instant EFT.

### 9.5 OpenRouter LLM
- **Models to use**: 
  - `moonshotai/kimi-k2` (fast, cheap, good at following instructions)
  - `qwen/qwen2.5-72b-instruct` (excellent at structured output/JSON)
  - `deepseek/deepseek-chat-v3` (very cheap, good reasoning)
- **Prompt strategy**: System prompt defines bot persona + strict RAG-only rules; user prompt injects RAG context + conversation history; request structured JSON output for action routing. **Critical**: If the answer is NOT found in the provided RAG context, the bot must reply "I'm not sure about that — let me connect you with the clinic team" and trigger human handoff. The LLM must NEVER use its training data to answer clinic-specific questions.
- **Cost estimate**: ~$0.001–0.003 per conversation turn → roughly R0.02–0.06 per message. At 1,000 messages/day across all clinics, ~R60/day.

---

## 10. Key Guardrails (Preventing AI Errors)

Based on the research's "Golden Rule": **Never let the AI write directly to the calendar.**

| Risk | Guardrail |
|---|---|
| AI invents slots | Always `GET /calendar/availability` first; AI only chooses from returned list |
| Double-booking | 2-minute soft lock on selected slot; release if no confirmation |
| Wrong patient data | Returning patient: "Is this still [Name]?" New patient: confirm each field |
| Cancels wrong appointment | Require explicit Booking ID + "Reply CANCEL #APT-123" |
| AI answers from LLM training data (not RAG) | Hard rule: "You may ONLY answer using the provided RAG context below. If the answer is not in the context, say 'I'm not sure about that — let me connect you with the clinic team' and trigger human handoff." |
| Hallucinated pricing | All prices pulled from KB; AI instructed: "If price not in RAG context, say 'I'm not sure about that — let me connect you with the clinic team' and hand off" |
| Hallucinated medical advice | Hard rule: "You are not a medical professional. Never diagnose. Always suggest speaking to the practitioner." |
| AI analyzes/diagnoses patient photos | Hard rule: Bot NEVER opens or interprets patient images. Only acknowledges receipt, stores securely, and notifies practitioner. |
| Accepting health photos without consent | Bot must request explicit CONSENT PHOTO before accepting any image. Refuse storage until consent given. |
| Auto-booking risk | Human-in-the-loop default for first 20 bookings; auto-book is opt-in toggle |

---

## 11. Success Metrics & KPIs

### Per Clinic (Dashboard Shows These)
| Metric | Target | Source |
|---|---|---|
| **Lead Response Time** | < 30 seconds (vs. hours manually) | Bot timestamp vs. inbound timestamp |
| **After-Hours Lead Capture Rate** | > 80% of after-hours inquiries captured | Messages received outside business hours |
| **Booking Conversion Rate** | % of conversations that result in confirmed booking | Appointments / Conversations |
| **Lead Conversion Rate** | % of leads that move from new → booked → showed | Leads converted / total leads |
| **Hot Lead Response Time** | Time from hot lead creation to staff first contact | Dashboard timestamp diff |
| **Lead Pipeline Value** | Estimated revenue in pipeline by lead score | Lead count × avg service value |
| **Aftercare Engagement Rate** | % of patients who respond to aftercare check-ins | Aftercare replies / aftercare messages sent |
| **Media Review Completion** | % of patient uploads reviewed by practitioner within 24h | Reviewed uploads / total uploads |
| **No-Show Rate** | < 2% (vs. 5-16% baseline) | Appointments marked `no_show` |
| **Receptionist Time Saved** | Hours/week on repetitive inquiries | Conversations handled fully by bot |
| **Revenue Recovered** | R value of no-shows prevented + after-hours leads converted | Deposit amounts + consultation fees |

### Platform-Level
| Metric | Target |
|---|---|
| **Clinic Onboarding Time** | < 10 minutes (KB setup) + 5-10 days (Meta approval) |
| **Uptime** | > 99.5% |
| **LLM Cost per Conversation** | < R0.10 |
| **Patient Satisfaction** | > 4.5/5 from post-appointment follow-up |

---

## 12. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Meta rejects business verification or templates | Medium | High | Pre-screen clinic docs; use simple, compliant templates first; have fallback "Connect via Evolution API" for demo |
| 2 | LLM hallucinates pricing or policy | Medium | High | RAG-only pricing; structured output (JSON); guardrails; human-in-the-loop for first 20 bookings |
| 3 | Evolution API number gets blocked (demo) | High (if overused) | Low | Clearly labeled as demo only; transition to Meta API for any real patient traffic |
| 4 | Clinic manually blocks calendar slot after bot offered it | Low | Medium | 2-minute soft lock; bi-directional sync with webhooks; refresh availability every 30 seconds during active booking flow |
| 5 | POPIA complaint or data breach | Low | Very High | Consent-first design; data minimization; SA-hosted Supabase; encryption; audit logs; legal review before launch |
| 6 | Yoco payment fails or is slow | Low | Medium | Fallback: "Pay at clinic" option; staff notified to follow up |
| 7 | Competitor (Wazzy, BizAI) enters SA aggressively | Medium | Medium | SA-specific moat: medical aid knowledge, POPIA-native, local support, flexible pricing, no 3-month lock-in |

---

## 13. Cost Estimates — Tiered by Stage

The original R7,000/month at 10 clinics was inflated in some places (LLM, Supabase) and possibly too low in others (Meta BSP at volume). Here is the realistic breakdown.

### Where I Overshot

| Item | Original Estimate | Reality | Why |
|---|---|---|---|
| **Supabase** | R1,500 | R0–450 | Free tier handles 500MB + 2M edge requests — enough for months. Pro is $25 (~R450). Only need more at 20+ clinics. |
| **OpenRouter LLM** | R2,000 | R200–600 | Kimi/Qwen via OpenRouter are ~$0.15–0.40 per million tokens. At 1,000 conversations/day (4–5 turns each, ~500 tokens/turn), that's ~75M tokens/month. At $0.30/M = **~R400/month**. I had overstated by 5×. |
| **N8n Cloud** | R0–1,500 | R0 | Self-host on a $6/month VPS (or even your existing machine during MVP). Cloud is only needed later for reliability. |
| **Vercel** | R400 | R0 | Free tier supports unlimited Next.js projects with generous bandwidth. Only upgrade if you hit function execution limits at scale. |

### Where I May Have Undershot

| Item | Original | Reality | Why |
|---|---|---|---|
| **360Dialog / Meta BSP** | R2,500 | R1,200–4,500 | Depends entirely on conversation volume. At pilot (3–5 clinics, ~150 conversations/day), it's ~R1,200. At 10 clinics with heavy traffic (~1,000/day), Meta charges ~$0.006 per user-initiated conversation + ~$49 platform fee = ~R4,200. |

### Realistic Monthly Costs by Stage

| Stage | Clinics | Convos/Day | Supabase | N8n | Vercel | OpenRouter LLM | Meta BSP | Misc | **Total** | Revenue | Margin |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| **Phase 0–1 (Demo/MVP)** | 1–2 | 10–30 | R0 (free) | R0 (self-host) | R0 (free) | R10–30 | R0 (Evolution API) | R0 | **~R50** | R0 | N/A |
| **Phase 2 (Pilot)** | 3–5 | 100–200 | R0 (free) | R100 (VPS) | R0 (free) | R100–200 | R1,200–1,800 | R100 | **~R1,500–2,200** | R7,500–12,500 | ~82% |
| **Phase 3 (Early Scale)** | 10 | 500–800 | R450 (Pro) | R300 (VPS) | R0 (free) | R300–500 | R2,500–3,500 | R200 | **~R3,950–4,950** | R25,000 | ~80% |
| **Full Scale** | 50 | 3,000+ | R2,000+ | R800 | R400 | R1,500 | R12,000+ | R500 | **~R17,000+** | R175,000 | ~90% |

**Key insight**: The biggest cost driver is the Meta BSP (360Dialog/Twilio), not the AI. The LLM is surprisingly cheap with cheap models. At pilot stage, you can run this whole thing for under R2,000/month while earning R10,000+.

### Cost Per Clinic (at 10-clinic scale)

- **Meta BSP**: ~R250–350/clinic (depends on patient volume)
- **LLM**: ~R30–50/clinic
- **Infrastructure** (Supabase, hosting): ~R75/clinic
- **Total platform cost per clinic**: ~R350–475/clinic
- **Charging R2,500–3,500/clinic** → you keep ~85% after platform costs, even before Yoco transaction fees.

---

## 14. Immediate Next Steps (This Week)

1. **Set up Supabase project** in `af-south-1` (Johannesburg) region.
2. **Install N8n** (locally or cloud) and connect OpenRouter with a test API key.
3. **Create the multi-tenant schema** in Supabase (tenants, patients, conversations, appointments, KB chunks).
4. **Set up Evolution API** on your local machine or a small VPS; connect to N8n webhook.
5. **Create a simple "echo + classify" N8n flow**: receives WhatsApp message → calls OpenRouter to classify intent → replies with classification.
6. **Create Next.js project** with Supabase auth and a basic tenant onboarding form.

---

## 15. Decision Log

| Date | Decision | Rationale |
|---|---|---|
| Apr 2026 | Evolution API for demo, Meta API for prod | Demo needs zero setup cost; production needs compliance and scale |
| Apr 2026 | Multi-tenant SaaS | Least friction for onboarding new clinics; one backend serves many |
| Apr 2026 | OpenRouter + cheap LLMs (Kimi/Qwen/DeepSeek) | Cost control for MVP; R0.02–0.06 per turn vs. GPT-4 at R0.30+ |
| Apr 2026 | N8n as orchestration engine | Solo builder can visually build workflows; faster iteration than custom code |
| Apr 2026 | Google Calendar + Outlook proxy | Direct PMS APIs (GoodX/RecoMed) are closed; calendar proxy proves value immediately |
| Apr 2026 | Custom CRM dashboard (not HubSpot integration) | Clinics in this market likely don't use HubSpot; we own the experience |
| Apr 2026 | Yoco for payments | SA-native, instant EFT support, lower friction than Stripe for SA patients |
| Apr 2026 | Hardcoded medical aid knowledge (not live APIs) | No public APIs exist for Discovery/GEMS; knowledge-base is viable and defensible |
| Apr 2026 | POPIA-first architecture | Legally non-negotiable in SA; builds trust; competitive advantage vs. global players |


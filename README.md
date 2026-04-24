# SA Aesthetics WhatsApp Bot

Phase 0 (Foundation) build — multi-tenant SaaS platform for South African aesthetic clinics.

## Architecture
- **Frontend**: Next.js 15 + React + Tailwind CSS + Supabase Auth
- **Backend**: FastAPI (Python) — document processing, RAG pipeline
- **Database**: Supabase (PostgreSQL + pgvector)
- **Orchestration**: N8n (self-hosted via Docker)
- **LLM**: OpenRouter API (Kimi K2.5 / Qwen 2.5)
- **WhatsApp (Demo)**: Evolution API
- **WhatsApp (Prod)**: Official Meta API via BSP

## Project Structure
```
frontend/          # Next.js dashboard (CRM, onboarding, KB management)
backend/           # FastAPI services (document chunking, embedding, RAG query)
n8n/               # N8n workflow definitions
docs/              # Documentation (POPIA, architecture)
```

## Phase 0 Success Criteria
- [x] Supabase multi-tenant schema deployed
- [x] Next.js dashboard with login, onboarding, KB CRUD
- [x] N8n Docker compose ready
- [ ] N8n receives WhatsApp webhook → logs to Supabase → sends AI reply
- [ ] RAG pipeline retrieves relevant KB docs for test query

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### N8n
```bash
cd n8n
docker-compose up -d
# Access at http://localhost:5678 (admin/admin123)
```

## Environment Variables
Frontend `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://fohutiwjeizctiuquqtf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
```

Backend:
```
SUPABASE_URL=https://fohutiwjeizctiuquqtf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

## Database Schema
See `Development Plan - SA Aesthetics WhatsApp Bot.md` section 6 for full data model.

Core tables:
- `tenants` — clinics
- `patients` — per-clinic patient records
- `conversations` — message history
- `appointments` — scheduled appointments
- `knowledge_base_documents` — uploaded docs
- `knowledge_base_chunks` — vector-embedded text chunks
- `leads` — lead pipeline
- `users` — clinic staff

## License
Private — Commercial SaaS

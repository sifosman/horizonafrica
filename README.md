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
NEXT_PUBLIC_SUPABASE_URL=https://tchulrhxvsnzzdfibcnq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVscnh4dnNuenpkZmliY25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1MzAzNDcsImV4cCI6MjA5NzEwNjM0N30.y9hVLeI4F8jPtqq8mUvi0n0ljulYRAawx4eseNJ6tTs
```

Backend:
```
SUPABASE_URL=https://tchulrhxvsnzzdfibcnq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVscnh4dnNuenpkZmliY25xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUzMDM0NywiZXhwIjoyMDk3MTA2MzQ3fQ.tmO7SQqAIWhXizdOBUyuBvC9qkVkWz6Ido_5o6SF_xE
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

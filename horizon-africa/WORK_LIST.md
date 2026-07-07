# Horizon Africa — Work List & Progress Tracker

## Completed
- [x] Quote approved (Q-2026-0619-HC-Rev2)
- [x] Absolute Hosting VPS provisioned (102.202.192.36)
- [x] Domain configured: horizonafrica.co.za
- [x] Caddy reverse proxy set up with automatic HTTPS (Let's Encrypt)
- [x] n8n installed and running at https://n8n.horizonafrica.co.za/
- [x] n8n password reset, new owner account created
- [x] n8n API key generated
- [x] Project folder created
- [x] AI system prompt designed (professional sales persona "Layla")
- [x] FAQ knowledge base saved
- [x] Qualification questions & product recommendation engine saved
- [x] Inbound AI Lead Qualification workflow created in n8n (inactive — pending credentials)

## In Progress
- [ ] **Configure remaining n8n environment variables** — Add API keys for Gemini, Meta, Brevo
- [ ] **Set up Gemini API key** — Create Google AI account, get key, add to docker-compose
- [ ] **Set up Brevo account** — Create account, get API key, add to docker-compose

## Phase 1: Foundation & Accounts

### 1.1 n8n Production Setup
- [x] Fix Caddy reverse proxy config — working at https://n8n.horizonafrica.co.za/
- [ ] Change n8n admin password from default
- [ ] Update `N8N_HOST` and `WEBHOOK_URL` in docker-compose to https://n8n.horizonafrica.co.za/
- [x] SSL certificate — Caddy automatic HTTPS (Let's Encrypt) working
- [ ] Configure n8n environment variables for production
- [ ] Set up n8n backup strategy

### 1.2 Supabase Setup
- [x] Create Supabase project (free tier, in client's name)
- [x] Design database schema:
  - `leads` — lead pipeline (name, phone, address, product interest, score, status)
  - `conversations` — WhatsApp message history
  - `broadcast_groups` — Group A/B/C segmentation
  - `broadcast_history` — campaign logs and delivery tracking
  - `broadcast_contacts` — contacts in broadcast groups
  - `staff_alerts` — hot lead alert log
- [x] Set up Row Level Security (RLS) policies
- [x] Get Supabase URL + anon key
- [x] Connect n8n to Supabase (env vars added to docker-compose, container restarted)

### 1.3 Meta WhatsApp Business API
- [ ] Create Meta Business Manager account (in client's name)
- [ ] Create WhatsApp Business Account
- [ ] Add phone number + verify
- [ ] Get API credentials (Phone Number ID, Access Token, Webhook Verify Token)
- [ ] Configure webhook URL in Meta → point to n8n webhook endpoint
- [ ] Complete Meta business verification process
- [ ] Get message template approvals

### 1.4 AI Provider (Gemini 3.1 Flash)
- [ ] Create Google AI / Gemini API account (in client's name)
- [ ] Get API key
- [ ] Build AI knowledge base for 4 product lines (Fibre, LTE, Wireless, Starlink)
- [ ] Configure AI system prompt for lead qualification
- [ ] Set up lead scoring logic (Hot/Warm/Cold)

### 1.5 Brevo Email Integration
- [ ] Create Brevo account (free tier, in client's name)
- [ ] Get API key
- [ ] Configure email template for hot lead alerts
- [ ] Connect n8n to Brevo for automated email alerts

### 1.6 Chatwoot Live Chat
- [ ] Install Chatwoot on VPS (Docker, self-hosted)
- [ ] Configure Chatwoot WhatsApp channel
- [ ] Set up agent dashboard
- [ ] Configure n8n → Chatwoot handover workflow

## Phase 2: n8n Workflow Build

### 2.1 Inbound AI Lead Qualification Workflow
- [ ] WhatsApp Webhook trigger node (receives incoming messages)
- [ ] Message routing logic (new conversation vs. ongoing)
- [ ] AI chatbot node (Gemini) — answers product enquiries
- [ ] Lead data collection flow (name, contact, address, product interest)
- [ ] Lead scoring node (Hot/Warm/Cold based on responses)
- [ ] Google Sheets integration — log all leads
- [ ] Supabase integration — store conversation + lead data
- [ ] Brevo email alert node — notify sales team on hot leads
- [ ] Chatwoot handover node — "speak to a human" option
- [ ] WhatsApp reply node — send AI response back to user
- [ ] 24-hour session window handling
- [ ] Error handling & fallback responses

### 2.2 Broadcast Module Workflow
- [ ] Broadcast web interface (simple web form or n8n UI)
- [ ] Group A/B/C segmentation logic (from Supabase)
- [ ] Template message selection (5 pre-approved templates)
- [ ] Meta template submission & approval workflow
- [ ] Broadcast sending engine (rate-limited, Meta-compliant)
- [ ] Delivery tracking & broadcast history logging
- [ ] Unsubscribe/opt-out handling
- [ ] Daily limit enforcement (250 → 2,000 → 10,000 scaling)

## Phase 3: Testing & Go-Live

- [ ] End-to-end testing of inbound flow (send WhatsApp message → AI reply → lead logged → email alert)
- [ ] Test lead scoring accuracy
- [ ] Test Chatwoot handover
- [ ] Test broadcast module (small group first)
- [ ] Test Google Sheets logging
- [ ] Test Supabase data persistence
- [ ] Test error scenarios (AI failure, API timeout, etc.)
- [ ] Load testing (concurrent messages)
- [ ] Security review (API keys, webhook verification, RLS)
- [ ] Client UAT (User Acceptance Testing)

## Phase 4: Handover & Documentation

- [ ] Workflow documentation (how each n8n workflow works)
- [ ] Configuration overview document
- [ ] Admin access transfer (all accounts to client)
- [ ] 1-hour handover & training session
- [ ] Change n8n password (hand over to client)
- [ ] Change server root password (security)
- [ ] Provide ongoing support details (if taken)

## Dependencies & Blockers
- **Meta verification** can take 24-72 hours — start ASAP
- **Message template approval** takes 24-72 hours
- **New WhatsApp account broadcast limit:** 250/day initially
- **Client needs to provide:** Product information for Fibre/LTE/Wireless/Starlink (pricing, coverage areas, FAQs)
- **Client needs to provide:** Sales team email addresses for Brevo alerts
- **Client needs to provide:** Broadcast group segmentation criteria

## Payment Tracking
- [ ] 50% upfront received (R7,000) — due to commence work
- [ ] 50% on go-live (R7,000) — due when platform goes live
- [ ] Monthly support (R1,500/mo) — optional, starts from go-live

# FX Group — Work List & Progress Tracker

## Completed
- [x] Charging & delivery plan drafted and approved
- [x] Core Platform quote drafted (Q-2026-0715-FXG-CORE)
- [x] Fast-Follow Modules quote drafted (Q-2026-0715-FXG-FF)
- [x] Retainer addendum drafted (RA-2026-0715-FXG)

## Before Sending Quotes — Confirm With Client
- [ ] Botsailor export capability — CSV/API vs. manual extraction (affects Module 0 pricing/effort)
- [ ] Confirm WhatsApp number is already on a Meta-verified WABA (via Botsailor) for a clean migration
- [ ] Rough daily/weekly conversation volume (sizes server tier + AI token cost estimate)
- [ ] Final broadcast segment list beyond carpenters / regular carpenters / homeowners
- [ ] Confirm FX Group's registered company name + primary contact details for the quote documents

## Module 0: Botsailor Data Migration + AI Training (R20,000) — FIRST, before go-live
- [ ] Get Botsailor export access (API key or admin export)
- [ ] Export full conversation history
- [ ] Export subscriber/contact list
- [ ] Confirm/extend existing Supabase schema (from FX Group's previous project) for conversation history + subscribers
- [ ] Clean, de-duplicate, and load data into Supabase
- [ ] Extract FAQ / pricing / objection patterns from historical conversations
- [ ] Build AI knowledge base from extracted patterns
- [ ] Validate AI responses against a sample of real historical questions

## Module 1a: Dedicated Server + Chatwoot Platform + WhatsApp UI (R25,000)
- [ ] Provision dedicated VPS (~4 vCPU/8GB tier) in client's name
- [ ] Install Docker, Chatwoot, n8n, Caddy (reverse proxy + SSL)
- [ ] Configure Chatwoot WhatsApp channel
- [ ] Adapt existing Next.js WhatsApp-style dashboard (from Horizon Africa/SA Aesthetics) to Chatwoot's API as the new frontend
- [ ] Desktop layout pass
- [ ] Mobile-responsive/app layout pass (promised in the pitch deck)
- [ ] Staff walkthrough of new interface
- [ ] Cutover plan from Botsailor (parallel run → full switch)

## Module 1b: AI Sales Engine — Weekday + Weekend (R40,000)
- [ ] Weekday flow: instant AI reply, qualification questions, lead scoring
- [ ] Weekend flow: AI negotiates + generates + sends indicative quote for catalogue-priced items
- [ ] Escalation flow: ready-to-buy/custom leads flagged to staff with full context
- [ ] 24-hour window "always-reply" workaround implemented
- [ ] Lead pipeline stages (New → Contacted → Follow-Up → Won/Lost) wired to Supabase
- [ ] Automatic follow-up reminders for quiet leads
- [ ] End-to-end testing (weekday + weekend scenarios)
- [ ] **Core go-live** — Botsailor fully retired

## Module 2: Staff Performance Reporting (R15,000)
- [ ] Response-time tracking per staff member
- [ ] Resolution-time tracking
- [ ] Volume + conversion tracking per staff member
- [ ] Weekly/monthly report pack (dashboard + exportable summary)

## Module 3: AI Staff-Coaching Module (R22,000)
- [ ] AI review pipeline for staff conversations
- [ ] Scoring model (tone, speed, technique vs. outcome)
- [ ] Per-agent coaching recommendation generation
- [ ] Coaching report delivery format (dashboard and/or monthly PDF)
- [ ] Confirm staff are informed conversations may be reviewed for coaching (POPIA/internal policy)

## Module 4: Broadcast & Segmentation (R9,000)
- [ ] Segment groups set up (carpenters / regular carpenters / homeowners)
- [ ] Broadcast template design + Meta submission
- [ ] Broadcast sending interface
- [ ] Delivery tracking + history log

## Dependencies & Blockers
- **Botsailor export** — format/access unconfirmed; may need manual extraction if no API/CSV export exists
- **Meta verification/migration** — if the number needs re-verification on a new BSP, allow 24-72 hours
- **Client needs to provide:** product/pricing catalogue for AI-generated quotes, sales team contact list, final segment definitions

## Payment Tracking
- [ ] Core Platform — 50% upfront (R42,500)
- [ ] Core Platform — 50% on go-live (R42,500)
- [ ] Fast-Follow Modules — 50% upfront (R23,000)
- [ ] Fast-Follow Modules — 50% on go-live (R23,000)
- [ ] New retainer (R10,500/month) — first month due on core go-live, replacing R5,000/month

# FX Group WhatsApp AI Platform — Project Info

## Client Details
- **Company:** FX Group *(confirm full registered/trading name before sending quotes)*
- **Contact:** *(name to be added)*
- **Phone:** *(to be added)*
- **Email:** *(to be added)*
- **Location:** Benoni, Gauteng — weekly in-person visits

## Provider
- **Company:** OWD Solutions
- **Contact:** Mohamed Osman
- **Phone:** 065 847 5289
- **Email:** mohamed@owdsolutions.co.za

## Engagement History
- 2 prior projects @ R100,000 each
- Botsailor setup @ R20,000
- Current retainer: R5,000/month (excl. subscriptions) — **being replaced, see Retainer Addendum**

## Quote References
- **Core Platform Quote:** Q-2026-0715-FXG-CORE — R85,000 (Modules 0, 1a, 1b)
- **Fast-Follow Modules Quote:** Q-2026-0715-FXG-FF — R46,000 (Modules 2, 3, 4)
- **Retainer Addendum:** RA-2026-0715-FXG — R10,500/month (replaces R5,000/month)
- **Date:** 15 Jul 2026
- **Status:** Draft — pending send to client

## Project Scope (6 Modules, R131,000 total once-off)
1. Botsailor Data Migration + AI Training — R20,000 *(done first, before go-live)*
2. Dedicated Server + Chatwoot Platform + WhatsApp-Desktop/Mobile UI — R25,000
3. AI Sales Engine — Weekday + Weekend (incl. 24-hour window workaround) — R40,000
4. Staff Performance Reporting — R15,000
5. AI Staff-Coaching Module — R22,000
6. Broadcast & Segmentation — R9,000

**Core (launch now):** R85,000 · **Fast-follow (post go-live):** R46,000

## Current Platform (Being Replaced)
- **Inbox/CRM:** Botsailor (multi-agent WhatsApp inbox, ~10 staff)
- **Data to migrate:** Full conversation history + subscriber list
- **Target database:** Existing Supabase project from FX Group's previous project *(project ref to confirm)*

## Server / Hosting (Planned)
- **Provider:** TBD — recommend a South African VPS provider (e.g. Absolute Hosting, same as Horizon Africa) for local latency + ZAR billing
- **Recommended tier:** ~4 vCPU / 8GB RAM (heavier than Horizon Africa's R229 entry tier — this stack runs Chatwoot + AI + 10 concurrent agents)
- **Estimated cost:** R650–900/month, billed directly to FX Group
- **Stack:** Chatwoot (self-hosted) + n8n (AI workflows) + Caddy (reverse proxy/SSL) — same pattern as `../horizon-africa/`

## Third-Party Accounts (To Be Created / Confirmed in Client's Name)
| Service | Purpose | Status |
|---|---|---|
| Dedicated VPS | Chatwoot + n8n hosting | Pending |
| Supabase | Central database (reusing existing project) | Existing — confirm tier |
| AI provider (LLM) | AI sales engine + coaching analysis | Pending |
| Meta WhatsApp Business API | Messaging (likely already live via Botsailor) | To confirm/migrate |
| Chatwoot | Self-hosted inbox | Pending |

## Segments (Broadcast Module)
- Carpenters
- Regular Carpenters
- Homeowners
- *(confirm final list with client)*

## Timeline
- ~4 weeks to core go-live (Modules 0 + 1a + 1b)
- ~8 weeks to full completion (all 6 modules)

## Related Deliverables
- Sales pitch deck: `../weekend-leads-whatsapp-pitch.html`
- Charging plan: `/home/asif/.windsurf/plans/fx-group-charging-plan-f676cc.md`
- This folder: `quote_fxgroup_core_platform_2026-07-15.html`, `quote_fxgroup_fastfollow_modules_2026-07-15.html`, `retainer_addendum_fxgroup_2026-07-15.html`, `WORK_LIST.md`

# POPIA Consent Flow Design

## Overview
All patient data handling complies with South Africa's POPIA (Protection of Personal Information Act, 2013).

## Consent-First Architecture

### 1. First Contact (Unknown Number)
When a patient messages the clinic WhatsApp number for the first time:

**Bot Response:**
> "Welcome to [Clinic Name]. By continuing this conversation, you consent to us processing your personal information (name, phone number, appointment details) via WhatsApp for the purpose of appointment scheduling and patient care. View our privacy policy: [link]. Reply **YES** to continue or **STOP** to opt out."

**Data Handling:**
- **NO data is stored** until explicit consent is given
- Phone number is temporarily held in memory only for the duration of the consent flow
- If patient replies STOP: phone number is added to a blocklist; no further messages sent
- If patient replies YES: consent_given = true, consent_timestamp recorded, patient record created

### 2. Consent Record
Stored in `patients` table:
- `consent_given`: boolean
- `consent_timestamp`: timestamp
- `phone_number`: normalized +27 format

### 3. Additional Consent for Health Photos
Before accepting any patient photo or health-related image:

**Bot Response:**
> "To share photos of your treatment area for practitioner review, please reply **CONSENT PHOTO**. This is optional and separate from appointment scheduling. Photos are stored securely and reviewed only by your practitioner."

Stored in `media_uploads` table:
- `consent_given`: boolean (additional consent flag)

### 4. STOP / Opt-Out Handling
When patient sends "STOP":
1. Immediately mark patient as opted out
2. Delete all conversation content older than retention period
3. Retain minimal record (phone, opt-out date) for legal compliance
4. Bot replies: "You have been opted out. No further messages will be sent. To re-engage, contact the clinic directly."

### 5. Data Minimization
Bot only collects:
- Name
- Phone number
- Service needed
- Preferred appointment time
- Medical aid provider (optional, for pricing guidance only)

Bot NEVER collects:
- ID numbers
- Medical history
- Diagnostic data
- Banking details (deposits via Yoco payment links only)

### 6. Retention Policy
- Conversations: Auto-delete after 5 years (configurable per clinic)
- Patient profiles: Retained for legal obligation periods
- Media uploads: Auto-delete 90 days after practitioner review, or 1 year if unreviewed
- Audit logs: Retained indefinitely for compliance

### 7. Right of Access / Deletion
Dashboard features:
- Staff can export patient data as CSV (right of access)
- Staff can permanently delete all patient records (right to be forgotten)
- All deletions are logged in `audit_logs`

### 8. Cross-Border Transfer
- Supabase project is hosted in eu-west-1 (current setup)
- For full POPIA compliance, consider migrating to af-south-1 (Johannesburg) region
- N8n should be self-hosted in South Africa for production

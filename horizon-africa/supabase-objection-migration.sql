-- Horizon Africa — Objection Handling Module Migration
-- Adds objection tracking and follow-up columns to existing tables
-- Run this in the Supabase SQL Editor or via a migration

-- Add objection_type to conversations table (tracks which objection was detected, null if none)
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS objection_type TEXT;

-- Add follow_up_requested to leads table (boolean flag for follow-up reminders)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS follow_up_requested BOOLEAN DEFAULT FALSE;

-- Add follow_up_date to leads table (date when follow-up should occur, typically current date + 3 days)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS follow_up_date DATE;

-- Add needs_escalation to leads table (boolean flag for human consultant escalation)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS needs_escalation BOOLEAN DEFAULT FALSE;

-- Add follow_up_sent to leads table (tracks whether the automated reminder has been sent)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS follow_up_sent BOOLEAN DEFAULT FALSE;

-- Add follow_up_sent_at to leads table (timestamp of when the reminder was sent)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ;

-- Add offered_package to leads table (the package recommended during the conversation, saved for follow-up)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS offered_package TEXT;

-- Add helpful comment for documentation
COMMENT ON COLUMN conversations.objection_type IS 'Detected objection type: price_too_high, comparing_providers, need_to_think, already_have_fibre, moving. NULL if no objection detected.';
COMMENT ON COLUMN leads.follow_up_requested IS 'TRUE when customer requested a follow-up (e.g. thinking about it, will get back to us).';
COMMENT ON COLUMN leads.follow_up_date IS 'Scheduled follow-up date (current date + 3 days when follow-up requested).';
COMMENT ON COLUMN leads.needs_escalation IS 'TRUE when customer needs human assistance (discount requests, contract negotiations, callbacks, etc.).';
COMMENT ON COLUMN leads.follow_up_sent IS 'TRUE when the automated WhatsApp follow-up reminder has been sent.';
COMMENT ON COLUMN leads.follow_up_sent_at IS 'Timestamp of when the automated follow-up reminder was sent.';
COMMENT ON COLUMN leads.offered_package IS 'Package recommended during conversation (e.g. "50 Mbps at R695/month"), saved for follow-up reminders.';

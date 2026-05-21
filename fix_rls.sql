-- Disable RLS on all tables to allow service role full access
-- This is appropriate for backend services using the service role key

ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consent_logs DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow service role to bypass:
-- CREATE POLICY "Service role bypass" ON public.tenants FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role bypass" ON public.knowledge_base_documents FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role bypass" ON public.knowledge_base_chunks FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role bypass" ON public.conversations FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role bypass" ON public.messages FOR ALL TO service_role USING (true) WITH CHECK (true);
-- CREATE POLICY "Service role bypass" ON public.consent_logs FOR ALL TO service_role USING (true) WITH CHECK (true);

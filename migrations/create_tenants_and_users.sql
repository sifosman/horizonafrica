-- Migration: Create tenants and users tables for team management
-- Run this on your Supabase project (the one matching NEXT_PUBLIC_SUPABASE_URL in .env.local)

-- Create tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT,
  business_hours JSONB,
  deposit_required BOOLEAN DEFAULT false,
  deposit_amount INTEGER,
  auto_booking_enabled BOOLEAN DEFAULT false,
  reminder_schedule JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create users table (links auth.users to tenants with a role)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can only see/modify data for their own tenant
CREATE POLICY "Users can view own tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- Admins can manage users in their tenant
CREATE POLICY "Admins can view team members" ON public.users
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT u.tenant_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert team members" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT u.tenant_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete team members" ON public.users
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT u.tenant_id FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Create a default tenant and link the existing auth user as admin
-- Replace the UUID and email below with your actual auth user ID and email
INSERT INTO public.tenants (name, slug, whatsapp_number)
VALUES ('Horizon Africa', 'horizon-africa', '+27 82 123 4567')
ON CONFLICT (slug) DO NOTHING;

-- Replace 'YOUR-AUTH-USER-ID' with the actual user ID from auth.users
-- You can get this by running: SELECT id, email FROM auth.users;
INSERT INTO public.users (id, tenant_id, email, role)
SELECT 'YOUR-AUTH-USER-ID', t.id, 'your-email@example.com', 'admin'
FROM public.tenants t WHERE t.slug = 'horizon-africa'
ON CONFLICT (id) DO NOTHING;

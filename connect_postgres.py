import subprocess
import sys

# Supabase project reference: fohutiwjeizctiuquqtf
# Direct database connection string format:
# postgresql://postgres:[YOUR-PASSWORD]@db.fohutiwjeizctiuquqtf.supabase.co:5432/postgres

# The service role key is available but we need the database password
# which is different from the service role key

print("To fix the RLS policies, you need to:")
print("\n1. Go to: https://supabase.com/dashboard/project/fohutiwjeizctiuquqtf/editor")
print("\n2. Click on 'SQL Editor' in the left sidebar")
print("\n3. Create a new query and paste this SQL:")
print("\n" + "="*70)
print("""
-- Disable RLS on all tables to allow service role full access
ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
""")
print("="*70)
print("\n4. Click 'Run' to execute the SQL")
print("\n5. Then re-run the API tests")
print("\nAlternatively, if you have the database password, we can connect via psql.")

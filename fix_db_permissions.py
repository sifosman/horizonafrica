from supabase import create_client
import sys

SUPABASE_URL = "https://tchulrhxvsnzzdfibcnq.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVscnh4dnNuenpkZmliY25xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUzMDM0NywiZXhwIjoyMDk3MTA2MzQ3fQ.tmO7SQqAIWhXizdOBUyuBvC9qkVkWz6Ido_5o6SF_xE"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# SQL commands to disable RLS on all tables
sql_commands = [
    "ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE IF EXISTS public.knowledge_base_documents DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE IF EXISTS public.knowledge_base_chunks DISABLE ROW LEVEL SECURITY;",
    "ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;",
]

print("Attempting to disable RLS on tables...")
print("Note: This requires executing SQL via Supabase SQL Editor or direct database access")
print("\nPlease execute the following SQL in Supabase SQL Editor:")
print("=" * 60)
with open('/tmp/fix_rls.sql', 'r') as f:
    print(f.read())
print("=" * 60)

# Try using PostgREST RPC if available
try:
    # Supabase Python client doesn't support direct SQL execution
    # We need to use the Supabase dashboard SQL editor
    print("\nThe Supabase Python client cannot execute DDL statements.")
    print("You must run the SQL above in the Supabase dashboard SQL editor.")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)

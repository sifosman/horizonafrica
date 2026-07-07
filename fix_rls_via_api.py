import urllib.request
import json

SUPABASE_URL = "https://tchulrhxvsnzzdfibcnq.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVscnh4dnNuenpkZmliY25xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUzMDM0NywiZXhwIjoyMDk3MTA2MzQ3fQ.tmO7SQqAIWhXizdOBUyuBvC9qkVkWz6Ido_5o6SF_xE"

# SQL to disable RLS
sql_statements = """
ALTER TABLE IF EXISTS public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.knowledge_base_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
"""

print("SQL to execute in Supabase SQL Editor:")
print("=" * 70)
print(sql_statements)
print("=" * 70)
print("\nInstructions:")
print("1. Go to https://supabase.com/dashboard/project/tchulrhxvsnzzdfibcnq")
print("2. Navigate to SQL Editor")
print("3. Paste and run the SQL above")
print("4. Then re-run the test_api.py script")

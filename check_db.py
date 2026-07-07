from supabase import create_client
import os

SUPABASE_URL = "https://tchulrhxvsnzzdfibcnq.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVscnh4dnNuenpkZmliY25xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTUzMDM0NywiZXhwIjoyMDk3MTA2MzQ3fQ.tmO7SQqAIWhXizdOBUyuBvC9qkVkWz6Ido_5o6SF_xE"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

print("Testing database access...")
try:
    result = supabase.table('tenants').select('*').limit(1).execute()
    print(f"Tenants table query successful: {result}")
except Exception as e:
    print(f"Error accessing tenants table: {e}")

try:
    result = supabase.table('knowledge_base').select('*').limit(1).execute()
    print(f"Knowledge_base table query successful: {result}")
except Exception as e:
    print(f"Error accessing knowledge_base table: {e}")

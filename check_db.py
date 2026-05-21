from supabase import create_client
import os

SUPABASE_URL = "https://fohutiwjeizctiuquqtf.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaHV0aXdqZWl6Y3RpdXF1cXRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2NDA4OSwiZXhwIjoyMDkyMzQwMDg5fQ.zJ_TRNMp6cyOlKWbBEapOl37xc5nnY_03QUipFLmd64"

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

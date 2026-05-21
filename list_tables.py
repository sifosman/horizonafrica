from supabase import create_client

SUPABASE_URL = "https://fohutiwjeizctiuquqtf.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaHV0aXdqZWl6Y3RpdXF1cXRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc2NDA4OSwiZXhwIjoyMDkyMzQwMDg5fQ.zJ_TRNMp6cyOlKWbBEapOl37xc5nnY_03QUipFLmd64"

print("Testing table access...")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Try accessing different tables
tables_to_test = [
    'tenants',
    'knowledge_base_chunks', 
    'conversations',
    'messages',
    'consent_logs'
]

for table in tables_to_test:
    try:
        result = supabase.table(table).select('*').limit(1).execute()
        print(f"✓ {table}: Accessible ({len(result.data)} rows)")
    except Exception as e:
        print(f"✗ {table}: {str(e)[:100]}")

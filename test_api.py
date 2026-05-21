import requests
import json

# Step 24: Seed KB Data
print("=== Step 24: Seed KB Data ===")
seed_data = {
    "clinic_name": "SA Aesthetics Bot Demo",
    "slug": "sa-aesthetics-demo",
    "whatsapp_number": "+27606116359",
    "title": "Botox Pricing FAQ",
    "document_type": "pricing",
    "content": "Botox consultations start from R450. Treatment pricing typically ranges from R950 to R3500 depending on area treated. A consultation is recommended before confirming final pricing."
}
r = requests.post("http://178.105.45.48:8000/seed-demo-rag", json=seed_data)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
seed_response = r.json()
tenant_id = seed_response.get("tenant_id")
print(f"Tenant ID: {tenant_id}")
print()

# Step 25: Test RAG Retrieval
print("=== Step 25: Test RAG Retrieval ===")
rag_data = {
    "tenant_id": tenant_id,
    "query": "How much does Botox cost?",
    "top_k": 3
}
r = requests.post("http://178.105.45.48:8000/rag-context", json=rag_data)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")
print()

# Step 26: Test Assistant Reply
print("=== Step 26: Test Assistant Reply ===")
assistant_data = {
    "tenant_id": tenant_id,
    "message_body": "How much is Botox?",
    "patient_name": "Test User",
    "consent_given": True,
    "top_k": 3
}
r = requests.post("http://178.105.45.48:8000/assistant-reply", json=assistant_data)
print(f"Status: {r.status_code}")
print(f"Response: {r.text}")

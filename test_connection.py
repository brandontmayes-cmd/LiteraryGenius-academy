import os
from supabase import create_client

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ukiftslybaexlikgmodr.supabase.co')
SUPABASE_KEY = os.getenv('sb_secret_P4gSKaFXAXcC68PHg1mm8Q_geVdBjq3')

print(f"Testing connection to Supabase...")
print(f"URL: {SUPABASE_URL}")
print(f"Key starts with: {SUPABASE_KEY[:20]}...")

try:
    print("\nCreating client...")
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✓ Client created")
    
    print("\nTesting query...")
    result = supabase.table('standards').select('*', count='exact').limit(1).execute()
    print(f"✓ Connection successful! Table exists with {result.count} records")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
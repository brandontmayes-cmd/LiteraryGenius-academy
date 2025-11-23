import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_SERVICE_KEY')

def verify_import():
    """Verify the standards were imported correctly."""
    
    print("Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    print("\n" + "="*60)
    print("VERIFICATION REPORT")
    print("="*60)
    
    # Total count
    result = supabase.table('standards').select('*', count='exact').execute()
    total_count = result.count
    print(f"\nTotal standards in database: {total_count}")
    
    # Count by grade
    print("\n" + "-"*60)
    print("Standards by Grade")
    print("-"*60)
    
    for grade in ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']:
        result = supabase.table('standards').select('*', count='exact').eq('grade', grade).eq('subject', 'math').execute()
        count = result.count
        print(f"  Grade {grade:>2}: {count:>4} standards")
    
    # Sample standards from different grades
    print("\n" + "-"*60)
    print("Sample Standards")
    print("-"*60)
    
    sample_grades = ['K', '4', '8']
    for grade in sample_grades:
        result = supabase.table('standards').select('*').eq('grade', grade).eq('subject', 'math').limit(2).execute()
        
        print(f"\nGrade {grade} samples:")
        for std in result.data:
            print(f"  {std['code']}")
            desc = std['description'][:80] + "..." if len(std['description']) > 80 else std['description']
            print(f"  {desc}\n")
    
    # Check for specific known standards
    print("-"*60)
    print("Spot Check: Looking for Known Standards")
    print("-"*60)
    
    known_standards = [
        ('K.CC.A.1', 'K'),
        ('4.OA.A.1', '4'),
        ('8.G.A.5', '8'),
    ]
    
    for code, grade in known_standards:
        result = supabase.table('standards').select('*').eq('code', code).eq('grade', grade).execute()
        
        if result.data and len(result.data) > 0:
            print(f"  ✓ Found {code}")
        else:
            print(f"  ✗ Missing {code}")
    
    # Check for domains
    print("\n" + "-"*60)
    print("Domains Found")
    print("-"*60)
    
    result = supabase.table('standards').select('code').eq('subject', 'math').execute()
    domains = set()
    for std in result.data:
        code = std['code']
        if code and '.' in code:
            parts = code.split('.')
            if len(parts) >= 2:
                domain = f"{parts[0]}.{parts[1]}"
                domains.add(domain)
    
    sorted_domains = sorted(domains)
    print(f"  Total unique domains: {len(sorted_domains)}")
    print(f"  First 10 domains: {', '.join(sorted_domains[:10])}")
    
    print("\n" + "="*60)
    print("Verification Complete!")
    print("="*60 + "\n")

if __name__ == '__main__':
    verify_import()

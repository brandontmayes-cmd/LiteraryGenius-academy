import json
from collections import defaultdict

def analyze_math_standards(filepath: str):
    """Analyze the math standards file and show statistics."""
    
    print("Loading JSON file...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Count standards by grade
    grade_counts = defaultdict(int)
    standards_with_notation = []
    total_standards = 0
    
    # Track domain/cluster structure
    domains = set()
    
    for uri, entry in data.items():
        # Check if it's a Statement (actual standard)
        rdf_type = entry.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', [])
        if rdf_type and len(rdf_type) > 0:
            if rdf_type[0].get('value') == 'http://purl.org/ASN/schema/core/Statement':
                total_standards += 1
                
                # Get notation
                notation = entry.get('http://purl.org/ASN/schema/core/statementNotation', [])
                if notation and len(notation) > 0:
                    code = notation[0].get('value')
                    if code:
                        standards_with_notation.append(code)
                        
                        # Extract domain from code (e.g., 'K.CC' from 'K.CC.A.1')
                        parts = code.split('.')
                        if len(parts) >= 2:
                            domain = f"{parts[0]}.{parts[1]}"
                            domains.add(domain)
                
                # Count by grade
                education_levels = entry.get('http://purl.org/dc/terms/educationLevel', [])
                for level in education_levels:
                    level_uri = level.get('value', '')
                    if '/ASNEducationLevel/K' in level_uri:
                        grade_counts['K'] += 1
                    elif '/ASNEducationLevel/' in level_uri:
                        grade = level_uri.split('/ASNEducationLevel/')[-1]
                        grade_counts[grade] += 1
    
    # Print statistics
    print(f"\n{'='*60}")
    print(f"COMMON CORE MATH STANDARDS ANALYSIS")
    print(f"{'='*60}")
    print(f"\nTotal entries in file: {len(data)}")
    print(f"Total standards (Statement type): {total_standards}")
    print(f"Standards with notation codes: {len(standards_with_notation)}")
    
    print(f"\n{'='*60}")
    print(f"STANDARDS BY GRADE LEVEL")
    print(f"{'='*60}")
    for grade in ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']:
        if grade in grade_counts:
            print(f"  Grade {grade:>2}: {grade_counts[grade]:>4} standards")
    
    print(f"\n{'='*60}")
    print(f"DOMAINS FOUND")
    print(f"{'='*60}")
    sorted_domains = sorted(domains)
    for domain in sorted_domains[:20]:  # Show first 20
        print(f"  {domain}")
    if len(sorted_domains) > 20:
        print(f"  ... and {len(sorted_domains) - 20} more")
    
    print(f"\n{'='*60}")
    print(f"SAMPLE STANDARDS")
    print(f"{'='*60}")
    
    # Show some example standards
    examples = []
    for uri, entry in data.items():
        rdf_type = entry.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', [])
        if rdf_type and len(rdf_type) > 0:
            if rdf_type[0].get('value') == 'http://purl.org/ASN/schema/core/Statement':
                notation = entry.get('http://purl.org/ASN/schema/core/statementNotation', [])
                description = entry.get('http://purl.org/dc/terms/description', [])
                
                if notation and len(notation) > 0 and description and len(description) > 0:
                    code = notation[0].get('value')
                    desc = description[0].get('value')
                    
                    if code and desc:
                        examples.append({'code': code, 'description': desc})
                        
                        if len(examples) >= 5:
                            break
    
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['code']}")
        print(f"   {example['description'][:150]}...")
    
    print(f"\n{'='*60}\n")

if __name__ == '__main__':
    analyze_math_standards('/mnt/user-data/uploads/CC-Math.json')

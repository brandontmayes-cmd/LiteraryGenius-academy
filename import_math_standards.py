import json
import os
from supabase import create_client, Client
from typing import Dict, List, Any

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'YOUR_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'YOUR_SUPABASE_SERVICE_KEY')

def parse_education_level(level_uri: str) -> str:
    """Extract grade level from URI."""
    if '/ASNEducationLevel/K' in level_uri:
        return 'K'
    elif '/ASNEducationLevel/' in level_uri:
        level = level_uri.split('/ASNEducationLevel/')[-1]
        return level
    return None

def extract_value(data: List[Dict], key: str = 'value') -> Any:
    """Extract value from RDF-style array."""
    if not data or len(data) == 0:
        return None
    return data[0].get(key)

def parse_standard(standard_uri: str, standard_data: Dict) -> Dict:
    """Parse a single standard entry into a clean format."""
    
    # Skip if not a Statement type
    rdf_type = extract_value(standard_data.get('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'))
    if rdf_type != 'http://purl.org/ASN/schema/core/Statement':
        return None
    
    # Extract basic information
    notation = extract_value(standard_data.get('http://purl.org/ASN/schema/core/statementNotation'))
    description = extract_value(standard_data.get('http://purl.org/dc/terms/description'))
    comment = extract_value(standard_data.get('http://purl.org/ASN/schema/core/comment'))
    
    # Extract education levels
    education_levels = standard_data.get('http://purl.org/dc/terms/educationLevel', [])
    grades = [parse_education_level(level['value']) for level in education_levels]
    grades = [g for g in grades if g is not None]
    
    # Extract parent/child relationships
    is_child_of = standard_data.get('http://purl.org/gem/qualifiers/isChildOf', [])
    parent_uris = [item['value'] for item in is_child_of]
    
    has_children = standard_data.get('http://purl.org/gem/qualifiers/hasChild', [])
    child_uris = [item['value'] for item in has_children]
    
    # Extract statement label (if exists)
    statement_label = extract_value(standard_data.get('http://purl.org/ASN/schema/core/statementLabel'))
    
    # Extract list ID (if exists)
    list_id = extract_value(standard_data.get('http://purl.org/ASN/schema/core/listID'))
    
    return {
        'uri': standard_uri,
        'notation': notation,
        'description': description,
        'comment': comment,
        'statement_label': statement_label,
        'list_id': list_id,
        'grades': grades,
        'parent_uris': parent_uris,
        'child_uris': child_uris,
        'subject': 'math'
    }

def load_json_file(filepath: str) -> Dict:
    """Load and parse the JSON file."""
    print(f"Loading JSON file from {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} entries from JSON file")
    return data

def parse_all_standards(json_data: Dict) -> List[Dict]:
    """Parse all standards from the JSON data."""
    print("Parsing standards...")
    standards = []
    
    for uri, data in json_data.items():
        parsed = parse_standard(uri, data)
        if parsed:
            standards.append(parsed)
    
    print(f"Parsed {len(standards)} standards")
    return standards

def create_supabase_records(standards: List[Dict]) -> List[Dict]:
    """Convert parsed standards into Supabase-ready records."""
    print("Creating Supabase records...")
    records = []
    
    for std in standards:
        # Combine description and comment
        full_description = std['description'] or ''
        if std['comment']:
            full_description += f"\n\nExample: {std['comment']}"
        
        # Create a record for each grade level this standard applies to
        for grade in std['grades']:
            record = {
                'subject': 'math',
                'grade': grade,
                'code': std['notation'],
                'description': full_description.strip(),
                'statement_label': std['statement_label'],
                'list_id': std['list_id'],
                'uri': std['uri'],
                'parent_uris': std['parent_uris'],
                'child_uris': std['child_uris']
            }
            records.append(record)
    
    print(f"Created {len(records)} records for Supabase")
    return records

def import_to_supabase(records: List[Dict], batch_size: int = 100):
    """Import records to Supabase in batches."""
    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    print(f"Using key that starts with: {SUPABASE_KEY[:20]}...")
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected successfully!")
    except Exception as e:
        print(f"Connection error: {e}")
        return
    
    print(f"Importing {len(records)} records in batches of {batch_size}...")
    
    total_imported = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        
        try:
            response = supabase.table('standards').insert(batch).execute()
            total_imported += len(batch)
            print(f"Imported batch {i // batch_size + 1}: {total_imported}/{len(records)} records")
        except Exception as e:
            print(f"Error importing batch {i // batch_size + 1}: {e}")
            print(f"First record in failed batch: {batch[0]}")
            # Continue with next batch instead of stopping
            continue
    
    print(f"Import complete! Total records imported: {total_imported}")

def main():
    """Main execution function."""
    # File path
    json_file = 'CC-Math.json'
    
    # Load and parse
    json_data = load_json_file(json_file)
    standards = parse_all_standards(json_data)
    
    # Convert to Supabase format
    records = create_supabase_records(standards)
    
    # Display sample records
    print("\n--- Sample Records ---")
    for i, record in enumerate(records[:3]):
        print(f"\nRecord {i + 1}:")
        print(f"  Grade: {record['grade']}")
        print(f"  Code: {record['code']}")
        print(f"  Description: {record['description'][:100]}...")
    
    # Confirm before importing
    print(f"\n\nReady to import {len(records)} records to Supabase.")
    response = input("Proceed with import? (yes/no): ")
    
    if response.lower() == 'yes':
        import_to_supabase(records)
    else:
        print("Import cancelled.")
        
        # Optionally save to JSON file for review
        save_response = input("Save parsed data to JSON file for review? (yes/no): ")
        if save_response.lower() == 'yes':
            output_file = '/mnt/user-data/outputs/parsed_math_standards.json'
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(records, f, indent=2, ensure_ascii=False)
            print(f"Saved parsed data to {output_file}")

if __name__ == '__main__':
    main()

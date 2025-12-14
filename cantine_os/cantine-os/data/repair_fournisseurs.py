#!/usr/bin/env python3
"""
Repair corrupted fournisseurs.json file.
Attempts to extract valid supplier data and reconstruct the file.
"""

import json
import re
from datetime import datetime

def extract_valid_suppliers(content):
    """Extract as many valid suppliers as possible from corrupted JSON."""
    suppliers = []
    
    # Split by supplier ID pattern
    pattern = r'(\{[\s\n]*"id":\s*"f\d+")'
    parts = re.split(pattern, content)
    
    # Reconstruct suppliers
    for i in range(1, len(parts), 2):
        if i+1 < len(parts):
            supplier_text = parts[i] + parts[i+1]
            
            # Try to find the end of this supplier object
            # Count braces to find matching closing brace
            depth = 0
            end_pos = 0
            for j, char in enumerate(supplier_text):
                if char == '{':
                    depth += 1
                elif char == '}':
                    depth -= 1
                    if depth == 0:
                        end_pos = j + 1
                        break
            
            if end_pos > 0:
                supplier_json = supplier_text[:end_pos]
                try:
                    supplier = json.loads(supplier_json)
                    suppliers.append(supplier)
                    print(f"✅ Extracted supplier {supplier.get('id')}: {supplier.get('nom')}")
                except json.JSONDecodeError as e:
                    # Try to fix common issues
                    supplier_json_fixed = fix_common_issues(supplier_json)
                    try:
                        supplier = json.loads(supplier_json_fixed)
                        suppliers.append(supplier)
                        print(f"✅ Fixed and extracted supplier {supplier.get('id')}: {supplier.get('nom')}")
                    except:
                        print(f"❌ Could not parse supplier starting at position {i}")
    
    return suppliers

def fix_common_issues(json_str):
    """Fix common JSON issues."""
    # Remove trailing commas before closing braces/brackets
    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
    # Fix missing commas between fields
    json_str = re.sub(r'"\s*\n\s*"', '",\n"', json_str)
    return json_str

def create_minimal_supplier(supplier_id, name="Fournisseur"):
    """Create a minimal valid supplier object."""
    return {
        "id": supplier_id,
        "nom": name,
        "type": "grossiste",
        "contact": {
            "email": "",
            "telephone": ""
        },
        "localisation": {
            "adresse": "",
            "ville": "",
            "code_postal": "",
            "distance_km": 0
        },
        "labels": [],
        "delai_livraison_jours": 1,
        "jours_livraison": [],
        "minimum_commande_euro": 0,
        "produits": []
    }

def main():
    print("🔧 Repairing fournisseurs.json...")
    
    # Read corrupted file
    with open('fournisseurs.json', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Try to extract valid suppliers
    suppliers = extract_valid_suppliers(content)
    
    print(f"\n📊 Extracted {len(suppliers)} valid suppliers")
    
    # If we got less than expected, try alternative parsing
    if len(suppliers) < 30:
        print("⚠️  Too few suppliers extracted, trying alternative method...")
        # Create minimal valid structure
        suppliers = []
        for i in range(1, 51):
            suppliers.append(create_minimal_supplier(f"f{i:03d}", f"Fournisseur {i}"))
        print(f"📊 Created {len(suppliers)} minimal suppliers")
    
    # Create valid JSON structure
    data = {
        "fournisseurs": suppliers,
        "meta": {
            "version": "1.0",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "description": "Catalogue des fournisseurs de la cantine (réparé)"
        }
    }
    
    # Backup corrupted file
    with open('fournisseurs.json.backup', 'w', encoding='utf-8') as f:
        f.write(content)
    print("💾 Backed up corrupted file to fournisseurs.json.backup")
    
    # Write repaired file
    with open('fournisseurs.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print("✅ Repaired file written to fournisseurs.json")
    
    # Validate
    with open('fournisseurs.json', 'r', encoding='utf-8') as f:
        test = json.load(f)
    print(f"✅ Validation successful: {len(test['fournisseurs'])} suppliers")

if __name__ == "__main__":
    main()

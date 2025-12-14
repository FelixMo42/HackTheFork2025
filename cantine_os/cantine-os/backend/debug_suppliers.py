
import json
import sys
from pathlib import Path

# Adjust path to match the environment
DATA_DIR = Path(__file__).parent.parent / "data"
SUPPLIERS_FILE = DATA_DIR / "fournisseurs.json"

def test_load():
    print(f"Testing load from {SUPPLIERS_FILE}")
    if not SUPPLIERS_FILE.exists():
        print("File does not exist!")
        return

    try:
        with open(SUPPLIERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        print("JSON Parse Successful")
        
        suppliers = data.get("fournisseurs", [])
        print(f"Found {len(suppliers)} suppliers")
        
        # Validate against basic constraints to see if anything is weird
        for i, s in enumerate(suppliers):
            if "id" not in s:
                print(f"Supplier at index {i} missing ID")
            if "produits" not in s:
                print(f"Supplier {s.get('nom', 'Unknown')} missing products list")
            else:
                for j, p in enumerate(s["produits"]):
                    pass
                    
        print("Basic structural check passed")
        
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
    except Exception as e:
        print(f"Unexpected Error: {e}")

if __name__ == "__main__":
    test_load()

import sys
from pathlib import Path
# Add app directory to path
sys.path.append(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\backend\app")

# Import directly from solver which is now in path
from solver import load_recipes

# Define data dir manually to avoid importing main and triggering its relative imports
DATA_DIR = Path(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\data")

recipes = load_recipes(DATA_DIR / "recettes.json")
print(f"Loaded {len(recipes)} recipes.")

count_with_equip = 0
for r in recipes:
    if hasattr(r, "equipement") and isinstance(r.equipement, list):
        count_with_equip += 1
        if len(r.equipement) > 0:
             # Print first 3 to verify logic
             if count_with_equip <= 3:
                 print(f"Recipe: {r.nom}, Equip: {r.equipement}")

print(f"Recipes with equipment field: {count_with_equip}/{len(recipes)}")

if count_with_equip == len(recipes):
    print("SUCCESS: All recipes have equipment data.")
else:
    print("FAILURE: Some recipes missing equipment data.")

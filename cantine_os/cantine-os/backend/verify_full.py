import sys
from pathlib import Path
sys.path.append(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\backend\app")

from solver import load_recipes

# Define data dir manually
DATA_DIR = Path(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\data")

try:
    recipes = load_recipes(DATA_DIR / "recettes.json")
    print(f"Loaded {len(recipes)} recipes.")

    missing_equip = 0
    missing_season = 0

    for r in recipes:
        if not hasattr(r, "equipement") or not isinstance(r.equipement, list):
            missing_equip += 1
        
        if not hasattr(r, "mois_saison") or not isinstance(r.mois_saison, list):
            missing_season += 1
        elif len(r.mois_saison) == 0:
            print(f"Warning: Recipe {r.nom} has no season.")
        
        # Check specific samples
        if r.nom == "Salade de tomates mozzarella" and 1 in r.mois_saison:
             print(f"Check: Tomates mozzarella should NOT include January (1). Seasons: {r.mois_saison}")

    print(f"Missing equipment: {missing_equip}")
    print(f"Missing seasonality: {missing_season}")

    if missing_equip == 0 and missing_season == 0:
        print("SUCCESS: All recipes have new fields.")
    else:
        print("FAILURE: Data missing.")

except Exception as e:
    print(f"Error: {e}")

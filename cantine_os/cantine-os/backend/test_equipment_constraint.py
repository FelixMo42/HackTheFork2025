import sys
from pathlib import Path
sys.path.append(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\backend\app")

from solver import load_recipes, MenuSolver, CanteenConfig, ConviveProfile

DATA_DIR = Path(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\data")

import json
with open(DATA_DIR / "gemrcn_constraints.json", "r", encoding="utf-8") as f:
    gemrcn = json.load(f)

recipes = load_recipes(DATA_DIR / "recettes.json")
print(f"Total recipes: {len(recipes)}")

# Define a canteen with ONLY "table_inox" (minimal equipment)
config_minimal = CanteenConfig(
    nom="Cantine Test Minimal",
    budget_max_par_repas=5.00,
    nb_jours=5,
    convives=[ConviveProfile(label="Test", age_min=6, age_max=11, effectif=100, grammages={})],
    priorite_carbone=0.3,
    priorite_local=0.3,
    priorite_budget=0.4,
    equipement_disponible=["table_inox"]  # Only this equipment
)

solver_minimal = MenuSolver(config_minimal, recipes, gemrcn)
print(f"Recipes with minimal equipment: {len(solver_minimal.recipes)}")

# Define a canteen with full equipment
all_equipment = list(set(e for r in recipes for e in r.equipement))
print(f"All unique equipment in database: {all_equipment}")

config_full = CanteenConfig(
    nom="Cantine Test Full",
    budget_max_par_repas=5.00,
    nb_jours=5,
    convives=[ConviveProfile(label="Test", age_min=6, age_max=11, effectif=100, grammages={})],
    priorite_carbone=0.3,
    priorite_local=0.3,
    priorite_budget=0.4,
    equipement_disponible=all_equipment  # All equipment
)

solver_full = MenuSolver(config_full, recipes, gemrcn)
print(f"Recipes with full equipment: {len(solver_full.recipes)}")

# Check: minimal should have fewer recipes than full
if len(solver_minimal.recipes) < len(solver_full.recipes):
    print("SUCCESS: Equipment filtering works correctly.")
else:
    print("FAILURE: Equipment filtering not working as expected.")

# Check: full should have all recipes
if len(solver_full.recipes) == len(recipes):
    print("SUCCESS: Full equipment returns all recipes.")
else:
    print("WARNING: Full equipment does not return all recipes. Check equipment definitions.")

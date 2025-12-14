"""Test script for the CP-SAT Menu Solver"""
import sys
import json
from pathlib import Path

sys.path.insert(0, '.')

from app.solver import load_recipes, MenuSolver, CanteenConfig, ConviveProfile

# Load data
data_dir = Path('..') / 'data'
recipes = load_recipes(data_dir / 'recettes.json')

with open(data_dir / 'gemrcn_constraints.json', 'r', encoding='utf-8') as f:
    gemrcn = json.load(f)

print(f"Loaded {len(recipes)} recipes")

# Configure for test
config = CanteenConfig(
    nom='Test School',
    budget_max_par_repas=2.50,
    nb_jours=5,
    convives=[
        ConviveProfile(
            label='Elementaire',
            age_min=6,
            age_max=11,
            effectif=100,
            grammages={}
        )
    ],
    priorite_carbone=0.3,
    priorite_local=0.3,
    priorite_budget=0.4
)

# Solve
print("Building and solving model...")
solver = MenuSolver(config, recipes, gemrcn)
menu = solver.solve()

if menu:
    print("\n=== SUCCESS: Menu generated! ===")
    print(f"Days: {len(menu['jours'])}")
    print(f"Cost avg: {menu['stats']['cout_moyen_par_jour']}€")
    print(f"Vegetarian %: {menu['stats']['pct_repas_vegetariens']}%")
    print(f"Bio %: {menu['stats']['pct_bio']}%")
    print(f"Local %: {menu['stats']['pct_local']}%")
else:
    print("FAILED: No solution found")

import json
from pathlib import Path

# Data path
data_dir = Path(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\data")
recipes_path = data_dir / "recettes.json"

# Load recipes
with open(recipes_path, "r", encoding="utf-8") as f:
    recipes = json.load(f)

def get_seasonality(recipe):
    name = recipe["nom"].lower()
    ingredients = [i["nom"].lower() for i in recipe.get("ingredients", [])]
    tags = recipe.get("tags", [])
    
    months = set()
    
    # Logic based on ingredients
    has_seasonal_ingredient = False
    
    # Summer vegetables (Ratatouille style)
    if any(i in name or i in ingredients for i in ["tomate", "courgette", "aubergine", "poivron", "concombre", "melon"]):
        months.update([6, 7, 8, 9])
        has_seasonal_ingredient = True
        
    # Winter vegetables
    if any(i in name or i in ingredients for i in ["poireaux", "celeri", "carotte", "chou", "potiron", "courge", "epinard", "navet", "betterave"]):
        # Include late autumn / winter / early spring depending on veg, simplified to:
        months.update([10, 11, 12, 1, 2, 3])
        has_seasonal_ingredient = True
        
    # Spring vegetables
    if any(i in name or i in ingredients for i in ["asperge", "radis", "pois_chiche", "petit_pois"]): 
         # Pois chiche is dried usually but fresh peas are spring
         if "petit_pois" in ingredients:
             months.update([4, 5, 6])
             has_seasonal_ingredient = True

    # Fruits
    if any(i in name or i in ingredients for i in ["fraise", "cerise"]):
        months.update([5, 6, 7])
        has_seasonal_ingredient = True
    elif any(i in name or i in ingredients for i in ["pomme", "poire", "raisin", "kiwi", "orange", "clementine"]):
        months.update([10, 11, 12, 1, 2, 3])
        has_seasonal_ingredient = True
    elif any(i in name or i in ingredients for i in ["abricot", "peche", "nectarine"]):
        months.update([6, 7, 8])
        has_seasonal_ingredient = True
        
    # If no specific seasonal ingredient detected, assume available year-round (dried goods, frozen allowed/available, meat, dairy, pasta)
    if not has_seasonal_ingredient:
        return list(range(1, 13))
        
    # If we detected seasonality, return the sorted list
    return sorted(list(months))

# Update recipes
for r in recipes:
    r["mois_saison"] = get_seasonality(r)

# Save back
with open(recipes_path, "w", encoding="utf-8") as f:
    json.dump(recipes, f, ensure_ascii=False, indent=4)

print(f"Updated {len(recipes)} recipes with seasonality data.")

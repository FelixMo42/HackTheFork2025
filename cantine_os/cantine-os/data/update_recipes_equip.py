import json
from pathlib import Path

# Data path
data_dir = Path(r"c:\Users\thoma\Desktop\HackTheFork\cantine-os\data")
recipes_path = data_dir / "recettes.json"

# Load recipes
with open(recipes_path, "r", encoding="utf-8") as f:
    recipes = json.load(f)

# Equipment mapping logic (simplified for collective catering context)
def get_equipment(recipe):
    equip = set()
    name = recipe["nom"].lower()
    rtype = recipe["type"]
    tags = recipe.get("tags", [])
    
    # Logic based on type/name/tags
    if "four" in tags or "rotir" in name or "gratin" in name or "tarte" in name or "cake" in name or "quiche" in name or "lasagnes" in name or "poulet rôti" in name:
        equip.add("four")
    
    if "pates" in name or "riz" in name or "semoule" in name or "pommes de terre" in name or "haricots" in name or "brocolis" in name or "vapeur" in tags:
        equip.add("sautoir") # For boiling water or cooking large quantities
        equip.add("marmite")
    
    if "soupe" in tags or "potage" in name:
        equip.add("marmite")
        equip.add("mixeur")
        
    if "salade" in name or "crudites" in tags or "celeri" in name or "carottes rappees" in name:
        equip.add("legumerie")   # Prep area
        equip.add("mélangeur")   # For mixing large salads
        
    if "puree" in name:
        equip.add("marmite")
        equip.add("mixeur")
        
    if "sauté" in name or "poêlée" in name or "chili" in name or "curry" in name or "bolognaise" in name:
        equip.add("sautoir")
        
    if "omelette" in name or "oeufs" in tags:
        equip.add("sautoir") # Or specialized equipment
        
    if "friture" in tags:
        equip.add("friteuse")
        
    # Cold desserts / Dairy
    if rtype in ["produit_laitier", "dessert"]:
        if "yaourt" in name or "fromage" in name or "fruit" in name:
            equip.add("cellule_refroidissement") # Critical for cold chain
    
    # Generic prep
    equip.add("table_inox")
    
    return list(equip)

# Update recipes
for r in recipes:
    r["equipement"] = get_equipment(r)

# Save back
with open(recipes_path, "w", encoding="utf-8") as f:
    json.dump(recipes, f, ensure_ascii=False, indent=4)

print(f"Updated {len(recipes)} recipes with equipment data.")

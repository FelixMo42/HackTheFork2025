"""
Cantine.OS - FastAPI Backend
REST API for menu optimization
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import json
import tempfile
import shutil
from pathlib import Path

from .solver import MenuSolver, CanteenConfig, ConviveProfile, load_recipes

# OCR import (optional - may not be installed)
try:
    from .ocr_menu import extract_menu_from_pdf, extract_menu_from_image, OLMOCR_AVAILABLE
except ImportError:
    OLMOCR_AVAILABLE = False

app = FastAPI(
    title="Cantine.OS API",
    description="Moteur de conformité pour la restauration collective",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent.parent.parent / "data"


# ============ MODELS ============

class ConviveInput(BaseModel):
    label: str
    age_min: int
    age_max: int
    effectif: int


class MenuRequest(BaseModel):
    nom_etablissement: str
    budget_max_par_repas: float
    nb_jours: int = 5
    convives: List[ConviveInput]
    priorite_carbone: float = 0.3
    priorite_local: float = 0.3
    priorite_budget: float = 0.4


class RecipeBase(BaseModel):
    id: str
    nom: str
    type: str
    vegetarien: bool
    bio: bool
    local: bool
    cout_portion_euro: float
    proteines_g: float
    co2_kg_portion: float


# ============ SUPPLIER MODELS ============

class ProductInput(BaseModel):
    id: str
    nom: str
    categorie: str
    unite: str
    prix_unitaire: float
    bio: bool = False
    origine: str = ""
    disponibilite_mois: List[int] = []
    allergenes: List[str] = []


class SupplierContact(BaseModel):
    email: str = ""
    telephone: str = ""


class SupplierLocation(BaseModel):
    adresse: str = ""
    ville: str = ""
    code_postal: str = ""
    distance_km: float = 0


class SupplierInput(BaseModel):
    id: Optional[str] = None
    nom: str
    type: str = "producteur"
    contact: SupplierContact = SupplierContact()
    localisation: SupplierLocation = SupplierLocation()
    labels: List[str] = []
    delai_livraison_jours: int = 1
    jours_livraison: List[str] = []
    minimum_commande_euro: float = 0
    produits: List[ProductInput] = []


def load_suppliers():
    """Load suppliers from JSON file."""
    suppliers_file = DATA_DIR / "fournisseurs.json"
    if suppliers_file.exists():
        with open(suppliers_file, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get("fournisseurs", [])
    return []


def save_suppliers(suppliers: list):
    """Save suppliers to JSON file."""
    suppliers_file = DATA_DIR / "fournisseurs.json"
    data = {
        "fournisseurs": suppliers,
        "meta": {
            "version": "1.0",
            "last_updated": "2024-12-13",
            "description": "Catalogue des fournisseurs de la cantine"
        }
    }
    with open(suppliers_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


# ============ ENDPOINTS ============

@app.get("/")
def root():
    return {"message": "Bienvenue sur Cantine.OS API", "version": "1.0.0"}


@app.get("/api/recipes")
def get_recipes():
    """Get all available recipes."""
    recipes = load_recipes(DATA_DIR / "recettes.json")
    return [
        {
            "id": r.id,
            "nom": r.nom,
            "type": r.type,
            "vegetarien": r.vegetarien,
            "bio": r.bio,
            "local": r.local,
            "cout_portion_euro": r.cout_portion_euro,
            "proteines_g": r.proteines_g,
            "calcium_mg": r.calcium_mg,
            "fer_mg": r.fer_mg,
            "co2_kg_portion": r.co2_kg_portion,
            "tags": r.tags
        }
        for r in recipes
    ]


@app.get("/api/gemrcn")
def get_gemrcn_constraints():
    """Get GEMRCN nutritional constraints."""
    with open(DATA_DIR / "gemrcn_constraints.json", "r", encoding="utf-8") as f:
        return json.load(f)


@app.post("/api/generate-menu")
def generate_menu(request: MenuRequest):
    """Generate an optimized menu plan."""
    # Load data
    recipes = load_recipes(DATA_DIR / "recettes.json")
    with open(DATA_DIR / "gemrcn_constraints.json", "r", encoding="utf-8") as f:
        gemrcn = json.load(f)

    # Build config from request
    convives = [
        ConviveProfile(
            label=c.label,
            age_min=c.age_min,
            age_max=c.age_max,
            effectif=c.effectif,
            grammages={}  # Could be extended
        )
        for c in request.convives
    ]

    config = CanteenConfig(
        nom=request.nom_etablissement,
        budget_max_par_repas=request.budget_max_par_repas,
        nb_jours=request.nb_jours,
        convives=convives,
        priorite_carbone=request.priorite_carbone,
        priorite_local=request.priorite_local,
        priorite_budget=request.priorite_budget
    )

    # Solve
    solver = MenuSolver(config, recipes, gemrcn)
    menu = solver.solve()

    if menu is None:
        raise HTTPException(
            status_code=400,
            detail="Impossible de générer un menu avec ces contraintes. Essayez d'augmenter le budget."
        )

    return {
        "status": "success",
        "config": {
            "etablissement": config.nom,
            "budget_max": config.budget_max_par_repas,
            "nb_jours": config.nb_jours
        },
        "menu": menu
    }


@app.get("/api/heatmap-data")
def get_heatmap_data():
    """
    Get data for the Nutritional Density vs Cost heatmap.
    This is the "Killer Feature" to convince mayors.
    """
    recipes = load_recipes(DATA_DIR / "recettes.json")

    # Calculate nutritional density score
    # Simple formula: (proteins + iron*5 + calcium/10) / cost
    heatmap_data = []
    for r in recipes:
        if r.cout_portion_euro > 0:
            density = (r.proteines_g + r.fer_mg * 5 + r.calcium_mg / 10) / r.cout_portion_euro
            heatmap_data.append({
                "id": r.id,
                "nom": r.nom,
                "type": r.type,
                "cout": r.cout_portion_euro,
                "proteines": r.proteines_g,
                "fer": r.fer_mg,
                "calcium": r.calcium_mg,
                "co2": r.co2_kg_portion,
                "densite_nutritionnelle": round(density, 2),
                "vegetarien": r.vegetarien,
                "bio": r.bio,
                "local": r.local
            })

    # Sort by density (best value first)
    heatmap_data.sort(key=lambda x: x["densite_nutritionnelle"], reverse=True)

    return {
        "description": "Densité Nutritionnelle = (Protéines + Fer×5 + Calcium/10) / Coût",
        "data": heatmap_data
    }



# ============ SUPPLIER ENDPOINTS ============

@app.get("/api/suppliers")
def get_suppliers():
    """Get all suppliers with their products."""
    suppliers = load_suppliers()
    return {
        "count": len(suppliers),
        "suppliers": suppliers
    }


@app.get("/api/suppliers/{supplier_id}")
def get_supplier(supplier_id: str):
    """Get a specific supplier by ID."""
    suppliers = load_suppliers()
    for s in suppliers:
        if s.get("id") == supplier_id:
            return s
    raise HTTPException(status_code=404, detail=f"Fournisseur {supplier_id} non trouvé")


@app.post("/api/suppliers")
def create_supplier(supplier: SupplierInput):
    """Create a new supplier."""
    suppliers = load_suppliers()
    
    # Generate ID if not provided
    if not supplier.id:
        existing_ids = [s.get("id", "") for s in suppliers]
        new_num = 1
        while f"f{new_num:03d}" in existing_ids:
            new_num += 1
        supplier_id = f"f{new_num:03d}"
    else:
        supplier_id = supplier.id
        if any(s.get("id") == supplier_id for s in suppliers):
            raise HTTPException(status_code=400, detail=f"L'ID {supplier_id} existe déjà")
    
    new_supplier = {
        "id": supplier_id,
        "nom": supplier.nom,
        "type": supplier.type,
        "contact": supplier.contact.model_dump(),
        "localisation": supplier.localisation.model_dump(),
        "labels": supplier.labels,
        "delai_livraison_jours": supplier.delai_livraison_jours,
        "jours_livraison": supplier.jours_livraison,
        "minimum_commande_euro": supplier.minimum_commande_euro,
        "produits": [p.model_dump() for p in supplier.produits]
    }
    
    suppliers.append(new_supplier)
    save_suppliers(suppliers)
    
    return {"status": "success", "supplier": new_supplier}


@app.put("/api/suppliers/{supplier_id}")
def update_supplier(supplier_id: str, supplier: SupplierInput):
    """Update an existing supplier."""
    suppliers = load_suppliers()
    
    for i, s in enumerate(suppliers):
        if s.get("id") == supplier_id:
            suppliers[i] = {
                "id": supplier_id,
                "nom": supplier.nom,
                "type": supplier.type,
                "contact": supplier.contact.model_dump(),
                "localisation": supplier.localisation.model_dump(),
                "labels": supplier.labels,
                "delai_livraison_jours": supplier.delai_livraison_jours,
                "jours_livraison": supplier.jours_livraison,
                "minimum_commande_euro": supplier.minimum_commande_euro,
                "produits": [p.model_dump() for p in supplier.produits]
            }
            save_suppliers(suppliers)
            return {"status": "success", "supplier": suppliers[i]}
    
    raise HTTPException(status_code=404, detail=f"Fournisseur {supplier_id} non trouvé")


@app.delete("/api/suppliers/{supplier_id}")
def delete_supplier(supplier_id: str):
    """Delete a supplier."""
    suppliers = load_suppliers()
    
    for i, s in enumerate(suppliers):
        if s.get("id") == supplier_id:
            deleted = suppliers.pop(i)
            save_suppliers(suppliers)
            return {"status": "success", "deleted": deleted}
    
    raise HTTPException(status_code=404, detail=f"Fournisseur {supplier_id} non trouvé")


@app.get("/api/products")
def get_all_products():
    """Get all products from all suppliers."""
    suppliers = load_suppliers()
    products = []
    
    for s in suppliers:
        for p in s.get("produits", []):
            products.append({
                **p,
                "fournisseur_id": s.get("id"),
                "fournisseur_nom": s.get("nom"),
                "fournisseur_labels": s.get("labels", [])
            })
    
    return {
        "count": len(products),
        "products": products
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# ============ OCR ENDPOINTS ============

@app.get("/api/ocr/status")
def get_ocr_status():
    """Check if OCR is available."""
    return {
        "available": True,  # Gemini is always available with API key
        "primary_engine": "gemini-2.0-flash",
        "fallback_engine": "easyocr" if OLMOCR_AVAILABLE else None,
        "message": "OCR prêt (Gemini Vision API)"
    }


@app.post("/api/ocr/extract-menu")
async def ocr_extract_menu(file: UploadFile = File(...)):
    """
    Extract menu content from an uploaded PDF or image file.
    Uses Gemini Vision API (primary) with EasyOCR as fallback.
    """

    # Validate file type
    allowed_extensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.bmp']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporté. Formats acceptés: {', '.join(allowed_extensions)}"
        )

    # Save uploaded file to temp location
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    try:
        # Process based on file type
        if file_ext == '.pdf':
            result = extract_menu_from_pdf(tmp_path, page=1)
        else:
            result = extract_menu_from_image(tmp_path)

        return {
            "status": "success" if result.get("success") else "partial",
            "filename": file.filename,
            "confidence": result.get("confidence", 0),
            "language": result.get("language", "fr"),
            "ocr_engine": result.get("ocr_engine", "unknown"),
            "menu_items": result.get("menu_items", []),
            "menu_by_day": result.get("menu_by_day", {}),
            "raw_text": result.get("raw_text", "")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'extraction OCR: {str(e)}"
        )

    finally:
        # Cleanup temp file
        Path(tmp_path).unlink(missing_ok=True)

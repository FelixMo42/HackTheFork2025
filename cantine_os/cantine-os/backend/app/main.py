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

class ConviveProfile(BaseModel):
    label: str
    age_min: int
    age_max: int
    effectif: int

class EtablissementPriorites(BaseModel):
    budget: float
    carbone: float
    local: float

class EtablissementContact(BaseModel):
    responsable: str
    telephone: str

class EtablissementAdresse(BaseModel):
    ville: str
    code_postal: str

class EtablissementInput(BaseModel):
    id: Optional[str] = None
    nom: str
    type: str # maternelle, elementaire, college...
    convives: List[ConviveProfile]
    budget_max_par_repas: float
    equipement_disponible: List[str]
    priorites: EtablissementPriorites
    contact: EtablissementContact
    adresse: EtablissementAdresse

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
    equipement_disponible: Optional[List[str]] = None


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
    equipement: List[str] = []
    mois_saison: List[int] = []


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
    with open(DATA_DIR / "fournisseurs.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)

def load_etablissements():
    try:
        with open(DATA_DIR / "etablissements.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_etablissements(etablissements: list):
    with open(DATA_DIR / "etablissements.json", "w", encoding="utf-8") as f:
        json.dump(etablissements, f, indent=4, ensure_ascii=False)


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
            "tags": r.tags,
            "equipement": r.equipement,
            "mois_saison": r.mois_saison
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
        priorite_budget=request.priorite_budget,
        equipement_disponible=request.equipement_disponible or []
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


# ============ AGREATION / BULK ORDERING ENDPOINTS ============

@app.get("/api/commandes/agregation")
def get_aggregated_orders(semaine: str = None):
    """
    Agrège les ingrédients de tous les plannings de la semaine spécifiée.
    Retourne par ingrédient :
        - quantite_totale_kg
        - nb_etablissements (qui l'utilisent)
        - fournisseur_recommande (avec meilleur prix pour cette quantité)
        - prix_unitaire_gros (si minimum commande atteint)
        - economie_vs_detail (€ économisés)
    """
    # 1. Load data
    suppliers = load_suppliers()
    etablissements = load_etablissements() 
    
    # 2. Simulate aggregated needs (Mock logic for demo as we don't have real planning persistence yet)
    # In a real app, we would fetch planning for each store for the given week
    
    # Use demo data that looks realistic
    aggregated_needs = [
        {"nom": "Pommes de terre", "quantite_kg": 150, "etablissements": ["etab_001", "etab_002"]},
        {"nom": "Carottes", "quantite_kg": 85, "etablissements": ["etab_001"]},
        {"nom": "Poulet", "quantite_kg": 60, "etablissements": ["etab_001", "etab_002"]},
        {"nom": "Lentilles", "quantite_kg": 40, "etablissements": ["etab_002"]},
        {"nom": "Oignons", "quantite_kg": 25, "etablissements": ["etab_001", "etab_002"]},
        {"nom": "Beurre", "quantite_kg": 15, "etablissements": ["etab_001"]}
    ]
    
    results = []
    
    for item in aggregated_needs:
        nom_ingredient = item["nom"]
        qty_total = item["quantite_kg"]
        
        # Find best supplier price
        best_price = float('inf')
        best_supplier = None
        detail_price = 0
        
        # Simple matching logic
        found = False
        for supplier in suppliers:
            for product in supplier.get("produits", []):
                # Fuzzy match
                p_nom = product.get("nom", "").lower()
                i_nom = nom_ingredient.lower()
                
                if i_nom in p_nom or p_nom in i_nom:
                     # Check if supplier has bulk discount logic (simulated here)
                     # Example: -10% if > 50kg, -20% if > 100kg
                    base_price = product.get("prix_unitaire", 0)
                    current_price = base_price
                    discount = 0
                    
                    # Simuler des paliers de réduction
                    if qty_total >= 100:
                        discount = 0.20
                    elif qty_total >= 50:
                        discount = 0.10
                        
                    current_price = base_price * (1 - discount)
                    
                    if current_price < best_price:
                        best_price = current_price
                        detail_price = base_price
                        best_supplier = supplier
                        found = True
        
        if found and best_supplier:
            cost_bulk = best_price * qty_total
            cost_detail = detail_price * qty_total
            economy = cost_detail - cost_bulk
            
            results.append({
                "ingredient": nom_ingredient,
                "quantite_totale_kg": qty_total,
                "nb_etablissements": len(item["etablissements"]),
                "fournisseur": {
                    "nom": best_supplier.get("nom"), 
                    "id": best_supplier.get("id"),
                    "minimum_commande": best_supplier.get("minimum_commande_euro", 0)
                },
                "prix_unitaire_moyen": round(best_price, 2),
                "prix_unitaire_detail": round(detail_price, 2),
                "seuil_atteint": qty_total >= 50, # Threshold example
                "economie": round(economy, 2)
            })
        else:
             # Fallback if no supplier found
             results.append({
                "ingredient": nom_ingredient,
                "quantite_totale_kg": qty_total,
                "nb_etablissements": len(item["etablissements"]),
                "fournisseur": {"nom": "Non trouvé", "id": None, "minimum_commande": 0},
                "prix_unitaire_moyen": 0,
                "prix_unitaire_detail": 0,
                "seuil_atteint": False,
                "economie": 0
            })
            
    return results


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



# ============ ETABLISSEMENT ENDPOINTS ============

@app.get("/api/etablissements")
def get_etablissements():
    return load_etablissements()

@app.get("/api/etablissements/{etablissement_id}")
def get_etablissement(etablissement_id: str):
    etablissements = load_etablissements()
    for etab in etablissements:
        if etab["id"] == etablissement_id:
            return etab
    raise HTTPException(status_code=404, detail="Etablissement not found")

@app.post("/api/etablissements")
def create_etablissement(etablissement: EtablissementInput):
    etablissements = load_etablissements()
    new_etab = etablissement.dict()
    if not new_etab.get("id"):
        new_etab["id"] = f"etab_{len(etablissements) + 1:03d}"
    
    etablissements.append(new_etab)
    save_etablissements(etablissements)
    return new_etab

@app.put("/api/etablissements/{etablissement_id}")
def update_etablissement(etablissement_id: str, etablissement: EtablissementInput):
    etablissements = load_etablissements()
    for index, etab in enumerate(etablissements):
        if etab["id"] == etablissement_id:
            updated_etab = etablissement.dict()
            updated_etab["id"] = etablissement_id # Ensure ID allows match
            etablissements[index] = updated_etab
            save_etablissements(etablissements)
            return updated_etab
    raise HTTPException(status_code=404, detail="Etablissement not found")

@app.delete("/api/etablissements/{etablissement_id}")
def delete_etablissement(etablissement_id: str):
    etablissements = load_etablissements()
    initial_len = len(etablissements)
    etablissements = [e for e in etablissements if e["id"] != etablissement_id]
    if len(etablissements) == initial_len:
         raise HTTPException(status_code=404, detail="Etablissement not found")
    save_etablissements(etablissements)
    return {"message": "Etablissement deleted"}


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


@app.get("/api/products/search")
def search_products(q: str = "", categorie: str = "", limit: int = 10):
    """
    Search products from supplier catalogs for autocomplete.
    
    Args:
        q: Search query (matches product name)
        categorie: Filter by category
        limit: Maximum results (default 10)
    """
    suppliers = load_suppliers()
    results = []
    
    for s in suppliers:
        for p in s.get("produits", []):
            product_name = p.get("nom", "").lower()
            product_cat = p.get("categorie", "")
            
            # Filter by search query
            if q and q.lower() not in product_name:
                continue
            
            # Filter by category
            if categorie and categorie != product_cat:
                continue
            
            results.append({
                "id": p.get("id", ""),
                "nom": p.get("nom", ""),
                "categorie": p.get("categorie", ""),
                "unite": p.get("unite", "kg"),
                "prix_unitaire": p.get("prix_unitaire", 0),
                "bio": p.get("bio", False),
                "fournisseur_id": s.get("id"),
                "fournisseur_nom": s.get("nom"),
                "delai_jours": s.get("delai_livraison_jours", 1)
            })
            
            if len(results) >= limit:
                break
        
        if len(results) >= limit:
            break
    
    return {
        "count": len(results),
        "query": q,
        "products": results
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


# ============ SUPPLIER IMPORT ENDPOINTS ============

# Import supplier OCR module
try:
    from .ocr_supplier import extract_supplier_from_image, parse_csv_products
    SUPPLIER_OCR_AVAILABLE = True
except ImportError:
    SUPPLIER_OCR_AVAILABLE = False


@app.post("/api/ocr/extract-supplier")
async def ocr_extract_supplier(file: UploadFile = File(...)):
    """
    Extract supplier and product data from an uploaded image (invoice, catalog, price list).
    Uses Gemini Vision API for intelligent extraction.
    """
    if not SUPPLIER_OCR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Module OCR fournisseur non disponible")
    
    # Validate file type
    allowed_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
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
        result = extract_supplier_from_image(tmp_path)

        return {
            "status": "success" if result.get("success") else "partial",
            "filename": file.filename,
            "confidence": result.get("confidence", 0),
            "ocr_engine": result.get("ocr_engine", "gemini"),
            "supplier": result.get("supplier", {}),
            "products": result.get("products", []),
            "raw_text": result.get("raw_text", ""),
            "error": result.get("error")
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'extraction OCR fournisseur: {str(e)}"
        )

    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.post("/api/suppliers/import-csv")
async def import_supplier_csv(file: UploadFile = File(...)):
    """
    Parse a CSV file containing product data.
    Returns parsed products for preview before saving.
    """
    if not SUPPLIER_OCR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Module import CSV non disponible")
    
    # Validate file type
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Type de fichier non supporté. Format accepté: CSV"
        )

    try:
        # Read CSV content
        content = await file.read()
        
        # Try different encodings
        csv_text = None
        for encoding in ['utf-8', 'latin-1', 'cp1252']:
            try:
                csv_text = content.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        
        if csv_text is None:
            raise HTTPException(status_code=400, detail="Encodage du fichier non reconnu")
        
        result = parse_csv_products(csv_text)

        return {
            "status": "success" if result.get("success") else "error",
            "filename": file.filename,
            "products": result.get("products", []),
            "count": result.get("count", 0),
            "errors": result.get("errors", [])
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du parsing CSV: {str(e)}"
        )


@app.post("/api/suppliers/{supplier_id}/import-products")
async def import_products_to_supplier(supplier_id: str, products: List[ProductInput]):
    """
    Import parsed products into an existing supplier.
    """
    suppliers = load_suppliers()
    
    for i, s in enumerate(suppliers):
        if s.get("id") == supplier_id:
            # Get existing products
            existing_products = s.get("produits", [])
            existing_ids = {p.get("id") for p in existing_products}
            
            # Generate IDs for new products and add them
            new_count = 0
            for product in products:
                if not product.id or product.id in existing_ids:
                    # Generate new ID
                    product_num = len(existing_products) + new_count + 1
                    product.id = f"p{int(supplier_id[1:]):03d}{product_num:02d}"
                
                existing_products.append(product.model_dump())
                new_count += 1
            
            suppliers[i]["produits"] = existing_products
            save_suppliers(suppliers)
            
            return {
                "status": "success",
                "supplier_id": supplier_id,
                "imported_count": new_count,
                "total_products": len(existing_products)
            }
    
    raise HTTPException(status_code=404, detail=f"Fournisseur {supplier_id} non trouvé")


# ============ ANTI-GASPI AI ENDPOINT ============

import requests

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyAy8ozSFVyNc-JkXXowUO8h-ME2uuACHXM"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


class AntiGaspiRequest(BaseModel):
    recipes: List[dict]  # List of recipes in the planning
    waste_data: dict  # Waste generated by the planning
    current_score: int  # Current valorization score


@app.post("/api/antigaspi/suggestions")
async def get_antigaspi_suggestions(request: AntiGaspiRequest):
    """
    Get AI-powered anti-gaspi suggestions from Gemini.
    Analyzes the weekly planning and provides creative ideas.
    """
    
    # Build the prompt for Gemini
    recipes_text = "\n".join([f"- {r.get('nom', 'Unknown')} ({r.get('type', '')})" for r in request.recipes])
    waste_text = "\n".join([f"- {w.get('label', k)}: {w.get('quantite_kg', 0)*1000:.0f}g" for k, w in request.waste_data.items()])
    
    prompt = f"""Tu es un expert en gestion de cantine scolaire et en lutte contre le gaspillage alimentaire.

Voici le planning de la semaine avec les recettes prévues:
{recipes_text if recipes_text else "Aucune recette planifiée"}

Voici les déchets alimentaires générés par ce planning:
{waste_text if waste_text else "Aucun déchet identifié"}

Score de valorisation actuel: {request.current_score}%

Donne-moi 3 suggestions CONCRÈTES et CRÉATIVES pour:
1. Réutiliser les déchets alimentaires de façon créative
2. Améliorer le planning pour réduire le gaspillage
3. Faire de la pédagogie avec les enfants sur l'anti-gaspi

Réponds en JSON avec ce format exact:
{{
    "suggestions": [
        {{
            "titre": "Titre court",
            "description": "Description en 1-2 phrases",
            "impact": "high/medium/low",
            "categorie": "valorisation/menu/pedagogie"
        }}
    ],
    "conseil_general": "Un conseil général en une phrase"
}}

Sois créatif et adapté au contexte de cantine scolaire française!"""

    try:
        # Call Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1000
                }
            },
            timeout=30
        )
        
        if response.status_code != 200:
            print(f"❌ Gemini API error: {response.status_code} - {response.text}")
            return get_fallback_suggestions(request.current_score)
        
        result = response.json()
        
        # Extract text from response
        if "candidates" in result and len(result["candidates"]) > 0:
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            
            # Parse JSON from response (handle markdown code blocks)
            import re
            json_match = re.search(r'\{[\s\S]*\}', text)
            if json_match:
                suggestions_data = json.loads(json_match.group())
                return {
                    "status": "success",
                    "source": "gemini",
                    "suggestions": suggestions_data.get("suggestions", []),
                    "conseil_general": suggestions_data.get("conseil_general", "")
                }
        
        return get_fallback_suggestions(request.current_score)
        
    except Exception as e:
        print(f"❌ Anti-gaspi AI error: {str(e)}")
        return get_fallback_suggestions(request.current_score)


def get_fallback_suggestions(score: int):
    """Fallback suggestions when Gemini is unavailable."""
    suggestions = [
        {
            "titre": "Bouillon maison avec épluchures",
            "description": "Collectez les épluchures de légumes pour préparer un bouillon savoureux utilisable dans les soupes et sauces.",
            "impact": "high",
            "categorie": "valorisation"
        },
        {
            "titre": "Atelier cuisine anti-gaspi",
            "description": "Organisez un atelier avec les enfants pour leur apprendre à cuisiner avec les restes (pain perdu, smoothies de fruits mûrs).",
            "impact": "medium",
            "categorie": "pedagogie"
        },
        {
            "titre": "Planifier des recettes complémentaires",
            "description": "Associez les recettes pour que les déchets de l'une servent d'ingrédients à l'autre (ex: fanes de carottes → pesto).",
            "impact": "high",
            "categorie": "menu"
        }
    ]
    
    return {
        "status": "fallback",
        "source": "local",
        "suggestions": suggestions,
        "conseil_general": f"Votre score de {score}% est {'excellent' if score >= 70 else 'bon' if score >= 40 else 'à améliorer'}. Continuez vos efforts anti-gaspi!"
    }


# ============ STOCK MANAGEMENT ENDPOINTS ============

from datetime import datetime

class StockMovementInput(BaseModel):
    type: str  # "entree" or "sortie"
    quantite: float
    motif: str = ""


class StockInput(BaseModel):
    id: Optional[str] = None
    produit_id: str = ""
    produit_nom: str
    categorie: str = ""
    quantite_actuelle: float
    unite: str
    quantite_min: float = 0
    emplacement: str = ""
    dlc: Optional[str] = None
    fournisseur_id: str = ""
    fournisseur_nom: str = ""


def load_stocks():
    """Load stocks from JSON file."""
    stocks_file = DATA_DIR / "stocks.json"
    if stocks_file.exists():
        with open(stocks_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"stocks": [], "mouvements": [], "meta": {}}


def save_stocks(data: dict):
    """Save stocks to JSON file."""
    data["meta"]["last_updated"] = datetime.now().strftime("%Y-%m-%d")
    with open(DATA_DIR / "stocks.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)


@app.get("/api/stocks")
def get_stocks():
    """Get all stock items."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    # Add status based on quantity vs min
    for stock in stocks:
        qty = stock.get("quantite_actuelle", 0)
        qty_min = stock.get("quantite_min", 0)
        
        if qty <= 0:
            stock["statut"] = "rupture"
        elif qty < qty_min:
            stock["statut"] = "bas"
        else:
            stock["statut"] = "ok"
    
    return {
        "count": len(stocks),
        "stocks": stocks
    }


@app.get("/api/stocks/alertes")
def get_stock_alerts():
    """Get stocks that are low or out of stock."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    alerts = []
    for stock in stocks:
        qty = stock.get("quantite_actuelle", 0)
        qty_min = stock.get("quantite_min", 0)
        
        if qty <= 0:
            alerts.append({**stock, "statut": "rupture", "urgence": "haute"})
        elif qty < qty_min:
            alerts.append({**stock, "statut": "bas", "urgence": "moyenne"})
    
    # Sort by urgency (rupture first)
    alerts.sort(key=lambda x: 0 if x["urgence"] == "haute" else 1)
    
    return {
        "count": len(alerts),
        "alertes": alerts
    }


@app.get("/api/stocks/alertes/dlc")
def get_dlc_alerts(jours: int = 5):
    """
    Get stocks with DLC (expiration date) approaching.
    
    Args:
        jours: Number of days threshold (default 5)
    """
    from datetime import datetime, timedelta
    
    data = load_stocks()
    stocks = data.get("stocks", [])
    today = datetime.now().date()
    threshold = today + timedelta(days=jours)
    
    alerts = []
    for stock in stocks:
        dlc_str = stock.get("dlc")
        if not dlc_str:
            continue
        
        try:
            dlc_date = datetime.strptime(dlc_str, "%Y-%m-%d").date()
        except ValueError:
            continue
        
        if dlc_date <= threshold:
            days_remaining = (dlc_date - today).days
            
            if days_remaining < 0:
                urgence = "perdu"
                statut_dlc = "périmé"
            elif days_remaining == 0:
                urgence = "critique"
                statut_dlc = "aujourd'hui"
            elif days_remaining <= 2:
                urgence = "haute"
                statut_dlc = f"{days_remaining} jour(s)"
            else:
                urgence = "moyenne"
                statut_dlc = f"{days_remaining} jours"
            
            alerts.append({
                **stock,
                "dlc_date": dlc_str,
                "jours_restants": days_remaining,
                "urgence_dlc": urgence,
                "statut_dlc": statut_dlc
            })
    
    # Sort by days remaining (most urgent first)
    alerts.sort(key=lambda x: x["jours_restants"])
    
    return {
        "count": len(alerts),
        "seuil_jours": jours,
        "alertes": alerts
    }


@app.post("/api/stocks/scan-product")
async def scan_product_image(file: UploadFile = File(...)):
    """
    Scan a product image using Gemini Vision to extract:
    - Product name
    - DLC (expiration date)
    - Quantity/units
    - Category
    
    Returns structured data ready for stock entry.
    """
    import base64
    import tempfile
    import requests
    
    # Gemini API config
    GEMINI_API_KEY = "AIzaSyAy8ozSFVyNc-JkXXowUO8h-ME2uuACHXM"
    GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    # Validate file type
    allowed_extensions = ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non supporté. Formats acceptés: {', '.join(allowed_extensions)}"
        )
    
    # Save to temp file
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # Read and encode image to base64
        with open(tmp_path, "rb") as image_file:
            image_data = base64.standard_b64encode(image_file.read()).decode("utf-8")
        
        # Determine MIME type
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp'
        }
        mime_type = mime_types.get(file_ext, 'image/jpeg')
        
        # Build prompt for Gemini
        prompt = """Analyse cette image d'un produit alimentaire et extrais les informations suivantes.
        
Regarde TOUT sur l'image: l'étiquette, l'emballage, le code-barres, les textes visibles.

Retourne un JSON avec cette structure exacte:
{
    "produit_nom": "Nom du produit détecté",
    "categorie": "legumes|legumineuses|viande|poisson|produit_laitier|feculents|epicerie|oeufs|autre",
    "dlc": "YYYY-MM-DD ou null si non visible",
    "quantite": 1.0,
    "unite": "kg|litre|unite|douzaine",
    "marque": "Marque si visible, sinon null",
    "bio": true/false,
    "origine": "Pays d'origine si visible, sinon null",
    "confidence": 0.0-1.0
}

IMPORTANT:
- Pour la DLC, cherche "à consommer avant", "DDM", "DLUO", dates au format JJ/MM/AAAA
- Si c'est un lot (ex: "12 oeufs"), ajuste la quantité
- Retourne UNIQUEMENT le JSON, sans texte avant ou après"""

        # Call Gemini API
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": image_data
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1000
            }
        }
        
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"Erreur Gemini API: {response.status_code}"
            )
        
        result = response.json()
        
        # Extract JSON from response
        if "candidates" in result and len(result["candidates"]) > 0:
            content = result["candidates"][0].get("content", {})
            parts = content.get("parts", [])
            
            if parts:
                text_response = parts[0].get("text", "")
                
                # Try to parse JSON from response
                import re
                json_match = re.search(r'\{[\s\S]*\}', text_response)
                
                if json_match:
                    try:
                        product_data = json.loads(json_match.group())
                        
                        # Normalize the data
                        return {
                            "status": "success",
                            "filename": file.filename,
                            "product": {
                                "produit_nom": product_data.get("produit_nom", "Produit inconnu"),
                                "categorie": product_data.get("categorie", "autre"),
                                "dlc": product_data.get("dlc"),
                                "quantite": float(product_data.get("quantite", 1.0) or 1.0),
                                "unite": product_data.get("unite", "unite"),
                                "marque": product_data.get("marque"),
                                "bio": bool(product_data.get("bio", False)),
                                "origine": product_data.get("origine"),
                                "confidence": float(product_data.get("confidence", 0.8) or 0.8)
                            },
                            "raw_response": text_response
                        }
                    except json.JSONDecodeError:
                        pass
        
        return {
            "status": "error",
            "message": "Impossible d'extraire les données du produit",
            "product": None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du scan: {str(e)}"
        )
    finally:
        if tmp_path:
            Path(tmp_path).unlink(missing_ok=True)


@app.get("/api/stocks/{stock_id}")
def get_stock(stock_id: str):
    """Get a specific stock item by ID."""
    data = load_stocks()
    
    for stock in data.get("stocks", []):
        if stock.get("id") == stock_id:
            # Get movements for this stock
            movements = [m for m in data.get("mouvements", []) if m.get("stock_id") == stock_id]
            movements.sort(key=lambda x: x.get("date", ""), reverse=True)
            return {**stock, "mouvements": movements[:10]}
    
    raise HTTPException(status_code=404, detail=f"Stock {stock_id} non trouvé")


@app.post("/api/stocks")
def create_stock(stock: StockInput):
    """Create a new stock item."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    # Generate ID if not provided
    if not stock.id:
        existing_ids = [s.get("id", "") for s in stocks]
        new_num = 1
        while f"stock_{new_num:03d}" in existing_ids:
            new_num += 1
        stock_id = f"stock_{new_num:03d}"
    else:
        stock_id = stock.id
        if any(s.get("id") == stock_id for s in stocks):
            raise HTTPException(status_code=400, detail=f"L'ID {stock_id} existe déjà")
    
    new_stock = {
        "id": stock_id,
        "produit_id": stock.produit_id,
        "produit_nom": stock.produit_nom,
        "categorie": stock.categorie,
        "quantite_actuelle": stock.quantite_actuelle,
        "unite": stock.unite,
        "quantite_min": stock.quantite_min,
        "emplacement": stock.emplacement,
        "dlc": stock.dlc,
        "fournisseur_id": stock.fournisseur_id,
        "fournisseur_nom": stock.fournisseur_nom,
        "dernier_mouvement": datetime.now().strftime("%Y-%m-%d")
    }
    
    stocks.append(new_stock)
    data["stocks"] = stocks
    save_stocks(data)
    
    return {"status": "success", "stock": new_stock}


@app.put("/api/stocks/{stock_id}")
def update_stock(stock_id: str, stock: StockInput):
    """Update an existing stock item."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    for i, s in enumerate(stocks):
        if s.get("id") == stock_id:
            stocks[i] = {
                "id": stock_id,
                "produit_id": stock.produit_id,
                "produit_nom": stock.produit_nom,
                "categorie": stock.categorie,
                "quantite_actuelle": stock.quantite_actuelle,
                "unite": stock.unite,
                "quantite_min": stock.quantite_min,
                "emplacement": stock.emplacement,
                "dlc": stock.dlc,
                "fournisseur_id": stock.fournisseur_id,
                "fournisseur_nom": stock.fournisseur_nom,
                "dernier_mouvement": s.get("dernier_mouvement", datetime.now().strftime("%Y-%m-%d"))
            }
            data["stocks"] = stocks
            save_stocks(data)
            return {"status": "success", "stock": stocks[i]}
    
    raise HTTPException(status_code=404, detail=f"Stock {stock_id} non trouvé")


@app.delete("/api/stocks/{stock_id}")
def delete_stock(stock_id: str):
    """Delete a stock item."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    for i, s in enumerate(stocks):
        if s.get("id") == stock_id:
            deleted = stocks.pop(i)
            data["stocks"] = stocks
            save_stocks(data)
            return {"status": "success", "deleted": deleted}
    
    raise HTTPException(status_code=404, detail=f"Stock {stock_id} non trouvé")


@app.post("/api/stocks/{stock_id}/mouvement")
def record_stock_movement(stock_id: str, movement: StockMovementInput):
    """Record a stock movement (entry or exit)."""
    data = load_stocks()
    stocks = data.get("stocks", [])
    mouvements = data.get("mouvements", [])
    
    # Find stock
    stock_index = None
    for i, s in enumerate(stocks):
        if s.get("id") == stock_id:
            stock_index = i
            break
    
    if stock_index is None:
        raise HTTPException(status_code=404, detail=f"Stock {stock_id} non trouvé")
    
    stock = stocks[stock_index]
    
    # Validate movement type
    if movement.type not in ["entree", "sortie"]:
        raise HTTPException(status_code=400, detail="Type de mouvement invalide. Utilisez 'entree' ou 'sortie'")
    
    # Update quantity
    current_qty = stock.get("quantite_actuelle", 0)
    if movement.type == "entree":
        new_qty = current_qty + movement.quantite
    else:
        new_qty = current_qty - movement.quantite
        if new_qty < 0:
            raise HTTPException(status_code=400, detail=f"Stock insuffisant. Disponible: {current_qty}")
    
    # Generate movement ID
    mvt_num = len(mouvements) + 1
    mvt_id = f"mvt_{mvt_num:03d}"
    
    # Create movement record
    new_movement = {
        "id": mvt_id,
        "stock_id": stock_id,
        "type": movement.type,
        "quantite": movement.quantite,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "motif": movement.motif
    }
    
    # Update stock
    stocks[stock_index]["quantite_actuelle"] = new_qty
    stocks[stock_index]["dernier_mouvement"] = new_movement["date"]
    
    mouvements.append(new_movement)
    
    data["stocks"] = stocks
    data["mouvements"] = mouvements
    save_stocks(data)
    
    return {
        "status": "success",
        "mouvement": new_movement,
        "nouvelle_quantite": new_qty
    }


@app.get("/api/stocks/besoins/{semaine}")
def calculate_stock_needs(semaine: str, convives: int = 150):
    """
    Calculate stock needs based on planning for a given week.
    Aggregates ingredients from all planned recipes.
    
    Args:
        semaine: Week identifier (e.g., "S50" or "2024-W50")
        convives: Number of people to serve per meal (default 150)
    """
    data = load_stocks()
    stocks = data.get("stocks", [])
    
    # Create stock lookup by ingredient name (normalized)
    stock_lookup = {}
    for stock in stocks:
        nom = stock.get("produit_nom", "").lower().strip()
        # Also index by simplified names
        stock_lookup[nom] = stock
        # Add common variations
        for word in nom.split():
            if len(word) > 3:
                stock_lookup[word] = stock
    
    # Load recipes
    recipes = load_recipes(DATA_DIR / "recettes.json")
    recipe_lookup = {r.id: r for r in recipes}
    
    # Try to load planning data (stored in frontend localStorage, but we'll check for a planning.json)
    planning_file = DATA_DIR / "planning.json"
    planning_data = {}
    if planning_file.exists():
        with open(planning_file, "r", encoding="utf-8") as f:
            planning_data = json.load(f)
    
    # Aggregate ingredients from planned recipes
    ingredient_needs = {}
    planned_recipe_ids = []
    
    # If we have planning data, use it
    week_data = planning_data.get(semaine, {})
    if week_data:
        for day_key, day_data in week_data.items():
            if isinstance(day_data, dict):
                for meal_type, recipe_id in day_data.items():
                    if recipe_id and recipe_id in recipe_lookup:
                        planned_recipe_ids.append(recipe_id)
    
    # If no planning data, use sample recipes for demo
    if not planned_recipe_ids:
        # Demo: simulate a week with sample recipes (2 per day for 5 days)
        demo_recipes = ["r001", "r002", "r003", "r006", "r008", "r009", "r010", "r011"]
        for rid in demo_recipes:
            if rid in recipe_lookup:
                planned_recipe_ids.append(rid)
    
    # Aggregate ingredients
    for recipe_id in planned_recipe_ids:
        recipe = recipe_lookup.get(recipe_id)
        if not recipe:
            continue
        
        for ingredient in recipe.ingredients:
            ing_name = ingredient.get("nom", "").replace("_", " ").title()
            qty_per_portion = ingredient.get("quantite_kg", 0)
            qty_total = qty_per_portion * convives
            
            if ing_name not in ingredient_needs:
                ingredient_needs[ing_name] = {
                    "ingredient": ing_name,
                    "quantite_besoin": 0,
                    "unite": "kg",
                    "recettes": []
                }
            
            ingredient_needs[ing_name]["quantite_besoin"] += qty_total
            if recipe.nom not in ingredient_needs[ing_name]["recettes"]:
                ingredient_needs[ing_name]["recettes"].append(recipe.nom)
    
    # Compare with stock
    results = []
    for ing_name, need in ingredient_needs.items():
        # Find matching stock
        ing_lower = ing_name.lower().strip()
        stock = None
        
        # Try exact match first
        for s in stocks:
            s_name = s.get("produit_nom", "").lower()
            if ing_lower in s_name or s_name in ing_lower:
                stock = s
                break
            # Try partial match
            ing_words = ing_lower.split()
            s_words = s_name.split()
            if any(w in s_words for w in ing_words if len(w) > 3):
                stock = s
                break
        
        qty_stock = stock.get("quantite_actuelle", 0) if stock else 0
        qty_besoin = round(need["quantite_besoin"], 2)
        difference = round(qty_stock - qty_besoin, 2)
        
        results.append({
            "ingredient": need["ingredient"],
            "quantite_besoin": qty_besoin,
            "quantite_stock": qty_stock,
            "unite": need["unite"],
            "difference": difference,
            "statut": "ok" if difference >= 0 else "commander",
            "fournisseur": stock.get("fournisseur_nom", "Non défini") if stock else "Non défini",
            "stock_id": stock.get("id") if stock else None,
            "recettes": need["recettes"][:3]  # Show up to 3 recipes using this ingredient
        })
    
    # Sort by status (items to order first) then by quantity needed
    results.sort(key=lambda x: (0 if x["statut"] == "commander" else 1, -x["quantite_besoin"]))
    
    return {
        "semaine": semaine,
        "convives": convives,
        "nb_recettes": len(set(planned_recipe_ids)),
        "besoins": results,
        "a_commander": len([r for r in results if r["statut"] == "commander"])
    }


# Endpoint to save planning from frontend
@app.post("/api/planning")
def save_planning(planning: dict):
    """Save planning data to JSON file."""
    planning_file = DATA_DIR / "planning.json"
    with open(planning_file, "w", encoding="utf-8") as f:
        json.dump(planning, f, indent=2, ensure_ascii=False)
    return {"status": "success"}


@app.get("/api/planning")
def get_planning():
    """Get planning data."""
    planning_file = DATA_DIR / "planning.json"
    if planning_file.exists():
        with open(planning_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


# ============ FEEDBACK & RATING SYSTEM ============

class MenuRatingInput(BaseModel):
    menu_date: str  # Format: YYYY-MM-DD
    rating: int  # 1-5 carrots
    comment: Optional[str] = ""

def load_feedback():
    """Load feedback data from JSON file."""
    feedback_file = DATA_DIR / "feedback.json"
    if feedback_file.exists():
        with open(feedback_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"ratings": [], "menu_scores": {}, "meta": {"last_updated": None}}

def save_feedback(data: dict):
    """Save feedback data to JSON file."""
    data["meta"]["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(DATA_DIR / "feedback.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def calculate_popularity_score(ratings: List[dict]) -> float:
    """Calculate average popularity score from ratings."""
    if not ratings:
        return 0.0
    total = sum(r.get("rating", 0) for r in ratings)
    return round(total / len(ratings), 2)

@app.post("/api/feedback/rate")
def submit_rating(rating_input: MenuRatingInput):
    """Submit a rating for a menu."""
    # Validate rating
    if rating_input.rating < 1 or rating_input.rating > 5:
        raise HTTPException(status_code=400, detail="La note doit être entre 1 et 5 carottes")
    
    data = load_feedback()
    
    # Add new rating
    new_rating = {
        "id": f"rating_{len(data['ratings']) + 1:05d}",
        "menu_date": rating_input.menu_date,
        "rating": rating_input.rating,
        "comment": rating_input.comment,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    data["ratings"].append(new_rating)
    
    # Update menu score
    menu_ratings = [r for r in data["ratings"] if r["menu_date"] == rating_input.menu_date]
    popularity_score = calculate_popularity_score(menu_ratings)
    
    data["menu_scores"][rating_input.menu_date] = {
        "score": popularity_score,
        "total_ratings": len(menu_ratings),
        "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    save_feedback(data)
    
    return {
        "status": "success",
        "message": "Merci pour votre avis !",
        "rating": new_rating,
        "popularity_score": popularity_score,
        "total_ratings": len(menu_ratings)
    }

@app.get("/api/feedback/menu/{menu_date}")
def get_menu_feedback(menu_date: str):
    """Get all feedback for a specific menu date."""
    data = load_feedback()
    
    menu_ratings = [r for r in data["ratings"] if r["menu_date"] == menu_date]
    score_data = data["menu_scores"].get(menu_date, {
        "score": 0.0,
        "total_ratings": 0,
        "last_updated": None
    })
    
    return {
        "menu_date": menu_date,
        "popularity_score": score_data.get("score", 0.0),
        "total_ratings": score_data.get("total_ratings", 0),
        "ratings": menu_ratings,
        "last_updated": score_data.get("last_updated")
    }

@app.get("/api/feedback/stats")
def get_feedback_stats():
    """Get overall feedback statistics."""
    data = load_feedback()
    
    # Calculate stats
    total_ratings = len(data["ratings"])
    
    if total_ratings == 0:
        return {
            "total_ratings": 0,
            "average_score": 0.0,
            "top_menus": [],
            "recent_ratings": []
        }
    
    # Average score across all menus
    all_scores = [s["score"] for s in data["menu_scores"].values()]
    average_score = round(sum(all_scores) / len(all_scores), 2) if all_scores else 0.0
    
    # Top rated menus
    top_menus = sorted(
        [{"date": date, **score} for date, score in data["menu_scores"].items()],
        key=lambda x: (x["score"], x["total_ratings"]),
        reverse=True
    )[:10]
    
    # Recent ratings
    recent_ratings = sorted(
        data["ratings"],
        key=lambda x: x.get("timestamp", ""),
        reverse=True
    )[:20]
    
    return {
        "total_ratings": total_ratings,
        "average_score": average_score,
        "total_menus_rated": len(data["menu_scores"]),
        "top_menus": top_menus,
        "recent_ratings": recent_ratings
    }

@app.get("/api/qrcode/generate")
def generate_qr_code(menu_date: str, size: int = 300):
    """Generate QR code for menu feedback page."""
    import qrcode
    import io
    import base64
    from fastapi.responses import Response
    
    # Build feedback URL
    feedback_url = f"http://localhost:8000/feedback.html?date={menu_date}"
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(feedback_url)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Resize if needed
    if size != 300:
        img = img.resize((size, size))
    
    # Convert to bytes
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    
    # Return as base64 for easy embedding
    img_base64 = base64.b64encode(img_io.getvalue()).decode()
    
    return {
        "status": "success",
        "menu_date": menu_date,
        "qr_code_base64": f"data:image/png;base64,{img_base64}",
        "feedback_url": feedback_url
    }


# ============ ORDER GENERATION ============

def load_orders():
    """Load orders from JSON file."""
    orders_file = DATA_DIR / "commandes.json"
    if orders_file.exists():
        with open(orders_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"commandes": [], "meta": {"last_updated": None}}


def save_orders(data: dict):
    """Save orders to JSON file."""
    data["meta"]["last_updated"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    with open(DATA_DIR / "commandes.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@app.get("/api/commandes")
def get_orders(statut: str = ""):
    """Get all orders, optionally filtered by status."""
    data = load_orders()
    orders = data.get("commandes", [])
    
    if statut:
        orders = [o for o in orders if o.get("statut") == statut]
    
    return {
        "count": len(orders),
        "commandes": orders
    }


class OrderLineInput(BaseModel):
    produit_nom: str
    quantite: float
    unite: str
    stock_id: Optional[str] = None


class GenerateOrderInput(BaseModel):
    semaine: str
    items: List[OrderLineInput]


@app.post("/api/commandes/generer")
def generate_orders(input_data: GenerateOrderInput):
    """
    Generate orders from stock needs, grouped by supplier.
    Each supplier gets a separate order.
    """
    data = load_orders()
    orders = data.get("commandes", [])
    stocks_data = load_stocks()
    stocks = stocks_data.get("stocks", [])
    
    # Group items by supplier
    by_supplier = {}
    
    for item in input_data.items:
        # Find the stock to get supplier info
        stock = None
        if item.stock_id:
            stock = next((s for s in stocks if s.get("id") == item.stock_id), None)
        
        # Get supplier info
        fournisseur_id = stock.get("fournisseur_id", "unknown") if stock else "unknown"
        fournisseur_nom = stock.get("fournisseur_nom", "Non défini") if stock else "Non défini"
        
        if fournisseur_id not in by_supplier:
            by_supplier[fournisseur_id] = {
                "fournisseur_id": fournisseur_id,
                "fournisseur_nom": fournisseur_nom,
                "lignes": []
            }
        
        by_supplier[fournisseur_id]["lignes"].append({
            "produit_nom": item.produit_nom,
            "quantite": item.quantite,
            "unite": item.unite,
            "stock_id": item.stock_id
        })
    
    # Create orders
    new_orders = []
    order_num = len(orders) + 1
    
    for fournisseur_id, order_data in by_supplier.items():
        order_id = f"CMD-{datetime.now().strftime('%Y%m%d')}-{order_num:03d}"
        
        new_order = {
            "id": order_id,
            "date_creation": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "semaine": input_data.semaine,
            "fournisseur_id": fournisseur_id,
            "fournisseur_nom": order_data["fournisseur_nom"],
            "lignes": order_data["lignes"],
            "nb_produits": len(order_data["lignes"]),
            "statut": "brouillon"
        }
        
        orders.append(new_order)
        new_orders.append(new_order)
        order_num += 1
    
    data["commandes"] = orders
    save_orders(data)
    
    return {
        "status": "success",
        "message": f"{len(new_orders)} commande(s) créée(s)",
        "commandes": new_orders
    }


@app.get("/api/commandes/{order_id}")
def get_order(order_id: str):
    """Get a specific order by ID."""
    data = load_orders()
    for order in data.get("commandes", []):
        if order.get("id") == order_id:
            return order
    raise HTTPException(status_code=404, detail=f"Commande {order_id} non trouvée")


@app.put("/api/commandes/{order_id}/statut")
def update_order_status(order_id: str, statut: str):
    """Update order status (brouillon, envoyee, livree, annulee)."""
    data = load_orders()
    orders = data.get("commandes", [])
    
    valid_statuts = ["brouillon", "envoyee", "livree", "annulee"]
    if statut not in valid_statuts:
        raise HTTPException(status_code=400, detail=f"Statut invalide. Valeurs: {valid_statuts}")
    
    for i, order in enumerate(orders):
        if order.get("id") == order_id:
            orders[i]["statut"] = statut
            if statut == "envoyee":
                orders[i]["date_envoi"] = datetime.now().strftime("%Y-%m-%d %H:%M")
            elif statut == "livree":
                orders[i]["date_livraison"] = datetime.now().strftime("%Y-%m-%d %H:%M")
            
            data["commandes"] = orders
            save_orders(data)
            return {"status": "success", "commande": orders[i]}
    
    raise HTTPException(status_code=404, detail=f"Commande {order_id} non trouvée")


@app.delete("/api/commandes/{order_id}")
def delete_order(order_id: str):
    """Delete an order."""
    data = load_orders()
    orders = data.get("commandes", [])
    
    for i, order in enumerate(orders):
        if order.get("id") == order_id:
            deleted = orders.pop(i)
            data["commandes"] = orders
            save_orders(data)
            return {"status": "success", "deleted": deleted}
    
    raise HTTPException(status_code=404, detail=f"Commande {order_id} non trouvée")

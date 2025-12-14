"""
Cantine.OS - Supplier OCR Module
Uses Gemini Vision API to extract supplier data from invoices/catalogs
"""

import re
import base64
import json
import csv
import io
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional

# Gemini API Configuration (shared with ocr_menu.py)
GEMINI_API_KEY = "AIzaSyAy8ozSFVyNc-JkXXowUO8h-ME2uuACHXM"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"


def extract_supplier_from_image(image_path: str) -> Dict[str, Any]:
    """
    Extract supplier and product data from an image (invoice, catalog, price list).
    Uses Gemini Vision API for intelligent extraction.
    
    Returns:
        {
            "success": bool,
            "supplier": { "nom": str, "contact": {...}, ... },
            "products": [ { "nom": str, "prix_unitaire": float, ... }, ... ],
            "raw_text": str,
            "confidence": float
        }
    """
    try:
        # Read and encode image to base64
        with open(image_path, "rb") as image_file:
            image_data = base64.standard_b64encode(image_file.read()).decode("utf-8")
        
        # Determine MIME type
        ext = Path(image_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        mime_type = mime_types.get(ext, 'image/jpeg')
        
        # Build the prompt for supplier/invoice OCR
        prompt = """Tu es un expert en extraction de données de factures et catalogues fournisseurs.

Analyse cette image et extrais les informations suivantes de manière structurée.

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{
    "raw_text": "Le texte brut extrait de l'image",
    "supplier": {
        "nom": "Nom du fournisseur",
        "contact": {
            "email": "email si visible",
            "telephone": "téléphone si visible"
        },
        "localisation": {
            "adresse": "adresse si visible",
            "ville": "ville si visible",
            "code_postal": "code postal si visible"
        }
    },
    "products": [
        {
            "nom": "Nom du produit",
            "reference": "Référence/code produit si présent",
            "categorie": "legumes|fruits|viande|poisson|epicerie|produit_laitier|autre",
            "unite": "kg|litre|piece|douzaine|carton",
            "prix_unitaire": 0.00,
            "bio": false,
            "origine": "origine si mentionnée"
        }
    ]
}

Règles:
- Extrais TOUS les produits listés avec leurs prix
- Devine la catégorie à partir du nom du produit
- L'unité par défaut est "kg" sauf indication contraire
- Convertis les prix en nombres décimaux (ex: "2,50 €" → 2.50)
- Si tu ne trouves pas une information, mets une chaîne vide ou null
- Ignore les textes administratifs (mentions légales, conditions de vente)"""

        # Build API request
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
                "maxOutputTokens": 8192
            }
        }
        
        # Call Gemini API
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=60
        )
        
        if response.status_code != 200:
            print(f"❌ Gemini API error: {response.status_code} - {response.text}")
            return {"success": False, "error": f"API Error: {response.status_code}"}
        
        result = response.json()
        
        # Extract the generated text
        if "candidates" in result and len(result["candidates"]) > 0:
            content = result["candidates"][0].get("content", {})
            parts = content.get("parts", [])
            if parts:
                text_response = parts[0].get("text", "")
                
                # Parse JSON from response (handle markdown code blocks)
                json_text = text_response
                if "```json" in json_text:
                    json_text = json_text.split("```json")[1].split("```")[0]
                elif "```" in json_text:
                    json_text = json_text.split("```")[1].split("```")[0]
                
                try:
                    parsed = json.loads(json_text.strip())
                    
                    # Normalize products
                    products = []
                    for p in parsed.get("products", []):
                        products.append({
                            "nom": p.get("nom", "Produit inconnu"),
                            "reference": p.get("reference", ""),
                            "categorie": p.get("categorie", "autre"),
                            "unite": p.get("unite", "kg"),
                            "prix_unitaire": float(p.get("prix_unitaire", 0) or 0),
                            "bio": bool(p.get("bio", False)),
                            "origine": p.get("origine", ""),
                            "disponibilite_mois": list(range(1, 13)),  # Default all year
                            "allergenes": []
                        })
                    
                    print(f"✅ Supplier OCR extraction réussie: {len(products)} produits")
                    return {
                        "success": True,
                        "supplier": parsed.get("supplier", {}),
                        "products": products,
                        "raw_text": parsed.get("raw_text", ""),
                        "confidence": 0.90,
                        "ocr_engine": "gemini"
                    }
                except json.JSONDecodeError as e:
                    print(f"⚠️ JSON parse error: {e}")
                    return {
                        "success": False,
                        "raw_text": text_response,
                        "error": f"JSON parse error: {e}",
                        "products": [],
                        "confidence": 0.3,
                        "ocr_engine": "gemini"
                    }
        
        return {"success": False, "error": "No content in Gemini response"}
        
    except Exception as e:
        print(f"❌ Supplier OCR error: {str(e)}")
        return {"success": False, "error": str(e)}


def parse_csv_products(csv_content: str) -> Dict[str, Any]:
    """
    Parse CSV content to extract product list.
    
    Expected columns: nom, categorie, unite, prix_unitaire, bio, origine
    Optional: reference, allergenes, disponibilite_mois
    
    Returns:
        {
            "success": bool,
            "products": [...],
            "errors": [...]
        }
    """
    products = []
    errors = []
    
    try:
        # Try to detect delimiter
        sample = csv_content[:1000]
        delimiter = ';' if sample.count(';') > sample.count(',') else ','
        
        reader = csv.DictReader(io.StringIO(csv_content), delimiter=delimiter)
        
        # Normalize column names (lowercase, strip)
        if reader.fieldnames:
            reader.fieldnames = [f.lower().strip() for f in reader.fieldnames]
        
        for i, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
            try:
                # Normalize field access
                row = {k.lower().strip(): v for k, v in row.items() if k}
                
                nom = row.get('nom', row.get('name', row.get('produit', ''))).strip()
                if not nom:
                    errors.append(f"Ligne {i}: nom manquant")
                    continue
                
                # Parse price (handle French format: 2,50)
                prix_str = row.get('prix_unitaire', row.get('prix', row.get('price', '0')))
                prix_str = str(prix_str).replace(',', '.').replace('€', '').strip()
                try:
                    prix = float(prix_str) if prix_str else 0
                except ValueError:
                    prix = 0
                    errors.append(f"Ligne {i}: prix invalide '{prix_str}'")
                
                # Parse bio (handle various formats)
                bio_str = str(row.get('bio', 'false')).lower().strip()
                bio = bio_str in ('true', '1', 'oui', 'yes', 'o', 'x')
                
                product = {
                    "nom": nom,
                    "reference": row.get('reference', row.get('ref', '')).strip(),
                    "categorie": row.get('categorie', row.get('category', 'autre')).strip() or 'autre',
                    "unite": row.get('unite', row.get('unit', 'kg')).strip() or 'kg',
                    "prix_unitaire": prix,
                    "bio": bio,
                    "origine": row.get('origine', row.get('origin', '')).strip(),
                    "disponibilite_mois": list(range(1, 13)),
                    "allergenes": []
                }
                
                # Parse allergenes if present
                allergenes_str = row.get('allergenes', row.get('allergens', ''))
                if allergenes_str:
                    product["allergenes"] = [a.strip() for a in allergenes_str.split(',') if a.strip()]
                
                products.append(product)
                
            except Exception as e:
                errors.append(f"Ligne {i}: {str(e)}")
        
        return {
            "success": len(products) > 0,
            "products": products,
            "errors": errors,
            "count": len(products)
        }
        
    except Exception as e:
        return {
            "success": False,
            "products": [],
            "errors": [f"Erreur de parsing CSV: {str(e)}"],
            "count": 0
        }


if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("Cantine.OS - Supplier OCR")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("Usage: python ocr_supplier.py <image_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    print(f"📄 Fichier: {file_path}\n")
    
    result = extract_supplier_from_image(file_path)
    
    print(f"✅ Succès: {result.get('success')}")
    print(f"📦 Produits: {len(result.get('products', []))}")
    
    if result.get("supplier"):
        print(f"🏪 Fournisseur: {result['supplier'].get('nom', 'Non détecté')}")
    
    for p in result.get("products", [])[:5]:
        print(f"   • {p['nom']} - {p['prix_unitaire']}€/{p['unite']}")

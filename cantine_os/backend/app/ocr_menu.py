"""
Cantine.OS - Menu OCR Module
Uses Gemini Vision API for OCR with EasyOCR as fallback
"""

import re
import base64
import json
import requests
from pathlib import Path
from typing import Optional, Dict, Any, List
from dataclasses import dataclass, field

# Gemini API Configuration
GEMINI_API_KEY = "AIzaSyBHU2IHed8PC6hUtceX75o0wCC7r6nYX68"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

try:
    from PIL import Image, ImageEnhance
    PILLOW_AVAILABLE = True
except ImportError:
    PILLOW_AVAILABLE = False

try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

OLMOCR_AVAILABLE = PILLOW_AVAILABLE and EASYOCR_AVAILABLE

# Global reader instance (loaded once)
_reader = None


def get_reader():
    """Get or create EasyOCR reader (lazy loading)."""
    global _reader
    if _reader is None and EASYOCR_AVAILABLE:
        print("🔄 Chargement du modèle EasyOCR...")
        _reader = easyocr.Reader(['fr', 'en'], gpu=False, verbose=False)
        print("✅ EasyOCR prêt")
    return _reader


def extract_text_with_gemini(image_path: str) -> Dict[str, Any]:
    """
    Extract text from menu image using Gemini Vision API.
    Returns structured menu data.
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
        
        # Build the prompt for menu OCR
        prompt = """Tu es un expert en OCR spécialisé dans les menus de cantine scolaire.

Analyse cette image de menu et extrais TOUTES les informations de manière structurée.

Réponds UNIQUEMENT avec un JSON valide au format suivant:
{
    "raw_text": "Le texte brut extrait de l'image ligne par ligne",
    "menu_items": [
        {
            "name": "Nom du plat",
            "category": "entree|plat|garniture|dessert|laitage|pain|autre",
            "vegetarian": true/false,
            "bio": true/false,
            "day": "Lundi|Mardi|Mercredi|Jeudi|Vendredi|Non spécifié"
        }
    ],
    "menu_by_day": {
        "Lundi": [...],
        "Mardi": [...]
    }
}

Règles:
- Identifie les jours de la semaine pour regrouper les plats
- Détecte les mentions BIO, végétarien, local
- Catégorise chaque plat: entrée, plat principal, garniture, dessert, laitage, pain
- Les plats sans viande/poisson sont végétariens
- Ignore les textes administratifs (allergènes, dates, logos)
- Extrais TOUS les plats visibles"""

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
                "maxOutputTokens": 4096
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
                    parsed["success"] = True
                    parsed["confidence"] = 0.95  # High confidence for Gemini
                    parsed["language"] = "fr"
                    parsed["ocr_engine"] = "gemini"
                    print("✅ Gemini OCR extraction réussie")
                    return parsed
                except json.JSONDecodeError as e:
                    print(f"⚠️ JSON parse error: {e}")
                    # Return raw text if JSON parsing fails
                    return {
                        "success": True,
                        "raw_text": text_response,
                        "menu_items": [],
                        "menu_by_day": {},
                        "confidence": 0.7,
                        "language": "fr",
                        "ocr_engine": "gemini"
                    }
        
        return {"success": False, "error": "No content in Gemini response"}
        
    except Exception as e:
        print(f"❌ Gemini OCR error: {str(e)}")
        return {"success": False, "error": str(e)}


@dataclass
class MenuItem:
    """A single menu item."""
    name: str
    category: str = ""  # entree, plat, garniture, dessert, laitage, pain
    vegetarian: bool = False
    bio: bool = False
    local: bool = False
    day: str = ""


@dataclass 
class MenuOCRResult:
    """Result from OCR extraction of a menu."""
    raw_text: str
    menu_items: List[Dict[str, Any]]
    menu_by_day: Dict[str, List[Dict[str, Any]]] = field(default_factory=dict)
    language: str = "fr"
    is_valid: bool = False
    confidence: float = 0.0


class MenuOCRProcessor:
    """OCR processor with intelligent French menu parsing."""
    
    # Words to ignore (not food items)
    SKIP_WORDS = {
        'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
        'menu', 'semaine', 'septembre', 'octobre', 'novembre', 'décembre',
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
        'bonne', 'rentrée', 'caisse', 'école', 'ecole', 'cantine',
        'bio*', 'aop*', 'origine', 'française', 'francaise', 'france',
        'produits', 'subventionnés', 'subventionnes', 'programme', 'union', 
        'européenne', 'europeenne', 'destination', 'écoles', 'ecoles',
        'réglementation', 'allergènes', 'allergenes', 'préparations', 
        'disponibilité', 'disponibilite', 'modifiés', 'modifies',
        'susceptibles', 'présents', 'presents', 'toutes', 'préparations',
        'cadre', 'charge', 'matin', 'midi', 'cuisinent', 'équipes',
        'qualité', 'frais', 'peuvent', 'être', 'selon', 'part'
    }
    
    # Food categories
    ENTREES = ['salade', 'crudités', 'concombre', 'carottes râpées', 'tomates', 
               'betterave', 'céleri', 'macédoine', 'avocat', 'radis', 'taboulé',
               'vinaigrette', 'chou', 'potage', 'soupe', 'velouté']
    
    PLATS = ['poulet', 'bœuf', 'boeuf', 'veau', 'porc', 'agneau', 'dinde', 'canard',
             'poisson', 'cabillaud', 'saumon', 'colin', 'thon', 'merlu', 'lieu',
             'steak', 'escalope', 'rôti', 'grillé', 'émincé', 'blanquette',
             'lasagne', 'bolognaise', 'hachis', 'parmentier', 'couscous',
             'paella', 'nuggets', 'cordon bleu', 'filet', 'aiguillettes',
             'omelette', 'quiche', 'crêpe salée', 'chili', 'curry']
    
    GARNITURES = ['riz', 'pâtes', 'purée', 'frites', 'pommes de terre', 'gratin',
                  'haricots verts', 'petits pois', 'lentilles', 'légumes',
                  'carottes', 'courgettes', 'épinards', 'brocolis', 'chou-fleur',
                  'ratatouille', 'jardinière', 'semoule', 'blé', 'quinoa']
    
    DESSERTS = ['compote', 'fruit', 'pomme', 'poire', 'banane', 'orange', 'kiwi',
                'fraise', 'gâteau', 'tarte', 'mousse', 'crème', 'flan', 'clafoutis',
                'brownie', 'cookie', 'madeleine', 'quatre-quarts', 'prunes',
                'abricot', 'pêche', 'raisin', 'clémentine', 'melon', 'pastèque']
    
    LAITAGES = ['yaourt', 'fromage', 'fromage blanc', 'petit suisse', 
                'camembert', 'emmental', 'comté', 'brie', 'chèvre',
                'mimolette', 'saint-nectaire', 'babybel', 'kiri', 'vache qui rit']
    
    PAINS = ['pain', 'baguette', 'pain de campagne', 'pain complet', 'pain sésame']

    def process_image(self, image_path: str) -> MenuOCRResult:
        """Extract menu content from an image file."""
        if not PILLOW_AVAILABLE:
            return self._error("Pillow non installé")
        if not EASYOCR_AVAILABLE:
            return self._error("EasyOCR non installé. Run: pip install easyocr")

        return self._process_with_easyocr(image_path)

    def process_pdf(self, pdf_path: str, page: int = 1) -> MenuOCRResult:
        """Extract menu content from a PDF."""
        try:
            from pdf2image import convert_from_path
            images = convert_from_path(pdf_path, first_page=page, last_page=page, dpi=200)
            if images:
                temp_path = Path(pdf_path).with_suffix('.temp.png')
                images[0].save(temp_path)
                result = self._process_with_easyocr(str(temp_path))
                temp_path.unlink(missing_ok=True)
                return result
        except ImportError:
            pass
        return self._error("Installez pdf2image pour traiter les PDF")

    def _error(self, msg: str) -> MenuOCRResult:
        return MenuOCRResult(raw_text=msg, menu_items=[], is_valid=False, confidence=0.0)

    def _process_with_easyocr(self, image_path: str) -> MenuOCRResult:
        """Process image with EasyOCR."""
        reader = get_reader()
        if reader is None:
            return self._error("EasyOCR reader not available")

        try:
            results = reader.readtext(image_path)
            
            texts = []
            total_confidence = 0
            for (bbox, text, confidence) in results:
                if confidence > 0.3:
                    texts.append(text.strip())
                    total_confidence += confidence
            
            raw_text = "\n".join(texts)
            avg_confidence = total_confidence / len(results) if results else 0
            
            # Parse menu with improved logic
            items, menu_by_day = self._parse_menu_intelligent(raw_text)
            
            return MenuOCRResult(
                raw_text=raw_text,
                menu_items=items,
                menu_by_day=menu_by_day,
                language="fr",
                is_valid=len(items) > 0,
                confidence=avg_confidence
            )
            
        except Exception as e:
            return self._error(f"OCR error: {str(e)}")

    def _parse_menu_intelligent(self, text: str) -> tuple:
        """Parse OCR text intelligently to extract clean menu items."""
        items = []
        menu_by_day = {}
        seen = set()
        current_day = "Non spécifié"
        
        # Day detection pattern
        day_pattern = re.compile(r'\b(lundi|mardi|mercredi|jeudi|vendredi)\b', re.IGNORECASE)
        
        # Clean and split text
        lines = text.split('\n')
        
        for line in lines:
            line_clean = line.strip()
            if not line_clean or len(line_clean) < 3:
                continue
            
            # Check for day
            day_match = day_pattern.search(line_clean)
            if day_match:
                current_day = day_match.group(1).capitalize()
                if current_day not in menu_by_day:
                    menu_by_day[current_day] = []
                continue
            
            # Clean the line
            item_text = self._clean_text(line_clean)
            if not item_text or len(item_text) < 3:
                continue
            
            # Skip non-food words
            if self._should_skip(item_text):
                continue
            
            # Check if it's a food item
            category = self._categorize_item(item_text)
            if category or self._looks_like_food(item_text):
                # Create item
                name_clean = self._format_name(item_text)
                key = name_clean.lower()
                
                if key not in seen and len(name_clean) >= 3:
                    seen.add(key)
                    
                    item = {
                        "name": name_clean,
                        "category": category or "autre",
                        "vegetarian": self._is_vegetarian(item_text),
                        "bio": 'bio' in item_text.lower(),
                        "local": False,
                        "day": current_day,
                        "price": None
                    }
                    
                    items.append(item)
                    
                    if current_day not in menu_by_day:
                        menu_by_day[current_day] = []
                    menu_by_day[current_day].append(item)
        
        return items, menu_by_day

    def _clean_text(self, text: str) -> str:
        """Clean OCR text artifacts."""
        # Remove common OCR artifacts
        text = re.sub(r'BIO\*?|AOP\*?|\*|\(\*\)|\[.*?\]', '', text, flags=re.IGNORECASE)
        text = re.sub(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', '', text)  # Dates
        text = re.sub(r'\b\d{4,}\b', '', text)  # Long numbers
        text = re.sub(r'1al|1AI|IAI', '', text, flags=re.IGNORECASE)  # Common OCR errors
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _should_skip(self, text: str) -> bool:
        """Check if text should be skipped."""
        text_lower = text.lower()
        
        # Skip if too many skip words
        word_count = len(text_lower.split())
        skip_count = sum(1 for word in self.SKIP_WORDS if word in text_lower)
        
        if skip_count >= word_count / 2 and word_count <= 4:
            return True
        
        # Skip single skip words
        if text_lower.strip() in self.SKIP_WORDS:
            return True
        
        # Skip very short or very long
        if len(text) < 4 or len(text) > 80:
            return True
            
        return False

    def _categorize_item(self, text: str) -> str:
        """Categorize a food item."""
        text_lower = text.lower()
        
        for item in self.ENTREES:
            if item in text_lower:
                return "entree"
        
        for item in self.PLATS:
            if item in text_lower:
                return "plat"
        
        for item in self.GARNITURES:
            if item in text_lower:
                return "garniture"
        
        for item in self.DESSERTS:
            if item in text_lower:
                return "dessert"
        
        for item in self.LAITAGES:
            if item in text_lower:
                return "laitage"
        
        for item in self.PAINS:
            if item in text_lower:
                return "pain"
        
        return ""

    def _looks_like_food(self, text: str) -> bool:
        """Check if text looks like a food item."""
        text_lower = text.lower()
        
        # Food indicators
        food_words = [
            'sauce', 'grillé', 'rôti', 'sauté', 'vapeur', 'poêlé',
            'maison', 'frais', 'cru', 'cuit', 'farci', 'émincé',
            'au', 'aux', 'à la', 'du', 'de la', 'des',
            'curry', 'provençale', 'normande', 'basque', 'nature'
        ]
        
        for word in food_words:
            if word in text_lower:
                return True
        
        # Check if contains any food category word
        all_food = (self.ENTREES + self.PLATS + self.GARNITURES + 
                   self.DESSERTS + self.LAITAGES + self.PAINS)
        for food in all_food:
            if food in text_lower:
                return True
        
        return False

    def _is_vegetarian(self, text: str) -> bool:
        """Check if item is vegetarian."""
        text_lower = text.lower()
        
        # Non-vegetarian items
        meat_words = ['poulet', 'bœuf', 'boeuf', 'veau', 'porc', 'agneau', 
                     'dinde', 'canard', 'poisson', 'cabillaud', 'saumon', 
                     'colin', 'thon', 'merlu', 'steak', 'viande', 'jambon',
                     'lardons', 'bacon', 'saucisse', 'nuggets', 'bolognaise']
        
        if any(meat in text_lower for meat in meat_words):
            return False
        
        # Vegetarian items
        veg_words = ['légumes', 'lentilles', 'salade', 'compote', 'fruit',
                    'omelette', 'haricots', 'petits pois', 'purée', 'riz', 
                    'pâtes', 'yaourt', 'fromage', 'sin carne', 'végé', 
                    'concombre', 'tomates', 'carottes', 'épinards', 'gratin']
        
        return any(veg in text_lower for veg in veg_words)

    def _format_name(self, text: str) -> str:
        """Format item name properly."""
        # Title case with exceptions
        text = text.strip()
        words = text.split()
        
        small_words = {'de', 'du', 'des', 'la', 'le', 'les', 'au', 'aux', 'à', 'et'}
        
        result = []
        for i, word in enumerate(words):
            if i == 0 or word.lower() not in small_words:
                result.append(word.capitalize())
            else:
                result.append(word.lower())
        
        return ' '.join(result)


# API Functions
_processor: Optional[MenuOCRProcessor] = None

def get_ocr_processor() -> MenuOCRProcessor:
    global _processor
    if _processor is None:
        _processor = MenuOCRProcessor()
    return _processor

def extract_menu_from_image(image_path: str, use_gemini: bool = True) -> Dict[str, Any]:
    """
    Extract menu from image using Gemini Vision API (primary) or EasyOCR (fallback).
    
    Args:
        image_path: Path to the image file
        use_gemini: If True, try Gemini first (default: True)
    """
    # Try Gemini first if enabled
    if use_gemini:
        print("🤖 Utilisation de Gemini Vision API pour l'OCR...")
        gemini_result = extract_text_with_gemini(image_path)
        
        if gemini_result.get("success"):
            return gemini_result
        else:
            print(f"⚠️ Gemini OCR échoué, fallback sur EasyOCR: {gemini_result.get('error', 'Unknown error')}")
    
    # Fallback to EasyOCR
    print("📝 Utilisation de EasyOCR...")
    result = get_ocr_processor().process_image(image_path)
    return {
        "success": result.is_valid,
        "confidence": result.confidence,
        "language": result.language,
        "menu_items": result.menu_items,
        "menu_by_day": result.menu_by_day,
        "raw_text": result.raw_text,
        "ocr_engine": "easyocr"
    }

def extract_menu_from_pdf(pdf_path: str, page: int = 1) -> Dict[str, Any]:
    result = get_ocr_processor().process_pdf(pdf_path, page)
    return {
        "success": result.is_valid,
        "confidence": result.confidence,
        "language": result.language,
        "menu_items": result.menu_items,
        "menu_by_day": result.menu_by_day,
        "raw_text": result.raw_text
    }


if __name__ == "__main__":
    import sys
    
    print("=" * 60)
    print("Cantine.OS - Menu OCR (EasyOCR)")
    print("=" * 60)
    
    if len(sys.argv) < 2:
        print("Usage: python ocr_menu.py <image_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    print(f"📄 Fichier: {file_path}\n")
    
    result = extract_menu_from_image(file_path)
    
    print(f"✅ Succès: {result['success']}")
    print(f"🎯 Confiance: {result['confidence']:.0%}")
    
    # Display by day
    print(f"\n📋 MENU EXTRAIT ({len(result['menu_items'])} items)")
    print("=" * 60)
    
    for day, items in result.get('menu_by_day', {}).items():
        print(f"\n🗓️  {day.upper()}")
        print("-" * 30)
        for item in items:
            veg = " 🌱" if item.get('vegetarian') else ""
            bio = " [BIO]" if item.get('bio') else ""
            cat = f" ({item.get('category', '')})" if item.get('category') else ""
            print(f"   • {item['name']}{cat}{veg}{bio}")
    
    print(f"\n📝 Texte brut extrait:\n{'-'*40}\n{result['raw_text'][:800]}...")

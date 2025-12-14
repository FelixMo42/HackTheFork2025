/**
 * Cantine.OS - Frontend Application
 * Main JavaScript for the dashboard
 */

// ============================================
// CONFIGURATION
// ============================================

const API_URL = 'http://localhost:8000/api';

// Full recipes data from recettes.json (fallback when API is not available)
const RECIPES_DATA = [
    {
        id: 'r001', nom: 'Lentilles corail au curry', type: 'plat_principal',
        vegetarien: true, bio: true, local: false,
        cout_portion_euro: 0.55,
        ingredients: [
            { nom: 'lentilles_corail', quantite_kg: 0.08, cout_euro_kg: 4.50 },
            { nom: 'lait_coco', quantite_kg: 0.03, cout_euro_kg: 3.20 },
            { nom: 'curry', quantite_kg: 0.005, cout_euro_kg: 25.00 },
            { nom: 'oignon', quantite_kg: 0.02, cout_euro_kg: 1.50 }
        ],
        nutrition: { proteines_g: 12, lipides_g: 8, glucides_g: 25, fer_mg: 3.5, calcium_mg: 40, fibres_g: 8 },
        co2_kg_portion: 0.35, tags: ['legumineuses', 'sans_gluten']
    },
    {
        id: 'r002', nom: 'Poulet rôti aux herbes', type: 'plat_principal',
        vegetarien: false, bio: false, local: true,
        cout_portion_euro: 1.15,
        ingredients: [
            { nom: 'poulet', quantite_kg: 0.12, cout_euro_kg: 8.50 },
            { nom: 'herbes_provence', quantite_kg: 0.002, cout_euro_kg: 30.00 },
            { nom: 'huile_olive', quantite_kg: 0.01, cout_euro_kg: 8.00 }
        ],
        nutrition: { proteines_g: 28, lipides_g: 12, glucides_g: 0, fer_mg: 1.2, calcium_mg: 15, fibres_g: 0 },
        co2_kg_portion: 2.80, tags: ['viande', 'sans_gluten']
    },
    {
        id: 'r003', nom: 'Gratin de courgettes aux lentilles', type: 'plat_principal',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.82,
        ingredients: [
            { nom: 'courgettes', quantite_kg: 0.15, cout_euro_kg: 2.50 },
            { nom: 'lentilles_vertes', quantite_kg: 0.06, cout_euro_kg: 3.80 },
            { nom: 'fromage_rape', quantite_kg: 0.03, cout_euro_kg: 12.00 },
            { nom: 'creme_fraiche', quantite_kg: 0.02, cout_euro_kg: 5.00 }
        ],
        nutrition: { proteines_g: 14, lipides_g: 10, glucides_g: 18, fer_mg: 4.0, calcium_mg: 120, fibres_g: 6 },
        co2_kg_portion: 0.55, tags: ['legumineuses', 'legumes']
    },
    {
        id: 'r004', nom: 'Filet de cabillaud sauce citron', type: 'plat_principal',
        vegetarien: false, bio: false, local: false,
        cout_portion_euro: 1.72,
        ingredients: [
            { nom: 'cabillaud', quantite_kg: 0.10, cout_euro_kg: 15.00 },
            { nom: 'citron', quantite_kg: 0.02, cout_euro_kg: 3.00 },
            { nom: 'beurre', quantite_kg: 0.015, cout_euro_kg: 10.00 }
        ],
        nutrition: { proteines_g: 22, lipides_g: 8, glucides_g: 1, fer_mg: 0.5, calcium_mg: 20, fibres_g: 0 },
        co2_kg_portion: 1.80, tags: ['poisson', 'qualite']
    },
    {
        id: 'r005', nom: 'Omelette aux fines herbes', type: 'plat_principal',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.72,
        ingredients: [
            { nom: 'oeufs', quantite_kg: 0.12, cout_euro_kg: 4.50 },
            { nom: 'ciboulette', quantite_kg: 0.005, cout_euro_kg: 20.00 },
            { nom: 'persil', quantite_kg: 0.005, cout_euro_kg: 15.00 }
        ],
        nutrition: { proteines_g: 14, lipides_g: 11, glucides_g: 1, fer_mg: 2.0, calcium_mg: 55, fibres_g: 0 },
        co2_kg_portion: 0.95, tags: ['oeufs', 'sans_gluten']
    },
    {
        id: 'r006', nom: 'Carottes râpées vinaigrette', type: 'entree',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.22,
        ingredients: [
            { nom: 'carottes', quantite_kg: 0.10, cout_euro_kg: 1.80 },
            { nom: 'huile_colza', quantite_kg: 0.01, cout_euro_kg: 4.50 },
            { nom: 'vinaigre', quantite_kg: 0.005, cout_euro_kg: 2.00 }
        ],
        nutrition: { proteines_g: 1, lipides_g: 5, glucides_g: 8, fer_mg: 0.4, calcium_mg: 35, fibres_g: 3 },
        co2_kg_portion: 0.15, tags: ['crudites', 'legumes']
    },
    {
        id: 'r007', nom: 'Salade de tomates mozzarella', type: 'entree',
        vegetarien: true, bio: false, local: true,
        cout_portion_euro: 0.86,
        ingredients: [
            { nom: 'tomates', quantite_kg: 0.12, cout_euro_kg: 3.50 },
            { nom: 'mozzarella', quantite_kg: 0.04, cout_euro_kg: 9.00 },
            { nom: 'basilic', quantite_kg: 0.002, cout_euro_kg: 40.00 }
        ],
        nutrition: { proteines_g: 8, lipides_g: 9, glucides_g: 5, fer_mg: 0.6, calcium_mg: 180, fibres_g: 1.5 },
        co2_kg_portion: 0.65, tags: ['crudites', 'calcium']
    },
    {
        id: 'r008', nom: 'Purée de pommes de terre', type: 'garniture',
        vegetarien: true, bio: false, local: true,
        cout_portion_euro: 0.38,
        ingredients: [
            { nom: 'pommes_de_terre', quantite_kg: 0.15, cout_euro_kg: 1.20 },
            { nom: 'lait', quantite_kg: 0.03, cout_euro_kg: 1.10 },
            { nom: 'beurre', quantite_kg: 0.015, cout_euro_kg: 10.00 }
        ],
        nutrition: { proteines_g: 4, lipides_g: 6, glucides_g: 28, fer_mg: 1.0, calcium_mg: 45, fibres_g: 2 },
        co2_kg_portion: 0.25, tags: ['feculents']
    },
    {
        id: 'r009', nom: 'Haricots verts persillés', type: 'garniture',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.66,
        ingredients: [
            { nom: 'haricots_verts', quantite_kg: 0.12, cout_euro_kg: 4.00 },
            { nom: 'persil', quantite_kg: 0.005, cout_euro_kg: 15.00 },
            { nom: 'beurre', quantite_kg: 0.01, cout_euro_kg: 10.00 }
        ],
        nutrition: { proteines_g: 2.5, lipides_g: 4, glucides_g: 6, fer_mg: 1.5, calcium_mg: 50, fibres_g: 4 },
        co2_kg_portion: 0.30, tags: ['legumes']
    },
    {
        id: 'r010', nom: 'Compote de pommes', type: 'dessert',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.38,
        ingredients: [{ nom: 'pommes', quantite_kg: 0.15, cout_euro_kg: 2.50 }],
        nutrition: { proteines_g: 0.5, lipides_g: 0.3, glucides_g: 15, fer_mg: 0.3, calcium_mg: 8, fibres_g: 2 },
        co2_kg_portion: 0.12, tags: ['fruits', 'sans_sucre_ajoute']
    },
    {
        id: 'r011', nom: 'Yaourt nature', type: 'produit_laitier',
        vegetarien: true, bio: true, local: true,
        cout_portion_euro: 0.35,
        ingredients: [{ nom: 'yaourt', quantite_kg: 0.125, cout_euro_kg: 2.80 }],
        nutrition: { proteines_g: 5, lipides_g: 3.5, glucides_g: 6, fer_mg: 0.1, calcium_mg: 150, fibres_g: 0 },
        co2_kg_portion: 0.45, tags: ['laitages', 'calcium']
    },
    {
        id: 'r012', nom: 'Fromage Comté', type: 'produit_laitier',
        vegetarien: true, bio: false, local: false,
        cout_portion_euro: 0.66,
        ingredients: [{ nom: 'comte', quantite_kg: 0.03, cout_euro_kg: 22.00 }],
        nutrition: { proteines_g: 8, lipides_g: 10, glucides_g: 0.5, fer_mg: 0.2, calcium_mg: 285, fibres_g: 0 },
        co2_kg_portion: 0.55, tags: ['fromage', 'calcium_eleve']
    }
];

// Calculate nutritional density: (proteins + iron×5 + calcium/10) / cost
function calculateNutritionalDensity(recipe) {
    const n = recipe.nutrition || recipe;
    const proteines = n.proteines_g || recipe.proteines_g || 0;
    const fer = n.fer_mg || recipe.fer_mg || 0;
    const calcium = n.calcium_mg || recipe.calcium_mg || 0;
    const cout = recipe.cout_portion_euro || 1;
    return parseFloat(((proteines + fer * 5 + calcium / 10) / cout).toFixed(1));
}

// Transform raw recipe data to flat format for rendering
function flattenRecipes(recipesData) {
    return recipesData.map(r => ({
        id: r.id,
        nom: r.nom,
        type: r.type,
        vegetarien: r.vegetarien,
        bio: r.bio,
        local: r.local,
        cout_portion_euro: r.cout_portion_euro,
        proteines_g: r.nutrition?.proteines_g ?? r.proteines_g ?? 0,
        lipides_g: r.nutrition?.lipides_g ?? r.lipides_g ?? 0,
        glucides_g: r.nutrition?.glucides_g ?? r.glucides_g ?? 0,
        fer_mg: r.nutrition?.fer_mg ?? r.fer_mg ?? 0,
        calcium_mg: r.nutrition?.calcium_mg ?? r.calcium_mg ?? 0,
        fibres_g: r.nutrition?.fibres_g ?? r.fibres_g ?? 0,
        co2_kg_portion: r.co2_kg_portion,
        tags: r.tags || [],
        ingredients: r.ingredients || [],
        densite_nutritionnelle: calculateNutritionalDensity(r)
    }));
}

// Initialize recipes with calculated density
const DEMO_RECIPES = flattenRecipes(RECIPES_DATA);

const DEMO_MENU = {
    jours: [
        { jour: 1, composantes: { entree: { recette: 'Carottes râpées', vegetarien: true, bio: true, local: true }, plat_principal: { recette: 'Lentilles corail au curry', vegetarien: true, bio: true, local: false }, garniture: { recette: 'Riz basmati', vegetarien: true, bio: false, local: false }, dessert: { recette: 'Compote de pommes', vegetarien: true, bio: true, local: true }, produit_laitier: { recette: 'Yaourt nature', vegetarien: true, bio: true, local: true } }, cout_total: 1.85, co2_total: 0.95 },
        { jour: 2, composantes: { entree: { recette: 'Salade tomates', vegetarien: true, bio: false, local: true }, plat_principal: { recette: 'Poulet rôti', vegetarien: false, bio: false, local: true }, garniture: { recette: 'Haricots verts', vegetarien: true, bio: true, local: true }, dessert: { recette: 'Fruit frais', vegetarien: true, bio: true, local: true }, produit_laitier: { recette: 'Fromage', vegetarien: true, bio: false, local: false } }, cout_total: 2.10, co2_total: 1.80 },
        { jour: 3, composantes: { entree: { recette: 'Concombre', vegetarien: true, bio: true, local: true }, plat_principal: { recette: 'Cabillaud citron', vegetarien: false, bio: false, local: false }, garniture: { recette: 'Purée', vegetarien: true, bio: false, local: true }, dessert: { recette: 'Compote poire', vegetarien: true, bio: true, local: true }, produit_laitier: { recette: 'Yaourt fruits', vegetarien: true, bio: false, local: true } }, cout_total: 1.95, co2_total: 1.45 },
        { jour: 4, composantes: { entree: { recette: 'Betteraves', vegetarien: true, bio: true, local: true }, plat_principal: { recette: 'Gratin courgettes', vegetarien: true, bio: true, local: true }, garniture: { recette: 'Salade verte', vegetarien: true, bio: true, local: true }, dessert: { recette: 'Fruit frais', vegetarien: true, bio: true, local: true }, produit_laitier: { recette: 'Fromage blanc', vegetarien: true, bio: true, local: true } }, cout_total: 1.75, co2_total: 0.65 },
        { jour: 5, composantes: { entree: { recette: 'Céleri rémoulade', vegetarien: true, bio: false, local: true }, plat_principal: { recette: 'Omelette herbes', vegetarien: true, bio: true, local: true }, garniture: { recette: 'Petits pois', vegetarien: true, bio: true, local: true }, dessert: { recette: 'Tarte aux pommes', vegetarien: true, bio: false, local: true }, produit_laitier: { recette: 'Petit suisse', vegetarien: true, bio: true, local: true } }, cout_total: 1.90, co2_total: 0.85 }
    ],
    stats: {
        cout_moyen_par_jour: 1.91,
        co2_moyen_par_jour_kg: 1.14,
        pct_repas_vegetariens: 60,
        pct_bio: 55,
        pct_local: 75,
        budget_respecte: true
    }
};

// ============================================
// STATE
// ============================================

let currentView = 'dashboard';
let recipes = DEMO_RECIPES;
let generatedMenu = null;

// Planning state
let planningData = {}; // { weekKey: { day: { type: recipeId } } }
let currentPlanningWeek = 0; // Week offset from current week
let pendingSlotDay = null;
let pendingSlotType = null;

// ============================================
// NAVIGATION
// ============================================

function showView(viewName) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`view-${viewName}`).classList.add('active');

    currentView = viewName;

    // Load view-specific data
    switch (viewName) {
        case 'heatmap':
            renderHeatmap();
            break;
        case 'recipes':
            renderRecipes();
            break;
        case 'dashboard':
            renderWeekPreview();
            break;
        case 'suppliers':
            renderSuppliers();
            break;
        case 'planning':
            initPlanning();
            break;
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            showView(item.dataset.view);
        });
    });

    // Initialize budget slider
    const budgetSlider = document.getElementById('input-budget');
    const budgetValue = document.getElementById('budget-value');
    if (budgetSlider) {
        budgetSlider.addEventListener('input', () => {
            budgetValue.textContent = parseFloat(budgetSlider.value).toFixed(2) + '€';
        });
    }

    // Initialize generator form
    const generatorForm = document.getElementById('generator-form');
    if (generatorForm) {
        generatorForm.addEventListener('submit', handleGenerateMenu);
    }

    // Initial renders
    renderWeekPreview();
    renderRecipes();
    renderHeatmap();

    // Initialize OCR dropzone
    initOCRDropzone();

    console.log('🍽️ Cantine.OS initialized');
});

// ============================================
// OCR SCANNER
// ============================================

let selectedOCRFile = null;

function initOCRDropzone() {
    const dropzone = document.getElementById('ocr-dropzone');
    const fileInput = document.getElementById('ocr-file-input');
    const scanBtn = document.getElementById('ocr-scan-btn');

    if (!dropzone || !fileInput) return;

    // Click to select file
    dropzone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleOCRFileSelect(e.target.files[0]);
        }
    });

    // Drag and drop
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleOCRFileSelect(e.dataTransfer.files[0]);
        }
    });

    // Scan button
    if (scanBtn) {
        scanBtn.addEventListener('click', handleOCRScan);
    }
}

function handleOCRFileSelect(file) {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf')) {
        alert('Format non supporté. Utilisez PDF, PNG, JPG ou WEBP.');
        return;
    }

    selectedOCRFile = file;

    // Show selected file info
    const fileInfo = document.getElementById('selected-file-info');
    const fileName = document.getElementById('selected-file-name');
    const scanBtn = document.getElementById('ocr-scan-btn');

    if (fileInfo && fileName) {
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
    }

    if (scanBtn) {
        scanBtn.disabled = false;
    }

    console.log('📄 File selected:', file.name);
}

function clearOCRFile() {
    selectedOCRFile = null;

    const fileInfo = document.getElementById('selected-file-info');
    const fileInput = document.getElementById('ocr-file-input');
    const scanBtn = document.getElementById('ocr-scan-btn');

    if (fileInfo) fileInfo.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (scanBtn) scanBtn.disabled = true;
}

async function handleOCRScan() {
    if (!selectedOCRFile) return;

    const resultCard = document.getElementById('ocr-result-card');

    // Show loading
    resultCard.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>🤖 Analyse OCR avec Gemini Vision API...</p>
            <p style="font-size: 12px; margin-top: 8px; opacity: 0.7;">Extraction intelligente des menus en cours</p>
        </div>
    `;

    // Try API call
    try {
        const formData = new FormData();
        formData.append('file', selectedOCRFile);

        const response = await fetch(`${API_URL}/ocr/extract-menu`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            renderOCRResult(result);
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur OCR');
        }
    } catch (error) {
        console.log('OCR API error:', error);

        // Demo fallback
        await new Promise(resolve => setTimeout(resolve, 2000));

        const demoResult = {
            status: 'success',
            filename: selectedOCRFile.name,
            confidence: 0.85,
            language: 'fr',
            menu_items: [
                { name: 'Salade de carottes râpées', price: null, vegetarian: true },
                { name: 'Émincé de poulet au curry', price: 2.50, vegetarian: false },
                { name: 'Riz basmati', price: null, vegetarian: true },
                { name: 'Yaourt nature', price: null, vegetarian: true },
                { name: 'Compote de pommes', price: null, vegetarian: true }
            ],
            raw_text: "Menu du Lundi 16 Décembre\n\nEntrée: Salade de carottes râpées\nPlat: Émincé de poulet au curry - 2.50€\nGarniture: Riz basmati\nLaitage: Yaourt nature\nDessert: Compote de pommes\n\n(Données de démonstration - Backend OCR non connecté)"
        };

        renderOCRResult(demoResult);
    }
}

function renderOCRResult(result) {
    const resultCard = document.getElementById('ocr-result-card');
    const confidencePct = Math.round((result.confidence || 0) * 100);

    // Category labels in French
    const categoryLabels = {
        'entree': '🥗 Entrée',
        'plat': '🍖 Plat',
        'garniture': '🥦 Garniture',
        'dessert': '🍰 Dessert',
        'laitage': '🧀 Laitage',
        'pain': '🥖 Pain',
        'autre': '📋 Autre'
    };

    // Normalize item data (handle both Gemini and EasyOCR formats)
    const normalizeItem = (item) => ({
        name: item.name || item.nom || 'Item inconnu',
        category: item.category || item.categorie || 'autre',
        vegetarian: item.vegetarian ?? item.vegetarien ?? false,
        bio: item.bio ?? false,
        day: item.day || item.jour || ''
    });

    // Normalize menu_items
    const menuItems = (result.menu_items || []).map(normalizeItem);

    // Build menu by day HTML
    let menuByDayHTML = '';
    const menuByDay = result.menu_by_day || {};
    const days = Object.keys(menuByDay).filter(d => (menuByDay[d] || []).length > 0);

    if (days.length > 0) {
        menuByDayHTML = days.map(day => {
            const dayItems = (menuByDay[day] || []).map(normalizeItem);
            return `
            <div class="ocr-day-section">
                <h4 class="day-header">🗓️ ${day}</h4>
                <div class="ocr-items-grid">
                    ${dayItems.map(item => `
                        <div class="ocr-item ${item.vegetarian ? 'vegetarian' : ''}">
                            <div class="item-category">${categoryLabels[item.category] || '📋'}</div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-meta">
                                ${item.vegetarian ? '<span class="badge-veg">🌱 Végé</span>' : ''}
                                ${item.bio ? '<span class="badge-bio">🌿 Bio</span>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `}).join('');
    } else {
        // Fallback to flat list
        menuByDayHTML = `
            <div class="ocr-items-grid">
                ${menuItems.map(item => `
                    <div class="ocr-item ${item.vegetarian ? 'vegetarian' : ''}">
                        <div class="item-name">${item.name}</div>
                        <div class="item-meta">
                            ${item.vegetarian ? '<span class="badge-veg">🌱 Végé</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    const ocrEngine = result.ocr_engine || 'unknown';
    const engineBadge = ocrEngine === 'gemini' ? '🤖 Gemini' : ocrEngine === 'easyocr' ? '📝 EasyOCR' : '';

    resultCard.innerHTML = `
        <div class="card-header">
            <h3>📋 Résultat de l'extraction</h3>
            <div style="display: flex; gap: 8px;">
                ${engineBadge ? `<span class="badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">${engineBadge}</span>` : ''}
                <span class="badge ${result.success ? 'success' : ''}">${result.success ? 'Succès' : 'Partiel'}</span>
            </div>
        </div>
        <div class="ocr-result">
            <div class="ocr-result-header">
                <div>
                    <strong>${result.filename || 'Image analysée'}</strong>
                    <span style="color: var(--text-secondary); margin-left: 8px;">Langue: ${result.language || 'fr'}</span>
                </div>
                <div class="ocr-confidence">
                    <span>Confiance:</span>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidencePct}%"></div>
                    </div>
                    <span>${confidencePct}%</span>
                </div>
            </div>

            <div class="ocr-stats">
                <div class="ocr-stat">
                    <span class="stat-value">${menuItems.length}</span>
                    <span class="stat-label">Items détectés</span>
                </div>
                <div class="ocr-stat">
                    <span class="stat-value">${days.length || '-'}</span>
                    <span class="stat-label">Jours</span>
                </div>
                <div class="ocr-stat">
                    <span class="stat-value">${menuItems.filter(i => i.vegetarian).length}</span>
                    <span class="stat-label">Végétariens</span>
                </div>
            </div>

            ${menuByDayHTML}

            <details class="ocr-raw-text">
                <summary>📝 Texte brut extrait</summary>
                <pre>${result.raw_text}</pre>
            </details>

            <div style="margin-top: 24px; display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="importOCRToRecipes()">
                    ➕ Importer dans la base
                </button>
                <button class="btn btn-outline" onclick="clearOCRFile(); showView('ocr');">
                    🔄 Nouveau scan
                </button>
            </div>
        </div>
    `;
}

function importOCRToRecipes() {
    alert('Import en cours de développement. Les éléments détectés seront ajoutés à votre base de recettes.');
}

// ============================================
// WEEK PREVIEW (Dashboard)
// ============================================

function renderWeekPreview() {
    const container = document.getElementById('week-preview');
    if (!container) return;

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const menu = DEMO_MENU.jours;

    container.innerHTML = days.map((day, i) => {
        const dayData = menu[i];
        const plat = dayData?.composantes?.plat_principal;
        const badges = [];
        if (plat?.vegetarien) badges.push('🌱');
        if (plat?.bio) badges.push('🌿');
        if (plat?.local) badges.push('📍');

        return `
            <div class="day-card">
                <div class="day-name">${day}</div>
                <div class="day-menu">${plat?.recette || 'Non défini'}</div>
                <div class="day-badges">${badges.join(' ')}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// MENU GENERATOR
// ============================================

async function handleGenerateMenu(e) {
    e.preventDefault();

    const resultCard = document.getElementById('result-card');

    // Show loading
    resultCard.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Optimisation en cours...</p>
        </div>
    `;

    // Collect form data
    const config = {
        nom_etablissement: document.getElementById('input-nom').value,
        budget_max_par_repas: parseFloat(document.getElementById('input-budget').value),
        nb_jours: parseInt(document.getElementById('input-jours').value),
        convives: [],
        priorite_budget: parseInt(document.getElementById('prio-budget').value) / 100,
        priorite_carbone: parseInt(document.getElementById('prio-carbone').value) / 100,
        priorite_local: parseInt(document.getElementById('prio-local').value) / 100
    };

    // Collect convives
    if (document.getElementById('convive-maternelle').checked) {
        config.convives.push({
            label: 'Maternelle',
            age_min: 3, age_max: 6,
            effectif: parseInt(document.getElementById('effectif-maternelle').value)
        });
    }
    if (document.getElementById('convive-elementaire').checked) {
        config.convives.push({
            label: 'Élémentaire',
            age_min: 6, age_max: 11,
            effectif: parseInt(document.getElementById('effectif-elementaire').value)
        });
    }
    if (document.getElementById('convive-ado').checked) {
        config.convives.push({
            label: 'Adolescents',
            age_min: 11, age_max: 18,
            effectif: parseInt(document.getElementById('effectif-ado').value)
        });
    }

    console.log('Generating menu with config:', config);

    // Try API call, fallback to demo
    try {
        const response = await fetch(`${API_URL}/generate-menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });

        if (response.ok) {
            const data = await response.json();
            generatedMenu = data.menu;
        } else {
            throw new Error('API error');
        }
    } catch (error) {
        console.log('Using demo data (backend not running)');
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        generatedMenu = DEMO_MENU;
    }

    renderMenuResult(generatedMenu, config);
}

function renderMenuResult(menu, config) {
    const resultCard = document.getElementById('result-card');
    const stats = menu.stats;

    resultCard.innerHTML = `
        <div class="card-header">
            <h3>✅ Menu Généré - ${config.nb_jours} jours</h3>
            <span class="badge success">${stats.budget_respecte ? 'Budget OK' : 'Budget dépassé'}</span>
        </div>
        <div class="menu-result">
            <div class="menu-stats">
                <div class="menu-stat">
                    <span class="value">${stats.cout_moyen_par_jour}€</span>
                    <span class="label">Coût/jour</span>
                </div>
                <div class="menu-stat">
                    <span class="value">${stats.co2_moyen_par_jour_kg}kg</span>
                    <span class="label">CO₂/jour</span>
                </div>
                <div class="menu-stat">
                    <span class="value">${stats.pct_repas_vegetariens}%</span>
                    <span class="label">Végétarien</span>
                </div>
                <div class="menu-stat">
                    <span class="value">${stats.pct_local}%</span>
                    <span class="label">Local</span>
                </div>
            </div>

            <div class="menu-days">
                ${menu.jours.slice(0, 5).map(jour => renderMenuDay(jour)).join('')}
            </div>
        </div>
    `;
}

function renderMenuDay(jour) {
    const components = jour.composantes;
    const compLabels = {
        'entree': 'Entrée',
        'plat_principal': 'Plat',
        'garniture': 'Garniture',
        'dessert': 'Dessert',
        'produit_laitier': 'Laitage'
    };

    return `
        <div class="menu-day">
            <div class="menu-day-header">
                <h4>📅 Jour ${jour.jour}</h4>
                <div class="menu-day-meta">
                    <span>💰 ${jour.cout_total}€</span>
                    <span>🌍 ${jour.co2_total}kg CO₂</span>
                </div>
            </div>
            <div class="menu-day-content">
                ${Object.entries(components).map(([key, val]) => `
                    <div class="menu-component">
                        <div class="comp-type">${compLabels[key] || key}</div>
                        <div class="comp-name">${val.recette}</div>
                        <div class="comp-badges">
                            ${val.vegetarien ? '🌱' : ''}
                            ${val.bio ? '🌿' : ''}
                            ${val.local ? '📍' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================
// HEATMAP
// ============================================

function renderHeatmap() {
    const container = document.getElementById('heatmap-grid');
    if (!container) return;

    // Sort by nutritional density
    const sorted = [...recipes].sort((a, b) => b.densite_nutritionnelle - a.densite_nutritionnelle);

    container.innerHTML = sorted.map(recipe => {
        const density = recipe.densite_nutritionnelle;
        let grade = 'low';
        if (density >= 40) grade = 'excellent';
        else if (density >= 25) grade = 'good';

        return `
            <div class="heatmap-item ${grade}">
                <div class="item-name">${recipe.nom}</div>
                <div class="item-stats">
                    <span>💰 ${recipe.cout_portion_euro}€</span>
                    <span>🌍 ${recipe.co2_kg_portion}kg</span>
                </div>
                <div class="item-density">${density.toFixed(1)}</div>
            </div>
        `;
    }).join('');
}

function exportHeatmapPDF() {
    alert('Export PDF en cours de développement. Cette fonctionnalité permettra de générer un rapport pour les élus.');
}

// ============================================
// RECIPES
// ============================================

function renderRecipes() {
    const container = document.getElementById('recipes-grid');
    if (!container) return;

    const searchInput = document.getElementById('recipe-search');
    const typeFilter = document.getElementById('filter-type');
    const vegFilter = document.getElementById('filter-veg');
    const bioFilter = document.getElementById('filter-bio');

    // Add event listeners for filters
    [searchInput, typeFilter, vegFilter, bioFilter].forEach(el => {
        if (el) {
            el.addEventListener('input', renderRecipes);
            el.addEventListener('change', renderRecipes);
        }
    });

    // Filter recipes
    let filtered = [...recipes];

    if (searchInput?.value) {
        const search = searchInput.value.toLowerCase();
        filtered = filtered.filter(r => r.nom.toLowerCase().includes(search));
    }

    if (typeFilter?.value) {
        filtered = filtered.filter(r => r.type === typeFilter.value);
    }

    if (vegFilter?.checked) {
        filtered = filtered.filter(r => r.vegetarien);
    }

    if (bioFilter?.checked) {
        filtered = filtered.filter(r => r.bio);
    }

    const typeLabels = {
        'entree': 'Entrée',
        'plat_principal': 'Plat Principal',
        'garniture': 'Garniture',
        'dessert': 'Dessert',
        'produit_laitier': 'Produit Laitier'
    };

    container.innerHTML = filtered.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <h4>${recipe.nom}</h4>
                <div class="recipe-badges">
                    ${recipe.vegetarien ? '<span class="recipe-badge veg">🌱 Végé</span>' : ''}
                    ${recipe.bio ? '<span class="recipe-badge bio">🌿 Bio</span>' : ''}
                    ${recipe.local ? '<span class="recipe-badge local">📍 Local</span>' : ''}
                </div>
            </div>
            <div class="recipe-tags">
                ${(recipe.tags || []).map(tag => `<span class="recipe-tag">${tag.replace('_', ' ')}</span>`).join('')}
            </div>
            <div class="recipe-stats">
                <div class="recipe-stat">
                    <span class="value">${recipe.cout_portion_euro}€</span>
                    <span class="label">Coût</span>
                </div>
                <div class="recipe-stat">
                    <span class="value">${recipe.proteines_g}g</span>
                    <span class="label">Protéines</span>
                </div>
                <div class="recipe-stat">
                    <span class="value">${recipe.fer_mg}mg</span>
                    <span class="label">Fer</span>
                </div>
                <div class="recipe-stat">
                    <span class="value">${recipe.calcium_mg}mg</span>
                    <span class="label">Calcium</span>
                </div>
                <div class="recipe-stat">
                    <span class="value">${recipe.co2_kg_portion}kg</span>
                    <span class="label">CO₂</span>
                </div>
            </div>
            <div class="recipe-footer">
                <div class="recipe-type">${typeLabels[recipe.type] || recipe.type}</div>
                <div class="recipe-density" title="Densité nutritionnelle: (Protéines + Fer×5 + Ca/10) / Coût">
                    <span class="density-icon">⚡</span>
                    <span class="density-value">${recipe.densite_nutritionnelle}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// SUPPLIERS
// ============================================

let suppliersData = [];

async function fetchSuppliers() {
    try {
        const response = await fetch(`${API_URL}/suppliers`);
        if (response.ok) {
            const data = await response.json();
            suppliersData = data.suppliers || [];
            return suppliersData;
        }
    } catch (error) {
        console.log('Using fallback suppliers data');
    }
    return [];
}

async function renderSuppliers() {
    const container = document.getElementById('suppliers-grid');
    const statsContainer = document.getElementById('suppliers-stats');
    if (!container) return;

    // Show loading
    container.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Chargement des fournisseurs...</p>
        </div>
    `;

    // Fetch suppliers
    const suppliers = await fetchSuppliers();

    if (suppliers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🏪</div>
                <h3>Aucun fournisseur</h3>
                <p>Ajoutez votre premier fournisseur pour commencer</p>
                <button class="btn btn-primary" onclick="openSupplierModal()">
                    ➕ Ajouter un Fournisseur
                </button>
            </div>
        `;
        return;
    }

    // Calculate stats
    const totalProducts = suppliers.reduce((sum, s) => sum + (s.produits?.length || 0), 0);
    const bioSuppliers = suppliers.filter(s => (s.labels || []).includes('bio')).length;
    const localSuppliers = suppliers.filter(s => (s.localisation?.distance_km || 999) < 50).length;
    const avgDistance = suppliers.reduce((sum, s) => sum + (s.localisation?.distance_km || 0), 0) / suppliers.length;

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card mini">
                <span class="stat-value">${suppliers.length}</span>
                <span class="stat-label">Fournisseurs</span>
            </div>
            <div class="stat-card mini">
                <span class="stat-value">${totalProducts}</span>
                <span class="stat-label">Produits</span>
            </div>
            <div class="stat-card mini">
                <span class="stat-value">${bioSuppliers}</span>
                <span class="stat-label">🌿 Bio</span>
            </div>
            <div class="stat-card mini">
                <span class="stat-value">${Math.round(avgDistance)}km</span>
                <span class="stat-label">Distance moy.</span>
            </div>
        `;
    }

    // Render supplier cards
    container.innerHTML = suppliers.map(supplier => {
        const labels = (supplier.labels || []).map(l => {
            const labelIcons = { 'bio': '🌿', 'local': '📍', 'HVE': '🌾', 'MSC': '🐟', 'Label Rouge': '🔴', 'AOP': '⭐' };
            return `<span class="supplier-label">${labelIcons[l] || ''} ${l}</span>`;
        }).join('');

        const productCount = supplier.produits?.length || 0;
        const distance = supplier.localisation?.distance_km || '-';
        const ville = supplier.localisation?.ville || '';

        return `
            <div class="supplier-card">
                <div class="supplier-header">
                    <h4>${supplier.nom}</h4>
                    <span class="supplier-type">${supplier.type || 'producteur'}</span>
                </div>
                <div class="supplier-location">
                    📍 ${ville} ${distance ? `(${distance} km)` : ''}
                </div>
                <div class="supplier-labels">${labels || '<span style="opacity: 0.5">Aucun label</span>'}</div>
                <div class="supplier-stats">
                    <div class="supplier-stat">
                        <span class="value">${productCount}</span>
                        <span class="label">produits</span>
                    </div>
                    <div class="supplier-stat">
                        <span class="value">${supplier.delai_livraison_jours || 1}j</span>
                        <span class="label">délai</span>
                    </div>
                    <div class="supplier-stat">
                        <span class="value">${supplier.minimum_commande_euro || 0}€</span>
                        <span class="label">min</span>
                    </div>
                </div>
                <div class="supplier-actions">
                    <button class="btn btn-sm btn-outline" onclick="showProducts('${supplier.id}')">
                        📦 Voir produits
                    </button>
                    <button class="btn btn-sm btn-outline" onclick="editSupplier('${supplier.id}')">
                        ✏️ Modifier
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${supplier.id}')">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function openSupplierModal(supplier = null) {
    const modal = document.getElementById('supplier-modal');
    const title = document.getElementById('supplier-modal-title');

    if (supplier) {
        title.textContent = 'Modifier le Fournisseur';
        document.getElementById('supplier-id').value = supplier.id;
        document.getElementById('supplier-nom').value = supplier.nom;
        document.getElementById('supplier-type').value = supplier.type || 'producteur';
        document.getElementById('supplier-email').value = supplier.contact?.email || '';
        document.getElementById('supplier-telephone').value = supplier.contact?.telephone || '';
        document.getElementById('supplier-ville').value = supplier.localisation?.ville || '';
        document.getElementById('supplier-distance').value = supplier.localisation?.distance_km || '';
        document.getElementById('supplier-labels').value = (supplier.labels || []).join(', ');
        document.getElementById('supplier-delai').value = supplier.delai_livraison_jours || 1;
        document.getElementById('supplier-minimum').value = supplier.minimum_commande_euro || 0;
    } else {
        title.textContent = 'Ajouter un Fournisseur';
        document.getElementById('supplier-form').reset();
        document.getElementById('supplier-id').value = '';
    }

    modal.classList.add('active');
}

function closeSupplierModal() {
    document.getElementById('supplier-modal').classList.remove('active');
}

async function saveSupplier(event) {
    event.preventDefault();

    const id = document.getElementById('supplier-id').value;
    const labelsStr = document.getElementById('supplier-labels').value;

    const supplier = {
        nom: document.getElementById('supplier-nom').value,
        type: document.getElementById('supplier-type').value,
        contact: {
            email: document.getElementById('supplier-email').value,
            telephone: document.getElementById('supplier-telephone').value
        },
        localisation: {
            ville: document.getElementById('supplier-ville').value,
            distance_km: parseFloat(document.getElementById('supplier-distance').value) || 0
        },
        labels: labelsStr ? labelsStr.split(',').map(l => l.trim()) : [],
        delai_livraison_jours: parseInt(document.getElementById('supplier-delai').value) || 1,
        minimum_commande_euro: parseFloat(document.getElementById('supplier-minimum').value) || 0,
        produits: []
    };

    try {
        const url = id ? `${API_URL}/suppliers/${id}` : `${API_URL}/suppliers`;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplier)
        });

        if (response.ok) {
            closeSupplierModal();
            renderSuppliers();
        } else {
            const error = await response.json();
            alert(error.detail || 'Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Save supplier error:', error);
        alert('Erreur de connexion au serveur');
    }
}

async function editSupplier(supplierId) {
    const supplier = suppliersData.find(s => s.id === supplierId);
    if (supplier) {
        openSupplierModal(supplier);
    }
}

async function deleteSupplier(supplierId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return;

    try {
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            renderSuppliers();
        } else {
            const error = await response.json();
            alert(error.detail || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Delete supplier error:', error);
        alert('Erreur de connexion au serveur');
    }
}

function showProducts(supplierId) {
    const supplier = suppliersData.find(s => s.id === supplierId);
    if (!supplier) return;

    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const list = document.getElementById('product-list');

    title.textContent = `📦 Produits - ${supplier.nom}`;

    const products = supplier.produits || [];
    if (products.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <p>Aucun produit référencé pour ce fournisseur</p>
            </div>
        `;
    } else {
        list.innerHTML = products.map(p => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${p.nom}</div>
                    <div class="product-meta">
                        <span class="product-category">${p.categorie}</span>
                        ${p.bio ? '<span class="badge-bio">🌿 Bio</span>' : ''}
                        <span class="product-origin">${p.origine || ''}</span>
                    </div>
                </div>
                <div class="product-price">
                    <span class="price-value">${p.prix_unitaire}€</span>
                    <span class="price-unit">/ ${p.unite}</span>
                </div>
            </div>
        `).join('');
    }

    modal.classList.add('active');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('active');
}

// ============================================
// PLANNING PAGE
// ============================================

function getWeekKey(weekOffset) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1 + (weekOffset * 7)); // Monday
    return `${weekStart.getFullYear()}-W${getISOWeek(weekStart)}`;
}

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function getWeekDates(weekOffset) {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + (weekOffset * 7));

    const dates = [];
    for (let i = 0; i < 5; i++) {
        const day = new Date(monday);
        day.setDate(monday.getDate() + i);
        dates.push(day);
    }
    return dates;
}

function formatWeekLabel(weekOffset) {
    const dates = getWeekDates(weekOffset);
    const weekNum = getISOWeek(dates[0]);
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const startDay = dates[0].getDate();
    const endDay = dates[4].getDate();
    const month = months[dates[0].getMonth()];
    const year = dates[0].getFullYear();

    return `Semaine ${weekNum} • ${startDay} - ${endDay} ${month} ${year}`;
}

function initPlanning() {
    loadPlanningFromStorage();
    renderPlanning();
}

function renderPlanning() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const dates = getWeekDates(currentPlanningWeek);

    // Update week label
    const weekLabel = document.getElementById('planning-week-label');
    if (weekLabel) {
        weekLabel.textContent = formatWeekLabel(currentPlanningWeek);
    }

    // Update date headers
    for (let i = 0; i < 5; i++) {
        const dateEl = document.getElementById(`date-${i}`);
        if (dateEl) {
            dateEl.textContent = dates[i].getDate();
        }
    }

    // Update slots
    const types = ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier'];

    for (let day = 0; day < 5; day++) {
        for (const type of types) {
            const slot = document.querySelector(`.planning-slot[data-day="${day}"][data-type="${type}"]`);
            if (!slot) continue;

            const dayData = weekData[day] || {};
            const recipeId = dayData[type];

            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    slot.classList.add('filled');
                    slot.classList.remove('empty');
                    slot.innerHTML = `
                        <div class="recipe-name">${recipe.nom}</div>
                        <div class="recipe-badges">
                            ${recipe.vegetarien ? '<span class="recipe-badge veg">🌱</span>' : ''}
                            ${recipe.bio ? '<span class="recipe-badge bio">Bio</span>' : ''}
                            ${recipe.local ? '<span class="recipe-badge local">Local</span>' : ''}
                        </div>
                        <div class="recipe-cost">${recipe.cout_portion_euro.toFixed(2)}€</div>
                        <span class="view-recipe-link" onclick="event.stopPropagation(); viewRecipeFromPlanning('${recipe.id}')">Voir détails →</span>
                        <button class="slot-remove" onclick="event.stopPropagation(); removeRecipeFromSlot(${day}, '${type}')">&times;</button>
                    `;
                }
            } else {
                slot.classList.remove('filled');
                slot.classList.add('empty');
                slot.innerHTML = '';
            }
        }
    }

    updateComplianceStats();
}

function updateComplianceStats() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};

    let totalRecipes = 0;
    let vegCount = 0;
    let bioCount = 0;
    let localCount = 0;
    let totalCost = 0;
    let totalCo2 = 0;
    let vegDays = 0;

    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        let dayIsVeg = true;

        for (const type of ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier']) {
            const recipeId = dayData[type];
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    totalRecipes++;
                    if (recipe.vegetarien) vegCount++;
                    if (recipe.bio) bioCount++;
                    if (recipe.local) localCount++;
                    totalCost += recipe.cout_portion_euro;
                    totalCo2 += recipe.co2_kg_portion;
                    if (!recipe.vegetarien && type === 'plat_principal') dayIsVeg = false;
                }
            } else if (type === 'plat_principal') {
                dayIsVeg = false;
            }
        }

        if (dayIsVeg && dayData['plat_principal']) vegDays++;
    }

    // Update UI
    const vegPct = totalRecipes > 0 ? (vegCount / totalRecipes * 100) : 0;
    const bioPct = totalRecipes > 0 ? (bioCount / totalRecipes * 100) : 0;
    const localPct = totalRecipes > 0 ? (localCount / totalRecipes * 100) : 0;
    const avgCost = totalRecipes > 0 ? (totalCost / 5) : 0;
    const avgCo2 = totalRecipes > 0 ? (totalCo2 / 5) : 0;

    document.getElementById('compliance-veg').style.width = `${Math.min(vegDays * 100, 100)}%`;
    document.getElementById('compliance-veg-value').textContent = `${vegDays}/1 min`;

    document.getElementById('compliance-bio').style.width = `${Math.min(bioPct, 100)}%`;
    document.getElementById('compliance-bio-value').textContent = `${bioPct.toFixed(0)}%`;

    document.getElementById('compliance-local').style.width = `${Math.min(localPct, 100)}%`;
    document.getElementById('compliance-local-value').textContent = `${localPct.toFixed(0)}%`;

    document.getElementById('compliance-cost-value').textContent = `${avgCost.toFixed(2)}€`;
    document.getElementById('compliance-co2-value').textContent = `${avgCo2.toFixed(2)}kg`;
}

function navigateWeek(direction) {
    currentPlanningWeek += direction;
    renderPlanning();
}

function goToCurrentWeek() {
    currentPlanningWeek = 0;
    renderPlanning();
}

function openRecipeSelector(day, type) {
    pendingSlotDay = day;
    pendingSlotType = type;

    const modal = document.getElementById('recipe-selector-modal');
    const title = document.getElementById('recipe-selector-title');

    const typeLabels = {
        'entree': 'une Entrée',
        'plat_principal': 'un Plat Principal',
        'garniture': 'une Garniture',
        'dessert': 'un Dessert',
        'produit_laitier': 'un Produit Laitier'
    };

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    title.textContent = `Sélectionner ${typeLabels[type]} pour ${days[day]}`;

    // Reset filters
    document.getElementById('recipe-selector-search').value = '';
    document.getElementById('selector-filter-veg').checked = false;
    document.getElementById('selector-filter-bio').checked = false;

    renderRecipeSelectorGrid();
    modal.classList.add('active');
}

function closeRecipeSelector() {
    document.getElementById('recipe-selector-modal').classList.remove('active');
    pendingSlotDay = null;
    pendingSlotType = null;
}

function filterRecipeSelector() {
    renderRecipeSelectorGrid();
}

function renderRecipeSelectorGrid() {
    const container = document.getElementById('recipe-selector-grid');
    const search = document.getElementById('recipe-selector-search').value.toLowerCase();
    const vegOnly = document.getElementById('selector-filter-veg').checked;
    const bioOnly = document.getElementById('selector-filter-bio').checked;

    // Filter recipes by type
    let filtered = recipes.filter(r => r.type === pendingSlotType);

    // Apply search filter
    if (search) {
        filtered = filtered.filter(r => r.nom.toLowerCase().includes(search));
    }

    // Apply veg filter
    if (vegOnly) {
        filtered = filtered.filter(r => r.vegetarien);
    }

    // Apply bio filter
    if (bioOnly) {
        filtered = filtered.filter(r => r.bio);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
                <p>Aucune recette trouvée pour ce type</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(recipe => `
        <div class="recipe-selector-item" onclick="selectRecipeForSlot('${recipe.id}')">
            <div class="item-name">${recipe.nom}</div>
            <div class="item-meta">
                <span>💰 ${recipe.cout_portion_euro.toFixed(2)}€</span>
                <span>🌍 ${recipe.co2_kg_portion}kg</span>
            </div>
            <div class="item-badges">
                ${recipe.vegetarien ? '<span class="badge-mini">🌱 Végé</span>' : ''}
                ${recipe.bio ? '<span class="badge-mini">🌿 Bio</span>' : ''}
                ${recipe.local ? '<span class="badge-mini">📍 Local</span>' : ''}
            </div>
        </div>
    `).join('');
}

function selectRecipeForSlot(recipeId) {
    if (pendingSlotDay === null || pendingSlotType === null) return;

    const weekKey = getWeekKey(currentPlanningWeek);

    if (!planningData[weekKey]) {
        planningData[weekKey] = {};
    }
    if (!planningData[weekKey][pendingSlotDay]) {
        planningData[weekKey][pendingSlotDay] = {};
    }

    planningData[weekKey][pendingSlotDay][pendingSlotType] = recipeId;

    savePlanningToStorage();
    closeRecipeSelector();
    renderPlanning();
}

function removeRecipeFromSlot(day, type) {
    const weekKey = getWeekKey(currentPlanningWeek);

    if (planningData[weekKey] && planningData[weekKey][day]) {
        delete planningData[weekKey][day][type];
        savePlanningToStorage();
        renderPlanning();
    }
}

function viewRecipeFromPlanning(recipeId) {
    // Navigate to recipes view and highlight the recipe
    showView('recipes');

    // Highlight the recipe (add visual feedback)
    setTimeout(() => {
        const recipeCard = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (recipeCard) {
            recipeCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            recipeCard.classList.add('highlight');
            setTimeout(() => recipeCard.classList.remove('highlight'), 2000);
        }
    }, 100);
}

function clearPlanning() {
    if (!confirm('Voulez-vous vraiment vider le planning de cette semaine ?')) return;

    const weekKey = getWeekKey(currentPlanningWeek);
    delete planningData[weekKey];
    savePlanningToStorage();
    renderPlanning();
}

function duplicatePreviousWeek() {
    const previousWeekKey = getWeekKey(currentPlanningWeek - 1);
    const currentWeekKey = getWeekKey(currentPlanningWeek);

    if (!planningData[previousWeekKey]) {
        alert('Aucun planning trouvé pour la semaine précédente.');
        return;
    }

    // Deep copy previous week data
    planningData[currentWeekKey] = JSON.parse(JSON.stringify(planningData[previousWeekKey]));
    savePlanningToStorage();
    renderPlanning();
}

function autoFillPlanning() {
    // Use the generated menu or demo menu to fill planning
    const menu = generatedMenu || DEMO_MENU;
    const weekKey = getWeekKey(currentPlanningWeek);

    planningData[weekKey] = {};

    // Map menu types to recipe types
    const typeMapping = {
        'entree': 'entree',
        'plat_principal': 'plat_principal',
        'garniture': 'garniture',
        'dessert': 'dessert',
        'produit_laitier': 'produit_laitier'
    };

    // Try to match recipes by name
    menu.jours.slice(0, 5).forEach((jour, dayIndex) => {
        planningData[weekKey][dayIndex] = {};

        for (const [menuType, recipeType] of Object.entries(typeMapping)) {
            const comp = jour.composantes[menuType];
            if (comp && comp.recette) {
                // Find matching recipe
                const matchedRecipe = recipes.find(r =>
                    r.nom.toLowerCase().includes(comp.recette.toLowerCase().split(' ')[0]) ||
                    comp.recette.toLowerCase().includes(r.nom.toLowerCase().split(' ')[0])
                );

                if (matchedRecipe) {
                    planningData[weekKey][dayIndex][recipeType] = matchedRecipe.id;
                }
            }
        }
    });

    savePlanningToStorage();
    renderPlanning();
}

function savePlanningToStorage() {
    try {
        localStorage.setItem('cantine_planning', JSON.stringify(planningData));
    } catch (e) {
        console.warn('Could not save planning to localStorage:', e);
    }
}

function loadPlanningFromStorage() {
    try {
        const saved = localStorage.getItem('cantine_planning');
        if (saved) {
            planningData = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('Could not load planning from localStorage:', e);
        planningData = {};
    }
}

function exportPlanningPDF() {
    alert('Export PDF en cours de développement. Cette fonctionnalité permettra de générer un menu imprimable pour les parents.');
}

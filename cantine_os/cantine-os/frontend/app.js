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

// Multi-Etablissement State
let currentEtablissement = null;
let allEtablissements = [];

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

    // Close sidebar on mobile when navigating
    if (window.innerWidth < 768) {
        closeSidebar();
    }
}

// ============================================
// SIDEBAR TOGGLE
// ============================================

/**
 * Toggle sidebar collapsed/expanded state
 * On mobile: opens/closes sidebar as overlay
 * On desktop: collapses/expands sidebar width
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar) return;

    // Mobile behavior: toggle open/close
    if (window.innerWidth < 768) {
        sidebar.classList.toggle('open');
        if (overlay) {
            overlay.classList.toggle('visible');
        }
    } else {
        // Desktop/Tablet: toggle collapsed state
        sidebar.classList.toggle('collapsed');

        // Save preference to localStorage
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
}

/**
 * Open sidebar (mobile only)
 */
function openSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar && window.innerWidth < 768) {
        sidebar.classList.add('open');
        if (overlay) {
            overlay.classList.add('visible');
        }
    }
}

/**
 * Close sidebar (mobile only)
 */
function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) {
        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('visible');
        }
    }
}

/**
 * Initialize sidebar state based on saved preferences and screen size
 */
function initSidebarState() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // On desktop, restore collapsed state from localStorage
    if (window.innerWidth > 1024) {
        const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }
}

/**
 * Initialize navigation and sidebar behavior
 */
function initNavigation() {
    // Initialize sidebar state
    initSidebarState();

    // Handle window resize - adjust sidebar behavior
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');

            if (!sidebar) return;

            // Reset mobile-specific classes when switching to desktop
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('open');
                if (overlay) {
                    overlay.classList.remove('visible');
                }
            }

            // On tablet, ensure sidebar is in mini mode
            if (window.innerWidth >= 769 && window.innerWidth <= 1024) {
                sidebar.classList.remove('collapsed');
            }
        }, 100);
    });

    // Close sidebar when clicking on a nav item (mobile)
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });
}

// ============================================
// INITIALIZATION
// ============================================

// Load recipes from API
async function loadRecipesFromAPI() {
    console.log('📖 Starting to load recipes from API...');
    try {
        const response = await fetch(`${API_URL}/recipes`);
        console.log('📖 API response status:', response.status);
        if (response.ok) {
            const apiRecipes = await response.json();
            console.log('📖 Received', apiRecipes.length, 'recipes from API');
            // Transform API data to flat format with nutritional density
            recipes = apiRecipes.map(r => ({
                id: r.id,
                nom: r.nom,
                type: r.type,
                vegetarien: r.vegetarien,
                bio: r.bio,
                local: r.local,
                cout_portion_euro: r.cout_portion_euro,
                proteines_g: r.proteines_g || 0,
                lipides_g: r.lipides_g || 0,
                glucides_g: r.glucides_g || 0,
                fer_mg: r.fer_mg || 0,
                calcium_mg: r.calcium_mg || 0,
                fibres_g: r.fibres_g || 0,
                co2_kg_portion: r.co2_kg_portion,
                tags: r.tags || [],
                equipement: r.equipement || [],
                mois_saison: r.mois_saison || [],
                densite_nutritionnelle: parseFloat((
                    ((r.proteines_g || 0) + (r.fer_mg || 0) * 5 + (r.calcium_mg || 0) / 10) / (r.cout_portion_euro || 1)
                ).toFixed(1))
            }));
            console.log(`📖 Successfully loaded ${recipes.length} recipes from API`);
            // Render recipes if currently viewing recipes
            if (currentView === 'recipes') {
                renderRecipes();
            }
        } else {
            const errorText = await response.text();
            console.error('📖 API returned error:', response.status, errorText);
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        console.error('⚠️ Could not load recipes from API, using demo data:', error);
        // Keep DEMO_RECIPES as fallback
        recipes = DEMO_RECIPES;
    }
}


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
    // Initialize navigation
    initNavigation();

    // Load data
    loadEtablissements();
    loadRecipesFromAPI();  // Load all recipes from API

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
// IMPORT SUPPLIER PRODUCTS (CSV / OCR)
// ============================================

let importSelectedFile = null;
let importCurrentTab = 'csv';
let importPreviewProducts = [];

function openImportModal() {
    const modal = document.getElementById('import-supplier-modal');

    // Populate supplier dropdown
    const select = document.getElementById('import-supplier-select');
    select.innerHTML = '<option value="">-- Sélectionner un fournisseur --</option>';
    suppliersData.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.nom}</option>`;
    });

    // Reset state
    importSelectedFile = null;
    importPreviewProducts = [];
    importCurrentTab = 'csv';

    // Reset UI
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-scan-btn').style.display = 'inline-flex';
    document.getElementById('import-confirm-btn').style.display = 'none';
    clearImportFile('csv');
    clearImportFile('ocr');

    // Initialize dropzones
    initImportDropzones();

    modal.classList.add('active');
}

function closeImportModal() {
    document.getElementById('import-supplier-modal').classList.remove('active');
    importSelectedFile = null;
    importPreviewProducts = [];
}

function switchImportTab(tab) {
    importCurrentTab = tab;

    // Update tab buttons
    document.querySelectorAll('.import-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    // Update tab content
    document.querySelectorAll('.import-tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `import-tab-${tab}`);
    });

    // Hide preview when switching tabs
    document.getElementById('import-preview').style.display = 'none';
    document.getElementById('import-scan-btn').style.display = 'inline-flex';
    document.getElementById('import-confirm-btn').style.display = 'none';
}

function initImportDropzones() {
    // CSV dropzone
    const csvDropzone = document.getElementById('csv-dropzone');
    const csvInput = document.getElementById('csv-file-input');

    if (csvDropzone && csvInput) {
        csvDropzone.addEventListener('click', () => csvInput.click());
        csvInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleImportFileSelect(e.target.files[0], 'csv');
        });
        csvDropzone.addEventListener('dragover', (e) => { e.preventDefault(); csvDropzone.classList.add('dragover'); });
        csvDropzone.addEventListener('dragleave', () => csvDropzone.classList.remove('dragover'));
        csvDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            csvDropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleImportFileSelect(e.dataTransfer.files[0], 'csv');
        });
    }

    // OCR dropzone
    const ocrDropzone = document.getElementById('ocr-supplier-dropzone');
    const ocrInput = document.getElementById('ocr-supplier-file-input');

    if (ocrDropzone && ocrInput) {
        ocrDropzone.addEventListener('click', () => ocrInput.click());
        ocrInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) handleImportFileSelect(e.target.files[0], 'ocr');
        });
        ocrDropzone.addEventListener('dragover', (e) => { e.preventDefault(); ocrDropzone.classList.add('dragover'); });
        ocrDropzone.addEventListener('dragleave', () => ocrDropzone.classList.remove('dragover'));
        ocrDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            ocrDropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) handleImportFileSelect(e.dataTransfer.files[0], 'ocr');
        });
    }
}

function handleImportFileSelect(file, type) {
    importSelectedFile = file;

    const fileInfo = document.getElementById(`${type === 'csv' ? 'csv' : 'ocr-supplier'}-file-info`);
    const fileName = document.getElementById(`${type === 'csv' ? 'csv' : 'ocr-supplier'}-file-name`);

    if (fileInfo && fileName) {
        fileName.textContent = file.name;
        fileInfo.style.display = 'flex';
    }

    console.log(`📄 Import file selected (${type}):`, file.name);
}

function clearImportFile(type) {
    const fileInfo = document.getElementById(`${type === 'csv' ? 'csv' : 'ocr-supplier'}-file-info`);
    const fileInput = document.getElementById(`${type === 'csv' ? 'csv' : 'ocr-supplier'}-file-input`);

    if (fileInfo) fileInfo.style.display = 'none';
    if (fileInput) fileInput.value = '';

    if (importCurrentTab === type) {
        importSelectedFile = null;
    }
}

async function handleImportScan() {
    if (!importSelectedFile) {
        alert('Veuillez sélectionner un fichier');
        return;
    }

    const previewDiv = document.getElementById('import-preview');
    const scanBtn = document.getElementById('import-scan-btn');
    const confirmBtn = document.getElementById('import-confirm-btn');

    // Show loading
    previewDiv.style.display = 'block';
    previewDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>${importCurrentTab === 'csv' ? '📄 Analyse du fichier CSV...' : '🤖 Analyse OCR avec Gemini Vision...'}</p>
        </div>
    `;

    try {
        const formData = new FormData();
        formData.append('file', importSelectedFile);

        const endpoint = importCurrentTab === 'csv'
            ? `${API_URL}/suppliers/import-csv`
            : `${API_URL}/ocr/extract-supplier`;

        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            importPreviewProducts = result.products || [];
            renderImportPreview(result);

            scanBtn.style.display = 'none';
            confirmBtn.style.display = 'inline-flex';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Erreur lors de l\'analyse');
        }
    } catch (error) {
        console.error('Import scan error:', error);
        previewDiv.innerHTML = `
            <div class="import-error">
                <p>❌ ${error.message || 'Erreur lors de l\'analyse du fichier'}</p>
                <button class="btn btn-outline" onclick="handleImportScan()">Réessayer</button>
            </div>
        `;
    }
}

function renderImportPreview(result) {
    const previewDiv = document.getElementById('import-preview');
    const products = result.products || [];
    const errors = result.errors || [];

    // Stats
    const bioCount = products.filter(p => p.bio).length;
    const statsHtml = `
        <div class="import-stats-row">
            <span class="stat-chip">📦 ${products.length} produits</span>
            <span class="stat-chip">🌿 ${bioCount} bio</span>
            ${result.confidence ? `<span class="stat-chip">🎯 ${Math.round(result.confidence * 100)}% confiance</span>` : ''}
            ${result.supplier?.nom ? `<span class="stat-chip">🏪 ${result.supplier.nom}</span>` : ''}
        </div>
    `;

    // Table
    const tableHtml = products.length > 0 ? `
        <div class="import-preview-table-wrapper">
            <table class="import-preview-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Catégorie</th>
                        <th>Prix</th>
                        <th>Unité</th>
                        <th>Bio</th>
                        <th>Origine</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.nom}</td>
                            <td>${p.categorie}</td>
                            <td>${p.prix_unitaire?.toFixed(2) || '0.00'}€</td>
                            <td>${p.unite}</td>
                            <td>${p.bio ? '🌿' : ''}</td>
                            <td>${p.origine || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : '<p class="no-products">Aucun produit détecté</p>';

    // Errors
    const errorsHtml = errors.length > 0 ? `
        <div class="import-errors">
            <h5>⚠️ Avertissements:</h5>
            <ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>
        </div>
    ` : '';

    previewDiv.innerHTML = `
        <h4>📋 Aperçu des produits</h4>
        ${statsHtml}
        ${tableHtml}
        ${errorsHtml}
    `;
}

async function confirmImport() {
    const supplierId = document.getElementById('import-supplier-select').value;

    if (!supplierId) {
        alert('Veuillez sélectionner un fournisseur');
        return;
    }

    if (importPreviewProducts.length === 0) {
        alert('Aucun produit à importer');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/suppliers/${supplierId}/import-products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(importPreviewProducts)
        });

        if (response.ok) {
            const result = await response.json();
            alert(`✅ ${result.imported_count} produits importés avec succès !`);
            closeImportModal();
            renderSuppliers();
        } else {
            const error = await response.json();
            alert(error.detail || 'Erreur lors de l\'import');
        }
    } catch (error) {
        console.error('Import confirm error:', error);
        alert('Erreur de connexion au serveur');
    }
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
    loadPopularityScores();
}

async function loadPopularityScores() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const dates = getWeekDates(currentPlanningWeek);

    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        const dateStr = dates[day].toISOString().split('T')[0];

        // Check if this day has a menu
        const hasMenu = dayData['plat_principal'] || dayData['entree'];

        if (hasMenu) {
            try {
                // Fetch feedback for this date
                const response = await fetch(`${API_URL}/feedback/menu/${dateStr}`);
                if (response.ok) {
                    const feedback = await response.json();
                    displayPopularityScore(day, feedback.popularity_score, feedback.total_ratings);
                }

                // Generate QR code for this date
                generateQRCodeForDay(day, dateStr);
            } catch (error) {
                console.log('Could not load feedback for', dateStr, error);
            }
        }
    }
}

function displayPopularityScore(day, score, totalRatings) {
    // Find the day header and add popularity score
    const dayHeader = document.querySelector(`.planning-day-header[data-day="${day}"]`);
    if (!dayHeader) return;

    // Remove existing score if any
    const existingScore = dayHeader.querySelector('.popularity-score');
    if (existingScore) {
        existingScore.remove();
    }

    if (totalRatings > 0) {
        const scoreEl = document.createElement('div');
        scoreEl.className = 'popularity-score';
        scoreEl.innerHTML = `
            <span class="score-carrots">${'🥕'.repeat(Math.round(score))}</span>
            <span class="score-value">${score.toFixed(1)}/5</span>
            <span class="score-count">(${totalRatings} avis)</span>
        `;
        dayHeader.appendChild(scoreEl);
    }
}

async function generateQRCodeForDay(day, dateStr) {
    try {
        const response = await fetch(`${API_URL}/qrcode/generate?menu_date=${dateStr}&size=200`);
        if (response.ok) {
            const data = await response.json();
            displayQRCode(day, data.qr_code_base64, data.feedback_url);
        }
    } catch (error) {
        console.log('Could not generate QR code for', dateStr, error);
    }
}

function displayQRCode(day, qrCodeBase64, feedbackUrl) {
    // Find the day column and add QR code at the bottom
    const dayHeader = document.querySelector(`.planning-day-header[data-day="${day}"]`);
    if (!dayHeader) return;

    // Remove existing QR code if any
    const existingQR = dayHeader.querySelector('.qr-code-container');
    if (existingQR) {
        existingQR.remove();
    }

    const qrContainer = document.createElement('div');
    qrContainer.className = 'qr-code-container';
    qrContainer.innerHTML = `
        <div class="qr-code-toggle" onclick="toggleQRCode(${day})">
            📱 QR Code Avis
        </div>
        <div class="qr-code-popup" id="qr-popup-${day}" style="display: none;">
            <img src="${qrCodeBase64}" alt="QR Code" class="qr-code-image">
            <p class="qr-code-text">Scannez pour donner votre avis</p>
            <button class="btn-close-qr" onclick="toggleQRCode(${day})">✕</button>
        </div>
    `;
    dayHeader.appendChild(qrContainer);
}

function toggleQRCode(day) {
    const popup = document.getElementById(`qr-popup-${day}`);
    if (popup) {
        popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
    }
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

    // Update anti-gaspi panel
    updateAntiGaspiPanel();
}

function navigateWeek(direction) {
    currentPlanningWeek += direction;
    renderPlanning();
}

function goToCurrentWeek() {
    currentPlanningWeek = 0;
    renderPlanning();
}

// Helper to normalize strings for comparison
function normalizeString(str) {
    if (!str) return '';
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/_/g, ' ')
        .trim();
}

// Calculate stock status for a recipe
function getRecipeStockStatus(recipe) {
    const status = {
        hasExpiringStock: false,
        hasStock: false,
        score: 0,
        expiringIngredients: [],
        stockedIngredients: []
    };

    if (!recipe.ingredients || !allStocks) return status;

    recipe.ingredients.forEach(ing => {
        const ingName = normalizeString(ing.nom);

        // Find matching stocks
        const matchingStocks = allStocks.filter(stock => {
            const stockName = normalizeString(stock.produit_nom);
            return stockName.includes(ingName) || ingName.includes(stockName);
        });

        if (matchingStocks.length > 0) {

            // Check for expiring stock (DLC <= 7 days)
            const expiring = matchingStocks.find(s => {
                if (!s.dlc) return false;
                const dlcDate = new Date(s.dlc);
                const today = new Date();
                const diffTime = dlcDate - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays >= -1; // Include recently expired
            });

            // Check for available quantity
            const totalQty = matchingStocks.reduce((sum, s) => sum + (parseFloat(s.quantite_actuelle) || 0), 0);

            if (expiring) {
                status.hasExpiringStock = true;
                status.expiringIngredients.push(ing.nom.replace(/_/g, ' '));
                status.score += 100; // High priority for expiring
            } else if (totalQty > 0) {
                status.hasStock = true;
                status.stockedIngredients.push(ing.nom.replace(/_/g, ' '));
                status.score += 10; // Medium priority for regular stock
            }
        }
    });

    return status;
}

async function openRecipeSelector(day, type) {
    pendingSlotDay = day;
    pendingSlotType = type;

    const modal = document.getElementById('recipe-selector-modal');
    const title = document.getElementById('recipe-selector-title');

    // Refresh stocks if needed (in background)
    fetchStocks().catch(console.error);

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

    // Calculate stock status for all recipes
    filtered = filtered.map(r => ({
        ...r,
        stockStatus: getRecipeStockStatus(r)
    }));

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

    // Sort by stock status score desc, then by name
    filtered.sort((a, b) => {
        if (b.stockStatus.score !== a.stockStatus.score) {
            return b.stockStatus.score - a.stockStatus.score;
        }
        return a.nom.localeCompare(b.nom);
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; padding: 40px;">
                <p>Aucune recette trouvée pour ce type</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(recipe => {
        const status = recipe.stockStatus;
        let stockBadge = '';

        if (status.hasExpiringStock) {
            stockBadge = `<span class="badge-mini" style="background: #fee2e2; color: #991b1b; border: 1px solid #fecaca;">⚠️ DLC Proche: ${status.expiringIngredients[0]}</span>`;
        } else if (status.hasStock) {
            stockBadge = `<span class="badge-mini" style="background: #dcfce7; color: #166534; border: 1px solid #bbf7d0;">📦 En Stock</span>`;
        }

        return `
        <div class="recipe-selector-item" onclick="selectRecipeForSlot('${recipe.id}')" style="${status.hasExpiringStock ? 'border-color: #fecaca; background: #fff5f5;' : ''}">
            <div class="item-name">
                ${recipe.nom}
            </div>
            ${stockBadge ? `<div style="margin-bottom: 4px;">${stockBadge}</div>` : ''}
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
    `}).join('');
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

// Helper function to get recipes already used in the week for a specific type
function getWeekUsedRecipes(weekKey, type) {
    const used = new Set();
    const weekData = planningData[weekKey] || {};

    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        if (dayData[type]) {
            used.add(dayData[type]);
        }
    }

    return used;
}

// Intelligent auto-fill planning considering stock, DLC, vegetarian days, and supplier constraints
function autoFillPlanning() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Initialize planning data for this week
    planningData[weekKey] = {};

    // Define types to fill
    const types = ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier'];

    // Define vegetarian day(s) - Wednesday (index 2) is mandatory vegetarian according to EGalim law
    const vegeDays = new Set([2]); // Mercredi = jour végétarien

    // Fill each day
    for (let day = 0; day < 5; day++) {
        planningData[weekKey][day] = {};
        const isVegeDay = vegeDays.has(day);

        for (const type of types) {
            // Get candidates for this type
            let candidates = recipes.filter(r => r.type === type);

            // If vegetarian day and plat principal, only keep vegetarian recipes
            if (isVegeDay && type === 'plat_principal') {
                candidates = candidates.filter(r => r.vegetarien === true);
            }

            // Filter by season (if recipe has mois_saison defined)
            candidates = candidates.filter(r =>
                !r.mois_saison || r.mois_saison.length === 0 || r.mois_saison.includes(currentMonth)
            );

            // Calculate stock status score for each candidate
            candidates = candidates.map(r => {
                const status = getRecipeStockStatus(r);
                return { ...r, stockScore: status.score };
            });

            // Sort by stock score (highest first = prioritize expiring stock)
            candidates.sort((a, b) => {
                if (b.stockScore !== a.stockScore) {
                    return b.stockScore - a.stockScore;
                }
                // Secondary sort: prefer local and bio
                const aScore = (a.local ? 1 : 0) + (a.bio ? 1 : 0);
                const bScore = (b.local ? 1 : 0) + (b.bio ? 1 : 0);
                return bScore - aScore;
            });

            // Avoid duplicates: exclude recipes already used this week for this type
            const usedRecipes = getWeekUsedRecipes(weekKey, type);
            candidates = candidates.filter(r => !usedRecipes.has(r.id));

            // Select the best candidate
            if (candidates.length > 0) {
                planningData[weekKey][day][type] = candidates[0].id;
            }
        }
    }

    savePlanningToStorage();
    renderPlanning();

    // Show success toast
    showToast('🤖 Planning rempli intelligemment !', 'success');

    // Log summary
    const vegCount = [0, 1, 2, 3, 4].filter(d => vegeDays.has(d)).length;
    console.log(`✅ Planning auto-rempli: ${vegCount} jour(s) végétarien(s), priorisation stock DLC, filtrage par saison`);
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
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const weekLabel = formatWeekLabel(currentPlanningWeek);
    const dates = getWeekDates(currentPlanningWeek);

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const types = [
        { key: 'entree', label: '🥗 Entrée' },
        { key: 'plat_principal', label: '🍖 Plat Principal' },
        { key: 'garniture', label: '🥔 Garniture' },
        { key: 'dessert', label: '🍨 Dessert' },
        { key: 'produit_laitier', label: '🧀 Laitage' }
    ];

    // Build HTML for print
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Planning - ${weekLabel}</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; padding: 20px; }
                h1 { font-size: 24px; margin-bottom: 8px; }
                .subtitle { color: #666; margin-bottom: 24px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #f5f5f5; font-weight: 600; }
                .type-label { background: #e8f5e9; font-weight: 600; }
                .recipe-name { font-weight: 500; }
                .badges { font-size: 12px; color: #666; }
                .cost { font-size: 12px; color: #1b4332; }
                .stats { margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px; }
                .stats h3 { margin: 0 0 12px 0; font-size: 16px; }
                .stats-grid { display: flex; gap: 24px; }
                .stat-item { text-align: center; }
                .stat-value { font-size: 20px; font-weight: 700; color: #1b4332; }
                .stat-label { font-size: 12px; color: #666; }
                @media print {
                    body { padding: 0; }
                    @page { margin: 15mm; }
                }
            </style>
        </head>
        <body>
            <h1>🍽️ Cantine.OS - Planning des Menus</h1>
            <p class="subtitle">${weekLabel}</p>
            
            <table>
                <thead>
                    <tr>
                        <th></th>
                        ${days.map((d, i) => `<th>${d}<br><small>${dates[i].getDate()}/${dates[i].getMonth() + 1}</small></th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    // Add rows for each type
    for (const type of types) {
        html += `<tr><td class="type-label">${type.label}</td>`;
        for (let day = 0; day < 5; day++) {
            const dayData = weekData[day] || {};
            const recipeId = dayData[type.key];
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    const badges = [];
                    if (recipe.vegetarien) badges.push('🌱');
                    if (recipe.bio) badges.push('Bio');
                    if (recipe.local) badges.push('Local');
                    html += `<td>
                        <div class="recipe-name">${recipe.nom}</div>
                        <div class="badges">${badges.join(' • ')}</div>
                        <div class="cost">${recipe.cout_portion_euro.toFixed(2)}€</div>
                    </td>`;
                } else {
                    html += '<td>-</td>';
                }
            } else {
                html += '<td>-</td>';
            }
        }
        html += '</tr>';
    }

    html += `
                </tbody>
            </table>
            
            <div class="stats">
                <h3>📊 Récapitulatif Semaine</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-value">${document.getElementById('compliance-cost-value')?.textContent || '0.00€'}</div>
                        <div class="stat-label">Coût moyen/jour</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${document.getElementById('compliance-co2-value')?.textContent || '0.00kg'}</div>
                        <div class="stat-label">CO₂ moyen/jour</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${document.getElementById('compliance-bio-value')?.textContent || '0%'}</div>
                        <div class="stat-label">Produits Bio</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${document.getElementById('compliance-local-value')?.textContent || '0%'}</div>
                        <div class="stat-label">Produits Locaux</div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
}

function exportPlanningCSV() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const weekLabel = formatWeekLabel(currentPlanningWeek);
    const dates = getWeekDates(currentPlanningWeek);

    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const types = ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier'];
    const typeLabels = {
        'entree': 'Entrée',
        'plat_principal': 'Plat Principal',
        'garniture': 'Garniture',
        'dessert': 'Dessert',
        'produit_laitier': 'Laitage'
    };

    // CSV header
    let csv = 'Jour,Date,Type,Recette,Végétarien,Bio,Local,Coût (€),CO2 (kg)\n';

    // Add data rows
    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        const dateStr = `${dates[day].getDate()}/${dates[day].getMonth() + 1}/${dates[day].getFullYear()}`;

        for (const type of types) {
            const recipeId = dayData[type];
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    // Escape recipe name for CSV (handle commas and quotes)
                    const escapedName = `"${recipe.nom.replace(/"/g, '""')}"`;
                    csv += `${days[day]},${dateStr},${typeLabels[type]},${escapedName},`;
                    csv += `${recipe.vegetarien ? 'Oui' : 'Non'},`;
                    csv += `${recipe.bio ? 'Oui' : 'Non'},`;
                    csv += `${recipe.local ? 'Oui' : 'Non'},`;
                    csv += `${recipe.cout_portion_euro.toFixed(2)},`;
                    csv += `${recipe.co2_kg_portion.toFixed(2)}\n`;
                }
            }
        }
    }

    // Create and download file
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `planning_${weekKey}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function openRecipeSheetModal() {
    document.getElementById('recipe-sheet-modal').classList.add('active');
}

function closeRecipeSheetModal() {
    document.getElementById('recipe-sheet-modal').classList.remove('active');
}

function generateRecipeSheets(event) {
    event.preventDefault();

    const mealCount = parseInt(document.getElementById('meal-count-input').value) || 200;
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const weekLabel = formatWeekLabel(currentPlanningWeek);

    // Collect unique recipes from the week
    const recipeIds = new Set();
    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        for (const type of ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier']) {
            if (dayData[type]) {
                recipeIds.add(dayData[type]);
            }
        }
    }

    if (recipeIds.size === 0) {
        alert('Aucune recette dans le planning de cette semaine.');
        return;
    }

    // Get full recipe data (need to fetch from JSON for complete ingredient info)
    const weekRecipes = Array.from(recipeIds).map(id => recipes.find(r => r.id === id)).filter(Boolean);

    // Build recipe sheets HTML
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Fiches Recettes - ${weekLabel}</title>
            <style>
                body { font-family: 'Inter', Arial, sans-serif; padding: 0; margin: 0; }
                .recipe-sheet { page-break-after: always; padding: 30px; }
                .recipe-sheet:last-child { page-break-after: auto; }
                .header { border-bottom: 3px solid #1b4332; padding-bottom: 16px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 28px; color: #1b4332; }
                .header-meta { display: flex; justify-content: space-between; margin-top: 8px; }
                .meta-item { font-size: 14px; color: #666; }
                .meta-item strong { color: #1b4332; }
                .portions-badge { 
                    display: inline-block; 
                    background: #e76f51; 
                    color: white; 
                    padding: 8px 16px; 
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 700;
                }
                .section { margin-top: 24px; }
                .section h2 { font-size: 18px; margin: 0 0 12px 0; color: #1b4332; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 10px 12px; text-align: left; }
                th { background: #f5f5f5; font-weight: 600; color: #333; }
                .quantity { font-weight: 700; color: #1b4332; }
                .equipment-grid { display: flex; flex-wrap: wrap; gap: 8px; }
                .equipment-item { 
                    background: #f0f0f0; 
                    padding: 6px 12px; 
                    border-radius: 4px; 
                    font-size: 14px;
                }
                .nutrition-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
                .nutrition-item { text-align: center; padding: 12px; background: #f5f5f5; border-radius: 8px; }
                .nutrition-value { font-size: 20px; font-weight: 700; color: #1b4332; }
                .nutrition-label { font-size: 12px; color: #666; }
                .badges { margin-top: 8px; }
                .badge { 
                    display: inline-block; 
                    padding: 4px 8px; 
                    border-radius: 4px; 
                    font-size: 12px; 
                    margin-right: 6px;
                }
                .badge-veg { background: #d8f3dc; color: #1b4332; }
                .badge-bio { background: #e0f2fe; color: #0369a1; }
                .badge-local { background: #fef3c7; color: #d97706; }
                @media print {
                    @page { margin: 15mm; size: A4; }
                }
            </style>
        </head>
        <body>
    `;

    weekRecipes.forEach(recipe => {
        const typeLabels = {
            'entree': 'Entrée',
            'plat_principal': 'Plat Principal',
            'garniture': 'Garniture',
            'dessert': 'Dessert',
            'produit_laitier': 'Produit Laitier'
        };

        const badges = [];
        if (recipe.vegetarien) badges.push('<span class="badge badge-veg">🌱 Végétarien</span>');
        if (recipe.bio) badges.push('<span class="badge badge-bio">🌿 Bio</span>');
        if (recipe.local) badges.push('<span class="badge badge-local">📍 Local</span>');

        // Get ingredients - try to get from full data or use what's available
        const ingredients = recipe.ingredients || [];

        html += `
            <div class="recipe-sheet">
                <div class="header">
                    <h1>${recipe.nom}</h1>
                    <div class="header-meta">
                        <div>
                            <span class="meta-item">Type: <strong>${typeLabels[recipe.type] || recipe.type}</strong></span>
                            <span class="meta-item" style="margin-left: 24px;">Coût unitaire: <strong>${recipe.cout_portion_euro.toFixed(2)}€</strong></span>
                            <span class="meta-item" style="margin-left: 24px;">CO₂: <strong>${recipe.co2_kg_portion}kg</strong></span>
                            <div class="badges">${badges.join('')}</div>
                        </div>
                        <div class="portions-badge">📏 ${mealCount} portions</div>
                    </div>
                </div>
                
                <div class="section">
                    <h2>📦 Ingrédients</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Ingrédient</th>
                                <th>Quantité / portion</th>
                                <th>Quantité totale</th>
                                <th>Coût estimé</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (ingredients.length > 0) {
            ingredients.forEach(ing => {
                const totalQty = (ing.quantite_kg * mealCount);
                const totalCost = totalQty * (ing.cout_euro_kg || 0);
                html += `
                    <tr>
                        <td>${ing.nom.replace(/_/g, ' ')}</td>
                        <td>${(ing.quantite_kg * 1000).toFixed(0)}g</td>
                        <td class="quantity">${totalQty >= 1 ? totalQty.toFixed(2) + ' kg' : (totalQty * 1000).toFixed(0) + ' g'}</td>
                        <td>${totalCost.toFixed(2)}€</td>
                    </tr>
                `;
            });
        } else {
            html += '<tr><td colspan="4">Ingrédients non disponibles</td></tr>';
        }

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        // Equipment section if available
        const equipment = recipe.equipement || [];
        if (equipment.length > 0) {
            html += `
                <div class="section">
                    <h2>🔧 Équipements nécessaires</h2>
                    <div class="equipment-grid">
                        ${equipment.map(e => `<span class="equipment-item">${e.replace(/_/g, ' ')}</span>`).join('')}
                    </div>
                </div>
            `;
        }

        // Nutrition section
        const nutrition = recipe.nutrition || recipe.nutrition_par_portion;
        if (nutrition) {
            html += `
                <div class="section">
                    <h2>📊 Valeurs nutritionnelles (par portion)</h2>
                    <div class="nutrition-grid">
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.proteines_g || 0}g</div>
                            <div class="nutrition-label">Protéines</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.lipides_g || 0}g</div>
                            <div class="nutrition-label">Lipides</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.glucides_g || 0}g</div>
                            <div class="nutrition-label">Glucides</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.fibres_g || 0}g</div>
                            <div class="nutrition-label">Fibres</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.fer_mg || 0}mg</div>
                            <div class="nutrition-label">Fer</div>
                        </div>
                        <div class="nutrition-item">
                            <div class="nutrition-value">${nutrition.calcium_mg || 0}mg</div>
                            <div class="nutrition-label">Calcium</div>
                        </div>
                    </div>
                </div>
            `;
        }

        html += '</div>'; // End recipe-sheet
    });

    html += '</body></html>';

    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);

    closeRecipeSheetModal();
}

// ============================================
// ANTI-GASPI ALGORITHM
// ============================================

let antiGaspiData = null;
let antiGaspiPanelOpen = true;

// Load anti-gaspi data
async function loadAntiGaspiData() {
    try {
        const response = await fetch('./antigaspi.json');
        if (response.ok) {
            antiGaspiData = await response.json();
            console.log('♻️ Anti-gaspi data loaded successfully');
            // Trigger initial update if we're on the planning page
            if (document.getElementById('antigaspi-card')) {
                updateAntiGaspiPanel();
            }
        } else {
            console.warn('Anti-gaspi JSON not found, using fallback data');
            antiGaspiData = getFallbackAntiGaspiData();
        }
    } catch (e) {
        console.warn('Could not load anti-gaspi data:', e);
        // Use fallback data
        antiGaspiData = getFallbackAntiGaspiData();
    }
}

// Fallback anti-gaspi data
function getFallbackAntiGaspiData() {
    return {
        dechets_par_recette: {
            "r006": [{ nom: "fanes_carottes", quantite_kg: 0.02, type: "fane", label: "Fanes de carottes" },
            { nom: "epluchures_carottes", quantite_kg: 0.015, type: "epluchure", label: "Épluchures de carottes" }],
            "r008": [{ nom: "epluchures_pdt", quantite_kg: 0.03, type: "epluchure", label: "Épluchures de pommes de terre" }],
            "r010": [{ nom: "pelures_pommes", quantite_kg: 0.025, type: "epluchure", label: "Pelures de pommes" }],
            "r005": [{ nom: "coquilles_oeufs", quantite_kg: 0.015, type: "coque", label: "Coquilles d'œufs" }],
            "r002": [{ nom: "os_poulet", quantite_kg: 0.03, type: "reste", label: "Os de poulet" }]
        },
        recettes_valorisation: [
            {
                id: "rv001", nom: "Bouillon de légumes maison", type: "base",
                utilise_dechets: ["epluchures_carottes", "epluchures_pdt", "fanes_carottes"],
                description: "Bouillon nutritif à partir des épluchures", economie_kg: 0.5, co2_evite: 0.15
            },
            {
                id: "rv002", nom: "Chips de légumes", type: "accompagnement",
                utilise_dechets: ["epluchures_pdt", "epluchures_carottes"],
                description: "Chips croustillantes à partir des épluchures", economie_kg: 0.3, co2_evite: 0.08
            },
            {
                id: "rv003", nom: "Pesto de fanes", type: "sauce",
                utilise_dechets: ["fanes_carottes", "fanes_betteraves"],
                description: "Pesto original avec fanes fraîches", economie_kg: 0.2, co2_evite: 0.05
            },
            {
                id: "rv004", nom: "Fond de volaille", type: "base",
                utilise_dechets: ["os_poulet"],
                description: "Fond savoureux pour sauces et potages", economie_kg: 0.4, co2_evite: 0.2
            }
        ],
        types_dechets: {
            "epluchure": { emoji: "🥕", label: "Épluchures" },
            "fane": { emoji: "🌿", label: "Fanes" },
            "reste": { emoji: "🦴", label: "Restes" },
            "coque": { emoji: "🥚", label: "Coques" },
            "zeste": { emoji: "🍋", label: "Zestes" }
        }
    };
}

// Calculate weekly waste from planned recipes
function calculateWeeklyWaste(weekKey) {
    if (!antiGaspiData) {
        console.log('♻️ calculateWeeklyWaste: no antiGaspiData');
        return {};
    }

    const weekData = planningData[weekKey] || {};
    const wasteAggregated = {};

    console.log('♻️ calculateWeeklyWaste weekData:', weekData);
    console.log('♻️ available dechets mappings:', Object.keys(antiGaspiData.dechets_par_recette));

    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};

        for (const type of ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier']) {
            const recipeId = dayData[type];
            if (recipeId) {
                console.log(`♻️ Day ${day}, ${type}: recipe=${recipeId}, hasDechets=${!!antiGaspiData.dechets_par_recette[recipeId]}`);
            }
            if (recipeId && antiGaspiData.dechets_par_recette[recipeId]) {
                const dechets = antiGaspiData.dechets_par_recette[recipeId];

                dechets.forEach(dechet => {
                    if (!wasteAggregated[dechet.nom]) {
                        wasteAggregated[dechet.nom] = {
                            nom: dechet.nom,
                            label: dechet.label,
                            type: dechet.type,
                            quantite_kg: 0
                        };
                    }
                    wasteAggregated[dechet.nom].quantite_kg += dechet.quantite_kg;
                });
            }
        }
    }

    return wasteAggregated;
}

// Find recipes that can valorize the waste
function findWasteMatchingRecipes(wasteData) {
    if (!antiGaspiData || Object.keys(wasteData).length === 0) return [];

    const wasteTypes = Object.keys(wasteData);
    const matches = [];

    antiGaspiData.recettes_valorisation.forEach(recette => {
        const matchingDechets = recette.utilise_dechets.filter(d => wasteTypes.includes(d));

        if (matchingDechets.length > 0) {
            // Calculate match score (percentage of waste types this recipe can use)
            const matchScore = matchingDechets.length / wasteTypes.length;

            // Calculate total waste quantity this recipe can valorize
            const valorizedQty = matchingDechets.reduce((sum, d) => {
                return sum + (wasteData[d]?.quantite_kg || 0);
            }, 0);

            matches.push({
                ...recette,
                matchScore,
                matchingDechets,
                valorizedQty
            });
        }
    });

    // Sort by match score and valorized quantity
    matches.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        return b.valorizedQty - a.valorizedQty;
    });

    return matches.slice(0, 3); // Return top 3 suggestions
}

// Calculate valorization score (0-100%)
function calculateValorizationScore(wasteData, suggestions) {
    if (Object.keys(wasteData).length === 0) return 0;

    const totalWasteTypes = Object.keys(wasteData).length;
    const valorizedTypes = new Set();

    suggestions.forEach(s => {
        s.matchingDechets.forEach(d => valorizedTypes.add(d));
    });

    return Math.round((valorizedTypes.size / totalWasteTypes) * 100);
}

// Toggle anti-gaspi panel
function toggleAntiGaspiPanel() {
    antiGaspiPanelOpen = !antiGaspiPanelOpen;
    const content = document.getElementById('antigaspi-content');
    const icon = document.getElementById('antigaspi-collapse-icon');

    if (content) {
        content.style.display = antiGaspiPanelOpen ? 'block' : 'none';
    }
    if (icon) {
        icon.textContent = antiGaspiPanelOpen ? '▼' : '▶';
    }
}

// Update anti-gaspi panel UI
function updateAntiGaspiPanel() {
    // Check if panel exists
    const panelCard = document.getElementById('antigaspi-card');
    if (!panelCard) {
        return; // Not on planning page
    }

    if (!antiGaspiData) {
        console.log('♻️ Anti-gaspi data not loaded yet, loading...');
        loadAntiGaspiData().then(() => updateAntiGaspiPanel());
        return;
    }

    const weekKey = getWeekKey(currentPlanningWeek);
    const wasteData = calculateWeeklyWaste(weekKey);
    const suggestions = findWasteMatchingRecipes(wasteData);
    const score = calculateValorizationScore(wasteData, suggestions);

    console.log('♻️ Anti-gaspi update:', {
        weekKey,
        wasteCount: Object.keys(wasteData).length,
        wasteData,
        suggestionsCount: suggestions.length,
        score
    });

    // Update score badge
    const scoreEl = document.getElementById('antigaspi-score');
    if (scoreEl) {
        if (Object.keys(wasteData).length === 0) {
            scoreEl.textContent = '--';
            scoreEl.style.background = 'var(--text-muted)';
        } else {
            scoreEl.textContent = `${score}%`;
            if (score >= 70) {
                scoreEl.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            } else if (score >= 40) {
                scoreEl.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            } else {
                scoreEl.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            }
        }
    }

    // Update waste summary
    const wasteSummaryEl = document.getElementById('waste-summary');
    if (wasteSummaryEl) {
        if (Object.keys(wasteData).length === 0) {
            wasteSummaryEl.innerHTML = `
                <div class="waste-empty">
                    <span>📊</span>
                    <p>Ajoutez des recettes au planning pour voir les déchets valorisables</p>
                </div>
            `;
        } else {
            const wasteItems = Object.values(wasteData).map(w => {
                const typeInfo = antiGaspiData.types_dechets[w.type] || { emoji: '♻️', label: w.type };
                const qtyDisplay = w.quantite_kg >= 0.1
                    ? `${w.quantite_kg.toFixed(2)} kg`
                    : `${(w.quantite_kg * 1000).toFixed(0)} g`;
                return `
                    <div class="waste-item">
                        <span class="waste-emoji">${typeInfo.emoji}</span>
                        <span class="waste-label">${w.label}</span>
                        <span class="waste-qty">${qtyDisplay}</span>
                    </div>
                `;
            }).join('');

            const totalWaste = Object.values(wasteData).reduce((sum, w) => sum + w.quantite_kg, 0);

            wasteSummaryEl.innerHTML = `
                <div class="waste-header">
                    <span>🗑️ Déchets valorisables</span>
                    <span class="waste-total">${(totalWaste * 1000).toFixed(0)}g total</span>
                </div>
                <div class="waste-list">${wasteItems}</div>
            `;
        }
    }

    // Update suggestions
    const suggestionsEl = document.getElementById('waste-suggestions');
    const suggestionsList = document.getElementById('suggestions-list');

    if (suggestionsEl && suggestionsList) {
        if (suggestions.length === 0) {
            suggestionsEl.style.display = 'none';
        } else {
            suggestionsEl.style.display = 'block';

            suggestionsList.innerHTML = suggestions.map(s => {
                const matchPercent = Math.round(s.matchScore * 100);
                return `
                    <div class="waste-suggestion-item" onclick="showSuggestionDetails('${s.id}')">
                        <div class="suggestion-header">
                            <span class="suggestion-name">${s.nom}</span>
                            <span class="suggestion-match">${matchPercent}%</span>
                        </div>
                        <div class="suggestion-desc">${s.description}</div>
                        <div class="suggestion-badges">
                            <span class="suggestion-badge">🌍 ${s.co2_evite}kg CO₂ évité</span>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Update stats
    const statsEl = document.getElementById('antigaspi-stats');
    if (statsEl) {
        if (suggestions.length > 0) {
            statsEl.style.display = 'flex';

            const totalCo2Evite = suggestions.reduce((sum, s) => sum + s.co2_evite, 0);
            const totalEconomie = suggestions.reduce((sum, s) => sum + (s.economie_kg * 2), 0); // ~2€/kg saved

            const co2El = document.getElementById('co2-evite');
            const economieEl = document.getElementById('economie-estimee');

            if (co2El) co2El.textContent = `${totalCo2Evite.toFixed(2)} kg`;
            if (economieEl) economieEl.textContent = `${totalEconomie.toFixed(2)} €`;
        } else {
            statsEl.style.display = 'none';
        }
    }

    // Show/hide AI suggestions button
    const aiActionEl = document.getElementById('ai-suggestions-action');
    if (aiActionEl) {
        aiActionEl.style.display = Object.keys(wasteData).length > 0 ? 'block' : 'none';
    }
}

// Show suggestion details (could open a modal or tooltip)
function showSuggestionDetails(suggestionId) {
    if (!antiGaspiData) return;

    const suggestion = antiGaspiData.recettes_valorisation.find(r => r.id === suggestionId);
    if (!suggestion) return;

    // Create a simple alert for now (could be enhanced to a modal)
    const dechetsUtilises = suggestion.utilise_dechets
        .map(d => {
            const wasteInfo = antiGaspiData.types_dechets[d.split('_')[0]] || {};
            return `${wasteInfo.emoji || '♻️'} ${d.replace(/_/g, ' ')}`;
        })
        .join('\n');

    alert(`${suggestion.nom}\n\n${suggestion.description}\n\nDéchets valorisés:\n${dechetsUtilises}\n\n🌍 CO₂ évité: ${suggestion.co2_evite}kg\n💰 Économie: ~${(suggestion.economie_kg * 2).toFixed(2)}€`);
}

// Get AI-powered suggestions from Gemini
async function getAIAntiGaspiSuggestions() {
    const weekKey = getWeekKey(currentPlanningWeek);
    const weekData = planningData[weekKey] || {};
    const wasteData = calculateWeeklyWaste(weekKey);
    const suggestions = findWasteMatchingRecipes(wasteData);
    const score = calculateValorizationScore(wasteData, suggestions);

    // Collect recipes from planning
    const plannedRecipes = [];
    for (let day = 0; day < 5; day++) {
        const dayData = weekData[day] || {};
        for (const type of ['entree', 'plat_principal', 'garniture', 'dessert', 'produit_laitier']) {
            const recipeId = dayData[type];
            if (recipeId) {
                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    plannedRecipes.push({ nom: recipe.nom, type: recipe.type, id: recipe.id });
                }
            }
        }
    }

    // Find all relevant buttons and elements (sidebar + page)
    const btns = document.querySelectorAll('.btn-ai, .btn-primary[onclick*="getAIAntiGaspiSuggestions"]');

    // Sidebar elements
    const resultsEl = document.getElementById('ai-suggestions-results');
    const listEl = document.getElementById('ai-suggestions-list');
    const conseilEl = document.getElementById('ai-conseil-general');

    // Anti-Gaspi page elements
    const pageAiContent = document.getElementById('antigaspi-ai-content');

    // Show loading state
    btns.forEach(btn => {
        btn.innerHTML = '<span>⏳</span> Analyse en cours...';
        btn.disabled = true;
    });

    try {
        const response = await fetch(`${API_URL}/antigaspi/suggestions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipes: plannedRecipes,
                waste_data: wasteData,
                current_score: score
            })
        });

        const data = await response.json();

        const impactColors = {
            'high': '#22c55e',
            'medium': '#f59e0b',
            'low': '#6b7280'
        };

        const categorieIcons = {
            'valorisation': '♻️',
            'menu': '📅',
            'pedagogie': '📚'
        };

        const suggestionsHTML = data.suggestions.map(s => `
            <div class="ai-suggestion-item">
                <div class="ai-suggestion-header">
                    <span class="ai-suggestion-cat">${categorieIcons[s.categorie] || '💡'}</span>
                    <span class="ai-suggestion-title">${s.titre}</span>
                    <span class="ai-suggestion-impact" style="background: ${impactColors[s.impact] || impactColors.medium}">${s.impact}</span>
                </div>
                <p class="ai-suggestion-desc">${s.description}</p>
            </div>
        `).join('');

        const sourceHTML = data.source === 'gemini'
            ? '<div class="ai-source">✨ Généré par Gemini AI</div>'
            : '';

        // Update sidebar panel
        if (resultsEl && listEl) {
            resultsEl.style.display = 'block';
            if (conseilEl && data.conseil_general) {
                conseilEl.innerHTML = `<p>${data.conseil_general}</p>`;
            }
            listEl.innerHTML = suggestionsHTML + sourceHTML;
        }

        // Update Anti-Gaspi page
        if (pageAiContent) {
            pageAiContent.innerHTML = `
                <div class="ai-conseil-box">
                    <p>${data.conseil_general || 'Analyse terminée'}</p>
                </div>
                <div class="ai-suggestions-list">
                    ${suggestionsHTML}
                </div>
                ${sourceHTML}
            `;
        }

    } catch (error) {
        console.error('AI suggestions error:', error);
        const errorHTML = '<p class="ai-error">❌ Erreur lors de la récupération des suggestions. Vérifiez que le backend est lancé.</p>';

        if (listEl) {
            listEl.innerHTML = errorHTML;
            resultsEl.style.display = 'block';
        }
        if (pageAiContent) {
            pageAiContent.innerHTML = errorHTML;
        }
    } finally {
        btns.forEach(btn => {
            btn.innerHTML = '<span>🤖</span> Analyser avec IA';
            btn.disabled = false;
        });
    }
}

// Variable to track pending valorization recipe
let pendingValorizationRecipe = null;

// Render the Anti-Gaspi view
function renderAntiGaspiView() {
    if (!antiGaspiData) {
        loadAntiGaspiData().then(() => renderAntiGaspiView());
        return;
    }

    const weekKey = getWeekKey(currentPlanningWeek);
    const wasteData = calculateWeeklyWaste(weekKey);
    const suggestions = findWasteMatchingRecipes(wasteData);
    const score = calculateValorizationScore(wasteData, suggestions);

    // Update week label
    const weekLabel = document.getElementById('antigaspi-week-label');
    if (weekLabel) {
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + currentPlanningWeek * 7);
        const weekNum = getWeekNumber(currentDate);
        weekLabel.textContent = `Semaine ${weekNum}`;
    }

    // Update main score
    const scoreMain = document.getElementById('antigaspi-score-main');
    if (scoreMain) {
        const scoreValue = scoreMain.querySelector('.score-value');
        if (scoreValue) {
            scoreValue.textContent = Object.keys(wasteData).length > 0 ? `${score}%` : '--';
        }
        // Color based on score
        if (score >= 70) {
            scoreMain.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
        } else if (score >= 40) {
            scoreMain.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        } else {
            scoreMain.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        }
    }

    // Render waste list
    const wasteListEl = document.getElementById('antigaspi-waste-list');
    if (wasteListEl) {
        const wasteEntries = Object.entries(wasteData);
        if (wasteEntries.length === 0) {
            wasteListEl.innerHTML = `
                <div class="waste-empty-large">
                    <span>📋</span>
                    <p>Ajoutez des recettes au planning pour voir les déchets générés</p>
                    <a href="#" onclick="showView('planning'); return false;">→ Aller au Planning</a>
                </div>
            `;
        } else {
            const totalWaste = wasteEntries.reduce((sum, [_, w]) => sum + w.quantite_kg, 0);
            wasteListEl.innerHTML = `
                <div class="waste-list-header">
                    <span>Type de déchet</span>
                    <span>Quantité</span>
                </div>
                ${wasteEntries.map(([key, waste]) => {
                const typeInfo = antiGaspiData.types_dechets[waste.type] || { emoji: '♻️', label: waste.type };
                const qtyDisplay = waste.quantite_kg >= 1
                    ? `${waste.quantite_kg.toFixed(2)} kg`
                    : `${Math.round(waste.quantite_kg * 1000)} g`;
                return `
                        <div class="waste-list-item">
                            <span class="waste-icon">${typeInfo.emoji}</span>
                            <span class="waste-name">${waste.label}</span>
                            <span class="waste-qty">${qtyDisplay}</span>
                        </div>
                    `;
            }).join('')}
                <div class="waste-list-total">
                    <span>Total valorisable</span>
                    <span>${totalWaste >= 1 ? `${totalWaste.toFixed(2)} kg` : `${Math.round(totalWaste * 1000)} g`}</span>
                </div>
            `;

            // Update stats
            document.getElementById('stat-waste-total').textContent =
                totalWaste >= 1 ? `${totalWaste.toFixed(2)} kg` : `${Math.round(totalWaste * 1000)} g`;
        }
    }

    // Render valorization recipes grid
    const gridEl = document.getElementById('valorization-recipes-grid');
    const countEl = document.getElementById('valorization-count');
    if (gridEl && antiGaspiData.recettes_valorisation) {
        const recipes = antiGaspiData.recettes_valorisation;
        countEl.textContent = recipes.length;

        gridEl.innerHTML = recipes.map(recipe => {
            // Check if this recipe matches current waste
            const wasteTypes = Object.keys(wasteData);
            const matchingWaste = recipe.utilise_dechets.filter(d =>
                wasteTypes.some(w => wasteData[w]?.nom === d || w === d)
            );
            const isMatch = matchingWaste.length > 0;

            return `
                <div class="valorization-card ${isMatch ? 'valorization-match' : ''}">
                    <div class="valorization-header">
                        <span class="valorization-type">${recipe.type}</span>
                        ${isMatch ? '<span class="valorization-badge">✓ Compatible</span>' : ''}
                    </div>
                    <h4 class="valorization-name">${recipe.nom}</h4>
                    <p class="valorization-desc">${recipe.description}</p>
                    <div class="valorization-stats">
                        <span>🌍 ${recipe.co2_evite} kg</span>
                        <span>💰 ~${(recipe.economie_kg * 2).toFixed(2)} €</span>
                    </div>
                    <button class="btn btn-outline btn-sm" onclick="openValorizationModal('${recipe.id}')">
                        + Ajouter au planning
                    </button>
                </div>
            `;
        }).join('');

        // Update potential stats
        const totalCo2 = suggestions.reduce((sum, s) => sum + s.co2_evite, 0);
        const totalEco = suggestions.reduce((sum, s) => sum + (s.economie_kg * 2), 0);
        document.getElementById('stat-co2-total').textContent = `${totalCo2.toFixed(2)} kg`;
        document.getElementById('stat-economie-total').textContent = `${totalEco.toFixed(2)} €`;
    }
}

// Open valorization modal
function openValorizationModal(recipeId) {
    const recipe = antiGaspiData.recettes_valorisation.find(r => r.id === recipeId);
    if (!recipe) return;

    pendingValorizationRecipe = recipe;

    document.getElementById('valorization-modal-title').textContent = `Ajouter "${recipe.nom}"`;
    document.getElementById('valorization-modal-desc').textContent = recipe.description;

    // Pre-select type based on recipe type
    const typeSelect = document.getElementById('valorization-type');
    const typeMapping = {
        'base': 'plat_principal',
        'accompagnement': 'garniture',
        'sauce': 'garniture',
        'dessert': 'dessert',
        'condiment': 'garniture',
        'autre': 'garniture'
    };
    typeSelect.value = typeMapping[recipe.type] || 'garniture';

    document.getElementById('valorization-modal').classList.add('active');
}

// Close valorization modal
function closeValorizationModal() {
    document.getElementById('valorization-modal').classList.remove('active');
    pendingValorizationRecipe = null;
}

// Confirm adding valorization recipe to planning
function confirmAddValorization() {
    if (!pendingValorizationRecipe) return;

    const day = parseInt(document.getElementById('valorization-day').value);
    const type = document.getElementById('valorization-type').value;
    const weekKey = getWeekKey(currentPlanningWeek);

    // We need to add this recipe to the main recipes array first if it doesn't exist
    // For now, we'll create a simple recipe entry
    const recipeId = pendingValorizationRecipe.id;

    // Check if recipe exists in recipes array
    let recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) {
        // Add as a new recipe
        recipe = {
            id: recipeId,
            nom: pendingValorizationRecipe.nom,
            type: type,
            vegetarien: true,
            bio: true,
            local: true,
            cout_portion_euro: 0.30, // Low cost since made from waste
            co2_kg_portion: -pendingValorizationRecipe.co2_evite, // Negative = CO2 saved
            tags: ['anti-gaspi', 'valorisation'],
            ingredients: []
        };
        recipes.push(recipe);
    }

    // Add to planning
    if (!planningData[weekKey]) planningData[weekKey] = {};
    if (!planningData[weekKey][day]) planningData[weekKey][day] = {};
    planningData[weekKey][day][type] = recipeId;

    savePlanningToStorage();
    closeValorizationModal();

    // Refresh views
    renderAntiGaspiView();

    // Show success toast
    showToast(`"${pendingValorizationRecipe.nom}" ajouté au planning !`, 'success');
}

// Simple toast notification
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ️'}</span> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Helper function to get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Update showView to trigger Anti-Gaspi render
const originalShowView = showView;
showView = function (viewName) {
    originalShowView(viewName);
    if (viewName === 'antigaspi') {
        renderAntiGaspiView();
    } else if (viewName === 'etablissements') {
        renderEtablissementsList();
    }
};

// Initialize anti-gaspi on load
document.addEventListener('DOMContentLoaded', () => {
    loadAntiGaspiData();
});


// ============================================
// ETABLISSEMENTS MANAGEMENT
// ============================================

async function loadEtablissements() {
    try {
        const response = await fetch(`${API_URL}/etablissements`);
        if (!response.ok) throw new Error('Failed to load etablissements');
        allEtablissements = await response.json();

        // Populate selector
        const selector = document.getElementById('etablissement-selector');
        if (selector) {
            selector.innerHTML = '<option value="">-- Choisir un Etablissement --</option>';

            allEtablissements.forEach(etab => {
                const option = document.createElement('option');
                option.value = etab.id;
                option.textContent = etab.nom;
                selector.appendChild(option);
            });

            // Select first one by default if none selected
            if (!currentEtablissement && allEtablissements.length > 0) {
                selectEtablissement(allEtablissements[0].id);
                selector.value = allEtablissements[0].id;
            }
        }

        // Render list if view is active
        if (currentView === 'etablissements') {
            renderEtablissementsList();
        }

    } catch (error) {
        console.error('Error loading etablissements:', error);
    }
}

function selectEtablissement(etabId) {
    if (!etabId) return;

    currentEtablissement = allEtablissements.find(e => e.id === etabId);
    if (!currentEtablissement) return;

    console.log('Selected establishment:', currentEtablissement);

    // Update config panel in generator if exists
    const nameInput = document.getElementById('input-nom');
    const budgetInput = document.getElementById('input-budget');
    const budgetValue = document.getElementById('budget-value');

    if (nameInput) nameInput.value = currentEtablissement.nom;
    if (budgetInput && currentEtablissement.budget_max_par_repas) {
        budgetInput.value = currentEtablissement.budget_max_par_repas;
        if (budgetValue) budgetValue.textContent = currentEtablissement.budget_max_par_repas.toFixed(2) + '€';
    }

    // Refresh view
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        // Only update if it's the dashboard or planning subtitle
        if (currentView === 'dashboard' || currentView === 'planning') {
            // Keep original text prefix? For now just replace
            // subtitle.textContent = currentEtablissement.nom;
        }
    }

    // Update dashboard header if needed
    // ...
}

function renderEtablissementsList() {
    const grid = document.getElementById('etablissements-grid');
    if (!grid) return;

    grid.innerHTML = allEtablissements.map(etab => `
        <div class="card etablissement-card type-${etab.type}">
            <div class="etablissement-header">
                <h3 class="etablissement-title">${etab.nom}</h3>
                <span class="etablissement-badge">${etab.type}</span>
            </div>
            <div class="etablissement-details">
                <div class="detail-row">
                    <span>👥</span>
                    <span>${etab.convives.reduce((sum, c) => sum + c.effectif, 0)} convives</span>
                </div>
                <div class="detail-row">
                    <span>💰</span>
                    <span>${etab.budget_max_par_repas.toFixed(2)}€ / repas</span>
                </div>
                <div class="detail-row">
                    <span>📍</span>
                    <span>${etab.adresse.ville}</span>
                </div>
            </div>
            <div class="etablissement-actions">
                <button class="btn btn-outline btn-sm" onclick="editEtablissement('${etab.id}')">✏️ Configurer</button>
            </div>
        </div>
    `).join('');
}

function switchEtabTab(tabName) {
    // Buttons
    document.querySelectorAll('.btn-tab').forEach(btn => btn.classList.remove('active'));
    // Find the button that was clicked (might be hard due to event context, so rely on direct element click passing logic if possible, or query)
    // Actually the onClick passes 'list' or 'bulk'. We can find the button by its onclick attribute or just add class to all and manage state manually?
    // Let's assume the user clicked the button which triggered this.
    const buttons = document.querySelectorAll('.btn-tab');
    buttons.forEach(b => {
        if (b.textContent.includes(tabName === 'list' ? 'Liste' : 'Commandes')) b.classList.add('active');
    });


    // Content
    document.querySelectorAll('.etab-tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(`etab-tab-${tabName}`).style.display = 'block';

    if (tabName === 'bulk') {
        loadBulkOrders();
    }
}

async function loadBulkOrders() {
    const tbody = document.getElementById('bulk-orders-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Chargement des données agrégées...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/commandes/agregation`);
        if (!response.ok) throw new Error('API Error');

        const data = await response.json();

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune donnée pour cette semaine.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(item => `
            <tr>
                <td>
                    <strong>${item.ingredient}</strong>
                </td>
                <td>
                    <span style="font-size: 1.1em; font-weight: bold;">${item.quantite_totale_kg} kg</span>
                </td>
                <td>
                    <span class="badge" style="background:#E3F2FD; color:#1565C0;">${item.nb_etablissements} cantines</span>
                </td>
                <td>
                    <div style="font-weight:500">${item.fournisseur.nom}</div>
                    ${item.seuil_atteint ? '<span class="badge success" style="font-size:0.7em; margin-top:4px;">🎯 Palier gros volume atteint</span>' : ''}
                </td>
                <td>
                    <div><span class="price-gros">${item.prix_unitaire_moyen.toFixed(2)}€</span> / kg</div>
                    ${item.economie > 0 ? `<div style="text-decoration: line-through; color: #999; font-size: 0.8em;">${item.prix_unitaire_detail.toFixed(2)}€</div>` : ''}
                </td>
                <td>
                    ${item.economie > 0 ?
                `<span class="economy-tag">-${item.economie.toFixed(2)}€ économisés</span>` :
                '<span style="color:#999">-</span>'}
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading bulk orders:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center error">Erreur lors du chargement des données.</td></tr>';
    }
}

function exportBonDeCommande() {
    alert("Génération des bons de commande PDF par fournisseur... (Fonctionnalité Démo)");
}

function openEtablissementModal(id = null) {
    if (id) {
        alert("Édition de l'établissement " + id + " (À implémenter)");
    } else {
        alert("Création d'un nouvel établissement (À implémenter)");
    }

}

function editEtablissement(id) {
    openEtablissementModal(id);
}


// ============================================
// STOCKS MANAGEMENT
// ============================================

let allStocks = [];
let filteredStocks = [];

// Fetch stocks from API
async function fetchStocks() {
    try {
        const response = await fetch(`${API_URL}/stocks`);
        if (!response.ok) throw new Error('Failed to load stocks');
        const data = await response.json();
        allStocks = data.stocks || [];
        filteredStocks = [...allStocks];
        renderStocks();
        fetchStockAlerts();
    } catch (error) {
        console.error('Error loading stocks:', error);
        allStocks = [];
        filteredStocks = [];
        renderStocks();
    }
}

// Render stocks table
function renderStocks() {
    const tbody = document.getElementById('stocks-tbody');
    if (!tbody) return;

    if (filteredStocks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">
                    <div class="empty-state small">
                        <span>📦</span>
                        <p>Aucun stock trouvé</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const categoryLabels = {
        'legumes': 'Légumes',
        'legumineuses': 'Légumineuses',
        'viande': 'Viande',
        'produit_laitier': 'Produits laitiers',
        'feculents': 'Féculents',
        'epicerie': 'Épicerie',
        'oeufs': 'Œufs',
        'poisson': 'Poisson'
    };

    tbody.innerHTML = filteredStocks.map(stock => {
        const statusBadge = getStatusBadge(stock.statut);
        const dlcDisplay = stock.dlc ? formatDate(stock.dlc) : '-';
        const dlcClass = isDlcClose(stock.dlc) ? 'dlc-warning' : '';

        return `
            <tr>
                <td><strong>${stock.produit_nom}</strong></td>
                <td>${categoryLabels[stock.categorie] || stock.categorie || '-'}</td>
                <td><strong>${stock.quantite_actuelle}</strong> ${stock.unite}</td>
                <td>${stock.quantite_min} ${stock.unite}</td>
                <td>${statusBadge}</td>
                <td>${stock.emplacement || '-'}</td>
                <td class="${dlcClass}">${dlcDisplay}</td>
                <td>${stock.fournisseur_nom || '-'}</td>
                <td class="actions-cell">
                    <button class="btn btn-icon btn-sm" onclick="openMovementModal('${stock.id}')" title="Mouvement">
                        📦
                    </button>
                    <button class="btn btn-icon btn-sm" onclick="openStockModal('${stock.id}')" title="Modifier">
                        ✏️
                    </button>
                    <button class="btn btn-icon btn-sm danger" onclick="deleteStock('${stock.id}')" title="Supprimer">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Get status badge HTML
function getStatusBadge(statut) {
    const badges = {
        'ok': '<span class="status-badge status-ok">✅ OK</span>',
        'bas': '<span class="status-badge status-low">⚠️ Bas</span>',
        'rupture': '<span class="status-badge status-out">🚨 Rupture</span>'
    };
    return badges[statut] || badges['ok'];
}

// Format date
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
}

// Check if DLC is close (within 3 days)
function isDlcClose(dateStr) {
    if (!dateStr) return false;
    const dlc = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.ceil((dlc - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
}

// Filter stocks
function filterStocks() {
    const searchTerm = document.getElementById('stock-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('stock-filter-category')?.value || '';
    const statusFilter = document.getElementById('stock-filter-status')?.value || '';

    filteredStocks = allStocks.filter(stock => {
        const matchesSearch = !searchTerm ||
            stock.produit_nom.toLowerCase().includes(searchTerm) ||
            (stock.fournisseur_nom && stock.fournisseur_nom.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || stock.categorie === categoryFilter;
        const matchesStatus = !statusFilter || stock.statut === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    renderStocks();
}

// Fetch stock alerts (quantity + DLC)
async function fetchStockAlerts() {
    try {
        // Fetch both quantity alerts and DLC alerts in parallel
        const [stockResponse, dlcResponse] = await Promise.all([
            fetch(`${API_URL}/stocks/alertes`),
            fetch(`${API_URL}/stocks/alertes/dlc?jours=7`)
        ]);

        const stockData = stockResponse.ok ? await stockResponse.json() : { count: 0, alertes: [] };
        const dlcData = dlcResponse.ok ? await dlcResponse.json() : { count: 0, alertes: [] };

        const alertsList = document.getElementById('alerts-list');
        const alertsCount = document.getElementById('alerts-count');

        const totalAlerts = (stockData.count || 0) + (dlcData.count || 0);

        if (alertsCount) {
            alertsCount.textContent = totalAlerts;
            alertsCount.style.display = totalAlerts > 0 ? 'inline' : 'none';
        }

        if (alertsList) {
            if (totalAlerts === 0) {
                alertsList.innerHTML = `
                    <div class="empty-state small">
                        <span>✅</span>
                        <p>Aucune alerte</p>
                    </div>
                `;
            } else {
                let html = '';

                // Stock quantity alerts
                if (stockData.count > 0) {
                    html += `<div class="alerts-section-title">📦 Stock bas (${stockData.count})</div>`;
                    html += stockData.alertes.map(alert => `
                        <div class="alert-item alert-${alert.statut}">
                            <span class="alert-icon">${alert.statut === 'rupture' ? '🚨' : '⚠️'}</span>
                            <div class="alert-content">
                                <strong>${alert.produit_nom}</strong>
                                <span>${alert.quantite_actuelle} ${alert.unite} / min. ${alert.quantite_min}</span>
                            </div>
                            <button class="btn btn-sm" onclick="openMovementModal('${alert.id}')">+</button>
                        </div>
                    `).join('');
                }

                // DLC alerts
                if (dlcData.count > 0) {
                    html += `<div class="alerts-section-title">🔥 DLC proche (${dlcData.count})</div>`;
                    html += dlcData.alertes.map(alert => {
                        const urgenceClass = alert.urgence_dlc === 'perdu' ? 'dlc-perdu' :
                            alert.urgence_dlc === 'critique' ? 'dlc-critique' :
                                alert.urgence_dlc === 'haute' ? 'dlc-haute' : 'dlc-moyenne';
                        return `
                            <div class="alert-item alert-dlc ${urgenceClass}">
                                <span class="alert-icon">${alert.urgence_dlc === 'perdu' ? '☠️' : '🔥'}</span>
                                <div class="alert-content">
                                    <strong>${alert.produit_nom}</strong>
                                    <span>DLC: ${alert.statut_dlc}</span>
                                </div>
                                <span class="dlc-badge">${alert.quantite_actuelle} ${alert.unite}</span>
                            </div>
                        `;
                    }).join('');
                }

                alertsList.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error loading alerts:', error);
    }
}

// Open stock modal (add or edit)
function openStockModal(stockId = null) {
    const modal = document.getElementById('stock-modal');
    const title = document.getElementById('stock-modal-title');
    const form = document.getElementById('stock-form');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('stock-id').value = '';

    if (stockId) {
        const stock = allStocks.find(s => s.id === stockId);
        if (stock) {
            title.textContent = '✏️ Modifier le Stock';
            document.getElementById('stock-id').value = stock.id;
            document.getElementById('stock-produit-nom').value = stock.produit_nom;
            document.getElementById('stock-categorie').value = stock.categorie || '';
            document.getElementById('stock-quantite').value = stock.quantite_actuelle;
            document.getElementById('stock-unite').value = stock.unite;
            document.getElementById('stock-quantite-min').value = stock.quantite_min || 0;
            document.getElementById('stock-emplacement').value = stock.emplacement || '';
            document.getElementById('stock-dlc').value = stock.dlc || '';
            document.getElementById('stock-fournisseur-nom').value = stock.fournisseur_nom || '';
        }
    } else {
        title.textContent = '➕ Ajouter un Stock';
    }

    modal.classList.add('active');
}

// Close stock modal
function closeStockModal() {
    document.getElementById('stock-modal')?.classList.remove('active');
}

// Save stock (create or update)
async function saveStock(event) {
    event.preventDefault();

    const stockId = document.getElementById('stock-id').value;
    const stockData = {
        produit_nom: document.getElementById('stock-produit-nom').value,
        categorie: document.getElementById('stock-categorie').value,
        quantite_actuelle: parseFloat(document.getElementById('stock-quantite').value),
        unite: document.getElementById('stock-unite').value,
        quantite_min: parseFloat(document.getElementById('stock-quantite-min').value) || 0,
        emplacement: document.getElementById('stock-emplacement').value,
        dlc: document.getElementById('stock-dlc').value || null,
        fournisseur_nom: document.getElementById('stock-fournisseur-nom').value
    };

    try {
        const url = stockId
            ? `${API_URL}/stocks/${stockId}`
            : `${API_URL}/stocks`;
        const method = stockId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stockData)
        });

        if (!response.ok) throw new Error('Failed to save stock');

        closeStockModal();
        fetchStocks();
        showToast(stockId ? 'Stock modifié !' : 'Stock ajouté !', 'success');

    } catch (error) {
        console.error('Error saving stock:', error);
        showToast('Erreur lors de l\'enregistrement', 'error');
    }
}

// Delete stock
async function deleteStock(stockId) {
    if (!confirm('Supprimer ce stock ?')) return;

    try {
        const response = await fetch(`${API_URL}/stocks/${stockId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete stock');

        fetchStocks();
        showToast('Stock supprimé', 'success');

    } catch (error) {
        console.error('Error deleting stock:', error);
        showToast('Erreur lors de la suppression', 'error');
    }
}

// Open movement modal
function openMovementModal(stockId) {
    const modal = document.getElementById('movement-modal');
    const infoEl = document.getElementById('movement-stock-info');
    const form = document.getElementById('movement-form');

    if (!modal || !form) return;

    const stock = allStocks.find(s => s.id === stockId);
    if (!stock) return;

    form.reset();
    document.getElementById('movement-stock-id').value = stockId;

    if (infoEl) {
        infoEl.innerHTML = `
            <div class="stock-info-card">
                <strong>${stock.produit_nom}</strong>
                <span class="stock-qty">${stock.quantite_actuelle} ${stock.unite}</span>
            </div>
        `;
    }

    modal.classList.add('active');
}

// Close movement modal
function closeMovementModal() {
    document.getElementById('movement-modal')?.classList.remove('active');
}

// Record stock movement
async function recordMovement(event) {
    event.preventDefault();

    const stockId = document.getElementById('movement-stock-id').value;
    const movementType = document.querySelector('input[name="movement-type"]:checked')?.value;
    const quantite = parseFloat(document.getElementById('movement-quantite').value);
    const motif = document.getElementById('movement-motif').value;

    if (!movementType) {
        showToast('Sélectionnez un type de mouvement', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/stocks/${stockId}/mouvement`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: movementType,
                quantite,
                motif
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to record movement');
        }

        const data = await response.json();
        closeMovementModal();
        fetchStocks();
        showToast(`Mouvement enregistré ! Nouveau stock: ${data.nouvelle_quantite}`, 'success');

    } catch (error) {
        console.error('Error recording movement:', error);
        showToast(error.message || 'Erreur lors de l\'enregistrement', 'error');
    }
}

// Calculate needs from planning
async function calculateNeeds() {
    const needsGrid = document.getElementById('needs-grid');
    if (!needsGrid) return;

    needsGrid.innerHTML = '<div class="loading">⏳ Calcul des besoins...</div>';

    try {
        const weekNum = getWeekNumber(new Date()) + currentPlanningWeek;
        const response = await fetch(`${API_URL}/stocks/besoins/S${weekNum}`);
        if (!response.ok) throw new Error('Failed to calculate needs');

        const data = await response.json();

        if (data.besoins.length === 0) {
            needsGrid.innerHTML = `
                <div class="empty-state small">
                    <span>📊</span>
                    <p>Aucun besoin calculé</p>
                </div>
            `;
            return;
        }

        needsGrid.innerHTML = `
            <div class="needs-summary">
                <span class="needs-count">${data.a_commander} produit(s) à commander</span>
                <span class="needs-info">📋 ${data.nb_recettes || 0} recettes • 👥 ${data.convives || 150} convives</span>
            </div>
            <div class="needs-table">
                ${data.besoins.map(need => {
            const isShort = need.statut === 'commander';
            const recipesText = need.recettes?.length ? need.recettes.join(', ') : '';
            return `
                        <div class="need-row ${isShort ? 'need-short' : ''}">
                            <div class="need-info-col">
                                <div class="need-name">${need.ingredient}</div>
                                ${recipesText ? `<div class="need-recipes" title="${recipesText}">📖 ${need.recettes.length} recette(s)</div>` : ''}
                            </div>
                            <div class="need-qty">
                                <span class="need-stock">${need.quantite_stock}</span>
                                <span class="need-divider">/</span>
                                <span class="need-required">${need.quantite_besoin}</span>
                                <span class="need-unit">${need.unite}</span>
                            </div>
                            <div class="need-diff ${isShort ? 'negative' : 'positive'}">
                                ${need.difference > 0 ? '+' : ''}${need.difference}
                            </div>
                            ${isShort ? `<span class="need-badge">Commander</span>` : ''}
                        </div>
                    `;
        }).join('')}
            </div>
            ${data.a_commander > 0 ? `
                <div class="needs-actions">
                    <button class="btn btn-primary" onclick="generateOrdersFromNeeds()">
                        📦 Générer les commandes (${data.a_commander} produits)
                    </button>
                </div>
            ` : ''}
        `;

        // Store needs data for order generation
        window.currentNeedsData = data;


    } catch (error) {
        console.error('Error calculating needs:', error);
        needsGrid.innerHTML = `
            <div class="empty-state small error">
                <span>❌</span>
                <p>Erreur lors du calcul</p>
            </div>
        `;
    }
}

// Update showView to load stocks when view is opened
const _originalShowView = showView;
showView = function (viewName) {
    _originalShowView(viewName);
    if (viewName === 'stocks') {
        fetchStocks();
    }
};

// Generate orders from current needs data
async function generateOrdersFromNeeds() {
    const needsData = window.currentNeedsData;

    if (!needsData || !needsData.besoins) {
        showToast('Erreur: Pas de données de besoins', 'error');
        return;
    }

    // Get items to order (those with negative difference)
    const itemsToOrder = needsData.besoins
        .filter(need => need.statut === 'commander')
        .map(need => ({
            produit_nom: need.ingredient,
            quantite: Math.abs(need.difference),
            unite: need.unite,
            stock_id: need.stock_id
        }));

    if (itemsToOrder.length === 0) {
        showToast('Aucun produit à commander', 'info');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/commandes/generer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                semaine: needsData.semaine,
                items: itemsToOrder
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate orders');
        }

        const data = await response.json();
        showToast(`✅ ${data.message}`, 'success');

        // Show order summary in an alert
        if (data.commandes && data.commandes.length > 0) {
            const summary = data.commandes.map(cmd =>
                `• ${cmd.fournisseur_nom}: ${cmd.nb_produits} produit(s)`
            ).join('\n');
            alert(`Commandes créées:\n\n${summary}`);
        }

    } catch (error) {
        console.error('Error generating orders:', error);
        showToast(error.message || 'Erreur lors de la génération des commandes', 'error');
    }
}


// ============================================
// SCAN MODAL LOGIC
// ============================================

function openScanModal() {
    const modal = document.getElementById('scan-modal');
    modal.style.display = 'block';

    // Reset state
    document.getElementById('scan-file-input').value = '';
    document.getElementById('scan-preview').classList.add('hidden');
    document.getElementById('scan-drop-area').style.display = 'block';
    document.getElementById('scan-image-preview').src = '';

    // Close on outside click
    window.onclick = function (event) {
        if (event.target === modal) {
            closeScanModal();
        }
    };
}

function closeScanModal() {
    document.getElementById('scan-modal').style.display = 'none';
}

async function handleScanUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Show preview and loading
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById('scan-image-preview').src = e.target.result;
        document.getElementById('scan-drop-area').style.display = 'none';
        document.getElementById('scan-preview').classList.remove('hidden');
        document.getElementById('scan-loading').classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Send to API
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/stocks/scan-product`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'analyse');
        }

        const data = await response.json();

        if (data.status === 'success' && data.product) {
            closeScanModal();
            openStockModal(); // Open main stock modal

            // Pre-fill form with detected data
            // We use setTimeout to ensure modal is ready
            setTimeout(() => {
                const p = data.product;
                if (p.produit_nom) document.getElementById('stock-produit-nom').value = p.produit_nom;
                if (p.categorie) document.getElementById('stock-categorie').value = p.categorie;
                if (p.quantite) document.getElementById('stock-quantite').value = p.quantite;
                if (p.unite) document.getElementById('stock-unite').value = p.unite;
                if (p.dlc) document.getElementById('stock-dlc').value = p.dlc;

                showToast(`✨ Produit détecté: ${p.produit_nom}`, 'success');
            }, 100);

        } else {
            throw new Error(data.message || 'Aucun produit détecté');
        }

    } catch (error) {
        console.error('Scan error:', error);
        showToast(error.message, 'error');
        // Reset view on error
        document.getElementById('scan-loading').classList.add('hidden');
        document.getElementById('scan-drop-area').style.display = 'block';
        document.getElementById('scan-preview').classList.add('hidden');
    }
}

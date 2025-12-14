
// State
let currentStep = 1;
const totalSteps = 3;
let selectedImportType = 'demo';

// DOM Elements
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const progressFill = document.getElementById('progressFill');

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Simulate pre-filled data for demo effect
    setTimeout(() => {
        typeWriterEffect(document.getElementById('estName'), 'Lycée Gastronomique Jean Moulin');
        setTimeout(() => {
            document.getElementById('estType').value = 'scolaire';
            document.getElementById('estCovers').value = '850';
        }, 500);
    }, 800);
});

// Helper for typing effect
function typeWriterEffect(element, text, i = 0) {
    if (i < text.length) {
        element.value += text.charAt(i);
        setTimeout(() => typeWriterEffect(element, text, i + 1), 50);
    }
}

// Navigation Functions
function nextStep() {
    if (currentStep < totalSteps) {
        if (currentStep === 2) {
            // Confirm import selection
            startAIProcessing();
            currentStep++;
            updateUI();
            nextBtn.style.display = 'none'; // Hide next button during AI process
            prevBtn.style.display = 'none';
        } else {
            currentStep++;
            updateUI();
        }
    } else {
        // Finish
        window.location.href = 'index.html';
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateUI();
    }
}

function updateUI() {
    // Update Progress Bar
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${percentage}%`;

    // Update Step Indicators
    document.querySelectorAll('.step-indicator').forEach(ind => {
        const step = parseInt(ind.dataset.step);
        ind.classList.toggle('active', step === currentStep);
        ind.classList.toggle('completed', step < currentStep);
        if (step < currentStep) {
            ind.innerHTML = '<i class="fa-solid fa-check"></i>';
        } else {
            ind.textContent = step;
        }
    });

    // Toggle Content Sections
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`step${currentStep}`).classList.add('active');

    // Update Buttons
    prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    if (currentStep === 1) {
        nextBtn.innerHTML = 'Continuer <i class="fa-solid fa-arrow-right ms-2"></i>';
    } else if (currentStep === 2) {
        nextBtn.innerHTML = 'Lancer l\'importation <i class="fa-solid fa-bolt ms-2"></i>';
        // Show simulated data list if demo is selected
        document.getElementById('dataList').style.display = selectedImportType === 'demo' ? 'block' : 'none';
    }
}

// Data Import Logic
function selectImport(type) {
    selectedImportType = type;
    document.querySelectorAll('.import-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`card-${type}`).classList.add('selected');

    // Refresh UI to show/hide details
    updateUI();
}

// AI Simulation Logic
const terminalLines = [
    { text: "> Initialisation du core AI...", type: "info", delay: 500 },
    { text: "> Connexion à la base de données vectorielle...", type: "info", delay: 1200 },
    { text: "> Analyse des fichiers structurés... [OK]", type: "success", delay: 2000 },
    { text: "> 125 recettes identifiées.", type: "info", delay: 2500 },
    { text: "> Vérification des contraintes GEMRCN... [OK]", type: "success", delay: 3500 },
    { text: "> Calcul des valeurs nutritionnelles manquantes via Gemini Flash...", type: "warning", delay: 4500 },
    { text: "> Optimisation des stocks pour réduction gaspillage... [OK]", type: "success", delay: 6000 },
    { text: "> Génération du plan alimentaire S42...", type: "info", delay: 7500 },
    { text: "> Configuration terminée ! Redirection...", type: "success", delay: 9000 }
];

function startAIProcessing() {
    const terminal = document.getElementById('aiTerminal');
    let accumulatedDelay = 0;

    terminalLines.forEach(line => {
        accumulatedDelay += line.delay - (accumulatedDelay > 0 ? (terminalLines.find(l => l.delay < line.delay)?.delay || 0) : 0); // Logic fix: straightforward timeout is simpler

        setTimeout(() => {
            const div = document.createElement('div');
            div.className = `terminal-line ${line.type}`;
            div.textContent = line.text;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }, line.delay);
    });

    // Auto-redirect after last log
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 10500);
}

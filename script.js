// État du Tamacodechi
const state = {
    health: 100,
    food: 100,
    energy: 100,
    happiness: 100,
    xp: 0,
    level: 1,
    xpToNextLevel: 100,
    isSleeping: false,
    isSick: false,
    isDirty: false,
    evolutionStage: 0,
    lastAction: null,
    messages: [
        "Salut ! Je suis ton Tamacodechi!",
        "J'ai faim...",
        "Joue avec moi!",
        "Je veux coder!",
        "J'ai besoin de dormir...",
        "Je me sens seul...",
        "Je suis malade...",
        "Je suis sale...",
        "Je veux apprendre!",
        "Je m'ennuie..."
    ]
};

// Éléments du DOM
const elements = {
    pet: document.getElementById('pet'),
    petStatus: document.getElementById('pet-status'),
    message: document.getElementById('message'),
    evolution: document.getElementById('evolution'),
    healthBar: document.getElementById('health-bar'),
    healthValue: document.getElementById('health-value'),
    foodBar: document.getElementById('food-bar'),
    foodValue: document.getElementById('food-value'),
    energyBar: document.getElementById('energy-bar'),
    energyValue: document.getElementById('energy-value'),
    happinessBar: document.getElementById('happiness-bar'),
    happinessValue: document.getElementById('happiness-value'),
    xpBar: document.getElementById('xp-bar'),
    xpValue: document.getElementById('xp-value'),
    level: document.getElementById('level'),
    debugConsole: document.getElementById('debug-console')
};

// Boutons d'action
const buttons = {
    feed: document.getElementById('feed-btn'),
    play: document.getElementById('play-btn'),
    sleep: document.getElementById('sleep-btn'),
    code: document.getElementById('code-btn'),
    clean: document.getElementById('clean-btn'),
    heal: document.getElementById('heal-btn'),
    debug: document.getElementById('debug-btn'),
    save: document.getElementById('save-btn'),
    load: document.getElementById('load-btn')
};

// Évolution du Tamacodechi
const evolutionStages = [
    { emoji: "👶", name: "Bébé Codeur", xpRequired: 0 },
    { emoji: "👦", name: "Apprenti Dev", xpRequired: 100 },
    { emoji: "👨‍💻", name: "Développeur", xpRequired: 300 },
    { emoji: "🧙‍♂️", name: "Codeur Pro", xpRequired: 600 }, // Changé pour être différent du suivant
    { emoji: "👑", name: "Maître Codeur", xpRequired: 1000 } // Changé l'emoji et le nom pour plus de distinction
];


// Initialisation
function init() {
    loadGame(); // Essayer de charger une sauvegarde au démarrage
    updateUI();
    setRandomMessage();
    startGameLoop();
    setupEventListeners();
    logToConsole("Tamacodechi initialisé!");
}

// Boucle de jeu
function startGameLoop() {
    setInterval(() => {
        if (state.health <= 0) {
            gameOver();
            return; // Arrêter la boucle si le jeu est terminé
        }
        // Dégradation naturelle des stats
        if (!state.isSleeping) {
            state.food = Math.max(0, state.food - 1);
            state.energy = Math.max(0, state.energy - 1);
            state.happiness = Math.max(0, state.happiness - 0.5);
            if (state.isDirty) {
                state.happiness = Math.max(0, state.happiness - 0.5); // Être sale rend malheureux
            }
        } else {
            // Récupération pendant le sommeil
            state.energy = Math.min(100, state.energy + 2);
            state.health = Math.min(100, state.health + 0.5);
        }

        // Effets secondaires
        if (state.food <= 0) {
            state.health = Math.max(0, state.health - 1); // Plus de dégâts si totalement affamé
        } else if (state.food < 30) {
            state.health = Math.max(0, state.health - 0.5);
        }
        
        if (state.energy <= 0) {
            state.health = Math.max(0, state.health - 1); // Plus de dégâts si totalement épuisé
        } else if (state.energy < 20) {
            state.health = Math.max(0, state.health - 0.5);
        }
        
        if (state.happiness <= 0) {
            state.health = Math.max(0, state.health - 0.8); // Plus de dégâts si totalement malheureux
        } else if (state.happiness < 20) {
            state.health = Math.max(0, state.health - 0.3);
        }

        if (state.isSick) {
            state.health = Math.max(0, state.health - 1); // La maladie fait baisser la santé
        }
        
        // Maladie aléatoire si pas déjà malade et pas en pleine forme
        if (Math.random() < 0.005 && !state.isSick && state.health < 80) {
            state.isSick = true;
            showMessage("Je ne me sens pas bien... *tousse*");
            logToConsole("Tamacodechi est tombé malade.");
        }
        
        // Saleté aléatoire si pas déjà sale
        if (Math.random() < 0.01 && !state.isDirty) {
            state.isDirty = true;
            showMessage("Pouah! J'ai besoin d'une douche de code!");
            logToConsole("Tamacodechi est devenu sale.");
        }
        
        // Vérifier l'évolution
        checkEvolution();
        
        // Mettre à jour l'UI
        updateUI();
        
        // Changer de message aléatoirement
        if (Math.random() < 0.05) {
            setRandomMessage();
        }
        
    }, 3000); // Intervalle de la boucle de jeu (3 secondes)
}

// Mise à jour de l'interface
function updateUI() {
    elements.healthBar.style.width = `${state.health}%`;
    elements.foodBar.style.width = `${state.food}%`;
    elements.energyBar.style.width = `${state.energy}%`;
    elements.happinessBar.style.width = `${state.happiness}%`;
    
    const xpPercentage = state.xpToNextLevel > 0 ? (state.xp / state.xpToNextLevel) * 100 : 0;
    elements.xpBar.style.width = `${xpPercentage}%`;
    
    elements.healthValue.textContent = `${Math.round(state.health)}%`;
    elements.foodValue.textContent = `${Math.round(state.food)}%`;
    elements.energyValue.textContent = `${Math.round(state.energy)}%`;
    elements.happinessValue.textContent = `${Math.round(state.happiness)}%`;
    elements.xpValue.textContent = `${Math.round(state.xp)}/${state.xpToNextLevel}`;
    elements.level.textContent = state.level;
    
    // Logique d'apparence et de statut
    let petColor = "white";
    let petStatusText = evolutionStages[state.evolutionStage].name;
    let petStatusColor = "cyan";

    if (state.health <= 0) {
        elements.pet.textContent = "💀"; // Game Over
        petColor = "grey";
        petStatusText = "K.O.";
        petStatusColor = "grey";
    } else if (state.isSleeping) {
        elements.pet.textContent = evolutionStages[state.evolutionStage].emoji; // Garder l'emoji actuel
        // On pourrait ajouter un "ZZZ" à côté ou changer l'emoji pour un dormeur
        // elements.pet.textContent = "😴"; 
        petStatusText = "Endormi Zzz...";
        petStatusColor = "blue";
    } else if (state.isSick) {
        petColor = "darkred"; // Couleur plus sombre pour malade
        petStatusText = "Malade";
        petStatusColor = "red";
    } else if (state.isDirty) {
        petColor = "saddlebrown"; // Marron pour sale
        petStatusText = "Sale";
        petStatusColor = "brown";
    } else if (state.food < 30) {
        petColor = "orange";
        petStatusText = "Affamé!";
        petStatusColor = "orange";
    } else if (state.energy < 30) {
        petColor = "lightblue";
        petStatusText = "Fatigué";
        petStatusColor = "lightblue";
    } else if (state.happiness < 30) {
        petColor = "lightpink";
        petStatusText = "Triste";
        petStatusColor = "pink";
    }

    elements.pet.style.color = petColor;
    elements.petStatus.textContent = petStatusText;
    elements.petStatus.style.color = petStatusColor;
    
    buttons.play.disabled = state.isSleeping || state.health <= 0;
    buttons.code.disabled = state.isSleeping || state.health <= 0;
    buttons.feed.disabled = state.isSleeping || state.health <= 0;
    buttons.clean.disabled = state.isSleeping || state.health <= 0 || !state.isDirty;
    buttons.heal.disabled = state.isSleeping || state.health <= 0 || !state.isSick;
    buttons.sleep.disabled = state.health <= 0;
    
    elements.pet.textContent = state.health <= 0 ? "💀" : evolutionStages[state.evolutionStage].emoji;
}

// Vérifier l'évolution
function checkEvolution() {
    if (state.xp >= state.xpToNextLevel && state.evolutionStage < evolutionStages.length - 1) {
        state.level++;
        state.evolutionStage++;
        state.xp = state.xp - state.xpToNextLevel; // Garder l'XP excédentaire
        state.xpToNextLevel = evolutionStages[state.evolutionStage].xpRequired;
        
        elements.evolution.classList.remove('hidden');
        setTimeout(() => {
            elements.evolution.classList.add('hidden');
        }, 2000);
        
        showMessage(`LEVEL UP! Je suis maintenant un ${evolutionStages[state.evolutionStage].name}!`);
        logToConsole(`Évolution! Nouveau niveau: ${state.level} - ${evolutionStages[state.evolutionStage].name}`);
    }
}

// Afficher un message
function showMessage(msg, duration = 3000) {
    elements.message.textContent = msg;
    setTimeout(() => {
        if (elements.message.textContent === msg) {
            elements.message.textContent = '';
        }
    }, duration);
}

// Message aléatoire
function setRandomMessage() {
    if (!state.lastAction || Date.now() - state.lastAction > 5000) { // Pas de message si action récente
        if (state.health <= 0) return; // Pas de message si mort

        let relevantMessages = [];
        if (state.isSick) relevantMessages.push("Je me sens vraiment pas bien...", "*Tousse tousse*");
        if (state.isDirty) relevantMessages.push("Une petite douche de code ne serait pas de refus.");
        if (state.food < 30) relevantMessages.push("Mon estomac crie famine de pizza et de café!", "Un petit snack de code ?");
        if (state.energy < 30) relevantMessages.push("Mes batteries sont à plat...", "Besoin d'une pause caféine !");
        if (state.happiness < 30) relevantMessages.push("Je me sens un peu déprécié aujourd'hui...", "Un peu de refactoring pour me remonter le moral ?");
        
        if (relevantMessages.length > 0 && Math.random() < 0.7) { // Plus de chance d'avoir un message contextuel
            const randomMsg = relevantMessages[Math.floor(Math.random() * relevantMessages.length)];
            showMessage(randomMsg);
        } else {
            const randomMsg = state.messages[Math.floor(Math.random() * state.messages.length)];
            showMessage(randomMsg);
        }
    }
}

// Journalisation dans la console de debug
function logToConsole(msg) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${timeString}] ${msg}`;
    elements.debugConsole.appendChild(entry);
    elements.debugConsole.scrollTop = elements.debugConsole.scrollHeight; // Auto-scroll
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    buttons.feed.addEventListener('click', () => {
        if (state.isSleeping || state.health <= 0) return;
        state.food = Math.min(100, state.food + 25 + Math.floor(Math.random() * 10)); // Ajoute un peu d'aléatoire
        state.happiness = Math.min(100, state.happiness + 5);
        state.lastAction = Date.now();
        showMessage("Miam! Un bon café et une pizza virtuelle!");
        logToConsole("Tamacodechi nourri.");
        updateUI();
    });
    
    buttons.play.addEventListener('click', () => {
        if (state.isSleeping || state.health <= 0) return;
        state.happiness = Math.min(100, state.happiness + 20 + Math.floor(Math.random() * 10));
        state.energy = Math.max(0, state.energy - (10 + Math.floor(Math.random() * 5)));
        state.lastAction = Date.now();
        showMessage("On a débuggé ce vieux jeu ! C'était fun !");
        logToConsole("Joué avec Tamacodechi.");
        updateUI();
    });
    
    buttons.sleep.addEventListener('click', () => {
        if (state.health <= 0) return;
        state.isSleeping = !state.isSleeping;
        state.lastAction = Date.now();
        if (state.isSleeping) {
            showMessage("Compilation en cours... ZzzZzz...");
            logToConsole("Tamacodechi s'endort.");
        } else {
            showMessage("Système redémarré ! Prêt à coder !");
            logToConsole("Tamacodechi se réveille.");
        }
        updateUI();
    });
    
    buttons.code.addEventListener('click', () => {
        if (state.isSleeping || state.health <= 0) return;
        const xpGain = 10 + Math.floor(Math.random() * 10); // Gain d'XP variable
        state.xp = state.xp + xpGain;
        state.energy = Math.max(0, state.energy - (15 + Math.floor(Math.random() * 5)));
        state.happiness = Math.min(100, state.happiness + 5); // Coder rend heureux (un peu)
        state.lastAction = Date.now();
        showMessage(`+${xpGain} XP! J'ai codé une nouvelle feature!`);
        logToConsole(`Tamacodechi a codé et gagné ${xpGain} XP.`);
        checkEvolution(); // Vérifier l'évolution après avoir gagné de l'XP
        updateUI();
    });
    
    buttons.clean.addEventListener('click', () => {
        if (state.isSleeping || state.health <= 0 || !state.isDirty) return;
        state.isDirty = false;
        state.happiness = Math.min(100, state.happiness + 15);
        state.lastAction = Date.now();
        showMessage("Ah, un environnement de dev propre, c'est mieux!");
        logToConsole("Tamacodechi nettoyé.");
        updateUI();
    });
    
    buttons.heal.addEventListener('click', () => {
        if (state.isSleeping || state.health <= 0 || !state.isSick) return;
        state.isSick = false;
        state.health = Math.min(100, state.health + (30 + Math.floor(Math.random() * 20)) );
        state.happiness = Math.min(100, state.happiness + 10);
        state.lastAction = Date.now();
        showMessage("Patch appliqué! Je me sens beaucoup mieux!");
        logToConsole("Tamacodechi soigné.");
        updateUI();
    });
    
    buttons.debug.addEventListener('click', () => {
        elements.debugConsole.classList.toggle('hidden');
        logToConsole(`Console de debug ${elements.debugConsole.classList.contains('hidden') ? 'fermée' : 'ouverte'}.`);
    });
    
    buttons.save.addEventListener('click', saveGame);
    buttons.load.addEventListener('click', loadGame);
}

function saveGame() {
    localStorage.setItem('tamacodechi_save', JSON.stringify(state));
    showMessage("Progression sauvegardée dans le localStorage!");
    logToConsole("Jeu sauvegardé.");
}

function loadGame() {
    const savedData = localStorage.getItem('tamacodechi_save');
    if (savedData) {
        // Fusionner l'état sauvegardé avec l'état par défaut pour s'assurer que les nouvelles propriétés sont incluses
        const loadedState = JSON.parse(savedData);
        for (const key in state) {
            if (loadedState.hasOwnProperty(key)) {
                state[key] = loadedState[key];
            }
        }
        // Assurer la cohérence des données après chargement
        state.xpToNextLevel = evolutionStages[state.evolutionStage]?.xpRequired || 100;


        showMessage("Sauvegarde chargée! Bienvenue de retour!");
        logToConsole("Jeu chargé depuis localStorage.");
    } else {
        showMessage("Aucune sauvegarde trouvée. Nouvelle partie!");
        logToConsole("Aucune sauvegarde trouvée.");
    }
    updateUI(); // Mettre à jour l'UI avec les données chargées ou par défaut
}

function gameOver() {
    showMessage("GAME OVER. Le Tamacodechi a crashé... Redémarrez la page pour recommencer.", 10000);
    logToConsole("GAME OVER.");
    // Désactiver tous les boutons sauf potentiellement un bouton "Recommencer" si vous l'ajoutez
    Object.values(buttons).forEach(button => button.disabled = true);
    elements.pet.textContent = "💀";
    elements.pet.style.color = "grey";
    elements.petStatus.textContent = "K.O.";
    // Ici, on pourrait aussi arrêter la boucle de jeu avec clearInterval si on stocke son ID.
}


// Démarrer le jeu
window.onload = init;
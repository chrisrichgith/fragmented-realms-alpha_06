// This is the full, refactored content of game.js

const LOCATIONS = {
    'city_1': { name: 'Varethyn', coords: { top: '11.24%', left: '26.06%', width: '10%', height: '15%' }, detailMap: '/images/RPG/Maps/Citymap.png', actions: ['trade', 'quest', 'rest'] },
    'village_2': { name: 'Dornhall', coords: { top: '38.06%', left: '16.24%', width: '8%', height: '8%' }, detailMap: '/images/RPG/Maps/Villagemap.png', actions: ['quest', 'rest'] },
    'village_3': { name: 'Myrrgarde', coords: { top: '48.12%', left: '31.15%', width: '8%', height: '8%' }, detailMap: '/images/RPG/Maps/Villagemap.png', actions: ['quest', 'rest'] },
    'forest_4': { name: 'Ysmereth', coords: { top: '25.25%', left: '45.77%', width: '15%', height: '15%' }, detailMap: '/images/RPG/Maps/Wald.png', actions: ['explore', 'gather'] },
    'village_5': { name: 'Elaris', coords: { top: '65.24%', left: '15.02%', width: '8%', height: '8%' }, detailMap: '/images/RPG/Maps/Villagemap.png', actions: ['quest', 'rest'] },
    'city_6': { name: 'Bruchhain', coords: { top: '65.92%', left: '35.78%', width: '10%', height: '10%' }, detailMap: '/images/RPG/Maps/Citymap.png', actions: ['trade', 'quest', 'rest'] },
    'city_7': { name: 'Tharvok', coords: { top: '52.8%', left: '67.05%', width: '13%', height: '13%' }, detailMap: '/images/RPG/Maps/Citymap.png', actions: ['trade', 'quest', 'rest'] },
    'dungeon_8': { name: 'Schattenfels', coords: { top: '68.45%', left: '72.44%', width: '9%', height: '9%' }, detailMap: '/images/RPG/Maps/Dungeon.png', actions: ['enter_dungeon'] },
    'village_9': { name: 'Kragmoor', coords: { top: '26.54%', left: '80.27%', width: '8%', height: '8%' }, detailMap: '/images/RPG/Maps/Villagemap.png', actions: ['quest', 'rest'] }
};

// Game objects
let keys = {};

// UI Elements
let ui = {};

// Party state
let npcParty = [null, null, null];
let currentLocationId = null;

// Character creation state
let creationState = {
    name: '',
    class: '',
    gender: 'male',
};

// Initialize game
function init() {
    // Populate UI object
    ui = {
        // Screens
        titleScreen: document.getElementById('title-screen'),
        gameScreen: document.getElementById('game-screen'),
        optionsScreen: document.getElementById('options-screen'),
        characterCreationScreen: document.getElementById('character-creation-screen'),
        locationDetailScreen: document.getElementById('location-detail-screen'),

        // Buttons
        newGameBtn: document.getElementById('new-game-btn'),
        optionsBtn: document.getElementById('options-btn'),
        creationBackBtn: document.getElementById('creation-back-btn'),
        confirmCreationBtn: document.getElementById('confirm-creation-btn'),

        // Audio
        bgMusic: document.getElementById('bg-music'),
        sfxClick: document.getElementById('sfx-click'),

        // New Character Creation Elements
        creationScreen: document.getElementById('character-creation-screen'),
        portraitDisplay: document.getElementById('creation-portrait-display'),
        classDisplay: document.getElementById('creation-class-display'),
        classDescription: document.getElementById('creation-class-description'),
        statsDisplay: document.getElementById('creation-stats-display'),
        classSelect: document.getElementById('creation-class-select'),
        genderSelector: document.getElementById('creation-gender-selector'),
        charNameInput: document.getElementById('creation-char-name'),
    };
    
    setupEventListeners();
    initCharacterCreationScreen();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'continue') {
        showScreen('game');
    } else {
        showScreen('title');
    }
}

function playClickSound() {
    if (ui.sfxClick) {
        ui.sfxClick.currentTime = 0;
        ui.sfxClick.play();
    }
}

function setupEventListeners() {
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', playClickSound);
    });

    ui.newGameBtn.addEventListener('click', () => showScreen('character-creation'));
    ui.optionsBtn.addEventListener('click', () => showScreen('options'));
    document.getElementById('options-back-btn').addEventListener('click', () => showScreen('title'));
    ui.creationBackBtn.addEventListener('click', () => showScreen('title'));

    // New Creation Screen Listeners
    if (ui.creationScreen) {
        ui.classSelect.addEventListener('change', updateCreationState);
        ui.genderSelector.addEventListener('click', (e) => {
            const button = e.target.closest('.gender-btn');
            if (button) {
                if (ui.genderSelector.querySelector('.active')) {
                    ui.genderSelector.querySelector('.active').classList.remove('active');
                }
                button.classList.add('active');
                updateCreationState();
            }
        });
        ui.charNameInput.addEventListener('input', updateCreationState);
        ui.confirmCreationBtn.addEventListener('click', confirmCharacter);
    }
}

function showScreen(screenId) {
    if (ui.titleScreen) ui.titleScreen.style.display = 'none';
    if (ui.gameScreen) ui.gameScreen.style.display = 'none';
    if (ui.optionsScreen) ui.optionsScreen.style.display = 'none';
    if (ui.characterCreationScreen) ui.characterCreationScreen.style.display = 'none';

    switch(screenId) {
        case 'title':
            if (ui.titleScreen) ui.titleScreen.style.display = 'flex';
            if (ui.bgMusic) ui.bgMusic.play().catch(e => console.error("Audio autoplay failed: ", e));
            break;
        case 'options':
            if (ui.optionsScreen) ui.optionsScreen.style.display = 'flex';
            break;
        case 'character-creation':
            if (ui.characterCreationScreen) {
                ui.characterCreationScreen.style.display = 'flex';
                // Force a refresh of the creation screen UI when it's shown
                updateCreationScreen();
            }
            break;
        case 'game':
            // Logic for showing game screen
            break;
    }
}

// --- New Character Creation Logic ---
function initCharacterCreationScreen() {
    if (!ui.creationScreen) return;
    ui.classSelect.innerHTML = '<option value="">- Klasse wählen -</option>';
    for (const className in RPG_CLASSES) {
        // Exclude 'Eigener Charakter' or other special classes if necessary
        if (RPG_CLASSES[className].playable === false) continue;
        ui.classSelect.appendChild(new Option(className, className));
    }
    updateCreationState();
}

function updateCreationState() {
    if (!ui.creationScreen) return;
    const activeGenderBtn = ui.genderSelector.querySelector('.active');

    creationState = {
        name: ui.charNameInput.value.trim(),
        class: ui.classSelect.value,
        gender: activeGenderBtn ? activeGenderBtn.dataset.gender : 'male',
    };
    updateCreationScreen();
}

function updateCreationScreen() {
    const { name, class: className, gender } = creationState;
    const classData = RPG_CLASSES[className];

    // Update text displays
    if (classData) {
        ui.classDisplay.textContent = className;
        ui.classDescription.textContent = classData.description;
        const stats = classData.stats;
        ui.statsDisplay.innerHTML = `
            <span>STÄ: ${stats.strength}</span>
            <span>GES: ${stats.dexterity}</span>
            <span>INT: ${stats.intelligence}</span>
        `;
    } else {
        ui.classDisplay.textContent = 'Klasse';
        ui.classDescription.textContent = 'Wähle eine Klasse, um eine Beschreibung und die Basiswerte zu sehen.';
        ui.statsDisplay.innerHTML = '';
    }

    // Update portrait
    let portraitPath = `/images/RPG/Charakter/${gender}_silhouette.svg`; // Default silhouette
    if (className && classData) {
        const genderSuffix = gender === 'male' ? 'm' : 'w';
        // Use the image name from class_data.js
        const portraitFileName = `${classData.imgName}_${genderSuffix}.png`;
        portraitPath = `/images/RPG/Charakter/${portraitFileName}`;
    }
    ui.portraitDisplay.src = portraitPath;

    // Update confirm button state
    if (name && name.length >= 3 && className) {
        ui.confirmCreationBtn.disabled = false;
    } else {
        ui.confirmCreationBtn.disabled = true;
    }
}

function confirmCharacter() {
    const { name, class: className, gender } = creationState;
    if (!name || !className) {
        alert("Bitte fülle alle Felder aus.");
        return;
    }

    const classData = RPG_CLASSES[className];
    const finalCharData = {
        name,
        class: className,
        gender,
        image: ui.portraitDisplay.src, // Get the final image path from the display
        stats: classData.stats,
        abilities: classData.abilities
    };

    // For now, log to console and save to localStorage
    console.log("Character Confirmed:", finalCharData);
    localStorage.setItem('selectedCharacter', JSON.stringify(finalCharData));
    alert(`Charakter ${name} wurde erstellt!`);

    // Potentially switch to game screen
    // showScreen('game');
}

window.onload = init;

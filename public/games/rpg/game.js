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

// --- Global State ---
let ui = {};
let partyData = [];
let currentLocationId = null;
let creationState = { name: '', class: '', gender: 'male' };
let socket = null;
let isPartyLeader = false;
let myUsername = '';

// --- Initialization ---
function init() {
    // Cache all UI elements
    ui = {
        titleScreen: document.getElementById('title-screen'),
        gameScreen: document.getElementById('game-screen'),
        optionsScreen: document.getElementById('options-screen'),
        characterCreationScreen: document.getElementById('character-creation-screen'),
        locationDetailScreen: document.getElementById('location-detail-screen'),
        newGameBtn: document.getElementById('new-game-btn'),
        startGameDirektBtn: document.getElementById('start-game-direkt-btn'),
        optionsBtn: document.getElementById('options-btn'),
        creationBackBtn: document.getElementById('creation-back-btn'),
        confirmCreationBtn: document.getElementById('confirm-creation-btn'),
        bgMusic: document.getElementById('bg-music'),
        sfxClick: document.getElementById('sfx-click'),
        creationScreen: document.getElementById('character-creation-screen'),
        portraitDisplay: document.getElementById('creation-portrait-display'),
        classDisplay: document.getElementById('creation-class-display'),
        classDescription: document.getElementById('creation-class-description'),
        statsDisplay: document.getElementById('creation-stats-display'),
        classSelect: document.getElementById('creation-class-select'),
        genderSelector: document.getElementById('creation-gender-selector'),
        charNameInput: document.getElementById('creation-char-name'),
        gameCharacterCardContainer: document.getElementById('game-character-card-container'),
        npcSelectionContainer: document.getElementById('npc-selection-container'),
        locationOverlayContainer: document.getElementById('location-overlay-container'),
        locationName: document.getElementById('location-name'),
        locationDetailMap: document.getElementById('location-detail-map'),
        backToWorldMapBtn: document.getElementById('back-to-world-map-btn'),
        worldMapLeft: document.getElementById('world-map-left'),
        worldMapRight: document.getElementById('world-map-right'),
        locationActions: document.getElementById('location-actions'),
        questScrollModal: document.getElementById('quest-scroll-modal'),
        questAcceptBtn: document.getElementById('quest-accept-btn'),
        questDeclineBtn: document.getElementById('quest-decline-btn'),
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const partyParam = urlParams.get('party');
    const usernameParam = urlParams.get('username');

    if (usernameParam) {
        myUsername = usernameParam;
        localStorage.setItem('username', usernameParam);
    } else {
        myUsername = localStorage.getItem('username');
    }

    if (partyParam) {
        partyData = JSON.parse(decodeURIComponent(partyParam));

        // Check if ALL party members have a character
        const allPlayersHaveCharacter = partyData.every(p => p.character);

        if (allPlayersHaveCharacter) {
            socket = io(); // Connect to the server
            if (partyData.length > 0 && partyData[0].username === myUsername) {
                isPartyLeader = true;
            }
            const myPartyData = partyData.find(p => p.username === myUsername);
            // We know myPartyData and myPartyData.character exist because of the .every() check
            startGame(myPartyData.character);
        } else {
            // If someone is missing a character, everyone goes to the title screen.
            showScreen('title');
        }
    } else {
        // Solo play logic remains the same, start at title screen.
        showScreen('title');
    }

    setupEventListeners();
    initCharacterCreationScreen();
    if (socket) {
        setupSocketListeners();
    }
}

// --- Sound ---
function playClickSound() {
    if (ui.sfxClick) {
        ui.sfxClick.currentTime = 0;
        ui.sfxClick.play();
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    document.querySelectorAll('button').forEach(button => button.addEventListener('click', playClickSound));
    ui.newGameBtn.addEventListener('click', () => showScreen('character-creation'));
    ui.startGameDirektBtn.addEventListener('click', () => {
        const characterData = JSON.parse(localStorage.getItem('selectedCharacter'));
        if (characterData) {
            partyData = [{ username: myUsername, character: characterData }];
            startGame(characterData);
        } else {
            alert('Bitte erstelle zuerst einen Charakter im Menü "Charakter erstellen".');
        }
    });
    ui.optionsBtn.addEventListener('click', () => showScreen('options'));
    document.getElementById('options-back-btn').addEventListener('click', () => showScreen('title'));
    ui.creationBackBtn.addEventListener('click', () => showScreen('title'));
    ui.questAcceptBtn.addEventListener('click', handleQuestAccept);
    ui.questDeclineBtn.addEventListener('click', () => ui.questScrollModal.style.display = 'none');
    ui.backToWorldMapBtn.addEventListener('click', handleBackToWorldMap);

    if (ui.creationScreen) {
        ui.classSelect.addEventListener('change', updateCreationState);
        ui.genderSelector.addEventListener('click', (e) => {
            const button = e.target.closest('.gender-btn');
            if (button && !button.classList.contains('active')) {
                ui.genderSelector.querySelector('.active').classList.remove('active');
                button.classList.add('active');
                updateCreationState();
            }
        });
        ui.charNameInput.addEventListener('input', updateCreationState);
        ui.confirmCreationBtn.addEventListener('click', confirmCharacter);
    }
}

function setupSocketListeners() {
    socket.on('party:state-updated', ({ state }) => {
        // A new state has been received from the server. Update the UI accordingly.
        if (state.currentLocation && state.currentLocation !== currentLocationId) {
            showLocationDetail(state.currentLocation);
        }

        if (state.inBattle) {
            const partyQueryParam = encodeURIComponent(JSON.stringify(partyData));
            const usernameQueryParam = encodeURIComponent(myUsername);
            window.location.href = `battle.html?party=${partyQueryParam}&username=${usernameQueryParam}`;
        }
    });
}

// --- Screen Management ---
function showScreen(screenId) {
    Object.values(ui).forEach(el => {
        if (el && el.id && el.id.endsWith('-screen')) {
            el.style.display = 'none';
        }
    });

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
                updateCreationScreen();
            }
            break;
        case 'game':
            if (ui.gameScreen) ui.gameScreen.style.display = 'block';
            break;
    }
}

// --- Character Creation ---
function initCharacterCreationScreen() {
    if (!ui.creationScreen) return;
    ui.classSelect.innerHTML = '<option value="">- Klasse wählen -</option>';
    for (const className in RPG_CLASSES) {
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

    if (classData) {
        ui.classDisplay.textContent = className;
        ui.classDescription.textContent = classData.description;
        const stats = classData.stats;
        ui.statsDisplay.innerHTML = `<span>STÄ: ${stats.strength}</span> <span>GES: ${stats.dexterity}</span> <span>INT: ${stats.intelligence}</span>`;
    } else {
        ui.classDisplay.textContent = 'Klasse';
        ui.classDescription.textContent = 'Wähle eine Klasse, um eine Beschreibung und die Basiswerte zu sehen.';
        ui.statsDisplay.innerHTML = '';
    }

    let portraitPath = `/images/RPG/Charakter/${gender === 'male' ? 'M' : 'F'}.png`;
    if (className && classData) {
        const genderSuffix = gender === 'male' ? 'm' : 'w';
        const portraitFileName = `${classData.imgName}_${genderSuffix}.png`;
        portraitPath = `/images/RPG/Charakter/${portraitFileName}`;
    }
    ui.portraitDisplay.src = portraitPath;
    ui.confirmCreationBtn.disabled = !(name && name.length >= 3 && className);
}

function confirmCharacter() {
    const { name, class: className, gender } = creationState;
    if (!name || !className) {
        alert("Bitte fülle alle Felder aus.");
        return;
    }

    const classData = RPG_CLASSES[className];
    const finalCharData = { name, class: className, gender, image: ui.portraitDisplay.src, stats: classData.stats, abilities: classData.abilities };

    localStorage.setItem('selectedCharacter', JSON.stringify(finalCharData));
    if (window.opener) {
        window.opener.postMessage({ type: 'character-selected', data: finalCharData }, '*');
    }
    window.close();
}

// --- Game Logic ---
function startGame(characterData) {
    showScreen('game');

    const card = `
        <div class="character-card-game">
            <img src="${characterData.image}" alt="${characterData.name}">
            <h3>${characterData.name}</h3>
            <p>${characterData.class}</p>
            <div class="card-stats">
                <span>STÄ: ${characterData.stats.strength}</span>
                <span>GES: ${characterData.stats.dexterity}</span>
                <span>INT: ${characterData.stats.intelligence}</span>
            </div>
        </div>
    `;
    ui.gameCharacterCardContainer.innerHTML = card;

    updatePartyView();
    initWorldMap();
}

function updatePartyView() {
    if (!ui.npcSelectionContainer) return;
    ui.npcSelectionContainer.innerHTML = '';

    partyData.forEach(partyMember => {
        if (partyMember && partyMember.character) {
            const playerCard = document.createElement('div');
            playerCard.className = 'npc-card';
            if (partyMember.username === myUsername) {
                playerCard.classList.add('current-player');
            }
            playerCard.innerHTML = `
                <img src="${partyMember.character.image}" alt="${partyMember.username}">
                <div class="npc-card-details">
                    <h4>${partyMember.username}</h4>
                    <p>${partyMember.character.class}</p>
                </div>
            `;
            ui.npcSelectionContainer.appendChild(playerCard);
        }
    });

    const maxPartySize = 4;
    for (let i = partyData.length; i < maxPartySize; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.className = 'npc-card empty';
        ui.npcSelectionContainer.appendChild(emptySlot);
    }
}

function initWorldMap() {
    if (!ui.locationOverlayContainer) return;
    ui.locationOverlayContainer.innerHTML = '';

    for (const locId in LOCATIONS) {
        const loc = LOCATIONS[locId];
        const spot = document.createElement('div');
        spot.className = 'location-spot';
        spot.style.top = loc.coords.top;
        spot.style.left = loc.coords.left;
        spot.style.width = loc.coords.width;
        spot.style.height = loc.coords.height;

        const overlay = document.createElement('div');
        overlay.className = 'location-overlay';
        spot.appendChild(overlay);

        const label = document.createElement('div');
        label.className = 'location-name-label';
        label.textContent = loc.name;
        spot.appendChild(label);

        overlay.addEventListener('click', () => handleLocationClick(locId));
        ui.locationOverlayContainer.appendChild(spot);
    }

    setTimeout(() => {
        if (ui.locationOverlayContainer) {
            ui.locationOverlayContainer.classList.add('active');
        }
    }, 1000);
}

// --- Action Handlers ---
function handleLocationClick(locId) {
    if (socket) { // Party mode
        if (isPartyLeader) {
            socket.emit('party:action', { action: 'select-location', data: { locationId: locId } });
        }
    } else { // Solo mode
        showLocationDetail(locId);
    }
}

function showLocationDetail(locId) {
    currentLocationId = locId;
    const loc = LOCATIONS[locId];
    if (!loc) return;

    ui.locationName.textContent = loc.name;
    ui.locationDetailMap.src = loc.detailMap;
    displayLocationActions(locId);

    ui.worldMapLeft.classList.add('split');
    ui.worldMapRight.classList.add('split');
    ui.locationOverlayContainer.style.display = 'none';
    ui.locationDetailScreen.style.zIndex = 3;
    setTimeout(() => {
        ui.locationDetailScreen.style.display = 'block';
    }, 400);
}

function displayLocationActions(locId) {
    const location = LOCATIONS[locId];
    if (!location || !ui.locationActions) return;
    ui.locationActions.innerHTML = '';

    location.actions.forEach(action => {
        const button = document.createElement('button');
        button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
        button.id = `action-${action}-btn`;
        if (action === 'quest') {
            button.addEventListener('click', () => {
                ui.questScrollModal.style.display = 'flex';
            });
        }
        ui.locationActions.appendChild(button);
    });
}

function handleQuestAccept() {
    ui.questScrollModal.style.display = 'none';
    if (socket) { // Party mode
        if (isPartyLeader) {
            socket.emit('party:action', { action: 'accept-quest' });
        }
    } else { // Solo mode
        window.location.href = 'battle.html';
    }
}

function handleBackToWorldMap() {
    ui.locationDetailScreen.style.display = 'none';
    ui.locationDetailScreen.style.zIndex = 1;
    ui.worldMapLeft.classList.remove('split');
    ui.worldMapRight.classList.remove('split');
    ui.locationOverlayContainer.style.display = 'block';
}

// --- Global Entry Point ---
window.onload = init;

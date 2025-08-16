// Class data is now loaded from class_data.js

const LOCATIONS = {
    'city_1': {
        name: 'Varethyn',
        coords: { top: '11.24%', left: '26.06%', width: '10%', height: '15%' },
        detailMap: '/images/RPG/Maps/Citymap.png',
        actions: ['trade', 'quest', 'rest']
    },
    'village_2': {
        name: 'Dornhall',
        coords: { top: '38.06%', left: '16.24%', width: '8%', height: '8%' },
        detailMap: '/images/RPG/Maps/Villagemap.png',
        actions: ['quest', 'rest']
    },
    'village_3': {
        name: 'Myrrgarde',
        coords: { top: '48.12%', left: '31.15%', width: '8%', height: '8%' },
        detailMap: '/images/RPG/Maps/Villagemap.png',
        actions: ['quest', 'rest']
    },
    'forest_4': {
        name: 'Ysmereth',
        coords: { top: '25.25%', left: '45.77%', width: '15%', height: '15%' },
        detailMap: '/images/RPG/Maps/Wald.png',
        actions: ['explore', 'gather']
    },
    'village_5': {
        name: 'Elaris',
        coords: { top: '65.24%', left: '15.02%', width: '8%', height: '8%' },
        detailMap: '/images/RPG/Maps/Villagemap.png',
        actions: ['quest', 'rest']
    },
    'city_6': {
        name: 'Bruchhain',
        coords: { top: '65.92%', left: '35.78%', width: '10%', height: '10%' },
        detailMap: '/images/RPG/Maps/Citymap.png',
        actions: ['trade', 'quest', 'rest']
    },
    'city_7': {
        name: 'Tharvok',
        coords: { top: '52.8%', left: '67.05%', width: '13%', height: '13%' },
        detailMap: '/images/RPG/Maps/Citymap.png',
        actions: ['trade', 'quest', 'rest']
    },
    'dungeon_8': {
        name: 'Schattenfels',
        coords: { top: '68.45%', left: '72.44%', width: '9%', height: '9%' },
        detailMap: '/images/RPG/Maps/Dungeon.png',
        actions: ['enter_dungeon']
    },
    'village_9': {
        name: 'Kragmoor',
        coords: { top: '26.54%', left: '80.27%', width: '8%', height: '8%' },
        detailMap: '/images/RPG/Maps/Villagemap.png',
        actions: ['quest', 'rest']
    }
};

// SECRET_CLASSES is now part of RPG_CLASSES in class_data.js

// Game objects
let keys = {};

// UI Elements
let ui = {};

// Custom character state
let customCharState = {
    name: '',
    stats: { strength: 5, dexterity: 5, intelligence: 5 },
    points: 0, // Start with 0 points, stats are at default
    basePoints: 15,
    minStat: 1
};

// Naming modal state
let namingContext = null;

// Party state
let npcParty = [null, null, null];
let currentLocationId = null;

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
        loadGameBtn: document.getElementById('load-game-btn'),
        optionsBtn: document.getElementById('options-btn'),
        exitBtn: document.getElementById('exit-rpg-btn'),
        optionsBackBtn: document.getElementById('options-back-btn'),
        creationBackBtn: document.getElementById('creation-back-btn'),
        startGameBtn: document.getElementById('start-game-btn'),
        startGameDirektBtn: document.getElementById('start-game-direkt-btn'),
        backToWorldMapBtn: document.getElementById('back-to-world-map-btn'),
        savePartyBtn: document.getElementById('save-party-btn'),
        loadPartyBtn: document.getElementById('load-party-btn'),
        rpgMenuToggleBtn: document.getElementById('rpg-menu-toggle-btn'),
        rpgMenuPopup: document.getElementById('rpg-menu-popup'),
        locationOverlayContainer: document.getElementById('location-overlay-container'),
        locationTitleDisplay: document.getElementById('location-title-display'),
        worldMapWrapper: document.getElementById('world-map-wrapper'),

        // Game UI
        levelEl: document.getElementById('level'),
        experienceEl: document.getElementById('experience'),
        healthEl: document.getElementById('health'),

        // Audio
        bgMusic: document.getElementById('bg-music'),
        sfxClick: document.getElementById('sfx-click'),
        sfxSlideOpen: document.getElementById('sfx-slide-open'),
        sfxSlideClose: document.getElementById('sfx-slide-close'),
        sfxParchment: document.getElementById('sfx-parchment'),
        sfxQuestAccept: document.getElementById('sfx-quest-accept'),
        sfxQuestDecline: document.getElementById('sfx-quest-decline'),
        musicVolumeSlider: document.getElementById('music-volume'),
        sfxVolumeSlider: document.getElementById('sfx-volume'),

        // Custom Char Modal
        customCharModal: document.getElementById('custom-char-modal'),
        charNameInput: document.getElementById('char-name-input'),
        pointsRemainingEl: document.getElementById('points-remaining'),
        strengthInput: document.getElementById('strength-input'),
        dexterityInput: document.getElementById('dexterity-input'),
        intelligenceInput: document.getElementById('intelligence-input'),
        confirmCharBtn: document.getElementById('confirm-char-btn'),
        cancelCharBtn: document.getElementById('cancel-char-btn'),
        attributeButtons: document.querySelectorAll('.btn-attribute'),

        // Naming Modal
        nameCharModal: document.getElementById('name-char-modal'),
        predefCharNameInput: document.getElementById('predef-char-name-input'),
        confirmPredefNameBtn: document.getElementById('confirm-predef-name-btn'),
        cancelPredefNameBtn: document.getElementById('cancel-predef-name-btn'),

        // Save Game Modal
        saveGameModal: document.getElementById('save-game-modal'),
        saveNameInput: document.getElementById('save-name-input'),
        confirmSaveBtn: document.getElementById('confirm-save-btn'),
        cancelSaveBtn: document.getElementById('cancel-save-btn'),

        // Load Game Modal
        loadGameModal: document.getElementById('load-game-modal'),
        saveSlotsContainer: document.getElementById('save-slots-container'),
        cancelLoadBtn: document.getElementById('cancel-load-btn'),

        // Quest Scroll Modal
        questScrollModal: document.getElementById('quest-scroll-modal'),
        questAcceptBtn: document.getElementById('quest-accept-btn'),
        questDeclineBtn: document.getElementById('quest-decline-btn'),
    };
    
    // Set up event listeners
    setupEventListeners();
    
    // Populate character creation screen
    populateCharacterCreation();
    
    // Check for direct start action
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'continue') {
        showScreen('game');
    } else {
        showScreen('title');
    }

    // Start game loop (paused until game starts)
    // gameLoop = requestAnimationFrame(update);
}

// Audio control functions
function playClickSound() {
    if (ui.sfxClick) {
        ui.sfxClick.currentTime = 0;
        ui.sfxClick.play();
    }
}

function playBgMusic() {
    if (ui.bgMusic) {
        ui.bgMusic.play().catch(e => console.error("Audio autoplay failed: ", e));
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Game controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // UI Buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', playClickSound);
    });

    ui.newGameBtn.addEventListener('click', () => showScreen('character-creation'));
    ui.optionsBtn.addEventListener('click', () => {
        console.log("Options button clicked!");
        showScreen('options');
    });
    ui.optionsBackBtn.addEventListener('click', () => showScreen('title'));
    ui.creationBackBtn.addEventListener('click', () => showScreen('title'));
    ui.startGameBtn.addEventListener('click', () => showScreen('game'));
    ui.startGameDirektBtn.addEventListener('click', () => showScreen('game'));
    ui.backToWorldMapBtn.addEventListener('click', () => {
        if (ui.sfxSlideClose) {
            ui.sfxSlideClose.currentTime = 0;
            ui.sfxSlideClose.play();
        }
        // Bring map wrapper to front so the closing animation is visible
        ui.worldMapWrapper.style.zIndex = 2;

        // Hide the location title
        ui.locationTitleDisplay.style.opacity = 0;

        // Remove the split class to trigger the closing animation
        const mapLeft = document.getElementById('world-map-left');
        const mapRight = document.getElementById('world-map-right');
        mapLeft.classList.remove('split');
        mapRight.classList.remove('split');

        // After the animation, hide the location detail screen and show overlays
        setTimeout(() => {
            ui.locationDetailScreen.style.display = 'none';
            ui.locationOverlayContainer.style.display = 'block';
            // Use a nested timeout to allow the display property to apply before adding the class for the transition
            setTimeout(() => {
                ui.locationOverlayContainer.classList.add('active');
            }, 20);
        }, 800); // Must match animation duration
    });
    ui.savePartyBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/gamesaves');
            const saveFiles = await response.json();

            const container = document.getElementById('existing-saves-container');
            container.innerHTML = ''; // Clear old list

            if (saveFiles.length === 0) {
                container.innerHTML = '<p>Noch keine Spielstände vorhanden.</p>';
            } else {
                const list = document.createElement('ul');
                saveFiles.forEach(file => {
                    const listItem = document.createElement('li');
                    listItem.className = 'existing-save-item';
                    listItem.textContent = file.replace('.json', '');
                    list.appendChild(listItem);
                });
                container.appendChild(list);
            }
        } catch (error) {
            console.error('Could not fetch existing saves:', error);
            document.getElementById('existing-saves-container').innerHTML = '<p>Fehler beim Laden der Spielstände.</p>';
        }
        ui.saveGameModal.style.display = 'flex';
    });
    ui.exitBtn.addEventListener('click', () => {
        window.close();
    });

    ui.rpgMenuToggleBtn.addEventListener('click', () => {
        ui.rpgMenuPopup.classList.toggle('hidden');
    });

    // Volume Sliders
    ui.musicVolumeSlider.addEventListener('input', (e) => {
        if(ui.bgMusic) ui.bgMusic.volume = e.target.value / 100;
    });
    ui.sfxVolumeSlider.addEventListener('input', (e) => {
        if(ui.sfxClick) ui.sfxClick.volume = e.target.value / 100;
    });

    // Custom Char Modal Listeners
    ui.cancelCharBtn.addEventListener('click', closeCustomCharModal);
    ui.confirmCharBtn.addEventListener('click', handleConfirmCustomChar);
    ui.attributeButtons.forEach(button => {
        button.addEventListener('click', handleAttributeChange);
    });

    // Naming Modal Listeners
    ui.cancelPredefNameBtn.addEventListener('click', closeNameCharModal);
    ui.confirmPredefNameBtn.addEventListener('click', handleConfirmPredefName);

    // Save Game Modal Listeners
    ui.cancelSaveBtn.addEventListener('click', () => {
        ui.saveGameModal.style.display = 'none';
    });

    const showLoadGameModal = async () => {
        try {
            const response = await fetch('/api/gamesaves');
            if (!response.ok) {
                throw new Error('Failed to fetch save games.');
            }
            const saveFiles = await response.json();

            ui.saveSlotsContainer.innerHTML = ''; // Clear previous slots

            if (saveFiles.length === 0) {
                ui.saveSlotsContainer.innerHTML = '<p>Keine Spielstände gefunden.</p>';
            } else {
                saveFiles.forEach(fileName => {
                    const button = document.createElement('button');
                    button.textContent = fileName.replace('.json', '');
                    button.classList.add('save-slot-btn');
                    button.addEventListener('click', () => loadGame(fileName));
                    ui.saveSlotsContainer.appendChild(button);
                });
            }

            ui.loadGameModal.style.display = 'flex';
        } catch (error) {
            console.error('Error loading save games:', error);
            alert('Fehler beim Abrufen der Spielstände.');
        }
    };

    ui.loadGameBtn.addEventListener('click', showLoadGameModal);
    ui.loadPartyBtn.addEventListener('click', showLoadGameModal);

    ui.cancelLoadBtn.addEventListener('click', () => {
        ui.loadGameModal.style.display = 'none';
    });
    ui.confirmSaveBtn.addEventListener('click', async () => {
        const baseName = ui.saveNameInput.value.trim();
        if (baseName.length < 3 || !/^[a-zA-Z0-9_ -]+$/.test(baseName)) {
             alert('Bitte gib einen gültigen Namen mit mindestens 3 Zeichen ein (nur Buchstaben, Zahlen, Leerzeichen, _ und -).');
            return;
        }

        const charData = JSON.parse(localStorage.getItem('selectedCharacter'));

        if (!charData) {
            alert('Fehler: Kein Charakter zum Speichern ausgewählt. Bitte erstelle zuerst einen Charakter.');
            return;
        }

        // Create a timestamp
        const now = new Date();
        const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;

        const finalSaveName = `${baseName}_${timestamp}`;

        const saveData = {
            name: finalSaveName, // Send the final name to the server
            character: charData,
            party: npcParty,
            location: currentLocationId
        };

        try {
            const response = await fetch('/api/gamesaves', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(saveData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save game.');
            }

            ui.saveNameInput.value = '';
            ui.saveGameModal.style.display = 'none';
            alert('Spielstand gespeichert!');

        } catch (error) {
            console.error('Error saving game:', error);
            alert(`Fehler beim Speichern: ${error.message}`);
        }
    });

    // Quest Scroll Modal Listeners
    ui.questAcceptBtn.addEventListener('click', () => {
        if (ui.sfxQuestAccept) {
            ui.sfxQuestAccept.currentTime = 0;
            ui.sfxQuestAccept.play();
        }

        // Save the current NPC party to localStorage for the battle screen
        try {
            localStorage.setItem('npcParty', JSON.stringify(npcParty));
        } catch (e) {
            console.error("Could not save NPC party to localStorage:", e);
        }

        // Navigate to the battle screen
        window.location.href = 'battle.html';
    });

    ui.questDeclineBtn.addEventListener('click', () => {
        if (ui.sfxQuestDecline) {
            ui.sfxQuestDecline.currentTime = 0;
            ui.sfxQuestDecline.play();
        }
        ui.questScrollModal.style.display = 'none';
    });
}

// Show a specific screen
function showScreen(screenId) {
    console.log(`showScreen called with: ${screenId}`);
    // Hide all screens
    if (ui.titleScreen) ui.titleScreen.style.display = 'none';
    if (ui.gameScreen) ui.gameScreen.style.display = 'none';
    if (ui.optionsScreen) ui.optionsScreen.style.display = 'none';
    if (ui.characterCreationScreen) ui.characterCreationScreen.style.display = 'none';
    if (ui.locationDetailScreen) ui.locationDetailScreen.style.display = 'none';
    
    // Show the requested screen
    switch(screenId) {
        case 'title':
            if (ui.titleScreen) ui.titleScreen.style.display = 'flex'; // Use flex to center content
            playBgMusic();
            break;
        case 'options':
            if (ui.optionsScreen) ui.optionsScreen.style.display = 'flex'; // Use flex to center content
            break;
        case 'character-creation':
            if (ui.characterCreationScreen) ui.characterCreationScreen.style.display = 'flex';
            break;
        case 'game':
            if (ui.gameScreen) ui.gameScreen.style.display = 'flex';
            setupGameScreen();
            break;
        case 'location-detail':
            if (ui.locationDetailScreen) ui.locationDetailScreen.style.display = 'flex';
            break;
    }
}

function setupGameScreen() {
    const charCardContainer = document.getElementById('game-character-card-container');
    const charData = JSON.parse(localStorage.getItem('selectedCharacter'));

    if (!charData) {
        charCardContainer.innerHTML = '<p>Kein Charakter ausgewählt. Bitte erstelle einen Charakter.</p>';
        ui.savePartyBtn.disabled = true; // Disable save if no character
        return;
    }
    ui.savePartyBtn.disabled = false; // Enable save if character exists

    charCardContainer.innerHTML = `
        <div class="character-card-game">
            <img src="${charData.image}" alt="${charData.name}">
            <h3>${charData.name}</h3>
            <div class="card-stats">
                <span>STÄ: ${charData.stats.strength}</span>
                <span>GES: ${charData.stats.dexterity}</span>
                <span>INT: ${charData.stats.intelligence}</span>
            </div>
        </div>
    `;

    setupNpcSelection();
    createLocationOverlays();
}

function setupNpcSelection() {
    const npcContainer = document.getElementById('npc-selection-container');
    npcContainer.innerHTML = ''; // Clear previous content

    for (let i = 0; i < 3; i++) {
        const card = document.createElement('div');
        card.className = 'npc-card';

        let options = '<option value="">- Klasse wählen -</option>';
        for (const className in RPG_CLASSES) {
            // Don't include the custom character option for NPCs
            if (className !== 'Eigener Charakter') {
                options += `<option value="${className}">${className}</option>`;
            }
        }

        const savedNpc = npcParty[i];
        const imgSrc = savedNpc && RPG_CLASSES[savedNpc.className] ? RPG_CLASSES[savedNpc.className].img[savedNpc.gender] : '/images/RPG/Charakter/male_silhouette.svg';

        card.innerHTML = `
            <img src="${imgSrc}" alt="NPC ${i + 1}">
            <div class="npc-card-details">
                <h4>Begleiter ${i + 1}</h4>
                <select class="npc-class-select" data-slot="${i}">
                    ${options}
                </select>
                <div class="gender-selector">
                    <button class="gender-btn active" data-gender="male"><img src="/images/RPG/Charakter/M.png" alt="Männlich"></button>
                    <button class="gender-btn" data-gender="female"><img src="/images/RPG/Charakter/F.png" alt="Weiblich"></button>
                </div>
            </div>
        `;
        npcContainer.appendChild(card);

        if (savedNpc) {
            card.querySelector('.npc-class-select').value = savedNpc.className;
        }
    }

    document.querySelectorAll('.npc-card').forEach((card, i) => {
        const select = card.querySelector('.npc-class-select');
        const img = card.querySelector('img');
        const genderButtons = card.querySelectorAll('.gender-btn');

        const updateNpc = () => {
            const selectedClass = select.value;
            const activeGenderBtn = card.querySelector('.gender-btn.active');
            const gender = activeGenderBtn ? activeGenderBtn.dataset.gender : 'male';

            if (selectedClass && RPG_CLASSES[selectedClass]) {
                const classData = RPG_CLASSES[selectedClass];
                img.src = classData.img[gender];

                npcParty[i] = {
                    name: selectedClass,
                    class: selectedClass,
                    image: classData.img[gender],
                    stats: classData.stats,
                    hp: 100, maxHp: 100, mana: 100, maxMana: 100,
                    gender: gender
                };
            } else {
                img.src = '/images/RPG/Charakter/male_silhouette.svg';
                npcParty[i] = null;
            }
        };

        select.addEventListener('change', updateNpc);

        genderButtons.forEach(button => {
            button.addEventListener('click', () => {
                card.querySelector('.gender-btn.active').classList.remove('active');
                button.classList.add('active');
                updateNpc();
            });
        });
    });
}

function createLocationOverlays() {
    const overlayContainer = document.getElementById('location-overlay-container');
    overlayContainer.innerHTML = '';

    for (const locationId in LOCATIONS) {
        const location = LOCATIONS[locationId];

        // Create a container for each location spot
        const locationSpot = document.createElement('div');
        locationSpot.className = 'location-spot';
        locationSpot.style.top = location.coords.top;
        locationSpot.style.left = location.coords.left;
        locationSpot.style.width = location.coords.width;
        locationSpot.style.height = location.coords.height;
        locationSpot.dataset.locationId = locationId;
        locationSpot.title = location.name; // Show name on hover

        // The clickable overlay itself
        const overlay = document.createElement('div');
        overlay.className = 'location-overlay';
        overlay.addEventListener('click', () => {
            playClickSound();
            showLocationDetail(locationId);
        });

        // The name label
        const nameLabel = document.createElement('div');
        nameLabel.className = 'location-name-label';
        nameLabel.textContent = location.name;

        locationSpot.appendChild(overlay);
        locationSpot.appendChild(nameLabel);
        overlayContainer.appendChild(locationSpot);
    }
}

function showLocationDetail(locationId) {
    if (ui.sfxSlideOpen) {
        ui.sfxSlideOpen.currentTime = 0;
        ui.sfxSlideOpen.play();
    }
    currentLocationId = locationId;
    const location = LOCATIONS[locationId];
    if (!location) return;

    // 1. Prepare the detail screen content
    const locationName = document.getElementById('location-name');
    const detailMap = document.getElementById('location-detail-map');
    const actionsContainer = document.getElementById('location-actions');
    if (location.detailMap) {
        detailMap.src = location.detailMap;
    }
    actionsContainer.innerHTML = '';
    location.actions.forEach(action => {
        const actionButton = document.createElement('button');
        actionButton.className = 'action-btn';
        actionButton.textContent = action.replace('_', ' ');

        if (action === 'quest') {
            actionButton.addEventListener('click', () => {
                if (ui.sfxParchment) {
                    ui.sfxParchment.currentTime = 0;
                    ui.sfxParchment.play();
                }
                ui.questScrollModal.style.display = 'flex';
            });
        }

        actionsContainer.appendChild(actionButton);
    });

    // 2. Hide overlays and show title
    ui.locationOverlayContainer.classList.remove('active');
    ui.locationOverlayContainer.style.display = 'none';
    ui.locationTitleDisplay.textContent = location.name;
    ui.locationTitleDisplay.style.opacity = 1;

    // 3. Make the detail screen visible BEFORE the animation starts
    ui.locationDetailScreen.style.display = 'block';

    // 4. Trigger the opening animation
    const mapLeft = document.getElementById('world-map-left');
    const mapRight = document.getElementById('world-map-right');
    mapLeft.classList.add('split');
    mapRight.classList.add('split');

    // 5. After the animation, send the world map wrapper to the back
    setTimeout(() => {
        ui.worldMapWrapper.style.zIndex = 0;
    }, 800); // Must match animation duration
}

async function loadGame(fileName) {
    try {
        // We get the filename with .json, but the API needs it without
        const saveName = fileName.replace('.json', '');
        const response = await fetch(`/api/gamesaves/${saveName}`);
        if (!response.ok) {
            throw new Error(`Failed to load game: ${saveName}`);
        }
        const saveData = await response.json();

        // Load main character data into localStorage
        localStorage.setItem('selectedCharacter', JSON.stringify(saveData.character));

        // Load NPC party
        npcParty = saveData.party || [null, null, null];

        // Load current location
        currentLocationId = saveData.location || null;

        // Refresh the game screen with the loaded data
        if (ui.gameScreen.style.display !== 'flex') {
            showScreen('game');
        } else {
            setupGameScreen();
        }

        console.log('Game loaded successfully:', saveData);
        ui.loadGameModal.style.display = 'none'; // Close modal on success

    } catch (error) {
        console.error('Error in loadGame:', error);
        alert('Fehler beim Laden des Spiels.');
    }
}


// --- Custom Character Modal Functions ---
function openCustomCharModal() {
    // Reset to a clean state for point-buy
    customCharState.stats = { strength: 1, dexterity: 1, intelligence: 1 };
    customCharState.points = 12; // Total 15, 3 are spent on min 1 for each
    customCharState.name = '';
    ui.charNameInput.value = '';
    updateCustomCharModalUI();
    ui.customCharModal.style.display = 'flex';
}

function closeCustomCharModal() {
    ui.customCharModal.style.display = 'none';
}

function updateCustomCharModalUI() {
    ui.pointsRemainingEl.textContent = customCharState.points;
    ui.strengthInput.value = customCharState.stats.strength;
    ui.dexterityInput.value = customCharState.stats.dexterity;
    ui.intelligenceInput.value = customCharState.stats.intelligence;

    const noPointsLeft = customCharState.points <= 0;
    ui.attributeButtons.forEach(btn => {
        const action = btn.dataset.action;
        const stat = btn.dataset.stat;
        if (action === 'plus') {
            btn.disabled = noPointsLeft;
        } else if (action === 'minus') {
            btn.disabled = customCharState.stats[stat] <= customCharState.minStat;
        }
    });

    ui.confirmCharBtn.disabled = customCharState.points > 0;
}

function handleAttributeChange(event) {
    const action = event.target.dataset.action;
    const stat = event.target.dataset.stat;

    if (action === 'plus' && customCharState.points > 0) {
        customCharState.stats[stat]++;
        customCharState.points--;
    } else if (action === 'minus' && customCharState.stats[stat] > customCharState.minStat) {
        customCharState.stats[stat]--;
        customCharState.points++;
    }
    updateCustomCharModalUI();
}

function handleConfirmCustomChar() {
    const charName = ui.charNameInput.value.trim();
    if (charName.length < 3) {
        alert('Bitte gib einen Namen mit mindestens 3 Zeichen ein.');
        return;
    }
    if (customCharState.points > 0) {
        alert('Bitte verteile alle Attributspunkte.');
        return;
    }

    customCharState.name = charName;
    const customCard = document.querySelector('.character-card[data-iscustom="true"]');
    const selectedGender = customCard.dataset.gender;

    let finalClass = 'Custom';
    let finalImage = selectedGender === 'male' ? '/images/RPG/Charakter/male_silhouette.svg' : '/images/RPG/Charakter/female_silhouette.svg';

    // Check for secret class unlock
    if (RPG_CLASSES['Arkaner Komponist']) {
        const secretClassData = RPG_CLASSES['Arkaner Komponist'];
        const reqs = secretClassData.stats;
        const stats = customCharState.stats;
        if (stats.strength === reqs.strength && stats.dexterity === reqs.dexterity && stats.intelligence === reqs.intelligence) {
            finalClass = 'Arkaner Komponist';
            finalImage = secretClassData.img[selectedGender];
            alert('Herzlichen Glückwunsch: Du hast den Arkanen Komponisten freigeschaltet.');
        }
    }

    const charData = {
        name: customCharState.name,
        class: finalClass,
        image: finalImage,
        stats: customCharState.stats,
        gender: selectedGender
    };

    if (window.opener) {
        window.opener.postMessage({ type: 'character-selected', data: charData }, '*');
        // window.close(); // Removed as per user request
    } else {
        localStorage.setItem('selectedCharacter', JSON.stringify(charData));
        if (customCard) {
            customCard.querySelector('h3').textContent = charData.name;
            customCard.querySelector('img').src = charData.image;
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            customCard.classList.add('selected');
        }
        ui.startGameBtn.disabled = false;
    }

    closeCustomCharModal();
}

// --- Naming Modal Functions ---
function openNameCharModal(className, card) {
    const classData = RPG_CLASSES[className];
    namingContext = { classData, card };
    ui.predefCharNameInput.value = '';
    ui.nameCharModal.style.display = 'flex';
    ui.predefCharNameInput.focus();
}

function closeNameCharModal() {
    namingContext = null;
    ui.nameCharModal.style.display = 'none';
}

function handleConfirmPredefName() {
    const charName = ui.predefCharNameInput.value.trim();
    if (charName.length < 3) {
        alert('Bitte gib einen Namen mit mindestens 3 Zeichen ein.');
        return;
    }
    if (!namingContext) return;

    const { classData, card } = namingContext;
    const selectedGender = card.dataset.gender;
    const charData = {
        name: charName,
        class: classData.name,
        image: classData.img[selectedGender],
        stats: classData.stats,
        gender: selectedGender
    };

    if (window.opener) {
        window.opener.postMessage({ type: 'character-selected', data: charData }, '*');
        // window.close(); // Removed as per user request
    } else {
        // Fallback for when the page is not opened as a popup
        localStorage.setItem('selectedCharacter', JSON.stringify(charData));
        alert(`${charData.name} wurde ausgewählt!`);
        ui.startGameBtn.disabled = false;
    }

    closeNameCharModal();
}


function populateCharacterCreation() {
    const container = document.getElementById('character-cards-container');
    container.innerHTML = '';

    const createClassCard = (className, classData) => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.dataset.gender = 'male';
        card.dataset.className = className;

        let statsHtml = '';
        if (classData.stats) {
            statsHtml = `
                <div class="card-stats">
                    <span>STÄ: ${classData.stats.strength}</span>
                    <span>GES: ${classData.stats.dexterity}</span>
                    <span>INT: ${classData.stats.intelligence}</span>
                </div>
            `;
        }

        card.innerHTML = `
            <img src="${classData.img.male}" alt="${className}">
            <h3>${className}</h3>
            <p>${classData.description}</p>
            ${statsHtml}
            <div class="gender-selector">
                <button class="gender-btn active" data-gender="male"><img src="/images/RPG/Charakter/M.png" alt="Männlich"></button>
                <button class="gender-btn" data-gender="female"><img src="/images/RPG/Charakter/F.png" alt="Weiblich"></button>
            </div>
        `;

        card.addEventListener('click', () => {
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            openNameCharModal(className, card);
        });

        const genderButtons = card.querySelectorAll('.gender-btn');
        genderButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.stopPropagation();
                const selectedGender = button.dataset.gender;
                card.dataset.gender = selectedGender;
                card.querySelector('.gender-btn.active').classList.remove('active');
                button.classList.add('active');
                card.querySelector('img').src = classData.img[selectedGender];
            });
        });

        return card;
    };

    for (const className in RPG_CLASSES) {
        container.appendChild(createClassCard(className, RPG_CLASSES[className]));
    }

    const customCard = document.createElement('div');
    customCard.className = 'character-card';
    customCard.dataset.iscustom = 'true';
    customCard.innerHTML = `
        <img src="/images/RPG/Charakter/male_silhouette.svg" alt="Eigener Charakter">
        <h3>Eigener Charakter</h3>
        <p>Erstelle einen Charakter mit frei verteilbaren Attributpunkten.</p>
        <div class="gender-selector">
            <button class="gender-btn active" data-gender="male"><img src="/images/RPG/Charakter/M.png" alt="Männlich"></button>
            <button class="gender-btn" data-gender="female"><img src="/images/RPG/Charakter/F.png" alt="Weiblich"></button>
        </div>
    `;
    customCard.addEventListener('click', () => {
        document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
        customCard.classList.add('selected');
        openCustomCharModal();
    });
    container.appendChild(customCard);
}


function handleKeyDown(e) {
    keys[e.key] = true;
    if (e.key === 'Escape') {
        if (ui.gameScreen.style.display === 'block') {
            showScreen('title');
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// Start the game
window.onload = init;

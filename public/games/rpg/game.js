const RpgGame = {
    // --- Game State ---
    ui: {},
    partyData: [],
    currentLocationId: null,
    creationState: { name: '', class: '', gender: 'male' },
    socket: null,
    isPartyLeader: false,
    myUsername: '',

    // --- Initialization ---
    init: function(username, isParty, mainSocket) {
        this.myUsername = username;
        this.isPartyLeader = isParty;
        this.socket = mainSocket; // Use the socket from the main chat app

        // Cache all UI elements
        this.ui = {
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
            invitablePlayersList: document.getElementById('invitable-players-list'),
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

        this.setupSocketListeners();

        const myChar = JSON.parse(localStorage.getItem(`selectedCharacter_${this.myUsername}`));
        if (myChar) {
            this.partyData = [{ username: this.myUsername, character: myChar }];
            this.startGame(myChar);
        } else {
            this.showScreen('title');
        }

        this.setupEventListeners();
        this.initCharacterCreationScreen();
    },

    // --- Sound ---
    playClickSound: function() {
        if (this.ui.sfxClick) {
            this.ui.sfxClick.currentTime = 0;
            this.ui.sfxClick.play();
        }
    },

    // --- Event Listeners Setup ---
    setupEventListeners: function() {
        document.querySelectorAll('#rpg-container button').forEach(button => button.addEventListener('click', this.playClickSound.bind(this)));

        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        if (backToLobbyBtn) {
            backToLobbyBtn.addEventListener('click', () => {
                const gameContainer = document.querySelector('.game-container');
                const rpgContainer = document.getElementById('rpg-container');
                if (gameContainer && rpgContainer) {
                    rpgContainer.style.display = 'none';
                    gameContainer.style.display = 'flex';
                }
            });
        }

        this.ui.newGameBtn.addEventListener('click', () => this.showScreen('character-creation'));
        this.ui.startGameDirektBtn.addEventListener('click', () => {
            const characterData = JSON.parse(localStorage.getItem(`selectedCharacter_${this.myUsername}`));
            if (characterData) {
                this.partyData = [{ username: this.myUsername, character: characterData }];
                this.startGame(characterData);
            } else {
                alert('Bitte erstelle zuerst einen Charakter im Menü "Charakter erstellen".');
            }
        });
        this.ui.optionsBtn.addEventListener('click', () => this.showScreen('options'));
        document.getElementById('options-back-btn').addEventListener('click', () => this.showScreen('title'));
        this.ui.creationBackBtn.addEventListener('click', () => this.showScreen('title'));
        this.ui.questAcceptBtn.addEventListener('click', this.handleQuestAccept.bind(this));
        this.ui.questDeclineBtn.addEventListener('click', () => this.ui.questScrollModal.style.display = 'none');
        this.ui.backToWorldMapBtn.addEventListener('click', this.handleBackToWorldMap.bind(this));

        if (this.ui.creationScreen) {
            this.ui.classSelect.addEventListener('change', this.updateCreationState.bind(this));
            this.ui.genderSelector.addEventListener('click', (e) => {
                const button = e.target.closest('.gender-btn');
                if (button && !button.classList.contains('active')) {
                    this.ui.genderSelector.querySelector('.active').classList.remove('active');
                    button.classList.add('active');
                    this.updateCreationState();
                }
            });
            this.ui.charNameInput.addEventListener('input', this.updateCreationState.bind(this));
            this.ui.confirmCreationBtn.addEventListener('click', this.confirmCharacter.bind(this));
        }
    },

    setupSocketListeners: function() {
        if(!this.socket) return;

        // This is a listener from the old chat.js, may need to be adapted
        this.socket.on('battle:started', (battleState) => {
            const amIInParty = battleState.partyMembers.some(p => p.name === this.myUsername);
            const amILeader = battleState.partyId === this.myUsername;
            if (amIInParty && !amILeader) {
                // How to handle battle start now? This needs a bigger refactor for Phase 3.
                // For now, we just log it.
                console.log("A battle has started that you are part of!", battleState);
                alert("Ein Kampf, an dem du teilnimmst, hat begonnen!");
            }
        });

        // This is the listener for our party invite feature
        this.socket.on('rpg:invitable-players-list', (players) => {
            this.renderInvitablePlayers(players);
        });
    },

    renderInvitablePlayers: function(players) {
        if (!this.ui.invitablePlayersList) return;
        this.ui.invitablePlayersList.innerHTML = '';

        if (players.length === 0) {
            this.ui.invitablePlayersList.innerHTML = '<p>No other players available to invite.</p>';
            return;
        }

        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'invitable-player';

            const nameSpan = document.createElement('span');
            nameSpan.textContent = player.username;

            const inviteBtn = document.createElement('button');
            inviteBtn.textContent = 'Invite';
            inviteBtn.dataset.username = player.username;
            inviteBtn.className = 'invite-btn';

            inviteBtn.addEventListener('click', (e) => {
                if (this.socket) {
                    this.socket.emit('rpg:invite-player', player.username);
                    e.target.disabled = true;
                    e.target.textContent = 'Invited';
                }
            });

            playerDiv.appendChild(nameSpan);
            playerDiv.appendChild(inviteBtn);
            this.ui.invitablePlayersList.appendChild(playerDiv);
        });
    },

    // --- Screen Management ---
    showScreen: function(screenId) {
        document.querySelectorAll('#rpg-container [id$="-screen"]').forEach(el => {
            el.style.display = 'none';
        });

        const screenToShow = document.getElementById(screenId + '-screen');
        if(screenToShow) {
            screenToShow.style.display = 'flex';
        }

        if (screenId === 'game') {
            document.getElementById('game-screen').style.display = 'block';
        }

        if (screenId === 'title' && this.ui.bgMusic) {
             this.ui.bgMusic.play().catch(e => console.error("Audio autoplay failed: ", e));
        }
    },

    // --- Character Creation ---
    initCharacterCreationScreen: function() {
        if (!this.ui.creationScreen) return;
        this.ui.classSelect.innerHTML = '<option value="">- Klasse wählen -</option>';
        for (const className in RPG_CLASSES) {
            if (RPG_CLASSES[className].playable === false) continue;
            this.ui.classSelect.appendChild(new Option(className, className));
        }
        this.updateCreationState();
    },

    updateCreationState: function() {
        if (!this.ui.creationScreen) return;
        const activeGenderBtn = this.ui.genderSelector.querySelector('.active');
        this.creationState = {
            name: this.ui.charNameInput.value.trim(),
            class: this.ui.classSelect.value,
            gender: activeGenderBtn ? activeGenderBtn.dataset.gender : 'male',
        };
        this.updateCreationScreen();
    },

    updateCreationScreen: function() {
        const { name, class: className, gender } = this.creationState;
        const classData = RPG_CLASSES[className];

        if (classData) {
            this.ui.classDisplay.textContent = className;
            this.ui.classDescription.textContent = classData.description;
            const stats = classData.stats;
            this.ui.statsDisplay.innerHTML = `<span>STÄ: ${stats.strength}</span> <span>GES: ${stats.dexterity}</span> <span>INT: ${stats.intelligence}</span>`;
        } else {
            this.ui.classDisplay.textContent = 'Klasse';
            this.ui.classDescription.textContent = 'Wähle eine Klasse, um eine Beschreibung und die Basiswerte zu sehen.';
            this.ui.statsDisplay.innerHTML = '';
        }

        let portraitPath = `/images/RPG/Charakter/${gender === 'male' ? 'M' : 'F'}.png`;
        if (className && classData) {
            const genderSuffix = gender === 'male' ? 'm' : 'w';
            const portraitFileName = `${classData.imgName}_${genderSuffix}.png`;
            portraitPath = `/images/RPG/Charakter/${portraitFileName}`;
        }
        this.ui.portraitDisplay.src = portraitPath;
        this.ui.confirmCreationBtn.disabled = !(name && name.length >= 3 && className);
    },

    confirmCharacter: function() {
        const { name, class: className, gender } = this.creationState;
        if (!name || !className) {
            alert("Bitte fülle alle Felder aus.");
            return;
        }

        const classData = RPG_CLASSES[className];
        const finalCharData = { name, class: className, gender, image: this.ui.portraitDisplay.src, stats: classData.stats, abilities: classData.abilities };

        localStorage.setItem(`selectedCharacter_${this.myUsername}`, JSON.stringify(finalCharData));

        alert("Charakter erstellt! Kehre zur Lobby zurück.");

        const gameContainer = document.querySelector('.game-container');
        const rpgContainer = document.getElementById('rpg-container');
        rpgContainer.style.display = 'none';
        gameContainer.style.display = 'flex';

        document.dispatchEvent(new CustomEvent('rpgCharacterCreated', { detail: finalCharData }));
    },

    // --- Game Logic ---
    startGame: function(characterData) {
        this.showScreen('game');

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
        this.ui.gameCharacterCardContainer.innerHTML = card;

        if (this.socket) {
            this.socket.emit('rpg:get-invitable-players');
        }

        this.updatePartyView();
        this.initWorldMap();
    },

    updatePartyView: function() {
        if (!this.ui.npcSelectionContainer) return;
        this.ui.npcSelectionContainer.innerHTML = '';

        this.partyData.forEach(partyMember => {
            if (partyMember && partyMember.character) {
                const playerCard = document.createElement('div');
                playerCard.className = 'npc-card';
                if (partyMember.username === this.myUsername) {
                    playerCard.classList.add('current-player');
                }
                playerCard.innerHTML = `
                    <img src="${partyMember.character.image}" alt="${partyMember.username}">
                    <div class="npc-card-details">
                        <h4>${partyMember.username}</h4>
                        <p>${partyMember.character.class}</p>
                    </div>
                `;
                this.ui.npcSelectionContainer.appendChild(playerCard);
            }
        });

        const maxPartySize = 4;
        for (let i = this.partyData.length; i < maxPartySize; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'npc-card empty';
            this.ui.npcSelectionContainer.appendChild(emptySlot);
        }
    },

    initWorldMap: function() {
        if (!this.ui.locationOverlayContainer) return;
        this.ui.locationOverlayContainer.innerHTML = '';

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

            overlay.addEventListener('click', () => this.handleLocationClick(locId));
            this.ui.locationOverlayContainer.appendChild(spot);
        }

        setTimeout(() => {
            if (this.ui.locationOverlayContainer) {
                this.ui.locationOverlayContainer.classList.add('active');
            }
        }, 1000);
    },

    // --- Action Handlers ---
    handleLocationClick: function(locId) {
        this.showLocationDetail(locId);
    },

    showLocationDetail: function(locId) {
        this.currentLocationId = locId;
        const loc = LOCATIONS[locId];
        if (!loc) return;

        this.ui.locationName.textContent = loc.name;
        this.ui.locationDetailMap.src = loc.detailMap;
        this.displayLocationActions(locId);

        this.ui.worldMapLeft.classList.add('split');
        this.ui.worldMapRight.classList.add('split');
        this.ui.locationOverlayContainer.style.display = 'none';
        this.ui.locationDetailScreen.style.zIndex = 3;
        setTimeout(() => {
            this.ui.locationDetailScreen.style.display = 'block';
        }, 400);
    },

    displayLocationActions: function(locId) {
        const location = LOCATIONS[locId];
        if (!location || !this.ui.locationActions) return;
        this.ui.locationActions.innerHTML = '';

        location.actions.forEach(action => {
            const button = document.createElement('button');
            button.textContent = action.charAt(0).toUpperCase() + action.slice(1);
            button.id = `action-${action}-btn`;
            if (action === 'quest') {
                button.addEventListener('click', () => {
                    this.ui.questScrollModal.style.display = 'flex';
                });
            }
            this.ui.locationActions.appendChild(button);
        });
    },

    handleQuestAccept: function() {
        this.ui.questScrollModal.style.display = 'none';
        if (this.socket && this.isPartyLeader) {
            const partyId = this.myUsername;
            this.socket.emit('party:initiate-battle', { partyId: partyId, locationId: this.currentLocationId });
        } else {
            // This needs to be refactored to not change the window URL
            alert("Battle would start here!");
        }
    },

    handleBackToWorldMap: function() {
        this.ui.locationDetailScreen.style.display = 'none';
        this.ui.locationDetailScreen.style.zIndex = 1;
        this.ui.worldMapLeft.classList.remove('split');
        this.ui.worldMapRight.classList.remove('split');
        this.ui.locationOverlayContainer.style.display = 'block';
    }
};

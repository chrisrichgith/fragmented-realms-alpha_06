document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let currentUser = null;
    let isAdmin = false;
    let sendToTarget = null;
    let characterIsSelected = false;
    let currentInvitation = null;
    let currentParty = [];

    // --- Configs ---
    const GAMES_CONFIG = {
        'space-shooter': {
            displayName: 'Space Shooter',
            icon: '/images/Chat/space-shooter.png',
            costs: { gold: 100, kristall: 25 }
        }
    };

    // --- DOM Elements ---
    const loginOverlay = document.getElementById('loginOverlay');
    const loginIdentifierInput = document.getElementById('loginIdentifier');
    const loginPasswordInput = document.getElementById('loginPassword');
    const loginButton = document.getElementById('loginButton');
    const registerUsernameInput = document.getElementById('registerUsername');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerConfirmPasswordInput = document.getElementById('registerConfirmPassword');
    const registerButton = document.getElementById('registerButton');
    const userInfo = document.getElementById('userInfo');
    const logoutButton = document.getElementById('logoutButton');
    const userList = document.getElementById('userList');
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const adminPanelBtn = document.getElementById('adminPanelBtn');

    // Modals
    const adminPanelModal = document.getElementById('adminPanelModal');
    const closeAdminPanel = document.getElementById('closeAdminPanel');
    const sendResourcesModal = document.getElementById('sendResourcesModal');
    const closeSendResourcesModal = document.getElementById('closeSendResourcesModal');
    const invitationModal = document.getElementById('invitation-modal');
    const invitationText = document.getElementById('invitation-text');
    const invitationAcceptBtn = document.getElementById('invitation-accept-btn');
    const invitationDeclineBtn = document.getElementById('invitation-decline-btn');

    // Admin Panel Elements
    const userSelect = document.getElementById('userSelect');
    const adminGold = document.getElementById('adminGold');
    const adminHolz = document.getElementById('adminHolz');
    const adminErz = document.getElementById('adminErz');
    const adminKristall = document.getElementById('adminKristall');
    const adminGames = document.getElementById('adminGames');
    const saveAdminChanges = document.getElementById('saveAdminChanges');
    const adminNewPassword = document.getElementById('adminNewPassword');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const deleteUserBtn = document.getElementById('deleteUserBtn');

    // Send Resources Elements
    const sendToUserSpan = document.getElementById('sendToUser');
    const sendGoldInput = document.getElementById('sendGold');
    const sendHolzInput = document.getElementById('sendHolz');
    const sendErzInput = document.getElementById('sendErz');
    const sendKristallInput = document.getElementById('sendKristall');
    const confirmSendBtn = document.getElementById('confirmSendResourcesBtn');

    const tabLinks = document.querySelectorAll('.tab-link');
    const goldCount = document.getElementById('goldCount');
    const holzCount = document.getElementById('holzCount');
    const erzCount = document.getElementById('erzCount');
    const kristallCount = document.getElementById('kristallCount');
    const gameList = document.getElementById('gameList');

    // Character Sheet Elements
    const charSheet = document.getElementById('character-sheet');
    const charLevel = document.getElementById('charLevel');
    const charXP = document.getElementById('charXP');
    const charStrength = document.getElementById('charStrength');
    const charDexterity = document.getElementById('charDexterity');
    const charIntelligence = document.getElementById('charIntelligence');
    const startRpgBtn = document.getElementById('startRpgBtn');
    const partyList = document.getElementById('partyList');
    const startPartyRpgBtn = document.getElementById('startPartyRpgBtn');


    // --- Tabbed Form ---
    function openTab(evt, tabName) {
        const tabContents = document.getElementsByClassName('tab-content');
        for (let i = 0; i < tabContents.length; i++) {
            tabContents[i].style.display = 'none';
        }
        const currentTabLinks = document.getElementsByClassName('tab-link');
        for (let i = 0; i < currentTabLinks.length; i++) {
            currentTabLinks[i].className = currentTabLinks[i].className.replace(' active', '');
        }
        document.getElementById(tabName).style.display = 'block';
        if (evt && evt.currentTarget) {
            evt.currentTarget.className += ' active';
        }
    }

    tabLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const tabName = event.currentTarget.getAttribute('data-tab');
            openTab(event, tabName);
        });
    });

    // --- UI Update Functions ---
    function updateResourceDisplay(resources) {
        if (!resources) return;
        goldCount.textContent = resources.gold || 0;
        holzCount.textContent = resources.holz || 0;
        erzCount.textContent = resources.erz || 0;
        kristallCount.textContent = resources.kristall || 0;
    }

    function updateGameList(unlockedGames = []) {
        gameList.innerHTML = '';
        Object.keys(GAMES_CONFIG).forEach(gameId => {
            const game = GAMES_CONFIG[gameId];
            const gameElement = document.createElement('div');
            gameElement.className = 'game-item';
            if (unlockedGames.includes(gameId)) {
                gameElement.innerHTML = `<a href="/games/${gameId}/index.html" target="_blank" class="play-button"><img src="${game.icon}" alt="${game.displayName}" class="game-icon"><span>${game.displayName} spielen</span></a>`;
            } else {
                const costString = Object.entries(game.costs).map(([resource, cost]) => `<span class="cost-item">${cost} <img src="/images/Chat/${resource}.png" class="resource-cost-icon"></span>`).join('');
                gameElement.innerHTML = `<button class="unlock-button" data-gameid="${gameId}"><img src="${game.icon}" alt="${game.displayName}" class="game-icon"><span>${game.displayName} freischalten</span><div class="cost-container">${costString}</div></button>`;
            }
            gameList.appendChild(gameElement);
        });
    }

    function updateCharacterSheet(userData) {
        if (!userData) return;
        charSheet.style.display = 'block';

        const rpgData = userData.rpg || {};
        const selectedChar = userData.selectedCharacter;

        // Update level and XP from base RPG stats
        charLevel.textContent = rpgData.level || 1;
        charXP.textContent = rpgData.xp || 0;

        // Update portrait, name, and stats from the selected character if it exists
        const portraitEl = document.getElementById('char-portrait');
        const nameEl = document.getElementById('char-name');

        if (selectedChar) {
            portraitEl.src = selectedChar.image;
            nameEl.textContent = selectedChar.name;
            charStrength.textContent = selectedChar.stats.strength;
            charDexterity.textContent = selectedChar.stats.dexterity;
            charIntelligence.textContent = selectedChar.stats.intelligence;
            characterIsSelected = true;
            startRpgBtn.textContent = 'Spiel fortsetzen';
        } else {
            // Fallback to default placeholder and base RPG stats if no character is selected
            portraitEl.src = '/images/RPG/Charakter/male_silhouette.svg';
            nameEl.textContent = 'Charakter';
            charStrength.textContent = rpgData.strength || 0;
            charDexterity.textContent = rpgData.dexterity || 0;
            charIntelligence.textContent = rpgData.intelligence || 0;
            characterIsSelected = false;
            startRpgBtn.textContent = 'RPG starten';
        }
    }

    // --- Authentication ---
    function login() {
        const identifier = loginIdentifierInput.value.trim();
        const password = loginPasswordInput.value;
        if (!identifier || !password) {
            alert('Benutzername/Email und Passwort sind erforderlich.');
            return;
        }
        socket.emit('login', { identifier, password });
    }

    function register() {
        const username = registerUsernameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;
        if (!username || !email || !password || !confirmPassword) {
            alert('Alle Felder sind für die Registrierung erforderlich.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Die Passwörter stimmen nicht überein.');
            return;
        }
        socket.emit('register', { username, email, password });
    }

    loginButton.addEventListener('click', login);
    loginPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') login(); });
    registerButton.addEventListener('click', register);
    registerConfirmPasswordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') register(); });

    socket.on('login success', (data) => {
        currentUser = data.username;
        isAdmin = data.isAdmin;
        loginOverlay.style.display = 'none';
        userInfo.textContent = `Angemeldet als: ${currentUser}`;
        logoutButton.style.display = 'block';
        messageInput.disabled = false;
        sendButton.disabled = false;
        if (isAdmin) {
            adminPanelBtn.style.display = 'block';
        }
    });

    socket.on('login failed', ({ message }) => { alert(`Login fehlgeschlagen: ${message}`); });

    socket.on('register success', () => {
        alert('Registrierung erfolgreich! Du kannst dich jetzt einloggen.');
        const loginTabButton = document.querySelector('.tab-link[data-tab="login"]');
        if (loginTabButton) {
            openTab({ currentTarget: loginTabButton }, 'login');
        }
        loginIdentifierInput.value = registerUsernameInput.value;
        registerUsernameInput.value = '';
        registerEmailInput.value = '';
        registerPasswordInput.value = '';
        registerConfirmPasswordInput.value = '';
        loginPasswordInput.focus();
    });

    socket.on('register failed', ({ message }) => { alert(`Registrierung fehlgeschlagen: ${message}`); });

    // --- Main Data Handler ---
    socket.on('user data', (data) => {
        updateResourceDisplay(data.resources);
        updateGameList(data.unlockedGames);
        updateCharacterSheet(data); // Pass the whole data object

        if (data.selectedCharacter) {
            localStorage.setItem('selectedCharacter', JSON.stringify(data.selectedCharacter));
        } else {
            localStorage.removeItem('selectedCharacter');
        }
    });

    // --- Logout ---
    function logout() {
        socket.emit('logout');
        currentUser = null;
        isAdmin = false;
        userInfo.textContent = 'Nicht eingeloggt';
        loginOverlay.style.display = 'flex';
        messageInput.disabled = true;
        sendButton.disabled = true;
        logoutButton.style.display = 'none';
        adminPanelBtn.style.display = 'none';
        charSheet.style.display = 'none';
        chatMessages.innerHTML = '';
        userList.innerHTML = '';
        updateResourceDisplay({ gold: 0, holz: 0, erz: 0, kristall: 0 });
        updateGameList([]);
    }
    logoutButton.addEventListener('click', logout);

    // --- Chat & User List ---
    function sendMessage() {
        const text = messageInput.value.trim();
        if (text && currentUser) {
            socket.emit('chat message', { text });
            addMessage({ user: currentUser, text }, true);
            messageInput.value = '';
        }
    }

    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    function addMessage(message, isSent = false) {
        const time = new Date(message.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSent ? 'sent' : 'received'} ${message.user === 'System' ? 'system-message' : ''}`;
        messageElement.innerHTML = `<div class="sender">${message.user}</div><div class="text">${message.text}</div><div class="time">${time}</div>`;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    socket.on('chat message', (message) => { if (message.user !== currentUser) addMessage(message); });

    socket.on('user list', (users) => {
        userList.innerHTML = '';
        users.forEach(user => {
            const userElement = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = user.username;
            userElement.appendChild(nameSpan);

            if (user.username === currentUser) {
                userElement.style.fontWeight = 'bold';
            }

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'player-controls';

            if (user.username !== currentUser) {
                const sendBtn = document.createElement('button');
                sendBtn.textContent = 'Senden';
                sendBtn.className = 'send-res-btn';
                sendBtn.dataset.username = user.username;
                controlsDiv.appendChild(sendBtn);

                if (user.hasRpgChar) {
                    const inviteBtn = document.createElement('button');
                    inviteBtn.textContent = 'Invite';
                    inviteBtn.className = 'invite-btn';
                    inviteBtn.dataset.username = user.username;
                    controlsDiv.appendChild(inviteBtn);
                }
            }


            if(controlsDiv.hasChildNodes()) {
                userElement.appendChild(controlsDiv);
            }
            userList.appendChild(userElement);
        });
    });

    // --- Event Listeners ---
    userList.addEventListener('click', (event) => {
        const target = event.target;
        const username = target.dataset.username;
        if (!username) return;

        if (target.classList.contains('send-res-btn')) {
            sendToTarget = username;
            sendToUserSpan.textContent = username;
            sendResourcesModal.style.display = 'flex';
        } else if (target.classList.contains('invite-btn')) {
            socket.emit('rpg:invite-player', username);
        }
    });

    gameList.addEventListener('click', (event) => {
        const unlockButton = event.target.closest('.unlock-button');
        if (unlockButton) {
            const gameId = unlockButton.dataset.gameid;
            if (confirm(`Möchtest du ${GAMES_CONFIG[gameId].displayName} für die angegebenen Kosten freischalten?`)) {
                socket.emit('game:unlock', gameId);
            }
        }
    });

    startRpgBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert("Bitte logge dich zuerst ein.");
            return;
        }
        // Always pass the username. The RPG window will handle the rest.
        const url = `/games/rpg/index.html?username=${encodeURIComponent(currentUser)}`;
        window.open(url, '_blank');
    });

    startPartyRpgBtn.addEventListener('click', () => {
        // This button is only visible to the leader.
        // The server will construct the full party data when the leader initiates the battle.
        const url = `/games/rpg/index.html?username=${encodeURIComponent(currentUser)}&partyId=${encodeURIComponent(currentUser)}`;
        window.open(url, '_blank');
    });

    if (adminPanelBtn) {
        adminPanelBtn.addEventListener('click', () => {
            socket.emit('admin:get-all-users');
            adminPanelModal.style.display = 'flex';
        });
    }

    if (closeAdminPanel) {
        closeAdminPanel.addEventListener('click', () => { adminPanelModal.style.display = 'none'; });
    }

    if (closeSendResourcesModal) {
        closeSendResourcesModal.addEventListener('click', () => { sendResourcesModal.style.display = 'none'; });
    }

    confirmSendBtn.addEventListener('click', () => {
        const resources = {
            gold: parseInt(sendGoldInput.value, 10) || 0,
            holz: parseInt(sendHolzInput.value, 10) || 0,
            erz: parseInt(sendErzInput.value, 10) || 0,
            kristall: parseInt(sendKristallInput.value, 10) || 0,
        };

        if (Object.values(resources).every(v => v === 0)) {
            return alert('Bitte geben Sie eine Menge an.');
        }

        if (Object.values(resources).some(v => v < 0)) {
            return alert('Negative Werte sind nicht erlaubt.');
        }

        socket.emit('resources:send', { to: sendToTarget, resources });
        sendResourcesModal.style.display = 'none';
        sendGoldInput.value = '';
        sendHolzInput.value = '';
        sendErzInput.value = '';
        sendKristallInput.value = '';
    });

    // --- Admin Panel Listeners ---
    socket.on('admin:all-users', (users) => {
        userSelect.innerHTML = '<option value="">--Select a user--</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = `${user.username} (${user.email})`;
            userSelect.appendChild(option);
        });
    });

    userSelect.addEventListener('change', () => {
        const selectedUser = userSelect.value;
        adminGames.innerHTML = '';
        if (selectedUser) {
            socket.emit('admin:get-user-data', selectedUser, (user) => {
                if (user && !user.error) {
                    adminGold.value = user.resources.gold || 0;
                    adminHolz.value = user.resources.holz || 0;
                    adminErz.value = user.resources.erz || 0;
                    adminKristall.value = user.resources.kristall || 0;

                    Object.keys(GAMES_CONFIG).forEach(gameId => {
                        const game = GAMES_CONFIG[gameId];
                        const label = document.createElement('label');
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.name = gameId;
                        checkbox.checked = user.unlockedGames && user.unlockedGames.includes(gameId);

                        const text = document.createElement('span');
                        text.textContent = ` ${game.displayName}`;

                        label.appendChild(checkbox);
                        label.appendChild(text);
                        adminGames.appendChild(label);
                    });
                }
            });
        }
    });

    saveAdminChanges.addEventListener('click', () => {
        const targetUsername = userSelect.value;
        if (!targetUsername) return alert('Please select a user.');

        const resources = {
            gold: parseInt(adminGold.value, 10) || 0,
            holz: parseInt(adminHolz.value, 10) || 0,
            erz: parseInt(adminErz.value, 10) || 0,
            kristall: parseInt(adminKristall.value, 10) || 0
        };
        socket.emit('admin:update-resources', { targetUsername, resources });

        const unlockedGames = Array.from(adminGames.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.name);
        socket.emit('admin:update-games', { targetUsername, unlockedGames });

        alert('User data update request sent.');
    });

    resetPasswordBtn.addEventListener('click', () => {
        const targetUsername = userSelect.value;
        const newPassword = adminNewPassword.value;
        if (!targetUsername) return alert('Please select a user.');
        if (!newPassword || newPassword.length < 4) return alert('Please enter a new password (min 4 characters).');
        if (confirm(`Reset password for ${targetUsername}?`)) {
            socket.emit('admin:reset-password', { targetUsername, newPassword });
            adminNewPassword.value = '';
            alert('Password reset request sent.');
        }
    });

    deleteUserBtn.addEventListener('click', () => {
        const targetUsername = userSelect.value;
        if (!targetUsername) return alert('Please select a user.');
        if (confirm(`Are you sure you want to PERMANENTLY DELETE ${targetUsername}? This cannot be undone.`)) {
            socket.emit('admin:delete-user', { targetUsername });
            alert('Delete user request sent.');
            adminPanelModal.style.display = 'none';
        }
    });

    // --- Global Notifications & Error Handling ---
    socket.on('disconnect', () => { addMessage({ user: 'System', text: 'Verbindung zum Server verloren.' }); });

    socket.on('force logout', () => {
        alert('This account has been logged in from another location.');
        logout();
    });

    socket.on('game:unlock-failed', (data) => {
        alert(`Freischalten fehlgeschlagen: ${data.message}`);
    });

    socket.on('resources:send-success', (data) => {
        alert('Ressourcen erfolgreich gesendet!');
    });

    socket.on('resources:send-failed', (data) => {
        alert(`Senden fehlgeschlagen: ${data.message}`);
    });

    socket.on('character:level-up-success', (data) => {
        alert(`Level Up! Du bist jetzt Level ${data.newLevel}.`);
    });

    socket.on('character:level-up-failed', (data) => {
        alert(`Level Up fehlgeschlagen: ${data.message}`);
    });

    socket.on('rpg:receive-invitation', ({ from }) => {
        currentInvitation = { from };
        invitationText.textContent = `Du hast eine RPG-Einladung von ${from} erhalten.`;
        invitationModal.style.display = 'flex';
    });

    socket.on('rpg:party-update', ({ party }) => {
        currentParty = party;
        partyList.innerHTML = '';
        const isLeader = party.length > 0 && party[0] === currentUser;

        party.forEach(member => {
            const li = document.createElement('li');
            li.textContent = member;
            if (member === party[0]) {
                li.textContent += ' (Leader)';
            }
            partyList.appendChild(li);
        });

        if (party.length > 1 && isLeader) {
            startPartyRpgBtn.style.display = 'block';
        } else {
            startPartyRpgBtn.style.display = 'none';
        }

        // Add a status message for non-leaders
        if (party.length > 1 && !isLeader) {
            const statusLi = document.createElement('li');
            statusLi.textContent = 'Waiting for leader to start...';
            statusLi.className = 'party-status';
            partyList.appendChild(statusLi);
        }
    });

    // This event is no longer sent from the server in this flow
    // socket.on('rpg:launch-game', ({ party }) => { ... });

    invitationAcceptBtn.addEventListener('click', () => {
        if (currentInvitation) {
            socket.emit('rpg:respond-to-invitation', { from: currentInvitation.from, response: 'accepted' });
            invitationModal.style.display = 'none';
            currentInvitation = null;
        }
    });

    socket.on('battle:started', (battleState) => {
        // Check if this user is part of the battle but not the leader
        const amIInParty = battleState.partyMembers.some(p => p.name === currentUser);
        const amILeader = battleState.partyId === currentUser;

        if (amIInParty && !amILeader) {
            const partyQueryParam = encodeURIComponent(JSON.stringify(battleState.partyMembers.map(p => ({username: p.name, character: p.character}))));
            const usernameQueryParam = encodeURIComponent(currentUser);
            const url = `games/rpg/battle.html?party=${partyQueryParam}&username=${usernameQueryParam}`;
            window.open(url, '_blank');
        }
    });

    invitationDeclineBtn.addEventListener('click', () => {
        if (currentInvitation) {
            socket.emit('rpg:respond-to-invitation', { from: currentInvitation.from, response: 'declined' });
            invitationModal.style.display = 'none';
            currentInvitation = null;
        }
    });

    window.addEventListener('message', (event) => {
        if (!event.data) return;

        // Handle score submissions from games
        if (event.data.type === 'game:score') {
            socket.emit('game:submit-score', event.data.payload);
        }

        // Handle party save from RPG
        if (event.data.type === 'party:save') {
            socket.emit('party:save', event.data.payload);
            return; // Done with this event
        }

        // Handle character selection from RPG
        if (event.data.type === 'character-selected') {
            const charData = event.data.data;
            localStorage.setItem('selectedCharacter', JSON.stringify(charData));

            const portraitEl = document.getElementById('char-portrait');
            const nameEl = document.getElementById('char-name');

            if (portraitEl) {
                portraitEl.src = charData.image;
            }
            if (nameEl && charData.name) {
                nameEl.textContent = charData.name;
            }
            if (charData.stats) {
                charStrength.textContent = charData.stats.strength;
                charDexterity.textContent = charData.stats.dexterity;
                charIntelligence.textContent = charData.stats.intelligence;
            }

            // Set state for direct game start
            characterIsSelected = true;
            startRpgBtn.textContent = 'Spiel fortsetzen';

            // Also save the character data to the server
            socket.emit('character:save', charData);
        }
    });
});

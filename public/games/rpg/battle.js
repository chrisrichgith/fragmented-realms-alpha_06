document.addEventListener('DOMContentLoaded', () => {
    // --- Global State ---
    let socket = null;
    let myUsername = '';
    let partyData = [];
    let battleState = null;

    // --- DOM Elements ---
    const playerPartyContainer = document.getElementById('player-party-container'); // Assuming a container for the whole party
    const enemyContainer = document.getElementById('enemy-container'); // Assuming a container for enemies
    const battleLogContainer = document.getElementById('battle-log');
    const actionsContainer = document.getElementById('actions-container');

    // --- Initialization ---
    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        myUsername = urlParams.get('username');
        const partyParam = urlParams.get('party');

        if (!myUsername || !partyParam) {
            console.error("Missing username or party data. Cannot start battle.");
            // Potentially redirect back to the main menu or show an error
            return;
        }

        partyData = JSON.parse(decodeURIComponent(partyParam));

        socket = io();
        setupSocketListeners();

        // Announce that this client is ready for the battle
        const partyId = partyData[0].username; // Leader's name is the partyId
        socket.emit('battle:join', { partyId });
    }

    // --- Socket Listeners ---
    function setupSocketListeners() {
        // The server will send the initial state upon join or when the battle starts
        socket.on('battle:started', (initialState) => {
            console.log("Battle started!", initialState);
            battleState = initialState;
            renderBattle(battleState);
        });

        socket.on('battle:state-update', (newState) => {
            console.log("Received state update", newState);
            battleState = newState;
            renderBattle(battleState);
        });
    }

    // --- Rendering ---
    function renderBattle(state) {
        if (!state) return;

        // Render party members
        // This is a simplified render. We'll need to create proper cards.
        playerPartyContainer.innerHTML = '<h3>Party</h3>';
        state.partyMembers.forEach(member => {
            const memberDiv = document.createElement('div');
            memberDiv.id = member.id;
            memberDiv.className = 'char-card';
            memberDiv.innerHTML = `
                <h4>${member.name}</h4>
                <p>HP: ${member.hp} / ${member.maxHp}</p>
            `;
            playerPartyContainer.appendChild(memberDiv);
        });

        // Render enemies
        enemyContainer.innerHTML = '<h3>Enemies</h3>';
        state.enemies.forEach(enemy => {
            const enemyDiv = document.createElement('div');
            enemyDiv.id = enemy.id;
            enemyDiv.className = 'enemy-card';
            enemyDiv.innerHTML = `
                <h4>${enemy.name}</h4>
                <p>HP: ${enemy.hp} / ${enemy.maxHp}</p>
            `;
            enemyContainer.appendChild(enemyDiv);
        });

        // Determine whose turn it is
        const currentTurnId = state.turnOrder[state.currentTurnIndex];
        const myTurn = state.partyMembers.find(p => p.id === currentTurnId && p.name === myUsername);

        // Render actions
        actionsContainer.innerHTML = '';
        if (myTurn) {
            const attackButton = document.createElement('button');
            attackButton.textContent = 'Attack';
            attackButton.onclick = () => {
                // For now, just attack the first living enemy
                const target = state.enemies.find(e => e.hp > 0);
                if (target) {
                    socket.emit('battle:action', {
                        action: 'attack',
                        targetId: target.id
                    });
                }
            };
            actionsContainer.appendChild(attackButton);
        } else {
            actionsContainer.innerHTML = `<p>Waiting for other players...</p>`;
        }

        // Highlight the active character
        document.querySelectorAll('.char-card, .enemy-card').forEach(el => el.classList.remove('active-turn'));
        const activeElement = document.getElementById(currentTurnId);
        if (activeElement) {
            activeElement.classList.add('active-turn');
        }

        // Render battle log
        battleLogContainer.innerHTML = '<h3>Log</h3>';
        state.log.forEach(message => {
            const logEntry = document.createElement('p');
            logEntry.textContent = message;
            battleLogContainer.appendChild(logEntry);
        });
        battleLogContainer.scrollTop = battleLogContainer.scrollHeight;
    }

    init();
});

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const db = require('./db');
const bcrypt = require('bcrypt');

const GAMES_CONFIG = {
    'space-shooter': {
        displayName: 'Space Shooter',
        costs: {
            gold: 100,
            kristall: 25
        }
    }
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const connectedUsers = new Map(); // Stores username -> Set<socket.id>
const pendingInvitations = new Map(); // inviter -> Set<invitee>
const parties = new Map(); // partyId (leader username) -> Set<username>

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));

// --- File-based Save/Load for RPG ---
const savesDir = path.join(__dirname, 'gamesaves');
if (!fs.existsSync(savesDir)) {
    fs.mkdirSync(savesDir);
}

// POST: Save a game
app.post('/api/gamesaves', (req, res) => {
    try {
        if (!req.body) {
            console.error('[API /api/gamesaves] Error: Request body is missing. body-parser may not be configured correctly.');
            return res.status(400).json({ message: 'Request body is missing.' });
        }

        const { name, character, party, location } = req.body;

        if (!name || !character) {
            return res.status(400).json({ message: 'Invalid save data. "name" and "character" properties are required.' });
        }

        // Sanitize filename
        const safeName = name.replace(/[^a-zA-Z0-9_ -]/g, '').trim();
        if (safeName.length < 1) {
            return res.status(400).json({ message: 'Invalid save name.' });
        }

        const filePath = path.join(savesDir, `${safeName}.json`);
        const dataToSave = { character, party, location, savedAt: new Date().toISOString() };

        fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), (err) => {
            if (err) {
                console.error('Error writing save file:', err);
                return res.status(500).json({ message: 'Error writing game file to disk.' });
            }
            res.status(201).json({ message: 'Game saved successfully.' });
        });

    } catch (error) {
        console.error('[API /api/gamesaves] A critical error occurred:', error);
        res.status(500).json({ message: 'A critical server error occurred during save.', error: error.message });
    }
});

// GET: List all save games
app.get('/api/gamesaves', (req, res) => {
    fs.readdir(savesDir, (err, files) => {
        if (err) {
            console.error('Error reading saves directory:', err);
            return res.status(500).json({ message: 'Could not retrieve save games.' });
        }
        const jsonFiles = files.filter(file => file.endsWith('.json'));
        res.status(200).json(jsonFiles);
    });
});

// GET: Load a specific game
app.get('/api/gamesaves/:name', (req, res) => {
    const { name } = req.params;

    // Sanitize filename to prevent directory traversal
    const safeName = path.basename(name);
    const filePath = path.join(savesDir, `${safeName}.json`);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ message: 'Save game not found.' });
            }
            console.error(`Error reading save file ${safeName}.json:`, err);
            return res.status(500).json({ message: 'Could not read save game.' });
        }
        res.status(200).json(JSON.parse(data));
    });
});

// POST: Save RPG Map Configuration
app.post('/api/rpg/mapconfig', (req, res) => {
    try {
        const mapConfigData = req.body;
        if (!mapConfigData || Object.keys(mapConfigData).length === 0) {
            return res.status(400).json({ message: 'Invalid map configuration data.' });
        }

        const filePath = path.join(__dirname, 'public', 'games', 'rpg', 'map_config.js');

        // Construct the file content as a JavaScript file
        const fileContent = `const MAP_CONFIG = ${JSON.stringify(mapConfigData, null, 4)};\n`;

        fs.writeFile(filePath, fileContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing map config file:', err);
                return res.status(500).json({ message: 'Error writing map config file to disk.' });
            }
            res.status(200).json({ message: 'Map configuration saved successfully.' });
        });

    } catch (error) {
        console.error('[API /api/rpg/mapconfig] A critical error occurred:', error);
        res.status(500).json({ message: 'A critical server error occurred during save.', error: error.message });
    }
});


// --- Helper to send full user data ---
function getOnlineUsersWithStatus() {
    const onlineUsernames = Array.from(connectedUsers.keys());
    return onlineUsernames.map(username => {
        const user = db.findUserByUsername(username);
        return {
            username: username,
            hasRpgChar: !!(user && user.selectedCharacter),
        };
    });
}

function emitUserData(socketOrUsername, user) {
    if (!user) return; // Safety check

    const payload = {
        resources: user.resources,
        unlockedGames: user.unlockedGames,
        rpg: user.rpg,
        selectedCharacter: user.selectedCharacter
    };

    const targetSocketId = typeof socketOrUsername === 'string'
        ? connectedUsers.get(socketOrUsername)
        // Note: The socket parameter is only available inside the 'connection' event.
        // This function will throw an error if called with a socket object outside of that scope.
        // However, the call from setInterval uses a username, so it's safe.
        : socketOrUsername.id;

    if (targetSocketId) {
        io.to(targetSocketId).emit('user data', payload);
    }
}

io.on('connection', (socket) => {
    console.log(`A user connected with socket id: ${socket.id}`);

    // --- Registration ---
    socket.on('register', async ({ username, email, password }) => {
        try {
            const isAdmin = (email === 'christiandittrich74@googlemail.com');
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.createUser(username, email, hashedPassword, isAdmin);
            socket.emit('register success');
        } catch (error) {
            socket.emit('register failed', { message: error.message });
        }
    });

    // --- Login ---
    socket.on('login', async ({ identifier, password }) => {
        try {
            let user = db.findUserByUsername(identifier) || db.findUserByEmail(identifier);

            if (!user) {
                return socket.emit('login failed', { message: 'Benutzer nicht gefunden.' });
            }

            if (user.isBanned) {
                return socket.emit('login failed', { message: 'Dieses Konto wurde gesperrt.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return socket.emit('login failed', { message: 'Ungültiges Passwort.' });
            }

            // --- RPG Data Migration ---
            if (!user.rpg) {
                console.log(`User ${user.username} lacks RPG data. Creating defaults.`);
                const defaultRpgStats = { level: 1, xp: 0, strength: 5, dexterity: 5, intelligence: 5 };
                const updatedUser = await db.updateUser(user.username, { rpg: defaultRpgStats });
                if (updatedUser) {
                    user = updatedUser; // Ensure we're using the most up-to-date user object
                }
            }

            if (!connectedUsers.has(user.username)) {
                connectedUsers.set(user.username, new Set());
            }
            connectedUsers.get(user.username).add(socket.id);

            socket.username = user.username;
            await db.setUserOnline(user.username, true);

            socket.emit('login success', {
                username: user.username,
                isAdmin: user.isAdmin,
            });

            emitUserData(socket, user);

            io.emit('user list', getOnlineUsersWithStatus());
            io.emit('chat message', { user: 'System', text: `${user.username} ist dem Spiel beigetreten.` });

        } catch (error) {
            console.error('Login error:', error);
            socket.emit('login failed', { message: 'Ein interner Fehler ist aufgetreten.' });
        }
    });

    // --- Chat ---
    socket.on('chat message', (msg) => {
        if (socket.username) {
            io.emit('chat message', {
                user: socket.username,
                text: msg.text,
                timestamp: new Date().toISOString()
            });
        }
    });

    // --- Logout & Disconnect ---
    const handleDisconnect = async () => {
        if (socket.username) {
            const userSockets = connectedUsers.get(socket.username);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    console.log(`User ${socket.username} disconnected.`);
                    await db.setUserOnline(socket.username, false);
                    connectedUsers.delete(socket.username);
                    io.emit('user list', getOnlineUsersWithStatus());
                    io.emit('chat message', { user: 'System', text: `${socket.username} hat das Spiel verlassen.` });
                }
            }
        }
    };

    socket.on('logout', handleDisconnect);
    socket.on('disconnect', handleDisconnect);

    // --- Admin Handlers ---
    function isAdmin(username) {
        const user = db.findUserByUsername(username);
        return user && user.isAdmin;
    }

    socket.on('admin:get-all-users', () => {
        if (isAdmin(socket.username)) {
            socket.emit('admin:all-users', db.getAllUsers());
        }
    });

    socket.on('admin:get-user-data', (username, callback) => {
        if (isAdmin(socket.username)) {
            callback(db.findUserByUsername(username));
        }
    });

    socket.on('admin:update-resources', async ({ targetUsername, resources }) => {
        if (isAdmin(socket.username)) {
            const updatedUser = await db.updateUser(targetUsername, { resources });
            if (updatedUser) {
                emitUserData(targetUsername, updatedUser);
            }
        }
    });

    socket.on('admin:update-games', async ({ targetUsername, unlockedGames }) => {
        if (isAdmin(socket.username)) {
            const updatedUser = await db.updateUser(targetUsername, { unlockedGames });
            if (updatedUser) {
                emitUserData(targetUsername, updatedUser);
            }
        }
    });

    socket.on('admin:reset-password', async ({ targetUsername, newPassword }) => {
        if (isAdmin(socket.username)) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            await db.updateUserPassword(targetUsername, hashedPassword);
        }
    });

    socket.on('admin:delete-user', async ({ targetUsername }) => {
        if (isAdmin(socket.username)) {
            await db.deleteUser(targetUsername);
            const targetSockets = connectedUsers.get(targetUsername);
            if (targetSockets) {
                targetSockets.forEach(socketId => {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        targetSocket.emit('force logout');
                        targetSocket.disconnect();
                    }
                });
            }
            io.emit('user list', Array.from(connectedUsers.keys()));
        }
    });

    socket.on('admin:kick', (targetUsername) => {
        if (isAdmin(socket.username)) {
            const targetSockets = connectedUsers.get(targetUsername);
            if (targetSockets) {
                targetSockets.forEach(socketId => {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        targetSocket.emit('force logout');
                        targetSocket.disconnect();
                    }
                });
            }
        }
    });

    socket.on('admin:ban', async (targetUsername) => {
        if (isAdmin(socket.username)) {
            await db.updateUser(targetUsername, { isBanned: true });
            const targetSockets = connectedUsers.get(targetUsername);
            if (targetSockets) {
                targetSockets.forEach(socketId => {
                    const targetSocket = io.sockets.sockets.get(socketId);
                    if (targetSocket) {
                        targetSocket.emit('force logout');
                        targetSocket.disconnect();
                    }
                });
            }
        }
    });

    // --- Game Handlers ---
    socket.on('game:unlock', async (gameId) => {
        if (!socket.username) return;
        if (!GAMES_CONFIG[gameId]) return;

        const user = db.findUserByUsername(socket.username);
        if (!user) return;
        if (user.unlockedGames.includes(gameId)) return;

        const costs = GAMES_CONFIG[gameId].costs;
        const hasEnoughResources = Object.keys(costs).every(
            resource => (user.resources[resource] || 0) >= costs[resource]
        );

        if (hasEnoughResources) {
            const newResources = { ...user.resources };
            Object.keys(costs).forEach(resource => {
                newResources[resource] -= costs[resource];
            });

            const newUnlockedGames = [...user.unlockedGames, gameId];

            const updatedUser = await db.updateUser(socket.username, {
                resources: newResources,
                unlockedGames: newUnlockedGames
            });

            emitUserData(socket, updatedUser);

        } else {
            socket.emit('game:unlock-failed', { message: 'Nicht genügend Ressourcen!' });
        }
    });

    socket.on('game:submit-score', async (payload) => {
        if (!socket.username) return;

        const user = db.findUserByUsername(socket.username);
        if (!user) return;

        const resourcesEarned = payload.resources || {};
        const newResources = { ...user.resources };

        for (const resource in resourcesEarned) {
            if (typeof resourcesEarned[resource] === 'number') {
                newResources[resource] = (newResources[resource] || 0) + resourcesEarned[resource];
            }
        }

        const updatedUser = await db.updateUser(socket.username, { resources: newResources });
        emitUserData(socket, updatedUser);
    });

    socket.on('resources:send', async ({ to, resources }) => {
        if (!socket.username) return;

        const sender = db.findUserByUsername(socket.username);
        const receiver = db.findUserByUsername(to);

        if (!receiver) {
            return socket.emit('resources:send-failed', { message: 'Empfänger nicht gefunden.' });
        }

        if (sender.username === receiver.username) {
            return socket.emit('resources:send-failed', { message: 'Du kannst keine Ressourcen an dich selbst senden.' });
        }

        const senderNewResources = { ...sender.resources };
        const receiverNewResources = { ...receiver.resources };
        let totalSent = 0;

        for (const resource in resources) {
            const amount = resources[resource];
            if (amount > 0) {
                if ((senderNewResources[resource] || 0) >= amount) {
                    senderNewResources[resource] -= amount;
                    receiverNewResources[resource] = (receiverNewResources[resource] || 0) + amount;
                    totalSent += amount;
                } else {
                    return socket.emit('resources:send-failed', { message: `Nicht genügend ${resource}.` });
                }
            }
        }

        if (totalSent > 0) {
            const updatedSender = await db.updateUser(sender.username, { resources: senderNewResources });
            const updatedReceiver = await db.updateUser(receiver.username, { resources: receiverNewResources });

            emitUserData(socket, updatedSender);
            socket.emit('resources:send-success', { message: 'Ressourcen erfolgreich gesendet!' });

            // Notify receiver if they are online
            emitUserData(receiver.username, updatedReceiver);
            const receiverSocketId = connectedUsers.get(receiver.username);
            if(receiverSocketId) {
                io.to(receiverSocketId).emit('chat message', { user: 'System', text: `Du hast Ressourcen von ${sender.username} erhalten!` });
            }
        } else {
            return socket.emit('resources:send-failed', { message: 'Keine gültige Menge zum Senden.' });
        }
    });

    // --- RPG Handlers ---
    const getLevelUpCost = (level) => ({
        xp: 100 * level,
        gold: 50 * level
    });

    socket.on('character:level-up', async () => {
        if (!socket.username) return;

        const user = db.findUserByUsername(socket.username);
        if (!user || !user.rpg) return;

        const cost = getLevelUpCost(user.rpg.level);

        if (user.rpg.xp < cost.xp) {
            return socket.emit('character:level-up-failed', { message: `Nicht genügend XP. Benötigt: ${cost.xp}` });
        }
        if ((user.resources.gold || 0) < cost.gold) {
            return socket.emit('character:level-up-failed', { message: `Nicht genügend Gold. Benötigt: ${cost.gold}` });
        }

        const newRpgStats = {
            ...user.rpg,
            level: user.rpg.level + 1,
            xp: user.rpg.xp - cost.xp,
            strength: user.rpg.strength + 1,
            dexterity: user.rpg.dexterity + 1,
            intelligence: user.rpg.intelligence + 1
        };

        const newResources = {
            ...user.resources,
            gold: user.resources.gold - cost.gold
        };

        const updatedUser = await db.updateUser(socket.username, {
            rpg: newRpgStats,
            resources: newResources
        });

        emitUserData(socket, updatedUser);
        socket.emit('character:level-up-success', { newLevel: newRpgStats.level });
    });

    socket.on('character:save', async (charData) => {
        if (socket.username) {
            try {
                await db.updateUser(socket.username, { selectedCharacter: charData });
                console.log(`Saved character for ${socket.username}:`, charData.name);
            } catch (error) {
                console.error(`Failed to save character for ${socket.username}:`, error);
            }
        }
    });

    socket.on('character:save', async (charData) => {
        if (socket.username) {
            try {
                await db.updateUser(socket.username, { selectedCharacter: charData });
                console.log(`Saved character for ${socket.username}:`, charData.name);
                io.emit('user list', getOnlineUsersWithStatus());
            } catch (error) {
                console.error(`Failed to save character for ${socket.username}:`, error);
            }
        }
    });

    socket.on('rpg:invite-player', (inviteeUsername) => {
        if (!socket.username || !inviteeUsername || socket.username === inviteeUsername) return;

        const inviterUsername = socket.username;
        const inviteeSockets = connectedUsers.get(inviteeUsername);

        if (!inviteeSockets || inviteeSockets.size === 0) {
            return socket.emit('rpg:invitation-error', { message: 'Player is not online.' });
        }

        const pending = pendingInvitations.get(inviterUsername);
        if (pending && pending.has(inviteeUsername)) {
            return socket.emit('rpg:invitation-error', { message: 'Invitation already sent.' });
        }

        if (!pending) {
            pendingInvitations.set(inviterUsername, new Set());
        }
        pendingInvitations.get(inviterUsername).add(inviteeUsername);

        inviteeSockets.forEach(socketId => {
            io.to(socketId).emit('rpg:receive-invitation', { from: inviterUsername });
        });

        setTimeout(() => {
            const pending = pendingInvitations.get(inviterUsername);
            if (pending) {
                pending.delete(inviteeUsername);
                if (pending.size === 0) {
                    pendingInvitations.delete(inviterUsername);
                }
            }
        }, 30000);
    });

    socket.on('rpg:respond-to-invitation', ({ from, response }) => {
        if (!socket.username) return;

        const inviterUsername = from;
        const inviteeUsername = socket.username;

        const pending = pendingInvitations.get(inviterUsername);
        if (!pending || !pending.has(inviteeUsername)) return;

        pending.delete(inviteeUsername);
        if (pending.size === 0) {
            pendingInvitations.delete(inviterUsername);
        }

        const inviterSockets = connectedUsers.get(inviterUsername);

        if (response === 'declined') {
            if (inviterSockets) {
                inviterSockets.forEach(socketId => {
                    io.to(socketId).emit('rpg:invitation-declined', { from: inviteeUsername });
                });
            }
            return;
        }

        if (response === 'accepted') {
            if (!parties.has(inviterUsername)) {
                parties.set(inviterUsername, new Set([inviterUsername]));
            }
            const party = parties.get(inviterUsername);
            if (party.size < 4) {
                party.add(inviteeUsername);

                party.forEach(memberUsername => {
                    const memberSockets = connectedUsers.get(memberUsername);
                    if (memberSockets) {
                        memberSockets.forEach(socketId => {
                            io.to(socketId).emit('rpg:party-update', { party: Array.from(party) });
                        });
                    }
                });
            } else {
                if (inviterSockets) {
                    inviterSockets.forEach(socketId => {
                        io.to(socketId).emit('rpg:invitation-error', { message: 'Party is full.' });
                    });
                }
            }
        }
    });

    socket.on('rpg:start-party-game', () => {
        if (!socket.username) return;

        const party = parties.get(socket.username);
        if (!party) return;

        const partyMembers = Array.from(party);
        const partyData = partyMembers.map(username => {
            const user = db.findUserByUsername(username);
            return {
                username: user.username,
                character: user.selectedCharacter,
            };
        });

        partyMembers.forEach(memberUsername => {
            const memberSockets = connectedUsers.get(memberUsername);
            if (memberSockets) {
                memberSockets.forEach(socketId => {
                    io.to(socketId).emit('rpg:launch-game', { party: partyData });
                });
            }
        });
    });
});

// --- Automatic Resource Generation ---
const RESOURCES = ['gold', 'holz', 'erz', 'kristall'];
let userResourceCycle = new Map();

setInterval(async () => {
    const onlineUsernames = Array.from(connectedUsers.keys());

    for (const username of onlineUsernames) {
        if (!connectedUsers.has(username)) continue;

        let receivedInCycle = userResourceCycle.get(username) || [];
        let availableResources = RESOURCES.filter(r => !receivedInCycle.includes(r));

        if (availableResources.length === 0) {
            receivedInCycle = [];
            availableResources = RESOURCES;
        }

        const resourceToGive = availableResources[Math.floor(Math.random() * availableResources.length)];

        receivedInCycle.push(resourceToGive);
        userResourceCycle.set(username, receivedInCycle);

        const user = db.findUserByUsername(username);
        if (user) {
            const newResources = { ...user.resources };
            newResources[resourceToGive] = (newResources[resourceToGive] || 0) + 1;
            const updatedUser = await db.updateUser(username, { resources: newResources });

            if (updatedUser) {
                emitUserData(username, updatedUser);
            }
        }
    }
}, 60000);


// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

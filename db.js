const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, 'users.json');
let users = {};

// Load users from file
async function loadUsers() {
    try {
        const data = await fs.readFile(DB_FILE, 'utf8');
        users = JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            users = {};
            await saveUsers();
        } else {
            console.error('Error loading users:', error);
        }
    }
}

// Save users to file
async function saveUsers() {
    try {
        await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saving users:', error);
    }
}

// Find user by username
function findUserByUsername(username) {
    if (users[username]) {
        return { ...users[username] }; // Return a copy
    }
    return null;
}

// Find user by email
function findUserByEmail(email) {
    const user = Object.values(users).find(u => u.email === email);
    if (user) {
        return { ...user }; // Return a copy
    }
    return null;
}

// Create a new user
async function createUser(username, email, hashedPassword, isAdmin = false) {
    if (findUserByUsername(username)) {
        throw new Error('Username already exists.');
    }
    if (findUserByEmail(email)) {
        throw new Error('Email already exists.');
    }

    const newUser = {
        username,
        email,
        password: hashedPassword,
        resources: { gold: 10, holz: 5, erz: 0, kristall: 0 }, // Starting resources
        unlockedGames: [],
        rpg: {
            level: 1,
            xp: 0,
            strength: 5,
            dexterity: 5,
            intelligence: 5
        },
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isOnline: false,
        isAdmin,
        isBanned: false
    };

    users[username] = newUser;
    await saveUsers();
    return { ...newUser };
}

// Update user data
async function updateUser(username, userData) {
    if (!users[username]) {
        console.error(`Attempted to update non-existent user: ${username}`);
        return null;
    }
    // Deep merge for nested objects like 'resources' or 'rpg'
    for (const key in userData) {
        if (typeof userData[key] === 'object' && !Array.isArray(userData[key]) && userData[key] !== null) {
            users[username][key] = { ...users[username][key], ...userData[key] };
        } else {
            users[username][key] = userData[key];
        }
    }
    await saveUsers();
    return { ...users[username] };
}


// Set user online status
async function setUserOnline(username, isOnline) {
    if (users[username]) {
        users[username].isOnline = isOnline;
        users[username].lastLogin = new Date().toISOString();
        await saveUsers();
        return { ...users[username] };
    }
    return null;
}

function getAllUsers() {
    return Object.values(users).map(u => ({
        username: u.username,
        email: u.email,
        isBanned: u.isBanned
    }));
}

async function deleteUser(username) {
    if (users[username]) {
        delete users[username];
        await saveUsers();
        return true;
    }
    return false;
}

async function updateUserPassword(username, hashedPassword) {
    if (users[username]) {
        users[username].password = hashedPassword;
        await saveUsers();
        return true;
    }
    return false;
}

async function setUserAdminStatus(username, isAdmin) {
    if (users[username]) {
        users[username].isAdmin = isAdmin;
        await saveUsers();
        return true;
    }
    return false;
}

// Initialize the database
loadUsers().catch(console.error);

module.exports = {
    findUserByUsername,
    findUserByEmail,
    createUser,
    updateUser,
    setUserOnline,
    getAllUsers,
    deleteUser,
    updateUserPassword,
    setUserAdminStatus,
};

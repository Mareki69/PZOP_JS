const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = './data/users.json';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Načtení uživatelů z databáze
const loadUsers = () => {
    try {
        if (fs.existsSync(dbPath)) {
            const usersJSON = fs.readFileSync(dbPath, 'utf8');
            if (usersJSON.trim() === '') {
                return [];
            }
            return JSON.parse(usersJSON);
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
};

// Funkce pro uložení uživatelů do databáze
const saveUsers = (users) => {
    const usersJSON = JSON.stringify(users);
    fs.writeFileSync(dbPath, usersJSON);
};

// Route pro zpracování registrace uživatele
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Validace vstupních dat
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password' });
    }

    // Načtení uživatelů z databáze
    let users = loadUsers();

    // Kontrola existence uživatele
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Přidání nového uživatele do databáze
    const newUser = { username, email, password };
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

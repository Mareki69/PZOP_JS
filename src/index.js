const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Cesta k souboru s uživateli
const usersFilePath = path.join(__dirname, 'data', 'users.json');

// Simulace databáze uživatelů
let users = [];

// Získání uživatelů ze souboru
const getUsersFromFile = () => {
    try {
        const data = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users file:', error);
        return [];
    }
};

// Zápis uživatelů do souboru
const saveUsersToFile = () => {
    try {
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('Error writing users file:', error);
    }
};

// Načtení uživatelů ze souboru
users = getUsersFromFile();

// Funkce pro generování unikátního ID uživatele
const generateUniqueID = () => {
    // Zde můžete implementovat algoritmus pro generování unikátního ID, např. pomocí uuid modulu
    // Toto je pouze fiktivní implementace, nahraďte ji skutečnou implementací
    return Math.random().toString(36).substring(7); // Jednoduchá implementace pro demonstrační účely
};

// POST endpoint pro registraci uživatele
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validace vstupních dat
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password' });
    }

    // Kontrola existence uživatele
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }

    try {
        // Hashování hesla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Přidání nového uživatele do databáze s přiděleným ID
        const newUser = { id: generateUniqueID(), username, email, password: hashedPassword, notes: [] };
        users.push(newUser);

        // Uložení uživatele do souboru
        saveUsersToFile();

        // Přesměrování na stránku po úspěšné registraci
        res.redirect('/user-page');
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint pro přihlášení uživatele
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validace vstupních dat
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Najdi uživatele v seznamu uživatelů pomocí emailu
    const user = users.find(user => user.email === email);

    // Pokud uživatel nebyl nalezen, vrátíme chybu
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    try {
        // Porovnání hesla s hashem v databázi
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Přesměrování na uživatelskou stránku po úspěšném přihlášení
        res.redirect('/user-page');
    } catch (error) {
        console.error('Error comparing passwords:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST endpoint pro vytvoření poznámky
app.post('/create-note', (req, res) => {
    const { text } = req.body;

    // Validace vstupních dat
    if (!text) {
        return res.status(400).json({ error: 'Please provide note text' });
    }

    // Získání uživatele pomocí ID uloženého v local storage
    const email = req.headers.authorization;
    const user = users.find(user => user.email === email);

    // Pokud uživatel nebyl nalezen, vrátíme chybu
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Přidání nové poznámky k uživateli
    const newNote = { id: generateUniqueID(), text };
    user.notes.push(newNote);

    // Uložení změn do souboru
    saveUsersToFile();

    // Přesměrování zpět na uživatelskou stránku s poznámkami
    res.redirect('/user-page');
});

// GET endpoint pro úvodní stránku
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint pro stránku registrace
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// GET endpoint pro stránku přihlášení
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// GET endpoint pro stránku po přihlášení
app.get('/user-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-page.html'));
});

// GET endpoint pro získání poznámek uživatele
app.get('/notes', (req, res) => {
    // Získání uživatele pomocí ID uloženého v local storage
    const email = req.headers.authorization;
    const user = users.find(user => user.email === email);

    // Pokud uživatel nebyl nalezen, vrátíme chybu
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Vrácení seznamu poznámek uživatele
    res.json(user.notes);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Simulace databáze uživatelů
let users = [];

// Simulace databáze poznámek
let notes = [];

// GET endpoint pro úvodní stránku
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// GET endpoint pro stránku registrace
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

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

        // Přidání nového uživatele do databáze
        users.push({ username, email, password: hashedPassword });

        // Přesměrování na stránku po úspěšné registraci
        res.redirect('/user-page');
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET endpoint pro stránku přihlášení
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// POST endpoint pro přihlášení uživatele
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validace vstupních dat
    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    // Hledání uživatele v databázi
    const user = users.find(user => user.email === email);
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Ověření hesla
    try {
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Error comparing passwords:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }

    // Přesměrování na stránku po přihlášení
    res.redirect('/user-page');
});

// POST endpoint pro vytvoření poznámky
app.post('/create-note', (req, res) => {
    const { text } = req.body;

    // Validace vstupních dat
    if (!text) {
        return res.status(400).json({ error: 'Please provide note text' });
    }

    // Generování ID pro novou poznámku
    const id = notes.length + 1;

    // Vytvoření nové poznámky a uložení do databáze
    const newNote = { id, text };
    notes.push(newNote);

    // Přesměrování zpět na uživatelskou stránku s poznámkami
    res.redirect('/user-page');
});

// GET endpoint pro stránku po přihlášení
app.get('/user-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user-page.html'));
});

// POST endpoint pro odhlášení
app.post('/logout', (req, res) => {
    // Logika pro odhlášení uživatele
    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

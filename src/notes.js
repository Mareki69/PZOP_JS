$(document).ready(() => {
    // Funkce pro odeslání nové poznámky
    const createNoteForm = document.getElementById('create-note-form');
    createNoteForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Zabrání výchozímu chování formuláře

        const noteText = document.getElementById('note-text').value;

        // Validace, že poznámka není prázdná
        if (!noteText.trim()) {
            alert('Please enter a note.');
            return;
        }

        // Odeslání nové poznámky na server
        fetch('/create-note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('email')}`
            },
            body: JSON.stringify({ text: noteText })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to create note');
            }
            return response.json();
        })
        .then(() => {
            // Po úspěšném vytvoření poznámky zavoláme funkci pro načtení a zobrazení seznamu poznámek
            fetchNotes();
        })
        .catch(error => {
            console.error('Error creating note:', error);
            alert('Failed to create note. Please try again.');
        });
    });

    // Funkce pro načtení a zobrazení seznamu poznámek
    const fetchNotes = async () => {
        try {
            const response = await fetch('/notes', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('email')}`
                }
            });
            const notes = await response.json();
            const noteList = document.getElementById('note-list');
            noteList.innerHTML = ''; // Vyprázdníme seznam před naplněním novými poznámkami

            notes.forEach(note => {
                const listItem = document.createElement('li');
                listItem.textContent = note.text;
                noteList.appendChild(listItem);
            });
        } catch (error) {
            console.error('Error fetching notes:', error);
            alert('Failed to fetch notes. Please try again.');
        }
    };

    // Načti a zobraz seznam poznámek při načtení stránky
    fetchNotes();
});

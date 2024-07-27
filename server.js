const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Sert les fichiers statiques de /public

app.post('/submit', (req, res) => {
    const { name, meal } = req.body;
    const date = new Date();
    const dateTimeString = date.toLocaleString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric'
    });
    const logMessage = `${name} a donné à manger à Hatchi à ${dateTimeString} pour ${meal}\n`;

    fs.appendFile('log.txt', logMessage, (err) => {
        if (err) {
            console.error('Erreur lors de l\'écriture dans le fichier', err);
            return res.status(500).send('Erreur serveur');
        }
        res.send('Données enregistrées avec succès!');
    });
});

app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});

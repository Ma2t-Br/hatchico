import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getDatabase, ref, push, query, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

/* *** Firebase ******************************************************************************************** */

// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDTUMai-OpmnWaGXYrpIXCsa7ZN4v-ovzM",
    authDomain: "hatchico-b166b.firebaseapp.com",
    projectId: "hatchico-b166b",
    storageBucket: "hatchico-b166b.appspot.com",
    messagingSenderId: "668461218522",
    appId: "1:668461218522:web:40e18917a063c9867f43e3",
    measurementId: "G-Z4DT5M2REX",
    databaseURL: "https://hatchico-b166b-default-rtdb.europe-west1.firebasedatabase.app/"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);


/* *** Data gets ******************************************************************************************** */

// Date
const dateElement = document.getElementById('date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

// Formulaire
const form = document.getElementById('mealForm');
const modal = document.getElementById('nameModal');
const closeBtn = document.getElementsByClassName('close')[0];
const modalSubmit = document.getElementById('modalSubmit');
const nameSelect = document.getElementById('nameSelect');

// Liste des noms à suivre
const namesToTrack = ["Aurélie", "Chloé", "Claire", "Marie-lou", "Matthieu", "Nicolas", "Philippe", "Thibault", "Vincent"];

// Récupérer la dernière entrée de la base de données
const getLastEntry = () => {
    const lastEntryQuery = query(ref(database, 'meals'), limitToLast(1));
    onValue(lastEntryQuery, (snapshot) => {
        let lastEntry = null;
        snapshot.forEach((childSnapshot) => {
            lastEntry = childSnapshot.val();
        });
        displayLastEntry(lastEntry);
        checkLastEntryAndAdjustOptions(lastEntry)
    });
};

/* *** Outils ******************************************************************************************** */

// Fonction pour compter les points
const countPoints = () => {
    const points = {};

    // Initialiser les points à 0 pour chaque nom
    namesToTrack.forEach(name => {
        points[name] = 0;
    });

    // Récupérer toutes les entrées de la base de données
    const entriesQuery = ref(database, 'meals');
    onValue(entriesQuery, (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const entry = childSnapshot.val();
            if (namesToTrack.includes(entry.name)) {
                points[entry.name]++;
            }
        });

        // Afficher le tableau des points
        displayPoints(points);
    });
};

// Pop-up de nom et soumettre les données à Firebase
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire
    modal.style.display = 'block';
});

closeBtn.onclick = function() {
    modal.style.display = 'none';
};

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

modalSubmit.addEventListener('click', function() {
    const personName = nameSelect.value;
    const mealInput = form.querySelector('input[name="meal"]:checked');
    if (mealInput) {
        const mealValue = mealInput.value;
        const dateTimeString = today.toLocaleString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        });

        // Enregistrer les données dans Firebase
        push(ref(database, 'meals'), {
            name: personName,
            meal: mealValue,
            dateTime: dateTimeString
        }).then(() => {
            alert(`Merci, ${personName}!`);
            modal.style.display = 'none';
            // Mettre à jour l'affichage avec la nouvelle entrée
            getLastEntry();
        }).catch((error) => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'enregistrement des données.');
        });
    } else {
        alert("Veuillez sélectionner un repas.");
    }
});

// Fonction pour convertir une date en chaîne de caractères en un objet Date
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split(' ');
    const months = {
        janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
        juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11
    };
    return new Date(`${year}-${months[month] + 1}-${day}`);
};

/* *** Section Constructors ******************************************************************************************** */

// Afficher la date actuelle
dateElement.textContent = today.toLocaleDateString('fr-FR', options);

// Vérifier la dernière entrée et ajuster les options
const checkLastEntryAndAdjustOptions = (entry) => {
    const matinOption = document.getElementById('matinLabel');
    const soirOption = document.getElementById('soirLabel');
    const validerButton = document.getElementById('valider');
    const title = document.getElementById('title')

    if (entry) {
        const { meal, dateTime } = entry;
        const lastEntryDate = dateTime.split(' à ')[0];

        if (lastEntryDate === today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })) {
            if (meal === 'matin') {
                matinOption.style.display = 'none';
                soirOption.style.display = 'block';
            } else if (meal === 'soir') {
                matinOption.style.display = 'none';
                soirOption.style.display = 'none';
                validerButton.style.display = 'none';
                title.innerHTML = "Hatchi a déjà<br>mangé aujourd'hui";
            }
        } else {
            matinOption.style.display = 'block';
            soirOption.style.display = 'block';
        }
    } else {
        matinOption.style.display = 'block';
        soirOption.style.display = 'block';
    }
};

// Afficher la dernière entrée
const displayLastEntry = (entry) => {
    const lastEntryElement = document.getElementById('lastEntry');
    if (entry) {
        const { name, meal, dateTime } = entry;
        lastEntryElement.innerHTML = `Dernier donateur : ${name} le ${meal} <br>(${dateTime})`;
    } else {
        lastEntryElement.textContent = "Pas encore de données disponibles.";
    }
};

// Afficher le tableau des points
const displayPoints = (points) => {
    const pointsCounterElement = document.getElementById('pointsCounter');
    pointsCounterElement.innerHTML = '<h3>Compteur de Points</h3>';

    const pointsTable = document.createElement('table');
    pointsTable.style.width = '100%';
    pointsTable.style.borderCollapse = 'collapse';

    const sortedPoints = Object.entries(points).sort((a, b) => b[1] - a[1]);

    sortedPoints.forEach(([name, score], index) => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';

        const nameCell = document.createElement('td');
        nameCell.style.padding = '8px';
        nameCell.style.textAlign = 'left';

        // Ajouter les icônes en fonction de la position
        if (index === 0) {
            nameCell.innerHTML = `${name} <img src="Img/os or.png" alt="🥇" style="width:18px; height:18px; vertical-align:middle;">`; // Os d'or
        } else if (index === 1) {
            nameCell.innerHTML = `${name} <img src="Img/os argent.png" alt="🥈" style="width:18px; height:18px; vertical-align:middle;">`; // Os d'argent
        } else if (index === 2) {
            nameCell.innerHTML = `${name} <img src="Img/os bronze.png" alt="🥉" style="width:18px; height:18px; vertical-align:middle;">`; // Os de bronze
        } else {
            nameCell.textContent = name;
        }

        const scoreCell = document.createElement('td');
        scoreCell.textContent = score;
        scoreCell.style.padding = '8px';
        scoreCell.style.textAlign = 'right';

        row.appendChild(nameCell);
        row.appendChild(scoreCell);
        pointsTable.appendChild(row);
    });

    pointsCounterElement.appendChild(pointsTable);
};

/* *** Calls ******************************************************************************************** */

// Appel initial pour récupérer et afficher la dernière entrée
getLastEntry();

// Appel initial pour récupérer et afficher le compteur de points
countPoints();



////

const displayHistory = (entries) => {
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = ''; // Vider le conteneur pour réinitialiser l'affichage

    const groupedByDate = {};

    // Grouper les entrées par jour
    entries.forEach((entry) => {
        const entryDate = entry.dateTime.split(' à ')[0]; // Extraire la date sans l'heure

        if (!groupedByDate[entryDate]) {
            groupedByDate[entryDate] = { matin: false, soir: false, entries: [] };
        }

        // Vérifier si l'entrée est pour le matin ou le soir
        if (entry.meal === 'matin') {
            groupedByDate[entryDate].matin = true;
        } else if (entry.meal === 'soir') {
            groupedByDate[entryDate].soir = true;
        }

        groupedByDate[entryDate].entries.push(entry); // Ajouter l'entrée à la liste du jour
    });

    // Trier les dates du plus récent au plus ancien
    const dates = Object.keys(groupedByDate)
        .map(date => ({ date, value: parseDateString(date) })) // Convertir en objets Date
        .sort((a, b) => b.value - a.value) // Trier les objets Date
        .map(item => item.date); // Extraire les dates triées

    if (dates.length > 0) {
        dates.forEach((date) => {
            const dayData = groupedByDate[date];
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('day-history');

            // Créer la pastille pour indiquer l'état (matin et soir ou manquant)
            if (date !== today.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })) {
                // Créer la pastille pour indiquer l'état (matin et soir ou manquant)
                const badge = document.createElement('span');
                badge.classList.add('badge');
                if (dayData.matin && dayData.soir) {
                    badge.classList.add('badge-green'); // Matin et soir présents
                } else {
                    badge.classList.add('badge-red'); // Manque soit matin soit soir
                }

                // Ajouter la pastille au jour
                dayDiv.appendChild(badge);
            }

            // Créer l'en-tête avec la date
            const dayHeader = document.createElement('h3');
            dayHeader.textContent = date;
            dayDiv.appendChild(dayHeader);

            // Ajouter les entrées (matin et soir) sous chaque jour
            dayData.entries.forEach((entry) => {
                const entryDiv = document.createElement('div');
                entryDiv.textContent = `${entry.meal} : ${entry.name}`;
                dayDiv.appendChild(entryDiv);
            });

            // Ajouter le jour en haut de la liste
            historyContainer.appendChild(dayDiv);
        });
    } else {
        historyContainer.style.display = 'none';
    }
};



// Fonction pour récupérer l'historique de la base de données
const getHistory = () => {
    const historyQuery = ref(database, 'meals');
    onValue(historyQuery, (snapshot) => {
        const entries = [];
        snapshot.forEach((childSnapshot) => {
            const entry = childSnapshot.val();
            entries.push(entry);
        });

        // Afficher l'historique une fois les données récupérées
        displayHistory(entries);
    });
};

// Appel initial pour récupérer et afficher l'historique
getHistory();

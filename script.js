import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getDatabase, ref, push, query, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

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

// Fonction pour afficher la dernière entrée
const displayLastEntry = (entry) => {
    const lastEntryElement = document.getElementById('lastEntry');
    if (entry) {
        const { name, meal, dateTime } = entry;
        lastEntryElement.innerHTML = `Dernier donateur : ${name} le ${meal} <br>(${dateTime})`;
    } else {
        lastEntryElement.textContent = "Pas encore de données disponibles.";
    }
};

// Fonction pour vérifier la dernière entrée et ajuster les options
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

// Appel initial pour récupérer et afficher la dernière entrée
getLastEntry();

// JavaScript pour afficher la date actuelle
const dateElement = document.getElementById('date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = today.toLocaleDateString('fr-FR', options);

// JavaScript pour la pop-up de nom et soumettre les données à Firebase
const form = document.getElementById('mealForm');

const modal = document.getElementById('nameModal');
const closeBtn = document.getElementsByClassName('close')[0];
const modalSubmit = document.getElementById('modalSubmit');
const nameSelect = document.getElementById('nameSelect');

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

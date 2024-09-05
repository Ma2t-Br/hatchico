import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-analytics.js";
import { getDatabase, ref, push, query, limitToLast, onValue } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

/* *** Firebase Configuration & Initialization ************************************************************ */
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

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

/* *** DOM Elements & Constants ********************************************************************** */
const dateElement = document.getElementById('date');
const today = new Date();
const options = { year: 'numeric', month: 'long', day: 'numeric' };
const optionsWithDay = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
const form = document.getElementById('mealForm');
const modal = document.getElementById('nameModal');
const closeBtn = document.getElementsByClassName('close')[0];
const modalSubmit = document.getElementById('modalSubmit');
const nameSelect = document.getElementById('nameSelect');
const namesToTrack = ["Aurélie", "Chloé", "Claire", "Marie-lou", "Matthieu", "Nicolas", "Philippe", "Thibault", "Vincent"];

/* *** Utility Functions ******************************************************************************* */
const formatDate = (date) => date.toLocaleDateString('fr-FR', options);
const formatDateWithDay = (date) => date.toLocaleDateString('fr-FR', optionsWithDay);
const parseDateString = (dateString) => {
    const [day, month, year] = dateString.split(' ');
    const months = {
        janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
        juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11
    };
    return new Date(`${year}-${months[month] + 1}-${day}`);
};

/* *** Firebase Data Handling ************************************************************************* */
const fetchData = (callback) => {
    const dataQuery = ref(database, 'meals');
    onValue(dataQuery, (snapshot) => {
        const data = [];
        snapshot.forEach(childSnapshot => {data.push(childSnapshot.val())});
        callback(data);
    });

};

const getLastEntry = () => {
    const lastEntryQuery = query(ref(database, 'meals'), limitToLast(1));
    onValue(lastEntryQuery, (snapshot) => {
        let lastEntry = null;
        snapshot.forEach(childSnapshot => lastEntry = childSnapshot.val());
        displayLastEntry(lastEntry);
        checkLastEntryAndAdjustOptions(lastEntry);
    });
};

const countPoints = () => {
    fetchData(entries => {
        const points = namesToTrack.reduce((acc, name) => ({ ...acc, [name]: 0 }), {});
        entries.forEach(entry => {
            if (namesToTrack.includes(entry.name)) {
                points[entry.name]++;
            }
        });
        displayPoints(points);
    });
};

/* *** DOM Manipulation Functions ******************************************************************** */
const displayLastEntry = (entry) => {
    const lastEntryElement = document.getElementById('lastEntry');
    if (entry) {
        const { name, meal, dateTime } = entry;
        lastEntryElement.innerHTML = `Dernier donateur : ${name} le ${meal} <br>(${dateTime})`;
    } else {
        lastEntryElement.textContent = "Pas encore de données disponibles.";
    }
};

const checkLastEntryAndAdjustOptions = (entry) => {
    const matinOption = document.getElementById('matinLabel');
    const soirOption = document.getElementById('soirLabel');
    const validerButton = document.getElementById('valider');
    const title = document.getElementById('title');
    const todayDate = formatDate(today);

    if (entry) {
        const { meal, dateTime } = entry;
        const lastEntryDate = dateTime.split(' à ')[0];

        console.log('todayDate:', todayDate);
        console.log('lastEntryDate:', lastEntryDate);
        console.log('todayDate === lastEntryDate:', todayDate === lastEntryDate);
        if (lastEntryDate === todayDate) {
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
        nameCell.innerHTML = `${name} ${index < 3 ? `<img src="Img/os ${['or', 'argent', 'bronze'][index]}.png" alt="🥇🥈🥉".charAt(index)}" style="width:18px; height:18px; vertical-align:middle;">` : ''}`;

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

const displayHistory = (entries) => {
    const historyContainer = document.getElementById('historyContainer');
    historyContainer.innerHTML = ''; // Clear container

    const groupedByDate = entries.reduce((acc, entry) => {
        const entryDate = entry.dateTime.split(' à ')[0];
        if (!acc[entryDate]) {
            acc[entryDate] = { matin: false, soir: false, entries: [] };
        }
        if (entry.meal === 'matin') acc[entryDate].matin = true;
        if (entry.meal === 'soir') acc[entryDate].soir = true;
        acc[entryDate].entries.push(entry);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedByDate)
        .map(date => ({ date, value: parseDateString(date) }))
        .sort((a, b) => b.value - a.value)
        .map(item => item.date);

    sortedDates.forEach(date => {
        const dayData = groupedByDate[date];
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day-history');

        if (date !== formatDate(today)) {
            const badge = document.createElement('span');
            badge.classList.add('badge');
            badge.classList.add(dayData.matin && dayData.soir ? 'badge-green' : 'badge-red');
            dayDiv.appendChild(badge);
        }

        const dayHeader = document.createElement('h3');
        dayHeader.textContent = date;
        dayDiv.appendChild(dayHeader);

        dayData.entries.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.textContent = `${entry.meal} : ${entry.name}`;
            dayDiv.appendChild(entryDiv);
        });

        historyContainer.appendChild(dayDiv);
    });

    if (sortedDates.length === 0) historyContainer.style.display = 'none';
};

/* *** Event Listeners ******************************************************************************** */
form.addEventListener('submit', function(event) {
    event.preventDefault();
    modal.style.display = 'block';
});

closeBtn.onclick = () => modal.style.display = 'none';

window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};

modalSubmit.addEventListener('click', () => {
    const personName = nameSelect.value;
    const mealInput = form.querySelector('input[name="meal"]:checked');
    if (mealInput) {
        const mealValue = mealInput.value;
        const dateTimeString = today.toLocaleString('fr-FR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric'
        });

        push(ref(database, 'meals'), {
            name: personName,
            meal: mealValue,
            dateTime: dateTimeString
        }).then(() => {
            alert(`Merci, ${personName}!`);
            modal.style.display = 'none';
            getLastEntry();
            countPoints();
            fetchData(displayHistory); // Update history after adding new entry
        }).catch((error) => {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de l\'enregistrement des données.');
        });
    } else {
        alert("Veuillez sélectionner un repas.");
    }
});

/* *** Initial Calls ********************************************************************************** */
dateElement.textContent = formatDateWithDay(today);
getLastEntry();
countPoints();
fetchData(displayHistory);

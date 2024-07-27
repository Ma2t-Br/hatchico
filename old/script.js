// JavaScript pour afficher la date actuelle
const dateElement = document.getElementById('date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = today.toLocaleDateString('fr-FR', options);

// JavaScript pour la pop-up de nom
const form = document.getElementById('mealForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire
    const personName = prompt("Entrez votre nom:");
    if (personName) {
        alert(`Merci, ${personName}!`);
    } else {
        alert("Le nom n'a pas été fourni.");
    }
});
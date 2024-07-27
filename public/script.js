// JavaScript pour afficher la date actuelle
const dateElement = document.getElementById('date');
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
dateElement.textContent = today.toLocaleDateString('fr-FR', options);

// JavaScript pour la pop-up de nom
const form = document.getElementById('mealForm');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche l'envoi du formulaire par défaut
    const personName = prompt("Entrez votre nom:");
    if (personName) {
        const mealInputs = form.querySelectorAll('input[name="meal"]:checked');
        if (mealInputs.length > 0) {
            const mealValue = mealInputs[0].value;
            const formData = new FormData(form);
            formData.append('name', personName);
            formData.append('meal', mealValue);

            fetch('/submit', {
                method: 'POST',
                body: new URLSearchParams(formData)
            })
                .then(response => response.text())
                .then(data => alert(data))
                .catch(error => console.error('Erreur:', error));
        } else {
            alert("Veuillez sélectionner un repas.");
        }
    } else {
        alert("Le nom n'a pas été fourni.");
    }
});

const passwordInput = document.getElementById('passwordInput');
const resultsDiv = document.getElementById('results');
const scoreCircle = document.getElementById('scoreCircle');
const scoreText = document.getElementById('scoreText');
const strengthText = document.getElementById('strengthText');
const strengthFill = document.getElementById('strengthFill');
const suggestionsDiv = document.getElementById('suggestions');

const checkItems = {
    length: document.getElementById('lengthCheck'),
    uppercase: document.getElementById('uppercaseCheck'),
    lowercase: document.getElementById('lowercaseCheck'),
    digits: document.getElementById('digitsCheck'),
    special: document.getElementById('specialCheck')
};

passwordInput.addEventListener('input', async (e) => {
    const password = e.target.value;

    if (!password) {
        resultsDiv.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        const data = await response.json();
        updateUI(data);
        resultsDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Error analyzing password:', error);
    }
});

function updateUI(data) {
    scoreText.textContent = data.score;
    strengthText.textContent = data.strength;
    strengthFill.style.width = (data.score / 9) * 100 + '%';
    strengthFill.style.background = data.color;
    scoreCircle.style.borderColor = data.color;
    scoreText.style.color = data.color;

    updateCheckItem(checkItems.length, data.length >= 8);
    updateCheckItem(checkItems.uppercase, data.has_uppercase);
    updateCheckItem(checkItems.lowercase, data.has_lowercase);
    updateCheckItem(checkItems.digits, data.has_digits);
    updateCheckItem(checkItems.special, data.has_special);

    if (data.suggestions.length > 0) {
        suggestionsDiv.classList.add('show');
        suggestionsDiv.innerHTML = '<p>Suggestions to improve:</p><ul>' +
            data.suggestions.map(s => `<li>${s}</li>`).join('') +
            '</ul>';
    } else {
        suggestionsDiv.classList.remove('show');
    }
}

function updateCheckItem(item, isActive) {
    item.classList.remove('active', 'inactive');
    item.classList.add(isActive ? 'active' : 'inactive');
}

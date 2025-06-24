async function loadHeader() {
    const response = await fetch('header.html');
    const html = await response.text();
    document.body.insertAdjacentHTML('afterbegin', html);
}

async function loadAccountPage() {
    const response = await fetch('account-page.html');
    const html = await response.text();
    document.body.insertAdjacentHTML('beforeend', html);

    // Charger le script account.js après avoir inséré le HTML
    const script = document.createElement('script');
    script.src = 'account.js';
    document.body.appendChild(script);
}

// Charger l'en-tête et la page de compte
loadHeader();
loadAccountPage();
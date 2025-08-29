// Assure-toi d'inclure Stripe.js dans ta page HTML :
// <script src="https://js.stripe.com/v3/"></script>

async function payer(cartItems) {
  try {
    // Appel à ton serveur pour créer la session
    const response = await fetch('http://localhost:3000/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cartItems, shipping: { country: 'FR' } })
    });

    const data = await response.json();

    if (data.error) {
      alert('Erreur lors de la création de la session : ' + data.error);
      return;
    }

    const stripe = Stripe('pk_live_51RaENdJu5wjHrK6J3zWWcLUG8k67bOuTudT11E5TKuqKdUsY61lOw2vtaUmQAzIIqpFrq8RQnTKYGuo61pL4PhIJ00u6cbgmZY'); // Mets ta clé publique Stripe ici

    // Redirection vers Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId: data.id });

    if (error) {
      alert(error.message);
    }
  } catch (err) {
    alert('Erreur réseau ou serveur : ' + err.message);
  }
}

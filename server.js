'use strict';

const express = require('express');
const cors = require('cors');

// Vérification clé Stripe
console.log("Stripe key loaded ?", process.env.STRIPE_SECRET_KEY ? "YES" : "NO");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());


// DEBUG : voir si la clé est chargée
console.log("Stripe secret key:", process.env.STRIPE_SECRET_KEY ? "OK" : "MISSING");

// Route checkout
app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, shipping } = req.body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'cartItems manquant ou invalide' });
    }

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Color: ${item.color || '-'}, Size: ${item.size || '-'}`
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: { allowed_countries: ['FR'] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'eur' },
            display_name: 'Livraison standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      success_url: 'https://drdrip-1.onrender.com/success.html',
      cancel_url: 'https://drdrip-1.onrender.com/cancel.html',
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir tes fichiers HTML statiques
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Stripe server running on port ${PORT}`);
});

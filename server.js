import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { items, shipping } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // en centimes
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: 'http://localhost:5500/success.html',
      cancel_url: 'http://localhost:5500/cancel.html',

      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'CH'], // adapte à ton besoin
      },

      phone_number_collection: {
        enabled: true,
      },

      metadata: {
        shipping_name: shipping.name,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        shipping_zip: shipping.zip,
        shipping_phone: shipping.phone,
      },
    });

    res.json({ id: session.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4242, () => console.log('Server running on port 4242'));

require('dotenv').config();
const express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.use(express.static('public')); // dossier front (modifie si besoin)
app.use(express.json());

// Route pour créer la session Stripe
app.post('/create-checkout-session', async (req, res) => {
  const { cart, customer } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ error: 'Panier vide' });
  }

  if (!customer || !customer.fullname || !customer.email || !customer.address || !customer.city || !customer.zipcode) {
    return res.status(400).json({ error: 'Informations client incomplètes' });
  }

  const line_items = cart.map(item => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.name,
      },
      unit_amount: Math.round(item.price * 100),
    },
    quantity: item.quantity,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      customer_email: customer.email,
      shipping_address_collection: {
        allowed_countries: ['FR'], // adapte selon besoins
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'eur' }, // 5 euros de frais de port
            display_name: 'Livraison standard',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cancel.html',
      metadata: {
        fullname: customer.fullname,
        address: customer.address,
        city: customer.city,
        zipcode: customer.zipcode,
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});

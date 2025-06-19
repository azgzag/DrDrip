'use strict';

require('dotenv').config();
const express = require('express');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, shipping } = req.body;

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Color: ${item.color}, Size: ${item.size}`
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['FR']
      },
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
          }
        }
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cancel.html',
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stripe server running on port ${PORT}`));

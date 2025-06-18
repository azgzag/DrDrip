`use strict`;

// Minimal Express server to create Stripe Checkout Sessions

const express = require('express');
const app = express();
const stripe = require('stripe')('sk_test_51RaENmFToC8jgGBimQmkyab1uWgaxNUTejaYgEIVN2JoTQ1Dkys4mU87FJfqpTprD0fd7eV41SXpPedDaymYAWap00qGh5o8uL');

app.use(express.static('public')); // serve static files if needed
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, shipping } = req.body;

    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          description: `Color: ${item.color}, Size: ${item.size}`,
        },
        unit_amount: Math.round(item.price * 100), // in cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['FR'], // Adjust allowed countries as needed
      },
      shipping_options: [
        { shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'eur' },
            display_name: 'Standard Shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          }
        },
      ],
      success_url: 'http://localhost:3000/success.html',
      cancel_url: 'http://localhost:3000/cancel.html',
      // can add metadata here for user info if needed
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stripe server listening on port ${PORT}`));


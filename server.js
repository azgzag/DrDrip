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

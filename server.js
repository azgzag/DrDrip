'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cartItems, shipping } = req.body;

    if (!cartItems || !shipping || !shipping.email) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

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
      customer_email: shipping.email,
      success_url: 'https://azgzag.github.io/DrDrip/success.html',
      cancel_url: 'https://azgzag.github.io/DrDrip/cancel.html',
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const itemDetails = cartItems.map(item =>
      `• ${item.quantity}x ${item.name} (Color: ${item.color}, Size: ${item.size}) - ${(item.price * item.quantity).toFixed(2)} €`
    ).join('\n');

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const mailText = `Nouvelle commande Doctor Drip :

Nom : ${shipping.name}
Email : ${shipping.email}
Adresse : ${shipping.address}, ${shipping.postal} ${shipping.city}, ${shipping.country}
${shipping.relay ? `Point Relais : ${shipping.relay}\n` : ''}

Articles :
${itemDetails}

Total : ${total} € + 5.00 € (livraison)`;

    const mailOptions = {
      from: `"Doctor Drip" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: 'Nouvelle commande en ligne',
      text: mailText
    };

    console.log("📧 Mail envoyé à :", mailOptions.to);
    console.log("✉️ Contenu du mail :\n", mailOptions.text);

    await transporter.sendMail(mailOptions);

    res.json({ id: session.id });

  } catch (err) {
    console.error("❌ Erreur serveur :", err);
    res.status(500).json({ error: err.message });
  }
});

// API de recherche de points relais (optionnel)
app.get('/api/relays', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  const filePath = path.join(__dirname, 'relays-fr.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Erreur de lecture du fichier relays-fr.json:', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    try {
      const relays = JSON.parse(data);
      const results = relays.filter(r =>
        r.ville.toLowerCase().includes(search) ||
        r.nom.toLowerCase().includes(search) ||
        r.adresse.toLowerCase().includes(search) ||
        r.code_postal.includes(search)
      ).slice(0, 50);

      res.json(results);
    } catch (err) {
      console.error('Erreur de parsing JSON:', err);
      res.status(500).json({ error: 'Erreur de données' });
    }
  });
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});

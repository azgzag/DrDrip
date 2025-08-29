require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req,res)=>{
  try {
    const { cartItems } = req.body;
    if(!cartItems || !Array.isArray(cartItems)) return res.status(400).json({ error:"Panier invalide" });

    const line_items = cartItems.map(i=>({
      price_data: {
        currency:"eur",
        product_data: { name:i.name, description:`Color: ${i.color}, Size: ${i.size}` },
        unit_amount: Math.round(i.price*100)
      },
      quantity:i.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items,
      mode:'payment',
      success_url:'http://localhost:3000/success.html',
      cancel_url:'http://localhost:3000/cancel.html'
    });
    res.json({ id: session.id });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:err.message });
  }
});

app.listen(3000, ()=>console.log("Server running on port 3000"));

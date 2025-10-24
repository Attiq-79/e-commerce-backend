import express from "express";
import Stripe from "stripe";

const checkoutRoute = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // apni secret key env me rakho

checkoutRoute.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;

    const lineItems = cart.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // stripe amount in cents
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default checkoutRoute;

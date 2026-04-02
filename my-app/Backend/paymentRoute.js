import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import Booking from './models/bookingModel.js';

dotenv.config();

const router = express.Router();

// Initialize Stripe with a fallback to avoid crash if key is missing in .env
// You MUST replace 'sk_test_placeholder' with your real Stripe Secret Key in .env
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing in .env file. Payment features will not work.');
}

const stripe = new Stripe(stripeSecretKey || 'sk_test_placeholder_not_set');


router.post('/create-payment-intent', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Amount must be in the smallest currency unit (cents/paisa)
    // Extract numerical value from "रू 500.00" or similar strings
    const numericAmount = parseFloat(booking.totalCost.replace(/[^0-9.]/g, '')) || 0;
    const amount = Math.round(numericAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd', // Stripe doesn't support NPR. Using USD as a placeholder for this project.
      metadata: { 
        bookingId: bookingId.toString(),
        userId: booking.userId.toString()
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

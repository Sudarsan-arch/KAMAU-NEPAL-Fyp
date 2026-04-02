import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

const StripePaymentForm = ({ amount, onPaymentSuccess, processing, setProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Fetch Client Secret from backend
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ bookingId: window.location.pathname.split('/').pop() }),
      });

      const { clientSecret, message } = await response.json();

      if (!clientSecret) {
        throw new Error(message || 'Failed to initialize payment');
      }

      // 2. Confirm Payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: localStorage.getItem('userName') || 'Customer',
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          onPaymentSuccess();
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during payment.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4 animate-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-slate-200 transition-all focus-within:ring-4 focus-within:ring-orange-500/10">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Card Details</label>
        <div className="py-2">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#0f172a',
                  fontFamily: 'Outfit, system-ui, sans-serif',
                  '::placeholder': { color: '#94a3b8' },
                  letterSpacing: '0.05em',
                },
                invalid: { color: '#ef4444' },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2 animate-in shake duration-300">
          <ShieldCheck size={14} className="rotate-180" /> {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
      >
        {processing ? (
          <Loader2 className="animate-spin w-5 h-5" />
        ) : (
          <>
            Pay {amount} NPR <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
        <ShieldCheck size={12} className="text-teal-500" /> PCI-DSS Compliant Secure Payment Gateway
      </p>
    </form>
  );
};

export default StripePaymentForm;

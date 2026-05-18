import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
const CLIENT_URL = process.env.CLIENT_URL || '';

export async function initializePayment({ amount, reference, email }: { amount: number; reference: string; email: string }) {
  if (!PAYSTACK_SECRET) throw new Error('PAYSTACK_SECRET_KEY not configured');
  const payload = {
    amount: Math.round(amount * 100),
    email,
    reference,
    callback_url: `${CLIENT_URL}/payment/verify?reference=${reference}`,
  };
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(
      `Paystack Error: ${data.message || "Failed to initialize"}`,
    );
  }
  return data.data;
}

export async function verifyPayment(reference: string) {
  if (!PAYSTACK_SECRET) throw new Error('PAYSTACK_SECRET_KEY not configured');
  const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } });
  return res.data.data;
}

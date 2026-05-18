import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

export async function createSession(deviceId) {
  const { data } = await api.post('/session', { deviceId });
  return data;
}

export async function sendMessage(sessionId, message) {
  const { data } = await api.post('/chat', { sessionId, message });
  return data;
}

export async function initializePayment(sessionId) {
  const { data } = await api.post('/payment/initialize', { sessionId });
  return data;
}

export async function verifyPayment(reference) {
  const { data } = await api.get('/payment/verify', { params: { reference } });
  return data;
}

export default api;

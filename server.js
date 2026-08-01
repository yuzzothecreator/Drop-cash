// ─── Drap Cash — Tanzania Mobile Money Gateway ─────────────────────────────
// Secure proxy server for ClickPesa API (payments + payouts)
// Keys are loaded from .env — NEVER hardcode them in source code.
// ────────────────────────────────────────────────────────────────────────────

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Configuration ─────────────────────────────────────────────────────────
const CLICKPESA_BASE = 'https://api.clickpesa.com/third-parties';

const CLIENT_ID = process.env.CLICKPESA_CLIENT_ID;
const API_KEY = process.env.CLICKPESA_API_KEY;

// Fail fast if credentials are missing
if (!CLIENT_ID || !API_KEY) {
  console.error('\n❌ Missing ClickPesa credentials!');
  console.error('   Create a .env file in the project root with:');
  console.error('   CLICKPESA_CLIENT_ID=your_client_id');
  console.error('   CLICKPESA_API_KEY=your_api_key\n');
  console.error('   See .env.example for reference.\n');
  process.exit(1);
}

// ─── Token Management ──────────────────────────────────────────────────────
// Store token in memory (refreshed every 55 min)
let authToken = null;
let tokenExpiry = null;

async function getToken() {
  const now = Date.now();
  if (authToken && tokenExpiry && now < tokenExpiry) return authToken;

  console.log('[Drap Cash] Generating new auth token...');
  const res = await axios.post(`${CLICKPESA_BASE}/generate-token`, {}, {
    headers: { 'api-key': API_KEY, 'client-id': CLIENT_ID }
  });

  if (res.data.success && res.data.token) {
    authToken = res.data.token;
    tokenExpiry = now + 55 * 60 * 1000; // 55 min (token valid 1hr)
    console.log('[Drap Cash] Token generated OK');
    return authToken;
  }
  throw new Error('Failed to generate token: ' + JSON.stringify(res.data));
}

// ─── PAYMENT ROUTES ────────────────────────────────────────────────────────

// Health / token test
app.get('/api/health', async (req, res) => {
  try {
    const token = await getToken();
    res.json({ ok: true, tokenPrefix: token.slice(0, 20) + '…' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Step 1 – Preview USSD push (validate)
app.post('/api/preview', async (req, res) => {
  try {
    const token = await getToken();
    const { amount, phoneNumber, orderReference } = req.body;
    const response = await axios.post(
      `${CLICKPESA_BASE}/payments/preview-ussd-push-request`,
      { amount: String(amount), currency: 'TZS', orderReference, phoneNumber },
      { headers: { Authorization: token, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Preview Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Step 2 – Initiate USSD push
app.post('/api/initiate', async (req, res) => {
  try {
    const token = await getToken();
    const { amount, phoneNumber, orderReference } = req.body;
    const response = await axios.post(
      `${CLICKPESA_BASE}/payments/initiate-ussd-push-request`,
      { amount: String(amount), currency: 'TZS', orderReference, phoneNumber },
      { headers: { Authorization: token, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Initiate Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Step 3 – Query payment status
app.get('/api/status', async (req, res) => {
  try {
    const token = await getToken();
    const { orderReference } = req.query;
    const response = await axios.get(
      `${CLICKPESA_BASE}/payments/query-payment?orderReference=${orderReference}`,
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Status Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Account balance
app.get('/api/balance', async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${CLICKPESA_BASE}/account/balance`,
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// ─── PAYOUT ROUTES ─────────────────────────────────────────────────────────

// Payout Step 1 – Preview mobile money payout (validate + see fee)
app.post('/api/payout/preview', async (req, res) => {
  try {
    const token = await getToken();
    const { amount, phoneNumber, orderReference, currency } = req.body;
    const response = await axios.post(
      `${CLICKPESA_BASE}/payouts/preview-mobile-money-payout`,
      { amount: Number(amount), currency: currency || 'TZS', orderReference, phoneNumber },
      { headers: { Authorization: token, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Payout Preview Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Payout Step 2 – Create / execute mobile money payout
app.post('/api/payout/create', async (req, res) => {
  try {
    const token = await getToken();
    const { amount, phoneNumber, orderReference, currency } = req.body;
    const response = await axios.post(
      `${CLICKPESA_BASE}/payouts/create-mobile-money-payout`,
      { amount: Number(amount), currency: currency || 'TZS', orderReference, phoneNumber },
      { headers: { Authorization: token, 'Content-Type': 'application/json' } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Payout Create Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Payout Step 3 – Query payout status
app.get('/api/payout/status', async (req, res) => {
  try {
    const token = await getToken();
    const { orderReference } = req.query;
    const response = await axios.get(
      `${CLICKPESA_BASE}/payouts/query-payout?orderReference=${orderReference}`,
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    console.error('[Payout Status Error]', msg);
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Get all payouts
app.get('/api/payout/all', async (req, res) => {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${CLICKPESA_BASE}/payouts/query-all-payouts`,
      { headers: { Authorization: token } }
    );
    res.json(response.data);
  } catch (e) {
    const msg = e.response?.data || e.message;
    res.status(e.response?.status || 500).json({ error: msg });
  }
});

// Webhook receiver (ClickPesa calls this when payment completes)
app.post('/api/webhook', (req, res) => {
  console.log('[Webhook received]', JSON.stringify(req.body, null, 2));
  // TODO: verify signature, update your database, trigger fulfillment
  res.json({ received: true });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── Start Server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   🚀 Drap Cash is running            ║`);
  console.log(`  ║   → http://localhost:${PORT}            ║`);
  console.log(`  ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(19)}║`);
  console.log(`  ╚══════════════════════════════════════╝\n`);
});
# 💸 Drap Cash

**Tanzania Mobile Money Payment Gateway** — Collect payments and send payouts via M-Pesa, Airtel Money, HaloPesa & YAS through a single ClickPesa integration.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- 🏦 **Collect Payments** — USSD Push requests to customer phones
- 💸 **Send Payouts** — Disburse funds to mobile money wallets
- 📊 **Dashboard** — Real-time balance, stats, and transaction overview
- 📋 **Transaction History** — Searchable, filterable, per-session records
- 🔐 **Secure** — API keys stored in `.env`, never in source code
- 🖥️ **Activity Log** — Dark terminal-style event viewer
- ⚙️ **API Reference** — Built-in endpoint documentation
- 📱 **Responsive** — Works on desktop, tablet, and mobile
- 🎨 **Modern UI** — Professional design with sidebar nav, stepper wizards, micro-animations

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- A [ClickPesa](https://clickpesa.com) account with API credentials

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/drap-cash.git
cd drap-cash

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Edit .env with your ClickPesa credentials

# 4. Start the server
npm start
# → http://localhost:3000
```

### Development Mode (auto-restart)

```bash
npm run dev
```

## 🔑 Environment Variables

Create a `.env` file in the project root:

| Variable | Required | Description |
|----------|----------|-------------|
| `CLICKPESA_CLIENT_ID` | ✅ | Your ClickPesa Client ID |
| `CLICKPESA_API_KEY` | ✅ | Your ClickPesa API Key |
| `PORT` | ❌ | Server port (default: `3000`) |
| `NODE_ENV` | ❌ | Environment (`development` / `production`) |

> ⚠️ **Never commit your `.env` file!** It's already in `.gitignore`.

Get your API keys from the [ClickPesa Dashboard](https://dashboard.clickpesa.com).

## 📁 Project Structure

```
drap-cash/
├── .env                 ← Your secrets (git-ignored)
├── .env.example         ← Template for other developers
├── .gitignore           ← Excludes .env, node_modules, logs
├── server.js            ← Express backend (ClickPesa API proxy)
├── package.json
├── README.md
└── public/
    └── index.html       ← Full-featured dashboard UI
```

## 🔄 How It Works

```
Browser  →  localhost:3000 (Express proxy)  →  api.clickpesa.com
```

The browser **cannot** call ClickPesa directly (CORS). Your Express server acts as a secure proxy, keeping API keys server-side.

### Payment Flow (USSD Push)

1. **Select Provider** — M-Pesa, Airtel, HaloPesa, or YAS
2. **Enter Details** — Phone number, amount, reference
3. **Review & Confirm** — Verify before sending
4. **USSD Push** — Customer receives a prompt on their phone
5. **Poll Status** — App checks every 5s until completed

### Payout Flow (Disbursement)

1. **Enter Details** — Recipient phone, amount
2. **Preview** — Validate and see estimated fees
3. **Execute** — Send funds to the mobile wallet
4. **Status** — Track payout completion

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Test connection & token |
| `POST` | `/api/preview` | Validate USSD push request |
| `POST` | `/api/initiate` | Send USSD push to customer |
| `GET` | `/api/status` | Query payment status |
| `GET` | `/api/balance` | Get account balance |
| `POST` | `/api/payout/preview` | Preview payout & fee |
| `POST` | `/api/payout/create` | Execute mobile money payout |
| `GET` | `/api/payout/status` | Query payout status |
| `GET` | `/api/payout/all` | List all payouts |
| `POST` | `/api/webhook` | Receive ClickPesa callbacks |

## 🔔 Webhook Setup

In your [ClickPesa dashboard](https://dashboard.clickpesa.com), set the callback URL to:

```
https://yourdomain.com/api/webhook
```

For local testing:

```bash
npx ngrok http 3000
# Copy the HTTPS URL → set as webhook in ClickPesa dashboard
```

## 🌐 Deployment

### Railway / Render / Heroku

1. Push your code to GitHub (`.env` is auto-excluded)
2. Connect the repo to your hosting platform
3. Set environment variables in the platform's dashboard:
   - `CLICKPESA_CLIENT_ID`
   - `CLICKPESA_API_KEY`
   - `PORT` (usually auto-assigned)
   - `NODE_ENV=production`
4. Deploy — the `npm start` script handles the rest

### VPS / DigitalOcean

```bash
# On your server
git clone https://github.com/your-username/drap-cash.git
cd drap-cash
npm install --production
cp .env.example .env
# Edit .env with your credentials
NODE_ENV=production node server.js
```

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start server.js --name drap-cash
pm2 save
```

## 🛡️ Security Notes

- ✅ API keys are loaded from `.env` via `dotenv` — never hardcoded
- ✅ `.gitignore` blocks `.env` from being committed
- ✅ Server fails fast if credentials are missing
- ✅ Frontend calls your Express proxy, not ClickPesa directly
- ⚠️ For production: add HTTPS, webhook signature verification, and rate limiting

## 📄 License

MIT — See [LICENSE](LICENSE) for details.

---

Built with ❤️ for Tanzania's mobile money ecosystem.

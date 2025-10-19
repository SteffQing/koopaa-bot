# 🪙 KooPaa Bot

**KooPaa Bot** brings decentralized group savings (“Ajo” or “Esusu”) directly into your Telegram chats.
Users can **create, join, and manage savings groups** seamlessly — powered by **Solana** smart contracts and a lightweight **Grid-based backend**.

---

## 🚀 Features

- 🔐 **Email-based Authentication** – Sign up with your email address and link your telegram id.
- 👤 **User Profile** – View your on-chain identity and linked data.
- 💬 **Telegram Commands** – Interact with KooPaa through simple bot commands.
- 👥 **Group Management** – Create and join savings groups securely.
- 💰 **On-chain & Off-chain Sync** – Hybrid storage using Solana smart contracts + Redis/DB.
- ⚙️ **Unified API Layer** – Shared Grid engine between DApp, Telegram bot, and WhatsApp bot.

---

## 💡 Bot Commands

| Command         | Description                                 |
| --------------- | ------------------------------------------- |
| `/start`        | Start KooPaa and link your wallet           |
| `/profile`      | View your linked wallet and user info       |
| `/help`         | Show all available commands                 |
| `/create_group` | Create a new contribution or savings group  |
| `/join_group`   | Join an existing group by ID or invite link |
| `/my_groups`    | List all groups you belong to               |

---

## 🧱 Tech Stack

- **Solana** – Smart contract layer for group creation and funds management
- **Next.js** – Frontend + backend API routes for unified app logic
- **Telegraf** – Telegram bot framework
- **Redis** – Temporary data store for pending group metadata
- **PostgreSQL / Neon** – Persistent off-chain storage
- **TypeScript** – End-to-end type safety
- **Grid** – Orchestration engine used across all KooPaa clients except web app

---

## 🧩 Architecture Overview

```
User ↔ Telegram Bot (Telegraf)
              │
              ▼
         KooPaa API (Next.js)
          ├── Auth (JWT)
          ├── Redis (temp off-chain data)
          ├── Neon (persistent storage)
          └── Solana Program (on-chain logic)
```

### Event Flow (Example: Group Creation)

1. User sends `/create_group` on Telegram
2. Bot calls API → generates group metadata (off-chain)
3. Smart contract TX creates group on Solana
4. Bot confirms success to user

---

## ⚙️ Setup

### Prerequisites

- Node.js 18+
- Redis instance
- PostgreSQL project
- Solana CLI / RPC endpoint
- Telegram Bot Token

### Installation

```bash
git clone https://github.com/steffqing/koopaa-bot.git
cd koopaa-bot
pnpm install
```

### Environment

Create a `.env` file:

```bash
TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
BASE_API_URL=<your_dapp_api_endpoint>
```

### Run the Bot

```bash
pnpm dev
```

---

## 🤝 Contributing

Pull requests are welcome!
If you’d like to contribute:

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-idea`)
3. Commit changes (`git commit -m "feat: add amazing feature"`)
4. Push and open a PR

---

## 📜 License

MIT © [Steve Tomi / Team KooPaa]

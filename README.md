# StarFashion — Full-Stack E-Commerce Clothing Store

StarFashion is a modern, mobile-first e-commerce clothing brand web app featuring a Gen Z aesthetic, clean editorial design, persistent Zustand cart, Supabase database, and real-time Telegram bot order verification with inline approval buttons (`Approve` / `Reject`).

---

## Tech Stack
- **Frontend & Backend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion
- **State Management**: Zustand (persistent with localStorage)
- **Database**: Supabase PostgreSQL
- **Notifications**: Telegram Bot API (`@starfashion`)
- **Admin Security**: Secure httpOnly cookie authentication with Next.js middleware protection

---

## Setup Instructions

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials, Telegram Bot Token (`9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY`), Telegram Chat ID, and Admin Password.

3. **Set Up Supabase Database**:
   Run the SQL migration script located in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor to create `products`, `orders`, and `store_settings` tables with policies.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the storefront, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

---

## Telegram Bot Webhook Setup
To enable inline button approvals (`Approve` / `Reject`) from Telegram:
1. Expose your server publicly (e.g. via Ngrok: `ngrok http 3000`).
2. Set your Telegram bot webhook URL:
   ```bash
   curl -F "url=https://YOUR_NGROK_URL/api/orders/telegram-webhook" https://api.telegram.org/bot9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY/setWebhook
   ```

---

## Deployment to Vercel
1. Push your repository to GitHub.
2. Import project into Vercel.
3. Configure environment variables in Vercel project settings.
4. Deploy!
🤖 Generated with [Claude Code](https://claude.com/claude-code)

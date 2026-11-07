import dns from 'node:dns';
import net from 'node:net';
try {
  dns.setDefaultResultOrder?.('ipv4first');
  net.setDefaultAutoSelectFamily?.(false);
} catch {}

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dbPath = path.join(projectRoot, 'data', 'db.json');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY';

function getAdminChatId() {
  if (process.env.TELEGRAM_CHAT_ID) return process.env.TELEGRAM_CHAT_ID;
  try {
    if (fs.existsSync(dbPath)) {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (data.store_settings?.admin_telegram_chat_id) {
        return data.store_settings.admin_telegram_chat_id;
      }
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return '';
}

async function main() {
  const chatId = getAdminChatId();
  if (!chatId) {
    console.log('⚠️ No Admin Telegram Chat ID found.');
    console.log('👉 Please open Telegram, search @Starfastionbot and send "/start".');
    console.log('   Once you send /start, the bot will auto-link your chat ID!');
    process.exit(0);
  }

  console.log(`📤 Sending test order receipt to Telegram chat ID: ${chatId}...`);

  const shortId = 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const message = `🛍️ *TEST ORDER RECEIPT - STARFASHION*
🔖 *Order ID:* \`#${shortId}\`
📅 *Date:* ${dateStr} at ${timeStr}

━━━━━━━━━━━━━━━━━━━━━
👤 *CUSTOMER CONTACT INFORMATION*
• *Telegram Username:* @starboy ([Open Chat](https://t.me/starboy))
• *Phone Number:* \`+855 12 345 678\`
• *Delivery Address:*
  📍 #123, Monivong Blvd, Sangkat Boeung Keng Kang 1, Phnom Penh

━━━━━━━━━━━━━━━━━━━━━
📦 *ORDERED ITEMS (2)*
1. *Starboy Oversized Heavyweight Hoodie*
   📏 Size: \`L\` | 🔢 Qty: \`1\` | 💵 \`$120.00\`
2. *Cyberpunk Techwear Cargo Pants*
   📏 Size: \`M\` | 🔢 Qty: \`1\` | 💵 \`$145.00\`

━━━━━━━━━━━━━━━━━━━━━
💳 *Payment Method:* 🏦 KHQR Scan (Mobile Bank)
💰 *Total Amount:* *$265.00*
⚡ *Status:* ⏳ *PENDING APPROVAL*

━━━━━━━━━━━━━━━━━━━━━
👇 *ACTIONS FOR ADMIN:*`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '💬 Chat with @starboy', url: 'https://t.me/starboy' },
        { text: '📞 Call Customer', url: 'tel:+85512345678' },
      ],
      [
        { text: '✅ Approve Order', callback_data: `approve_${shortId}` },
        { text: '❌ Reject Order', callback_data: `reject_${shortId}` },
      ],
    ],
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json();
    if (data.ok) {
      console.log(`✅ Success! Test receipt delivered to your Telegram. Message ID: ${data.result.message_id}`);
    } else {
      console.error('❌ Telegram error:', data);
    }
  } catch (err) {
    console.error('❌ Failed to send:', err.message);
  }
}

main();

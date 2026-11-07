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
const envPath = path.join(projectRoot, '.env.local');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY';
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

function readDB() {
  try {
    if (!fs.existsSync(dbPath)) return { products: [], orders: [], store_settings: { id: 'main', banner_images: [], announcement_text: '', is_store_open: true } };
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (err) {
    console.error('Error reading db.json:', err);
    return { products: [], orders: [], store_settings: { id: 'main', banner_images: [], announcement_text: '', is_store_open: true } };
  }
}

function writeDB(data) {
  try {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

function updateEnvFile(chatId) {
  try {
    let content = '';
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, 'utf8');
    }
    if (content.includes('TELEGRAM_CHAT_ID=')) {
      content = content.replace(/TELEGRAM_CHAT_ID=.*/g, `TELEGRAM_CHAT_ID=${chatId}`);
    } else {
      content += `\nTELEGRAM_CHAT_ID=${chatId}\n`;
    }
    fs.writeFileSync(envPath, content.trim() + '\n', 'utf8');
  } catch (err) {
    console.error('Error updating .env.local:', err);
  }
}

async function api(method, body = {}) {
  try {
    const res = await fetch(`${API_BASE}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    return await res.json();
  } catch (err) {
    console.error(`Telegram API error (${method}):`, err);
    return { ok: false, error: err.message };
  }
}

async function sendTestNotification(chatId) {
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

  await api('sendMessage', {
    chat_id: chatId,
    text: message,
    parse_mode: 'Markdown',
    reply_markup: inlineKeyboard,
  });
}

async function startBot() {
  console.log('🤖 Initializing StarFashion Telegram Bot Runner...');

  // 1. Verify Bot Token
  const me = await api('getMe');
  if (!me.ok) {
    console.error('❌ Failed to connect to Telegram Bot. Token may be invalid:', me);
    process.exit(1);
  }
  console.log(`✅ Logged in as Telegram Bot: @${me.result.username} (${me.result.first_name})`);

  // 2. Remove any active webhook so long-polling works in local/test environment
  await api('deleteWebhook', { drop_pending_updates: false });
  console.log('🌐 Polling mode enabled (Webhook disabled for local test environment).');

  const db = readDB();
  let currentAdminChatId = process.env.TELEGRAM_CHAT_ID || db.store_settings?.admin_telegram_chat_id || '';
  if (currentAdminChatId) {
    console.log(`📱 Current Admin Chat ID: ${currentAdminChatId}`);
  } else {
    console.log('⚠️ No Admin Chat ID saved yet.');
    console.log(`👉 Open Telegram, search @${me.result.username} and send "/start" to connect!`);
  }

  let offset = 0;

  while (true) {
    try {
      const updates = await api('getUpdates', { offset, timeout: 20 });
      if (updates.ok && Array.isArray(updates.result)) {
        for (const update of updates.result) {
          offset = update.update_id + 1;

          // A. Handle Incoming Messages
          if (update.message) {
            const msg = update.message;
            const chatId = msg.chat?.id;
            const text = (msg.text || '').trim();
            const senderName = msg.from?.username ? `@${msg.from.username}` : (msg.from?.first_name || 'Admin');

            console.log(`📩 Incoming message from ${senderName} (Chat ID: ${chatId}): "${text}"`);

            if (text.startsWith('/start') || text.startsWith('/connect')) {
              const currentDb = readDB();
              if (!currentDb.store_settings) {
                currentDb.store_settings = { id: 'main', banner_images: [], announcement_text: '', is_store_open: true };
              }
              currentDb.store_settings.admin_telegram_chat_id = String(chatId);
              writeDB(currentDb);
              updateEnvFile(chatId);
              currentAdminChatId = String(chatId);

              const welcomeMsg = `🎉 *StarFashion Store Notification Bot Connected!*

Hello *${senderName}*!
Your Telegram account is now successfully paired as the *Store Administrator*.
🆔 *Admin Chat ID:* \`${chatId}\`

From now on, whenever a customer places an order on your storefront:
📦 Full order receipt with items, sizes & prices
👤 Customer's Telegram username with 1-click chat link
📞 Customer's phone number with 1-click call link
⚡ Instant buttons to *Approve* or *Reject* the order

*Quick Commands:*
• /test — Send a sample order receipt to test buttons
• /status — View store status and pending orders
• /orders — List latest 5 orders`;

              await api('sendMessage', { chat_id: chatId, text: welcomeMsg, parse_mode: 'Markdown' });
              console.log(`🌟 Successfully paired Admin Chat ID: ${chatId}`);
            } else if (text.startsWith('/test')) {
              await sendTestNotification(chatId);
              console.log(`📤 Sent test order receipt to ${chatId}`);
            } else if (text.startsWith('/status')) {
              const currentDb = readDB();
              const pendingCount = (currentDb.orders || []).filter(o => o.status === 'pending').length;
              const totalCount = (currentDb.orders || []).length;
              const statusMsg = `📊 *StarFashion Store Status:*
• Storefront: Online
• Admin Linked: \`${chatId}\`
• Pending Orders: *${pendingCount}*
• Total Orders: *${totalCount}*`;
              await api('sendMessage', { chat_id: chatId, text: statusMsg, parse_mode: 'Markdown' });
            } else if (text.startsWith('/orders')) {
              const currentDb = readDB();
              const recent = (currentDb.orders || []).slice(0, 5);
              if (recent.length === 0) {
                await api('sendMessage', { chat_id: chatId, text: 'No orders placed yet.', parse_mode: 'Markdown' });
              } else {
                const list = recent.map((o, idx) => {
                  const statusEmoji = o.status === 'approved' ? '✅' : o.status === 'rejected' ? '❌' : '⏳';
                  return `${idx + 1}. *#${o.id.slice(0, 8).toUpperCase()}* — $${o.total_price.toFixed(2)} (${statusEmoji} ${o.status})\n   Customer: @${o.telegram_name} | 📞 ${o.telegram_phone}`;
                }).join('\n\n');
                await api('sendMessage', { chat_id: chatId, text: `📋 *Recent Orders:*\n\n${list}`, parse_mode: 'Markdown' });
              }
            } else {
              await api('sendMessage', {
                chat_id: chatId,
                text: `👋 Hi ${senderName}! Use /start to connect, /test to test receipt notifications, or /status to check store orders.`,
                parse_mode: 'Markdown',
              });
            }
          }

          // B. Handle Button Clicks (Callback Queries)
          if (update.callback_query) {
            const cb = update.callback_query;
            const data = cb.data;
            const message = cb.message;
            const messageId = message?.message_id;
            const callbackChatId = message?.chat?.id;

            console.log(`🔘 Button clicked: "${data}" by ${cb.from?.username || cb.from?.first_name}`);

            const separatorIndex = data.indexOf('_');
            if (separatorIndex !== -1) {
              const action = data.substring(0, separatorIndex);
              const orderId = data.substring(separatorIndex + 1);
              const newStatus = action === 'approve' ? 'approved' : 'rejected';
              const statusEmoji = newStatus === 'approved' ? '✅ APPROVED' : '❌ REJECTED';

              // Update in db.json if not a sample test
              const currentDb = readDB();
              let customerName = 'customer';
              const orderIndex = (currentDb.orders || []).findIndex(o => o.id === orderId);
              if (orderIndex !== -1) {
                currentDb.orders[orderIndex].status = newStatus;
                writeDB(currentDb);
                customerName = currentDb.orders[orderIndex].telegram_name || 'customer';
                console.log(`📝 Order #${orderId} updated to ${newStatus} in database.`);
              }

              // Answer callback query toast in Telegram
              await api('answerCallbackQuery', {
                callback_query_id: cb.id,
                text: `Order #${orderId.slice(0, 8).toUpperCase()} was ${newStatus.toUpperCase()}!`,
              });

              // Edit message text
              const originalText = message?.text || '';
              const adminName = cb.from?.username ? `@${cb.from.username}` : (cb.from?.first_name || 'Admin');
              const actionTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

              const cleanedOriginal = originalText
                .replace(/⚡ \*Status:\* ⏳ \*PENDING APPROVAL\*/g, `⚡ *Status:* ${statusEmoji}`)
                .replace(/⚡ \*Current Status:\* ⏳ \*Pending Approval\*/g, `⚡ *Current Status:* ${statusEmoji}`)
                .replace(/Tap below to chat with the customer or approve\/reject this order:/g, '')
                .replace(/👇 \*ACTIONS FOR ADMIN:\*/g, '');

              const updatedText = `${cleanedOriginal.trim()}\n\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *DECISION:* Order was *${statusEmoji}* by ${adminName} at ${actionTime}.`;

              const cleanCustomer = customerName.replace(/^@/, '').trim();
              const buttons = [
                [{ text: `💬 Chat with @${cleanCustomer}`, url: `https://t.me/${cleanCustomer}` }]
              ];

              await api('editMessageText', {
                chat_id: callbackChatId,
                message_id: messageId,
                text: updatedText,
                parse_mode: 'Markdown',
                reply_markup: { inline_keyboard: buttons },
              });
            }
          }
        }
      }
    } catch (loopErr) {
      console.error('Polling error:', loopErr);
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

startBot();

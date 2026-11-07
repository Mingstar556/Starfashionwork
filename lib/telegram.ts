const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function sendTelegramOrderNotification(order: {
  id: string;
  telegram_name: string;
  telegram_phone: string;
  address: string;
  items: Array<{ name: string; size: string; qty: number; price: number }>;
  total_price: number;
  payment_method: string;
}) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram bot token or chat ID is missing. Skipping Telegram notification.');
    return null;
  }

  const itemsText = order.items
    .map((item) => `• ${item.name} (Size: ${item.size}) x${item.qty} — $${(item.price * item.qty).toFixed(2)}`)
    .join('\n');

  const message = `🛍️ *New Order #${order.id.slice(0, 8).toUpperCase()}*
👤 @${order.telegram_name} | 📞 ${order.telegram_phone}
📍 ${order.address}
💳 Payment: *${order.payment_method}*

*Items:*
${itemsText}

💰 *Total: $${order.total_price.toFixed(2)}*`;

  const inlineKeyboard = {
    inline_keyboard: [
      [
        { text: '✅ Approve', callback_data: `approve_${order.id}` },
        { text: '❌ Reject', callback_data: `reject_${order.id}` },
      ],
    ],
  };

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
      }),
    });

    const data = await response.json();
    if (data.ok && data.result) {
      return data.result.message_id as number;
    } else {
      console.error('Telegram API error:', data);
      return null;
    }
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return null;
  }
}

export async function editTelegramMessageStatus(
  messageId: number,
  newText: string
) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || !messageId) return;

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        message_id: messageId,
        text: newText,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Failed to edit Telegram message:', error);
  }
}

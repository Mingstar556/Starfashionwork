import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import {
  editTelegramMessageStatus,
  getTelegramConfig,
  saveAdminTelegramChatId,
  sendTelegramTextMessage,
} from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botToken } = getTelegramConfig();

    // 1. Handle incoming text commands (e.g. /start, /status)
    if (body.message) {
      const chatId = body.message.chat?.id;
      const text = (body.message.text || '').trim();
      const fromUser = body.message.from?.username || body.message.from?.first_name || 'Admin';

      if (text.startsWith('/start') || text.startsWith('/connect')) {
        saveAdminTelegramChatId(chatId, fromUser);

        const welcomeMsg = `🎉 *StarFashion Store Notification Bot Connected!*

Hello *${fromUser}*!
Your Telegram account is now successfully linked as the Store Admin.
🆔 *Your Chat ID:* \`${chatId}\`

Whenever a customer completes an order on the StarFashion storefront:
✅ You will receive the receipt with item breakdown & pricing
👤 Customer's Telegram username & direct 1-click chat link
📞 Customer's phone number & direct call button
⚡ Instant inline buttons to *Approve* or *Reject* the order

Send /status anytime to check your store's current pending orders.`;

        await sendTelegramTextMessage(chatId, welcomeMsg);
        return NextResponse.json({ ok: true, action: 'admin_connected' });
      }

      if (text.startsWith('/status')) {
        const { data: pendingOrders } = await supabaseAdmin
          .from('orders')
          .select('*')
          .eq('status', 'pending');

        const count = pendingOrders?.length || 0;
        const statusMsg = `📊 *StarFashion Store Status:*
• Bot Token: Active
• Connected Admin Chat ID: \`${chatId}\`
• Pending Orders: *${count}*

${count > 0 ? `Use /orders to view pending orders.` : 'All orders are currently processed!'}`;

        await sendTelegramTextMessage(chatId, statusMsg);
        return NextResponse.json({ ok: true, action: 'status_reported' });
      }

      if (text.startsWith('/search') || text.startsWith('/find')) {
        const query = text.replace(/^\/(search|find)\s*/i, '').trim().toLowerCase();
        if (!query) {
          await sendTelegramTextMessage(
            chatId,
            `🔍 *Search Order Receipts*\n\nUsage: \`/search <receipt_id or customer>\`\nExample: \`/search 7608\`\n\nOr type @Starfastionbot in any message box to use the instant search bar!`
          );
        } else {
          const { data: orders } = await supabaseAdmin
            .from('orders')
            .select('*')
            .or(`id.ilike.%${query}%,telegram_name.ilike.%${query}%,telegram_phone.ilike.%${query}%`)
            .limit(5);

          if (!orders || orders.length === 0) {
            await sendTelegramTextMessage(chatId, `❌ No receipt found matching "*${query}*".`);
          } else {
            for (const o of orders) {
              const shortId = o.id.slice(0, 8).toUpperCase();
              const statusEmoji = o.status === 'approved' ? '✅' : o.status === 'rejected' ? '❌' : '⏳';
              const items = Array.isArray(o.items) ? o.items : [];
              const itemsSummary = items.map((i: any) => `${i.qty}x ${i.name} ($${i.price})`).join('\n   • ');
              const msg = `🛍️ *RECEIPT SEARCH RESULT*
🔖 *Order ID:* \`#${shortId}\`
👤 *Customer:* @${o.telegram_name} | 📞 \`${o.telegram_phone}\`
📍 *Address:* ${o.address}
📦 *Items:*
   • ${itemsSummary}
💰 *Total:* *$${Number(o.total_price || 0).toFixed(2)}*
⚡ *Status:* ${statusEmoji} *${o.status.toUpperCase()}*`;

              const kb = {
                inline_keyboard: [
                  [
                    { text: '✅ Accept Order', callback_data: `approve_${o.id}` },
                    { text: '❌ Reject Order', callback_data: `reject_${o.id}` },
                  ],
                  [
                    { text: `💬 Chat with @${o.telegram_name}`, url: `https://t.me/${o.telegram_name.replace(/^@/, '')}` },
                  ]
                ]
              };

              const { botToken } = getTelegramConfig();
              if (items[0]?.image) {
                await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    photo: items[0].image,
                    caption: msg,
                    parse_mode: 'Markdown',
                    reply_markup: kb,
                  }),
                });
              } else {
                await sendTelegramTextMessage(chatId, msg);
              }
            }
          }
        }
        return NextResponse.json({ ok: true, action: 'search_completed' });
      }

      return NextResponse.json({ ok: true });
    }

    // 3. Handle Inline Search Queries (Live Search Bar)
    if (body.inline_query) {
      const inlineQuery = body.inline_query;
      const query = (inlineQuery.query || '').trim().toLowerCase();
      const { botToken } = getTelegramConfig();

      const { data: orders } = await supabaseAdmin
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const matched = (orders || []).filter((o: any) => {
        if (!query) return true;
        const shortId = o.id.slice(0, 8).toLowerCase();
        const fullId = o.id.toLowerCase();
        const customer = (o.telegram_name || '').toLowerCase();
        const phone = (o.telegram_phone || '').toLowerCase();
        return fullId.includes(query) || shortId.includes(query) || customer.includes(query) || phone.includes(query);
      }).slice(0, 10);

      const results = matched.map((o: any, idx: number) => {
        const shortId = o.id.slice(0, 8).toUpperCase();
        const statusEmoji = o.status === 'approved' ? '✅' : o.status === 'rejected' ? '❌' : '⏳';
        const items = Array.isArray(o.items) ? o.items : [];
        const itemsSummary = items.map((i: any) => `${i.qty}x ${i.name}`).join(', ');
        const title = `Receipt #${shortId} — $${Number(o.total_price || 0).toFixed(2)} (${o.status})`;
        const description = `Customer: @${o.telegram_name || 'customer'} | Items: ${itemsSummary || 'N/A'}`;
        const messageText = `🛍️ *STARFASHION ORDER RECEIPT*
🔖 *Order ID:* \`#${shortId}\`
👤 *Customer:* @${o.telegram_name || 'customer'} (📞 \`${o.telegram_phone || 'N/A'}\`)
📍 *Address:* ${o.address || 'N/A'}
📦 *Items:* ${itemsSummary || 'N/A'}
💰 *Total:* *$${Number(o.total_price || 0).toFixed(2)}*
⚡ *Status:* ${statusEmoji} *${(o.status || 'pending').toUpperCase()}*`;

        return {
          type: 'article',
          id: o.id || String(idx),
          title: title,
          description: description,
          thumb_url: items[0]?.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=200&auto=format&fit=crop',
          input_message_content: {
            message_text: messageText,
            parse_mode: 'Markdown',
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Accept Order', callback_data: `approve_${o.id}` },
                { text: '❌ Reject Order', callback_data: `reject_${o.id}` },
              ],
              [
                { text: `💬 Chat with @${o.telegram_name || 'customer'}`, url: `https://t.me/${(o.telegram_name || '').replace(/^@/, '')}` },
              ]
            ]
          }
        };
      });

      await fetch(`https://api.telegram.org/bot${botToken}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: inlineQuery.id,
          results: results,
          cache_time: 5,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    // 2. Handle button callback query (Approve / Reject)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data as string; // e.g. "approve_ord-12345" or "reject_ord-12345"
      const message = callbackQuery.message;
      const messageId = message?.message_id;
      const callbackChatId = message?.chat?.id;

      if (!data || !messageId) {
        return NextResponse.json({ ok: true });
      }

      const separatorIndex = data.indexOf('_');
      if (separatorIndex === -1) {
        return NextResponse.json({ ok: true });
      }

      const action = data.substring(0, separatorIndex);
      const orderId = data.substring(separatorIndex + 1);

      if (!action || !orderId) {
        return NextResponse.json({ ok: true });
      }

      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Update order status in database
      const { data: updatedOrder, error } = await supabaseAdmin
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()
        .single();

      if (error || !updatedOrder) {
        console.error('Failed to update order status via webhook:', error);
      }

      // Edit Telegram message text
      const originalText = message.text || '';
      const statusEmoji = newStatus === 'approved' ? '✅ APPROVED' : '❌ REJECTED';
      const adminName = callbackQuery.from?.username
        ? `@${callbackQuery.from.username}`
        : callbackQuery.from?.first_name || 'Admin';

      const actionTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      // Remove the action prompt and append decision banner
      const cleanedOriginal = originalText
        .replace(/⚡ \*Status:\* ⏳ \*PENDING APPROVAL\*/g, `⚡ *Status:* ${statusEmoji}`)
        .replace(/⚡ \*Current Status:\* ⏳ \*Pending Approval\*/g, `⚡ *Current Status:* ${statusEmoji}`)
        .replace(/Tap below to chat with the customer or approve\/reject this order:/g, '')
        .replace(/👇 \*ACTIONS FOR ADMIN:\*/g, '');

      const updatedText = `${cleanedOriginal.trim()}\n\n━━━━━━━━━━━━━━━━━━━━━\n⚡ *DECISION:* Order was *${statusEmoji}* by ${adminName} at ${actionTime}.`;

      await editTelegramMessageStatus(
        messageId,
        updatedText,
        callbackChatId,
        updatedOrder?.telegram_name
      );

      // Answer callback query with a toast alert in Telegram app
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: `Order #${orderId.slice(0, 8).toUpperCase()} was ${newStatus.toUpperCase()}!`,
          show_alert: false,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

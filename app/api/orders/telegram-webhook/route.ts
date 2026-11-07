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

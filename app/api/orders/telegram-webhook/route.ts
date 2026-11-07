import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { editTelegramMessageStatus } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.callback_query) {
      return NextResponse.json({ ok: true });
    }

    const callbackQuery = body.callback_query;
    const data = callbackQuery.data as string; // e.g. "approve_uuid" or "reject_uuid"
    const message = callbackQuery.message;
    const messageId = message?.message_id;

    if (!data || !messageId) {
      return NextResponse.json({ ok: true });
    }

    const [action, orderId] = data.split('_');

    if (!action || !orderId) {
      return NextResponse.json({ ok: true });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 1. Update order status in Supabase
    const { data: updatedOrder, error } = await supabaseAdmin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !updatedOrder) {
      console.error('Failed to update order status via webhook:', error);
      return NextResponse.json({ ok: true });
    }

    // 2. Edit Telegram message text
    const originalText = message.text || '';
    const statusEmoji = newStatus === 'approved' ? '✅ APPROVED' : '❌ REJECTED';
    const updatedText = `${originalText}\n\n*Status: ${statusEmoji}*`;

    await editTelegramMessageStatus(messageId, updatedText);

    // Answer callback query to remove loading state on telegram button
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY';
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
        text: `Order #${orderId.slice(0, 8).toUpperCase()} ${newStatus}!`,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

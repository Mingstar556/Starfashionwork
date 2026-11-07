import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramOrderNotification } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { telegram_name, telegram_phone, address, items, payment_method } = body;

    if (!telegram_name || !telegram_phone || !address || !items || !items.length || !payment_method) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const total_price = items.reduce(
      (sum: number, item: { price: number; qty: number }) => sum + item.price * item.qty,
      0
    );

    // 1. Insert order into Supabase with status 'pending'
    const { data: orderData, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          telegram_name: telegram_name.replace(/^@/, ''),
          telegram_phone,
          address,
          items,
          total_price,
          payment_method,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError || !orderData) {
      console.error('Supabase order insert error:', dbError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    // 2. Send Telegram notification
    const telegramMessageId = await sendTelegramOrderNotification({
      id: orderData.id,
      telegram_name: orderData.telegram_name,
      telegram_phone: orderData.telegram_phone,
      address: orderData.address,
      items: orderData.items,
      total_price: orderData.total_price,
      payment_method: orderData.payment_method,
    });

    // 3. Update order with telegram_message_id if sent successfully
    if (telegramMessageId) {
      await supabaseAdmin
        .from('orders')
        .update({ telegram_message_id: telegramMessageId })
        .eq('id', orderData.id);
    }

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

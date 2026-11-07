import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTelegramOrderNotification } from '@/lib/telegram';
import { createOrderSchema, logSecurityEvent, sanitizeInput } from '@/lib/security';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || typeof id !== 'string' || id.length > 100) {
      return NextResponse.json({ error: 'Valid Order ID is required' }, { status: 400 });
    }
    const { data: orderData, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !orderData) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(orderData);
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Strict Zod Validation & Mass-Assignment Prevention
    const validationResult = createOrderSchema.safeParse(body);
    if (!validationResult.success) {
      logSecurityEvent('ORDER_VALIDATION_FAILED', { issues: validationResult.error.issues, body });
      return NextResponse.json(
        { error: 'Security Validation Failed: Invalid order payload or unexpected fields.', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { telegram_name, telegram_phone, address, items, payment_method } = validationResult.data;

    // Server-Side Authoritative Pricing & Paygate Tampering Prevention
    let calculated_total = 0;
    const { readDB } = await import('@/lib/db');
    const db = readDB();

    const verifiedItems = items.map((item) => {
      const catalogProduct = db.products?.find((p) => p.id === item.id);
      const realPrice = catalogProduct ? Number(catalogProduct.price) : Number(item.price);

      if (catalogProduct && Math.abs(Number(catalogProduct.price) - Number(item.price)) > 0.001) {
        logSecurityEvent('PAYGATE_PRICE_TAMPERING_INTERCEPTED', {
          itemId: item.id,
          submittedPrice: item.price,
          authoritativePrice: catalogProduct.price,
        });
      }

      const qty = Number(item.qty);
      if (isNaN(realPrice) || realPrice <= 0 || isNaN(qty) || qty <= 0) {
        throw new Error('Invalid item price or quantity');
      }

      calculated_total += realPrice * qty;

      const productImage =
        (catalogProduct && catalogProduct.images && catalogProduct.images[0]) ||
        item.image ||
        '';

      return {
        ...item,
        name: catalogProduct ? catalogProduct.name : sanitizeInput(item.name),
        price: realPrice,
        image: productImage,
      };
    });

    if (calculated_total <= 0) {
      return NextResponse.json({ error: 'Paygate Security Violation: Total amount must be positive.' }, { status: 400 });
    }

    // Sanitize user inputs
    const sanitizedName = sanitizeInput(telegram_name).replace(/^@/, '');
    const sanitizedPhone = sanitizeInput(telegram_phone);
    const sanitizedAddress = sanitizeInput(address);

    // 1. Insert order into database with status 'pending'
    const { data: orderData, error: dbError } = await supabaseAdmin
      .from('orders')
      .insert([
        {
          telegram_name: sanitizedName,
          telegram_phone: sanitizedPhone,
          address: sanitizedAddress,
          items: verifiedItems,
          total_price: calculated_total,
          payment_method,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (dbError || !orderData) {
      console.error('Supabase order insert error:', dbError);
      return NextResponse.json({ error: 'Failed to create order in secure database' }, { status: 500 });
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

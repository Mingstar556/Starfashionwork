import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.orders);
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, tracking_number, shipping_carrier, shipping_status } = body;
    const db = readDB();
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    if (status) order.status = status;
    if (tracking_number !== undefined) order.tracking_number = tracking_number;
    if (shipping_carrier !== undefined) order.shipping_carrier = shipping_carrier;
    if (shipping_status !== undefined) order.shipping_status = shipping_status;

    writeDB(db);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, telegram_name, telegram_phone, address, status, tracking_number, shipping_carrier, shipping_status, total_price } = body;
    const db = readDB();
    const order = db.orders.find((o) => o.id === id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    if (telegram_name !== undefined) order.telegram_name = telegram_name;
    if (telegram_phone !== undefined) order.telegram_phone = telegram_phone;
    if (address !== undefined) order.address = address;
    if (status !== undefined) order.status = status;
    if (tracking_number !== undefined) order.tracking_number = tracking_number;
    if (shipping_carrier !== undefined) order.shipping_carrier = shipping_carrier;
    if (shipping_status !== undefined) order.shipping_status = shipping_status;
    if (total_price !== undefined) order.total_price = Number(total_price);

    writeDB(db);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

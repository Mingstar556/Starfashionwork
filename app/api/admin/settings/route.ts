import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.store_settings);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDB();
    db.store_settings = {
      ...db.store_settings,
      ...body,
      updated_at: new Date().toISOString(),
    };
    writeDB(db);
    return NextResponse.json({ success: true, settings: db.store_settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

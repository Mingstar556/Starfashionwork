import { NextResponse } from 'next/server';
import { readDB } from '@/lib/db';

export async function GET() {
  try {
    const db = readDB();
    const settings = db.store_settings || {
      id: 'main',
      banner_images: [],
      announcement_text: '',
      is_store_open: true,
    };
    // Return only public storefront settings (do not leak admin telegram chat ID or bot token)
    return NextResponse.json({
      id: settings.id,
      banner_images: settings.banner_images || [],
      announcement_text: settings.announcement_text || '',
      is_store_open: settings.is_store_open ?? true,
      categories: settings.categories || ['Starboy', 'Old Money', 'Streetwear', 'Casual'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

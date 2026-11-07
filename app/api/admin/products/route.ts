import { NextResponse } from 'next/server';
import { readDB, writeDB, Product } from '@/lib/db';

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.products);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = readDB();

    // Handle bulk upload if array or bulk property
    const items = Array.isArray(body) ? body : body.bulk ? body.items : [body];
    const createdProducts: Product[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const newProduct: Product = {
        id: 'prod-' + (Date.now() + i),
        name: item.name || 'New Product',
        description: item.description || '',
        price: Number(item.price) || 0,
        cost_price: Number(item.cost_price) || Number(item.price) * 0.5 || 0,
        category: item.category || 'streetwear',
        images: item.images || ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop'],
        sizes: item.sizes || ['S', 'M', 'L', 'XL'],
        stock: Number(item.stock) || 10,
        is_featured: Boolean(item.is_featured),
        created_at: new Date().toISOString(),
      };
      db.products.unshift(newProduct);
      createdProducts.push(newProduct);
    }

    writeDB(db);
    return NextResponse.json({ success: true, count: createdProducts.length, products: createdProducts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const db = readDB();
    const index = db.products.findIndex((p) => p.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    db.products[index] = {
      ...db.products[index],
      ...body,
      price: Number(body.price) ?? db.products[index].price,
      cost_price: Number(body.cost_price) ?? db.products[index].cost_price,
      stock: Number(body.stock) ?? db.products[index].stock,
    };
    writeDB(db);
    return NextResponse.json({ success: true, product: db.products[index] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const db = readDB();
    db.products = db.products.filter((p) => p.id !== id);
    writeDB(db);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost_price?: number;
  category: string;
  images: string[];
  sizes: string[];
  stock: number;
  is_featured: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  telegram_name: string;
  telegram_phone: string;
  address: string;
  items: any[];
  total_price: number;
  payment_method: string;
  status: 'pending' | 'approved' | 'rejected';
  tracking_number?: string;
  shipping_carrier?: string;
  shipping_status?: 'processing' | 'shipped' | 'out_for_delivery' | 'delivered';
  telegram_message_id?: number;
  created_at: string;
}

export interface StoreSettings {
  id: string;
  banner_images: string[];
  announcement_text: string;
  is_store_open: boolean;
  categories?: string[];
  admin_telegram_chat_id?: string;
  telegram_bot_token?: string;
  updated_at?: string;
}

export interface DBData {
  products: Product[];
  orders: Order[];
  store_settings: StoreSettings;
}

export function readDB(): DBData {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const defaultData: DBData = {
        products: [],
        orders: [],
        store_settings: {
          id: 'main',
          banner_images: [],
          announcement_text: '⚡ WELCOME TO STARFASHION',
          is_store_open: true,
        },
      };
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading DB:', error);
    return {
      products: [],
      orders: [],
      store_settings: { id: 'main', banner_images: [], announcement_text: '', is_store_open: true },
    };
  }
}

export function writeDB(data: DBData): void {
  try {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

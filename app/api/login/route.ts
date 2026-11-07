import { NextRequest } from 'next/server';
import { POST as adminLoginPost } from '@/app/api/admin/login/route';

export async function POST(req: NextRequest) {
  return adminLoginPost(req);
}

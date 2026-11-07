import dns from 'node:dns';
import net from 'node:net';
try {
  dns.setDefaultResultOrder?.('ipv4first');
  net.setDefaultAutoSelectFamily?.(false);
} catch {}

import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const adminRoot = fs.existsSync(path.join(projectRoot, 'admin'))
  ? path.join(projectRoot, 'admin')
  : path.join(projectRoot, 'Starfashion admin');
const envPath = path.join(projectRoot, '.env.local');
const adminEnvPath = path.join(adminRoot, '.env.local');

// 1. Proactively clear any leftover zombie processes on ports 3000 & 3001
try {
  execSync('fuser -k 3000/tcp 3001/tcp 2>/dev/null || true', { stdio: 'ignore' });
} catch {}

// 2. Ensure storefront .env.local exists
if (!fs.existsSync(envPath)) {
  const envContent = `PORT=3000
TELEGRAM_BOT_TOKEN=9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY
TELEGRAM_CHAT_ID=
ADMIN_PASSWORD=starfashion2026
NEXT_PUBLIC_KHQR_IMAGE_URL=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop
`;
  fs.writeFileSync(envPath, envContent, 'utf8');
}

// 3. Ensure admin .env.local exists with PORT=3001
if (fs.existsSync(adminRoot) && !fs.existsSync(adminEnvPath)) {
  const adminEnvContent = `PORT=3001
ADMIN_PASSWORD=starfashion2026
TELEGRAM_BOT_TOKEN=9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY
TELEGRAM_CHAT_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
`;
  fs.writeFileSync(adminEnvPath, adminEnvContent, 'utf8');
}

console.log('\n================================================================');
console.log('🌟 STARFASHION DUAL-PORT TEST ENVIRONMENT');
console.log('================================================================');
console.log('🛍️  Storefront:     http://localhost:3000  (Port: 3000)');
console.log('🔐 Admin Portal:   http://localhost:3001  (Port: 3001 | Password: starfashion2026)');
console.log('🤖 Telegram Bot:   https://t.me/Starfastionbot (@Starfastionbot)');
console.log('----------------------------------------------------------------');
console.log('💡 Both portals run simultaneously without port collision:');
console.log('   • Storefront customers browse on port 3000');
console.log('   • Store admin manages orders/inventory on port 3001');
console.log('   • Telegram orders and test receipts delivered in real-time');
console.log('================================================================\n');

// 4. Start Telegram Bot Runner
const botProcess = spawn('node', ['scripts/telegram-bot-runner.mjs'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

// 5. Start Storefront Server on Port 3000
const storeProcess = spawn('npx', ['next', 'dev', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

// 6. Start Admin Server on Port 3001 (if directory exists)
let adminProcess = null;
if (fs.existsSync(adminRoot)) {
  adminProcess = spawn('npx', ['next', 'dev', '-p', '3001', '-H', '0.0.0.0'], {
    cwd: adminRoot,
    stdio: 'inherit',
  });
}

function cleanup() {
  console.log('\nGracefully shutting down all StarFashion test environment servers...');
  try {
    botProcess.kill();
    storeProcess.kill();
    if (adminProcess) adminProcess.kill();
    execSync('fuser -k 3000/tcp 3001/tcp 2>/dev/null || true', { stdio: 'ignore' });
  } catch {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

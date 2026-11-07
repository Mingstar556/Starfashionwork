import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env.local');

// 1. Ensure .env.local exists with bot token
if (!fs.existsSync(envPath)) {
  const envContent = `# Telegram Bot Integration
TELEGRAM_BOT_TOKEN=9030995366:AAEHWxM0u8mzNIUnDutvhUOiZYOSPn8OmoY
TELEGRAM_CHAT_ID=

# Admin Panel Authentication
ADMIN_PASSWORD=starfashion2026

# Payment & QR Settings
NEXT_PUBLIC_KHQR_IMAGE_URL=https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop
`;
  fs.writeFileSync(envPath, envContent, 'utf8');
  console.log('✅ Created .env.local with Telegram Bot configuration.');
}

console.log('\n================================================================');
console.log('🌟 STARTING STARFASHION TEST ENVIRONMENT');
console.log('================================================================');
console.log('• Storefront:   http://localhost:3000');
console.log('• Admin Panel:  http://localhost:3000/admin  (Password: starfashion2026)');
console.log('• Telegram Bot: https://t.me/Starfastionbot (@Starfastionbot)');
console.log('----------------------------------------------------------------');
console.log('👉 Step 1: Open @Starfastionbot on Telegram and send "/start"');
console.log('👉 Step 2: Add any item to cart and checkout on http://localhost:3000');
console.log('👉 Step 3: Approve or Reject the order right from Telegram!');
console.log('================================================================\n');

// 2. Start Telegram Bot Runner
const botProcess = spawn('node', ['scripts/telegram-bot-runner.mjs'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

// 3. Start Next.js Dev Server
const nextProcess = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: projectRoot,
  stdio: 'inherit',
});

function cleanup() {
  console.log('\nShutting down StarFashion test environment...');
  botProcess.kill();
  nextProcess.kill();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

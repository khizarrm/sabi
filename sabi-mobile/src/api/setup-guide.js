#!/usr/bin/env node

/**
 * 🚀 Sabi Mobile API Setup Guide
 * 
 * Run this script to get step-by-step setup instructions for your co-founder.
 * 
 * Usage: node src/api/setup-guide.js
 */

const chalk = require('chalk');

console.log(chalk.blue.bold('\n🚀 SABI MOBILE API SETUP GUIDE\n'));

console.log(chalk.yellow('📋 SETUP CHECKLIST:'));
console.log('');

console.log(chalk.green('✅ REQUIRED STEPS:'));
console.log('1. Update backend URL in src/api/config.ts');
console.log('2. Install Stripe: npm install @stripe/stripe-react-native');
console.log('3. Install notifications: expo install expo-notifications expo-device');
console.log('4. Install Supabase: npm install @supabase/supabase-js');
console.log('');

console.log(chalk.blue('🔧 CONFIGURATION NEEDED:'));
console.log('');

console.log(chalk.cyan('📡 Backend Configuration:'));
console.log('- Update API_CONFIG.BASE_URL in src/api/config.ts');
console.log('- For local dev: http://YOUR_IP_ADDRESS:3000');
console.log('- For production: https://your-backend-url.com');
console.log('');

console.log(chalk.cyan('💳 Stripe Configuration:'));
console.log('- Get publishable key from Stripe dashboard');
console.log('- Wrap app with StripeProvider in App.tsx');
console.log('- Add URL scheme to app.json for iOS');
console.log('');

console.log(chalk.cyan('🔔 Notification Configuration:'));
console.log('- Set up Firebase project');
console.log('- Add notification settings to app.json');
console.log('- Configure FCM for iOS/Android');
console.log('');

console.log(chalk.cyan('🔐 Supabase Configuration:'));
console.log('- Get Supabase URL and anon key');
console.log('- Implement auth functions in authUtils.ts');
console.log('- Set up auth state management');
console.log('');

console.log(chalk.magenta('🎯 QUICK START EXAMPLE:'));
console.log('');
console.log(chalk.gray(`// Import API functions
import { createTask, acceptTask, setupNotifications } from '@/src/api';

// Create a task
const result = await createTask({
  customerId: user.id,
  title: 'Fix my sink',
  description: 'Kitchen sink needs repair',
  taskAddress: '123 Main St',
  fixedPrice: 50
});

if (result.success) {
  console.log('Task created:', result.data.task.id);
}

// Accept a task
const acceptResult = await acceptTask(taskId, userId);

// Setup notifications
await setupNotifications(user.id);`));

console.log('');
console.log(chalk.yellow('📚 DOCUMENTATION:'));
console.log('- Read src/api/README.md for complete documentation');
console.log('- Check src/api/index.ts for all available functions');
console.log('- Look at UsageExamples in src/api/index.ts');
console.log('');

console.log(chalk.red('🚨 IMPORTANT NOTES:'));
console.log('- Use your computer\'s IP address, not localhost, for device testing');
console.log('- Make sure backend server is running before testing');
console.log('- All functions return { success, data?, error? } format');
console.log('- Always check result.success before using result.data');
console.log('');

console.log(chalk.green.bold('🎉 You\'re ready to build! Good luck with the hackathon! 🏆'));
console.log('');

// Check if chalk is available
try {
  require('chalk');
} catch (e) {
  console.log('\n💡 TIP: Install chalk for better console output: npm install chalk\n');
}

# Firebase Cloud Messaging (FCM) Setup Guide

## 🚀 Quick Setup for Hackathon

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "sabi-hackathon")
4. Disable Google Analytics (not needed for hackathon)
5. Click "Create project"

### 2. Generate Service Account Key
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. Extract the following values from the JSON:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id-here",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  // ... other fields
}
```

### 3. Environment Variables
Create `.env.local` in your project root with:

```bash
# Supabase (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=key-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key_here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Test the Setup
You can test FCM by calling the notify-available endpoint:

```bash
curl -X POST http://localhost:3000/api/tasks/notify-available \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-task-id",
    "title": "Test Task",
    "description": "This is a test task",
    "fixedPrice": 50,
    "taskAddress": "123 Test St",
    "customerId": "test-customer-id"
  }'
```

## 📱 Mobile App Integration (Next Steps)

For React Native, you'll need to:

1. **Install FCM SDK**:
   ```bash
   npx expo install expo-notifications expo-device
   ```

2. **Get FCM Token** in your app:
   ```javascript
   import * as Notifications from 'expo-notifications';
   
   const token = await Notifications.getExpoPushTokenAsync();
   // Store this token in your users table (push_token field)
   ```

3. **Handle Notifications**:
   ```javascript
   Notifications.setNotificationHandler({
     handleNotification: async () => ({
       shouldShowAlert: true,
       shouldPlaySound: true,
       shouldSetBadge: true,
     }),
   });
   ```

## 🧪 Testing Without Mobile App

For hackathon demo, you can:

1. **Insert test user with fake token**:
   ```sql
   INSERT INTO users (phone_number, first_name, last_name, is_available, push_enabled, push_token, device_type)
   VALUES ('+1234567890', 'Test', 'User', true, true, 'fake_token_for_testing', 'android');
   ```

2. **Check console logs** to see FCM calls being made

3. **Monitor response** to see notification success/failure counts

## ⚠️ Important Notes

- **Private Key**: Make sure to escape newlines in FIREBASE_PRIVATE_KEY
- **Token Validation**: The system automatically validates and cleans up invalid tokens
- **Rate Limits**: FCM has rate limits, but you're unlikely to hit them in a hackathon
- **Security**: Never commit your `.env.local` file to git

## 🔧 Troubleshooting

**"Invalid credentials"**: Check your service account JSON is correct
**"Token not registered"**: Normal for fake tokens, ignore during testing
**"Private key error"**: Make sure newlines are escaped: `\\n` → `\n`

You're all set! 🎉

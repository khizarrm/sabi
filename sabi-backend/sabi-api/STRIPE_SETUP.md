# Stripe Payment Integration Setup

## 🚀 Quick Setup for Hackathon

### 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com)
2. Sign up for a free account
3. Go to **Developers** → **API Keys**

### 2. Get Your API Keys
You'll need these from your Stripe Dashboard:

```bash
# Test Mode Keys (use these for development)
Publishable key: pk_test_xxxxxxxxxxxxx
Secret key: sk_test_xxxxxxxxxxxxx
```

### 3. Environment Variables
Add these to your `.env.local` file:

```bash
# Existing Supabase vars
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Firebase vars (if set up)
FIREBASE_PROJECT_ID=your_project_id
# ... other firebase vars

# NEW: Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

## 🧪 Testing the Integration

### 1. Install Dependencies
```bash
npm install
```

### 2. Test Payment Flow
Use these test card numbers in Stripe:

```
# Successful payment
4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)

# Payment requires authentication
4000 0025 0000 3155

# Payment is declined
4000 0000 0000 9995
```

### 3. API Endpoints Working:
- ✅ `POST /api/tasks/accept` - Creates Stripe payment intent
- ✅ `POST /api/tasks/confirm-complete` - Captures payment
- ✅ `POST /api/payments/create-intent` - Manual payment intent creation

## 💰 Payment Flow

### Uber-Style Authorization → Capture:
1. **Task Accepted** → Stripe creates payment intent with `capture_method: 'manual'`
2. **Task Completed** → Customer approves → Stripe captures payment
3. **Task Cancelled** → Stripe cancels payment intent (no charge)

## 🔧 What's Integrated

### Real Stripe Features:
- ✅ **Payment Intents** with manual capture
- ✅ **Authorization hold** (like Uber)
- ✅ **Capture on completion** (money moves)
- ✅ **Cancel on dispute** (no charge)
- ✅ **Metadata tracking** (taskId, customerId, etc.)

### Database Integration:
- ✅ **task_payments** table stores Stripe payment intent IDs
- ✅ **Real earnings** calculation for taskers
- ✅ **Payment status** tracking (authorized → captured)

## 🎯 For Production

### Switch to Live Mode:
1. Get live API keys from Stripe
2. Update environment variables
3. Set up webhooks for payment confirmations
4. Add more robust error handling

### Additional Features:
- Payment method collection on signup
- Saved payment methods
- Refund processing
- Payment failure handling

## ⚠️ Important Notes

- **Test mode only**: No real money moves in test mode
- **Webhooks**: Not implemented (not needed for hackathon)
- **Error handling**: Graceful degradation if Stripe fails
- **Security**: Never expose secret keys in frontend code

You're all set for real payment processing! 🎉

# Sabi Backend Documentation

The **Sabi Backend** is a Next.js API server that powers a job/task marketplace app where customers post tasks and taskers can accept and complete them. It follows an Uber-style model with real-time notifications and integrated payments.

## Architecture Overview

### Core Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (with authorization/capture flow)
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Language**: TypeScript

### Key Features
- Uber-style task acceptance (first-come-first-served)
- Real-time push notifications via FCM
- Stripe payment authorization/capture (hold → charge)
- Task status management and workflow
- Atomic database operations to prevent race conditions

## Project Structure

```
sabi-backend/
├── sabi-api/                 # Main Next.js API application
│   ├── app/
│   │   └── api/
│   │       ├── payments/
│   │       │   └── create-intent/    # Manual payment intent creation
│   │       └── tasks/
│   │           ├── create/           # Create new tasks
│   │           ├── accept/           # Accept tasks (Uber-style)
│   │           ├── notify-available/ # Notify taskers of new tasks
│   │           ├── start/            # Start working on task
│   │           ├── arrived/          # Mark arrival at location
│   │           ├── complete/         # Mark task complete
│   │           ├── confirm-complete/ # Customer confirms & payment capture
│   │           └── cancel/           # Cancel tasks
│   ├── lib/
│   │   ├── fcm.ts               # Firebase Cloud Messaging utilities
│   │   └── stripe.ts            # Stripe payment utilities
│   └── package.json
├── package.json                 # Root dependencies (Supabase)
├── FCM_SETUP.md                # Firebase setup guide
└── STRIPE_SETUP.md             # Stripe integration guide
```

## API Endpoints

### Task Management

#### **POST** `/api/tasks/create`
Creates a new task and notifies all available taskers.

**Request Body:**
```json
{
  "customerId": "uuid",
  "title": "Fix my leaky faucet",
  "description": "Kitchen faucet has been dripping for 2 days...",
  "taskAddress": "123 Main St, Anytown, USA", 
  "fixedPrice": 75,
  "taskType": "on_demand", // optional
  "preferredStartTime": "2024-01-01T10:00:00Z", // optional
  "preferredEndTime": "2024-01-01T12:00:00Z" // optional
}
```

**Response:**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "task-uuid",
    "title": "Fix my leaky faucet",
    "status": "posted",
    "fixed_price": 75
  },
  "notifications": {
    "sent": 15,
    "total_available_users": 20,
    "users_with_valid_tokens": 15
  }
}
```

#### **POST** `/api/tasks/accept`
Accept a task (Uber-style, first-come-first-served). Creates Stripe payment authorization.

**Request Body:**
```json
{
  "taskId": "task-uuid",
  "taskerId": "tasker-uuid"
}
```

**Key Features:**
- Atomic database operation prevents race conditions
- Only updates if task is still `posted` and `tasker_id` is null
- Creates Stripe payment intent with `capture_method: 'manual'`
- Notifies customer and other taskers
- Returns 409 Conflict if task already taken

#### **POST** `/api/tasks/notify-available`
Notify all available taskers about a new task.

**Features:**
- Filters users by `is_available`, `is_active`, `push_enabled`
- Excludes task creator from notifications
- Creates both FCM push notifications and in-app notifications
- Automatically cleans up invalid FCM tokens

### Payment Integration

#### **POST** `/api/payments/create-intent`
Manually create a Stripe payment intent.

**Stripe Flow:**
1. **Authorization**: Payment intent created with `capture_method: 'manual'`
2. **Hold**: Customer's card is authorized but not charged
3. **Capture**: When task confirmed complete, payment is captured
4. **Cancel**: If task cancelled, authorization is released

## Core Libraries

### `/lib/stripe.ts`
Stripe payment utilities with Uber-style authorization/capture flow.

**Key Functions:**
- `createPaymentIntent()` - Create payment intent with manual capture
- `capturePaymentIntent()` - Capture authorized payment
- `cancelPaymentIntent()` - Cancel authorization
- `getPaymentIntent()` - Retrieve payment details

### `/lib/fcm.ts`
Firebase Cloud Messaging for push notifications.

**Key Functions:**
- `sendFCMNotification()` - Send single push notification
- `sendBulkFCMNotifications()` - Send to multiple users in parallel
- `isValidFCMToken()` - Validate FCM token format

## Database Schema

### Key Tables (Supabase)

#### `tasks`
```sql
- id (uuid, primary key)
- customer_id (uuid, references users.id)
- tasker_id (uuid, references users.id, nullable)
- title (text)
- description (text)
- task_address (text)
- budget_min/budget_max (numeric) -- Used as fixed_price
- status (enum: posted, assigned, in_progress, completed, cancelled)
- task_type (enum: on_demand, scheduled)
- preferred_start_time/end_time (timestamp, nullable)
- created_at/updated_at (timestamp)
```

#### `users`
```sql
- id (uuid, primary key)
- phone_number (text, unique)
- first_name/last_name (text)
- is_available (boolean) -- Can accept new tasks
- is_active (boolean) -- Account active
- push_enabled (boolean)
- push_token (text) -- FCM token
- device_type (enum: ios, android)
- current_latitude/longitude (numeric, nullable)
```

#### `task_payments`
```sql
- id (uuid, primary key)
- task_id (uuid, references tasks.id)
- amount_held (numeric)
- status (enum: authorized, captured, cancelled)
- stripe_payment_intent_id (text)
- created_at (timestamp)
```

#### `notifications`
```sql
- id (uuid, primary key) 
- user_id (uuid, references users.id)
- title (text)
- message (text)
- notification_type (text)
- related_task_id (uuid, nullable)
- is_read (boolean)
- created_at (timestamp)
```

## Task Workflow

1. **Posted** → Customer creates task via `/api/tasks/create`
2. **Notify** → All available taskers get push notifications
3. **Assigned** → First tasker to accept gets the task (atomic operation)
4. **Payment Hold** → Stripe authorizes customer's payment method
5. **In Progress** → Tasker starts work, optionally marks "arrived"
6. **Completed** → Tasker marks task complete
7. **Confirmed** → Customer confirms completion → Stripe captures payment
8. **Cancelled** → Either party cancels → Stripe releases authorization

## Environment Variables

### Required for Development
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# Firebase (FCM)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=key_id_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
```

## Development Setup

1. **Install Dependencies**
```bash
cd sabi-backend/sabi-api
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env.local
# Fill in your Supabase, Stripe, and Firebase credentials
```

3. **Run Development Server**
```bash
npm run dev
```

4. **Test API Endpoints**
```bash
curl -X POST http://localhost:3000/api/tasks/create \
  -H "Content-Type: application/json" \
  -d '{"customerId":"test-id","title":"Test Task","description":"Test","taskAddress":"123 Test St","fixedPrice":50}'
```

## Production Considerations

### Security
- Service role keys are used for admin database operations
- Stripe secret keys never exposed to frontend
- FCM private keys properly escaped and secured
- Input validation on all endpoints

### Scalability
- Atomic database operations prevent race conditions
- Bulk notification sending for efficiency
- Automatic cleanup of invalid FCM tokens
- Graceful fallbacks when external services fail

### Monitoring
- Comprehensive console logging for debugging
- Error handling with appropriate HTTP status codes
- Failed notification tracking and token cleanup

## Integration Points

### Mobile App
- Mobile app should integrate with FCM for push notifications
- Use Expo notifications: `expo install expo-notifications expo-device`
- Store FCM tokens in users table `push_token` field

### Frontend/Dashboard
- Can consume same API endpoints for web interface
- Real-time updates via Supabase subscriptions
- Stripe Elements for payment method collection

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request** - Missing or invalid input
- **403 Forbidden** - Unauthorized access to resources
- **404 Not Found** - Task/user not found or inactive
- **409 Conflict** - Task already assigned (race condition)
- **500 Internal Server Error** - Database or external service errors

All operations are designed to fail gracefully, with non-critical failures (like notification sending) not blocking core functionality.
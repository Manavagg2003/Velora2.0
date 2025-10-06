# Velora - AI-Powered Cooking Companion

A comprehensive React Native/Expo application that combines intelligent recipe discovery, AI chat assistance, and a subscription-based coin system to create the ultimate cooking companion.

## Features

### Core Functionality

- **Email/Password Authentication**: Secure sign up and sign in using Supabase Auth
- **AI Chat Assistant**: Powered by Google Gemini AI for cooking questions, techniques, and advice (1 coin per message)
- **Recipe Discovery**: Advanced search by ingredients, cuisine, dietary restrictions, and mood
- **AI Recipe Generation**: Custom recipe creation based on available ingredients (3 coins per generation)
- **Subscription System**: Freemium model with four tiers (Free, Plus, Pro, Ultra)
- **Coin Management**: Complete tracking of coin balance, usage, and transactions

### User Experience

- **Modern UI**: Clean, intuitive interface with dark/light theme support
- **Responsive Design**: Optimized for mobile with smooth animations
- **Real-time Updates**: Live coin balance and subscription status
- **Secure Sessions**: Automatic token refresh and session management

## Tech Stack

### Frontend
- React Native with Expo SDK 54+
- Expo Router for file-based routing
- TypeScript for type safety
- Custom styling with theme system
- Context API for state management

### Backend & Services
- Supabase for database and authentication
- Google Gemini AI (gemini-2.0-flash-exp) for chat and recipe generation
- Razorpay for payment processing
- Row Level Security (RLS) for data protection

## Project Structure

```
velora/
├── app/
│   ├── (tabs)/           # Main tab navigation
│   │   ├── index.tsx     # Home screen
│   │   ├── chat.tsx      # AI chat interface
│   │   ├── recipes.tsx   # Recipe discovery
│   │   └── profile.tsx   # User profile & settings
│   ├── auth/
│   │   └── login.tsx     # Authentication screen
│   ├── _layout.tsx       # Root layout with providers
│   └── index.tsx         # Entry point
├── components/           # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── CoinBalance.tsx
│   └── RecipeCard.tsx
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   ├── ProfileContext.tsx
│   └── ThemeContext.tsx
├── services/            # Business logic services
│   ├── ai.service.ts
│   ├── chat.service.ts
│   ├── recipe.service.ts
│   └── payment.service.ts
├── lib/
│   └── supabase.ts      # Supabase client config
└── types/
    └── database.ts      # TypeScript definitions
```

## Architecture Overview

### Database Schema

The application uses the following Supabase tables:

#### profiles
User profile with coin balance and subscription details

#### recipe_cache
Stores discovered and AI-generated recipes

#### saved_recipes
User's bookmarked/favorite recipes

#### chat_conversations
AI chat history with conversation threads

#### coin_transactions
Complete audit trail of all coin usage

#### user_preferences
Dietary restrictions, allergies, and user settings

#### analytics_events
Tracks user actions and AI usage for monitoring

### Edge Functions (Server-Side)

The app uses Supabase Edge Functions to keep secrets secure and handle server-side logic:

#### gemini-proxy
- **Purpose**: Securely calls Google Gemini AI API
- **Features**:
  - Rate limiting (5 calls/minute per user)
  - Atomic coin deduction (1 coin for chat, 3 for recipe generation)
  - Context-aware prompt engineering
  - Error handling and retry logic
  - Analytics event logging
- **Security**: API key never exposed to client

#### razorpay-verify
- **Purpose**: Verifies Razorpay payment signatures
- **Features**:
  - HMAC signature verification
  - Atomic coin granting
  - Subscription tier updates
  - Payment analytics tracking
- **Security**: Razorpay secret never exposed to client

### Atomic Operations

The app uses PostgreSQL stored procedures for atomic coin operations:

- `charge_user_coins(user_id, amount, type, description)` - Deducts coins with balance check
- `grant_user_coins(user_id, amount, type, description)` - Adds coins with transaction record
- `reset_monthly_coins()` - Resets coins monthly based on subscription tier

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Supabase account with CLI installed
- Google AI API key (Gemini)
- Razorpay account (for payments)

### Step 1: Clone and Install

```bash
npm install
```

### Step 2: Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migrations** in your Supabase SQL Editor:
   - Open `database-schema.sql` and execute it
   - Open `supabase/migrations/20251006043545_create_velora_schema.sql` and execute it
   - Open `supabase/migrations/20251006060000_add_analytics_and_coin_functions.sql` and execute it

3. **Configure Authentication**:
   - Go to Authentication > Settings in Supabase Dashboard
   - **Enable Email/Password authentication**
   - **Disable email confirmations** (or configure SMTP for production)
   - Set password requirements (minimum 6 characters)

4. **Get your Supabase credentials**:
   - Project URL: Settings > API > Project URL
   - Anon Key: Settings > API > Project API keys > anon public
   - Service Role Key: Settings > API > Project API keys > service_role (keep secure!)

### Step 3: Deploy Edge Functions

The app uses two Supabase Edge Functions for secure server-side operations:

1. **Deploy gemini-proxy function**:
```bash
supabase functions deploy gemini-proxy
```

2. **Deploy razorpay-verify function**:
```bash
supabase functions deploy razorpay-verify
```

3. **Set Edge Function secrets**:
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-api-key
supabase secrets set RAZORPAY_KEY_SECRET=your-razorpay-secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 4: Environment Variables

Create a `.env` file in the project root (use `.env.example` as template):

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key-here

# Edge Function URLs
EXPO_PUBLIC_GEMINI_PROXY_URL=https://your-project.supabase.co/functions/v1/gemini-proxy
EXPO_PUBLIC_RAZORPAY_VERIFY_URL=https://your-project.supabase.co/functions/v1/razorpay-verify

# Razorpay Configuration
EXPO_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# App Configuration
EXPO_PUBLIC_APP_NAME=Velora
```

**Important Security Notes**:
- NEVER commit your `.env` file to version control
- Service role keys must ONLY be stored in Edge Function secrets
- Razorpay secret must ONLY be stored in Edge Function secrets
- Client code should only use public/anon keys

### Step 5: Get API Keys

#### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Create a new API key
3. Add it to your `.env` file and Edge Function secrets

#### Razorpay Keys
1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your Key ID and Key Secret from Dashboard
3. Use **Test keys** for development
4. Add Key ID to `.env` and Key Secret to Edge Function secrets

### Step 6: Run the App

**Development**:
```bash
npm run dev
```

**Type checking**:
```bash
npm run typecheck
```

**Web build**:
```bash
npm run build:web
```

### Step 7: Testing Payments (Development)

For testing Razorpay payments in development:

1. Use Razorpay test keys
2. Test card numbers:
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
3. Use test mode in Razorpay dashboard
4. Payments will not actually charge real money

### Step 8: Mobile Development

For iOS/Android development:

1. Install Expo Go app on your device
2. Run `npm run dev`
3. Scan QR code with Expo Go
4. For production builds, use EAS Build:
```bash
npm install -g eas-cli
eas build
```

## Subscription Tiers

| Tier | Price | Coins/Month | Features |
|------|-------|-------------|----------|
| Free | $0 | 10 | Basic recipe search, Limited AI chat |
| Plus | $4.99 | 50 | Advanced search, AI recipe generation, Save favorites |
| Pro | $9.99 | 150 | Unlimited search, Priority AI, Meal planning |
| Ultra | $19.99 | 500 | All Pro features, Custom AI, Nutrition tracking |

## Coin Usage

- **AI Chat Message**: 1 coin per message
- **Recipe Generation**: 3 coins per recipe
- **Monthly Reset**: Coins refresh based on subscription tier

## Security Features

- Row Level Security (RLS) on all database tables
- Secure email/password authentication with Supabase
- Password validation (minimum 6 characters)
- Automatic session refresh
- Protected API routes
- No sensitive data in client code

## Key User Flows

### Authentication
1. New users click "Sign Up" and enter name, email, and password
2. Existing users sign in with email and password
3. Profile automatically created with 10 free coins on sign up
4. Secure session established with automatic refresh

### Recipe Generation
1. User enters ingredients or preferences
2. Confirms 3-coin cost
3. AI generates custom recipe with instructions
4. Recipe saved to user's collection

### AI Chat
1. User asks cooking question
2. Confirms 1-coin cost
3. AI provides contextual cooking advice
4. Conversation history maintained

## Performance Optimizations

- Efficient state management with Context API
- Optimized re-renders with React.memo
- Lazy loading for large datasets
- Image optimization with proper sizing
- Cached API responses

## Future Enhancements

- Offline recipe access
- Meal planning calendar
- Grocery list generation
- Social sharing features
- Recipe ratings and reviews
- Video cooking instructions
- Nutrition tracking dashboard
- Push notifications for reminders

## Testing

Run type checking:
```bash
npm run typecheck
```

## Troubleshooting

### Database Not Available
If you see database errors, you need to set up the Supabase schema first. The database migration includes all necessary tables, RLS policies, and triggers.

### AI API Errors
Ensure your Gemini API key is valid and has sufficient quota. The app uses the `gemini-2.0-flash-exp` model.

### Build Errors
If you encounter build errors, try:
```bash
rm -rf node_modules
npm install
```

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact the development team.

---

Built with ❤️ using React Native, Expo, and Supabase

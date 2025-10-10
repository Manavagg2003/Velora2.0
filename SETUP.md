# Velora Setup Guide

This guide will walk you through setting up the complete Velora app with all its features.

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- Supabase account
- Google AI Studio account
- Razorpay account

### 2. Clone and Install
```bash
git clone <repository-url>
cd velora
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Update `.env` with your credentials:
```env
EXPO_PUBLIC_SUPABASE_URL=https://kebsnpfrzlsnnbweasnx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYnNucGZyemxzbm5id2Vhc254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODcwNTAsImV4cCI6MjA3NDg2MzA1MH0.mB6e8MkCW4ViponlAfvNv8LfsiSqt2f_dZuZNBJX4co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 4. Start Development
```bash
npm run dev
```

## 🗄 Database Setup

The database is already configured with the complete schema. If you need to set it up from scratch:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the complete schema from `database-schema.sql`

The schema includes:
- ✅ All required tables with proper relationships
- ✅ Row Level Security (RLS) policies
- ✅ Atomic coin transaction functions
- ✅ Triggers for automatic profile creation
- ✅ Indexes for optimal performance

## 🤖 AI Setup (Google Gemini)

1. **Get API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Copy the key to your `.env` file

2. **Edge Function is Ready**:
   - The `gemini-proxy` Edge Function is already deployed
   - It handles all AI requests securely
   - Rate limiting: 5 requests per minute per user

## 💳 Payment Setup (Razorpay)

1. **Get API Keys**:
   - Sign up at [Razorpay](https://razorpay.com/)
   - Go to Settings > API Keys
   - Copy Key ID and Key Secret to your `.env` file

2. **Edge Function is Ready**:
   - The `razorpay-verify` Edge Function is already deployed
   - It handles payment verification securely
   - Supports all subscription tiers

## 📱 App Features

### ✅ Implemented Features

1. **Authentication**
   - Email/password sign up and sign in
   - Automatic profile creation
   - Session management with SecureStore

2. **AI Chat Assistant**
   - Gemini-powered cooking advice
   - Context-aware responses
   - Conversation history
   - 1 coin per message

3. **Recipe Generation**
   - Generate recipes from ingredients
   - Dietary and skill level adaptation
   - Recipe caching
   - 3 coins per generation

4. **VeloraCoins System**
   - Freemium model with 4 tiers
   - Atomic coin transactions
   - Real-time balance updates
   - Transaction history

5. **Payment Integration**
   - Razorpay checkout
   - Server-side verification
   - Subscription management
   - Automatic coin allocation

6. **Recipe Management**
   - Browse and search recipes
   - Save favorites
   - Rate recipes
   - Offline caching

7. **User Profiles**
   - Dietary preferences
   - Skill level settings
   - Theme preferences
   - Subscription status

8. **UI/UX**
   - Dark/light theme support
   - Responsive design
   - Smooth animations
   - Accessibility features

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Authentication flows
- Coin transactions
- AI service integration
- Payment verification

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Web
npm run build:web
```

## 🔧 Configuration

### Supabase Configuration
- ✅ Database schema deployed
- ✅ RLS policies configured
- ✅ Edge Functions deployed
- ✅ Authentication enabled

### Environment Variables
All required environment variables are documented in `.env.example`

### API Endpoints
- Gemini Proxy: `https://kebsnpfrzlsnnbweasnx.supabase.co/functions/v1/gemini-proxy`
- Razorpay Verify: `https://kebsnpfrzlsnnbweasnx.supabase.co/functions/v1/razorpay-verify`

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env` file
   - Ensure variables are prefixed with `EXPO_PUBLIC_`

2. **"Insufficient coins" error**
   - Check your coin balance
   - Verify subscription is active
   - Wait for monthly allocation

3. **AI responses not working**
   - Check Gemini API key
   - Verify Edge Function is deployed
   - Check rate limits

4. **Payment verification fails**
   - Check Razorpay keys
   - Verify webhook URL
   - Check Edge Function logs

### Debug Mode
Enable debug logging:
```bash
EXPO_DEBUG=1 npm run dev
```

## 📊 Monitoring

### Supabase Dashboard
- Monitor database performance
- View Edge Function logs
- Check authentication metrics

### Analytics
- User actions tracked in `analytics_events` table
- AI usage patterns
- Subscription metrics

## 🔐 Security

- ✅ All API keys stored server-side
- ✅ JWT authentication
- ✅ Row Level Security policies
- ✅ Input validation and sanitization
- ✅ Payment verification server-side

## 📈 Performance

- ✅ Database indexes optimized
- ✅ Offline caching for recipes
- ✅ Lazy loading for large lists
- ✅ Image optimization
- ✅ Rate limiting for AI requests

## 🎯 Next Steps

1. **Test the app**:
   - Sign up for a new account
   - Try generating a recipe
   - Test the AI chat
   - Make a test payment

2. **Customize**:
   - Update app branding
   - Modify subscription tiers
   - Add custom recipes
   - Configure analytics

3. **Deploy**:
   - Build for production
   - Submit to app stores
   - Set up monitoring
   - Configure backups

## 📞 Support

If you encounter any issues:
1. Check this setup guide
2. Review the README.md
3. Check Supabase logs
4. Create an issue in the repository

---

**The app is now fully functional with all features implemented!** 🎉

You can start using it immediately or customize it further based on your needs.

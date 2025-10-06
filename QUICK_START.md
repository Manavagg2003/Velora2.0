# Velora Quick Start Guide

Get Velora running in 15 minutes!

## Prerequisites

- [x] Node.js 18+ installed
- [x] A code editor (VS Code recommended)
- [x] Internet connection

## Step-by-Step Setup

### 1. Get Your API Keys (5 minutes)

#### Supabase (Free)
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new project
4. Wait for project to be ready (~2 minutes)
5. Go to Settings > API
6. Copy:
   - Project URL
   - `anon` `public` key
   - `service_role` key (keep secret!)

#### Google Gemini AI (Free)
1. Go to [Google AI Studio](https://makersuite.google.com/)
2. Click "Get API Key"
3. Create a new API key
4. Copy the key

#### Razorpay (Optional - for payments)
1. Go to [razorpay.com](https://razorpay.com/)
2. Sign up
3. Get Test Keys from Dashboard
4. Copy Key ID and Key Secret

### 2. Setup Database (3 minutes)

1. Open your Supabase project
2. Click SQL Editor (left sidebar)
3. Click "New Query"
4. Copy and paste contents of `database-schema.sql`
5. Click "Run"
6. Wait for success message
7. Repeat for `supabase/migrations/20251006043545_create_velora_schema.sql`
8. Repeat for `supabase/migrations/20251006060000_add_analytics_and_coin_functions.sql`

### 3. Configure Authentication (1 minute)

1. In Supabase, go to Authentication > Settings
2. Enable "Email" provider
3. Disable "Enable email confirmations" (for testing)
4. Save changes

### 4. Setup Your Project (2 minutes)

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

Edit `.env` and add your keys:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-key
```

### 5. Deploy Edge Functions (4 minutes)

```bash
# Login to Supabase CLI (first time only)
npx supabase login

# Link your project
npx supabase link --project-ref your-project-ref

# Deploy functions
npx supabase functions deploy gemini-proxy
npx supabase functions deploy razorpay-verify

# Set secrets
npx supabase secrets set GEMINI_API_KEY=your-gemini-key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

If you're adding payments:
```bash
npx supabase secrets set RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### 6. Run the App! (30 seconds)

```bash
npm run dev
```

Press `w` to open in web browser!

## Quick Test Checklist

Try these features to verify everything works:

### Test 1: Authentication
- [ ] Click "Sign Up"
- [ ] Enter name, email, password
- [ ] Sign up successfully
- [ ] See profile screen with 10 coins

### Test 2: AI Chat (costs 1 coin)
- [ ] Go to Chat tab
- [ ] Type "What's the best way to cook pasta?"
- [ ] Get AI response
- [ ] Coin balance decreases to 9

### Test 3: Recipe Generation (costs 3 coins)
- [ ] Try the AI recipe feature
- [ ] Enter ingredients like "chicken, rice, vegetables"
- [ ] Get generated recipe
- [ ] Coin balance decreases to 6

### Test 4: Theme Toggle
- [ ] Go to Profile tab
- [ ] Toggle dark/light theme
- [ ] Theme changes throughout app

## Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules
npm install
```

### Database connection errors
- Check your Supabase URL is correct
- Verify anon key is correct
- Make sure migrations ran successfully

### Edge Function errors
- Check Supabase logs: `npx supabase functions logs gemini-proxy`
- Verify secrets are set: `npx supabase secrets list`
- Make sure you linked the correct project

### AI not responding
- Verify Gemini API key is valid
- Check you have free quota remaining
- Look at Edge Function logs

### Coin balance not updating
- Check browser console for errors
- Verify RLS policies are enabled
- Check Supabase table permissions

## Next Steps

Once everything works:

1. **Add Payment Integration**:
   - Configure Razorpay in .env
   - Test with Razorpay test keys
   - Implement payment UI

2. **Build Additional Screens**:
   - RecipeDetail screen
   - GenerateRecipe screen
   - Enhanced Discover screen

3. **Customize Branding**:
   - Update app name in app.json
   - Add your logo to assets/
   - Customize theme colors

4. **Deploy to Production**:
   - Follow DEPLOYMENT.md guide
   - Switch to production API keys
   - Deploy to Vercel/Netlify

## Getting Help

If you're stuck:

1. Check [README.md](./README.md) for detailed docs
2. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture
3. Review Supabase logs for errors
4. Check browser console for client errors

## Development Tips

### Hot Reload
The dev server has hot reload enabled. Edit any file and see changes instantly!

### Clear Cache
If something seems broken:
```bash
# Clear Expo cache
npx expo start -c
```

### View Database
Use Supabase Table Editor to view your data in real-time:
1. Go to Table Editor in Supabase
2. Select any table (profiles, recipes, etc.)
3. View, edit, or delete records

### Test Payments Safely
Always use Razorpay TEST keys in development:
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date
- No real charges occur in test mode

## App Features Overview

### What Works Now
✅ User authentication
✅ AI chat with Gemini
✅ Coin management system
✅ Recipe caching
✅ Offline recipe storage
✅ Real-time coin updates
✅ Theme switching
✅ Basic recipe search

### What Needs Building
🔧 Full recipe generation UI
🔧 Payment checkout screen
🔧 Advanced search filters
🔧 Recipe detail view with steps
🔧 Meal planning features

## Performance Tips

- Recipes cache offline automatically
- Coin balance updates in real-time
- Edge Functions have rate limiting
- Database queries are optimized with indexes

## Security Notes

- Never commit .env file
- Keep service role key secret
- Use test keys in development
- Enable email confirmations in production

---

**Estimated time to working app: 15 minutes** ⚡

Happy cooking! 👨‍🍳

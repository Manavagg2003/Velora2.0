# Velora Deployment Guide

This guide covers deploying Velora to production environments.

## Pre-Deployment Checklist

- [ ] All database migrations applied
- [ ] Edge Functions deployed and tested
- [ ] Environment variables configured
- [ ] API keys obtained and secured
- [ ] Authentication configured
- [ ] Payment gateway tested
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Build succeeds (`npm run build:web`)

## Database Deployment

### 1. Production Database Setup

1. Create production Supabase project
2. Run migrations in order:
   ```sql
   -- Run in Supabase SQL Editor
   -- 1. database-schema.sql
   -- 2. supabase/migrations/20251006043545_create_velora_schema.sql
   -- 3. supabase/migrations/20251006060000_add_analytics_and_coin_functions.sql
   ```

3. Verify tables created:
   - profiles
   - recipe_cache
   - saved_recipes
   - chat_conversations
   - coin_transactions
   - user_preferences
   - analytics_events

4. Verify RLS policies enabled on all tables

### 2. Configure Authentication

1. Go to Authentication > Settings
2. Enable Email/Password provider
3. **For production**: Configure SMTP for email confirmations
4. Set password requirements:
   - Minimum 6 characters
   - Optional: Require uppercase, numbers, symbols
5. Configure email templates
6. Set up OAuth providers (optional)

## Edge Functions Deployment

### 1. Initialize Supabase CLI

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref
```

### 2. Deploy Functions

```bash
# Deploy gemini-proxy
supabase functions deploy gemini-proxy

# Deploy razorpay-verify
supabase functions deploy razorpay-verify
```

### 3. Configure Secrets

```bash
# Set required secrets
supabase secrets set GEMINI_API_KEY=your-production-gemini-key
supabase secrets set RAZORPAY_KEY_SECRET=your-production-razorpay-secret
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Verify secrets
supabase secrets list
```

### 4. Test Edge Functions

```bash
# Test gemini-proxy
curl -X POST https://your-project.supabase.co/functions/v1/gemini-proxy \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","text":"Hello"}],"requestType":"chat"}'

# Test razorpay-verify
curl -X POST https://your-project.supabase.co/functions/v1/razorpay-verify \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"razorpay_order_id":"order_test","razorpay_payment_id":"pay_test","razorpay_signature":"sig_test","tier":"plus"}'
```

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
# Supabase Production
EXPO_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key

# Gemini AI
EXPO_PUBLIC_GEMINI_API_KEY=your-production-gemini-key

# Edge Functions
EXPO_PUBLIC_GEMINI_PROXY_URL=https://your-prod-project.supabase.co/functions/v1/gemini-proxy
EXPO_PUBLIC_RAZORPAY_VERIFY_URL=https://your-prod-project.supabase.co/functions/v1/razorpay-verify

# Razorpay Production
EXPO_PUBLIC_RAZORPAY_KEY_ID=your-production-razorpay-key

# App
EXPO_PUBLIC_APP_NAME=Velora
```

## Web Deployment

### Option 1: Vercel

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Build for web**:
```bash
npm run build:web
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Configure environment variables** in Vercel dashboard

### Option 2: Netlify

1. **Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

2. **Build**:
```bash
npm run build:web
```

3. **Deploy**:
```bash
netlify deploy --prod --dir=dist
```

## Mobile App Deployment

### iOS App Store

1. **Install EAS CLI**:
```bash
npm install -g eas-cli
```

2. **Configure EAS**:
```bash
eas build:configure
```

3. **Build for iOS**:
```bash
eas build --platform ios --profile production
```

4. **Submit to App Store**:
```bash
eas submit --platform ios
```

### Google Play Store

1. **Build for Android**:
```bash
eas build --platform android --profile production
```

2. **Submit to Play Store**:
```bash
eas submit --platform android
```

## Post-Deployment

### 1. Verify Functionality

- [ ] User registration works
- [ ] User login works
- [ ] AI chat responds correctly
- [ ] Recipe generation works
- [ ] Payment processing works
- [ ] Coin balance updates in real-time
- [ ] Subscription tiers work correctly

### 2. Monitor Performance

- Set up Supabase monitoring
- Monitor Edge Function logs
- Track API usage and costs
- Monitor error rates

### 3. Set Up Scheduled Tasks

Create a cron job or scheduled Edge Function for monthly coin reset:

```sql
-- Call this monthly via pg_cron or external scheduler
SELECT reset_monthly_coins();
```

## Security Best Practices

1. **Never expose secrets**:
   - Service role keys only in Edge Functions
   - API secrets only in Edge Functions
   - Use environment variables

2. **Enable rate limiting**:
   - Edge Functions have built-in rate limiting
   - Monitor for abuse

3. **Monitor RLS policies**:
   - Ensure all tables have proper RLS
   - Test policies thoroughly

4. **Secure payment flow**:
   - Always verify signatures server-side
   - Never trust client-side payment data

## Rollback Procedure

If issues occur:

1. **Revert Edge Functions**:
```bash
supabase functions deploy gemini-proxy --version previous
```

2. **Database rollback**:
   - Create backup before migrations
   - Restore from backup if needed

3. **Environment variables**:
   - Keep previous configs documented
   - Quick rollback in hosting dashboard

## Monitoring & Alerts

### Supabase Dashboard

- Monitor database queries
- Check Edge Function logs
- Review auth events
- Track API usage

### Application Metrics

- User signups
- AI chat usage
- Recipe generation rate
- Payment success rate
- Error rates

## Troubleshooting

### Edge Function Errors

Check logs:
```bash
supabase functions logs gemini-proxy
supabase functions logs razorpay-verify
```

### Database Connection Issues

- Verify connection string
- Check RLS policies
- Review user permissions

### Payment Failures

- Verify Razorpay webhook configured
- Check signature verification
- Review payment logs

## Cost Optimization

1. **Gemini AI**: Monitor token usage
2. **Supabase**: Use connection pooling
3. **Edge Functions**: Optimize cold starts
4. **Database**: Add indexes for common queries

## Support & Maintenance

- Regular security updates
- Monthly dependency updates
- Monitor user feedback
- Track feature requests
- Review analytics regularly

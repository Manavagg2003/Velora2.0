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

## Database Schema

The application uses the following Supabase tables:

### profiles
User profile with coin balance and subscription details

### recipe_cache
Stores discovered and AI-generated recipes

### saved_recipes
User's bookmarked/favorite recipes

### chat_conversations
AI chat history with conversation threads

### coin_transactions
Complete audit trail of all coin usage

### user_preferences
Dietary restrictions, allergies, and user settings

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g expo-cli`)
- Supabase account
- Google AI API key
- Razorpay account (for payments)

### Environment Variables

Create a `.env` file with the following:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.0-flash-exp
EXPO_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id
EXPO_PUBLIC_RAZORPAY_KEY_SECRET=your-razorpay-secret
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase database:
   - Create a new Supabase project
   - Run the database migration (contact for SQL schema)
   - Enable email authentication in Supabase Auth settings

3. Configure API keys:
   - Get Google AI API key from [Google AI Studio](https://makersuite.google.com/)
   - Set up Razorpay account for payments

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build:web
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

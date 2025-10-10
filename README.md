# Velora - AI-Powered Cooking Companion

Velora is a comprehensive React Native (Expo) app that serves as your AI-powered cooking companion. Built with TypeScript, Supabase, and Google Gemini AI, it provides intelligent recipe generation, personalized cooking assistance, and a subscription-based coin system.

## 🚀 Features

### Core Features
- **AI-Powered Chat Assistant**: Get cooking advice, ingredient substitutions, and technique tips
- **Recipe Generation**: Generate personalized recipes from available ingredients
- **Recipe Discovery**: Browse and search through a curated collection of recipes
- **VeloraCoins System**: Freemium model with subscription tiers
- **Offline Caching**: Save recipes for offline access
- **User Profiles**: Personalized preferences and dietary restrictions
- **Payment Integration**: Razorpay integration for subscription management

### Subscription Tiers
- **Free**: 10 coins/month
- **Plus**: 50 coins/month - $4.99
- **Pro**: 150 coins/month - $9.99
- **Ultra**: 500 coins/month - $19.99

### AI Capabilities
- **Chat Messages**: 1 coin per message
- **Recipe Generation**: 3 coins per recipe
- **Context-Aware Responses**: Considers dietary restrictions, skill level, and preferences
- **Rate Limiting**: 5 requests per minute per user

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 54+), TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **AI**: Google Gemini Pro
- **Payments**: Razorpay
- **State Management**: React Context + Hooks
- **Navigation**: Expo Router
- **Styling**: Custom theme system with dark/light mode support

## 📱 Screenshots

*Screenshots will be added here*

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- Google AI Studio account (for Gemini API)
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd velora
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your actual values:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_gemini_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the database schema from `database-schema.sql`
   - Deploy the Edge Functions from `supabase/functions/`

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄 Database Schema

The app uses the following main tables:

- **profiles**: User profiles with coin balance and subscription info
- **recipe_cache**: Cached AI-generated recipes
- **saved_recipes**: User's favorite recipes
- **chat_conversations**: AI chat history
- **coin_transactions**: Coin usage tracking
- **user_preferences**: User settings and preferences
- **subscriptions**: Subscription management
- **analytics_events**: Event tracking

## 🔧 Configuration

### Supabase Setup

1. **Create a new Supabase project**
2. **Run the database migrations**:
   ```sql
   -- Run the complete schema from database-schema.sql
   ```
3. **Deploy Edge Functions**:
   ```bash
   supabase functions deploy gemini-proxy
   supabase functions deploy razorpay-verify
   ```
4. **Set up RLS policies** (included in schema)

### Google Gemini Setup

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add the key to your environment variables

### Razorpay Setup

1. Create a Razorpay account
2. Get your API keys from the dashboard
3. Add the keys to your environment variables
4. Configure webhook URL: `https://your-project.supabase.co/functions/v1/razorpay-verify`

## 📱 Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

### Web
```bash
npm run build:web
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 📁 Project Structure

```
velora/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── contexts/              # React Context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── services/              # API and business logic
├── types/                 # TypeScript type definitions
├── supabase/              # Supabase configuration
│   └── functions/         # Edge Functions
└── database-schema.sql    # Database schema
```

## 🔐 Security

- All API keys are stored server-side in Edge Functions
- Row Level Security (RLS) policies protect user data
- JWT tokens are used for authentication
- Payment verification is done server-side
- Input validation and sanitization throughout

## 🚀 Deployment

### Supabase Edge Functions
```bash
supabase functions deploy
```

### Expo Application Services (EAS)
```bash
eas build --platform all
eas submit --platform all
```

## 📊 Analytics

The app includes basic analytics tracking:
- User actions and events
- AI usage patterns
- Subscription metrics
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@velora.app or create an issue in the repository.

## 🔄 Changelog

### v1.0.0
- Initial release
- AI chat assistant with Gemini integration
- Recipe generation and discovery
- VeloraCoins subscription system
- Razorpay payment integration
- Offline recipe caching
- Dark/light theme support

## 🎯 Roadmap

- [ ] Push notifications for recipe reminders
- [ ] Meal planning features
- [ ] Nutrition tracking
- [ ] Social features (sharing recipes)
- [ ] Voice commands
- [ ] Recipe video integration
- [ ] Advanced AI features (image recognition, etc.)

## To be Done:

- **AI CHAT SCREEN**: Bugs in gemini api and chat submissions 
- **Payment methods**: Bugs in payment methods in profile screen 
-**EXTRA FEATURES**: My badges, monthly leaderboard, my badges, monthly leaderboard, settings are currently  mock texts - to be made functional

---

Made with ❤️ by the Velora team

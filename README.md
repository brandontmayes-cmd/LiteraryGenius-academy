# Literary Genius Academy 📚

A comprehensive AI-powered learning management system for students, teachers, and parents.

## Features

### 🎓 For Students
- Adaptive learning paths across multiple subjects
- AI-powered tutoring and writing assistance
- Gamification with XP, badges, and achievements
- Assignment submission and tracking
- Study session planner
- Progress analytics

### 👨‍🏫 For Teachers
- Assignment creation and management
- Automated grading with AI assistance
- Student analytics dashboard
- Plagiarism detection
- Peer review system
- Standards alignment tracking

### 👪 For Parents
- Real-time progress monitoring
- Parent-teacher communication
- Achievement notifications
- Progress reports
- Multi-child management

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **State Management**: React Context API
- **PWA**: Service Worker + Offline Support

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd literary-genius-academy
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations
- See `AUTHENTICATION_SETUP.md` for detailed instructions
- Run SQL files in `src/lib/` in your Supabase SQL Editor

5. Start development server
```bash
npm run dev
```

## Authentication

The app uses **real Supabase authentication** with:
- Email/password sign up and login
- Session persistence
- Automatic token refresh
- Role-based access control

See `AUTHENTICATION_SETUP.md` for complete setup instructions.

## Deployment

### Quick Deploy to Vercel

See `QUICK_DEPLOY.md` for fastest deployment method.

### Troubleshooting

**Getting 404 errors?** See `BUILD_TROUBLESHOOTING.md` and `VERCEL_TROUBLESHOOTING.md`

Common issues:
- Missing environment variables in Vercel
- Build failures due to TypeScript errors
- DNS configuration for custom domains

### Environment Variables in Vercel

**CRITICAL**: Add these in Vercel Dashboard → Settings → Environment Variables

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Get these from: Supabase Dashboard → Settings → API

**Important**: Select all environments (Production, Preview, Development) when adding variables.

After adding variables, trigger a redeploy: Deployments → ⋯ → Redeploy

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utilities and database schemas
├── pages/              # Page components
└── types/              # TypeScript type definitions
```

## License

MIT

# Sakinah

A premium Islamic productivity web application built with Next.js, TypeScript, TailwindCSS, shadcn/ui, and Supabase.

## Features

- **Prayer Times** - Automatic prayer time tracking with Aladhan API
- **Dhikr Counter** - Premium tasbih counter with presets and statistics
- **Task Manager** - Complete task management with priorities and categories
- **AI Companion** - Islamic AI chat powered by OpenRouter
- **No-Porn Streak** - Self-improvement tracker with milestones
- **Journal** - Daily journal with mood tracking and tags
- **Calendar** - Gregorian and Hijri calendar with Islamic events
- **Quran Reader** - Browse and read Quran with audio recitation
- **Analytics** - Charts and statistics for all modules
- **Achievements** - Gamified badges and rewards
- **Dark/Light Mode** - Full theme support

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Framer Motion
- Supabase (Auth + Database + RLS)
- Zustand (State Management)
- Recharts (Charts)
- React Hook Form + Zod
- OpenRouter API (AI Chat)

## Deployment on Render

### 1. Environment Variables

Set these in Render Dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Deploy with render.yaml

Push to GitHub and connect to Render. The `render.yaml` file will auto-configure the service.

### 3. Deploy with Docker

```bash
docker build -t deenflow .
docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL=... deenflow
```

### 4. Manual Deploy on Render

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set build command: `npm install && npm run build`
4. Set start command: `npm run start`
5. Set environment variables
6. Deploy

## Supabase Setup

1. Create a new Supabase project
2. Run the SQL in `supabase/schema.sql` in the SQL Editor
3. Enable Email/Password and Google auth in Authentication settings
4. Copy the project URL and anon key to your environment variables

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase credentials
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, register, etc.)
│   ├── (dashboard)/     # Dashboard pages
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/
│   ├── layout/          # Sidebar, Topbar
│   └── ui/              # shadcn/ui components
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── hooks/           # Custom hooks
│   ├── stores/          # Zustand stores
│   ├── types/           # TypeScript types
│   └── utils.ts         # Utility functions
└── middleware.ts         # Auth middleware
```

## License

MIT

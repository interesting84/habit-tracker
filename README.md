# HabitQuest

A gamified habit tracking application that helps you build and maintain good habits while having fun. Level up your life by turning your daily routines into rewarding quests.

## Features

- Create and track daily, weekly, or monthly habits
- Earn XP and level up for completing habits
- Compete with friends on the leaderboard
- Responsive design
- AI-powered habit suggestions and insights

## Tech Stack

- Next.js 15.2.2, React 19, TypeScript
- Tailwind CSS, shadcn/ui, Radix UI
- Framer Motion for animations
- Zustand for state management
- PostgreSQL with Prisma ORM
- NextAuth.js for authentication
- MistralAI integration

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL 12 or later
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/habitquest.git
   cd habitquest
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_URL=

   # Auth
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=

   # AI
   MISTRAL_API_KEY=
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
habitquest/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # UI components
│   ├── lib/             # Utilities
│   ├── hooks/           # React hooks
│   ├── store/           # Zustand store
│   └── types/           # TypeScript types
├── prisma/              # Database configuration
└── public/              # Static assets
```

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.

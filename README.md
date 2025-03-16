# 🎮 HabitQuest

A gamified habit tracking application that helps you build and maintain good habits while having fun! Level up your life by turning your daily routines into rewarding quests.

## ✨ Features

- 🎯 Create and track daily, weekly, or monthly habits
- ⭐ Earn XP and level up for completing habits
- 🏆 Unlock achievements and badges
- 📊 Track your progress with streaks
- 🏃‍♂️ Compete with friends on the leaderboard
- 🌓 Dark/Light mode support
- 📱 Responsive design for all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Cloud Services**: Cloudinary (image storage), Firebase (notifications)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0 or later
- PostgreSQL 12 or later
- npm or yarn
- Git

### Environment Setup

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
   DATABASE_URL="postgresql://username:password@localhost:5432/habitquest"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"

   # Firebase (for notifications)
   FIREBASE_PROJECT_ID="your-project-id"
   FIREBASE_CLIENT_EMAIL="your-client-email"
   FIREBASE_PRIVATE_KEY="your-private-key"
   ```

4. Set up the database:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database (optional)
   npx prisma db seed
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Project Structure

```
habitquest/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions and configurations
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand store configurations
│   └── types/           # TypeScript type definitions
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🧪 Running Tests

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)

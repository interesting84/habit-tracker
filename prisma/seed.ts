const { PrismaClient } = require('@prisma/client')

const seedClient = new PrismaClient()

async function main() {
  // Create achievement badges
  await seedClient.badge.createMany({
    data: [
      {
        name: 'First Step',
        description: 'Complete your first habit',
        image: '/badges/first-step.svg',
        requirement: 'FIRST_COMPLETE',
        requirementValue: 1
      },
      {
        name: 'Habit Master',
        description: 'Complete a habit 10 times',
        image: '/badges/habit-master.svg',
        requirement: 'COMPLETE_COUNT',
        requirementValue: 10
      },
      {
        name: 'Consistency King',
        description: 'Complete habits for 7 consecutive days',
        image: '/badges/consistency-king.svg',
        requirement: 'STREAK_DAYS',
        requirementValue: 7
      }
    ]
  })
}

main()
  .then(async () => {
    await seedClient.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await seedClient.$disconnect()
    process.exit(1)
  }) 
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Create achievement badges
  await prisma.badge.createMany({
    data: [
      {
        name: 'First Step',
        description: 'Complete your first habit',
        imageUrl: '/badges/first-step.svg',
        requirement: 'Complete 1 habit',
        xpBonus: 50
      },
      {
        name: 'Weekly Warrior',
        description: 'Complete habits for 7 consecutive days',
        imageUrl: '/badges/weekly-warrior.svg',
        requirement: 'Complete habits for 7 days in a row',
        xpBonus: 100
      }
    ],
    skipDuplicates: true
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
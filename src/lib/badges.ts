import { prisma } from './prisma'
import { calculateStreak } from './streaks'

export async function checkAndAwardBadges(userId: string) {
  // Get user's current badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true }
  })

  // Get all habits and completions for the user
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      habits: {
        include: {
          completions: true
        }
      }
    }
  })

  if (!user) return

  // Check for first habit completion
  const hasFirstStepBadge = userBadges.some(ub => ub.badge.name === 'First Step')
  const hasCompletedAnyHabit = user.habits.some(h => h.completions.length > 0)

  if (!hasFirstStepBadge && hasCompletedAnyHabit) {
    const firstStepBadge = await prisma.badge.findUnique({
      where: { name: 'First Step' }
    })

    if (firstStepBadge) {
      await prisma.$transaction([
        prisma.userBadge.create({
          data: {
            userId,
            badgeId: firstStepBadge.id
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: firstStepBadge.xpBonus }
          }
        })
      ])
    }
  }

  // Check for weekly streak
  const hasWeeklyWarriorBadge = userBadges.some(ub => ub.badge.name === 'Weekly Warrior')
  const streak = calculateStreak(user.habits)

  if (!hasWeeklyWarriorBadge && streak >= 7) {
    const weeklyWarriorBadge = await prisma.badge.findUnique({
      where: { name: 'Weekly Warrior' }
    })

    if (weeklyWarriorBadge) {
      await prisma.$transaction([
        prisma.userBadge.create({
          data: {
            userId,
            badgeId: weeklyWarriorBadge.id
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            xp: { increment: weeklyWarriorBadge.xpBonus }
          }
        })
      ])
    }
  }
} 
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Habit {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  completions: HabitCompletion[]
}

interface HabitCompletion {
  id: string
  habitId: string
  completedAt: Date
  xpEarned: number
}

interface User {
  id: string
  name: string
  email: string
  level: number
  xp: number
  image?: string
}

interface Badge {
  id: string
  name: string
  description: string
  imageUrl: string
  earnedAt: Date
}

interface AppState {
  user: User | null
  habits: Habit[]
  badges: Badge[]
  isLoading: boolean
  theme: 'light' | 'dark'
  setUser: (user: User | null) => void
  setHabits: (habits: Habit[]) => void
  setBadges: (badges: Badge[]) => void
  setIsLoading: (isLoading: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  addHabit: (habit: Habit) => void
  updateHabit: (habitId: string, updates: Partial<Habit>) => void
  deleteHabit: (habitId: string) => void
  completeHabit: (habitId: string, completion: HabitCompletion) => void
  addBadge: (badge: Badge) => void
}

const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      habits: [],
      badges: [],
      isLoading: false,
      theme: 'light',
      setUser: (user) => set({ user }),
      setHabits: (habits) => set({ habits }),
      setBadges: (badges) => set({ badges }),
      setIsLoading: (isLoading) => set({ isLoading }),
      setTheme: (theme) => set({ theme }),
      addHabit: (habit) => set((state) => ({ habits: [...state.habits, habit] })),
      updateHabit: (habitId, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId ? { ...h, ...updates } : h
          ),
        })),
      deleteHabit: (habitId) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== habitId),
        })),
      completeHabit: (habitId, completion) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === habitId
              ? { ...h, completions: [...h.completions, completion] }
              : h
          ),
        })),
      addBadge: (badge) =>
        set((state) => ({ badges: [...state.badges, badge] })),
    }),
    {
      name: 'habit-quest-storage',
    }
  )
)

export default useStore 
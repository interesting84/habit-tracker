"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, Flame, Star } from "lucide-react"
import useStore from "@/store/useStore"

export default function Home() {
  const { user, habits } = useStore()

  // Calculate XP progress to next level
  const xpForNextLevel = (user?.level || 1) * 100
  const progress = ((user?.xp || 0) / xpForNextLevel) * 100

  // Get active streaks
  const activeStreaks = habits.filter(habit => {
    const lastCompletion = habit.completions[habit.completions.length - 1]
    if (!lastCompletion) return false
    
    const daysSinceLastCompletion = Math.floor(
      (Date.now() - new Date(lastCompletion.completedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    
    return daysSinceLastCompletion <= 1
  }).length

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
          <p className="text-muted-foreground mt-2">Track your habits and level up your life!</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Habit
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.level || 1}</div>
            <Progress value={progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.floor(user?.xp || 0)} / {xpForNextLevel} XP to next level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStreaks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Keep up the momentum!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{habits.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Building better habits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Habits List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Habits</h2>
        {habits.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground text-center mb-4">
                You haven't created any habits yet. Start by adding your first habit!
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {habits.map((habit) => (
              <Card key={habit.id}>
                <CardHeader>
                  <CardTitle>{habit.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{habit.description}</p>
                  {/* Add completion button and streak info here */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

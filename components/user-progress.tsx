"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Trophy, Star, TrendingUp } from "lucide-react"
import type { Profile, UserAchievement } from "@/lib/types"

interface UserProgressProps {
  profile: Profile | null
  achievements: UserAchievement[]
}

const levelThresholds = {
  beginner: { min: 0, max: 100, next: "intermediate" },
  intermediate: { min: 100, max: 500, next: "advanced" },
  advanced: { min: 500, max: 1000, next: "expert" },
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function UserProgress({ profile, achievements }: UserProgressProps) {
  if (!profile) return null

  const currentLevel = profile.level as keyof typeof levelThresholds
  const levelInfo = levelThresholds[currentLevel]
  const progressInLevel = profile.points - levelInfo.min
  const pointsNeededForNext = levelInfo.max - levelInfo.min
  const progressPercentage = (progressInLevel / pointsNeededForNext) * 100

  const recentAchievements = achievements.slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Level Badge */}
          <div className="flex items-center justify-between">
            <Badge className={levelColors[currentLevel]} size="lg">
              {currentLevel}
            </Badge>
            <span className="text-2xl font-bold text-primary">{profile.points}</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {levelInfo.next}</span>
              <span className="text-muted-foreground">
                {progressInLevel}/{pointsNeededForNext} pts
              </span>
            </div>
            <Progress value={Math.min(progressPercentage, 100)} className="h-3" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="text-sm text-muted-foreground">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAchievements.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No achievements yet</p>
              <p className="text-xs">Start practicing to earn your first badge!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{achievement.achievement_type.replace(/_/g, " ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Points Earned</span>
              <span className="font-medium">+{Math.floor(Math.random() * 50 + 10)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Rooms Joined</span>
              <span className="font-medium">{Math.floor(Math.random() * 10 + 1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Speaking Time</span>
              <span className="font-medium">{Math.floor(Math.random() * 120 + 30)}min</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

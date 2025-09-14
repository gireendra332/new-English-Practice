"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Users, MessageCircle, Mic, Clock, Target, Award } from "lucide-react"
import type { UserAchievement } from "@/lib/types"

interface AchievementsGridProps {
  userAchievements: UserAchievement[]
}

const achievementDefinitions = [
  {
    id: "first_conversation",
    title: "First Steps",
    description: "Join your first conversation room",
    icon: Users,
    category: "participation",
    points: 10,
    rarity: "common",
  },
  {
    id: "chat_master",
    title: "Chat Master",
    description: "Send 100 messages in chat",
    icon: MessageCircle,
    category: "communication",
    points: 50,
    rarity: "uncommon",
  },
  {
    id: "voice_hero",
    title: "Voice Hero",
    description: "Speak for 30 minutes total",
    icon: Mic,
    category: "speaking",
    points: 75,
    rarity: "rare",
  },
  {
    id: "daily_streak_7",
    title: "Week Warrior",
    description: "Practice for 7 days in a row",
    icon: Clock,
    category: "consistency",
    points: 100,
    rarity: "rare",
  },
  {
    id: "room_creator",
    title: "Room Creator",
    description: "Create your first practice room",
    icon: Target,
    category: "leadership",
    points: 25,
    rarity: "common",
  },
  {
    id: "level_up_intermediate",
    title: "Rising Star",
    description: "Reach intermediate level",
    icon: Star,
    category: "progress",
    points: 200,
    rarity: "epic",
  },
  {
    id: "activity_champion",
    title: "Activity Champion",
    description: "Complete 10 learning activities",
    icon: Trophy,
    category: "learning",
    points: 150,
    rarity: "rare",
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Practice with 20 different people",
    icon: Users,
    category: "social",
    points: 125,
    rarity: "rare",
  },
  {
    id: "perfectionist",
    title: "Perfectionist",
    description: "Complete an activity with 100% accuracy",
    icon: Award,
    category: "skill",
    points: 300,
    rarity: "legendary",
  },
]

const rarityColors = {
  common: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  uncommon: "bg-green-500/10 text-green-400 border-green-500/20",
  rare: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  epic: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  legendary: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
}

const categoryColors = {
  participation: "bg-blue-500/10 text-blue-400",
  communication: "bg-green-500/10 text-green-400",
  speaking: "bg-red-500/10 text-red-400",
  consistency: "bg-orange-500/10 text-orange-400",
  leadership: "bg-purple-500/10 text-purple-400",
  progress: "bg-yellow-500/10 text-yellow-400",
  learning: "bg-pink-500/10 text-pink-400",
  social: "bg-cyan-500/10 text-cyan-400",
  skill: "bg-indigo-500/10 text-indigo-400",
}

export function AchievementsGrid({ userAchievements }: AchievementsGridProps) {
  const earnedAchievementIds = new Set(userAchievements.map((a) => a.achievement_type))

  return (
    <div className="space-y-6">
      {/* Categories */}
      {Object.entries(
        achievementDefinitions.reduce(
          (acc, achievement) => {
            if (!acc[achievement.category]) {
              acc[achievement.category] = []
            }
            acc[achievement.category].push(achievement)
            return acc
          },
          {} as Record<string, typeof achievementDefinitions>,
        ),
      ).map(([category, achievements]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold mb-4 capitalize flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`} />
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const isEarned = earnedAchievementIds.has(achievement.id)
              const earnedAchievement = userAchievements.find((a) => a.achievement_type === achievement.id)
              const IconComponent = achievement.icon

              return (
                <Card
                  key={achievement.id}
                  className={`transition-all ${
                    isEarned
                      ? "bg-primary/5 border-primary/20 shadow-sm"
                      : "bg-muted/30 border-muted opacity-60 grayscale"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isEarned ? "bg-primary/10" : "bg-muted"
                          }`}
                        >
                          <IconComponent className={`w-5 h-5 ${isEarned ? "text-primary" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{achievement.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      {isEarned && <Trophy className="w-5 h-5 text-yellow-400" />}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={rarityColors[achievement.rarity as keyof typeof rarityColors]} size="sm">
                          {achievement.rarity}
                        </Badge>
                        <span className="text-sm font-medium text-primary">+{achievement.points} pts</span>
                      </div>
                      {isEarned && earnedAchievement && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(earnedAchievement.earned_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {!isEarned && (
                      <div className="mt-3">
                        <Progress value={Math.random() * 60 + 10} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">Progress varies by activity</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

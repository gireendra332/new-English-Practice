"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Award } from "lucide-react"

interface LeaderboardUser {
  display_name: string
  points: number
  level: string
  created_at: string
}

interface LeaderboardTableProps {
  users: LeaderboardUser[]
  currentUserId: string
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="w-5 h-5 text-yellow-400" />
    case 2:
      return <Medal className="w-5 h-5 text-gray-400" />
    case 3:
      return <Award className="w-5 h-5 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }
}

export function LeaderboardTable({ users, currentUserId }: LeaderboardTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Top Learners
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {users.map((user, index) => {
            const rank = index + 1
            const isTopThree = rank <= 3

            return (
              <div
                key={`${user.display_name}-${index}`}
                className={`flex items-center gap-4 p-4 transition-colors ${
                  isTopThree ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                }`}
              >
                {/* Rank */}
                <div className="w-12 flex justify-center">{getRankIcon(rank)}</div>

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{user.display_name}</span>
                    <Badge className={levelColors[user.level as keyof typeof levelColors]} size="sm">
                      {user.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{user.points}</div>
                  <div className="text-sm text-muted-foreground">points</div>
                </div>
              </div>
            )
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

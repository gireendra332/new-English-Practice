"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Activity, Ban, Eye, Play } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ActivitiesManagementProps {
  activities: any[]
}

const activityTypeColors = {
  word_game: "bg-blue-500/10 text-blue-400",
  pronunciation: "bg-green-500/10 text-green-400",
  conversation_starter: "bg-purple-500/10 text-purple-400",
  role_play: "bg-orange-500/10 text-orange-400",
}

export function ActivitiesManagement({ activities: initialActivities }: ActivitiesManagementProps) {
  const [activities, setActivities] = useState(initialActivities)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleActivityAction = async (activityId: string, action: "stop" | "delete") => {
    setIsLoading(activityId)
    try {
      if (action === "stop") {
        const { error } = await supabase.from("activities").update({ is_active: false }).eq("id", activityId)
        if (error) throw error

        // Update local state
        setActivities((prev) =>
          prev.map((activity) => (activity.id === activityId ? { ...activity, is_active: false } : activity)),
        )
      } else if (action === "delete") {
        const { error } = await supabase.from("activities").delete().eq("id", activityId)
        if (error) throw error

        // Update local state
        setActivities((prev) => prev.filter((activity) => activity.id !== activityId))
      }

      router.refresh()
    } catch (error) {
      console.error("Error handling activity:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activities Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 border-b border-border last:border-b-0">
              {/* Activity Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{activity.title}</span>
                  <Badge
                    className={activityTypeColors[activity.activity_type as keyof typeof activityTypeColors]}
                    size="sm"
                  >
                    {activity.activity_type.replace("_", " ")}
                  </Badge>
                  {activity.is_active ? (
                    <Badge className="bg-green-500/10 text-green-400" size="sm">
                      <Play className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-500/10 text-gray-400" size="sm">
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Room: {activity.room_id}</span>
                  <span>Started: {formatTime(activity.created_at)}</span>
                  {activity.data?.points && <span>Points: {activity.data.points}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/rooms/${activity.room_id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading === activity.id}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {activity.is_active && (
                      <DropdownMenuItem
                        onClick={() => handleActivityAction(activity.id, "stop")}
                        className="text-orange-600"
                      >
                        <Ban className="w-4 h-4 mr-2" />
                        Stop Activity
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleActivityAction(activity.id, "delete")}
                      className="text-destructive"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Delete Activity
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activities found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

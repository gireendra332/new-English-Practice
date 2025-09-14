"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { Gamepad2, Play, Trophy, Star } from "lucide-react"
import { useState } from "react"

interface ActivityPanelProps {
  roomId: string
}

const activities = [
  {
    id: "word_association",
    type: "word_game",
    title: "Word Association",
    description: "Take turns saying words that relate to the previous word. Build vocabulary and think quickly!",
    difficulty: "beginner",
    duration: "5-10 min",
    points: 10,
    instructions: [
      "One person starts with any word",
      "Next person says a related word",
      "Continue around the circle",
      "No repeating words!",
      "Earn points for creative connections",
    ],
  },
  {
    id: "pronunciation_challenge",
    type: "pronunciation",
    title: "Tongue Twisters",
    description: "Practice difficult pronunciation with fun tongue twisters and challenging phrases.",
    difficulty: "intermediate",
    duration: "10-15 min",
    points: 25,
    instructions: [
      "Read tongue twisters aloud",
      "Focus on clear pronunciation",
      "Start slow, then speed up",
      "Help others with feedback",
      "Earn points for accuracy",
    ],
  },
  {
    id: "would_you_rather",
    type: "conversation_starter",
    title: "Would You Rather",
    description: "Answer interesting 'would you rather' questions and explain your choices.",
    difficulty: "beginner",
    duration: "15-20 min",
    points: 15,
    instructions: [
      "Choose between two options",
      "Explain your reasoning",
      "Ask follow-up questions",
      "Share personal experiences",
      "Practice expressing opinions",
    ],
  },
  {
    id: "restaurant_roleplay",
    type: "role_play",
    title: "Restaurant Scenario",
    description: "Practice ordering food and restaurant conversations in realistic scenarios.",
    difficulty: "intermediate",
    duration: "10-15 min",
    points: 30,
    instructions: [
      "One person is the waiter/waitress",
      "Others are customers",
      "Practice ordering, asking questions",
      "Use polite expressions",
      "Switch roles after each round",
    ],
  },
  {
    id: "story_building",
    type: "word_game",
    title: "Story Building",
    description: "Create a story together, with each person adding one sentence at a time.",
    difficulty: "advanced",
    duration: "15-20 min",
    points: 35,
    instructions: [
      "Start with an opening sentence",
      "Each person adds one sentence",
      "Keep the story coherent",
      "Use descriptive language",
      "Create an interesting plot together",
    ],
  },
  {
    id: "debate_practice",
    type: "conversation_starter",
    title: "Friendly Debate",
    description: "Practice expressing and defending opinions on various topics respectfully.",
    difficulty: "advanced",
    duration: "20-25 min",
    points: 40,
    instructions: [
      "Choose a debate topic",
      "Take different sides",
      "Present your arguments clearly",
      "Listen to opposing views",
      "Practice respectful disagreement",
    ],
  },
]

const difficultyColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function ActivityPanel({ roomId }: ActivityPanelProps) {
  const [activeActivity, setActiveActivity] = useState<string | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<(typeof activities)[0] | null>(null)
  const supabase = createClient()

  const handleStartActivity = async (activity: (typeof activities)[0]) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Create activity record
      await supabase.from("activities").insert({
        room_id: roomId,
        activity_type: activity.type as any,
        title: activity.title,
        description: activity.description,
        data: {
          instructions: activity.instructions,
          points: activity.points,
          difficulty: activity.difficulty,
        },
        is_active: true,
        created_by: user.id,
      })

      // Send system message to chat
      await supabase.from("messages").insert({
        room_id: roomId,
        user_id: user.id,
        content: `🎮 Started activity: ${activity.title}`,
        message_type: "system",
      })

      setActiveActivity(activity.id)
      setSelectedActivity(null)

      // Award points to user for starting activity
      const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({ points: profile.points + 5 })
          .eq("id", user.id)

        // Record achievement if first time starting activity
        await supabase.from("user_achievements").insert({
          user_id: user.id,
          achievement_type: "activity_starter",
          achievement_data: { activity_type: activity.type, activity_title: activity.title },
        })
      }
    } catch (error) {
      console.error("Error starting activity:", error)
    }
  }

  const handleCompleteActivity = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user || !activeActivity) return

      const activity = activities.find((a) => a.id === activeActivity)
      if (!activity) return

      // Award completion points
      const { data: profile } = await supabase.from("profiles").select("points").eq("id", user.id).single()

      if (profile) {
        await supabase
          .from("profiles")
          .update({ points: profile.points + activity.points })
          .eq("id", user.id)

        // Send completion message
        await supabase.from("messages").insert({
          room_id: roomId,
          user_id: user.id,
          content: `🏆 Completed activity: ${activity.title} (+${activity.points} points!)`,
          message_type: "system",
        })
      }

      setActiveActivity(null)
    } catch (error) {
      console.error("Error completing activity:", error)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gamepad2 className="w-5 h-5" />
          Learning Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto px-4">
          <div className="space-y-3 pb-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className={`p-3 rounded-lg border transition-colors ${
                  activeActivity === activity.id ? "bg-primary/10 border-primary/20" : "bg-card border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-1">
                    <Badge size="sm" className={difficultyColors[activity.difficulty as keyof typeof difficultyColors]}>
                      {activity.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Star className="w-3 h-3" />
                      {activity.points}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{activity.duration}</span>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedActivity(activity)}
                          className="h-7 px-3 text-xs"
                        >
                          Info
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Gamepad2 className="w-5 h-5" />
                            {activity.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge className={difficultyColors[activity.difficulty as keyof typeof difficultyColors]}>
                              {activity.difficulty}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{activity.duration}</span>
                            <div className="flex items-center gap-1 text-sm text-primary">
                              <Star className="w-4 h-4" />
                              {activity.points} points
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">How to play:</h4>
                            <ul className="space-y-1">
                              {activity.instructions.map((instruction, index) => (
                                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary font-medium">{index + 1}.</span>
                                  {instruction}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Button onClick={() => handleStartActivity(activity)} className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Start Activity
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {activeActivity === activity.id ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={handleCompleteActivity}
                        className="h-7 px-3 text-xs bg-green-600 hover:bg-green-700"
                      >
                        <Trophy className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant={activeActivity ? "outline" : "default"}
                        onClick={() => handleStartActivity(activity)}
                        disabled={!!activeActivity}
                        className="h-7 px-3 text-xs"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Start
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

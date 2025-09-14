"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VoiceControls } from "@/components/voice-controls"
import { ParticipantsList } from "@/components/participants-list"
import { ChatPanel } from "@/components/chat-panel"
import { ActivityPanel } from "@/components/activity-panel"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Users, Settings } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { Room, Profile, RoomParticipant } from "@/lib/types"

interface RoomInterfaceProps {
  room: Room & { host?: Profile }
  userProfile: Profile | null
}

export function RoomInterface({ room, userProfile }: RoomInterfaceProps) {
  const [participants, setParticipants] = useState<(RoomParticipant & { profile?: Profile })[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isDeafened, setIsDeafened] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial participants
    const fetchParticipants = async () => {
      const { data } = await supabase
        .from("room_participants")
        .select(
          `
          *,
          profile:profiles!room_participants_user_id_fkey(display_name, avatar_url, level)
        `,
        )
        .eq("room_id", room.id)

      if (data) {
        setParticipants(data)
      }
    }

    fetchParticipants()

    // Subscribe to participant changes
    const participantsSubscription = supabase
      .channel(`room-participants-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_participants",
          filter: `room_id=eq.${room.id}`,
        },
        () => {
          fetchParticipants()
        },
      )
      .subscribe()

    return () => {
      participantsSubscription.unsubscribe()
    }
  }, [room.id, supabase])

  const handleLeaveRoom = async () => {
    if (userProfile) {
      await supabase.from("room_participants").delete().eq("room_id", room.id).eq("user_id", userProfile.id)
    }
  }

  const levelColors = {
    beginner: "bg-green-500/10 text-green-400 border-green-500/20",
    intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    advanced: "bg-red-500/10 text-red-400 border-red-500/20",
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/rooms">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Rooms
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold">{room.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{room.topic}</span>
                  <Badge className={levelColors[room.level]} size="sm">
                    {room.level}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {participants.length}/{room.max_participants}
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Voice Chat Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  Voice Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Participants Grid */}
                <div className="flex-1 mb-6">
                  <ParticipantsList participants={participants} currentUserId={userProfile?.id} />
                </div>

                {/* Voice Controls */}
                <VoiceControls
                  isConnected={isConnected}
                  isMuted={isMuted}
                  isDeafened={isDeafened}
                  onToggleConnection={setIsConnected}
                  onToggleMute={setIsMuted}
                  onToggleDeafen={setIsDeafened}
                  onLeaveRoom={handleLeaveRoom}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Activities Panel */}
            <div className="h-1/2">
              <ActivityPanel roomId={room.id} />
            </div>

            {/* Chat Panel */}
            <div className="h-1/2">
              <ChatPanel roomId={room.id} userProfile={userProfile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

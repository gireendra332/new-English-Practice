"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, Globe } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Room, Profile } from "@/lib/types"

interface RoomsListProps {
  rooms: (Room & { host?: Profile })[]
  userProfile: Profile | null
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function RoomsList({ rooms, userProfile }: RoomsListProps) {
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")
  const router = useRouter()

  const filteredRooms = rooms.filter((room) => filter === "all" || room.level === filter)

  const handleJoinRoom = (roomId: string) => {
    router.push(`/rooms/${roomId}`)
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All Levels
        </Button>
        <Button variant={filter === "beginner" ? "default" : "outline"} size="sm" onClick={() => setFilter("beginner")}>
          Beginner
        </Button>
        <Button
          variant={filter === "intermediate" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("intermediate")}
        >
          Intermediate
        </Button>
        <Button variant={filter === "advanced" ? "default" : "outline"} size="sm" onClick={() => setFilter("advanced")}>
          Advanced
        </Button>
      </div>

      {/* Rooms Grid */}
      {filteredRooms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rooms available</h3>
            <p className="text-muted-foreground mb-4">
              {filter === "all" ? "Be the first to create a room!" : `No ${filter} level rooms right now.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{room.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2">{room.topic}</p>
                    {room.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{room.description}</p>
                    )}
                  </div>
                  <Badge className={levelColors[room.level]}>{room.level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Room Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {room.current_participants}/{room.max_participants}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-green-400">Live</span>
                    </div>
                  </div>

                  {/* Host Info */}
                  {room.host && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Hosted by</span>
                      <span className="font-medium text-foreground">{room.host.display_name}</span>
                    </div>
                  )}

                  {/* Created Time */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(room.created_at).toLocaleTimeString()}
                  </div>

                  {/* Join Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleJoinRoom(room.id)}
                    disabled={room.current_participants >= room.max_participants}
                  >
                    {room.current_participants >= room.max_participants ? "Room Full" : "Join Room"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

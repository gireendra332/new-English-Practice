"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Home, Users, Ban, Eye } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface RoomsManagementProps {
  rooms: any[]
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function RoomsManagement({ rooms: initialRooms }: RoomsManagementProps) {
  const [rooms, setRooms] = useState(initialRooms)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleRoomAction = async (roomId: string, action: "close" | "reopen") => {
    setIsLoading(roomId)
    try {
      const updateData = action === "close" ? { is_active: false } : { is_active: true }

      const { error } = await supabase.from("rooms").update(updateData).eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, ...updateData } : room)))

      router.refresh()
    } catch (error) {
      console.error("Error updating room:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm("Are you sure you want to delete this room? This action cannot be undone.")) {
      return
    }

    setIsLoading(roomId)
    try {
      // Delete room participants first
      await supabase.from("room_participants").delete().eq("room_id", roomId)

      // Delete room messages
      await supabase.from("messages").delete().eq("room_id", roomId)

      // Delete room activities
      await supabase.from("activities").delete().eq("room_id", roomId)

      // Delete the room
      const { error } = await supabase.from("rooms").delete().eq("id", roomId)

      if (error) throw error

      // Update local state
      setRooms((prev) => prev.filter((room) => room.id !== roomId))

      router.refresh()
    } catch (error) {
      console.error("Error deleting room:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="w-5 h-5" />
          Room Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {rooms.map((room) => (
            <div key={room.id} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
              {/* Room Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{room.name}</span>
                  <Badge className={levelColors[room.level]} size="sm">
                    {room.level}
                  </Badge>
                  {!room.is_active && (
                    <Badge variant="secondary" className="bg-gray-500/10 text-gray-400">
                      Closed
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {room.current_participants}/{room.max_participants}
                  </span>
                  <span>Host: {room.host?.display_name || "Unknown"}</span>
                  <span>{new Date(room.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{room.topic}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/rooms/${room.id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading === room.id}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {room.is_active ? (
                      <DropdownMenuItem onClick={() => handleRoomAction(room.id, "close")} className="text-orange-600">
                        <Ban className="w-4 h-4 mr-2" />
                        Close Room
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => handleRoomAction(room.id, "reopen")}>
                        <Home className="w-4 h-4 mr-2" />
                        Reopen Room
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleDeleteRoom(room.id)} className="text-destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Delete Room
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Home className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rooms found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

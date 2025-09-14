"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Crown } from "lucide-react"
import type { RoomParticipant, Profile } from "@/lib/types"

interface ParticipantsListProps {
  participants: (RoomParticipant & { profile?: Profile })[]
  currentUserId?: string
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function ParticipantsList({ participants, currentUserId }: ParticipantsListProps) {
  if (participants.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">👋</div>
          <p>Waiting for participants to join...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={`relative p-4 rounded-lg border transition-colors ${
            participant.user_id === currentUserId
              ? "bg-primary/10 border-primary/20"
              : participant.is_speaking
                ? "bg-green-500/10 border-green-500/20"
                : "bg-card border-border"
          }`}
        >
          {/* Speaking Indicator */}
          {participant.is_speaking && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
          )}

          <div className="flex flex-col items-center text-center space-y-2">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={participant.profile?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {participant.profile?.display_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              {/* Host Crown */}
              {participant.user_id === currentUserId && (
                <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
              )}
            </div>

            {/* Name */}
            <div className="min-h-[20px]">
              <p className="text-sm font-medium truncate max-w-full">
                {participant.profile?.display_name || "Anonymous"}
                {participant.user_id === currentUserId && (
                  <span className="text-xs text-muted-foreground ml-1">(You)</span>
                )}
              </p>
            </div>

            {/* Level Badge */}
            {participant.profile?.level && (
              <Badge size="sm" className={levelColors[participant.profile.level]}>
                {participant.profile.level}
              </Badge>
            )}

            {/* Voice Status */}
            <div className="flex items-center gap-1">
              {participant.is_speaking ? (
                <Mic className="w-3 h-3 text-green-400" />
              ) : (
                <MicOff className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

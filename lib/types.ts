export interface Profile {
  id: string
  display_name: string
  avatar_url?: string
  level: "beginner" | "intermediate" | "advanced"
  points: number
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  name: string
  description?: string
  topic: string
  level: "beginner" | "intermediate" | "advanced"
  max_participants: number
  current_participants: number
  host_id: string
  is_active: boolean
  created_at: string
  updated_at: string
  host?: Profile
}

export interface RoomParticipant {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  is_speaking: boolean
  profile?: Profile
}

export interface Message {
  id: string
  room_id: string
  user_id: string
  content: string
  message_type: "text" | "system" | "game"
  created_at: string
  profile?: Profile
}

export interface Activity {
  id: string
  room_id: string
  activity_type: "word_game" | "pronunciation" | "conversation_starter" | "role_play"
  title: string
  description?: string
  data?: any
  is_active: boolean
  created_by: string
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_type: string
  achievement_data?: any
  earned_at: string
}

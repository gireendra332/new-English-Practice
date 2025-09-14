import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { RoomInterface } from "@/components/room-interface"

interface RoomPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch room details with host info
  const { data: room } = await supabase
    .from("rooms")
    .select(
      `
      *,
      host:profiles!rooms_host_id_fkey(display_name, avatar_url, level)
    `,
    )
    .eq("id", id)
    .single()

  if (!room) {
    redirect("/rooms")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from("room_participants")
    .select("*")
    .eq("room_id", id)
    .eq("user_id", user.id)
    .single()

  // If not a participant and room isn't full, add them
  if (!existingParticipant && room.current_participants < room.max_participants) {
    await supabase.from("room_participants").insert({
      room_id: id,
      user_id: user.id,
    })
  }

  return <RoomInterface room={room} userProfile={profile} />
}

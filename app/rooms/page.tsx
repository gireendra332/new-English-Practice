import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { RoomsList } from "@/components/rooms-list"
import { CreateRoomDialog } from "@/components/create-room-dialog"

export default async function RoomsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch active rooms with host profiles
  const { data: rooms } = await supabase
    .from("rooms")
    .select(
      `
      *,
      host:profiles!rooms_host_id_fkey(display_name, avatar_url)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Practice Rooms</h1>
            <p className="text-muted-foreground">Join a conversation or create your own room</p>
          </div>
          <CreateRoomDialog />
        </div>
        <RoomsList rooms={rooms || []} userProfile={profile} />
      </main>
    </div>
  )
}

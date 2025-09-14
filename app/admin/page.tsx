import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/rooms")
  }

  // Fetch admin dashboard data
  const [
    { data: users },
    { data: rooms },
    { data: messages },
    { data: activities },
    { count: totalUsers },
    { count: activeRooms },
    { count: totalMessages },
  ] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
    supabase
      .from("rooms")
      .select("*, host:profiles!rooms_host_id_fkey(display_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("messages")
      .select("*, profile:profiles!messages_user_id_fkey(display_name), room:rooms!messages_room_id_fkey(name)")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("messages").select("*", { count: "exact", head: true }),
  ])

  const dashboardData = {
    users: users || [],
    rooms: rooms || [],
    messages: messages || [],
    activities: activities || [],
    stats: {
      totalUsers: totalUsers || 0,
      activeRooms: activeRooms || 0,
      totalMessages: totalMessages || 0,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, rooms, and platform content</p>
        </div>
        <AdminDashboard data={dashboardData} />
      </main>
    </div>
  )
}

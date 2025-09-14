import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { AchievementsGrid } from "@/components/achievements-grid"
import { UserProgress } from "@/components/user-progress"

export default async function AchievementsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user achievements
  const { data: userAchievements } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Achievements</h1>
          <p className="text-muted-foreground">Track your progress and unlock new badges</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Progress */}
          <div className="lg:col-span-1">
            <UserProgress profile={profile} achievements={userAchievements || []} />
          </div>

          {/* Achievements Grid */}
          <div className="lg:col-span-2">
            <AchievementsGrid userAchievements={userAchievements || []} />
          </div>
        </div>
      </main>
    </div>
  )
}

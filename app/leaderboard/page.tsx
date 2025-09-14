import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { LeaderboardTable } from "@/components/leaderboard-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Users, Clock } from "lucide-react"

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch top users by points
  const { data: topUsers } = await supabase
    .from("profiles")
    .select("display_name, points, level, created_at")
    .order("points", { ascending: false })
    .limit(50)

  // Get current user's rank
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Calculate user's rank
  const { count: userRank } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gt("points", userProfile?.points || 0)

  const currentUserRank = (userRank || 0) + 1

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">See how you rank against other English learners</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{currentUserRank}</div>
              <p className="text-xs text-muted-foreground">
                {userProfile?.points || 0} points • {userProfile?.level || "beginner"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Learners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topUsers?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Points</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userProfile?.points || 0}</div>
              <p className="text-xs text-muted-foreground">Keep practicing to earn more!</p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable users={topUsers || []} currentUserId={user.id} />
      </main>
    </div>
  )
}

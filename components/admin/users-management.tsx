"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, Shield, Ban, UserCheck, Crown } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface UsersManagementProps {
  users: any[]
}

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function UsersManagement({ users: initialUsers }: UsersManagementProps) {
  const [users, setUsers] = useState(initialUsers)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleUserAction = async (userId: string, action: "ban" | "unban" | "promote" | "demote") => {
    setIsLoading(userId)
    try {
      let updateData: any = {}

      switch (action) {
        case "ban":
          updateData = { is_banned: true }
          break
        case "unban":
          updateData = { is_banned: false }
          break
        case "promote":
          updateData = { is_admin: true }
          break
        case "demote":
          updateData = { is_admin: false }
          break
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", userId)

      if (error) throw error

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, ...updateData } : user)))

      router.refresh()
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-4 p-4 border-b border-border last:border-b-0">
              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.display_name?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.display_name || "Anonymous"}</span>
                  {user.is_admin && (
                    <Badge variant="secondary" className="bg-purple-500/10 text-purple-400">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {user.is_banned && (
                    <Badge variant="destructive" className="bg-red-500/10 text-red-400">
                      <Ban className="w-3 h-3 mr-1" />
                      Banned
                    </Badge>
                  )}
                  <Badge className={levelColors[user.level as keyof typeof levelColors]} size="sm">
                    {user.level}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{user.points} points</span>
                  <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isLoading === user.id}>
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!user.is_banned ? (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "ban")} className="text-destructive">
                      <Ban className="w-4 h-4 mr-2" />
                      Ban User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "unban")}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Unban User
                    </DropdownMenuItem>
                  )}
                  {!user.is_admin ? (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "promote")}>
                      <Crown className="w-4 h-4 mr-2" />
                      Make Admin
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => handleUserAction(user.id, "demote")}>
                      <Shield className="w-4 h-4 mr-2" />
                      Remove Admin
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

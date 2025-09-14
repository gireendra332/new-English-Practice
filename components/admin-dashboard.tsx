"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersManagement } from "@/components/admin/users-management"
import { RoomsManagement } from "@/components/admin/rooms-management"
import { MessagesModeration } from "@/components/admin/messages-moderation"
import { ActivitiesManagement } from "@/components/admin/activities-management"
import { Users, MessageSquare, Home, Activity } from "lucide-react"

interface AdminDashboardProps {
  data: {
    users: any[]
    rooms: any[]
    messages: any[]
    activities: any[]
    stats: {
      totalUsers: number
      activeRooms: number
      totalMessages: number
    }
  }
}

export function AdminDashboard({ data }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rooms</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.activeRooms}</div>
            <p className="text-xs text-muted-foreground">Currently live</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activities.length}</div>
            <p className="text-xs text-muted-foreground">Recent activities</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersManagement users={data.users} />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsManagement rooms={data.rooms} />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesModeration messages={data.messages} />
        </TabsContent>

        <TabsContent value="activities">
          <ActivitiesManagement activities={data.activities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

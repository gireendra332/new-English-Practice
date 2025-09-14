import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Globe } from "lucide-react"
import Link from "next/link"

const sampleRooms = [
  {
    id: "1",
    name: "Casual Conversation",
    topic: "Daily Life & Hobbies",
    level: "beginner",
    participants: 4,
    maxParticipants: 6,
    isActive: true,
  },
  {
    id: "2",
    name: "Business English",
    topic: "Professional Communication",
    level: "intermediate",
    participants: 3,
    maxParticipants: 8,
    isActive: true,
  },
  {
    id: "3",
    name: "Pronunciation Practice",
    topic: "Speaking & Accent Training",
    level: "advanced",
    participants: 2,
    maxParticipants: 4,
    isActive: true,
  },
]

const levelColors = {
  beginner: "bg-green-500/10 text-green-400 border-green-500/20",
  intermediate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  advanced: "bg-red-500/10 text-red-400 border-red-500/20",
}

export function RoomPreview() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Active Rooms</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Choose from various topics and difficulty levels. Practice with others who share your learning goals.
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sampleRooms.map((room) => (
            <Card key={room.id} className="hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg mb-2">{room.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{room.topic}</p>
                  </div>
                  <Badge className={levelColors[room.level as keyof typeof levelColors]}>{room.level}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {room.participants}/{room.maxParticipants}
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>
                <Button className="w-full" asChild>
                  <Link href={`/rooms/${room.id}`}>Join Room</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/rooms">
              <Globe className="w-5 h-5 mr-2" />
              View All Rooms
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

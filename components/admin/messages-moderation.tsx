"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { MoreHorizontal, MessageSquare, Ban, Flag, Eye } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface MessagesModerationProps {
  messages: any[]
}

export function MessagesModeration({ messages: initialMessages }: MessagesModerationProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleMessageAction = async (messageId: string, action: "delete" | "flag") => {
    setIsLoading(messageId)
    try {
      if (action === "delete") {
        const { error } = await supabase.from("messages").delete().eq("id", messageId)
        if (error) throw error

        // Update local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId))
      } else if (action === "flag") {
        // In a real app, you'd have a separate flagged_messages table
        console.log("Flagging message:", messageId)
      }

      router.refresh()
    } catch (error) {
      console.error("Error handling message:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case "system":
        return "bg-blue-500/10 text-blue-400"
      case "text":
        return "bg-gray-500/10 text-gray-400"
      default:
        return "bg-gray-500/10 text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Message Moderation
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-1">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-4 p-4 border-b border-border last:border-b-0">
              {/* Message Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{message.profile?.display_name || "System"}</span>
                  <Badge className={getMessageTypeColor(message.message_type)} size="sm">
                    {message.message_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">in {message.room?.name || "Unknown Room"}</span>
                </div>
                <p className="text-sm mb-2 break-words">{message.content}</p>
                <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/rooms/${message.room_id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="w-4 h-4" />
                  </a>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" disabled={isLoading === message.id}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleMessageAction(message.id, "flag")}
                      className="text-orange-600"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Flag Message
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleMessageAction(message.id, "delete")}
                      className="text-destructive"
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Delete Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>

        {messages.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No messages found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

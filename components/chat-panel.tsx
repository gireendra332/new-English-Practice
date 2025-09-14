"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { Send, MessageCircle } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import type { Message, Profile } from "@/lib/types"

interface ChatPanelProps {
  roomId: string
  userProfile: Profile | null
}

export function ChatPanel({ roomId, userProfile }: ChatPanelProps) {
  const [messages, setMessages] = useState<(Message & { profile?: Profile })[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select(
          `
          *,
          profile:profiles!messages_user_id_fkey(display_name, avatar_url)
        `,
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (data) {
        setMessages(data)
      }
    }

    fetchMessages()

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // Fetch the complete message with profile data
          const { data } = await supabase
            .from("messages")
            .select(
              `
              *,
              profile:profiles!messages_user_id_fkey(display_name, avatar_url)
            `,
            )
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => [...prev, data])
          }
        },
      )
      .subscribe()

    return () => {
      messagesSubscription.unsubscribe()
    }
  }, [roomId, supabase])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userProfile || isLoading) return

    setIsLoading(true)
    try {
      await supabase.from("messages").insert({
        room_id: roomId,
        user_id: userProfile.id,
        content: newMessage.trim(),
        message_type: "text",
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 px-4" ref={scrollAreaRef}>
          <div className="space-y-3 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.profile?.display_name || "Anonymous"}
                        {message.user_id === userProfile?.id && (
                          <span className="text-xs text-muted-foreground ml-1">(You)</span>
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.created_at)}</span>
                    </div>
                    <p className="text-sm text-foreground break-words">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isLoading || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

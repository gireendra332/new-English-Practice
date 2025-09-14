"use client"

import { Button } from "@/components/ui/button"
import { Mic, MicOff, Headphones, HeadphonesIcon, Phone, PhoneOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface VoiceControlsProps {
  isConnected: boolean
  isMuted: boolean
  isDeafened: boolean
  onToggleConnection: (connected: boolean) => void
  onToggleMute: (muted: boolean) => void
  onToggleDeafen: (deafened: boolean) => void
  onLeaveRoom: () => Promise<void>
}

export function VoiceControls({
  isConnected,
  isMuted,
  isDeafened,
  onToggleConnection,
  onToggleMute,
  onToggleDeafen,
  onLeaveRoom,
}: VoiceControlsProps) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isConnected && !mediaStream) {
      startVoiceChat()
    } else if (!isConnected && mediaStream) {
      stopVoiceChat()
    }

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [isConnected])

  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMuted
      })
    }
  }, [isMuted, mediaStream])

  const startVoiceChat = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      setMediaStream(stream)

      // Set up audio level monitoring
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Monitor audio levels
      const monitorAudio = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length
          setAudioLevel(average)
        }
        requestAnimationFrame(monitorAudio)
      }
      monitorAudio()

      console.log("[v0] Voice chat started successfully")
    } catch (error) {
      console.error("[v0] Error starting voice chat:", error)
      onToggleConnection(false)
    }
  }

  const stopVoiceChat = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setAudioLevel(0)
    console.log("[v0] Voice chat stopped")
  }

  const handleToggleConnection = () => {
    onToggleConnection(!isConnected)
  }

  const handleToggleMute = () => {
    onToggleMute(!isMuted)
  }

  const handleToggleDeafen = () => {
    onToggleDeafen(!isDeafened)
  }

  const handleLeaveRoom = async () => {
    await onLeaveRoom()
    router.push("/rooms")
  }

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-muted/30 rounded-lg">
      {/* Connection Status */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
        <span className="text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
      </div>

      {/* Audio Level Indicator */}
      {isConnected && !isMuted && (
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 h-4 rounded-full transition-colors ${
                audioLevel > i * 20 ? "bg-green-400" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}

      {/* Voice Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant={isConnected ? "default" : "outline"}
          size="sm"
          onClick={handleToggleConnection}
          className={isConnected ? "bg-green-600 hover:bg-green-700" : ""}
        >
          {isConnected ? <Phone className="w-4 h-4" /> : <PhoneOff className="w-4 h-4" />}
        </Button>

        <Button
          variant={isMuted ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleMute}
          disabled={!isConnected}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </Button>

        <Button
          variant={isDeafened ? "destructive" : "outline"}
          size="sm"
          onClick={handleToggleDeafen}
          disabled={!isConnected}
        >
          {isDeafened ? <HeadphonesIcon className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </Button>

        <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
          Leave Room
        </Button>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Globe, Zap } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        {/* Badge */}
        <Badge variant="secondary" className="mb-6">
          <Zap className="w-3 h-3 mr-1" />
          Real-time Voice Practice
        </Badge>

        {/* Main Heading */}
        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
          Practice English with
          <span className="text-primary block">Native Speakers</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          Join live voice chat rooms, participate in interactive games, and improve your English speaking skills with
          learners from around the world.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/rooms">
              <Users className="w-5 h-5 mr-2" />
              Join a Room
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent" asChild>
            <Link href="/auth/sign-up">
              <Globe className="w-5 h-5 mr-2" />
              Start Learning
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">10K+</div>
            <div className="text-muted-foreground">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">50+</div>
            <div className="text-muted-foreground">Countries</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Practice Sessions</div>
          </div>
        </div>
      </div>
    </section>
  )
}

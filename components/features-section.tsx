import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Users, Trophy, Gamepad2, Clock, Shield } from "lucide-react"

const features = [
  {
    icon: Mic,
    title: "Real-time Voice Chat",
    description: "Practice speaking with crystal-clear audio quality and instant feedback from native speakers.",
  },
  {
    icon: Users,
    title: "Global Community",
    description: "Connect with English learners and native speakers from over 50 countries worldwide.",
  },
  {
    icon: Gamepad2,
    title: "Interactive Games",
    description: "Learn through fun activities like word games, pronunciation challenges, and role-playing scenarios.",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Track your progress with badges, levels, and leaderboards that motivate continuous learning.",
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Practice anytime with rooms available around the clock across different time zones.",
  },
  {
    icon: Shield,
    title: "Safe Environment",
    description: "Moderated rooms and community guidelines ensure a respectful learning environment for everyone.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose VoiceSpark?</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Experience the most effective way to improve your English speaking skills through immersive, interactive
            practice.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:bg-card/80 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

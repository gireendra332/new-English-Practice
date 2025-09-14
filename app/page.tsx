import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { RoomPreview } from "@/components/room-preview"
import { FeaturesSection } from "@/components/features-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <RoomPreview />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

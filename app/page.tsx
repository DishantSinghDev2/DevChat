import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingFooter } from "@/components/landing/landing-footer"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  )
}

import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsBar from '@/components/landing/StatsBar'
import Features from '@/components/landing/Features'
import SocialProof from '@/components/landing/SocialProof'
import HowItWorks from '@/components/landing/HowItWorks'
import CTABand from '@/components/landing/CTABand'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <StatsBar />
      <Features />
      <SocialProof />
      <HowItWorks />
      <CTABand />
    </main>
  )
}

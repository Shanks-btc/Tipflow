import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import StatsBar from '@/components/landing/StatsBar'
import ProblemStatement from '@/components/landing/ProblemStatement'
import SolutionCards from '@/components/landing/SolutionCards'
import Features from '@/components/landing/Features'
import FeeComparison from '@/components/landing/FeeComparison'
import HowItWorks from '@/components/landing/HowItWorks'
import GetStarted from '@/components/landing/GetStarted'
import CTABand from '@/components/landing/CTABand'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <StatsBar />
      <ProblemStatement />
      <SolutionCards />
      <Features />
      <FeeComparison />
      <HowItWorks />
      <GetStarted />
      <CTABand />
      <Footer />
    </main>
  )
}

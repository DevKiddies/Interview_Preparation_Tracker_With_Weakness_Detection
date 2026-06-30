// LandingPage.jsx — public marketing page shown to visitors who aren't logged in.
// Composed of independent section components stacked in order; each section
// can be reordered or removed here without touching the individual components.

import HeroSection from "../components/HeroSection.jsx"
import CompaniesSection from "../components/CompaniesSection.jsx"
import HowItWorksSection from "../components/HowItWorksSection.jsx"
import FeaturesSection from "../components/FeaturesSection.jsx"
import TestimonialsSection from "../components/TestimonialsSection.jsx"

import CTASection from "../components/CTASection.jsx"
import Footer from "../components/Footer.jsx"

const LandingPage= () => {
    return (
        <>
              <HeroSection  />
              <CompaniesSection />
              <HowItWorksSection />
              <FeaturesSection />
              <TestimonialsSection />
              <CTASection />

        </>      
    )
}
export default LandingPage
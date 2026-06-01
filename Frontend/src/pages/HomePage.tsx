import Header from '../components/home/Header.tsx';
import HeroSection from '../components/home/HeroSection.tsx';
import AboutSection from '../components/home/AboutSection.tsx';
import FeaturesSection from '../components/home/FeaturesSection.tsx';
import TestimonialsSection from '../components/home/TestimonialsSection.tsx';
import PricingSection from '../components/home/PricingSection.tsx';
import FAQSection from '../components/home/FAQSection.tsx';
import Footer from '../components/home/Footer.tsx';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
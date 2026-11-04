import Header from '../components/home/Header.tsx';
import HeroSection from '../components/home/HeroSection.tsx';
import AboutSection from '../components/home/AboutSection.tsx';
import FeaturesSection from '../components/home/FeaturesSection.tsx';
import BetaSection from '../components/home/BetaSection.tsx';
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
        <BetaSection />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;

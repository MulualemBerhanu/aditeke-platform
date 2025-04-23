import { Helmet } from 'react-helmet';
import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import AboutSection from '@/components/home/AboutSection';
import PortfolioSection from '@/components/home/PortfolioSection';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import ContactSection from '@/components/home/ContactSection';
import NewsletterSection from '@/components/home/NewsletterSection';
import ClientDashboardPreview from '@/components/home/ClientDashboardPreview';
import TechStackShowcase from '@/components/home/TechStackShowcase';

const Home = () => {
  return (
    <>
      <Helmet>
        <title>AdiTeke Software Solutions - Innovative Software Development</title>
        <meta name="description" content="AdiTeke Software Solutions provides custom software development services including web development, mobile apps, AI solutions, and cloud services." />
      </Helmet>
      
      <HeroSection />
      <ServicesSection />
      <AboutSection />
      <TechStackShowcase />
      <PortfolioSection />
      <TestimonialsSection />
      <ContactSection />
      <NewsletterSection />
      <ClientDashboardPreview />
    </>
  );
};

export default Home;

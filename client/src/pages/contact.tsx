import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import ContactSection from '@/components/home/ContactSection';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { CONTACT_INFO } from '@/lib/constants';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  LifeBuoy, 
  RefreshCw, 
  CheckCircle, 
  ShieldCheck 
} from 'lucide-react';

const ContactPage = () => {
  // Reference for the contact form section (for smooth scrolling)
  const contactFormRef = useRef<HTMLDivElement>(null);

  // Scroll to contact form when button is clicked
  const scrollToContactForm = () => {
    contactFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Common animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7 } }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | AdiTeke Software Solutions</title>
        <meta name="description" content="Get in touch with AdiTeke Software Solutions. Contact us for inquiries, quotes, or to discuss your project needs. Our team is ready to assist you with your software development projects." />
        <meta name="keywords" content="contact, AdiTeke, software development, Portland, Oregon, get in touch, project quotes" />
      </Helmet>

      {/* Hero Section - Navy/Dark Background */}
      <section className="relative py-28 overflow-hidden bg-gradient-to-b from-primary to-blue-800 text-white">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.05),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">📞</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">Get In Touch</h1>
            <p className="text-xl md:text-2xl text-blue-100/90 mb-10 max-w-2xl mx-auto">
              We're here to answer your questions and help turn your ideas into reality
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <button 
                onClick={scrollToContactForm}
                className="px-8 py-4 bg-white text-primary font-medium rounded-md hover:bg-white/90 transition-colors inline-block shadow-lg"
              >
                Contact Us Now
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Information - White Background */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-6 bg-primary/30"></div>
                <div className="mx-2 text-primary text-lg">✨</div>
                <div className="h-px w-6 bg-primary/30"></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              Reach Out to Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our team is ready to assist you with your software development needs. Here's how you can contact us directly.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Contact Card - Location */}
            <motion.div 
              className="bg-white border border-primary/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              initial={fadeInUp.hidden}
              whileInView={fadeInUp.visible} 
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6 shadow-inner">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Our Location</h3>
              <p className="text-gray-600 text-center">
                {CONTACT_INFO.address}
              </p>
            </motion.div>
            
            {/* Contact Card - Email */}
            <motion.div 
              className="bg-white border border-primary/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              initial={fadeInUp.hidden}
              whileInView={fadeInUp.visible} 
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6 shadow-inner">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Email Us</h3>
              <div className="text-center">
                <p className="text-gray-600">General Inquiries:</p>
                <p className="text-primary font-medium">
                  {CONTACT_INFO.email}
                </p>
                <p className="text-gray-600 mt-2">Support:</p>
                <p className="text-primary font-medium">
                  {CONTACT_INFO.supportEmail}
                </p>
              </div>
            </motion.div>
            
            {/* Contact Card - Phone */}
            <motion.div 
              className="bg-white border border-primary/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              initial={fadeInUp.hidden}
              whileInView={fadeInUp.visible} 
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6 shadow-inner">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Call Us</h3>
              <p className="text-gray-600 text-center">
                Main Office:
              </p>
              <p className="text-primary font-medium text-center">
                {CONTACT_INFO.phone}
              </p>
            </motion.div>
            
            {/* Contact Card - Working Hours */}
            <motion.div 
              className="bg-white border border-primary/10 rounded-xl p-6 shadow-md hover:shadow-lg transition-all"
              initial={fadeInUp.hidden}
              whileInView={fadeInUp.visible} 
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6 shadow-inner">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Working Hours</h3>
              <p className="text-gray-600 text-center">Weekdays:</p>
              <p className="text-gray-800 font-medium text-center mb-2">
                {CONTACT_INFO.workingHours}
              </p>
              <p className="text-gray-600 text-center">Saturday:</p>
              <p className="text-gray-800 font-medium text-center">
                {CONTACT_INFO.workingHoursSaturday}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form Section - Navy Background (Using the existing ContactSection) */}
      <div ref={contactFormRef}>
        <ContactSection />
      </div>

      {/* Map Section - White Background */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-6 bg-primary/30"></div>
                <div className="mx-2 text-primary text-lg">📍</div>
                <div className="h-px w-6 bg-primary/30"></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              Our Location
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg mb-8">
              Visit our office in Portland, Oregon. We'd be happy to meet you in person and discuss your project requirements.
            </p>
          </motion.div>
          
          <motion.div 
            className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-xl border border-primary/10"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="h-[500px] w-full">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d178888.66066140937!2d-122.70676099771878!3d45.51765940172968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54950b0b7da97427%3A0x1c36b9e6f6d18591!2sPortland%2C%20OR%2097222!5e0!3m2!1sen!2sus!4v1714447880943!5m2!1sen!2sus" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy"
                title="AdiTeke Software Solutions Location"
              ></iframe>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Navy Background */}
      <section className="py-24 bg-gradient-to-b from-blue-950 to-blue-900 text-white relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.03),transparent_25%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block mb-4">
              <div className="flex items-center justify-center mb-2">
                <div className="h-px w-8 bg-blue-300/50"></div>
                <div className="mx-2 text-blue-300 text-lg">❓</div>
                <div className="h-px w-8 bg-blue-300/50"></div>
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Frequently Asked <span className="text-blue-300">Questions</span>
            </h2>
            <p className="text-blue-100/80 text-lg">
              Find answers to common questions about our services, pricing, and process. If you don't see your question here, feel free to contact us directly.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {[
                {
                  question: "What types of projects do you work on?",
                  answer: "We work on a wide range of software projects including web applications, mobile apps, AI solutions, enterprise software, e-commerce platforms, and custom software development tailored to specific business needs.",
                  icon: <LifeBuoy className="h-5 w-5 text-blue-300" />
                },
                {
                  question: "How much does a typical project cost?",
                  answer: "Project costs vary based on complexity, scope, and timeline. We offer different pricing tiers and can provide a detailed quote after understanding your specific requirements during an initial consultation.",
                  icon: <ShieldCheck className="h-5 w-5 text-blue-300" />
                },
                {
                  question: "How long does a project typically take to complete?",
                  answer: "Project timelines depend on scope and complexity. A simple website might take 4-6 weeks, while complex enterprise applications can take several months. We provide detailed timelines during the planning phase.",
                  icon: <Clock className="h-5 w-5 text-blue-300" />
                },
                {
                  question: "Do you offer ongoing maintenance and support?",
                  answer: "Yes, we offer various maintenance and support packages to ensure your software continues to run smoothly after launch. This includes bug fixes, security updates, performance optimization, and feature enhancements.",
                  icon: <RefreshCw className="h-5 w-5 text-blue-300" />
                },
                {
                  question: "How do you handle project management and communication?",
                  answer: "We use agile methodologies with regular sprint reviews and status updates. Clients have access to our project management tools, and we schedule regular meetings to ensure clear communication throughout the project lifecycle.",
                  icon: <CheckCircle className="h-5 w-5 text-blue-300" />
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <AccordionItem 
                    value={`item-${index}`} 
                    className="border border-white/10 rounded-xl bg-white/5 overflow-hidden backdrop-blur-sm"
                  >
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-white/5 transition-colors">
                      <div className="flex items-center text-left">
                        <div className="mr-3">
                          {faq.icon}
                        </div>
                        <div className="text-xl font-medium text-white">
                          {faq.question}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 py-4 text-blue-100/80 bg-white/5">
                      <div className="ml-8">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA Section - White Background */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-40 bg-gradient-to-t from-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="max-w-4xl mx-auto text-center bg-white border border-primary/10 rounded-2xl p-12 shadow-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-blue-400/10 flex items-center justify-center text-primary text-3xl mx-auto mb-6 shadow-inner"
            >
              <MessageSquare className="h-8 w-8" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Our team is ready to help turn your vision into reality. Contact us today for a free consultation and let's create something amazing together.
            </p>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <button 
                onClick={scrollToContactForm}
                className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-md hover:opacity-90 transition-colors inline-block shadow-lg font-medium text-lg"
              >
                Get in Touch Now
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

// Define MessageSquare component if not imported
const MessageSquare = (props: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
};

export default ContactPage;

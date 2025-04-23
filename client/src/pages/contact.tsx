import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import ContactSection from '@/components/home/ContactSection';

const ContactPage = () => {
  return (
    <>
      <Helmet>
        <title>Contact Us | AdiTeke Software Solutions</title>
        <meta name="description" content="Get in touch with AdiTeke Software Solutions. Contact us for inquiries, quotes, or to discuss your project needs." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="text-xl text-gray-700 mb-8">
              We'd love to hear from you. Contact us with any questions or inquiries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Forms and Info */}
      <ContactSection />

      {/* Map Section */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <motion.div 
            className="bg-white rounded-xl shadow-md overflow-hidden"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-96 w-full">
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

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about our services and processes.
            </p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "What types of projects do you work on?",
                answer: "We work on a wide range of software projects including web applications, mobile apps, AI solutions, enterprise software, e-commerce platforms, and custom software development tailored to specific business needs."
              },
              {
                question: "How much does a typical project cost?",
                answer: "Project costs vary based on complexity, scope, and timeline. We offer different pricing tiers and can provide a detailed quote after understanding your specific requirements during an initial consultation."
              },
              {
                question: "How long does a project typically take to complete?",
                answer: "Project timelines depend on scope and complexity. A simple website might take 4-6 weeks, while complex enterprise applications can take several months. We provide detailed timelines during the planning phase."
              },
              {
                question: "Do you offer ongoing maintenance and support?",
                answer: "Yes, we offer various maintenance and support packages to ensure your software continues to run smoothly after launch. This includes bug fixes, security updates, performance optimization, and feature enhancements."
              },
              {
                question: "How do you handle project management and communication?",
                answer: "We use agile methodologies with regular sprint reviews and status updates. Clients have access to our project management tools, and we schedule regular meetings to ensure clear communication throughout the project lifecycle."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="mb-6 bg-light rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;

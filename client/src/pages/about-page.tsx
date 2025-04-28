import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  return (
    <div className="bg-light min-h-screen">
      {/* Page Header */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Learn about AdiTeke Software Solutions and our mission to deliver exceptional software development services.
          </p>
        </div>
      </div>
      
      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our talented professionals are the heart of <span className="font-bold">Adi<span className="text-blue-600">Teke</span></span>. We bring together expertise from diverse backgrounds to deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* CTO Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md"
            >
              <img
                src="/assets/team/mulualem.jpeg"
                alt="Mulualem Berhanu"
                className="w-full h-80 object-cover object-center"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Mulualem Berhanu</h3>
                <p className="text-blue-600 font-medium mb-3">CTO & Founder</p>
                <p className="text-gray-600">
                  Mulualem has over 7 years of experience in software
                  development and technical leadership.
                </p>
              </div>
            </motion.div>

            {/* CEO Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-md"
            >
              <img
                src="/assets/team/samrawit-kassa.jpg"
                alt="Samrawit Kassa"
                className="w-full h-80 object-cover object-top"
              />
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Samrawit Kassa</h3>
                <p className="text-blue-600 font-medium mb-3">CEO</p>
                <p className="text-gray-600">
                  Samrawit leads our business operations with expertise in
                  strategic planning, client relations, and organizational
                  growth.
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/careers">
              <Button variant="outline" className="bg-white">
                Join Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Feature Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine technical expertise with industry best practices to deliver exceptional results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Technical Excellence</h3>
              <p className="text-gray-600">
                Our team stays up-to-date with the latest technologies and best practices to deliver high-quality solutions.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Scalable Solutions</h3>
              <p className="text-gray-600">
                We build applications that can grow with your business, ensuring long-term success and adaptability.
              </p>
            </div>
            
            <div className="p-6 bg-white rounded-xl shadow-md">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-primary">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">On-Time Delivery</h3>
              <p className="text-gray-600">
                We value your time and always strive to deliver projects on schedule without compromising quality.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These core principles guide everything we do and help us deliver exceptional results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Client Satisfaction</h3>
              <p className="text-gray-600">
                We prioritize understanding our clients' needs and exceeding their expectations at every step.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We embrace creative thinking and innovative approaches to solve complex challenges.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <p className="text-gray-600">
                We maintain the highest ethical standards in all our business practices and relationships.
              </p>
            </div>
            
            <div className="p-6 border border-gray-200 rounded-xl">
              <h3 className="text-xl font-bold mb-2">Continuous Improvement</h3>
              <p className="text-gray-600">
                We constantly seek ways to enhance our processes, skills, and deliverables.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
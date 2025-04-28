import React from 'react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import FeatureSection from '@/components/about/FeatureSection';
import ValuesSection from '@/components/about/ValuesSection';
import StatsSection from '@/components/about/StatsSection';

const AboutPage = () => {
  return (
    <Layout>
      <PageHeader 
        title="About Us" 
        description="Learn about AdiTeke Software Solutions and our mission to deliver exceptional software development services."
      />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our talented professionals are the heart of <span className="font-bold">Adi<span className="text-blue-600">Teke</span></span>. We bring together expertise from diverse backgrounds to deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* CTO Card with inline styles */}
            <motion.div 
              className="bg-light rounded-xl overflow-hidden shadow-md flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div style={{ 
                width: '100%', 
                height: '320px', 
                backgroundColor: '#4F46E5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '60px', 
                  fontWeight: 'bold'
                }}>
                  MB
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2">Mulualem Berhanu</h3>
                <p className="text-primary font-medium mb-3">CTO & Founder</p>
                <p className="text-gray-600">
                  Mulualem has over 7 years of experience in software
                  development and technical leadership.
                </p>
              </div>
            </motion.div>

            {/* CEO Card with inline styles */}
            <motion.div 
              className="bg-light rounded-xl overflow-hidden shadow-md flex flex-col"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div style={{ 
                width: '100%', 
                height: '320px', 
                backgroundColor: '#3B82F6', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <div style={{ 
                  color: 'white', 
                  fontSize: '60px', 
                  fontWeight: 'bold'
                }}>
                  SK
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold mb-2">Samrawit Kassa</h3>
                <p className="text-primary font-medium mb-3">CEO</p>
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
                <i className="fas fa-arrow-right ml-2"></i>
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <FeatureSection />
      <ValuesSection />
      <StatsSection />
    </Layout>
  );
};

export default AboutPage;
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { DASHBOARD_FEATURES } from '@/lib/constants';

const ClientDashboardPreview = () => {
  return (
    <section className="py-20 bg-light">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Client Dashboard</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our custom client portal gives you real-time insights into your projects and allows seamless collaboration with our team.
          </p>
        </motion.div>
        
        <motion.div 
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-3xl"></div>
          <div className="relative p-4 md:p-8 bg-white rounded-3xl shadow-xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600&q=80" 
              alt="Client dashboard interface" 
              className="w-full rounded-xl shadow-lg"
            />
            <div className="absolute top-4 right-4 flex">
              <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
              <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
              <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {DASHBOARD_FEATURES.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
              whileHover={{ y: -5 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <i className={`fas ${feature.icon} text-xl`}></i>
              </div>
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link href="/dashboard">
            <Button className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors">
              Request Dashboard Demo
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ClientDashboardPreview;

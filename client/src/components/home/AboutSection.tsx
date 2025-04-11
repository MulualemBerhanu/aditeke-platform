import { motion } from 'framer-motion';

const AboutSection = () => {
  const features = [
    { title: "Expert Team", description: "Skilled professionals with diverse expertise", icon: "fa-users" },
    { title: "Quality Focused", description: "Committed to excellence in every project", icon: "fa-medal" },
    { title: "Innovation", description: "Embracing new technologies and ideas", icon: "fa-rocket" },
    { title: "Client Support", description: "Dedicated assistance throughout the process", icon: "fa-headset" }
  ];

  return (
    <section id="about" className="py-20 bg-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col-reverse lg:flex-row items-center">
          {/* About Content */}
          <motion.div 
            className="lg:w-1/2 mt-10 lg:mt-0 lg:pr-16"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">About AdiTeke Software Solutions</h2>
            <p className="text-gray-600 mb-6">
              At AdiTeke, we are passionate about developing innovative software solutions that solve complex business challenges. 
              With a team of experienced developers, designers, and strategists, we deliver high-quality products that exceed client expectations.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="flex items-start"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4 mt-1 flex-shrink-0">
                    <i className={`fas ${feature.icon}`}></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.a 
              href="/about"
              className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              Learn more about our story
              <i className="fas fa-arrow-right ml-2"></i>
            </motion.a>
          </motion.div>
          
          {/* Image Grid */}
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <motion.img 
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                alt="Team collaboration" 
                className="rounded-lg shadow-lg object-cover h-48 md:h-64"
                width="400"
                height="300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                alt="Team meeting" 
                className="rounded-lg shadow-lg object-cover h-48 md:h-64"
                width="400"
                height="300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img 
                src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                alt="Software development" 
                className="rounded-lg shadow-lg object-cover h-48 md:h-64"
                width="400"
                height="300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
              <motion.img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80" 
                alt="Project planning" 
                className="rounded-lg shadow-lg object-cover h-48 md:h-64"
                width="400"
                height="300"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

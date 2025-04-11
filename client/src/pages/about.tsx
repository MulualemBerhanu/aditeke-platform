import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  // Company values
  const values = [
    {
      title: "Innovation",
      description: "We constantly strive to create new solutions and stay ahead of technological advancements.",
      icon: "fa-lightbulb"
    },
    {
      title: "Excellence",
      description: "We pursue the highest standards in everything we do, from code quality to client service.",
      icon: "fa-star"
    },
    {
      title: "Integrity",
      description: "We conduct business with honesty, transparency, and strong ethical principles.",
      icon: "fa-shield-alt"
    },
    {
      title: "Collaboration",
      description: "We believe in teamwork and fostering strong partnerships with our clients.",
      icon: "fa-hands-helping"
    }
  ];

  // Team members
  const team = [
    {
      name: "Sarah Johnson",
      position: "CEO & Founder",
      bio: "Sarah has over 15 years of experience in software development and business leadership.",
      image: "https://randomuser.me/api/portraits/women/23.jpg"
    },
    {
      name: "Michael Chen",
      position: "CTO",
      bio: "Michael leads our technical team with expertise in AI, cloud computing, and system architecture.",
      image: "https://randomuser.me/api/portraits/men/45.jpg"
    },
    {
      name: "Elena Rodriguez",
      position: "Head of Design",
      bio: "Elena specializes in creating beautiful, intuitive user interfaces and experiences.",
      image: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      name: "David Kim",
      position: "Lead Developer",
      bio: "David is an expert in full-stack development with a focus on performance optimization.",
      image: "https://randomuser.me/api/portraits/men/32.jpg"
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: "2015",
      title: "Company Founded",
      description: "AdiTeke Software Solutions was established with a team of 5 developers."
    },
    {
      year: "2017",
      title: "First Major Client",
      description: "Secured our first enterprise client and expanded the team to 15 members."
    },
    {
      year: "2019",
      title: "International Expansion",
      description: "Opened our first international office and started serving clients globally."
    },
    {
      year: "2021",
      title: "AI Division Launch",
      description: "Launched our specialized AI solutions division to meet growing market demands."
    },
    {
      year: "2023",
      title: "50+ Team Members",
      description: "Grew to over 50 talented professionals and 200+ successful projects delivered."
    }
  ];

  return (
    <>
      <Helmet>
        <title>About Us | AdiTeke Software Solutions</title>
        <meta name="description" content="Learn about AdiTeke Software Solutions, our mission, values, team, and company history." />
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-gray-700 mb-8">
              Get to know the team and vision behind AdiTeke Software Solutions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-700 mb-8">
                At AdiTeke, our mission is to empower businesses through innovative software solutions that drive growth, efficiency, and competitive advantage. We are committed to delivering exceptional quality, maintaining strong client relationships, and staying at the forefront of technological advancements.
              </p>
              <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
              <p className="text-gray-700">
                We envision a world where every business, regardless of size or industry, can harness the power of cutting-edge software to achieve their full potential. Our goal is to be the leading global provider of transformative digital solutions that turn vision into reality.
              </p>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Team working together on a project" 
                className="rounded-lg shadow-lg w-full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from how we develop software to how we interact with our clients and each other.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mx-auto mb-6">
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
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
              Our talented professionals are the heart of AdiTeke. We bring together expertise from diverse backgrounds to deliver exceptional results.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div 
                key={index}
                className="bg-light rounded-xl overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.position}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              </motion.div>
            ))}
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

      {/* Timeline Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Since our founding, we've grown from a small team with big dreams to an industry-leading software development company.
            </p>
          </motion.div>
          
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-primary/20"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'} relative z-10`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-primary"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-12' : 'pl-12'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-md">
                      <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                      <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  
                  {/* Empty space for the other side */}
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-bg hero-pattern text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Work With Us?</h2>
            <p className="text-xl mb-8">
              Let's transform your ideas into reality with our expert team and innovative solutions.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button className="px-8 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors text-center w-full sm:w-auto">
                  Get in Touch
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="px-8 py-3 bg-white text-primary font-medium rounded-md hover:bg-white/90 transition-colors text-center w-full sm:w-auto">
                  Explore Our Services
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

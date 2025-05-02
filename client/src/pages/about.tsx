import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Code, 
  Shapes, 
  Globe, 
  Lightbulb, 
  Users, 
  Shield, 
  Handshake, 
  ChevronRight, 
  ArrowRight, 
  Sparkles 
} from "lucide-react";

const AboutPage = () => {
  // Company values
  const values = [
    {
      title: "Innovation",
      description:
        "We constantly strive to create new solutions and stay ahead of technological advancements.",
      icon: <Lightbulb size={24} className="text-primary" />,
    },
    {
      title: "Excellence",
      description:
        "We pursue the highest standards in everything we do, from code quality to client service.",
      icon: <Award size={24} className="text-primary" />,
    },
    {
      title: "Integrity",
      description:
        "We conduct business with honesty, transparency, and strong ethical principles.",
      icon: <Shield size={24} className="text-primary" />,
    },
    {
      title: "Collaboration",
      description:
        "We believe in teamwork and fostering strong partnerships with our clients.",
      icon: <Handshake size={24} className="text-primary" />,
    },
  ];

  // Team members removed - direct reference in JSX

  // Company milestones
  const milestones = [
    {
      title: "Company Founded",
      description:
        "AdiTeke Software Solutions was established with a team of 5 developers.",
    },
    {
      title: "First Major Client",
      description:
        "Secured our first enterprise client and expanded the team to 15 members.",
    },
    {
      title: "International Expansion",
      description:
        "Opened our first international office and started serving clients globally.",
    },
    {
      title: "AI Division Launch",
      description:
        "Launched our specialized AI solutions division to meet growing market demands.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>About Us | AdiTeke Software Solutions</title>
        <meta
          name="description"
          content="Learn about AdiTeke Software Solutions, our mission, values, team, and company history."
        />
      </Helmet>

      {/* Enhanced Hero Section with advanced visual elements */}
      <section className="relative py-32 overflow-hidden">
        {/* Gradient background with animated patterns */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-blue-50"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
        
        {/* Accent circles and shapes */}
        <motion.div 
          className="absolute top-20 right-[15%] w-64 h-64 rounded-full bg-primary/5 opacity-70"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.7, 0.5]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        
        <motion.div 
          className="absolute bottom-20 left-[10%] w-40 h-40 rounded-full bg-blue-400/5 opacity-60"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>
        
        {/* Floating elements */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary/10 rounded-full"
            style={{
              width: `${30 + i * 15}px`,
              height: `${30 + i * 15}px`,
              left: `${10 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
              opacity: 0.3 + (i * 0.1),
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, i % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative accent line */}
            <motion.div 
              className="h-1 w-24 bg-gradient-to-r from-primary/50 to-blue-400/50 mx-auto mb-8 rounded-full"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 96, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            ></motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Our Story
            </h1>
            
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get to know the team and vision behind{" "}
              <span className="font-bold">
                Adi<span className="text-blue-600">Teke</span>
              </span>{" "}
              Software Solutions — where innovation meets excellence.
            </p>
            
            {/* Decorative dots */}
            <div className="flex justify-center space-x-2 mt-6">
              {[...Array(3)].map((_, i) => (
                <motion.div 
                  key={i}
                  className="h-2 w-2 rounded-full bg-primary/60"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + (i * 0.1), duration: 0.4 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Mission & Vision Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white to-primary/5 opacity-50"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/5 rounded-tr-full"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-stretch gap-16">
            <motion.div
              className="lg:w-1/2 relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Mission Card */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-xl mb-10 relative z-10 backdrop-blur-sm 
                  border border-gray-100 overflow-hidden"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Card decorations */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-400/5 rounded-full"></div>
                
                <div className="relative z-10">
                  {/* Title with icon */}
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-blue-600 
                      flex items-center justify-center shadow-md mr-4">
                      <Shapes className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Our Mission</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    At{" "}
                    <span className="font-bold">
                      Adi<span className="text-blue-600">Teke</span>
                    </span>
                    , our mission is to empower businesses through innovative
                    software solutions that drive growth, efficiency, and
                    competitive advantage. We are committed to delivering
                    exceptional quality, maintaining strong client relationships,
                    and staying at the forefront of technological advancements.
                  </p>
                  
                  <div className="flex items-center text-primary font-medium text-sm mt-4">
                    <span>PURPOSEFUL TECHNOLOGY</span>
                    <div className="h-0.5 w-16 bg-primary/30 ml-3"></div>
                  </div>
                </div>
              </motion.div>
              
              {/* Vision Card */}
              <motion.div 
                className="bg-white rounded-xl p-8 shadow-xl relative z-10 backdrop-blur-sm 
                  border border-gray-100 overflow-hidden"
                whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                transition={{ duration: 0.3 }}
              >
                {/* Card decorations */}
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/5 rounded-full"></div>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-400/5 rounded-full"></div>
                
                <div className="relative z-10">
                  {/* Title with icon */}
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-600 to-primary 
                      flex items-center justify-center shadow-md mr-4">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold">Our Vision</h2>
                  </div>
                  
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    We envision a world where every business, regardless of size or
                    industry, can harness the power of cutting-edge software to
                    achieve their full potential. Our goal is to be the leading
                    global provider of transformative digital solutions that turn
                    vision into reality.
                  </p>
                  
                  <div className="flex items-center text-primary font-medium text-sm mt-4">
                    <span>ENDLESS POSSIBILITIES</span>
                    <div className="h-0.5 w-16 bg-primary/30 ml-3"></div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              className="lg:w-1/2 flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl
                transform hover:scale-[1.02] transition-transform duration-500">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent 
                  opacity-70 z-10 transition-opacity duration-300 hover:opacity-50"></div>
                
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=750&q=80"
                  alt="Team working together on a project"
                  className="w-full h-full object-cover"
                />
                
                {/* Image caption */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <h3 className="text-white text-2xl font-bold mb-2">Transforming Ideas</h3>
                    <p className="text-white/90 text-sm">
                      Our collaborative approach brings concepts to life through innovative technology solutions.
                    </p>
                  </motion.div>
                </div>
              </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from how we develop
              software to how we interact with our clients and each other.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-center group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 20px 30px rgba(0, 0, 0, 0.1)" }}
              >
                {/* Accent background shape */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-10 
                  group-hover:bg-primary/10 transition-all duration-300"></div>
                
                {/* Enhanced icon container with animations */}
                <motion.div 
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white mx-auto mb-6 shadow-md"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {value.icon}
                </motion.div>
                
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                  {value.title}
                </h3>
                
                <p className="text-gray-600">{value.description}</p>
                
                {/* Subtle divider line with animation */}
                <div className="h-0.5 w-12 bg-primary/30 mx-auto mt-4 mb-2 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Team Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary/5 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 inset-x-0 h-40 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
        <div className="absolute bottom-0 inset-x-0 h-40 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
        
        {/* Floating circles */}
        <motion.div 
          className="absolute top-20 left-10 w-40 h-40 rounded-full bg-primary/5"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 rounded-full bg-blue-400/5"
          animate={{ 
            y: [0, -15, 0],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        ></motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Section title with decorative elements */}
            <div className="inline-block mb-4 relative">
              <motion.div
                className="h-1 w-10 bg-primary/50 absolute -top-4 left-0"
                initial={{ width: 0 }}
                whileInView={{ width: 40 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.4 }}
              ></motion.div>
              <h2 className="text-3xl md:text-4xl font-bold relative">
                Meet Our Team
                <motion.div
                  className="h-1 w-10 bg-primary/50 absolute -bottom-4 right-0"
                  initial={{ width: 0 }}
                  whileInView={{ width: 40 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                ></motion.div>
              </h2>
            </div>
            
            <p className="text-gray-600 max-w-2xl mx-auto mt-6">
              Our talented professionals are the heart of{" "}
              <span className="font-bold">
                Adi<span className="text-blue-600">Teke</span>
              </span>
              . We bring together expertise from diverse backgrounds to deliver
              exceptional results.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Enhanced CTO Card */}
            <motion.div
              className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100 flex flex-col group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 }
              }}
            >
              {/* Image container with overlay effect */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                
                <img
                  src="/assets/team/mulualem.jpeg"
                  alt="Mulualem Berhanu"
                  className="w-full h-80 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle accent line */}
                <div className="h-1 w-0 bg-gradient-to-r from-primary to-blue-500 absolute bottom-0 left-0 right-0 z-20 group-hover:w-full transition-all duration-300 ease-out"></div>
              </div>
              
              <div className="p-8 flex flex-col flex-1 relative">
                {/* Decorative background shape */}
                <div className="absolute -top-8 right-0 w-32 h-32 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                {/* Content */}
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold mr-3">Mulualem Berhanu</h3>
                  <div className="h-px flex-grow bg-gray-200"></div>
                </div>
                
                <p className="text-primary font-medium mb-4 flex items-center">
                  <Code size={18} className="mr-2" />
                  CTO & Founder
                </p>
                
                <p className="text-gray-600 mb-6">
                  Mulualem has over 7 years of experience in software
                  development and technical leadership, with expertise in architecting
                  complex systems and innovative solutions.
                </p>
                
                {/* Skills/expertise indicators */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Software Architecture</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">AI Development</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Technical Leadership</span>
                </div>
              </div>
            </motion.div>

            {/* Enhanced CEO Card */}
            <motion.div
              className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100 flex flex-col group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ 
                y: -10, 
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                transition: { duration: 0.3 }
              }}
            >
              {/* Image container with overlay effect */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                
                <img
                  src="/assets/team/samrawit-kassa.jpg"
                  alt="Samrawit Kassa"
                  className="w-full h-80 object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Subtle accent line */}
                <div className="h-1 w-0 bg-gradient-to-r from-primary to-blue-500 absolute bottom-0 left-0 right-0 z-20 group-hover:w-full transition-all duration-300 ease-out"></div>
              </div>
              
              <div className="p-8 flex flex-col flex-1 relative">
                {/* Decorative background shape */}
                <div className="absolute -top-8 right-0 w-32 h-32 bg-primary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                
                {/* Content */}
                <div className="flex items-center mb-4">
                  <h3 className="text-xl font-bold mr-3">Samrawit Kassa</h3>
                  <div className="h-px flex-grow bg-gray-200"></div>
                </div>
                
                <p className="text-primary font-medium mb-4 flex items-center">
                  <Users size={18} className="mr-2" />
                  CEO
                </p>
                
                <p className="text-gray-600 mb-6">
                  Samrawit leads our business operations with expertise in
                  strategic planning, client relations, and organizational
                  growth, fostering a culture of innovation.
                </p>
                
                {/* Skills/expertise indicators */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Strategic Leadership</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Business Development</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">Client Relations</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced CTA button */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/careers">
              <Button 
                variant="outline" 
                className="bg-white border-primary/30 text-primary hover:bg-primary/5 shadow-sm group px-6 py-3"
              >
                <span>Join Our Team</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <p className="text-gray-500 text-sm mt-4">Discover exciting opportunities to work with our growing team</p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Timeline Section */}
      <section className="py-28 bg-gradient-to-br from-white via-primary/3 to-blue-50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_80%,rgba(59,130,246,0.1),transparent_20%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(59,130,246,0.1),transparent_25%)]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Decorative title decoration */}
            <div className="flex items-center justify-center mb-4 opacity-80">
              <div className="h-px w-10 bg-primary/60"></div>
              <Sparkles className="h-6 w-6 mx-3 text-primary/80" />
              <div className="h-px w-10 bg-primary/60"></div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Our Journey
            </h2>
            
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Since our founding, we've grown from a small team with big dreams
              to an industry-leading software development company.
            </p>
          </motion.div>

          <div className="relative">
            {/* Enhanced vertical timeline line with gradient */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 rounded-full"></div>

            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"} relative z-10`}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {/* Enhanced timeline dot with animation */}
                  <motion.div 
                    className="absolute left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-20"
                    whileInView={{
                      scale: [0.5, 1.2, 1],
                      opacity: [0, 1, 1]
                    }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-blue-500 shadow-md shadow-primary/20"></div>
                    {/* Pulsating animation */}
                    <div className="absolute inset-0 rounded-full border-2 border-primary/40 animate-ping opacity-20"></div>
                  </motion.div>

                  {/* Enhanced content card */}
                  <div
                    className={`w-5/12 ${index % 2 === 0 ? "text-right pr-12" : "pl-12"}`}
                  >
                    <motion.div 
                      className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 relative overflow-hidden group"
                      whileHover={{ 
                        y: -5, 
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Subtle accent gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className={`absolute top-0 ${index % 2 === 0 ? "right-0" : "left-0"} w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full -z-10 blur-xl opacity-60`}></div>
                      
                      {/* Year badge */}
                      <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        {2020 + index}
                      </div>
                      
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                        {milestone.title}
                      </h3>
                      
                      <p className="text-gray-600">{milestone.description}</p>
                      
                      {/* Animated line decoration */}
                      <div className="h-0.5 w-0 bg-primary/30 mt-4 group-hover:w-20 transition-all duration-500 ease-out"></div>
                    </motion.div>
                  </div>

                  {/* Empty space for the other side */}
                  <div className="w-5/12"></div>
                </motion.div>
              ))}
            </div>
            
            {/* Timeline end decoration */}
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 -bottom-4 w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-blue-400/40 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="w-3 h-3 rounded-full bg-white"></div>
            </motion.div>
          </div>
          
          {/* Future indication */}
          <div className="text-center mt-16 text-gray-500 text-sm font-medium tracking-wider">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              AND THE JOURNEY CONTINUES...
            </motion.p>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-800"></div>
        
        {/* Animated patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="diagonalHatch" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="40" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonalHatch)" />
          </svg>
        </div>
        
        {/* Animated circles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${90 + i * 40}px`,
              height: `${90 + i * 40}px`,
              left: `${10 + i * 15}%`,
              top: `${60 - (i % 3) * 20}%`,
              opacity: 0.1 + (i * 0.02),
            }}
            animate={{
              y: [0, -10, 0],
              x: [0, i % 2 === 0 ? 5 : -5, 0],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mx-auto mb-8 flex items-center justify-center rotate-12 shadow-xl"
            >
              <Shapes className="h-10 w-10 text-white" />
            </motion.div>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Ready to Transform Your Ideas?
            </motion.h2>
            
            <motion.p 
              className="text-xl mb-10 text-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              Let's collaborate to build innovative digital solutions that drive your business forward.
            </motion.p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link href="/contact">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Button className="px-8 py-6 bg-white text-primary hover:bg-white/90 font-medium rounded-xl transition-colors text-center w-full sm:w-auto shadow-lg">
                    Get in Touch
                  </Button>
                </motion.div>
              </Link>
              
              <Link href="/services">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <Button
                    variant="outline"
                    className="px-8 py-6 border-white text-white hover:bg-white/10 font-medium rounded-xl transition-colors text-center w-full sm:w-auto border-2"
                  >
                    Explore Our Services
                  </Button>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default AboutPage;

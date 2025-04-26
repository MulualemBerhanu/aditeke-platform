import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

// Import team images
import mulualemBase64 from './mulualem_base64.txt';
import samrawitImage from '@/assets/samrawit-kassa.jpg';

const TeamSection = () => {
  // Team members
  const team = [
    {
      name: "Mulualem Berhanu",
      position: "CTO & Founder",
      bio: "Mulualem has over 7 years of experience in software development and technical leadership.",
      // Use the imported base64 data
      image: `data:image/jpeg;base64,${mulualemBase64}`
    },
    {
      name: "Samrawit Kassa",
      position: "CEO",
      bio: "Samrawit leads our business operations with expertise in strategic planning, client relations, and organizational growth.",
      // Use the imported image
      image: samrawitImage
    }
  ];

  return (
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
  );
};

export default TeamSection;
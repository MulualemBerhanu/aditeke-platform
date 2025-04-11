import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { BlogPost } from '@shared/schema';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: blogPosts, isLoading, error } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  });

  // Blog categories
  const categories = [
    { label: 'All', value: 'all' },
    { label: 'Web Development', value: 'web-development' },
    { label: 'Mobile Development', value: 'mobile-development' },
    { label: 'AI & Machine Learning', value: 'ai-ml' },
    { label: 'Cloud Computing', value: 'cloud' },
    { label: 'Cybersecurity', value: 'security' }
  ];

  // Filter blog posts based on search term and category
  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <>
      <Helmet>
        <title>Blog | AdiTeke Software Solutions</title>
        <meta name="description" content="Read the latest articles, tutorials, and insights about software development, AI, cloud computing, and more from our experts at AdiTeke." />
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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Knowledge Hub</h1>
            <p className="text-xl text-gray-700 mb-8">
              Insights, guides, and tutorials from our team of experts
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-xl mx-auto">
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white shadow-sm"
              />
              <Button 
                className="bg-primary text-white sm:flex-shrink-0 w-full sm:w-auto"
                onClick={() => {/* Search functionality already implemented via state */}}
              >
                <i className="fas fa-search mr-2"></i>
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Content Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Main Content */}
            <div className="lg:w-2/3">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-3 mb-8">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.value
                        ? 'bg-primary text-white'
                        : 'bg-light text-gray-700 hover:bg-primary/10'
                    }`}
                    onClick={() => setSelectedCategory(category.value)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
              
              {isLoading ? (
                // Show skeleton loaders while loading
                <div className="space-y-8">
                  {Array(3).fill(null).map((_, index) => (
                    <div key={index} className="bg-light rounded-xl overflow-hidden shadow-sm animate-pulse">
                      <div className="h-48 bg-gray-300"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                // Show error message
                <div className="text-center text-red-500 bg-red-50 p-8 rounded-xl">
                  <p>Failed to load blog posts. Please try again later.</p>
                </div>
              ) : filteredPosts && filteredPosts.length > 0 ? (
                // Show blog posts
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <motion.article 
                      key={post.id}
                      className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <img 
                        src={post.thumbnail} 
                        alt={post.title} 
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                            {post.category}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold mb-3">
                          <Link href={`/blog/${post.id}`}>
                            <a className="hover:text-primary transition-colors">{post.title}</a>
                          </Link>
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {/* Display truncated content */}
                          {post.content.length > 150
                            ? post.content.substring(0, 150) + '...'
                            : post.content}
                        </p>
                        <Link href={`/blog/${post.id}`}>
                          <a className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors">
                            Read More
                            <i className="fas fa-arrow-right ml-2"></i>
                          </a>
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                // Show no results message
                <div className="text-center bg-light p-8 rounded-xl">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl mx-auto mb-4">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Posts Found</h3>
                  <p className="text-gray-600">
                    We couldn't find any blog posts that match your search criteria.
                  </p>
                </div>
              )}
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Popular Posts */}
              <div className="bg-light rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Popular Posts</h3>
                <div className="space-y-4">
                  {isLoading ? (
                    // Show skeleton loaders
                    Array(3).fill(null).map((_, index) => (
                      <div key={index} className="flex gap-3 animate-pulse">
                        <div className="h-16 w-16 bg-gray-300 rounded flex-shrink-0"></div>
                        <div className="flex-grow">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))
                  ) : blogPosts && blogPosts.length > 0 ? (
                    // Show top 3 posts
                    blogPosts.slice(0, 3).map((post) => (
                      <div key={post.id} className="flex gap-3">
                        <img 
                          src={post.thumbnail} 
                          alt={post.title} 
                          className="h-16 w-16 object-cover rounded flex-shrink-0"
                        />
                        <div>
                          <h4 className="font-medium line-clamp-2">
                            <Link href={`/blog/${post.id}`}>
                              <a className="hover:text-primary transition-colors">{post.title}</a>
                            </Link>
                          </h4>
                          <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>
              </div>
              
              {/* Categories */}
              <div className="bg-light rounded-xl p-6 shadow-sm mb-8">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Categories</h3>
                <ul className="space-y-2">
                  {categories.slice(1).map((category, index) => (
                    <li key={index}>
                      <button 
                        className="flex items-center justify-between w-full px-2 py-1 rounded hover:bg-primary/10 transition-colors text-left"
                        onClick={() => setSelectedCategory(category.value)}
                      >
                        <span>{category.label}</span>
                        <span className="bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-1">
                          {blogPosts?.filter(post => post.category === category.value).length || 0}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Newsletter */}
              <div className="bg-primary text-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Subscribe to Our Newsletter</h3>
                <p className="mb-4">Get the latest articles and insights delivered to your inbox.</p>
                <form className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    className="bg-white"
                  />
                  <Button className="w-full bg-accent text-white">
                    Subscribe
                  </Button>
                </form>
              </div>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Need Expert Advice?</h2>
            <p className="text-xl mb-8">
              Our team is ready to help you solve your technical challenges and achieve your business goals.
            </p>
            <Link href="/contact">
              <Button className="px-8 py-3 bg-accent text-white font-medium rounded-md hover:bg-accent/90 transition-colors">
                Get in Touch
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default BlogPage;

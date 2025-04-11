import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
};

const initialMessage: Message = {
  id: "welcome",
  sender: "bot",
  text: "👋 Hi there! I'm AdiTeke's AI assistant. How can I help you today?",
  timestamp: new Date(),
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };
  
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate bot response after a delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: "Thanks for your message! One of our team members will get back to you shortly.",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    }, 1000);
  };
  
  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-xl overflow-hidden mb-4"
            style={{ width: "350px" }}
          >
            {/* Chatbot Header */}
            <div className="bg-primary p-4 flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mr-3">
                  <i className="fas fa-robot"></i>
                </div>
                <div>
                  <h3 className="font-bold text-white">AdiTeke Assistant</h3>
                  <p className="text-white/80 text-sm">Online</p>
                </div>
              </div>
              <button
                className="text-white hover:text-accent transition-colors"
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {/* Messages Container */}
            <div className="h-96 p-4 overflow-y-auto bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${message.sender === "user" ? "justify-end" : ""}`}
                >
                  {message.sender === "bot" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-2 flex-shrink-0">
                      <i className="fas fa-robot text-xs"></i>
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.sender === "user"
                        ? "bg-primary text-white"
                        : "bg-primary/10"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>
            </div>
            
            {/* Message Input Form */}
            <div className="p-4 border-t">
              <form className="flex" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90 transition-colors"
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`w-16 h-16 rounded-full bg-primary shadow-lg flex items-center justify-center text-white hover:bg-primary/90 transition-colors ml-auto ${
          isOpen ? "hidden" : ""
        }`}
        onClick={toggleChat}
        aria-label="Open chat"
      >
        <i className="fas fa-comments text-xl"></i>
      </motion.button>
    </div>
  );
};

export default Chatbot;

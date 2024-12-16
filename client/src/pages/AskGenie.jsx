import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

// Simulated bot responses
const simulatedResponses = [
  "I can help you with that! Could you provide more details?",
  "Here's what I found that might help...",
  "Based on your question, I would suggest...",
  "Let me break this down for you...",
  "That's an interesting question! Here's my take..."
];

const Message = ({ message, isBot, user }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-4 ${isBot ? 'justify-start' : 'justify-end'} w-full`}
  >
    {isBot && (
      <Avatar className="h-10 w-10 border-2 border-purple-500/20">
        <Bot className="h-6 w-6 text-purple-500" />
        <AvatarFallback className="bg-purple-500/10">G</AvatarFallback>
      </Avatar>
    )}

    <div className={`flex flex-col gap-2 ${isBot ? 'items-start' : 'items-end'} max-w-[80%]`}>
      <Card
        className={`shadow-lg ${
          isBot ? 'bg-gray-900 border-purple-500/20' : 'bg-purple-700 border-none'
        }`}
      >
        <div className="px-4 py-3">
          <p className={`text-sm font-medium ${isBot ? 'text-gray-100' : 'text-white'}`}>{message}</p>
        </div>
      </Card>
      <span className="text-xs text-gray-400 px-1">
        {new Date().toLocaleTimeString()}
      </span>
    </div>

    {!isBot && (
      <Avatar className="h-10 w-10 border-2 border-purple-500/20">
        {user?.avatar ? (
          <AvatarImage src={user.avatar} alt={`${user.firstName}'s Avatar`} />
        ) : (
          <User className="h-6 w-6 text-purple-500" />
        )}
        <AvatarFallback className="bg-purple-500/10">
          {`${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`}
        </AvatarFallback>
      </Avatar>
    )}
  </motion.div>
);

const AskGenie = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { text: "Hi! I'm Genie, your AI assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, isBot = false) => {
    setMessages((prev) => [...prev, { text, isBot }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    addMessage(trimmedInput);
    setInput('');

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      addMessage(response, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 ml-[330px]">
      <div className="h-full flex flex-col max-w-4xl mx-auto w-full p-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto space-y-4 px-2">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <Message key={index} {...message} user={user} />
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-4"
                >
                  <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                    <Bot className="h-6 w-6 text-purple-500" />
                    <AvatarFallback className="bg-purple-500/10">G</AvatarFallback>
                  </Avatar>
                  <Card className="p-3 w-fit bg-gray-800 border-purple-500/20">
                    <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <Card className="bg-gray-800/50 border-purple-500/20 p-4 mt-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="min-h-[50px] max-h-[150px] resize-none bg-gray-900/50 
                         border-purple-500/20 text-gray-200 text-sm
                         placeholder:text-gray-500 focus:border-purple-500 
                         focus:ring-1 focus:ring-purple-500 rounded-lg px-3 py-2"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4
                           shadow-md hover:shadow-lg transition-all"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AskGenie;

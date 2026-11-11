'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm Faisal's AI assistant. Ask me anything about his experience, projects, or services! 👋"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, messages })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble connecting right now. Please try contacting Faisal directly at faisalabshar2002@gmail.com or call 03072173457." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What technologies do you know?",
    "Tell me about your projects",
    "What services do you offer?",
    "How can I contact you?"
  ];

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 right-4 top-4 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-primary/20"
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Header */}
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI Assistant</h3>
                  <p className="text-xs opacity-90">Online • Instant replies</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-primary/10 rounded-bl-none'
                    }`}
                    style={msg.role === 'assistant' ? { color: 'var(--foreground)' } : {}}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-primary/10 p-3 rounded-2xl rounded-bl-none">
                    <Loader2 size={20} className="animate-spin text-primary" />
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs opacity-70 mb-2" style={{ color: 'var(--foreground)' }}>Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => handleSend(), 100);
                      }}
                      className="text-xs px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-primary/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 rounded-lg border border-primary/20 focus:outline-none focus:border-primary transition-colors"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

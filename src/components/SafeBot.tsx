import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi! I'm SafeBot 🛡️ Your AI safety companion. I can help you with route safety, emergency features, and real-time guidance. How can I help you today?",
    sender: "bot",
    timestamp: "Now",
  },
];

const botResponses = [
  "Based on current data, your selected route has a safety score of 87/100. The well-lit areas along MG Road make it significantly safer after dark. 🌙",
  "I've detected a potential risk zone ahead near Sector 12. I recommend taking the alternate route via Park Avenue — it's only 2 minutes longer but much safer. 🛡️",
  "Your guardian contacts have been notified of your current location. They'll receive updates every 5 minutes during your journey. 👥",
  "The SOS feature is ready. If you feel unsafe, press and hold the SOS button for 3 seconds to alert emergency services and your trusted contacts. 🚨",
  "Great news! The crowd density along your route is moderate right now. This is a good time to travel. Stay safe! ✨",
];

const SafeBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
      timestamp: "Now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = botResponses[Math.floor(Math.random() * botResponses.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, text: response, sender: "bot", timestamp: "Now" },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/30 cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] glass-panel flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-primary-foreground text-sm">SafeBot AI</h3>
                <p className="text-primary-foreground/70 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-foreground/80 inline-block" />
                  Always active
                </p>
              </div>
              <div className="ml-auto">
                <Sparkles className="w-5 h-5 text-primary-foreground/60" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[340px] scrollbar-thin">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "bot" ? "gradient-primary" : "bg-accent"}`}>
                    {msg.sender === "bot" ? <Bot className="w-3.5 h-3.5 text-primary-foreground" /> : <User className="w-3.5 h-3.5 text-accent-foreground" />}
                  </div>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === "bot" ? "bg-secondary text-secondary-foreground rounded-bl-sm" : "gradient-primary text-primary-foreground rounded-br-sm"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary p-3 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask SafeBot for help..."
                  className="flex-1 bg-secondary/80 border-none rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={sendMessage}
                  className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SafeBot;

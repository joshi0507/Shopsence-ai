import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  X,
  Sparkles,
  Trash2,
  Maximize2,
  Minimize2,
  Loader2,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  uploadId?: string;
}

const AIChat = ({ isOpen, onClose, user, uploadId }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello ${user?.username || "there"}! I'm your ShopSense AI assistant. Ask me anything about your business data, trends, or recommendations.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Simulate AI response for now - in a real app, call an API
      // We'll use a timeout to mimic processing
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: generateMockResponse(input),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Chat error:", error);
      setIsLoading(false);
    }
  };

  const generateMockResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("revenue") || q.includes("sales")) {
      return "Based on your latest upload, your total revenue is looking solid. I've noticed a 12% increase in average ticket size compared to the previous period. Would you like to see a breakdown by category?";
    } else if (q.includes("product") || q.includes("best selling")) {
      return "Your best-selling product continues to be the USB-C Cable. However, the 'Wireless Mouse' is showing the highest growth rate this week. Implementing a bundle deal for these two could potentially lift revenue by 5-8%.";
    } else if (q.includes("customer") || q.includes("persona")) {
      return "I've identified 4 distinct customer personas. Your 'Champions' segment represents 15% of your base but contributes 42% of revenue. Focus on loyalty programs to maintain this high-value group.";
    } else {
      return "That's an interesting question. I'm analyzing your data to find the best insights. Currently, your operational metrics are within healthy ranges, with a positive trend in customer retention.";
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: `Chat cleared. How else can I help you today, ${user?.username || "User"}?`,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className={`fixed right-0 top-0 h-screen z-50 bg-[#1A2238]/95 backdrop-blur-2xl border-l border-white/10 flex flex-col transition-all duration-300 shadow-2xl ${
            isMaximized ? "w-full md:w-[600px]" : "w-full md:w-96"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold leading-none">
                  AI Insight Engine
                </h3>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live Context Active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
              >
                {isMaximized ? (
                  <Minimize2 size={18} />
                ) : (
                  <Maximize2 size={18} />
                )}
              </button>
              <button
                onClick={clearChat}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
                title="Clear Chat"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-purple-500/10 text-purple-400"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot size={18} />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                      : "bg-cyan-500 text-void font-medium rounded-tr-none"
                  }`}
                >
                  {msg.content}
                  <div
                    className={`text-[10px] mt-2 opacity-50 ${msg.role === "user" ? "text-void/70" : "text-gray-500"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-cyan-400" />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/5 border-t border-white/10">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask about your trends..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                  input.trim() && !isLoading
                    ? "text-cyan-400 hover:bg-cyan-400/10"
                    : "text-gray-600 cursor-not-allowed"
                }`}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <p className="text-[10px] text-gray-500">
                Press Enter to send. I have access to your current data history.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChat;

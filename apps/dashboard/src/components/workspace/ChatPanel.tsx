"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip } from "lucide-react";
import React, { useState } from "react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm processing your request. This is a simulated response.",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full bg-[#050505] border-l border-[#202020] rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#202020] bg-[#0a0a0a]">
        <h3 className="text-sm font-semibold text-white">Chat</h3>
        <p className="text-xs text-[#6B7280] mt-1">Conversation with AI</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message, i) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.05 }}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-[#7C6BFF]/20 border border-[#7C6BFF]/30 flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs text-[#7C6BFF] font-bold">A</span>
                </div>
              )}

              <div
                className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#7C6BFF] text-white rounded-br-none"
                    : "bg-[#111] text-[#A1A1AA] border border-[#202020] rounded-bl-none"
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            className="flex gap-2 items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-7 h-7 rounded-full bg-[#7C6BFF]/20" />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-[#7C6BFF] rounded-full"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[#202020] bg-[#0a0a0a]">
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-[#6B7280] hover:text-[#7C6BFF] transition-colors"
          >
            <Paperclip size={18} />
          </motion.button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-[#111] border border-[#202020] rounded-lg px-3 py-2 text-sm text-white placeholder-[#6B7280] outline-none focus:border-[#7C6BFF]/50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 text-[#7C6BFF] hover:bg-[#7C6BFF]/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

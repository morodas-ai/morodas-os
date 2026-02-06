"use client";

import { useState } from "react";
import { Send, Bot, User } from "lucide-react";
import clsx from "clsx";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Hello! How can I help you today?" },
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages([...messages, newMessage]);
    setInput("");

    // Simulate response
    setTimeout(() => {
        const response: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I'm a demo agent. I can't really think yet!",
        };
        setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-r-xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={clsx("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                msg.role === "user" ? "bg-slate-700" : "bg-emerald-500"
            )}>
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} className="text-white" />}
            </div>
            <div className={clsx(
                "max-w-[80%] p-4 rounded-xl text-sm leading-relaxed",
                msg.role === "user" ? "bg-slate-700 text-slate-50" : "bg-slate-800 text-slate-300 border border-slate-700"
            )}>
                {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-br-xl">
        <div className="flex gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500"
            />
            <button 
                onClick={handleSend}
                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors"
            >
                <Send size={20} />
            </button>
        </div>
      </div>
    </div>
  );
}

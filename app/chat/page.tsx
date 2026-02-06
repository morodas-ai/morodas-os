"use client";

import { useState, useEffect } from "react";
import ChatSidebarClient from "@/components/chat/ChatSidebarClient";
import ChatWindowClient from "@/components/chat/ChatWindowClient";

interface Session {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string;
}

export default function ChatPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      const { data } = await res.json();
      setSessions(data || []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleNewChat = () => {
    setActiveSessionId(null);
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
  };

  const handleSessionCreated = (id: string) => {
    setActiveSessionId(id);
    fetchSessions(); // リストを更新
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex rounded-xl border border-slate-700 overflow-hidden shadow-xl">
      <ChatSidebarClient
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onRefresh={fetchSessions}
      />
      <div className="flex-1">
        <ChatWindowClient sessionId={activeSessionId} onSessionCreated={handleSessionCreated} />
      </div>
    </div>
  );
}

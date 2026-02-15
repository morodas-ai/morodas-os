"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";
import type { ChatSession } from "@/types";

interface ChatSidebarClientProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onRefresh: () => void;
}

export default function ChatSidebarClient({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onRefresh,
}: ChatSidebarClientProps) {
    const deleteSession = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("このチャットを削除しますか？")) return;

        try {
            await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
            onRefresh();
        } catch (error) {
            console.error("Failed to delete session:", error);
        }
    };

    const formatTime = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ja });
        } catch {
            return "";
        }
    };

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full rounded-l-xl">
            <div className="p-4 border-b border-gray-200">
                <button
                    onClick={onNewChat}
                    className="btn-primary w-full rounded-lg py-2.5 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #B85C38, #D4956B)', color: 'white' }}
                >
                    <Plus size={16} />
                    新規チャット
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.length === 0 ? (
                    <div className="text-center text-gray-400 py-8 text-sm">
                        チャット履歴がありません
                    </div>
                ) : (
                    sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => onSelectSession(session.id)}
                            className={clsx(
                                "p-3 rounded-lg cursor-pointer transition-colors group relative",
                                activeSessionId === session.id
                                    ? "bg-primary-100 border border-primary-300"
                                    : "hover:bg-gray-100"
                            )}
                        >
                            <div className="flex items-center gap-3 text-gray-600 group-hover:text-gray-900">
                                <MessageSquare
                                    size={16}
                                    className={clsx(
                                        activeSessionId === session.id ? "text-primary-500" : "text-gray-400 group-hover:text-primary-500"
                                    )}
                                />
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium text-sm">{session.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{session.lastMessage || formatTime(session.updatedAt)}</p>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import clsx from "clsx";

interface Session {
    id: string;
    title: string;
    lastMessage: string;
    updatedAt: string;
}

interface ChatSidebarClientProps {
    sessions: Session[];
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
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full rounded-l-xl">
            <div className="p-4 border-b border-slate-700">
                <button
                    onClick={onNewChat}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus size={16} />
                    新規チャット
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 text-sm">
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
                                    ? "bg-slate-700 border border-emerald-500/50"
                                    : "hover:bg-slate-700"
                            )}
                        >
                            <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
                                <MessageSquare
                                    size={16}
                                    className={clsx(
                                        activeSessionId === session.id ? "text-emerald-500" : "text-slate-500 group-hover:text-emerald-500"
                                    )}
                                />
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate font-medium text-sm">{session.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{session.lastMessage || formatTime(session.updatedAt)}</p>
                                </div>
                                <button
                                    onClick={(e) => deleteSession(session.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500 transition-all"
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

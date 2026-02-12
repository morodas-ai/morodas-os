"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import clsx from "clsx";
import type { Message } from "@/types";

interface ChatWindowClientProps {
    sessionId: string | null;
    onSessionCreated: (sessionId: string) => void;
}

export default function ChatWindowClient({ sessionId, onSessionCreated }: ChatWindowClientProps) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // セッション変更時にメッセージを取得
    useEffect(() => {
        if (sessionId) {
            fetchMessages(sessionId);
        } else {
            setMessages([]);
        }
    }, [sessionId]);

    // 自動スクロール
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const fetchMessages = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/chat/sessions/${id}`);
            const { data } = await res.json();
            setMessages(data?.messages || []);
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
        setIsLoading(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isSending) return;

        const userContent = input;
        setInput("");
        setIsSending(true);

        let currentSessionId = sessionId;

        // セッションがない場合は新規作成
        if (!currentSessionId) {
            try {
                const res = await fetch("/api/chat/sessions", {
                    method: "POST",
                });
                const { data } = await res.json();
                currentSessionId = data.id;
                onSessionCreated(data.id);
            } catch (error) {
                console.error("Failed to create session:", error);
                setIsSending(false);
                return;
            }
        }

        // ユーザーメッセージを先にUIに表示
        const tempUserMessage: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content: userContent,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempUserMessage]);

        try {
            const res = await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: userContent }),
            });
            const { data } = await res.json();

            // 一時メッセージを実際のメッセージに置換し、AI応答を追加
            setMessages((prev) => [
                ...prev.filter((m) => m.id !== tempUserMessage.id),
                data.userMessage,
                data.assistantMessage,
            ]);
        } catch (error) {
            console.error("Failed to send message:", error);
        }

        setIsSending(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-r-xl">
            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        読み込み中...
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <Bot size={48} className="mb-4 text-primary-500" />
                        <p className="text-lg mb-2 text-gray-700">MORODAS AI</p>
                        <p className="text-sm text-gray-400">何でも聞いてください</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={clsx("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                        >
                            <div
                                className={clsx(
                                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                    msg.role === "user" ? "bg-primary-50" : "bg-primary-500"
                                )}
                            >
                                {msg.role === "user" ? <User size={16} className="text-primary-700" /> : <Bot size={16} className="text-white" />}
                            </div>
                            <div
                                className={clsx(
                                    "max-w-[80%] p-4 rounded-xl text-sm leading-relaxed",
                                    msg.role === "user"
                                        ? "bg-primary-50 text-gray-800 border border-primary-200"
                                        : "bg-gray-50 text-gray-700 border border-gray-200"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                {isSending && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-500">
                            <Loader2 size={16} className="animate-spin text-white" />
                        </div>
                        <div className="bg-gray-50 text-gray-500 p-4 rounded-xl text-sm border border-gray-200">
                            考え中...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 入力欄 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-br-xl">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-800 focus:outline-none focus:border-primary-500 placeholder-gray-400"
                        disabled={isSending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isSending || !input.trim()}
                        className="bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

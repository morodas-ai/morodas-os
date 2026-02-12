"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot, Sparkles, Minimize2, HelpCircle } from "lucide-react";
import clsx from "clsx";
import { initialQuickReplies, getFollowUps } from "@/lib/chat-constants";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface GlobalAIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}




export default function GlobalAIAssistant({ isOpen, onClose }: GlobalAIAssistantProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "こんにちは！MORODAS AIアシスタントです。\n何でもお気軽にお聞きください。",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const lastMessage = messages[messages.length - 1];
    const showInitialSuggestions = userMessageCount === 0;
    const showFollowUps = !isLoading && userMessageCount > 0 && lastMessage?.role === "assistant";

    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!isOpen) return null;

    const handleSend = async (text?: string) => {
        const messageText = text || input.trim();
        if (!messageText || isLoading) return;

        setShowGuide(false);

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // セッションがなければ作成
            let currentSessionId = sessionId;
            if (!currentSessionId) {
                const sessionRes = await fetch("/api/chat/sessions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title: "AI Assistant" }),
                });
                const sessionData = await sessionRes.json();
                if (sessionData.success && sessionData.data?.id) {
                    currentSessionId = sessionData.data.id;
                    setSessionId(currentSessionId);
                } else {
                    throw new Error("Failed to create session");
                }
            }

            // メッセージ送信
            const res = await fetch(`/api/chat/sessions/${currentSessionId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: messageText }),
            });

            if (res.ok) {
                const result = await res.json();
                const aiContent =
                    result?.data?.assistantMessage?.content ||
                    result?.assistant?.content ||
                    result?.data?.content ||
                    "承りました。処理中です。";
                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: aiContent,
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, assistantMessage]);
            } else {
                const fallbackMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "サーバーとの通信に失敗しました。もう一度お試しください。",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, fallbackMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "接続エラーが発生しました。ネットワーク状態を確認してください。",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }

        setIsLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            handleSend();
        }
    };

    // Minimized state
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-2xl shadow-primary-500/30 flex items-center justify-center hover:scale-110 transition-transform"
            >
                <Bot size={24} />
                {messages.length > 1 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-bold">
                        {messages.filter((m) => m.role === "assistant").length}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[90] w-[400px] max-h-[600px] flex flex-col bg-foreground border border-sidebar-hover/80 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-600 border-b border-primary-500/30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Ask MORODAS</h3>
                        <p className="text-[10px] text-teal-100/80">AIがお答えします。お気軽にどうぞ。</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Minimize2 size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className={clsx(
                                "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                msg.role === "user"
                                    ? "bg-primary-500 text-white rounded-br-md"
                                    : "bg-sidebar text-surface-200 rounded-bl-md border border-sidebar-hover/50"
                            )}
                        >
                            {msg.content.split("\n").map((line, i) => (
                                <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-sidebar border border-sidebar-hover/50 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* 文脈別フォローアップボタン（AI応答後に表示） */}
                {showFollowUps && (
                    <div className="space-y-2 pt-1">
                        <div className="flex flex-col gap-1.5">
                            {getFollowUps(lastMessage.content).map((q) => (
                                <button
                                    key={q.text}
                                    onClick={() => handleSend(q.text)}
                                    className="text-left text-xs px-3 py-2.5 rounded-xl bg-sidebar/80 text-surface-300 hover:bg-primary-500/15 hover:text-primary-300 border border-sidebar-hover/50 hover:border-primary-500/40 transition-all"
                                >
                                    <span className="mr-1.5">{q.emoji}</span>
                                    {q.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* 初期表示: クイックリプライ + ガイド */}
            {showInitialSuggestions && (
                <div className="px-4 pb-3 space-y-2 border-t border-sidebar-hover/30 pt-3">
                    {/* ガイドトグル */}
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1.5 text-[11px] text-muted hover:text-primary-400 transition-colors"
                    >
                        <HelpCircle size={13} />
                        何を聞けばいいかわからない？
                    </button>

                    {showGuide && (
                        <div className="bg-sidebar/60 rounded-xl p-3 text-xs text-muted leading-relaxed border border-sidebar-hover/30">
                            以下のボタンをタップするだけでOKです。
                            自由に入力しても大丈夫ですよ。
                        </div>
                    )}

                    {/* クイックリプライボタン */}
                    <div className="flex flex-col gap-1.5">
                        {initialQuickReplies.map((q) => (
                            <button
                                key={q.text}
                                onClick={() => handleSend(q.text)}
                                className="text-left text-xs px-3 py-2.5 rounded-xl bg-sidebar/80 text-surface-300 hover:bg-primary-500/15 hover:text-primary-300 border border-sidebar-hover/50 hover:border-primary-500/40 transition-all"
                            >
                                <span className="mr-1.5">{q.emoji}</span>
                                {q.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-sidebar-hover/50 bg-sidebar/30">
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを送信..."
                        className="flex-1 bg-sidebar border border-sidebar-hover rounded-xl px-4 py-2.5 text-sm text-white placeholder-surface-500 focus:outline-none focus:border-primary-500 transition-colors"
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className={clsx(
                            "p-2.5 rounded-xl transition-all",
                            input.trim() && !isLoading
                                ? "bg-primary-500 text-white hover:bg-primary-400 shadow-lg shadow-primary-500/20"
                                : "bg-sidebar-hover text-surface-500 cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

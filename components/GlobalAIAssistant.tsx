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
                className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                style={{
                    background: "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    color: "#FFFFFF",
                    boxShadow: "0 8px 24px rgba(184, 92, 56, 0.35)",
                }}
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
        <div
            className="fixed bottom-6 right-6 z-[90] w-[400px] max-h-[600px] flex flex-col rounded-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
            style={{
                backgroundColor: "var(--color-surface-50)",
                border: "2px solid var(--color-surface-200)",
                boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
        >
            {/* Header — solid gradient, no transparency */}
            <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                    background: "linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))",
                    borderBottom: "2px solid var(--color-primary-800)",
                }}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-primary-800)" }}
                    >
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Ask MORODAS</h3>
                        <p className="text-[10px]" style={{ color: "#FFE0CC" }}>AIがお答えします。お気軽にどうぞ。</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "#FFD6C0" }}
                    >
                        <Minimize2 size={14} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "#FFD6C0" }}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Messages — solid background */}
            <div
                className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[350px]"
                style={{ backgroundColor: "var(--color-surface-50)" }}
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        <div
                            className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                            style={
                                msg.role === "user"
                                    ? {
                                        backgroundColor: "var(--color-primary-500)",
                                        color: "#FFFFFF",
                                        borderBottomRightRadius: "6px",
                                    }
                                    : {
                                        backgroundColor: "var(--color-surface-100)",
                                        color: "var(--color-foreground)",
                                        border: "1px solid var(--color-surface-200)",
                                        borderBottomLeftRadius: "6px",
                                    }
                            }
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
                        <div
                            className="rounded-2xl px-4 py-3"
                            style={{
                                backgroundColor: "var(--color-surface-100)",
                                border: "1px solid var(--color-surface-200)",
                                borderBottomLeftRadius: "6px",
                            }}
                        >
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary-400)", animationDelay: "0ms" }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary-400)", animationDelay: "150ms" }} />
                                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: "var(--color-primary-400)", animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                {/* フォローアップボタン */}
                {showFollowUps && (
                    <div className="space-y-2 pt-1">
                        <div className="flex flex-col gap-1.5">
                            {getFollowUps(lastMessage.content).map((q) => (
                                <button
                                    key={q.text}
                                    onClick={() => handleSend(q.text)}
                                    className="text-left text-xs px-3 py-2.5 rounded-xl transition-all"
                                    style={{
                                        backgroundColor: "var(--color-surface-100)",
                                        color: "var(--color-foreground)",
                                        border: "1px solid var(--color-surface-200)",
                                    }}
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
                <div
                    className="px-4 pb-3 space-y-2 pt-3"
                    style={{
                        borderTop: "1px solid var(--color-surface-200)",
                        backgroundColor: "var(--color-surface-50)",
                    }}
                >
                    {/* ガイドトグル */}
                    <button
                        onClick={() => setShowGuide(!showGuide)}
                        className="flex items-center gap-1.5 text-[11px] transition-colors"
                        style={{ color: "var(--color-surface-300)" }}
                    >
                        <HelpCircle size={13} />
                        何を聞けばいいかわからない？
                    </button>

                    {showGuide && (
                        <div
                            className="rounded-xl p-3 text-xs leading-relaxed"
                            style={{
                                backgroundColor: "var(--color-surface-100)",
                                color: "var(--color-foreground)",
                                border: "1px solid var(--color-surface-200)",
                            }}
                        >
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
                                className="text-left text-xs px-3 py-2.5 rounded-xl transition-all"
                                style={{
                                    backgroundColor: "var(--color-surface-100)",
                                    color: "var(--color-foreground)",
                                    border: "1px solid var(--color-surface-200)",
                                }}
                            >
                                <span className="mr-1.5">{q.emoji}</span>
                                {q.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input — solid colors only */}
            <div
                className="p-3"
                style={{
                    borderTop: "1px solid var(--color-surface-200)",
                    backgroundColor: "var(--color-surface-100)",
                }}
            >
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="メッセージを送信..."
                        className="flex-1 rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                        style={{
                            backgroundColor: "var(--color-surface-50)",
                            color: "var(--color-foreground)",
                            border: "1px solid var(--color-surface-200)",
                        }}
                        disabled={isLoading}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 rounded-xl transition-all"
                        style={
                            input.trim() && !isLoading
                                ? {
                                    backgroundColor: "var(--color-primary-500)",
                                    color: "#FFFFFF",
                                    boxShadow: "0 4px 12px rgba(184, 92, 56, 0.3)",
                                }
                                : {
                                    backgroundColor: "var(--color-surface-200)",
                                    color: "var(--color-surface-300)",
                                    cursor: "not-allowed",
                                }
                        }
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

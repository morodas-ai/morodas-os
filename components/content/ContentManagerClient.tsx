"use client";

import { useState } from "react";
import { List, Calendar as CalendarIcon, Edit, Plus, X, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ContentItem {
    id: string;
    title: string;
    platform: string;
    type: string;
    status: string;
    scheduledAt: string | null;
    publishedAt: string | null;
}

const statusColors: Record<string, string> = {
    idea: "bg-slate-500/10 text-slate-500",
    draft: "bg-yellow-500/10 text-yellow-500",
    review: "bg-blue-500/10 text-blue-500",
    scheduled: "bg-purple-500/10 text-purple-500",
    published: "bg-emerald-500/10 text-emerald-500",
};

const statusLabels: Record<string, string> = {
    idea: "アイデア",
    draft: "下書き",
    review: "レビュー",
    scheduled: "予約済",
    published: "公開済",
};

const platforms = ["note", "x", "youtube", "instagram", "tiktok"];

export default function ContentManagerClient({ initialContent }: { initialContent: ContentItem[] }) {
    const [view, setView] = useState<"table" | "calendar">("table");
    const [content, setContent] = useState(initialContent);
    const [isAdding, setIsAdding] = useState(false);
    const [newContent, setNewContent] = useState({ title: "", platform: "note", status: "idea" });

    const createContent = async () => {
        if (!newContent.title) return;
        try {
            const res = await fetch("/api/content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newContent),
            });
            const { data } = await res.json();
            setContent([data, ...content]);
            setNewContent({ title: "", platform: "note", status: "idea" });
            setIsAdding(false);
        } catch (error) {
            console.error("Failed to create content:", error);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await fetch("/api/content", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status }),
            });
            setContent(content.map((c) => (c.id === id ? { ...c, status } : c)));
        } catch (error) {
            console.error("Failed to update content:", error);
        }
    };

    const deleteContent = async (id: string) => {
        if (!confirm("削除しますか？")) return;
        try {
            await fetch(`/api/content?id=${id}`, { method: "DELETE" });
            setContent(content.filter((c) => c.id !== id));
        } catch (error) {
            console.error("Failed to delete content:", error);
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* ヘッダー */}
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-50">コンテンツスケジュール</h3>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-emerald-500 hover:text-emerald-400 flex items-center gap-1 text-sm"
                    >
                        <Plus size={16} /> 新規作成
                    </button>
                    <div className="flex bg-slate-900 rounded-lg p-1">
                        <button
                            onClick={() => setView("table")}
                            className={`p-2 rounded-md transition-colors ${view === "table" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setView("calendar")}
                            className={`p-2 rounded-md transition-colors ${view === "calendar" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}
                        >
                            <CalendarIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 新規作成モーダル */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 w-96 border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-50">新規コンテンツ</h3>
                            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">タイトル</label>
                                <input
                                    type="text"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent({ ...newContent, title: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50"
                                    placeholder="記事タイトル"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">プラットフォーム</label>
                                <select
                                    value={newContent.platform}
                                    onChange={(e) => setNewContent({ ...newContent, platform: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50"
                                >
                                    {platforms.map((p) => (
                                        <option key={p} value={p}>{p.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={createContent} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium">
                                作成
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* テーブルビュー */}
            {view === "table" ? (
                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium">タイトル</th>
                            <th className="p-4 font-medium">プラットフォーム</th>
                            <th className="p-4 font-medium">ステータス</th>
                            <th className="p-4 font-medium">日付</th>
                            <th className="p-4 font-medium"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {content.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="p-4 font-medium text-slate-50">{item.title}</td>
                                <td className="p-4 text-slate-400 uppercase">{item.platform}</td>
                                <td className="p-4">
                                    <select
                                        value={item.status}
                                        onChange={(e) => updateStatus(item.id, e.target.value)}
                                        className={`px-2 py-1 rounded text-xs font-medium bg-transparent border-0 cursor-pointer ${statusColors[item.status]}`}
                                    >
                                        {Object.entries(statusLabels).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="p-4 text-slate-400">
                                    {item.publishedAt ? format(new Date(item.publishedAt), "yyyy/MM/dd") :
                                        item.scheduledAt ? format(new Date(item.scheduledAt), "yyyy/MM/dd 予定") : "-"}
                                </td>
                                <td className="p-4 text-right flex gap-2 justify-end">
                                    <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                                        <Edit size={16} />
                                    </button>
                                    <button onClick={() => deleteContent(item.id)} className="p-2 hover:bg-red-900/30 rounded-lg text-slate-400 hover:text-red-500">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {content.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    コンテンツがありません。「新規作成」から追加してください。
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            ) : (
                <div className="p-12 text-center text-slate-500 h-96 flex flex-col items-center justify-center">
                    <CalendarIcon size={48} className="mb-4 opacity-50" />
                    <p>カレンダービュー（準備中）</p>
                    <p className="text-sm mt-2">今後のアップデートで実装予定</p>
                </div>
            )}
        </div>
    );
}

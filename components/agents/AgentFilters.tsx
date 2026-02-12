"use client";

import { Filter, Search } from "lucide-react";

export default function AgentFilters() {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                    type="text"
                    placeholder="エージェント検索..."
                    className="w-full bg-white border border-primary-200 rounded-lg pl-10 pr-4 py-2 text-foreground focus:outline-none focus:border-primary-500 transition-colors"
                />
            </div>

            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-lg text-muted hover:text-foreground hover:border-primary-400 transition-colors">
                    <Filter size={16} />
                    <span>タイプ</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-lg text-muted hover:text-foreground hover:border-primary-400 transition-colors">
                    <Filter size={16} />
                    <span>ステータス</span>
                </button>
            </div>
        </div>
    );
}

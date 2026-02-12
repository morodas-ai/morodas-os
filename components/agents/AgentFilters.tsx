"use client";

import { Filter, Search } from "lucide-react";

export default function AgentFilters() {
    return (
        <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" size={18} />
                <input
                    type="text"
                    placeholder="Search agents..."
                    className="w-full bg-sidebar border border-sidebar-hover rounded-lg pl-10 pr-4 py-2 text-surface-200 focus:outline-none focus:border-primary-500 transition-colors"
                />
            </div>

            <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-sidebar border border-sidebar-hover rounded-lg text-surface-300 hover:text-white hover:border-foreground transition-colors">
                    <Filter size={16} />
                    <span>Type</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-sidebar border border-sidebar-hover rounded-lg text-surface-300 hover:text-white hover:border-foreground transition-colors">
                    <Filter size={16} />
                    <span>Status</span>
                </button>
            </div>
        </div>
    );
}

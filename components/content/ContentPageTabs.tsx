"use client";

import { useState } from "react";
import { Zap, FileText } from "lucide-react";
import ContentManagerClient from "./ContentManagerClient";
import ContentPipelineClient from "./ContentPipelineClient";

interface ContentItem {
    id: string;
    title: string;
    platform: string;
    type: string;
    status: string;
    scheduledAt: string | null;
    publishedAt: string | null;
}

interface ContentIdea {
    id: string;
    title: string;
    source: string | null;
    sourceUrl: string | null;
    angle: string | null;
    score: number;
    keywords: string | null;
    summary: string | null;
    status: string;
    articleBody: string | null;
    articleMeta: string | null;
    wpPostId: number | null;
    wpPostUrl: string | null;
    createdAt: string;
    updatedAt: string;
}

export default function ContentPageTabs({
    initialContent,
    initialIdeas,
}: {
    initialContent: ContentItem[];
    initialIdeas: ContentIdea[];
}) {
    const [activeTab, setActiveTab] = useState<"pipeline" | "content">("pipeline");

    const pipelineBadge = initialIdeas.filter(
        (i) => i.status === "candidate" || i.status === "draft"
    ).length;

    return (
        <div>
            {/* Tab Buttons */}
            <div className="flex gap-1 mb-6">
                <button
                    onClick={() => setActiveTab("pipeline")}
                    className={`filter-pill flex items-center gap-2 ${activeTab === "pipeline" ? "active" : ""}`}
                >
                    <Zap size={16} />
                    パイプライン
                    {pipelineBadge > 0 && (
                        <span className="bg-primary-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                            {pipelineBadge}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("content")}
                    className={`filter-pill flex items-center gap-2 ${activeTab === "content" ? "active" : ""}`}
                >
                    <FileText size={16} />
                    コンテンツ一覧
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "pipeline" ? (
                <ContentPipelineClient initialIdeas={initialIdeas} />
            ) : (
                <ContentManagerClient initialContent={initialContent} />
            )}
        </div>
    );
}

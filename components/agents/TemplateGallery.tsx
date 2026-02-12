"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AgentTemplateCard from "./AgentTemplateCard";

// Template Definition based on NoimosAI & MORODAS OS Spec
const templates = [
    {
        title: "AIブログ記事生成",
        role: "コンテンツ自動化",
        description: "トレンドリサーチからSEO最適化された記事を自動生成し、ブログに投稿します。",
        integrations: ["Search", "AI", "Web"],
        type: "content_blog"
    },
    {
        title: "マーケット情報収集",
        role: "市場インテリジェンス",
        description: "競合・業界ニュースを自動収集し、ビジネスインサイトをレポートにまとめます。",
        integrations: ["X", "Search", "Web"],
        type: "market_intel"
    },
    {
        title: "SNSトレンド分析",
        role: "ソーシャル分析",
        description: "X(Twitter)の投稿トレンドを分析し、注目トピックと最適な投稿タイミングを提案します。",
        integrations: ["X", "Analytics"],
        type: "social_trend"
    },
    {
        title: "日次ニュースダイジェスト",
        role: "情報キュレーション",
        description: "テック・AI・ビジネスニュースを毎日自動収集し、要約レポートを生成します。",
        integrations: ["Search", "Web", "AI"],
        type: "news_digest"
    },
    {
        title: "ワークフロー自動化",
        role: "業務効率化",
        description: "繰り返しタスクをn8nワークフローで自動化し、生産性を最大化します。",
        integrations: ["n8n", "AI", "API"],
        type: "workflow_auto"
    }
];

export default function TemplateGallery() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 340; // Approx card width + gap
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="relative group/gallery">
            {/* Scroll Controls */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 p-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full text-muted hover:text-foreground hover:bg-primary-50 transition-all opacity-0 group-hover/gallery:opacity-100 shadow-lg"
            >
                <ChevronLeft size={24} />
            </button>

            <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 p-2 bg-white/80 backdrop-blur-sm border border-primary-200 rounded-full text-muted hover:text-foreground hover:bg-primary-50 transition-all opacity-0 group-hover/gallery:opacity-100 shadow-lg"
            >
                <ChevronRight size={24} />
            </button>

            {/* Scroll Container */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-8 pt-2 px-1 scrollbar-hide snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {templates.map((t, i) => (
                    <div key={i} className="snap-start flex-shrink-0">
                        <AgentTemplateCard
                            title={t.title}
                            role={t.role}
                            description={t.description}
                            integrations={t.integrations}
                            onCreated={() => console.log(`Created ${t.title}`)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

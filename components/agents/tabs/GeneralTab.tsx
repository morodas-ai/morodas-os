"use client";

import { Check, Star } from "lucide-react";

interface Agent {
    id: string;
    name: string;
    type: string;
    description: string | null;
    enabled: boolean;
    keyCapabilities: string | null;
    recommendedUses: string | null;
}

interface GeneralTabProps {
    agent: Agent;
}

// デフォルトのKey Capabilities
const defaultCapabilities: Record<string, string[]> = {
    news: ["ニュースソース監視", "サマリー生成", "トピック抽出", "トレンド分析"],
    seo: ["キーワード分析", "SEOスコア計算", "最適化提案", "競合比較"],
    social: ["SNS監視", "センチメント分析", "トレンド特定", "インフルエンサー発見"],
    competitor: ["競合動向監視", "戦略分析", "差別化ポイント特定", "アラート通知"],
    growth: ["成長指標追跡", "機会特定", "予測分析", "レポート生成"],
    geo: ["AI検索最適化", "引用分析", "表示優先度向上", "コンテンツ提案"],
    socialmedia: ["投稿スケジュール", "エンゲージメント分析", "コンテンツ企画", "最適時間推定"],
    industry_news: ["業界ニュース収集", "ホットトピック追跡", "アラート配信", "サマリー作成"],
    event_media: ["イベント発見", "メディアアウトリーチ", "機会マッチング", "スケジュール管理"],
    cvr: ["CVR分析", "ファネル最適化", "A/Bテスト支援", "改善提案"],
    strategy: ["市場分析", "戦略立案", "ロードマップ作成", "優先度判定"],
};

// デフォルトの推奨用途
const defaultRecommended: Record<string, string> = {
    news: "日次のニュースキャッチアップ、市場動向の把握、コンテンツアイデアの発掘に最適です。",
    seo: "ブログ記事やランディングページのSEO最適化、キーワード戦略の策定に活用できます。",
    social: "ブランドの評判監視、競合のSNS戦略分析、インフルエンサーマーケティングに活用できます。",
    competitor: "競合の動きを把握し、差別化戦略を立てたい場合に役立ちます。",
    growth: "KPIの追跡と成長機会の発見に活用できます。",
    geo: "ChatGPTやPerplexityなどのAI検索エンジンでの表示を最適化したい場合に役立ちます。",
    socialmedia: "SNS投稿の計画と効果測定に活用できます。",
    industry_news: "業界の最新動向を把握し、先手を打つための情報収集に活用できます。",
    event_media: "PRイベントやメディア露出の機会を見つけるのに役立ちます。",
    cvr: "Webサイトやランディングページのコンバージョン率を改善したい場合に活用できます。",
    strategy: "マーケティング戦略全体の見直しや新規施策の立案に活用できます。",
};

export default function GeneralTab({ agent }: GeneralTabProps) {
    // キャパビリティを取得（保存済みがあればそれを使用、なければデフォルト）
    const capabilities = agent.keyCapabilities
        ? JSON.parse(agent.keyCapabilities)
        : defaultCapabilities[agent.type] || [];

    // 推奨用途を取得
    const recommendedUses = agent.recommendedUses || defaultRecommended[agent.type] || "";

    return (
        <div className="space-y-6">
            {/* 説明 */}
            <div>
                <h3 className="text-sm font-medium text-muted mb-2">Description</h3>
                <p className="text-white">
                    {agent.description || "このエージェントの説明はまだ設定されていません。"}
                </p>
            </div>

            {/* Key Capabilities */}
            <div>
                <h3 className="text-sm font-medium text-muted mb-3">Key Capabilities</h3>
                <div className="grid grid-cols-2 gap-3">
                    {capabilities.map((cap: string, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 bg-sidebar-hover/50 rounded-lg px-3 py-2"
                        >
                            <Check size={16} className="text-primary-400 shrink-0" />
                            <span className="text-sm text-white">{cap}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 推奨用途 */}
            <div>
                <h3 className="text-sm font-medium text-muted mb-2 flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    Recommended Uses
                </h3>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                    <p className="text-amber-100 text-sm">{recommendedUses}</p>
                </div>
            </div>

            {/* ステータス */}
            <div>
                <h3 className="text-sm font-medium text-muted mb-2">Status</h3>
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${agent.enabled
                                ? "bg-primary-500/20 text-primary-400"
                                : "bg-sidebar-hover text-muted"
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${agent.enabled ? "bg-primary-400" : "bg-surface-500"}`} />
                        {agent.enabled ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>
        </div>
    );
}

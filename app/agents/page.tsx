"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AgentTemplateCard from "@/components/agents/AgentTemplateCard";
import AgentTableClient from "@/components/agents/AgentTableClient";
import {
  Newspaper,
  Search,
  BarChart,
  Target,
  Ear,
  Share2,
  Globe2,
  Calendar,
  TrendingUp,
  Compass
} from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  lastRunAt: string | null;
  updatedAt: string;
}

// エージェントテンプレート定義（NoimosAI参考：10種類）
const agentTemplates = [
  { title: "News Agent", description: "ニュースソースを監視してサマリーを生成", icon: Newspaper, type: "news" },
  { title: "SEO / GEO Agent", description: "キーワード分析とローカルSEO最適化を提案", icon: Search, type: "seo" },
  { title: "Growth Agent", description: "成長指標を追跡して機会を特定", icon: BarChart, type: "growth" },
  { title: "競合戦略 Agent", description: "競合他社の動向を分析し戦略を提案", icon: Target, type: "competitor" },
  { title: "ソーシャルリスニング Agent", description: "SNS上のブランド言及を監視・分析", icon: Ear, type: "social_listening" },
  { title: "ソーシャルメディア Agent", description: "投稿スケジュールとエンゲージメント最適化", icon: Share2, type: "social_media" },
  { title: "業界ニュース Agent", description: "業界トレンドとホットトピックを追跡", icon: Globe2, type: "industry_news" },
  { title: "イベント/メディア Agent", description: "イベント機会とメディアアウトリーチを管理", icon: Calendar, type: "event_media" },
  { title: "CVR最適化 Agent", description: "コンバージョン率の分析と改善提案", icon: TrendingUp, type: "cvr" },
  { title: "戦略 Agent", description: "総合的なマーケティング戦略立案を支援", icon: Compass, type: "strategy" },
];

export default function AgentsPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      const res = await fetch("/api/agents");
      const { data } = await res.json();
      setAgents(
        data.map((a: { lastRunAt: string | null; updatedAt: string; createdAt: string }) => ({
          ...a,
          lastRunAt: a.lastRunAt || null,
          updatedAt: a.updatedAt,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleTemplateCreated = () => {
    fetchAgents();
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-50">エージェント管理</h1>

      {/* 10種類のエージェントテンプレート */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {agentTemplates.map((template) => (
          <AgentTemplateCard
            key={template.type}
            title={template.title}
            description={template.description}
            icon={template.icon}
            type={template.type}
            onCreated={handleTemplateCreated}
          />
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-50">登録済みエージェント</h2>
      </div>

      {loading ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center text-slate-400">読み込み中...</div>
      ) : (
        <AgentTableClient initialAgents={agents} />
      )}
    </div>
  );
}

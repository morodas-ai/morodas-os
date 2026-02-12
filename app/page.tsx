import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-in">
      {/* ロゴ */}
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex-center shadow-xl mb-8">
        <span className="font-bold text-white text-4xl">M</span>
      </div>

      {/* タイトル */}
      <h1 className="text-4xl font-bold text-foreground mb-3">
        MORODAS <span className="text-primary-500">OS</span>
      </h1>
      <p className="text-lg text-muted mb-8 text-center max-w-md">
        自律型マルチエージェント・マーケティングシステム
      </p>

      {/* メインアクション */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/feed" className="btn-primary text-lg px-8 py-3">
          フィードを見る
          <ArrowRight size={20} />
        </Link>
        <Link href="/dashboard" className="btn-secondary text-lg px-8 py-3">
          ダッシュボード
        </Link>
      </div>

      {/* ステータス */}
      <div className="mt-12 flex items-center gap-2 text-sm text-muted">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
        </span>
        <span>システム稼働中</span>
        <span className="mx-2">•</span>
        <span>7 エージェント アクティブ</span>
      </div>
    </div>
  );
}


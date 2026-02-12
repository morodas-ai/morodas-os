"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  Briefcase,
  PenTool,
  Settings,
  Zap,
  ChevronRight,
  Brain,
  Sparkles,
  CheckSquare,
  Layers,
} from "lucide-react";
import GlobalAIAssistant from "./GlobalAIAssistant";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/content-studio", label: "コンテンツスタジオ", icon: PenTool },
  { href: "/automation", label: "自動化", icon: Zap },
  { href: "/clients", label: "クライアント", icon: Briefcase },
  { href: "/tasks", label: "タスク", icon: CheckSquare },
  { href: "/chat", label: "チャット", icon: MessageSquare },
  { href: "/slide-forge", label: "スライド生成", icon: Layers },
  { href: "/knowledge", label: "ナレッジ", icon: Brain },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <>
      <aside className="sidebar w-64 h-screen fixed left-0 top-0 flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex-center shadow-lg">
            <span className="font-bold text-white text-xl">M</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">MORODAS</h1>
            <p className="text-xs text-surface-300">AI Operating System</p>
          </div>
        </div>

        {/* Ask MORODAS Button */}
        <div className="px-4 mb-2">
          <button
            onClick={() => setShowAssistant(!showAssistant)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary-500/20 to-primary-300/20 border border-primary-500/30 text-primary-200 hover:from-primary-500/30 hover:to-primary-300/30 hover:text-primary-100 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-sm">Ask MORODAS</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-item ${isActive ? "active" : ""}`}
              >
                <Icon size={20} />
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && <ChevronRight size={16} />}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 mx-4 mb-4 rounded-xl" style={{ background: 'rgba(85, 61, 48, 0.5)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-primary-300 flex-center">
              <span className="font-bold text-white text-sm">O</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">オジキ</p>
              <p className="text-xs text-primary-300">Premium</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Global AI Assistant */}
      <GlobalAIAssistant
        isOpen={showAssistant}
        onClose={() => setShowAssistant(false)}
      />
    </>
  );
}


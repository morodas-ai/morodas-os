"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  MessageSquare,
  Briefcase,
  FileText,
  Settings,
  Bot,
  ChevronRight,
  Brain
} from "lucide-react";

const navItems = [
  { href: "/feed", label: "フィード", icon: Radio },
  { href: "/agents", label: "エージェント", icon: Bot },
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/chat", label: "チャット", icon: MessageSquare },
  { href: "/clients", label: "クライアント", icon: Briefcase },
  { href: "/content", label: "コンテンツ", icon: FileText },
  { href: "/knowledge", label: "ナレッジベース", icon: Brain },
  { href: "/settings", label: "設定", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar w-64 h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex-center shadow-lg">
          <span className="font-bold text-white text-xl">M</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">MORODAS</h1>
          <p className="text-xs text-slate-400">AI Operating System</p>
        </div>
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
      <div className="p-4 mx-4 mb-4 rounded-xl bg-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex-center">
            <span className="font-bold text-white text-sm">O</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">オジキ</p>
            <p className="text-xs text-emerald-400">Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

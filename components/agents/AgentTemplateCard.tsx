"use client";

import { Plus, Check } from "lucide-react";
import { useState } from "react";

interface TemplateProps {
  title: string;
  description: string;
  icon: React.ElementType;
  type: string;
  onCreated?: () => void;
}

export default function AgentTemplateCard({ title, description, icon: Icon, type, onCreated }: TemplateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const createFromTemplate = async () => {
    setIsCreating(true);
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title,
          type,
          description,
        }),
      });
      setCreated(true);
      onCreated?.();
      setTimeout(() => setCreated(false), 2000);
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
    setIsCreating(false);
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="font-bold text-lg text-slate-50 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6">{description}</p>
      <button
        onClick={createFromTemplate}
        disabled={isCreating}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors w-full justify-center ${created
            ? "bg-emerald-500 text-white"
            : "bg-slate-700 hover:bg-slate-600 text-white"
          }`}
      >
        {created ? (
          <>
            <Check size={16} />
            作成完了
          </>
        ) : isCreating ? (
          "作成中..."
        ) : (
          <>
            <Plus size={16} />
            テンプレートから作成
          </>
        )}
      </button>
    </div>
  );
}

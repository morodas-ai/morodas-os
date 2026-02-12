"use client";

import { Plus, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { SiGoogle, SiX, SiYoutube, SiGoogleanalytics } from "react-icons/si"; // Using React Icons for brand logos if available, otherwise Lucide fallbacks

// Fallback for brand icons if react-icons is not installed or we want to stick to Lucide
import { Globe, Share2, BarChart3, Mail } from "lucide-react";

interface AgentTemplateProps {
  title: string;
  role: string;
  description: string;
  // Tools/Integrations required
  integrations?: string[];
  onCreated?: () => void;
}

export default function AgentTemplateCard({ title, role, description, integrations = [], onCreated }: AgentTemplateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const createFromTemplate = async () => {
    setIsCreating(true);
    try {
      // TODO: Call actual API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay

      // await fetch("/api/agents", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     name: title,
      //     type: "template",
      //     description,
      //   }),
      // });

      setCreated(true);
      onCreated?.();
      setTimeout(() => setCreated(false), 2000);
    } catch (error) {
      console.error("Failed to create agent:", error);
    }
    setIsCreating(false);
  };

  // Helper to render integration icons
  const renderIntegrationIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "google": return <SiGoogle className="text-gray-400 group-hover:text-blue-500 transition-colors" key={name} />;
      case "twitter":
      case "x": return <SiX className="text-gray-400 group-hover:text-gray-800 transition-colors" key={name} />;
      case "youtube": return <SiYoutube className="text-gray-400 group-hover:text-red-500 transition-colors" key={name} />;
      case "analytics": return <SiGoogleanalytics className="text-gray-400 group-hover:text-yellow-500 transition-colors" key={name} />;
      default: return <Globe className="text-gray-400" key={name} />;
    }
  };

  return (
    <div className="group relative bg-white hover:bg-primary-50 border border-primary-200 hover:border-primary-400 rounded-2xl p-5 transition-all duration-300 min-w-[320px] max-w-[360px] flex flex-col h-full shadow-md hover:shadow-lg">

      {/* Header: Role Label */}
      <div className="mb-3">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-500/15 text-primary-700 text-xs font-semibold tracking-wide">
          {role}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-800 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
          {description}
        </p>
      </div>

      {/* Footer: Integrations & Action */}
      <div className="mt-4 pt-4 border-t border-primary-200/60 flex items-center justify-between">
        {/* Integrations */}
        <div className="flex -space-x-2 items-center">
          {integrations.length > 0 ? (
            <div className="flex gap-3 text-lg">
              {integrations.map(i => renderIntegrationIcon(i))}
            </div>
          ) : (
            <span className="text-xs text-gray-400">連携なし</span>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={createFromTemplate}
          disabled={isCreating}
          className={`
            relative overflow-hidden rounded-lg p-2 transition-all duration-200
            ${created
              ? "bg-primary-500/20 text-primary-600"
              : "bg-primary-100 group-hover:bg-primary-500 text-primary-600 group-hover:text-white"}
          `}
        >
          {created ? (
            <Check size={20} />
          ) : isCreating ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight size={20} />
          )}
        </button>
      </div>
    </div>
  );
}

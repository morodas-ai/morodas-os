"use client";

import { useState } from "react";
import { Settings, Zap, Database, Activity } from "lucide-react";
import clsx from "clsx";

interface Agent {
  name: string;
  type: string;
  config: string;
  enabled: boolean;
}

export default function AgentEditor({ agent }: { agent: Agent }) {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "tools", label: "Tools", icon: Database },
    { id: "triggers", label: "Triggers", icon: Zap },
    { id: "runs", label: "History", icon: Activity },
  ];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="flex border-b border-slate-700">
        {tabs.map((tab) => {
           const Icon = tab.icon;
           return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2",
                activeTab === tab.id
                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/5"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
           );
        })}
      </div>

      <div className="p-6 min-h-[400px]">
        {activeTab === "general" && (
           <div className="max-w-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Agent Name</label>
                <input type="text" defaultValue={agent.name} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                <select defaultValue={agent.type} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-50 focus:outline-none focus:border-emerald-500">
                    <option value="news">News Agent</option>
                    <option value="seo">SEO Agent</option>
                    <option value="social">Social Agent</option>
                    <option value="geo">GEO Agent</option>
                    <option value="growth">Growth Agent</option>
                    <option value="competitor">Competitor Agent</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-4">
                 <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">Save Changes</button>
              </div>
           </div>
        )}
        
        {activeTab === "tools" && (
            <div className="space-y-4">
                <p className="text-slate-400 mb-4">Select the tools this agent can access.</p>
                {['Google Search', 'Twitter API', 'OpenAI', 'Slack', 'YouTube', 'Gmail'].map(tool => (
                    <div key={tool} className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <span className="font-medium text-slate-50">{tool}</span>
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                    </div>
                ))}
            </div>
        )}
        
        {activeTab === "triggers" && (
             <div className="space-y-4">
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-slate-50 mb-2">Schedule</h4>
                    <div className="flex gap-4 mb-2">
                        <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-300">
                            <option>Every Day</option>
                            <option>Every Week</option>
                        </select>
                        <select className="bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-300">
                            <option>09:00 AM</option>
                            <option>10:00 AM</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                     <h4 className="font-medium text-slate-50 mb-2">Event Triggers</h4>
                     <div className="space-y-2">
                        <label className="flex items-center gap-2 text-slate-300">
                            <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                            Email Received (Gmail)
                        </label>
                        <label className="flex items-center gap-2 text-slate-300">
                            <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                            Mentioned on X
                        </label>
                     </div>
                </div>
             </div>
        )}
        
        {activeTab === "runs" && (
             <div className="text-center text-slate-500 py-12">
                 No run history available in this view. Check Feed for details.
             </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import Link from "next/link";

export default function NewAgentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        role: "General Assistant",
        description: "",
        model: "gemini-3-pro-preview",
        integrations: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await fetch("/api/agents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.role.toLowerCase().replace(/\s+/g, "_"),
                    description: formData.description,
                    config: {
                        model: formData.model,
                        integrations: formData.integrations
                    }
                }),
            });
            router.push("/agents");
        } catch (error) {
            console.error("Failed to create agent:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleIntegration = (id: string) => {
        setFormData(prev => ({
            ...prev,
            integrations: prev.integrations.includes(id)
                ? prev.integrations.filter(i => i !== id)
                : [...prev.integrations, id]
        }));
    };

    return (
        <div className="min-h-screen bg-foreground text-surface-50 p-6 md:p-8 max-w-3xl mx-auto flex flex-col justify-center">

            <div className="mb-8">
                <Link href="/agents" className="inline-flex items-center gap-2 text-muted hover:text-white transition-colors mb-4">
                    <ArrowLeft size={16} />
                    Back to Agents
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-400 bg-clip-text text-transparent">
                    Create New Agent
                </h1>
                <p className="text-muted mt-2">
                    Configure your AI assistant's personality and capabilities.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-foreground/50 p-8 rounded-2xl border border-sidebar">

                {/* Basic Info */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Agent Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-100 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="e.g., Q3 Finance Analyst"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Role / Persona</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-100 focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                            >
                                <option>General Assistant</option>
                                <option>Finance Manager</option>
                                <option>Marketing Director</option>
                                <option>Sales Representative</option>
                                <option>Data Analyst</option>
                                <option>Content Creator</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-surface-300 mb-2">Model</label>
                            <select
                                value={formData.model}
                                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-100 focus:outline-none focus:border-primary-500 transition-colors appearance-none"
                            >
                                <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                                <option value="gemini-3-pro-preview">Gemini 3 Pro (Experimental)</option>
                                {/* <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option> */}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-300 mb-2">Description / System Prompt</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-foreground border border-sidebar-hover rounded-lg px-4 py-3 text-surface-100 focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Describe what this agent does and how it should behave..."
                        />
                    </div>
                </div>

                {/* Capabilities */}
                <div>
                    <label className="block text-lg font-bold text-surface-200 mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-primary-400" />
                        Capabilities & Integrations
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { id: "google_drive", label: "Google Workspace (Drive/Gmail)" },
                            { id: "google_analytics", label: "Google Analytics 4" },
                            { id: "twitter_read", label: "X (Twitter) Monitoring" },
                            { id: "youtube_data", label: "YouTube Analytics" },
                            { id: "web_search", label: "Web Search (Google)" },
                        ].map((tool) => (
                            <label
                                key={tool.id}
                                className={`
                            flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all
                            ${formData.integrations.includes(tool.id)
                                        ? "bg-primary-500/10 border-primary-500/50"
                                        : "bg-foreground border-sidebar hover:border-sidebar-hover"}
                        `}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.integrations.includes(tool.id)}
                                    onChange={() => toggleIntegration(tool.id)}
                                    className="w-5 h-5 rounded border-foreground text-primary-500 focus:ring-primary-500 bg-foreground"
                                />
                                <span className={formData.integrations.includes(tool.id) ? "text-teal-100" : "text-muted"}>
                                    {tool.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-sidebar flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 text-muted hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 bg-primary-500 hover:bg-primary-400 text-foreground font-bold rounded-lg transition-all shadow-lg hover:shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={20} />
                                Create Agent
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
}

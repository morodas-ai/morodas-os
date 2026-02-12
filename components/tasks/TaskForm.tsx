"use client";

import { useState, useEffect } from "react";
import { X, Bot } from "lucide-react";

interface Agent {
    id: string;
    name: string;
    type: string;
}

interface TaskFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialData?: any;
    agents: Agent[];
}

export default function TaskForm({ isOpen, onClose, onSave, initialData, agents }: TaskFormProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "medium",
        estimatedMinutes: "",
        agentId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title,
                description: initialData.description || "",
                priority: initialData.priority,
                estimatedMinutes: initialData.estimatedMinutes?.toString() || "",
                agentId: initialData.agentId || "",
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = initialData ? `/api/tasks/${initialData.id}` : "/api/tasks";
            const method = initialData ? "PATCH" : "POST";

            await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            onSave();
        } catch (error) {
            console.error("Failed to save task:", error);
        }
        setIsSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-sidebar rounded-xl w-full max-w-md shadow-2xl border border-sidebar-hover">
                <div className="flex items-center justify-between p-4 border-b border-sidebar-hover">
                    <h2 className="font-bold text-lg text-surface-100">
                        {initialData ? "Edit Task" : "New Task"}
                    </h2>
                    <button onClick={onClose} className="text-muted hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-foreground border border-sidebar-hover rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-primary-500"
                            placeholder="What needs to be done?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-foreground border border-sidebar-hover rounded-lg px-3 py-2 text-surface-100 h-24 focus:outline-none focus:border-primary-500"
                            placeholder="Details..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Priority</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-primary-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted mb-1">Est. Minutes</label>
                            <input
                                type="number"
                                value={formData.estimatedMinutes}
                                onChange={e => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-muted mb-1">Assign to Agent</label>
                        <div className="relative">
                            <select
                                value={formData.agentId}
                                onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                                className="w-full bg-foreground border border-sidebar-hover rounded-lg px-3 py-2 text-surface-100 focus:outline-none focus:border-primary-500 appearance-none"
                            >
                                <option value="">-- No Agent --</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>
                                        {agent.name} ({agent.type})
                                    </option>
                                ))}
                            </select>
                            <Bot className="absolute right-3 top-2.5 text-surface-500 pointer-events-none" size={16} />
                        </div>
                        {formData.agentId === "jules-gh-executor" && ( // ID hardcoded check for visual cue
                            <p className="text-xs text-purple-400 mt-1 flex items-center gap-1">
                                <Bot size={12} />
                                Assigning to Jules will trigger GitHub workflow.
                            </p>
                        )}
                    </div>

                    <div className="pt-2 flex justify-end gap-2 text-sm font-medium">
                        <button type="button" onClick={onClose} className="px-4 py-2 hover:bg-sidebar-hover rounded-lg text-surface-300">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary-500 hover:bg-primary-400 text-foreground rounded-lg"
                        >
                            {isSubmitting ? "Saving..." : "Save Task"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

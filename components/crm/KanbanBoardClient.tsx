"use client";

import { useState } from "react";
import { DndContext, DragOverlay, useDroppable, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import ClientCard, { Client } from "./ClientCard";
import { Plus, X, Mail, Phone, Calendar, FileText } from "lucide-react";

const STAGES = [
    { id: "lead", title: "リード", color: "text-blue-600" },
    { id: "negotiating", title: "商談中", color: "text-yellow-600" },
    { id: "proposed", title: "提案済", color: "text-purple-600" },
    { id: "won", title: "成約", color: "text-primary-500" },
    { id: "completed", title: "完了", color: "text-muted" },
];

interface KanbanClient extends Client {
    stage: string;
}

function DroppableColumn({ id, title, color, clients, onAddClick, onDeleteClient, onEditClient }: {
    id: string;
    title: string;
    color: string;
    clients: KanbanClient[];
    onAddClick: () => void;
    onDeleteClient: (id: string) => void;
    onEditClient: (client: Client) => void;
}) {
    const { setNodeRef } = useDroppable({ id });
    const totalValue = clients.reduce((sum, c) => sum + (c.dealValue || 0), 0);

    return (
        <div ref={setNodeRef} className="bg-surface-50 rounded-xl p-4 min-h-[500px] w-72 flex-shrink-0 border border-primary-200 flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-primary-200 pb-2">
                <div>
                    <h3 className={`font-bold ${color}`}>{title}</h3>
                    <p className="text-xs text-muted">¥{totalValue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">{clients.length}</span>
                    {id === "lead" && (
                        <button onClick={onAddClick} className="text-primary-500 hover:text-primary-400">
                            <Plus size={18} />
                        </button>
                    )}
                </div>
            </div>
            <div className="flex-1 space-y-3">
                {clients.map((client) => (
                    <ClientCard
                        key={client.id}
                        client={client}
                        draggable
                        onDelete={onDeleteClient}
                        onEdit={onEditClient}
                    />
                ))}
            </div>
        </div>
    );
}

export default function KanbanBoardClient({ initialClients }: { initialClients: KanbanClient[] }) {
    const [clients, setClients] = useState(initialClients);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingClient, setEditingClient] = useState<KanbanClient | null>(null);
    const [newClient, setNewClient] = useState({
        name: "",
        company: "",
        dealValue: "",
        email: "",
        phone: "",
        nextAction: "",
        notes: ""
    });

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
    }

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const stageId = over.id as string;
            if (STAGES.some((s) => s.id === stageId)) {
                // 楽観的更新
                setClients((items) => items.map((item) => (item.id === active.id ? { ...item, stage: stageId } : item)));

                // API更新
                try {
                    await fetch("/api/clients", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: active.id, stage: stageId }),
                    });
                } catch (error) {
                    console.error("Failed to update client stage:", error);
                }
            }
        }
        setActiveId(null);
    }

    const createClient = async () => {
        if (!newClient.name || !newClient.company) return;
        try {
            const res = await fetch("/api/clients", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newClient.name,
                    company: newClient.company,
                    dealValue: newClient.dealValue ? parseInt(newClient.dealValue) : null,
                    email: newClient.email || null,
                    phone: newClient.phone || null,
                    nextAction: newClient.nextAction || "連絡",
                    notes: newClient.notes || null,
                    stage: "lead",
                }),
            });
            const { data } = await res.json();
            setClients([data, ...clients]);
            setNewClient({ name: "", company: "", dealValue: "", email: "", phone: "", nextAction: "", notes: "" });
            setIsAdding(false);
        } catch (error) {
            console.error("Failed to create client:", error);
        }
    };

    const deleteClient = async (id: string) => {
        try {
            await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
            setClients(clients.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete client:", error);
        }
    };

    const openEditModal = (client: Client) => {
        const fullClient = clients.find(c => c.id === client.id);
        if (fullClient) {
            setEditingClient(fullClient);
            setIsEditing(true);
        }
    };

    const updateClient = async () => {
        if (!editingClient) return;
        try {
            const res = await fetch("/api/clients", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingClient.id,
                    name: editingClient.name,
                    company: editingClient.company,
                    dealValue: editingClient.dealValue,
                    email: editingClient.email,
                    phone: editingClient.phone,
                    nextAction: editingClient.nextAction,
                    notes: editingClient.notes,
                }),
            });
            const { data } = await res.json();
            setClients(clients.map(c => c.id === data.id ? { ...c, ...data } : c));
            setIsEditing(false);
            setEditingClient(null);
        } catch (error) {
            console.error("Failed to update client:", error);
        }
    };

    const activeClient = activeId ? clients.find((c) => c.id === activeId) : null;

    // 統計情報
    const totalPipeline = clients.reduce((sum, c) => sum + (c.dealValue || 0), 0);
    const wonValue = clients.filter(c => c.stage === "won" || c.stage === "completed").reduce((sum, c) => sum + (c.dealValue || 0), 0);

    return (
        <>
            {/* パイプライン統計 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-primary-200">
                    <p className="text-xs text-muted mb-1">パイプライン総額</p>
                    <p className="text-2xl font-bold text-foreground">¥{totalPipeline.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-primary-200">
                    <p className="text-xs text-muted mb-1">成約済み</p>
                    <p className="text-2xl font-bold text-primary-500">¥{wonValue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-primary-200">
                    <p className="text-xs text-muted mb-1">クライアント数</p>
                    <p className="text-2xl font-bold text-foreground">{clients.length}</p>
                </div>
            </div>

            {/* 新規追加モーダル */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[480px] border border-primary-200 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-foreground">新規クライアント</h3>
                            <button onClick={() => setIsAdding(false)} className="text-muted hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">担当者名 *</label>
                                    <input
                                        type="text"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="山田太郎"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">会社名 *</label>
                                    <input
                                        type="text"
                                        value={newClient.company}
                                        onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="株式会社〇〇"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-muted mb-1">
                                        <Mail size={12} /> メール
                                    </label>
                                    <input
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-muted mb-1">
                                        <Phone size={12} /> 電話番号
                                    </label>
                                    <input
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="03-1234-5678"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">想定金額（円）</label>
                                    <input
                                        type="number"
                                        value={newClient.dealValue}
                                        onChange={(e) => setNewClient({ ...newClient, dealValue: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="100000"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-muted mb-1">
                                        <Calendar size={12} /> 次のアクション
                                    </label>
                                    <input
                                        type="text"
                                        value={newClient.nextAction}
                                        onChange={(e) => setNewClient({ ...newClient, nextAction: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                        placeholder="連絡"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm text-muted mb-1">
                                    <FileText size={12} /> メモ
                                </label>
                                <textarea
                                    value={newClient.notes}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })}
                                    className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground h-20 focus:outline-none focus:border-primary-500"
                                    placeholder="備考・メモ"
                                />
                            </div>
                            <button onClick={createClient} className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium">
                                追加
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 編集モーダル */}
            {isEditing && editingClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[480px] border border-primary-200 max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-foreground">クライアント編集</h3>
                            <button onClick={() => { setIsEditing(false); setEditingClient(null); }} className="text-muted hover:text-foreground">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">担当者名</label>
                                    <input
                                        type="text"
                                        value={editingClient.name}
                                        onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">会社名</label>
                                    <input
                                        type="text"
                                        value={editingClient.company}
                                        onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">メール</label>
                                    <input
                                        type="email"
                                        value={editingClient.email || ""}
                                        onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">電話番号</label>
                                    <input
                                        type="tel"
                                        value={editingClient.phone || ""}
                                        onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted mb-1">想定金額（円）</label>
                                    <input
                                        type="number"
                                        value={editingClient.dealValue || ""}
                                        onChange={(e) => setEditingClient({ ...editingClient, dealValue: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted mb-1">次のアクション</label>
                                    <input
                                        type="text"
                                        value={editingClient.nextAction || ""}
                                        onChange={(e) => setEditingClient({ ...editingClient, nextAction: e.target.value })}
                                        className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-primary-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-muted mb-1">メモ</label>
                                <textarea
                                    value={editingClient.notes || ""}
                                    onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                                    className="w-full bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-foreground h-20 focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={updateClient} className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium">
                                    保存
                                </button>
                                <button
                                    onClick={() => { deleteClient(editingClient.id); setIsEditing(false); }}
                                    className="px-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white py-2 rounded-lg font-medium transition-colors"
                                >
                                    削除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex gap-6 overflow-x-auto pb-6">
                    {STAGES.map((stage) => (
                        <DroppableColumn
                            key={stage.id}
                            id={stage.id}
                            title={stage.title}
                            color={stage.color}
                            clients={clients.filter((c) => c.stage === stage.id)}
                            onAddClick={() => setIsAdding(true)}
                            onDeleteClient={deleteClient}
                            onEditClient={openEditModal}
                        />
                    ))}
                </div>
                <DragOverlay>{activeClient ? <ClientCard client={activeClient} draggable={false} /> : null}</DragOverlay>
            </DndContext>
        </>
    );
}

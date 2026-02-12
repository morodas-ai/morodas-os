"use client";

import { User, DollarSign, Trash2, Edit2, X, Phone, Mail, Calendar } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";

export interface Client {
  id: string;
  name: string;
  company: string;
  dealValue: number | null;
  email?: string;
  phone?: string;
  nextAction?: string;
  dueDate?: string;
  notes?: string;
}

interface ClientCardProps {
  client: Client;
  draggable?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (client: Client) => void;
}

export default function ClientCard({ client, draggable, onDelete, onEdit }: ClientCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: client.id,
    data: { ...client },
    disabled: !draggable,
  });

  const style = transform
    ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    }
    : undefined;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete?.(client.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(client);
  };

  const CardContent = (
    <div
      className={`bg-sidebar-hover p-4 rounded-lg border border-foreground shadow-sm ${draggable ? "hover:border-primary-500/50 cursor-grab active:cursor-grabbing" : ""} group relative`}
      onClick={() => setShowDetail(true)}
    >
      {/* アクションボタン（ホバー時に表示） */}
      {draggable && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="p-1 bg-foreground hover:bg-surface-500 rounded text-surface-300 hover:text-white"
          >
            <Edit2 size={12} />
          </button>
          <button
            onClick={handleDelete}
            className={`p-1 rounded transition-colors ${confirmDelete
                ? "bg-red-500 text-white"
                : "bg-foreground hover:bg-red-500 text-surface-300 hover:text-white"
              }`}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      <h4 className="font-bold text-surface-50 text-sm mb-2 pr-14">{client.company}</h4>
      <div className="flex items-center gap-2 text-xs text-muted mb-3">
        <User size={12} /> <span>{client.name}</span>
      </div>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-foreground/50">
        <div className="flex items-center gap-1 text-xs font-medium text-primary-500">
          <DollarSign size={12} /> ¥{(client.dealValue || 0).toLocaleString()}
        </div>
        <span className="text-[10px] bg-sidebar px-2 py-0.5 rounded text-muted">
          {client.nextAction || "次: 連絡"}
        </span>
      </div>
    </div>
  );

  // 詳細モーダル
  const DetailModal = showDetail && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetail(false)}>
      <div className="bg-sidebar rounded-xl p-6 w-96 border border-sidebar-hover" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-surface-50">{client.company}</h3>
          <button onClick={() => setShowDetail(false)} className="text-muted hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-surface-300">
            <User size={16} className="text-surface-500" />
            <span>{client.name}</span>
          </div>

          {client.email && (
            <div className="flex items-center gap-3 text-surface-300">
              <Mail size={16} className="text-surface-500" />
              <span>{client.email}</span>
            </div>
          )}

          {client.phone && (
            <div className="flex items-center gap-3 text-surface-300">
              <Phone size={16} className="text-surface-500" />
              <span>{client.phone}</span>
            </div>
          )}

          {client.dueDate && (
            <div className="flex items-center gap-3 text-surface-300">
              <Calendar size={16} className="text-surface-500" />
              <span>{new Date(client.dueDate).toLocaleDateString("ja-JP")}</span>
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-sidebar-hover">
            <div className="text-3xl font-bold text-primary-500">
              ¥{(client.dealValue || 0).toLocaleString()}
            </div>
          </div>

          {client.notes && (
            <div className="pt-3 mt-3 border-t border-sidebar-hover">
              <p className="text-sm text-muted">{client.notes}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => { setShowDetail(false); onEdit?.(client); }}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium"
          >
            編集
          </button>
          <button
            onClick={() => { onDelete?.(client.id); setShowDetail(false); }}
            className="px-4 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white py-2 rounded-lg font-medium transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );

  if (draggable) {
    return (
      <>
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
          {CardContent}
        </div>
        {DetailModal}
      </>
    );
  }

  return CardContent;
}

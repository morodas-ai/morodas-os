"use client";

import { useState } from "react";
import { DndContext, DragOverlay, useDroppable, DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import ClientCard from "./ClientCard";

const STAGES = [
  { id: 'lead', title: 'Lead' },
  { id: 'negotiating', title: 'Negotiating' },
  { id: 'proposed', title: 'Proposed' },
  { id: 'won', title: 'Won' },
  { id: 'completed', title: 'Completed' },
];

interface KanbanClient {
  id: string;
  name: string;
  company: string;
  stage: string;
  dealValue: number | null;
}

function DroppableColumn({ id, title, clients }: { id: string, title: string, clients: KanbanClient[] }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="bg-slate-800 rounded-xl p-4 min-h-[600px] w-72 flex-shrink-0 border border-slate-700 flex flex-col">
      <h3 className="font-bold text-slate-50 mb-4 capitalize border-b border-slate-700 pb-2 flex justify-between items-center">
        {title}
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">{clients.length}</span>
      </h3>
      <div className="flex-1 space-y-3">
        {clients.map(client => (
          <ClientCard key={client.id} client={client} draggable />
        ))}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [clients, setClients] = useState([
    { id: '1', name: 'John Doe', company: 'Acme Corp', stage: 'lead', dealValue: 5000 },
    { id: '2', name: 'Jane Smith', company: 'TechStart', stage: 'negotiating', dealValue: 12000 },
    { id: '3', name: 'Bob Johnson', company: 'Global Ind', stage: 'lead', dealValue: 3000 },
    { id: '4', name: 'Alice Brown', company: 'Creative Sol', stage: 'won', dealValue: 25000 },
    { id: '5', name: 'Charlie Davis', company: 'Future Works', stage: 'proposed', dealValue: 8000 },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // If dropped over a column (stage)
      const stageId = over.id;
      // Verify stageId is valid
      if (STAGES.some(s => s.id === stageId)) {
        setClients((items) =>
          items.map(item =>
            item.id === active.id ? { ...item, stage: stageId as string } : item
          )
        );
      }
    }
    setActiveId(null);
  }

  const activeClient = activeId ? clients.find(c => c.id === activeId) : null;

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {STAGES.map(stage => (
          <DroppableColumn
            key={stage.id}
            id={stage.id}
            title={stage.title}
            clients={clients.filter(c => c.stage === stage.id)}
          />
        ))}
      </div>
      <DragOverlay>
        {activeClient ? <ClientCard client={activeClient} draggable={false} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

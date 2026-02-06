import { MessageSquare, Plus } from "lucide-react";

export default function ChatSidebar() {
  const sessions = [
    { id: 1, title: "Marketing Strategy", date: "2 mins ago" },
    { id: 2, title: "Code Review Helper", date: "Yesterday" },
    { id: 3, title: "Content Ideas", date: "2 days ago" },
  ];

  return (
    <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col h-full rounded-l-xl">
      <div className="p-4 border-b border-slate-700">
        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-2 flex items-center justify-center gap-2 transition-colors">
          <Plus size={16} /> New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((session) => (
          <div key={session.id} className="p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors group">
            <div className="flex items-center gap-3 text-slate-300 group-hover:text-white">
              <MessageSquare size={16} className="text-slate-500 group-hover:text-emerald-500" />
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium text-sm">{session.title}</p>
                <p className="text-xs text-slate-500">{session.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

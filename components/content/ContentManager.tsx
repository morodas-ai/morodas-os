"use client";

import { useState } from "react";
import { List, Calendar as CalendarIcon, Edit } from "lucide-react";

const contentData = [
    { id: 1, title: "10 AI Trends for 2026", platform: "Twitter", status: "Published", date: "2026-02-01", views: 1200 },
    { id: 2, title: "How to use Morodas OS", platform: "YouTube", status: "Review", date: "2026-02-05", views: 0 },
    { id: 3, title: "Agentic Workflows Explained", platform: "Note", status: "Draft", date: "2026-02-10", views: 0 },
];

export default function ContentManager() {
  const [view, setView] = useState<'table' | 'calendar'>('table');

  return (
    <div className="bg-sidebar rounded-xl border border-sidebar-hover overflow-hidden">
       <div className="p-4 border-b border-sidebar-hover flex justify-between items-center">
           <h3 className="font-bold text-surface-50">Content Schedule</h3>
           <div className="flex bg-foreground rounded-lg p-1">
               <button 
                  onClick={() => setView('table')}
                  className={`p-2 rounded-md transition-colors ${view === 'table' ? 'bg-sidebar-hover text-white' : 'text-muted hover:text-white'}`}
               >
                   <List size={18} />
               </button>
               <button 
                  onClick={() => setView('calendar')}
                  className={`p-2 rounded-md transition-colors ${view === 'calendar' ? 'bg-sidebar-hover text-white' : 'text-muted hover:text-white'}`}
               >
                   <CalendarIcon size={18} />
               </button>
           </div>
       </div>
       
       {view === 'table' ? (
           <table className="w-full text-left">
             <thead className="bg-foreground/50 text-muted text-sm">
               <tr>
                 <th className="p-4 font-medium">Title</th>
                 <th className="p-4 font-medium">Platform</th>
                 <th className="p-4 font-medium">Status</th>
                 <th className="p-4 font-medium">Date</th>
                 <th className="p-4 font-medium text-right">Engagement</th>
                 <th className="p-4 font-medium"></th>
               </tr>
             </thead>
             <tbody className="divide-y divide-sidebar-hover">
               {contentData.map((item) => (
                 <tr key={item.id} className="hover:bg-sidebar-hover/30 transition-colors">
                   <td className="p-4 font-medium text-surface-50">{item.title}</td>
                   <td className="p-4 text-muted">{item.platform}</td>
                   <td className="p-4">
                     <span className={`px-2 py-1 rounded text-xs font-medium 
                        ${item.status === 'Published' ? 'bg-primary-500/10 text-primary-500' : 
                          item.status === 'Review' ? 'bg-yellow-500/10 text-yellow-500' : 
                          'bg-surface-500/10 text-surface-500'}`}>
                        {item.status}
                     </span>
                   </td>
                   <td className="p-4 text-muted">{item.date}</td>
                   <td className="p-4 text-right text-muted">{item.views > 0 ? `${item.views} views` : '-'}</td>
                   <td className="p-4 text-right">
                        <button className="p-2 hover:bg-sidebar-hover rounded-lg text-muted hover:text-white">
                            <Edit size={16} />
                        </button>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
       ) : (
           <div className="p-12 text-center text-surface-500 h-96 flex flex-col items-center justify-center">
               <CalendarIcon size={48} className="mb-4 opacity-50" />
               <p>Calendar View Placeholder</p>
               <p className="text-sm mt-2">Interact with calendar API to see scheduled posts.</p>
           </div>
       )}
    </div>
  );
}

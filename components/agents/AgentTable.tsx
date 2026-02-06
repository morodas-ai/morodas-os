import Link from "next/link";
import { format } from "date-fns";
import { Power, Edit } from "lucide-react";
import { Agent } from "@prisma/client";

export default function AgentTable({ agents }: { agents: Agent[] }) {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-900/50 text-slate-400 text-sm">
          <tr>
            <th className="p-4 font-medium">Agent Name</th>
            <th className="p-4 font-medium">Workspace</th>
            <th className="p-4 font-medium">Last Run</th>
            <th className="p-4 font-medium">Last Edited</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 font-medium"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {agents.map((agent) => (
            <tr key={agent.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-50">{agent.name}</span>
                </div>
              </td>
              <td className="p-4 text-slate-400">Default</td>
              <td className="p-4 text-slate-400">
                {agent.lastRunAt ? format(agent.lastRunAt, "MMM d, HH:mm") : "-"}
              </td>
               <td className="p-4 text-slate-400">
                {format(agent.updatedAt, "MMM d, HH:mm")}
              </td>
              <td className="p-4">
                <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs w-fit ${agent.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-700 text-slate-400'}`}>
                  <Power size={12} />
                  {agent.enabled ? "Active" : "Inactive"}
                </div>
              </td>
              <td className="p-4 text-right">
                <Link href={`/agents/${agent.id}`} className="p-2 hover:bg-slate-700 rounded-lg inline-flex text-slate-400 hover:text-white">
                  <Edit size={16} />
                </Link>
              </td>
            </tr>
          ))}
          {agents.length === 0 && (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-500">
                No agents found. Create one from a template above.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

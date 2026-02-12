import { Lightbulb } from "lucide-react";

export default function Insights() {
  return (
    <div className="bg-sidebar rounded-xl p-6 border border-sidebar-hover mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-500" size={24} />
        <h2 className="text-xl font-bold text-surface-50">GEO Insights</h2>
      </div>
      <p className="text-muted">
        AI analysis indicates your brand visibility has increased by 15% in the last week. 
        Top performing region: Tokyo. Recommended action: Increase engagement on trending topics related to AI.
      </p>
    </div>
  );
}

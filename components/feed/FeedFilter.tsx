import { Search, Filter } from "lucide-react";

export default function FeedFilter() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search reports..." 
          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-50 focus:outline-none focus:border-emerald-500"
        />
      </div>
      
      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
        <div className="flex items-center gap-2 text-slate-400 text-sm mr-2">
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        
        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option>All Status</option>
          <option>Review Needed</option>
          <option>Processing</option>
          <option>Archived</option>
        </select>
        
        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option>All Agents</option>
          <option>News Agent</option>
          <option>SEO Agent</option>
        </select>

        <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500">
          <option>All Channels</option>
          <option>Twitter</option>
          <option>YouTube</option>
        </select>
      </div>
    </div>
  );
}

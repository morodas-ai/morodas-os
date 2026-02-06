import Link from "next/link";
import { format } from "date-fns";
import { Twitter, Facebook, Instagram, Youtube, ArrowRight } from "lucide-react";

interface FeedItem {
  id: string;
  status: string;
  agentName: string;
  title: string;
  description: string;
  createdAt: Date;
  platform: string;
}

export default function FeedCard({ item }: { item: FeedItem }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "review": return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10";
      case "processing": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "running": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "pending": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "archived": return "text-slate-500 border-slate-500/20 bg-slate-500/10";
      case "failed": return "text-red-500 border-red-500/20 bg-red-500/10";
      default: return "text-slate-500 border-slate-500/20 bg-slate-500/10";
    }
  };

  const getStatusLabel = (status: string) => {
     if (status === 'review' || status === 'completed') return 'Review Needed';
     if (status === 'processing' || status === 'running' || status === 'pending') return 'Processing';
     if (status === 'failed') return 'Failed';
     return 'Archived';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
      case 'x': return <Twitter size={16} className="text-slate-400" />;
      case 'facebook': return <Facebook size={16} className="text-slate-400" />;
      case 'instagram': return <Instagram size={16} className="text-slate-400" />;
      case 'youtube': return <Youtube size={16} className="text-slate-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-lg hover:border-emerald-500/50 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
        {getPlatformIcon(item.platform)}
      </div>
      
      <div className="mb-2">
        <span className="text-xs text-emerald-500 font-medium tracking-wide uppercase">{item.agentName}</span>
      </div>
      
      <h3 className="text-lg font-bold text-slate-50 mb-2 line-clamp-2">{item.title}</h3>
      <p className="text-slate-400 text-sm mb-4 line-clamp-3 flex-1">{item.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <span className="text-xs text-slate-500">{format(item.createdAt, "yyyy/MM/dd HH:mm")}</span>
        <Link href={`/feed/${item.id}`} className="text-sm text-emerald-500 hover:text-emerald-400 flex items-center gap-1 font-medium">
          View Result <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

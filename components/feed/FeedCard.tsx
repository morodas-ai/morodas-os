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
      case "review": return "text-primary-500 border-primary-500/20 bg-primary-500/10";
      case "processing": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "running": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "pending": return "text-yellow-500 border-yellow-500/20 bg-yellow-500/10";
      case "archived": return "text-surface-500 border-surface-500/20 bg-surface-500/10";
      case "failed": return "text-red-500 border-red-500/20 bg-red-500/10";
      default: return "text-surface-500 border-surface-500/20 bg-surface-500/10";
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
      case 'x': return <Twitter size={16} className="text-muted" />;
      case 'facebook': return <Facebook size={16} className="text-muted" />;
      case 'instagram': return <Instagram size={16} className="text-muted" />;
      case 'youtube': return <Youtube size={16} className="text-muted" />;
      default: return null;
    }
  };

  return (
    <div className="bg-sidebar rounded-xl p-5 border border-sidebar-hover shadow-lg hover:border-primary-500/50 transition-colors flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.status)}`}>
          {getStatusLabel(item.status)}
        </span>
        {getPlatformIcon(item.platform)}
      </div>
      
      <div className="mb-2">
        <span className="text-xs text-primary-500 font-medium tracking-wide uppercase">{item.agentName}</span>
      </div>
      
      <h3 className="text-lg font-bold text-surface-50 mb-2 line-clamp-2">{item.title}</h3>
      <p className="text-muted text-sm mb-4 line-clamp-3 flex-1">{item.description}</p>
      
      <div className="flex items-center justify-between pt-4 border-t border-sidebar-hover/50">
        <span className="text-xs text-surface-500">{format(item.createdAt, "yyyy/MM/dd HH:mm")}</span>
        <Link href={`/feed/${item.id}`} className="text-sm text-primary-500 hover:text-primary-400 flex items-center gap-1 font-medium">
          View Result <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

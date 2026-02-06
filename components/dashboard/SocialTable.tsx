import { Heart, MessageCircle, Repeat } from "lucide-react";

const posts = [
  { id: 1, content: "Just launched our new AI agent system! #AI #Tech", likes: 120, retweets: 45, replies: 12 },
  { id: 2, content: "Check out the latest update on Morodas OS.", likes: 85, retweets: 20, replies: 5 },
  { id: 3, content: "Productivity boosted by 200% using these agents.", likes: 230, retweets: 80, replies: 34 },
];

export default function SocialTable() {
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="font-bold text-slate-50">Recent Social Posts</h3>
      </div>
      <table className="w-full text-left">
        <thead className="bg-slate-900/50 text-slate-400 text-sm">
          <tr>
            <th className="p-4 font-medium">Post Content</th>
            <th className="p-4 font-medium text-center">Likes</th>
            <th className="p-4 font-medium text-center">RTs</th>
            <th className="p-4 font-medium text-center">Replies</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-slate-700/30 transition-colors">
              <td className="p-4 text-slate-300 max-w-md truncate">{post.content}</td>
              <td className="p-4 text-center text-slate-400">
                <div className="flex items-center justify-center gap-1">
                  <Heart size={14} /> {post.likes}
                </div>
              </td>
              <td className="p-4 text-center text-slate-400">
                <div className="flex items-center justify-center gap-1">
                  <Repeat size={14} /> {post.retweets}
                </div>
              </td>
              <td className="p-4 text-center text-slate-400">
                <div className="flex items-center justify-center gap-1">
                  <MessageCircle size={14} /> {post.replies}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

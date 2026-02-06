"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Day 1', value: 400 },
  { name: 'Day 5', value: 300 },
  { name: 'Day 10', value: 600 },
  { name: 'Day 15', value: 800 },
  { name: 'Day 20', value: 500 },
  { name: 'Day 25', value: 900 },
  { name: 'Day 30', value: 1000 },
];

export default function EngagementChart() {
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-96">
      <h3 className="font-bold text-slate-50 mb-4">X Engagement (30 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
          />
          <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

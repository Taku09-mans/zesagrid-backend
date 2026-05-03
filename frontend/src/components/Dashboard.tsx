import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Trophy } from 'lucide-react';
import { motion } from 'motion/react';

interface LeaderboardItem {
  suburb: string;
  total_hours: number;
  avg_duration: number;
  rank?: number;
}

export default function Dashboard() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We use the environment variable to point to your Python backend at port 8000
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard`)
      .then(res => {
        if (!res.ok) throw new Error('Backend connection failed');
        return res.json();
      })
      .then(json => {
        if (Array.isArray(json)) {
          setData(json);
        } else {
          setData([]);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex flex-col items-center justify-center font-mono text-xs text-zinc-500 animate-pulse uppercase tracking-[0.4em] min-h-screen bg-black">
      Tracing_Grid_Currents_...
    </div>
  );

  return (
    <div className="p-8 space-y-12 animate-in fade-in zoom-in-95 duration-700 bg-black min-h-screen text-white">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-6 w-2 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">Impact_Leaderboard</h2>
        </div>
        <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Monthly cumulative outage hours by residential sector</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 overflow-hidden shadow-2xl">

        {/* Table View */}
        <div className="bg-zinc-950 p-6 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Ranked_Data</span>
            <Trophy size={14} className="text-cyan-500" />
          </div>

          <div className="space-y-3 relative z-10">
            {data.length > 0 ? data.map((item, idx) => (
              <motion.div
                key={item.suburb || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-end justify-between border-b border-zinc-900 pb-3 group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-zinc-600 font-mono text-xs tracking-tighter">0{idx + 1}</span>
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors uppercase">
                    {item.suburb || "Unknown_Sector"}
                  </span>
                </div>
                <div className="text-right">
                  {/* SAFETY VALVE: (item.total_hours || 0) prevents the crash */}
                  <div className="font-mono text-sm font-black text-cyan-400">
                    {(item.total_hours || 0).toFixed(1)} <span className="text-[10px] font-normal text-zinc-600">HRS</span>
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono uppercase tracking-tighter italic">
                    Avg: {(item.avg_duration || 0).toFixed(1)}h
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="py-12 text-center text-xs text-zinc-600 font-mono uppercase">No_Active_Outage_Data</div>
            )}
          </div>
        </div>

        {/* Analytics Graph */}
        <div className="bg-zinc-950 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Visual_Metrics</span>
            <TrendingUp size={14} className="text-cyan-500" />
          </div>
          <div className="flex-1 min-h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                <XAxis
                  dataKey="suburb"
                  stroke="#3f3f46"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => val ? val.slice(0, 4).toUpperCase() : ""}
                />
                <YAxis stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#18181b' }}
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '0', fontSize: '10px', fontFamily: 'monospace' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Bar dataKey="total_hours" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-900 grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <p className="text-[9px] uppercase font-bold text-zinc-600">Total_Loss</p>
                <p className="text-xl font-black text-white">
                  {data.reduce((acc, curr) => acc + (curr.total_hours || 0), 0).toFixed(1)}
                  <span className="text-xs text-zinc-500 font-normal ml-1">HRS</span>
                </p>
             </div>
             <div className="space-y-1 text-right">
                <p className="text-[9px] uppercase font-bold text-zinc-600">Peak_Strain</p>
                <p className="text-xl font-black text-white">
                  {data.length > 0 ? Math.max(...data.map(d => d.total_hours || 0)).toFixed(1) : "0.0"}
                  <span className="text-xs text-zinc-500 font-normal ml-1">MAX</span>
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
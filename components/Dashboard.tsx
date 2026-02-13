import React, { useEffect, useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { fetchDashboardData } from '../services/api';
import { DashboardData } from '../types';

// Cyberpunk Neon Palette
const COLORS = ['#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b'];

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`relative bg-[#0b0e14]/80 backdrop-blur-md border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-lg ${className}`}>
        {/* Tech Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/50"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/50"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500/50"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500/50"></div>
        
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-orbitron font-bold text-cyan-400 tracking-wider uppercase">{title}</h3>
            <div className="flex gap-1">
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse"></div>
            </div>
        </div>
        <div className="flex-grow p-4 min-h-0 relative">
            {children}
        </div>
    </div>
);

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const result = await fetchDashboardData();
      if (result) {
        setData(result);
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 3000); 

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#030712] text-cyan-500">
        <div className="w-16 h-16 border-t-2 border-b-2 border-cyan-500 rounded-full animate-spin mb-4"></div>
        <div className="font-orbitron tracking-widest animate-pulse">INITIALIZING DASHBOARD SYSTEM...</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-screen w-screen bg-[#030712] text-white overflow-hidden flex flex-col font-sans relative">
      
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-10" 
            style={{ 
                backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', 
                backgroundSize: '50px 50px' 
            }}>
      </div>

      {/* Header */}
      <header className="flex-none h-20 px-8 border-b border-slate-800 bg-[#030712]/90 backdrop-blur z-20 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
            <div className="w-3 h-12 bg-cyan-600 rounded-sm shadow-[0_0_10px_#0891b2]"></div>
            <div>
                <h1 className="text-2xl font-black font-orbitron text-white tracking-tight">LIVE <span className="text-cyan-500">MONITOR</span></h1>
                <p className="text-slate-500 text-xs font-mono tracking-widest uppercase">KI-DETEKTOR STATUS: ONLINE</p>
            </div>
        </div>
        
        <div className="flex gap-8">
            <div className="text-right">
                <div className="text-4xl font-black font-mono text-white leading-none">{data.participants}</div>
                <div className="text-[10px] text-cyan-500 uppercase tracking-widest font-bold">Subjects</div>
            </div>
            <div className="w-px h-10 bg-slate-800"></div>
            <div className="text-right">
                <div className="text-4xl font-black font-mono text-green-400 leading-none drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                    {Math.round(data.averageScore)}<span className="text-lg align-top opacity-50">%</span>
                </div>
                <div className="text-[10px] text-green-600 uppercase tracking-widest font-bold">Accuracy</div>
            </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-grow p-6 grid grid-cols-12 grid-rows-2 md:grid-rows-1 gap-6 z-10 h-[calc(100vh-5rem)]">
        
        {/* Role Distribution */}
        <div className="col-span-12 md:col-span-4 h-full">
            <Card title="Demographics" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data.roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                    >
                    {data.roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{filter: `drop-shadow(0 0 5px ${COLORS[index % COLORS.length]}80)`}} />
                    ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px', backdropFilter: 'blur(4px)' }}
                        itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    />
                    <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="rect"
                        formatter={(value) => <span className="text-slate-300 text-xs font-mono uppercase ml-1">{value}</span>}
                    />
                </PieChart>
                </ResponsiveContainer>
                
                {/* Center Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                     <div className="text-center">
                         <div className="text-xs text-slate-500 font-mono">TOTAL</div>
                         <div className="text-2xl font-bold text-white font-mono">{data.participants}</div>
                     </div>
                </div>
            </Card>
        </div>

        {/* Scores */}
        <div className="col-span-12 md:col-span-5 h-full">
            <Card title="Detection Efficiency" className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data.roleScores}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={120} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace'}} 
                        interval={0} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <RechartsTooltip 
                        cursor={{fill: 'rgba(255,255,255,0.03)'}}
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1000}>
                        {
                            data.roleScores.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.score > 80 ? '#10b981' : entry.score > 50 ? '#f59e0b' : '#f43f5e'} 
                                    style={{filter: entry.score > 80 ? 'drop-shadow(0 0 6px rgba(16,185,129,0.6))' : 'none'}}
                                />
                            ))
                        }
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>

        {/* Live Feed */}
        <div className="col-span-12 md:col-span-3 h-full">
            <Card title="Incoming Data Stream" className="h-full flex flex-col">
                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {data.recentEntries.map((entry, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={`${entry.name}-${idx}`} 
                            className="bg-slate-800/40 p-3 rounded border border-slate-700/50 flex justify-between items-center group hover:bg-slate-800 transition-colors"
                        >
                            <div className="overflow-hidden">
                                <div className="font-bold text-slate-200 text-sm truncate w-24 font-mono group-hover:text-cyan-400 transition-colors">{entry.name}</div>
                                <div className="text-[10px] text-slate-500 truncate w-24 uppercase">{entry.role}</div>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className={`font-mono font-bold text-sm ${
                                    entry.percentage >= 75 ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' : 
                                    entry.percentage >= 50 ? 'text-yellow-400' : 
                                    'text-red-400'
                                }`}>
                                    {Math.round(entry.percentage)}%
                                </div>
                                <div className="text-[9px] text-slate-600">{entry.score}/4</div>
                            </div>
                        </motion.div>
                    ))}
                    {data.recentEntries.length === 0 && (
                        <div className="text-slate-600 text-center font-mono text-xs mt-10 animate-pulse">WAITING FOR DATA...</div>
                    )}
                </div>
            </Card>
        </div>

      </main>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #06b6d4;
        }
      `}</style>
    </div>
  );
};
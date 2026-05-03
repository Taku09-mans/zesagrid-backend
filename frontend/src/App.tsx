/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Brain, Zap, Menu, X } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Oracle from './components/Oracle';
import Login from './components/Login';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

function Navbar() {
  const location = useLocation();

  return (
    <header className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-cyan-500 flex items-center justify-center rounded-none rotate-45 transition-transform duration-500">
            <div className="-rotate-45 font-black text-zinc-950 uppercase text-[10px]">ZG</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase text-zinc-100">Zesa<span className="text-cyan-500">Grid</span></h1>
        </Link>
        <div className="ml-6 px-3 py-1 border border-cyan-500/30 text-cyan-400 text-[10px] uppercase tracking-widest font-mono hidden lg:block">
          Live Monitoring: Harare Metro
        </div>
      </div>
      
      <div className="flex items-center gap-8">
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className={cn("text-[10px] uppercase font-black tracking-widest hover:text-cyan-400 transition-colors", location.pathname === '/' ? "text-cyan-400" : "text-zinc-500")}>Dashboard</Link>
          <Link to="/oracle" className={cn("text-[10px] uppercase font-black tracking-widest hover:text-cyan-400 transition-colors", location.pathname === '/oracle' ? "text-cyan-400" : "text-zinc-500")}>The Oracle</Link>
        </nav>
        <div className="w-px h-8 bg-zinc-800" />
        <Login />
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Router>
      <div className="h-screen flex flex-col font-sans border-4 border-zinc-900 bg-zinc-950 text-zinc-200">
        <Navbar />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Left Rail (Static context/leaderboard-like or persistent metrics) */}
          <section className="w-[320px] border-r border-zinc-800 flex flex-col bg-zinc-950 hidden xl:flex">
             <div className="p-6 border-b border-zinc-800">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Grid_Status_Overview</h2>
                <p className="text-[10px] text-zinc-600 mt-1 uppercase font-mono tracking-tight">Harare North/South/Central</p>
             </div>
             <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                    <span>Power_Availability</span>
                    <span className="text-emerald-400">Stable</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '82%' }} className="h-full bg-emerald-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-zinc-500">
                    <span>Grid_Load_Factor</span>
                    <span className="text-amber-500">Elevated</span>
                  </div>
                  <div className="w-full h-1 bg-zinc-900 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '91%' }} className="h-full bg-amber-500" />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                   <h3 className="text-[10px] uppercase font-black tracking-widest text-zinc-600 mb-4">Regional_Faults</h3>
                   <div className="space-y-3">
                      {[
                        { area: 'Emerald Hill', type: 'Cable Theft', severity: 'High' },
                        { area: 'Greendale', type: 'Transformer Fault', severity: 'Med' },
                        { area: 'Kuwadzana Ext', type: 'Post-Rain Trip', severity: 'Low' }
                      ].map(f => (
                        <div key={f.area} className="p-3 bg-zinc-900/50 border border-zinc-800 text-[11px]">
                          <div className="flex justify-between mb-1">
                            <span className="font-bold text-zinc-300">{f.area}</span>
                            <span className={cn("uppercase text-[9px] px-1 font-mono", f.severity === 'High' ? 'bg-red-900/50 text-red-500' : 'bg-amber-900/50 text-amber-500')}>{f.severity}</span>
                          </div>
                          <div className="text-zinc-600 font-mono italic">{f.type}</div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </section>

          {/* Main Operating Stage */}
          <section className="flex-1 flex flex-col bg-zinc-950 relative overflow-y-auto data-grid-overlay">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/oracle" element={<Oracle />} />
            </Routes>
          </section>

          {/* Right Rail (Health & Metadata) */}
          <section className="w-[280px] border-l border-zinc-800 bg-zinc-950 p-6 flex flex-col hidden lg:flex">
            <div className="space-y-8">
              <div>
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Protocol_Metrics</h2>
                <div className="space-y-4 font-mono text-[11px]">
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-600 italic">Auth_Encryption</span>
                    <span className="text-emerald-400">AES_256</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-600 italic">Sync_Latency</span>
                    <span className="text-zinc-400">14ms</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-600 italic">Predictor_Build</span>
                    <span className="text-cyan-400">v2.1.0_LATEST</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-8">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Substation_Grid</h2>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "h-8 border",
                        i === 2 ? "bg-amber-900/50 border-amber-500/50" : "bg-emerald-900/50 border-emerald-500/50 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]"
                      )}
                    />
                  ))}
                </div>
                <p className="text-[9px] text-zinc-600 mt-3 font-mono uppercase tracking-tighter">Real-time switchboard telemetry</p>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800 flex flex-col gap-2">
                <p className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Postgres_Health</p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Neon_Live: Connected</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="h-12 border-t border-zinc-800 px-8 flex items-center justify-between bg-zinc-950 font-mono text-[10px] text-zinc-600">
           <div className="flex gap-8 uppercase tracking-tighter">
             <span>Build: <span className="text-zinc-400 italic">ZG_HRE_0428</span></span>
             <span className="hidden sm:inline">Stack: TS_NODE_VITE</span>
             <span className="hidden sm:inline">Database: NEON_POSTGRES_ACTIVE</span>
           </div>
           <div className="flex items-center gap-4 uppercase tracking-widest hidden md:flex">
             <span>&copy; 2026 ZesaGrid Predictive Platform</span>
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
           </div>
        </footer>
      </div>
    </Router>
  );
}

// Missing imports fix and Firebase ref
import { auth } from './lib/firebase';
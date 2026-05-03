import React, { useState, useEffect } from 'react';
import { Cpu, Search, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Suburb {
  id: number;
  name: string;
}

interface PredictionResponse {
  prediction: string; // "LOAD SHEDDING" or "LOCAL FAULT"
  confidence: number;
  suburb_id: number;
  hour: number;
}

export default function Oracle() {
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [selectedSuburb, setSelectedSuburb] = useState('');
  const [selectedHour, setSelectedHour] = useState('18');
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/suburbs`)
      .then(res => res.json())
      .then(setSuburbs)
      .catch(err => console.error("Oracle Suburb Fetch Error:", err));
  }, []);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuburb) return;

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suburb_id: parseInt(selectedSuburb),
          outage_hour: parseInt(selectedHour)
        }),
      });

      if (!response.ok) throw new Error('Prediction engine failed');

      const result = await response.json();
      await new Promise(resolve => setTimeout(resolve, 1200)); // Visual polish
      setPrediction(result);
    } catch (err) {
      console.error("Oracle Prediction Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-8 space-y-12 bg-black min-h-screen text-white">
      <div className="border border-cyan-500/20 p-8 bg-zinc-900/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-2 h-8 bg-cyan-500" />
          <h2 className="text-2xl font-bold uppercase tracking-tight text-white italic">The_Oracle <span className="text-zinc-600 not-italic">/ SYSTEM_PREDICTOR</span></h2>
        </div>

        <form onSubmit={handlePredict} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1">
                <MapPin size={10} /> Select_Geographic_Entity
              </label>
              <select
                value={selectedSuburb}
                onChange={(e) => setSelectedSuburb(e.target.value)}
                className="w-full h-12 bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono text-sm px-4 focus:outline-none focus:border-cyan-500/50 appearance-none rounded-none"
              >
                <option value="">CHOOSE_LOCAL_SUBURB...</option>
                {suburbs.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black text-zinc-500 tracking-widest flex items-center gap-1">
                <Clock size={10} /> Temporal_Parameter_Set
              </label>
              <select
                value={selectedHour}
                onChange={(e) => setSelectedHour(e.target.value)}
                className="w-full h-12 bg-zinc-950 border border-zinc-800 text-cyan-400 font-mono text-sm px-4 focus:outline-none focus:border-cyan-500/50 appearance-none rounded-none"
              >
                {[...Array(24)].map((_, i) => (
                  <option key={i} value={i}>{String(i).padStart(2, '0')}:00 (REF_HOUR)</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedSuburb}
            className="w-full h-14 bg-cyan-500 text-zinc-950 font-black uppercase tracking-[0.3em] text-sm hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Cpu className="animate-spin" size={18} />
                EXECUTING_RF_LOGIC...
              </>
            ) : (
              <>
                <Search size={18} />
                GENERATE_PREDICTION
              </>
            )}
          </button>
        </form>
      </div>

      <AnimatePresence mode="wait">
        {prediction && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-800 border border-zinc-800 overflow-hidden shadow-2xl"
          >
            <div className="bg-zinc-950 p-8 space-y-4">
              <p className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-2 tracking-widest">
                <span className="w-1.5 h-1.5 bg-cyan-500" /> Prediction_Result
              </p>
              <div>
                {/* Fixed logic: checks the 'prediction' string directly */}
                <h3 className={cn("text-4xl font-black uppercase tracking-tighter",
                  prediction.prediction === 'LOAD SHEDDING' ? 'text-red-500' : 'text-emerald-400')}>
                  {prediction.prediction}
                </h3>
                <p className="text-xs text-zinc-500 mt-2 font-mono italic">
                  Environmental risk assessment for Suburb_ID: {prediction.suburb_id}
                </p>
              </div>
            </div>
            <div className="bg-zinc-950 p-8 flex flex-col justify-center items-center text-center border-l border-zinc-800">
              <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2 tracking-[0.2em]">Confidence_Index</p>
              <div className="text-5xl font-black font-mono text-white tracking-widest">
                {((prediction.confidence || 0) * 100).toFixed(1)}<span className="text-lg font-normal text-zinc-600">%</span>
              </div>
              <div className="w-full mt-4 h-1 bg-zinc-900">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(prediction.confidence || 0) * 100}%` }}
                  className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pb-8">
        <p className="text-[10px] text-zinc-600 font-mono italic uppercase tracking-widest">
          Random Forest Classifier v2.1.0 // Latent Space Analysis 0.92x
        </p>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Navigation, CheckCircle2, Shield, Activity } from 'lucide-react';

interface DiscoveryStep {
  id: number;
  label: string;
  icon: React.ReactNode;
  status: 'pending' | 'active' | 'completed';
}

export default function FacilityDiscoveryAnimation() {
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const steps: DiscoveryStep[] = [
    { id: 1, label: 'Scanning location context...', icon: <Search className="w-4 h-4" />, status: 'pending' },
    { id: 2, label: 'Connecting to OpenStreetMap graph...', icon: <Shield className="w-4 h-4" />, status: 'pending' },
    { id: 3, label: 'Validating facility status...', icon: <CheckCircle2 className="w-4 h-4" />, status: 'pending' },
    { id: 4, label: 'Optimizing emergency route...', icon: <Navigation className="w-4 h-4" />, status: 'pending' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < steps.length) return prev + 1;
        return 0; // Restart
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (stepIndex === 0) {
      setResults([]);
    } else if (stepIndex === 3) {
      setResults([
        { name: "St. Mary's Memorial", dist: '1.2 mi', time: '4 min', status: 'OPEN' },
        { name: "Riverside Urgent Care", dist: '2.8 mi', time: '7 min', status: 'OPEN' },
      ]);
    } else if (stepIndex === 4) {
        setResults(prev => [...prev, { name: "County General", dist: '5.1 mi', time: '12 min', status: 'OPEN' }]);
    }
  }, [stepIndex]);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Background Decor */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-[#3b5bdb]/10 to-transparent rounded-[3rem] blur-2xl" />
      
      <div className="relative bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-blue-900/10 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0e1c35] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3b5bdb] rounded-lg flex items-center justify-center animate-pulse">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white text-xs font-bold tracking-tight">System: AtlasRoute 1.0</div>
              <div className="text-[#3b5bdb] text-[10px] font-mono leading-none mt-0.5">SCANNING_COORDINATES_TRINITY_TX</div>
            </div>
          </div>
          <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10">
            <span className="text-[10px] font-mono text-white/50">v1.2.0_STABLE</span>
          </div>
        </div>

        {/* Animation Area */}
        <div className="p-6">
          <div className="h-40 bg-[#fafaf7] rounded-2xl relative overflow-hidden mb-6 border border-gray-50">
             {/* Map Grid */}
             <div className="absolute inset-0 opacity-20 bg-[linear-gradient(#3b5bdb_1px,transparent_1px),linear-gradient(90deg,#3b5bdb_1px,transparent_1px)] [background-size:25px_25px]" />
             
             {/* Scanning Pulse */}
             <motion.div 
               animate={{ scale: [1, 3], opacity: [0.3, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#3b5bdb]/20 rounded-full" 
             />
             
             {/* Radar Sweep */}
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-r from-transparent via-[#3b5bdb]/5 to-transparent rounded-full origin-center"
             />

             {/* User Pin */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-4 h-4 bg-[#3b5bdb] rounded-full ring-4 ring-white shadow-lg z-10" />
                <div className="absolute top-0 w-20 h-20 bg-[#3b5bdb]/10 rounded-full blur-xl" />
             </div>

             {/* Result Pins */}
             <AnimatePresence>
                {stepIndex >= 1 && (
                   <>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-[15%] left-[20%] w-2.5 h-2.5 bg-blue-400/40 rounded-full ring-2 ring-white/50 shadow-sm" />
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }} className="absolute top-[40%] left-[80%] w-2 h-2 bg-blue-300/40 rounded-full ring-1 ring-white/50 shadow-sm" />
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute bottom-[20%] right-[30%] w-3 h-3 bg-blue-500/30 rounded-full ring-2 ring-white/50 shadow-sm" />
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute bottom-[45%] left-[10%] w-2 h-2 bg-blue-400/20 rounded-full ring-1 ring-white/30 shadow-sm" />
                   </>
                )}
                {stepIndex >= 3 && (
                   <>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1/4 right-1/4 w-3.5 h-3.5 bg-red-500 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full animate-ping" />
                      </motion.div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white shadow-sm" />
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute top-1/3 left-1/4 w-3.5 h-3.5 bg-amber-500 rounded-full ring-2 ring-white shadow-sm" />
                   </>
                )}
             </AnimatePresence>
          </div>

          <div className="space-y-4">
             {/* Progress Steps */}
             <div className="grid grid-cols-1 gap-2">
                {steps.map((step, idx) => (
                   <div key={step.id} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                        stepIndex > idx ? 'bg-green-100 text-green-600' : 
                        stepIndex === idx ? 'bg-[#3b5bdb] text-white animate-pulse' : 
                        'bg-gray-100 text-gray-400'
                      }`}>
                         {stepIndex > idx ? <CheckCircle2 className="w-3 h-3" /> : step.icon}
                      </div>
                      <span className={`text-[11px] font-bold tracking-tight uppercase ${
                        stepIndex === idx ? 'text-[#3b5bdb]' : 
                        stepIndex > idx ? 'text-gray-900' : 
                        'text-gray-300'
                      }`}>
                         {step.label}
                      </span>
                   </div>
                ))}
             </div>

             {/* Dynamic Results */}
             <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Verified Results</div>
                <AnimatePresence mode="popLayout">
                  {results.map((res, i) => (
                    <motion.div
                      key={res.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-[#fafaf7] p-3 rounded-xl border border-gray-100 flex items-center justify-between"
                    >
                       <div className="flex items-center gap-3">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-xs font-bold text-gray-700">{res.name}</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-[#3b5bdb]">{res.dist} / {res.time}</span>
                          <span className="text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded leading-none">
                            {res.status}
                          </span>
                       </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {results.length === 0 && (
                   <div className="h-10 flex items-center justify-center text-[10px] text-gray-300 italic font-mono">
                      Querying geospatial databases...
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

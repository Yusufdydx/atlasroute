import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';

interface LoadingContextType {
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // Trigger loading on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800); // Artificial delay for smooth transition
    return () => clearTimeout(timer);
  }, [location]);

  return (
    <LoadingContext.Provider value={{ setIsLoading }}>
      {children}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#fafaf7] pointer-events-auto"
          >
            <div className="relative">
              {/* Zooming Logo Container */}
              <motion.div
                animate={{ 
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Rotating Ring */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                    className="absolute inset-0 border-4 border-[#3b5bdb]/10 border-t-[#3b5bdb] rounded-full"
                  />
                  <Logo className="w-12 h-12" hideText />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#0e1c35]">Initializing</span>
                  <span className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-widest mt-1">Geospatial Intelligence</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};

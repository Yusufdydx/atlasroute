import React from 'react';
import { MapPin } from 'lucide-react';

export default function Logo({ className = "w-8 h-8", textClassName = "text-xl", hideText = false }: { className?: string, textClassName?: string, hideText?: boolean }) {
  return (
    <div className="flex items-center gap-2 group cursor-pointer">
      <div className={`relative ${className} flex items-center justify-center bg-[#3b5bdb] rounded-xl shadow-lg shadow-blue-900/20 group-hover:scale-110 transition-transform overflow-hidden`}>
        <MapPin size={24} className="text-white relative z-10 fill-white/20" />
        <span className="absolute inset-0 flex items-center justify-center text-white font-black text-xs pt-0.5 z-20">A</span>
      </div>
      {!hideText && (
        <span className={`font-black tracking-tighter text-[#0e1c35] ${textClassName}`}>
          ATLAS<span className="text-[#3b5bdb]">ROUTE</span>
        </span>
      )}
    </div>
  );
}

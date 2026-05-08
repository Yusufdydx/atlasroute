import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, MessageCircle } from 'lucide-react';

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faq = [
    { q: "Does AtlasRoute store my medical or location data?", a: "No. AtlasRoute is designed with a zero-persistence policy. All queries are processed in real time and discarded immediately. We maintain no logs of user locations or medical contexts." },
    { q: "Does it check if a specific hospital has a certain specialty?", a: "AtlasRoute focuses on proximity and accessibility. While we identify hospitals and clinics, we recommend calling ahead for rare specialties once a facility is located." },
    { q: "What data sources does AtlasRoute use?", a: "We rely on open, globally-trusted datasets: OpenStreetMap (geospatial), Nominatim (geocoding), and OpenRouteService (navigation). We also support HL7 FHIR for medical context." },
    { q: "How does it integrate into AI assistants?", a: "Via the Model Context Protocol (MCP). If your AI assistant supports MCP, you can plug in AtlasRoute tools to give it healthcare-finding capabilities instantly." },
    { q: "Is it worldwide or US-only?", a: "AtlasRoute works globally. Because we use OpenStreetMap, we has coverage in virtually every country on earth, though metadata density varies by region." },
    { q: "Can I use this for non-emergencies?", a: "Absolutely. We find pharmacies, regular clinics, and dentists as well. It is a general healthcare discovery tool, not just for emergencies." },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#3b5bdb]">
              <MessageCircle size={32} />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] tracking-tight mb-6">FAQ</h1>
            <p className="text-lg text-[#5a7499]">Common questions about the AtlasRoute platform.</p>
          </div>

          <div className="space-y-4">
             {faq.map((item, i) => (
                <div key={i} className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                   <button 
                     onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                     className="w-full p-8 text-left flex justify-between items-center group"
                   >
                      <span className={`text-base font-bold transition-colors ${activeFaq === i ? 'text-[#3b5bdb]' : 'text-[#0e1c35]'}`}>
                         {item.q}
                      </span>
                      <ChevronDown className={`w-5 h-5 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                   </button>
                   <AnimatePresence>
                      {activeFaq === i && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }}
                         >
                            <div className="px-8 pb-8 text-sm text-[#5a7499] leading-relaxed border-t border-gray-100 pt-6">
                               {item.a}
                            </div>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

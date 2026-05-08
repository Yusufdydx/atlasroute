import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, ArrowRight, ShieldCheck, Clock, Navigation, Search, 
  Stethoscope, Activity, Truck, Users, GraduationCap, HardHat, 
  CloudLightning, AlertCircle, CheckCircle2, ChevronDown, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import FacilityDiscoveryAnimation from '../components/FacilityDiscoveryAnimation';
import { stories } from '../data/stories';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const tools = [
    { icon: <Navigation className="text-red-500" />, name: 'Find Hospitals', desc: 'Locate nearby hospitals with route directions and travel time.', type: 'MCP Tool' },
    { icon: <Clock className="text-[#3b5bdb]" />, name: 'Find Pharmacies', desc: 'Discover medication access, including 24-hour locations.', type: 'MCP Tool' },
    { icon: <ShieldCheck className="text-green-600" />, name: 'Find Clinics', desc: 'Search for primary care clinics and urgent care offices.', type: 'MCP Tool' },
    { icon: <Search className="text-amber-500" />, name: 'Find All Facilities', desc: 'Comprehensive search across all healthcare types.', type: 'MCP Tool' },
  ];

  const useCases = [
    { icon: <AlertCircle className="text-red-500" />, title: 'Accident & Emergency', desc: 'Sudden injury in unfamiliar territory where seconds matter.' },
    { icon: <Users className="text-[#3b5bdb]" />, title: 'Elderly Individuals', desc: 'Seniors living alone who need immediate, clear directions.' },
    { icon: <Truck className="text-amber-600" />, title: 'Mobility Workers', desc: 'Truck drivers and delivery crews facing high cardiac risks.' },
    { icon: <Users className="text-green-600" />, title: 'Tourists & Visitors', desc: '79M annual visitors who don\'t know the local landscape.' },
    { icon: <GraduationCap className="text-purple-600" />, title: 'Local Students', desc: 'Students new to a city needing their first local health provider.' },
    { icon: <HardHat className="text-orange-600" />, title: 'Field Workers', desc: 'Construction and remote crews far from urban centers.' },
    { icon: <CloudLightning className="text-blue-500" />, title: 'Disaster Scenarios', desc: 'Live data when roads close and systems fail.' },
    { icon: <Activity className="text-emerald-600" />, title: 'Rural Populations', desc: 'Communities where awareness is the primary care gap.' },
  ];

  const faq = [
    { q: "Does AtlasRoute store my medical or location data?", a: "No. AtlasRoute is designed with a zero-persistence policy. Your location and health data are processed in real-time and never saved, logged, or sold. Your privacy is non-negotiable." },
    { q: "What data sources does it use?", a: "We rely on open standards: OpenStreetMap for facility data, Nominatim for geocoding, and OpenRouteService for emergency navigation. It is the most transparent graph in existence." },
    { q: "Is it a replacement for 911?", a: "Never. In a life-threatening emergency, always contact 911. AtlasRoute is a discovery tool for navigation and decision context that supports emergency awareness." },
    { q: "Does it work internationally?", a: "Yes. Wherever OpenStreetMap has data (global coverage), AtlasRoute can find facilities. Coverage varies by region but is globally accessible." },
  ];

  const reviews = [
    { author: "Darnell W.", role: "Logistics Driver", text: "Kentucky night haul. Chest pressure. No idea where I was. AtlasRoute found the ER in 10 seconds. I'm here because of it.", color: "bg-blue-600", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
    { author: "Sandra P.", role: "Registered Nurse", text: "My 80-year-old mom called at midnight confused. I used AtlasRoute from another state to direct her to help immediately.", color: "bg-red-500", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
    { author: "Klaus M.", role: "Tourist", text: "Visiting NYC from Germany. Cut my hand badly. Found an urgent care 2 blocks away that didn't appear on standard maps.", color: "bg-green-600", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
    { author: "Ray T.", role: "Site Supervisor", text: "On-site fall in a new suburb. Had directions to the trauma center before 911 even answered my call.", color: "bg-amber-500", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" },
  ];

  return (
    <div className="bg-[#fafaf7] text-[#0e1c35] font-sans selection:bg-[#3b5bdb]/10 selection:text-[#3b5bdb]">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center pt-8 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-30">
           <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#eef2ff] to-transparent rounded-full blur-3xl" />
           <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#fff9db] to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-10 items-center z-10 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl xs:text-5xl sm:text-7xl lg:text-[7rem] font-black leading-[0.9] tracking-tighter mb-8 max-w-4xl">
              Find care <span className="text-[#3b5bdb]">Fast.</span><br />
              <span className="text-gray-400/20">Anywhere.</span>
            </h1>
            
            <p className="text-base md:text-lg text-[#5a7499] mb-8 leading-relaxed max-w-lg font-medium">
              AtlasRoute is the map of last resort. For truck drivers, tourists, and rural families—we provide the intelligence to find healthcare when the system feels invisible.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to="/register" className="bg-[#3b5bdb] text-white font-bold py-4 px-10 rounded-2xl flex items-center gap-3 transition-all hover:bg-[#2f4ac4] hover:-translate-y-1 shadow-xl shadow-blue-500/20 no-underline text-base">
                Sign Up Now <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="bg-white border-2 border-gray-100 text-[#0e1c35] font-bold py-4 px-10 rounded-2xl hover:border-[#3b5bdb] transition-all no-underline text-base shadow-sm">
                Log In
              </Link>
            </div>

            <div className="flex gap-10">
               <div>
                  <div className="text-2xl font-black text-[#0e1c35]">110<span className="text-[#3b5bdb]">+</span></div>
                  <div className="text-[9px] font-bold text-[#5a7499] uppercase tracking-widest mt-1">Closed Facilities</div>
               </div>
               <div className="w-px h-10 bg-gray-200 self-center" />
               <div>
                  <div className="text-2xl font-black text-[#0e1c35]">72<span className="text-[#3b5bdb]">m</span></div>
                  <div className="text-[9px] font-bold text-[#5a7499] uppercase tracking-widest mt-1">Travel Gap</div>
               </div>
               <div className="w-px h-10 bg-gray-200 self-center" />
               <div>
                  <div className="text-2xl font-black text-[#0e1c35]">Live</div>
                  <div className="text-[9px] font-bold text-[#5a7499] uppercase tracking-widest mt-1">Data Stream</div>
               </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <FacilityDiscoveryAnimation />
          </motion.div>
        </div>
      </section>

      {/* TICKER */}
      <div className="bg-[#3b5bdb] text-white py-2 overflow-hidden whitespace-nowrap border-y border-white/10 flex items-center">
        <motion.div 
          animate={{ x: [0, -1000] }} 
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="flex gap-8 items-center"
        >
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex gap-8 items-center">
              <span className="text-[9px] font-bold uppercase tracking-widest">⚡ 18 rural hospitals closed in 2025</span>
              <div className="w-1 h-1 bg-white opacity-40 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-widest">🏥 700+ rural facilities at risk</span>
              <div className="w-1 h-1 bg-white opacity-40 rounded-full" />
              <span className="text-[9px] font-bold uppercase tracking-widest">🚛 Truck drivers face 50% higher risk</span>
              <div className="w-1 h-1 bg-white opacity-40 rounded-full" />
            </div>
          ))}
        </motion.div>
      </div>

      {/* PROBLEM SECTION */}
      <section id="problem" className="py-16 bg-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-12">
            <div>
              <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">The Statistics</div>
              <h2 className="text-3xl md:text-4xl font-extrabold leading-[1.1] tracking-tight">
                Healthcare is everywhere.<br />
                <span className="text-gray-300">Finding it isn't.</span>
              </h2>
            </div>
            <p className="text-[#5a7499] text-sm leading-relaxed max-w-sm border-l-2 border-gray-100 pl-6">
              The gap between an emergency and a solution is often just a lack of live geospatial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {[
               { num: '110+', label: 'Hospitals Lost', desc: 'Over a century of medical infrastructure vanished in 20 years.', color: 'bg-red-500 shadow-red-500/30' },
               { num: '72 min', label: 'Average Gap', desc: 'The divide between survival and tragedy is now purely geographic.', color: 'bg-[#3b5bdb] shadow-blue-500/30' },
               { num: 'Zero', label: 'Visibility', desc: 'No central agency provides a live, verified graph of facility status.', color: 'bg-amber-500 shadow-amber-500/30' },
             ].map((item, i) => (
               <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-gray-50 flex flex-col justify-between group hover:border-[#3b5bdb] transition-all hover:shadow-2xl hover:shadow-blue-900/10 h-full">
                 <div>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl ${item.color}`}>
                       <div className="font-black text-2xl tracking-tighter">
                          {item.num.includes('+') ? '+' : item.num.substring(0, 1).toUpperCase()}
                       </div>
                    </div>
                    <div className="text-2xl font-black mb-1">{item.num}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#3b5bdb] mb-6">{item.label}</div>
                 </div>
                 <p className="text-sm text-[#5a7499] leading-relaxed italic border-t border-gray-100 pt-8 opacity-80">"{item.desc}"</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* STORIES SECTION */}
      <section id="stories" className="py-16 bg-[#fafaf7] px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
             <div className="max-w-xl">
                <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">Deep Integration</div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Real People. Real Reports.</h2>
             </div>
             <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex -space-x-2">
                   {[
                     "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop",
                     "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=50&h=50&fit=crop",
                     "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=50&h=50&fit=crop",
                     "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=50&h=50&fit=crop"
                   ].map((url, i) => (
                     <img key={i} src={url} alt="User" className="w-8 h-8 rounded-full border-2 border-white object-cover" referrerPolicy="no-referrer" />
                   ))}
                </div>
                <span className="text-[10px] font-black text-[#0e1c35] uppercase tracking-widest">+12 cases documented</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {stories.slice(0, 4).map((story) => (
              <motion.div 
                key={story.id} 
                whileHover={{ y: -3 }}
                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`text-[9px] font-bold uppercase tracking-widest mb-4 ${
                  story.type === 'urgent' ? 'text-red-500' : 'text-[#3b5bdb]'
                }`}>
                  {story.location}
                </div>
                <h3 className="text-xl font-extrabold mb-4 leading-tight">{story.title}</h3>
                <p className="text-[#5a7499] text-xs leading-relaxed line-clamp-2 mb-6 italic">
                   "{story.quote}"
                </p>
                <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                  <Link to={`/story/${story.id}`} className="inline-flex items-center gap-2 bg-[#0e1c35] text-white text-[10px] font-bold py-2.5 px-6 rounded-full group no-underline">
                    Read Report <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
             <Link to="/stories" className="inline-flex items-center gap-3 bg-white border border-gray-200 text-[#0e1c35] font-black py-5 px-12 rounded-2xl hover:border-[#3b5bdb] transition-all no-underline shadow-lg shadow-blue-900/5 hover:shadow-blue-900/10">
                VIEW ALL STORIES <ArrowRight size={20} />
             </Link>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section id="who" className="py-16 bg-white px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
             <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">Ecosystem</div>
             <h2 className="text-3xl font-extrabold tracking-tight">Who AtlasRoute Serves</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {useCases.map((uc, i) => (
               <div key={i} className="p-6 bg-[#fafaf7] rounded-[2rem] border border-transparent hover:border-[#3b5bdb] transition-colors group">
                  <div className="mb-4">{uc.icon}</div>
                  <h3 className="text-xs font-bold mb-1 group-hover:text-[#3b5bdb] transition-colors">{uc.title}</h3>
                  <p className="text-[10px] text-[#5a7499] leading-relaxed line-clamp-2">{uc.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-16 bg-[#0e1c35] text-white px-6 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
             <div>
                <div className="text-[9px] font-bold text-[#748ffc] uppercase tracking-[0.2em] mb-3">Mechanism</div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-8 tracking-tight">From question to care<br />in 10 seconds.</h2>
                <div className="space-y-8 relative">
                   <div className="absolute left-[9px] top-4 bottom-4 w-px bg-white/10" />
                   {[
                     { step: '01', title: 'User Input', desc: 'A natural language query entered via any AI assistant context.' },
                     { step: '02', title: 'MCP Invocation', desc: 'The AI calls AtlasRoute logic to scan the geospatial graph.' },
                     { step: '03', title: 'Verification', desc: 'Live check of hospital status and coordinate validation.' },
                     { step: '04', title: 'Precision Routing', desc: 'Turn-by-turn logic pushed back to the user dashboard.' },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-6 relative z-10 group">
                        <div className="w-5 h-5 bg-white/10 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-bold text-[#748ffc] group-hover:bg-[#3b5bdb] group-hover:border-[#3b5bdb] group-hover:text-white transition-all">
                           {item.step}
                        </div>
                        <div>
                           <h3 className="text-xs font-bold mb-0.5">{item.title}</h3>
                           <p className="text-[10px] text-white/40 leading-relaxed max-w-xs">{item.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
             <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3b5bdb]/20 to-transparent rounded-[3rem] blur-3xl opacity-50" />
                <div className="relative bg-white/5 border border-white/10 p-10 rounded-[3rem] backdrop-blur-sm">
                   <Award className="w-10 h-10 text-[#748ffc] mb-8" />
                   <h3 className="text-xl font-bold mb-4 italic font-serif">"Built on the most reliable open graph in existence."</h3>
                   <p className="text-white/60 text-xs leading-relaxed mb-6">
                     AtlasRoute bypasses proprietary walled gardens and closed databases. We use the same graph trusted by 
                     global emergency services and the scientific community.
                   </p>
                   <div className="flex gap-3 flex-wrap">
                      {['OpenStreetMap', 'HL7 FHIR', 'Nominatim', 'ORS'].map(t => (
                        <span key={t} className="px-2.5 py-1 bg-white/10 rounded-lg text-[8px] font-bold uppercase tracking-widest">{t}</span>
                      ))}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* REVIEWS TRACK */}
      <section id="reviews" className="py-16 bg-white overflow-hidden border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
           <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">Feedback</div>
           <h2 className="text-3xl font-extrabold tracking-tight">Community Trust</h2>
        </div>
        <div className="flex gap-5 animate-scroll-left hover:pause px-6">
           {[...reviews, ...reviews].map((r, i) => (
             <div key={i} className="min-w-[280px] bg-[#fafaf7] p-8 rounded-[2rem] border border-gray-50 flex flex-col justify-between shadow-sm">
                <div>
                   <div className="flex gap-1 mb-5">
                      {Array(5).fill(0).map((_, i) => <div key={i} className="w-2.5 h-2.5 bg-amber-400 rounded-full" />)}
                   </div>
                   <p className="text-xs text-[#5a7499] italic leading-relaxed mb-8">"{r.text}"</p>
                </div>
                <div className="flex items-center gap-3">
                   <img 
                      src={r.image} 
                      alt={r.author} 
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" 
                      referrerPolicy="no-referrer"
                   />
                   <div>
                      <div className="text-[11px] font-bold text-[#0e1c35]">{r.author}</div>
                      <div className="text-[9px] text-gray-400 font-medium">{r.role}</div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* TOOLS SECTION */}
      <section id="tools" className="py-16 bg-[#fafaf7] px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">MCP Suite</div>
                 <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-6">Intelligence as a service.</h2>
                 <p className="text-[#5a7499] text-sm leading-relaxed mb-8">
                    AtlasRoute exposes its entire capability set as MCP-compatible tools. Integrate healthcare discovery into any agent workflow instantly.
                 </p>
                 <Link to="/tools" className="inline-flex items-center gap-2 text-xs font-bold text-[#3b5bdb] hover:underline no-underline">
                    Request API Access <ArrowRight size={14} />
                 </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {tools.map((tool, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all group">
                       <div className="w-10 h-10 bg-[#fafaf7] rounded-xl flex items-center justify-center mb-5 text-lg">
                          {tool.icon}
                       </div>
                       <h3 className="text-xs font-bold mb-1.5 group-hover:text-[#3b5bdb] transition-colors">{tool.name}</h3>
                       <p className="text-[10px] text-[#5a7499] leading-relaxed mb-5">{tool.desc}</p>
                       <span className="text-[8px] font-black uppercase tracking-widest text-[#3b5bdb] bg-[#3b5bdb]/5 px-2 py-0.5 rounded-md">{tool.type}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 bg-white px-6 md:px-12">
         <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
               <div className="text-[9px] font-bold text-[#3b5bdb] uppercase tracking-[0.2em] mb-3">Inquiry</div>
               <h2 className="text-2xl font-bold tracking-tight">Common Knowledge</h2>
            </div>
            <div className="space-y-3">
               {faq.map((item, i) => (
                  <div key={i} className="bg-[#fafaf7] rounded-xl border border-gray-50 overflow-hidden">
                     <button 
                       onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                       className="w-full p-5 text-left flex justify-between items-center group"
                     >
                        <span className={`text-xs font-bold transition-colors ${activeFaq === i ? 'text-[#3b5bdb]' : 'text-[#0e1c35]'}`}>
                           {item.q}
                        </span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                     </button>
                     <AnimatePresence>
                        {activeFaq === i && (
                           <motion.div 
                             initial={{ height: 0, opacity: 0 }} 
                             animate={{ height: 'auto', opacity: 1 }} 
                             exit={{ height: 0, opacity: 0 }}
                           >
                              <div className="px-5 pb-5 text-[11px] text-[#5a7499] leading-relaxed border-t border-gray-100 pt-3">
                                 {item.a}
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               ))}
            </div>
            <div className="mt-10 text-center">
               <Link to="/faq" className="text-[10px] font-bold text-[#3b5bdb] uppercase tracking-widest hover:underline">View All FAQs →</Link>
            </div>
         </div>
      </section>

      <Footer />

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 40s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

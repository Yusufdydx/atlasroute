import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Navigation, Clock, ShieldCheck, Search, Activity, Radar, Database, Zap } from 'lucide-react';

export default function Tools() {
  const tools = [
    { icon: <Navigation className="text-red-500" />, name: 'Find Hospitals', desc: 'Locate nearby hospitals with route directions and travel time. Returns the nearest accessible facilities based on real-time location.', type: 'MCP Tool' },
    { icon: <Clock className="text-[#3b5bdb]" />, name: 'Find Pharmacies', desc: 'Discover pharmacies for medication access, including 24-hour locations. Essential for patients needing prescriptions after hours.', type: 'MCP Tool' },
    { icon: <ShieldCheck className="text-green-600" />, name: 'Find Clinics', desc: 'Search for primary care clinics and urgent care offices within range. Ideal for non-emergency situations.', type: 'MCP Tool' },
    { icon: <Search className="text-amber-500" />, name: 'Find All Facilities', desc: 'Comprehensive search across all healthcare facility types simultaneously. Returns a complete picture of available care.', type: 'MCP Tool' },
    { icon: <Activity className="text-emerald-600" />, name: 'Symptom Triage', desc: 'AI-powered urgency assessment to help users understand whether they need emergency, urgent, or routine care.', type: 'AI Driven' },
    { icon: <Radar className="text-purple-600" />, name: 'Distance Matrix', desc: 'Calculate multiple travel times simultaneously to find the most efficient path in complex traffic or rural contexts.', type: 'Logic Tool' },
    { icon: <Database className="text-gray-600" />, name: 'FHIR Context Checker', desc: 'Securely checks patient medical records for relevant condition flags that might influence choice of facility.', type: 'Data Tool' },
    { icon: <Zap className="text-yellow-500" />, name: 'Live Ticker Feed', desc: 'Monitors real-time alerts for hospital closures or regional medical capacity status.', type: 'Network Tool' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] tracking-tight mb-6">AtlasRoute Tools</h1>
            <p className="text-lg text-[#5a7499] max-w-2xl mx-auto">
              Our Model Context Protocol (MCP) suite provides high-fidelity healthcare geospatial logic to any AI assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 bg-[#fafaf7] rounded-2xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h3 className="font-bold text-[#0e1c35] mb-2">{tool.name}</h3>
                <p className="text-xs text-[#5a7499] leading-relaxed mb-6">{tool.desc}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#3b5bdb] bg-[#3b5bdb]/5 px-3 py-1.5 rounded-lg">
                  {tool.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

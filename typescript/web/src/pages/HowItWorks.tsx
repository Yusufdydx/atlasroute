import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Terminal, Cpu, Database, Share2 } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    { icon: <Terminal />, title: "1. The Request", desc: "A user asks their AI assistant for help: 'I'm experiencing vertigo, where is the nearest clinic?' Natural language is parsed for intent." },
    { icon: <Cpu />, title: "2. MCP Bridge", desc: "The AI agent invokes the AtlasRoute MCP server, passing the user's current GPS coordinates and the specific facility type requested." },
    { icon: <Database />, title: "3. Live Graph Query", desc: "AtlasRoute queries thousands of nodes in the OSM environment, filtering for 'hospital', 'clinic', or 'urgent_care' tags." },
    { icon: <Share2 />, title: "4. Logic Injection", desc: "Results are formatted with distance matrices and routing instructions, then presented back to the user through the AI's interface." }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] mb-8 tracking-tight">How it works</h1>
          <div className="prose prose-lg text-[#2a3f5f] leading-relaxed mb-16">
            <p className="text-xl">
              AtlasRoute isn't a standalone search engine—it is a logical layer for the next generation of AI agents. 
              By connecting high-fidelity geospatial and healthcare data to the Model Context Protocol, we enable 
              assistants to act as emergency guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                <div className="w-14 h-14 bg-[#3b5bdb]/10 rounded-2xl flex items-center justify-center text-[#3b5bdb] mb-8">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0e1c35] mb-4">{step.title}</h3>
                <p className="text-sm text-[#5a7499] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

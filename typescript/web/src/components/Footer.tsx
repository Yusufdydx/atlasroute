import Logo from './Logo';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#080f1e] text-white/60 py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-12 text-sm leading-relaxed">
          <strong className="text-white">Important:</strong> AtlasRoute helps users locate healthcare facilities using publicly available data from OpenStreetMap. Users should verify facility hours and availability by calling ahead when time permits. In life-threatening emergencies, always contact emergency services immediately — 911 in the United States, 112 in Europe, or your local emergency number.
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block no-underline mb-6">
              <Logo textClassName="text-xl text-white" />
            </Link>
            <p className="text-sm leading-7 max-w-sm">
              Because finding care should never be the hardest part. AtlasRoute makes healthcare facility discovery instant, intelligent, and accessible for anyone, anywhere.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Product</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/tools" className="hover:text-white transition-colors">MCP Tools</Link>
              <Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link>
              <Link to="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
              <Link to="/faq" className="hover:text-white transition-colors">FAQ</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Technology</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/mcp-protocol" className="hover:text-white transition-colors">MCP Protocol</Link>
              <Link to="/openstreetmap" className="hover:text-white transition-colors">OpenStreetMap</Link>
              <Link to="/hl7-fhir" className="hover:text-white transition-colors">HL7 FHIR</Link>
              <Link to="/openrouteservice" className="hover:text-white transition-colors">OpenRouteService</Link>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-6">Company</h4>
            <div className="flex flex-col gap-3 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">About AtlasRoute</Link>
              <Link to="/mission" className="hover:text-white transition-colors">Mission</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>

        
        <div className="border-top border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <span>© 2025 AtlasRoute. All rights reserved.</span>
          <span>Built for the MCP Hackathon · Powered by open standards</span>
        </div>
      </div>
    </footer>
  );
}

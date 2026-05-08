import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] mb-8 tracking-tight">About AtlasRoute</h1>
          <div className="prose prose-lg text-[#2a3f5f] leading-relaxed">
            <p className="text-xl font-medium mb-8">
              AtlasRoute was born during the MCP (Model Context Protocol) Hackathon with a simple yet critical mission: 
              making healthcare facility discovery instant, intelligent, and reliable for anyone, anywhere.
            </p>
            <h2 className="text-2xl font-bold text-[#0e1c35] mt-12 mb-6">The Gap We Fill</h2>
            <p>
              While hospitals close and healthcare systems consolidate, the information available to the public often lags 
              behind. In many rural counties, "nearest hospital" might mean a facility that has been closed for months or 
              even years. AtlasRoute leverages real-time data and AI-powered geocoding to bridge this information gap.
            </p>
            <h2 className="text-2xl font-bold text-[#0e1c35] mt-12 mb-6">How We Build</h2>
            <p>
              We believe in open standards. AtlasRoute is built using the Model Context Protocol (MCP), allowing any 
              AI assistant to instantly gain "Healthcare Sight." We source our data from OpenStreetMap, Nominatim, 
              and OpenRouteService—ensuring we rely on globally-proven, crowdsourced, and transparent datasets.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

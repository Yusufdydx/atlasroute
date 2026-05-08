import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TechPage({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#0e1c35] mb-8 tracking-tight">{title}</h1>
          <div className="prose prose-lg text-[#2a3f5f] leading-relaxed">
            <p className="text-xl font-medium mb-6">{desc}</p>
            <p>
              This technology forms a core pillar of the AtlasRoute ecosystem. By adhering to open standards, 
              we ensure that our infrastructure remains flexible, transparent, and resilient to the 
              fluctuations of proprietary data providers.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

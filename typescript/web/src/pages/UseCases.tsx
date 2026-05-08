import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function UseCases() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] mb-8 tracking-tight text-center">Use Cases</h1>
          <div className="space-y-12">
            {[
              { title: "Transport Logistics", text: "Truck drivers operating across multiple states are 50% more likely to suffer from cardiovascular issues. AtlasRoute provides them with a safety net in unfamiliar locations." },
              { title: "Rural Crisis Management", text: "In counties where hospitals close without warning, AtlasRoute provides residents with the immediate awareness of the next nearest stable point of care." },
              { title: "International Tourism", text: "Visitors to the US often do not understand the tiered system of ER vs Urgent Care. AtlasRoute triages their needs and sends them to the correct facility type." }
            ].map((uc, i) => (
              <div key={i} className="bg-white p-12 rounded-[3.5rem] border border-gray-100">
                <h3 className="text-2xl font-bold mb-4">{uc.title}</h3>
                <p className="text-[#5a7499] text-lg leading-relaxed">{uc.text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

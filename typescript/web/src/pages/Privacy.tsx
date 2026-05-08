import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col text-[#2a3f5f]">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6 leading-relaxed">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-[#0e1c35] mb-12 tracking-tight">Privacy Policy</h1>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0e1c35] mb-4">Our Commitment</h2>
            <p className="mb-4">
              At AtlasRoute, we understand that location and healthcare information are deeply personal. We have built our architecture on a "zero-persistence" foundation.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[#0e1c35] mb-4">Data Collection</h2>
            <ul className="list-disc pl-6 space-y-4">
              <li>
                <strong>Location Data:</strong> We access your geolocation only when a query is initiated. This data is used solely to resolve the search and is never stored on our servers.
              </li>
              <li>
                <strong>Healthcare Records (FHIR):</strong> If you choose to connect a FHIR record, the data is processed locally within the AI context and is never persisted by AtlasRoute.
              </li>
              <li>
                <strong>Cookies:</strong> We do not use tracking cookies or 3rd party analytics that profile individual users.
              </li>
            </ul>
          </section>

          <div className="bg-[#3b5bdb]/10 border border-[#3b5bdb]/20 p-8 rounded-3xl">
            <p className="font-bold text-[#3b5bdb]">No Advertisements. No Data Selling. No Surveillance.</p>
            <p className="text-sm mt-2">Our only incentive is to give you accurate healthcare information.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

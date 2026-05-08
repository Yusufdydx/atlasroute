import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Heart, Shield } from 'lucide-react';

export default function Mission() {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-[#3b5bdb]" />,
      title: "Precision",
      desc: "In an emergency, every minute counts. We strive for mathematical precision in our routing and facility data."
    },
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Access",
      desc: "We believe healthcare information is a human right. Access to information should not depend on your zip code."
    },
    {
      icon: <Shield className="w-8 h-8 text-green-600" />,
      title: "Privacy",
      desc: "Your health and location data belongs to you. We maintain a zero-persistence policy on all user queries."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] mb-6 tracking-tight">Our Mission</h1>
            <p className="text-xl text-[#5a7499] max-w-2xl mx-auto italic font-serif">
              "To ensure that no one suffers from a lack of information when seeking medical care."
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:-translate-y-2">
                <div className="mb-6">{v.icon}</div>
                <h3 className="text-xl font-bold text-[#0e1c35] mb-4">{v.title}</h3>
                <p className="text-[#5a7499] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#3b5bdb] rounded-[40px] p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-6">Join the Movement</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8">
              We are expanding our network of data providers and AI integrations. Help us build a future where 'care' is never more than a question away.
            </p>
            <a href="mailto:contact@atlasroute.ai" className="inline-block bg-white text-[#3b5bdb] font-bold py-4 px-10 rounded-full">
              Partner With Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

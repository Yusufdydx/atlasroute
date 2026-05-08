import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MessageSquare, Globe, ArrowRight } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          <div>
            <h1 className="text-5xl font-extrabold text-[#0e1c35] mb-8 tracking-tight">Get in touch</h1>
            <p className="text-lg text-[#5a7499] mb-12 leading-relaxed">
              Have questions about MCP integration or want to contribute to our healthcare facility dataset? We'd love to hear from you.
            </p>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[#3b5bdb]">
                  <Mail />
                </div>
                <div>
                  <h3 className="font-bold text-[#0e1c35]">Email</h3>
                  <p className="text-sm text-[#5a7499]">contact@atlasroute.ai</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-green-600">
                  <MessageSquare />
                </div>
                <div>
                  <h3 className="font-bold text-[#0e1c35]">Community</h3>
                  <p className="text-sm text-[#5a7499]">Join our Discord server</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-purple-600">
                  <Globe />
                </div>
                <div>
                  <h3 className="font-bold text-[#0e1c35]">Open Source</h3>
                  <p className="text-sm text-[#5a7499]">Explore on GitHub</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#0e1c35] mb-2 uppercase tracking-wide">Name</label>
                <input type="text" className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0e1c35] mb-2 uppercase tracking-wide">Email</label>
                <input type="email" className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0e1c35] mb-2 uppercase tracking-wide">Message</label>
                <textarea className="w-full bg-[#fafaf7] border-0 rounded-2xl p-4 text-[#0e1c35] focus:ring-2 focus:ring-[#3b5bdb] transition-shadow h-32" placeholder="How can we help?"></textarea>
              </div>
              <button disabled className="w-full bg-[#3b5bdb] text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] opacity-50 cursor-not-allowed">
                Send Message <ArrowRight size={20} />
              </button>
              <p className="text-[10px] text-center text-gray-400 mt-4">Form is currently for demonstration. Use email for actual contact.</p>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

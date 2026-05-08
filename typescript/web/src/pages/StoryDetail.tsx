import { useParams, Link, useNavigate } from 'react-router-dom';
import { stories } from '../data/stories';
import { ChevronLeft, Share2, MapPin, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useEffect } from 'react';

export default function StoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const story = stories.find(s => s.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-2xl font-bold text-[#0e1c35] mb-4">Story not found</h1>
          <Link to="/" className="text-[#3b5bdb] font-medium flex items-center gap-2">
            <ChevronLeft size={18} /> Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/#stories" className="inline-flex items-center gap-2 text-sm font-semibold text-[#3b5bdb] mb-8 group">
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to All Stories
          </Link>

          <div className="mb-12">
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-4 inline-block px-3 py-1 rounded-full border ${
              story.type === 'urgent' ? 'text-red-500 border-red-100 bg-red-50' :
              story.type === 'gold' ? 'text-amber-600 border-amber-100 bg-amber-50' :
              story.type === 'green' ? 'text-green-600 border-green-100 bg-green-50' :
              'text-[#3b5bdb] border-[#c5d0fa] bg-[#eef2ff]'
            }`}>
              {story.location}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-[#0e1c35] leading-tight tracking-tight mb-8">
              {story.title}
            </h1>
            
            <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-12 shadow-sm italic text-lg md:text-xl text-[#0e1c35] border-l-[6px] border-l-[#3b5bdb]">
              "{story.quote}"
              <div className="mt-4 not-italic text-sm font-bold text-[#2a3f5f]">— {story.quoteAuthor}</div>
            </div>
          </div>

          <div className="space-y-8 text-lg leading-relaxed text-[#2a3f5f] font-serif">
            {story.fullBody.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="bg-gray-100/50 rounded-2xl p-6 text-sm text-[#5a7499] flex flex-col md:flex-row md:items-start gap-4">
              <ExternalLink size={18} className="flex-shrink-0 mt-1" />
              <div>
                <span className="font-bold text-[#0e1c35] block mb-1">Source Documentation</span>
                {story.source}
              </div>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <button className="bg-[#3b5bdb] text-white font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-transform hover:-translate-y-1 shadow-lg shadow-[#3b5bdb]/20">
                <MapPin size={20} /> Use AtlasRoute Now
              </button>
              <button className="bg-white border-2 border-gray-200 text-[#0e1c35] font-bold py-4 px-8 rounded-full flex items-center gap-3 transition-colors hover:border-[#3b5bdb] hover:text-[#3b5bdb]">
                <Share2 size={20} /> Share Story
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

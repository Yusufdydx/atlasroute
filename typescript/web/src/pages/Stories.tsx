import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { stories } from '../data/stories';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Stories() {
  return (
    <div className="min-h-screen bg-[#fafaf7] flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#0e1c35] tracking-tight mb-6">Field Reports</h1>
            <p className="text-lg text-[#5a7499] max-w-2xl mx-auto">
              Documenting the impact of the rural healthcare crisis and how access to information saves lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <motion.div 
                key={story.id} 
                className="bg-white rounded-[2.5rem] p-10 border border-gray-100 flex flex-col h-full shadow-sm hover:shadow-xl transition-all"
              >
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${
                  story.type === 'urgent' ? 'text-red-500' :
                  story.type === 'gold' ? 'text-amber-500' :
                  'text-[#3b5bdb]'
                }`}>
                  {story.location}
                </div>
                <h3 className="text-2xl font-extrabold mb-6 text-[#0e1c35] leading-tight">{story.title}</h3>
                <p className="text-[#5a7499] text-base leading-relaxed line-clamp-3 mb-8">
                   {story.fullBody[0]}
                </p>
                <div className="mt-auto pt-8 border-t border-gray-50 flex items-center justify-between">
                  <Link to={`/story/${story.id}`} className="text-[#3b5bdb] font-bold text-sm flex items-center gap-2 group">
                    View Full Story <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

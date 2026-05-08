import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Home, AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="bg-[#fafaf7] text-[#0e1c35] font-sans min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-8">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#0e1c35] mb-4">
            Page Unavailable
          </h1>
          
          <p className="text-lg text-[#5a7499] mb-8 leading-relaxed">
            This link is invalid, expired, or no longer exists. 
            Please return to the homepage to generate a new location link.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#3b5bdb] text-white font-semibold rounded-full hover:bg-[#2c4abc] transition-colors"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
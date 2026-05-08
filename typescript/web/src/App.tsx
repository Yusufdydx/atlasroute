import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LoadingProvider } from './components/LoadingProvider';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import StoryDetail from './pages/StoryDetail';
import About from './pages/About';
import Mission from './pages/Mission';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tools from './pages/Tools';
import Stories from './pages/Stories';
import HowItWorks from './pages/HowItWorks';
import UseCases from './pages/UseCases';
import Faq from './pages/Faq';
import TechPage from './pages/TechPage';
import GetLocPage from './pages/GetLocPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Router>
      <LoadingProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/story/:id" element={<StoryDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/faq" element={<Faq />} />
          
          {/* Tech Pages */}
          <Route path="/mcp-protocol" element={<TechPage title="MCP Protocol" desc="The Model Context Protocol (MCP) is an open standard that enables AI models to connect securely to data sources and tools." />} />
          <Route path="/openstreetmap" element={<TechPage title="OpenStreetMap" desc="The world's largest open-source geospatial database, providing the raw facility nodes for AtlasRoute." />} />
          <Route path="/hl7-fhir" element={<TechPage title="HL7 FHIR" desc="Fast Healthcare Interoperability Resources (FHIR) is a standard for exchanging healthcare information electronically." />} />
          <Route path="/openrouteservice" element={<TechPage title="OpenRouteService" desc="A powerful routing engine used to calculate emergency travel times and precise directions." />} />
          
          {/* Location Pages */}
          <Route path="/getloc/:token" element={<GetLocPage />} />
          
          {/* Catch-all - 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LoadingProvider>
    </Router>
  );
}


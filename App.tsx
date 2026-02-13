import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Survey } from './components/Survey';
import { Dashboard } from './components/Dashboard';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="relative min-h-screen text-gray-100 overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
        
        {/* Animated Background Layers */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#030712]">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-20" 
                 style={{ 
                     backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }}>
            </div>
            
            {/* Ambient Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/30 rounded-full blur-[120px] animate-pulse" style={{animationDuration: '4s'}}></div>
        </div>

        {/* Content Layer */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Survey />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        
        {/* Navigation Helper (Discrete) */}
        <div className="fixed bottom-4 right-4 z-50 flex gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300">
          <Link to="/" className="px-3 py-1 text-[10px] uppercase tracking-widest border border-cyan-900/50 bg-black/50 text-cyan-500 hover:bg-cyan-900/30 rounded backdrop-blur-sm">Survey</Link>
          <Link to="/dashboard" className="px-3 py-1 text-[10px] uppercase tracking-widest border border-purple-900/50 bg-black/50 text-purple-500 hover:bg-purple-900/30 rounded backdrop-blur-sm">Dashboard</Link>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
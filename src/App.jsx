import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VisualProof from './components/VisualProof';
import ProcessScroll from './components/ProcessScroll';
import RequestForm from './components/RequestForm';
import FAB from './components/FAB';

function App() {
  return (
    <div className="bg-render-black min-h-screen text-white selection:bg-electric-blue selection:text-black">
      <Navbar />

      <main>
        {/* Sections will be added here */}
        <Hero />
        <VisualProof />
        <ProcessScroll />
      </main>

      <RequestForm />
      <FAB />
    </div>
  );
}

export default App;

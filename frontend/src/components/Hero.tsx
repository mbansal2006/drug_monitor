import React from 'react';

const Hero = () => {
  return (
    <section className="bg-slate-900 text-white py-16 px-6 border-b border-slate-700">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-400">Drug Monitor</h1>
        <p className="text-lg md:text-xl text-slate-300">
          An interactive dashboard mapping the global pharmaceutical supply chain. Track manufacturing sites,
          monitor risks like foreign dumping and sanctions, and explore essential drug vulnerabilities.
        </p>
        <p className="text-sm text-slate-500">
          Built with open U.S. government data (FDA, DailyMed, State Dept, GSA). Updated regularly.
        </p>
      </div>
    </section>
  );
};

export default Hero;
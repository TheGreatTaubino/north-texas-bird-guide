import React from 'react';
import { SPOTS } from '../data/birds.js';

function PinIcon() {
  return (
    <svg className="w-5 h-5 flex-shrink-0 text-bird-green mt-0.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

export default function SpotsSection() {
  return (
    <section className="max-w-screen-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-semibold text-bird-green uppercase tracking-widest mb-1">Plano / DFW Area</p>
        <h2 className="text-2xl font-serif font-bold text-white">Best Birding Spots</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SPOTS.map((spot, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <PinIcon />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white leading-snug">{spot.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400">{spot.loc}</span>
                  <span className="text-xs bg-bird-blue/40 text-blue-300 px-2 py-0.5 rounded-full border border-blue-800/40">
                    {spot.dist}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{spot.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

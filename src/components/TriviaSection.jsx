import React, { useState } from 'react';
import { TRIVIA } from '../data/birds.js';

function TriviaCard({ item }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div
      className="bg-gray-900 rounded-xl p-4 border border-gray-800 cursor-pointer select-none"
      style={{ borderLeftColor: item.color, borderLeftWidth: 4 }}
      onClick={() => setRevealed(r => !r)}
    >
      <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
      {revealed ? (
        <p className="text-sm text-gray-300 leading-relaxed">{item.a}</p>
      ) : (
        <p className="text-xs text-gray-500 italic">Tap to reveal answer</p>
      )}
    </div>
  );
}

export default function TriviaSection() {
  return (
    <section className="max-w-screen-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-semibold text-bird-amber uppercase tracking-widest mb-1">Bird Knowledge</p>
        <h2 className="text-2xl font-serif font-bold text-white">Field Guide Trivia</h2>
        <p className="text-sm text-gray-400 mt-1">Tap a card to reveal the answer.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TRIVIA.map((item, i) => (
          <TriviaCard key={i} item={item} />
        ))}
      </div>
    </section>
  );
}

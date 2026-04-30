import React, { useState } from 'react';
import { isCurrentlySeen } from '../data/birds.js';

function PlaceholderImage({ name, color }) {
  return (
    <div
      className="w-full flex flex-col items-center justify-center gap-2"
      style={{ height: 240, background: `${color}22` }}
    >
      <svg className="w-16 h-16 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ color }}>
        <path d="M21 6.5l-4-4-1.5 1.5L17 5.5V8h2V5.5l1.5 1.5L22 5.5 21 6.5z" />
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
      </svg>
      <span className="text-xs text-gray-500 text-center px-4">
        Add <code className="bg-gray-800 px-1 rounded">{name}.jpg</code> to{' '}
        <code className="bg-gray-800 px-1 rounded">src/images/</code> and run{' '}
        <code className="bg-gray-800 px-1 rounded">npm run embed-images</code>
      </span>
    </div>
  );
}

export default function BirdCard({ bird, imageDataUrl, quickIdMode, seenToday, onToggleSeenToday }) {
  const [expanded, setExpanded] = useState(false);
  const currentlySeen = isCurrentlySeen(bird.season);
  const showFull = !quickIdMode || expanded;

  return (
    <div
      id={bird.id}
      className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 flex flex-col"
      style={{ borderLeftColor: bird.color, borderLeftWidth: 4 }}
    >
      {/* Photo */}
      <div className="relative">
        {imageDataUrl ? (
          <img
            src={imageDataUrl}
            alt={bird.name}
            className="w-full object-cover"
            style={{ height: 240 }}
            loading="lazy"
          />
        ) : (
          <PlaceholderImage name={bird.imageKey} color={bird.color} />
        )}

        {/* Frequent Flier badge */}
        {bird.frequentFlier && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-amber-900/90 text-amber-300 text-xs font-semibold px-2 py-1 rounded-full">
            ✈ Frequent Flier
          </div>
        )}

        {/* Currently present badge */}
        {currentlySeen && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-green-900/90 text-green-300 text-xs font-semibold px-2 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Here Now
          </div>
        )}

        {/* Type + season overlay */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-1.5 text-xs font-semibold text-white"
          style={{ background: `linear-gradient(transparent, ${bird.color}dd)` }}
        >
          {bird.subtype || bird.type} · {bird.season}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-serif font-bold text-white leading-tight">{bird.name}</h2>
            <p className="text-xs italic text-gray-400 mt-0.5">{bird.latin}</p>
          </div>
          <button
            type="button"
            onClick={onToggleSeenToday}
            aria-pressed={seenToday}
            aria-label={seenToday ? `Remove today's ${bird.name} sighting` : `Mark ${bird.name} seen today`}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
              seenToday
                ? 'bg-bird-green border-bird-green text-white'
                : 'border-gray-700 text-gray-400 hover:border-bird-green hover:text-gray-200'
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                seenToday ? 'border-white bg-white text-bird-green' : 'border-gray-500'
              }`}
            >
              {seenToday ? '✓' : ''}
            </span>
            <span>{seenToday ? 'Seen today' : 'Seen today!'}</span>
          </button>
        </div>

        {/* Measurements */}
        {(bird.size || bird.weight || bird.wingspan) && (
          <div className="flex gap-3 text-xs text-gray-400">
            {bird.size     && <span>📏 {bird.size}</span>}
            {bird.weight   && <span>⚖ {bird.weight}</span>}
            {bird.wingspan && <span>✈ {bird.wingspan}</span>}
          </div>
        )}

        {/* Field Marks */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Field Marks</p>
          <ul className="space-y-1">
            {(quickIdMode && !expanded ? bird.id_marks.slice(0, 2) : bird.id_marks).map((mark, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-200">
                <span className="text-yellow-500 flex-shrink-0 mt-0.5">▸</span>
                <span>{mark}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick ID expand button */}
        {quickIdMode && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-xs text-bird-green border border-bird-green rounded-lg px-3 py-1.5 hover:bg-bird-green/10 transition-colors self-start"
          >
            Show full details ↓
          </button>
        )}

        {showFull && (
          <>
            {/* In Flight */}
            <div className="bg-blue-950/60 border border-blue-900/50 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1">✈ In Flight</p>
              <p className="text-sm text-blue-100">{bird.flight_id}</p>
            </div>

            {/* North Texas */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">North Texas</p>
              <p className="text-sm text-gray-300">{bird.northTexas}</p>
            </div>

            {/* Fun Fact */}
            <div className="bg-amber-950/50 border border-amber-800/40 rounded-lg p-3">
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-1">★ Fun Fact</p>
              <p className="text-sm text-amber-100">{bird.funFact}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bird.badges.map((b, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{
                    backgroundColor: `${bird.color}33`,
                    color: bird.color === '#424949' || bird.color === '#273746' || bird.color === '#212f3d' ? '#adb5bd' : bird.color,
                    border: `1px solid ${bird.color}55`,
                  }}
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Collapse in quick ID mode */}
            {quickIdMode && expanded && (
              <button
                onClick={() => setExpanded(false)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors self-start"
              >
                Collapse ↑
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

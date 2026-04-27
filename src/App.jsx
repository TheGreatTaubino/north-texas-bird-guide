import React, { useState, useMemo } from 'react';
import { BIRDS } from './data/birds.js';
import { images } from './imageData.js';
import FilterBar from './components/FilterBar.jsx';
import BirdCard from './components/BirdCard.jsx';
import TriviaSection from './components/TriviaSection.jsx';
import SpotsSection from './components/SpotsSection.jsx';

const RAPTOR_TYPES = new Set(['Raptor', 'Owl']);
const GROUP_ORDER = ['Songbird', 'Raptor', 'Owl', 'Waterbird', 'Shorebird', 'Woodpecker', 'Other', 'Duck', 'Goose', 'Gull'];

const GROUP_LABELS = {
  Songbird:  { num: '01', title: 'Songbirds & Perching Birds', subtitle: 'Passerines, swallows, flycatchers, and more' },
  Raptor:    { num: '02', title: 'Raptors', subtitle: 'Hawks, falcons, eagles, and ospreys' },
  Owl:       { num: '03', title: 'Owls', subtitle: 'Nocturnal raptors of North Texas woodlands' },
  Waterbird: { num: '04', title: 'Waterbirds & Waders', subtitle: 'Herons, egrets, cormorants, pelicans, grebes, and coots' },
  Shorebird: { num: '05', title: 'Shorebirds', subtitle: 'Plovers, sandpipers, stilts, and avocets' },
  Woodpecker:{ num: '06', title: 'Woodpeckers', subtitle: 'Cavity-nesters that drill into bark for food' },
  Other:     { num: '07', title: 'Other Birds', subtitle: 'Hummingbirds, kingfishers, nighthawks, doves, and swifts' },
  Duck:      { num: '08', title: 'Ducks', subtitle: 'Dabbling, diving, whistling, and tree ducks of North Texas' },
  Goose:     { num: '09', title: 'Geese', subtitle: 'Canada, White-fronted, and Snow Geese through the Central Flyway' },
  Gull:      { num: '10', title: 'Gulls', subtitle: 'Year-round and migratory gulls — including your parking lot bird' },
};

function matchesFilter(bird, filter) {
  if (filter === 'all') return true;
  if (filter === 'songbird') return bird.type === 'Songbird';
  if (filter === 'raptor') return RAPTOR_TYPES.has(bird.type);
  if (filter === 'waterbird') return bird.type === 'Waterbird';
  if (filter === 'shorebird') return bird.type === 'Shorebird';
  if (filter === 'woodpecker') return bird.type === 'Woodpecker';
  if (filter === 'waterfowl') return bird.type === 'Duck' || bird.type === 'Goose';
  if (filter === 'gulls') return bird.type === 'Gull';
  if (filter === 'year-round') return bird.season.toLowerCase().includes('year-round');
  if (filter === 'summer') {
    const s = bird.season;
    return (
      s.includes('April') || s.includes('March') || s.includes('May') || s.includes('Aug')
    ) && !s.includes('Year-Round') && !s.includes('Nov') && !s.includes('Oct') && !s.includes('Sept');
  }
  if (filter === 'winter') {
    const s = bird.season;
    return s.includes('Nov') || s.includes('Oct') || s.includes('Sept') || s.includes('Aug–May') || s.includes('Year-Round');
  }
  return true;
}

function SectionHeader({ num, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
      <div className="text-xs font-mono font-bold text-gray-600 tracking-widest uppercase">{num}</div>
      <div className="flex-1">
        <h2 className="text-lg font-serif font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="h-px flex-1 bg-gray-800" />
    </div>
  );
}

function FlyWayBanner() {
  return (
    <div className="bg-bird-navy border-y border-blue-900/40 py-6 px-4 mb-6">
      <div className="max-w-5xl mx-auto flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">🐦</div>
        <div>
          <h3 className="text-sm font-bold text-blue-300 uppercase tracking-wide mb-1">Central Flyway — North Texas</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Texas sits at the heart of the <strong className="text-white">Central Flyway</strong>, one of North America's four major
            migration corridors. Millions of birds funnel through the Plano / DFW area each spring and fall, and the
            region's mix of <strong className="text-white">suburban ponds, Blackland Prairie, bottomland forests, and major
            reservoirs</strong> supports an extraordinary diversity of resident and migratory species year-round.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickIdMode, setQuickIdMode] = useState(false);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return BIRDS.filter(bird => {
      if (!matchesFilter(bird, activeFilter)) return false;
      if (q && !bird.name.toLowerCase().includes(q) && !bird.latin.toLowerCase().includes(q) && !bird.type.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [activeFilter, searchQuery]);

  // Group by type in defined order
  const groups = useMemo(() => {
    return GROUP_ORDER
      .map(type => ({ type, birds: filtered.filter(b => b.type === type) }))
      .filter(g => g.birds.length > 0);
  }, [filtered]);

  const showSectionHeaders = ['all', 'year-round', 'winter', 'summer'].includes(activeFilter) && !searchQuery;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-bird-navy border-b border-gray-800 px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-serif font-bold text-white">North Texas Bird Field Guide</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Plano · DFW · Collin County · {BIRDS.length} species</p>
        </div>
      </header>

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        quickIdMode={quickIdMode}
        onQuickIdToggle={() => setQuickIdMode(m => !m)}
      />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <FlyWayBanner />

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">No species match your search.</p>
          </div>
        )}

        {groups.map((group, gi) => (
          <div key={group.type} className={gi > 0 ? 'mt-10' : ''}>
            {showSectionHeaders && GROUP_LABELS[group.type] && (
              <SectionHeader
                num={GROUP_LABELS[group.type].num}
                title={GROUP_LABELS[group.type].title}
                subtitle={GROUP_LABELS[group.type].subtitle}
              />
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.birds.map(bird => (
                <BirdCard
                  key={bird.id}
                  bird={bird}
                  imageDataUrl={images[bird.imageKey]}
                  quickIdMode={quickIdMode}
                />
              ))}
            </div>
          </div>
        ))}
      </main>

      <div className="border-t border-gray-800">
        <TriviaSection />
      </div>

      <div className="border-t border-gray-800">
        <SpotsSection />
      </div>

      <footer className="border-t border-gray-800 bg-bird-navy">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-400 font-serif italic mb-1">North Texas Bird Field Guide</p>
          <p className="text-xs text-gray-600">
            Photos: Wikimedia Commons (CC-licensed) · Data: eBird / Cornell Lab of Ornithology ·
            Built for offline use on Android
          </p>
        </div>
      </footer>
    </div>
  );
}

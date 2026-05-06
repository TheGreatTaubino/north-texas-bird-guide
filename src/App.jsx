import React, { useState, useMemo, useEffect } from 'react';
import { BIRDS } from './data/birds.js';
import { images } from './imageData.js';
import FilterBar from './components/FilterBar.jsx';
import BirdCard from './components/BirdCard.jsx';
import SightingCalendar from './components/SightingCalendar.jsx';
import TriviaSection from './components/TriviaSection.jsx';
import SpotsSection from './components/SpotsSection.jsx';
import { getLocalDateKey } from './utils/dates.js';
import { matchesFilter } from './utils/filter.js';
import { mergeSightings } from './utils/sightings.js';

const SIGHTINGS_STORAGE_KEY = 'northTexasBirdGuide.sightings.v1';
const VALID_BIRD_IDS = new Set(BIRDS.map(b => b.id));
const GROUP_ORDER = ['Songbirds', 'Birds of Prey', 'Waterbird', 'Shorebird', 'Duck', 'Goose', 'Gull', 'Other'];

const GROUP_LABELS = {
  'Songbirds':     { num: '01', title: 'Songbirds', subtitle: 'Passerines, swallows, flycatchers, and more' },
  'Birds of Prey': { num: '02', title: 'Birds of Prey', subtitle: 'Hawks, falcons, eagles, ospreys, and owls' },
  'Waterbird':     { num: '03', title: 'Waterbirds & Waders', subtitle: 'Herons, egrets, cormorants, pelicans, grebes, and coots' },
  'Shorebird':     { num: '04', title: 'Shorebirds', subtitle: 'Plovers, sandpipers, stilts, and avocets' },
  'Duck':          { num: '05', title: 'Ducks', subtitle: 'Dabbling, diving, whistling, and tree ducks of North Texas' },
  'Goose':         { num: '06', title: 'Geese', subtitle: 'Canada, White-fronted, and Snow Geese through the Central Flyway' },
  'Gull':          { num: '07', title: 'Gulls', subtitle: 'Year-round and migratory gulls of North Texas' },
  'Other':         { num: '08', title: 'Other Birds', subtitle: 'Woodpeckers, hummingbirds, doves, pigeons, kingfishers, and swifts' },
};

function loadStoredSightings() {
  try {
    const raw = window.localStorage.getItem(SIGHTINGS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([dateKey, birdIds]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && Array.isArray(birdIds))
        .map(([dateKey, birdIds]) => [
          dateKey,
          [...new Set(birdIds.filter(id => typeof id === 'string' && VALID_BIRD_IDS.has(id)))],
        ])
        .filter(([, birdIds]) => birdIds.length > 0)
    );
  } catch {
    return {};
  }
}

function SectionHeader({ num, title, subtitle, collapsed, onToggle, birdCount }) {
  return (
    <div className="flex items-center gap-4 mb-6 mt-10 first:mt-0">
      <div className="text-xs font-mono font-bold text-gray-600 tracking-widest uppercase">{num}</div>
      <div className="flex-1">
        <h2 className="text-lg font-serif font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="h-px flex-1 bg-gray-800" />
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-200 transition-colors px-2 py-1 rounded"
        aria-label={collapsed ? 'Expand section' : 'Collapse section'}
      >
        <span>{birdCount}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-150 ${collapsed ? '-rotate-90' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
}


export default function App() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickIdMode, setQuickIdMode] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [sightingsCollapsed, setSightingsCollapsed] = useState(false);
  const [sightings, setSightings] = useState(loadStoredSightings);
  const todayKey = getLocalDateKey();

  useEffect(() => {
    try {
      window.localStorage.setItem(SIGHTINGS_STORAGE_KEY, JSON.stringify(sightings));
    } catch {
      // Sighting history remains available in memory if browser storage is unavailable.
    }
  }, [sightings]);

  const toggleGroup = (type) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      next.has(type) ? next.delete(type) : next.add(type);
      return next;
    });
  };

  const importSightings = (incoming) => {
    setSightings(prev => mergeSightings(prev, incoming, VALID_BIRD_IDS));
  };

  const toggleSeenToday = (birdId) => {
    setSightings(prev => {
      const todaysSightings = new Set(prev[todayKey] || []);
      if (todaysSightings.has(birdId)) {
        todaysSightings.delete(birdId);
      } else {
        todaysSightings.add(birdId);
      }

      const next = { ...prev };
      if (todaysSightings.size > 0) {
        next[todayKey] = [...todaysSightings];
      } else {
        delete next[todayKey];
      }
      return next;
    });
  };

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

  const showSectionHeaders = !searchQuery;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-bird-navy border-b border-gray-800 px-4 py-5">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-serif font-bold text-white">North Texas Bird Field Guide</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Plano · DFW · Collin County · {BIRDS.length} species</p>
        </div>
      </header>

      <div className="border-b border-gray-800">
        <SightingCalendar
          birds={BIRDS}
          sightings={sightings}
          todayKey={todayKey}
          onImportSightings={importSightings}
          collapsed={sightingsCollapsed}
          onToggle={() => setSightingsCollapsed(c => !c)}
        />
      </div>

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        quickIdMode={quickIdMode}
        onQuickIdToggle={() => setQuickIdMode(m => !m)}
      />

      <main className="max-w-screen-2xl mx-auto px-4 py-6">
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
                collapsed={collapsedGroups.has(group.type)}
                onToggle={() => toggleGroup(group.type)}
                birdCount={group.birds.length}
              />
            )}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 ${collapsedGroups.has(group.type) ? 'hidden' : ''}`}>
              {group.birds.map(bird => (
                <BirdCard
                  key={bird.id}
                  bird={bird}
                  imageDataUrl={images[bird.imageKey]}
                  quickIdMode={quickIdMode}
                  seenToday={(sightings[todayKey] || []).includes(bird.id)}
                  onToggleSeenToday={() => toggleSeenToday(bird.id)}
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
        <div className="max-w-screen-2xl mx-auto px-4 py-6 text-center">
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

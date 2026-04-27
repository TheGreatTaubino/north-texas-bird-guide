import React from 'react';

const FILTERS = [
  { id: 'all', label: 'All Species' },
  { id: 'songbird', label: 'Songbirds' },
  { id: 'raptor', label: 'Raptors & Owls' },
  { id: 'waterbird', label: 'Waterbirds' },
  { id: 'shorebird', label: 'Shorebirds' },
  { id: 'woodpecker', label: 'Woodpeckers' },
  { id: 'year-round', label: 'Year-Round' },
  { id: 'summer', label: 'Summer' },
  { id: 'winter', label: 'Winter' },
];

export default function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange, quickIdMode, onQuickIdToggle }) {
  return (
    <div className="sticky top-0 z-50 bg-bird-navy border-b border-gray-800 shadow-lg">
      <div className="max-w-5xl mx-auto px-3 py-2">
        {/* Search row */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Search species..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg pl-9 pr-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-bird-green"
            />
          </div>
          <button
            onClick={onQuickIdToggle}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${
              quickIdMode
                ? 'bg-bird-green border-bird-green text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {quickIdMode ? '⚡ Quick ID ON' : '⚡ Quick ID'}
          </button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-bird-green border-bird-green text-white font-semibold'
                  : 'border-gray-600 text-gray-400 hover:border-gray-300 hover:text-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

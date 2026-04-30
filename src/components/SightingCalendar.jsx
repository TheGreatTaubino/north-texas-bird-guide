import React, { useMemo, useRef, useState } from 'react';
import { useGitHubSync } from '../hooks/useGitHubSync.js';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const DAY_FORMATTER = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const SHORT_DT_FORMATTER = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

const LAST_EXPORT_STORAGE_KEY = 'northTexasBirdGuide.lastExport.v1';
const STALE_DAYS = 14;

function loadLastExported() {
  try {
    const raw = window.localStorage.getItem(LAST_EXPORT_STORAGE_KEY);
    if (!raw) return null;
    const ts = parseInt(raw, 10);
    return isNaN(ts) ? null : new Date(ts);
  } catch {
    return null;
  }
}

function saveLastExported() {
  try {
    window.localStorage.setItem(LAST_EXPORT_STORAGE_KEY, Date.now().toString());
  } catch {}
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function buildMonthDays(monthDate, sightings) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const cells = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) cells.push(null);

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getLocalDateKey(date);
    cells.push({ day, dateKey, count: (sightings[dateKey] || []).length });
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function SyncStatusBadge({ status, syncError, lastSyncedAt, onSyncNow }) {
  if (status === 'syncing') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-blue-400">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
        Syncing…
      </span>
    );
  }
  if (status === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-400">
        ✕ {syncError}
        <button onClick={onSyncNow} className="underline hover:text-red-200 transition-colors">Retry</button>
      </span>
    );
  }
  if (status === 'synced' && lastSyncedAt) {
    return (
      <span className="text-xs text-bird-green">
        ✓ Synced {SHORT_DT_FORMATTER.format(lastSyncedAt)}
      </span>
    );
  }
  return null;
}

function SyncPanel({ sightings, onMerge }) {
  const { isConfigured, gistId, lastSyncedAt, status, syncError, connect, disconnect, syncNow } =
    useGitHubSync(sightings, onMerge);

  const [showSetup, setShowSetup] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [gistInput, setGistInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const handleConnect = async () => {
    if (!tokenInput.trim()) return;
    setConnecting(true);
    const ok = await connect(tokenInput.trim(), gistInput.trim());
    setConnecting(false);
    if (ok) {
      setShowSetup(false);
      setTokenInput('');
      setGistInput('');
    }
  };

  if (isConfigured) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 flex-wrap">
          <SyncStatusBadge status={status} syncError={syncError} lastSyncedAt={lastSyncedAt} onSyncNow={syncNow} />
          <button
            onClick={syncNow}
            className="text-xs border border-gray-700 rounded-lg px-2.5 py-1 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
          >
            Sync now
          </button>
          <button
            onClick={disconnect}
            className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Disconnect
          </button>
        </div>
        <p className="text-xs text-gray-600">
          Gist:{' '}
          <a
            href={`https://gist.github.com/${gistId}`}
            target="_blank"
            rel="noreferrer"
            className="font-mono hover:text-gray-400 transition-colors"
          >
            {gistId.slice(0, 10)}…
          </a>
        </p>
      </div>
    );
  }

  return (
    <div>
      {!showSetup ? (
        <button
          onClick={() => setShowSetup(true)}
          className="text-xs border border-gray-700 rounded-lg px-2.5 py-1 text-gray-400 hover:border-bird-green hover:text-gray-200 transition-colors"
        >
          ⟳ Connect GitHub Sync
        </button>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 max-w-sm">
          <div>
            <p className="text-sm font-semibold text-white mb-0.5">Connect GitHub Sync</p>
            <p className="text-xs text-gray-400">
              Sightings sync automatically to a private GitHub Gist — survives app updates and works across devices.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              GitHub Personal Access Token
            </label>
            <input
              type="password"
              placeholder="github_pat_…"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="bg-gray-800 text-gray-100 placeholder-gray-600 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-bird-green font-mono"
            />
            <p className="text-xs text-gray-600">
              Needs <code className="bg-gray-800 px-1 rounded">gist</code> scope only.{' '}
              Create one at github.com → Settings → Developer settings → Personal access tokens.
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Gist ID <span className="font-normal normal-case text-gray-600">(leave blank to create new)</span>
            </label>
            <input
              type="text"
              placeholder="a1b2c3d4e5f6… or leave blank"
              value={gistInput}
              onChange={e => setGistInput(e.target.value)}
              className="bg-gray-800 text-gray-100 placeholder-gray-600 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:outline-none focus:border-bird-green font-mono"
            />
          </div>

          {syncError && (
            <p className="text-xs text-red-400">✕ {syncError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleConnect}
              disabled={!tokenInput.trim() || connecting}
              className="text-xs bg-bird-green border border-bird-green text-white rounded-lg px-3 py-1.5 font-semibold disabled:opacity-40 hover:bg-bird-green/80 transition-colors"
            >
              {connecting ? 'Connecting…' : gistInput.trim() ? 'Connect' : 'Create & Connect'}
            </button>
            <button
              onClick={() => { setShowSetup(false); setTokenInput(''); setGistInput(''); }}
              className="text-xs border border-gray-700 rounded-lg px-3 py-1.5 text-gray-400 hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-xs text-gray-600">
            Token stored locally on this device only.
          </p>
        </div>
      )}
    </div>
  );
}

export default function SightingCalendar({ birds, sightings, todayKey, onImportSightings }) {
  const [monthDate, setMonthDate] = useState(() => dateFromKey(todayKey));
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [importStatus, setImportStatus] = useState(null);
  const [lastExportedAt, setLastExportedAt] = useState(loadLastExported);
  const fileInputRef = useRef(null);

  const birdsById = useMemo(() => new Map(birds.map(bird => [bird.id, bird])), [birds]);
  const monthDays = useMemo(() => buildMonthDays(monthDate, sightings), [monthDate, sightings]);
  const selectedBirds = useMemo(() => {
    return (sightings[selectedDateKey] || [])
      .map(id => birdsById.get(id))
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [birdsById, selectedDateKey, sightings]);

  const monthTotal = monthDays.reduce((total, cell) => total + (cell?.count || 0), 0);
  const totalDaysWithSightings = Object.keys(sightings).length;
  const selectedDate = dateFromKey(selectedDateKey);

  const daysSinceExport = lastExportedAt
    ? Math.floor((Date.now() - lastExportedAt.getTime()) / 86_400_000)
    : null;
  const backupIsStale = totalDaysWithSightings > 0 && (lastExportedAt === null || daysSinceExport > STALE_DAYS);

  const moveMonth = (offset) => {
    setMonthDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const markExported = () => {
    saveLastExported();
    setLastExportedAt(new Date());
  };

  const handleExport = async () => {
    const json = JSON.stringify(sightings, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const filename = `bird-sightings-${todayKey}.json`;

    if (navigator.share) {
      const file = new File([blob], filename, { type: 'application/json' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ title: 'Bird Sightings Backup', files: [file] });
          markExported();
          return;
        } catch (err) {
          if (err.name === 'AbortError') return;
        }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    markExported();
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
        onImportSightings(data);
        setImportStatus('ok');
      } catch {
        setImportStatus('error');
      }
      setTimeout(() => setImportStatus(null), 3000);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleClipboardImport = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
      onImportSightings(data);
      setImportStatus('ok');
    } catch {
      setImportStatus('error');
    }
    setTimeout(() => setImportStatus(null), 3000);
  };

  const goToToday = () => {
    setMonthDate(dateFromKey(todayKey));
    setSelectedDateKey(todayKey);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold text-bird-green uppercase tracking-widest mb-1">Sightings</p>
            <h2 className="text-2xl font-serif font-bold text-white">Calendar Tracker</h2>
            <p className="text-sm text-gray-400 mt-1">
              Mark birds as seen today, then review your local sighting history by date.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileImport}
              />
              <button
                type="button"
                onClick={handleExport}
                className={`text-xs rounded-lg px-2.5 py-1 transition-colors border ${
                  backupIsStale
                    ? 'border-amber-600 text-amber-400 hover:border-amber-400 hover:text-amber-200'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                {backupIsStale ? '⚠ Back Up Now' : 'Back Up ↓'}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs border border-gray-700 rounded-lg px-2.5 py-1 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
              >
                Restore ↑
              </button>
              {navigator.clipboard?.readText && (
                <button
                  type="button"
                  onClick={handleClipboardImport}
                  className="text-xs border border-gray-700 rounded-lg px-2.5 py-1 text-gray-400 hover:border-gray-500 hover:text-gray-200 transition-colors"
                >
                  Paste ↑
                </button>
              )}
              {importStatus && (
                <span className={`text-xs ${importStatus === 'ok' ? 'text-bird-green' : 'text-red-400'}`}>
                  {importStatus === 'ok' ? 'Imported!' : 'Invalid file'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {lastExportedAt && (
                <span className={daysSinceExport > STALE_DAYS ? 'text-amber-500' : 'text-gray-500'}>
                  Last backup: {SHORT_DT_FORMATTER.format(lastExportedAt)}
                </span>
              )}
              {totalDaysWithSightings > 0 && !lastExportedAt && (
                <span className="text-amber-500">Not backed up</span>
              )}
              <span className="text-gray-300">
                <span className="font-semibold text-white">{monthTotal}</span> sightings this month
              </span>
            </div>
          </div>
        </div>

        {/* GitHub Sync */}
        <div className="border-t border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Auto Sync</p>
          <SyncPanel sightings={sightings} onMerge={onImportSightings} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => moveMonth(-1)}
              className="h-9 w-9 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              aria-label="Previous month"
            >
              ‹
            </button>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-serif font-bold text-white text-center">
                {MONTH_FORMATTER.format(monthDate)}
              </h3>
              <button
                type="button"
                onClick={goToToday}
                className="text-xs rounded-lg border border-gray-700 px-2.5 py-1 text-gray-400 hover:border-bird-green hover:text-gray-200 transition-colors"
              >
                Today
              </button>
            </div>
            <button
              type="button"
              onClick={() => moveMonth(1)}
              className="h-9 w-9 rounded-lg border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors"
              aria-label="Next month"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(day => (
              <div key={day} className="text-center text-[11px] font-semibold uppercase tracking-wide text-gray-500 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((cell, index) => {
              if (!cell) {
                return <div key={`empty-${index}`} className="aspect-square rounded-lg bg-gray-950/40" />;
              }

              const selected = cell.dateKey === selectedDateKey;
              const isToday = cell.dateKey === todayKey;
              const hasSightings = cell.count > 0;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`aspect-square rounded-lg border p-1.5 text-left transition-colors ${
                    selected
                      ? 'border-bird-green bg-bird-green/20'
                      : hasSightings
                        ? 'border-green-900/70 bg-green-950/40 hover:border-bird-green'
                        : 'border-gray-800 bg-gray-950 hover:border-gray-600'
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? 'text-bird-amber' : 'text-gray-300'}`}>
                    {cell.day}
                  </span>
                  {hasSightings && (
                    <span className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-bird-green text-xs font-bold text-white">
                      {cell.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Selected Day</p>
          <h3 className="text-lg font-serif font-bold text-white">
            {DAY_FORMATTER.format(selectedDate)}
          </h3>
          <p className="text-sm text-gray-400 mt-1 mb-4">
            {selectedBirds.length === 1 ? '1 species logged' : `${selectedBirds.length} species logged`}
          </p>

          {selectedBirds.length > 0 ? (
            <div className="space-y-2">
              {selectedBirds.map(bird => (
                <a key={bird.id} href={`#${bird.id}`} className="flex items-center justify-between gap-3 rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 hover:border-gray-600 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{bird.name}</p>
                    <p className="text-xs text-gray-500 italic truncate">{bird.latin}</p>
                  </div>
                  <span
                    className="text-[11px] rounded-full px-2 py-0.5 border flex-shrink-0"
                    style={{
                      backgroundColor: `${bird.color}22`,
                      borderColor: `${bird.color}55`,
                      color: bird.color,
                    }}
                  >
                    {bird.type}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-700 bg-gray-950/60 px-3 py-6 text-center">
              <p className="text-sm text-gray-400">No sightings logged for this date.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

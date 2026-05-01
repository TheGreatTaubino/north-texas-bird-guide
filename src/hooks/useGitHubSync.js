import { useState, useEffect, useRef } from 'react';

const SYNC_CONFIG_KEY = 'northTexasBirdGuide.syncConfig.v1';
const GIST_FILENAME = 'north-texas-bird-sightings.json';
const PUSH_DEBOUNCE_MS = 4000;

function loadConfig() {
  try {
    const raw = sessionStorage.getItem(SYNC_CONFIG_KEY);
    return raw ? JSON.parse(raw) : { token: '', gistId: '', lastSyncedAt: null };
  } catch {
    return { token: '', gistId: '', lastSyncedAt: null };
  }
}

function persistConfig(config) {
  try {
    sessionStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
  } catch {}
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export function useGitHubSync(sightings, onMerge) {
  const [config, setConfig] = useState(loadConfig);
  const [status, setStatus] = useState('idle'); // idle | syncing | synced | error
  const [syncError, setSyncError] = useState(null);

  const pushTimerRef = useRef(null);
  const skipNextPushRef = useRef(false); // set true after a pull to avoid push-back loop
  const lastPushedRef = useRef(null);    // serialized sightings last successfully pushed

  const pull = async (token, gistId) => {
    setStatus('syncing');
    setSyncError(null);
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: githubHeaders(token),
      });
      if (res.status === 401) throw new Error('Invalid token (401)');
      if (res.status === 404) throw new Error('Gist not found (404)');
      if (!res.ok) throw new Error(`GitHub error (${res.status})`);

      const data = await res.json();
      const content = data.files?.[GIST_FILENAME]?.content;
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          skipNextPushRef.current = true;
          onMerge(parsed);
        }
      }

      const now = Date.now();
      setConfig(prev => {
        const updated = { ...prev, lastSyncedAt: now };
        persistConfig(updated);
        return updated;
      });
      setStatus('synced');
    } catch (err) {
      setSyncError(err.message);
      setStatus('error');
    }
  };

  const push = async (token, gistId, data) => {
    const serialized = JSON.stringify(data, null, 2);
    if (serialized === lastPushedRef.current) return; // nothing changed
    setStatus('syncing');
    setSyncError(null);
    try {
      const res = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: { ...githubHeaders(token), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: { [GIST_FILENAME]: { content: serialized } },
        }),
      });
      if (res.status === 401) throw new Error('Invalid token (401)');
      if (!res.ok) throw new Error(`GitHub error (${res.status})`);

      lastPushedRef.current = serialized;
      const now = Date.now();
      setConfig(prev => {
        const updated = { ...prev, lastSyncedAt: now };
        persistConfig(updated);
        return updated;
      });
      setStatus('synced');
    } catch (err) {
      setSyncError(err.message);
      setStatus('error');
    }
  };

  // Pull on mount if already configured
  useEffect(() => {
    const cfg = loadConfig();
    if (cfg.token && cfg.gistId) {
      pull(cfg.token, cfg.gistId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced push whenever sightings change
  useEffect(() => {
    if (!config.token || !config.gistId) return;

    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }

    clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(() => {
      push(config.token, config.gistId, sightings);
    }, PUSH_DEBOUNCE_MS);

    return () => clearTimeout(pushTimerRef.current);
  }, [sightings]); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = async (token, existingGistId) => {
    let gistId = existingGistId.trim();

    if (!gistId) {
      // Create a new private Gist
      setStatus('syncing');
      setSyncError(null);
      try {
        const res = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: { ...githubHeaders(token), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'North Texas Bird Guide — Sightings',
            public: false,
            files: { [GIST_FILENAME]: { content: '{}' } },
          }),
        });
        if (res.status === 401) throw new Error('Invalid token (401)');
        if (!res.ok) throw new Error(`GitHub error (${res.status})`);
        const data = await res.json();
        gistId = data.id;
      } catch (err) {
        setSyncError(err.message);
        setStatus('error');
        return false;
      }
    }

    const updated = { token, gistId, lastSyncedAt: null };
    persistConfig(updated);
    setConfig(updated);
    await pull(token, gistId);
    return true;
  };

  const disconnect = () => {
    clearTimeout(pushTimerRef.current);
    const cleared = { token: '', gistId: '', lastSyncedAt: null };
    persistConfig(cleared);
    setConfig(cleared);
    setStatus('idle');
    setSyncError(null);
    lastPushedRef.current = null;
  };

  const syncNow = () => {
    if (!config.token || !config.gistId) return;
    pull(config.token, config.gistId);
  };

  return {
    isConfigured: !!(config.token && config.gistId),
    gistId: config.gistId,
    lastSyncedAt: config.lastSyncedAt ? new Date(config.lastSyncedAt) : null,
    status,
    syncError,
    connect,
    disconnect,
    syncNow,
  };
}

import { useState, useEffect, useRef } from 'react';
import {
  clearSyncToken,
  credentialStorageLabel,
  loadSyncConfig,
  persistSyncConfig,
  usesNativeCredentialStorage,
} from '../utils/syncCredentials.js';

const GIST_FILENAME = 'north-texas-bird-sightings.json';
const PUSH_DEBOUNCE_MS = 4000;

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

export function useGitHubSync(sightings, onMerge) {
  const [config, setConfig] = useState({ token: '', gistId: '', lastSyncedAt: null });
  const [configLoaded, setConfigLoaded] = useState(false);
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
        persistSyncConfig(updated);
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
        persistSyncConfig(updated);
        return updated;
      });
      setStatus('synced');
    } catch (err) {
      setSyncError(err.message);
      setStatus('error');
    }
  };

  // Pull on mount if already configured. Native builds load the token from
  // secure storage; web builds keep the existing session-only token behavior.
  useEffect(() => {
    let cancelled = false;
    loadSyncConfig().then(cfg => {
      if (cancelled) return;
      setConfig(cfg);
      setConfigLoaded(true);
      if (cfg.token && cfg.gistId) {
        pull(cfg.token, cfg.gistId);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced push whenever sightings change
  useEffect(() => {
    if (!configLoaded) return;
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
  }, [sightings, configLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

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
    await persistSyncConfig(updated);
    setConfig(updated);
    await pull(token, gistId);
    return true;
  };

  const disconnect = async () => {
    clearTimeout(pushTimerRef.current);
    await clearSyncToken();
    const cleared = { token: '', gistId: config.gistId, lastSyncedAt: null };
    await persistSyncConfig(cleared);
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
    configLoaded,
    isConfigured: !!(config.token && config.gistId),
    isNativeCredentialStorage: usesNativeCredentialStorage(),
    credentialStorageLabel: credentialStorageLabel(),
    gistId: config.gistId,
    lastSyncedAt: config.lastSyncedAt ? new Date(config.lastSyncedAt) : null,
    status,
    syncError,
    connect,
    disconnect,
    syncNow,
  };
}

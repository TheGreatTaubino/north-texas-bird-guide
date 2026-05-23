import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const SYNC_CONFIG_KEY = 'northTexasBirdGuide.syncConfig.v1';
const GIST_ID_KEY = 'northTexasBirdGuide.gistId.v1';
const LAST_SYNCED_KEY = 'northTexasBirdGuide.lastSyncedAt.v1';
const TOKEN_KEY = 'northTexasBirdGuide.githubToken.v1';

function canUseBrowserStorage(storage) {
  try {
    const testKey = 'northTexasBirdGuide.storageTest';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function usesNativeCredentialStorage() {
  return Capacitor.isNativePlatform();
}

export function credentialStorageLabel() {
  return usesNativeCredentialStorage()
    ? 'Token stored securely on this device.'
    : 'Token stored for this browser session only.';
}

async function getNativeToken() {
  try {
    const result = await SecureStoragePlugin.get({ key: TOKEN_KEY });
    return result.value || '';
  } catch {
    return '';
  }
}

async function setNativeToken(token) {
  if (!token) {
    try {
      await SecureStoragePlugin.remove({ key: TOKEN_KEY });
    } catch {}
    return;
  }
  await SecureStoragePlugin.set({ key: TOKEN_KEY, value: token });
}

export async function loadSyncConfig() {
  const localStorageAvailable = canUseBrowserStorage(window.localStorage);
  const sessionStorageAvailable = canUseBrowserStorage(window.sessionStorage);
  const gistId = localStorageAvailable ? window.localStorage.getItem(GIST_ID_KEY) || '' : '';

  if (usesNativeCredentialStorage()) {
    return {
      token: await getNativeToken(),
      gistId,
      lastSyncedAt: localStorageAvailable ? window.localStorage.getItem(LAST_SYNCED_KEY) || null : null,
    };
  }

  if (!sessionStorageAvailable) return { token: '', gistId, lastSyncedAt: null };

  try {
    const session = JSON.parse(window.sessionStorage.getItem(SYNC_CONFIG_KEY) || '{}');
    return { token: session.token || '', gistId, lastSyncedAt: session.lastSyncedAt || null };
  } catch {
    return { token: '', gistId, lastSyncedAt: null };
  }
}

export async function persistSyncConfig(config) {
  const localStorageAvailable = canUseBrowserStorage(window.localStorage);

  if (localStorageAvailable) {
    if (config.gistId) window.localStorage.setItem(GIST_ID_KEY, config.gistId);
    if (config.lastSyncedAt) {
      window.localStorage.setItem(LAST_SYNCED_KEY, String(config.lastSyncedAt));
    } else {
      window.localStorage.removeItem(LAST_SYNCED_KEY);
    }
  }

  if (usesNativeCredentialStorage()) {
    await setNativeToken(config.token || '');
    return;
  }

  if (!canUseBrowserStorage(window.sessionStorage)) return;

  try {
    window.sessionStorage.setItem(
      SYNC_CONFIG_KEY,
      JSON.stringify({ token: config.token, lastSyncedAt: config.lastSyncedAt })
    );
  } catch {}
}

export async function clearSyncToken() {
  if (usesNativeCredentialStorage()) {
    await setNativeToken('');
    return;
  }

  try {
    window.sessionStorage.removeItem(SYNC_CONFIG_KEY);
  } catch {}
}


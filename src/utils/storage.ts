export interface HmNativeStorage {
  getItem(key: string): string;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

declare global {
  interface Window {
    hmNativeStorage?: HmNativeStorage;
  }
}

export const Storage = {
  getItem: (key: string): string | null => {
    if (window.hmNativeStorage) {
      try {
        const val = window.hmNativeStorage.getItem(key);
        // ArkWeb proxy might return unexpected types or a Promise if not fully sync
        if (typeof val === 'string') {
          return val === '' ? null : val;
        } else if (val === null || val === undefined) {
          return null;
        } else {
          console.warn(`hmNativeStorage returned non-string for ${key}:`, val);
          return null; // Fallback to null to prevent JSON.parse crashes
        }
      } catch (e) {
        console.error("hmNativeStorage.getItem error", e);
        return null;
      }
    }
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (window.hmNativeStorage) {
      try {
        window.hmNativeStorage.setItem(key, value);
      } catch (e) {
        console.error("hmNativeStorage.setItem error", e);
        localStorage.setItem(key, value);
      }
    } else {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (window.hmNativeStorage) {
      try {
        window.hmNativeStorage.removeItem(key);
      } catch (e) {
        console.error("hmNativeStorage.removeItem error", e);
        localStorage.removeItem(key);
      }
    } else {
      localStorage.removeItem(key);
    }
  },
  clear: (): void => {
    // Note: native preference clear is not implemented in our proxy.
    // Just clearing web storage.
    localStorage.clear();
  }
};

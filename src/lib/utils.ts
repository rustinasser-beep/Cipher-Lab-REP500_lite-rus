/**
 * Lightweight shared utility functions for Cipher Lab REP500 Lite
 */

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Checks if the browser environment supports required Web Cryptography features.
 */
export function checkBrowserCryptoSupport(): {
  supported: boolean;
  isSecure: boolean;
  hasSubtle: boolean;
} {
  const isSecure = typeof window !== 'undefined' ? (window.isSecureContext ?? true) : true;
  const hasSubtle = typeof window !== 'undefined' && Boolean(window.crypto && window.crypto.subtle);
  return {
    supported: hasSubtle,
    isSecure,
    hasSubtle,
  };
}

/**
 * Cryptographic Random Key & Passphrase Generator
 * Provides strong random keys, entropy measurement, and strength indicators.
 */

import { KeyGenOptions } from '../types';

const WORDLIST = [
  'cipher', 'quantum', 'matrix', 'vault', 'shuttle', 'nebula', 'solstice', 'zenith',
  'phoenix', 'orbital', 'crypto', 'shield', 'enigma', 'vector', 'horizon', 'glacier',
  'cobalt', 'vortex', 'falcon', 'titan', 'aurora', 'beacon', 'cascade', 'eclipse',
  'obsidian', 'sentinel', 'prism', 'valkyrie', 'pulsar', 'hyperion', 'spectrum', 'astral',
  'vertex', 'chronos', 'nexus', 'quasar', 'shadow', 'mirage', 'starlight', 'radiant',
  'thunder', 'siren', 'sentry', 'dynamo', 'odyssey', 'phantom', 'apex', 'tempest'
];

export function generateCryptoRandomKey(options: KeyGenOptions): string {
  if (options.type === 'passphrase') {
    const count = options.wordCount || 4;
    const selected: string[] = [];
    const randomArray = new Uint32Array(count);
    window.crypto.getRandomValues(randomArray);

    for (let i = 0; i < count; i++) {
      const idx = randomArray[i] % WORDLIST.length;
      selected.push(WORDLIST[idx]);
    }
    // Add random 3-digit number for extra entropy
    const num = Math.floor(100 + Math.random() * 900);
    return `${selected.join('-')}-${num}`;
  }

  if (options.type === 'hex') {
    const byteCount = Math.max(16, Math.floor(options.length / 2));
    const randomBytes = new Uint8Array(byteCount);
    window.crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  if (options.type === 'pin') {
    const digits = '0123456789';
    let result = '';
    const randomBytes = new Uint8Array(options.length);
    window.crypto.getRandomValues(randomBytes);
    for (let i = 0; i < options.length; i++) {
      result += digits[randomBytes[i] % digits.length];
    }
    return result;
  }

  // Complex alphanumeric + symbols
  let charPool = '';
  if (options.includeUppercase) charPool += 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous O/I
  if (options.includeLowercase) charPool += 'abcdefghijkmnpqrstuvwxyz'; // exclude ambiguous l
  if (options.includeNumbers) charPool += '23456789'; // exclude 0, 1
  if (options.includeSymbols) charPool += '!@#$%^&*()_+~|}{[]:;?><,./-=';

  if (!charPool) {
    charPool = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
  }

  const length = Math.max(8, options.length);
  const randomBytes = new Uint8Array(length);
  window.crypto.getRandomValues(randomBytes);

  let key = '';
  for (let i = 0; i < length; i++) {
    key += charPool[randomBytes[i] % charPool.length];
  }

  return key;
}

export interface PasswordStrength {
  score: number; // 0 - 4
  label: { ar: string; en: string };
  color: string;
  entropyBits: number;
  suggestions: { ar: string; en: string }[];
}

export function evaluateKeyStrength(key: string): PasswordStrength {
  if (!key || key.length === 0) {
    return {
      score: 0,
      label: { ar: 'فارغ', en: 'Empty' },
      color: 'text-slate-500',
      entropyBits: 0,
      suggestions: [{ ar: 'أدخل مفتاحاً سرياً للبدء', en: 'Enter a secret key to begin' }],
    };
  }

  let poolSize = 0;
  if (/[a-z]/.test(key)) poolSize += 26;
  if (/[A-Z]/.test(key)) poolSize += 26;
  if (/[0-9]/.test(key)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(key)) poolSize += 33;

  const entropyBits = Math.round(key.length * (Math.log2(poolSize || 1)));

  let score = 0;
  if (entropyBits >= 128) score = 4;
  else if (entropyBits >= 80) score = 3;
  else if (entropyBits >= 50) score = 2;
  else if (entropyBits >= 25) score = 1;
  else score = 0;

  const suggestions: { ar: string; en: string }[] = [];
  if (key.length < 12) {
    suggestions.push({ ar: 'اجعل المفتاح 12 حرفاً على الأقل', en: 'Make the key at least 12 characters' });
  }
  if (!/[^a-zA-Z0-9]/.test(key)) {
    suggestions.push({ ar: 'أضف رموزاً خاصة مثل (!@#$)', en: 'Add special characters like (!@#$)' });
  }
  if (!/[A-Z]/.test(key)) {
    suggestions.push({ ar: 'استخدم أحرفاً كبيرة وصغيرة', en: 'Use both uppercase and lowercase letters' });
  }

  const labels = [
    { ar: 'ضعيف جداً', en: 'Very Weak', color: 'text-red-400' },
    { ar: 'ضعيف', en: 'Weak', color: 'text-orange-400' },
    { ar: 'متوسط', en: 'Moderate', color: 'text-amber-400' },
    { ar: 'قوي', en: 'Strong', color: 'text-emerald-400' },
    { ar: 'عالي الأمان (فائق)', en: 'Military Grade', color: 'text-cyan-400' },
  ];

  return {
    score,
    label: { ar: labels[score].ar, en: labels[score].en },
    color: labels[score].color,
    entropyBits,
    suggestions,
  };
}

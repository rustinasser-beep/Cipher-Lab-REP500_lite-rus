/**
 * Types & Interfaces for Cipher Lab REP500 Lite
 */

export type AppLanguage = 'ar' | 'en';

export interface CipherEnvelope {
  v: number;
  alg: string;
  salt: string;
  iv: string;
  iter?: number;
  type?: 'text' | 'file';
  filename?: string;
  mime?: string;
  data: string;
}

export interface EncryptionResult {
  ciphertext: string;
  envelope: CipherEnvelope;
  stats: {
    inputBytes: number;
    cipherBytes: number;
    repCodesCount: number;
    outputLength: number;
    durationMs: number;
    iterations: number;
  };
}

export interface DecryptionResult {
  plaintext?: string;
  fileData?: Uint8Array;
  filename?: string;
  mime?: string;
  type: 'text' | 'file';
  stats: {
    cipherBytes: number;
    outputBytes: number;
    durationMs: number;
    iterations: number;
  };
}

export interface DecodeLookup {
  get(code: number): number | undefined;
}

export interface RepresentationTable {
  encodeTable: number[][]; // 256 byte entries, each with 500 codes (11-digit numbers)
  decodeMap: DecodeLookup; // O(1) compact lookup mapping 11-digit code -> byte (0-255)
}

export interface SecurityConfig {
  pbkdf2Iterations: number;
  labelEnc: string;
  labelTable: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  mode: 'encrypt' | 'decrypt';
  type: 'text' | 'file';
  filename?: string;
  summary: string;
  iterations: number;
  durationMs: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export interface KeyGenOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  type: 'complex' | 'passphrase' | 'hex' | 'pin';
  wordCount?: number;
}

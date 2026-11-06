import React, { useState, useRef, useEffect } from 'react';
import {
  FileUp,
  FileCheck,
  Download,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  File,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { AppLanguage, HistoryItem } from '../types';
import { translations } from '../lib/i18n';
import { encryptFile, decryptData, DecryptionError } from '../lib/cipher';
import { evaluateKeyStrength } from '../lib/keyGen';
import { formatBytes } from '../lib/utils';

export { formatBytes };

interface FileEncryptorProps {
  lang: AppLanguage;
  sharedKey: string;
  onUpdateSharedKey: (key: string) => void;
  onOpenKeyGen: () => void;
  iterations: number;
  onAddHistory: (item: HistoryItem) => void;
}

export const FileEncryptor: React.FC<FileEncryptorProps> = ({
  lang,
  sharedKey,
  onUpdateSharedKey,
  onOpenKeyGen,
  iterations,
  onAddHistory,
}) => {
  const t = translations[lang];

  const [activeMode, setActiveMode] = useState<'encrypt' | 'decrypt'>('encrypt');

  // Encryption state
  const [encSelectedFile, setEncSelectedFile] = useState<File | null>(null);
  const [encKey, setEncKey] = useState<string>(sharedKey);
  const [showEncKey, setShowEncKey] = useState<boolean>(false);
  const [encLoading, setEncLoading] = useState<boolean>(false);
  const [encProgressMsg, setEncProgressMsg] = useState<string>('');
  const [encProgressPct, setEncProgressPct] = useState<number>(0);
  const [encResultUrl, setEncResultUrl] = useState<{
    url: string;
    filename: string;
    size: number;
  } | null>(null);
  const [encError, setEncError] = useState<string>('');

  // Decryption state
  const [decSelectedFile, setDecSelectedFile] = useState<File | null>(null);
  const [decKey, setDecKey] = useState<string>(sharedKey);
  const [showDecKey, setShowDecKey] = useState<boolean>(false);
  const [decLoading, setDecLoading] = useState<boolean>(false);
  const [decProgressMsg, setDecProgressMsg] = useState<string>('');
  const [decResult, setDecResult] = useState<{
    url: string;
    filename: string;
    mime: string;
    size: number;
    previewUrl?: string;
    isImage?: boolean;
    isText?: boolean;
    textContent?: string;
  } | null>(null);
  const [decError, setDecError] = useState<string>('');

  const encFileInputRef = useRef<HTMLInputElement>(null);
  const decFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sharedKey) {
      setEncKey(sharedKey);
      setDecKey(sharedKey);
    }
  }, [sharedKey]);

  const handleEncryptFile = async () => {
    setEncError('');
    if (!encSelectedFile) {
      setEncError(
        lang === 'ar' ? 'الرجاء اختيار ملف للتشفير' : 'Please select a file to encrypt'
      );
      return;
    }
    if (!encKey) {
      setEncError(lang === 'ar' ? 'الرجاء إدخال المفتاح السري' : 'Please enter a secret key');
      return;
    }

    setEncLoading(true);
    setEncProgressPct(15);
    setEncProgressMsg(t.common.working);

    try {
      const result = await encryptFile(encSelectedFile, encKey, iterations, (msg, pct) => {
        setEncProgressMsg(msg);
        if (pct) setEncProgressPct(pct);
      });

      const blob = new Blob([result.ciphertext], { type: 'text/plain;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const outputFilename = `${encSelectedFile.name}.rep500`;

      setEncResultUrl({
        url: downloadUrl,
        filename: outputFilename,
        size: blob.size,
      });

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = outputFilename;
      a.click();

      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'encrypt',
        type: 'file',
        filename: encSelectedFile.name,
        summary: `${encSelectedFile.name} (${formatBytes(encSelectedFile.size)})`,
        iterations,
        durationMs: result.stats.durationMs,
        status: 'success',
      });
    } catch (err: any) {
      setEncError(err.message || 'File encryption error');
      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'encrypt',
        type: 'file',
        filename: encSelectedFile.name,
        summary: `Failed to encrypt ${encSelectedFile.name}`,
        iterations,
        durationMs: 0,
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setEncLoading(false);
    }
  };

  const handleDecryptFile = async () => {
    setDecError('');
    if (!decSelectedFile) {
      setDecError(
        lang === 'ar'
          ? 'الرجاء اختيار ملف .rep500 لفك تشفيره'
          : 'Please select an encrypted .rep500 file'
      );
      return;
    }
    if (!decKey) {
      setDecError(lang === 'ar' ? 'الرجاء إدخال المفتاح السري' : 'Please enter the secret key');
      return;
    }

    setDecLoading(true);
    setDecProgressMsg(t.common.working);

    try {
      const ciphertext = await decSelectedFile.text();
      const result = await decryptData(ciphertext, decKey, (msg) => {
        setDecProgressMsg(msg);
      });

      let blob: Blob;
      let filename = result.filename || 'decrypted_file';
      let mime = result.mime || 'application/octet-stream';

      if (result.type === 'file' && result.fileData) {
        const bytesCopy = new Uint8Array(result.fileData.byteLength);
        bytesCopy.set(result.fileData);
        blob = new Blob([bytesCopy], { type: mime });
      } else if (result.plaintext) {
        blob = new Blob([result.plaintext], { type: 'text/plain;charset=utf-8' });
        filename = filename.endsWith('.txt') ? filename : `${filename}.txt`;
        mime = 'text/plain';
      } else {
        throw new Error('No data found in decrypted payload.');
      }

      const downloadUrl = URL.createObjectURL(blob);
      const isImage = mime.startsWith('image/');
      const isText = mime.startsWith('text/') || mime === 'application/json';
      let textContent: string | undefined;

      if (isText && result.type === 'file' && result.fileData) {
        try {
          textContent = new TextDecoder().decode(result.fileData).slice(0, 1000);
        } catch {}
      } else if (result.plaintext) {
        textContent = result.plaintext.slice(0, 1000);
      }

      setDecResult({
        url: downloadUrl,
        filename,
        mime,
        size: blob.size,
        previewUrl: isImage ? downloadUrl : undefined,
        isImage,
        isText,
        textContent,
      });

      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      a.click();

      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'decrypt',
        type: 'file',
        filename,
        summary: `${filename} (${formatBytes(blob.size)})`,
        iterations: result.stats.iterations,
        durationMs: result.stats.durationMs,
        status: 'success',
      });
    } catch (err: any) {
      const msg = err instanceof DecryptionError ? err.message : `Error: ${err.message}`;
      setDecError(msg);
      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'decrypt',
        type: 'file',
        filename: decSelectedFile.name,
        summary: `Failed to decrypt ${decSelectedFile.name}`,
        iterations: 0,
        durationMs: 0,
        status: 'error',
        errorMessage: msg,
      });
    } finally {
      setDecLoading(false);
    }
  };

  const encStrength = evaluateKeyStrength(encKey);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl mx-auto">
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-[#111726] rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveMode('encrypt')}
          className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeMode === 'encrypt'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-300 hover:text-white active:bg-slate-800'
          }`}
        >
          <Lock className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.fileModule.titleEncrypt}</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('decrypt')}
          className={`min-h-[42px] px-4 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            activeMode === 'decrypt'
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-300 hover:text-white active:bg-slate-800'
          }`}
        >
          <Unlock className="w-4 h-4 shrink-0" />
          <span className="truncate">{t.fileModule.titleDecrypt}</span>
        </button>
      </div>

      {/* ----------------- FILE ENCRYPT MODE ----------------- */}
      {activeMode === 'encrypt' && (
        <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {t.fileModule.titleEncrypt}
              </h3>
              <p className="text-xs text-slate-400 truncate">{t.fileModule.supportedTypes}</p>
            </div>
          </div>

          {/* File Selection Zone */}
          <div
            onClick={() => encFileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                setEncSelectedFile(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-2xl p-5 sm:p-8 text-center bg-[#090d16] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2.5"
          >
            <input
              ref={encFileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setEncSelectedFile(e.target.files[0]);
                }
              }}
            />

            {encSelectedFile ? (
              <div className="flex items-center gap-3 bg-[#111726] p-3 rounded-xl border border-amber-500/40 text-start w-full">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {encSelectedFile.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {formatBytes(encSelectedFile.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEncSelectedFile(null);
                    setEncResultUrl(null);
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  aria-label={t.common.clear}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">
                    {t.fileModule.dragDropEnc}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">{t.fileModule.maxSizeNotice}</p>
                </div>
              </>
            )}
          </div>

          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label
                htmlFor="file-enc-key"
                className="font-semibold text-slate-300 flex items-center gap-1.5 min-w-0"
              >
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{t.common.secretKey}</span>
              </label>
              {encKey ? (
                <span className={`font-mono text-[11px] font-bold shrink-0 ${encStrength.color}`}>
                  {encStrength.label[lang]} ({encStrength.entropyBits}b)
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenKeyGen}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.common.generateKey}</span>
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="file-enc-key"
                type={showEncKey ? 'text' : 'password'}
                value={encKey}
                onChange={(e) => {
                  setEncKey(e.target.value);
                  onUpdateSharedKey(e.target.value);
                }}
                placeholder={t.common.secretKeyPlaceholder}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 rounded-xl ps-3 pe-11 py-2.5 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors font-mono min-h-[44px]"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowEncKey(!showEncKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer min-w-[44px]"
                aria-label={showEncKey ? t.common.hideKey : t.common.showKey}
              >
                {showEncKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Flat Linear Progress Bar */}
          {encLoading && (
            <div className="space-y-2 p-3.5 rounded-xl bg-[#090d16] border border-slate-800">
              <div className="flex justify-between text-xs text-amber-300 font-mono">
                <span className="truncate">{encProgressMsg || t.common.working}</span>
                <span className="shrink-0">{encProgressPct}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-200"
                  style={{ width: `${encProgressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Error notice */}
          {encError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{encError}</span>
            </div>
          )}

          {/* Encrypt File CTA Button */}
          <button
            type="button"
            onClick={handleEncryptFile}
            disabled={encLoading || !encSelectedFile}
            className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/40 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Lock className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>{encLoading ? t.common.working : t.fileModule.encryptAndDownload}</span>
          </button>

          {/* Result Card */}
          {encResultUrl && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-emerald-200">
                    {lang === 'ar'
                      ? 'تم تشفير الملف وتنزيله بنجاح!'
                      : 'File encrypted and downloaded!'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                    {encResultUrl.filename} ({formatBytes(encResultUrl.size)})
                  </div>
                </div>
              </div>
              <a
                href={encResultUrl.url}
                download={encResultUrl.filename}
                className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4 shrink-0" />
                <span>{t.common.download}</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* ----------------- FILE DECRYPT MODE ----------------- */}
      {activeMode === 'decrypt' && (
        <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-100">
                {t.fileModule.titleDecrypt}
              </h3>
              <p className="text-xs text-slate-400 truncate">{t.fileModule.dragDropDec}</p>
            </div>
          </div>

          {/* Encrypted File Drop Zone */}
          <div
            onClick={() => decFileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) {
                setDecSelectedFile(e.dataTransfer.files[0]);
              }
            }}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-5 sm:p-8 text-center bg-[#090d16] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2.5"
          >
            <input
              ref={decFileInputRef}
              type="file"
              accept=".rep500,.txt,.b64"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setDecSelectedFile(e.target.files[0]);
                }
              }}
            />

            {decSelectedFile ? (
              <div className="flex items-center gap-3 bg-[#111726] p-3 rounded-xl border border-cyan-500/40 text-start w-full">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {decSelectedFile.name}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    {formatBytes(decSelectedFile.size)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDecSelectedFile(null);
                    setDecResult(null);
                  }}
                  className="min-h-[40px] min-w-[40px] rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                  aria-label={t.common.clear}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center">
                  <File className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-200">
                    {t.fileModule.dragDropDec}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    .rep500 · .txt · .b64
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Secret Key Input for Decryption */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label
                htmlFor="file-dec-key"
                className="font-semibold text-slate-300 flex items-center gap-1.5 min-w-0"
              >
                <Key className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{t.common.secretKey}</span>
              </label>
              {encKey && decKey !== encKey && (
                <button
                  type="button"
                  onClick={() => setDecKey(encKey)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer shrink-0"
                >
                  {lang === 'ar' ? 'استخدام مفتاح التشفير' : 'Use Encrypt Key'}
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="file-dec-key"
                type={showDecKey ? 'text' : 'password'}
                value={decKey}
                onChange={(e) => setDecKey(e.target.value)}
                placeholder={t.common.secretKeyPlaceholder}
                className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 rounded-xl ps-3 pe-11 py-2.5 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors font-mono min-h-[44px]"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowDecKey(!showDecKey)}
                className="absolute inset-y-0 end-0 px-3 flex items-center justify-center text-slate-400 hover:text-slate-200 cursor-pointer min-w-[44px]"
                aria-label={showDecKey ? t.common.hideKey : t.common.showKey}
              >
                {showDecKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Decrypt status indicator */}
          {decLoading && (
            <div className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 text-center">
              <p className="text-xs text-cyan-300 font-mono">
                {decProgressMsg || t.common.working}
              </p>
            </div>
          )}

          {/* Decrypt Error notice */}
          {decError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{decError}</span>
            </div>
          )}

          {/* Decrypt File CTA Button */}
          <button
            type="button"
            onClick={handleDecryptFile}
            disabled={decLoading || !decSelectedFile}
            className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-cyan-500/40 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Unlock className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span>{decLoading ? t.common.working : t.fileModule.decryptAndDownload}</span>
          </button>

          {/* Decryption Result Card + Preview */}
          {decResult && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-emerald-200">
                      {lang === 'ar'
                        ? 'تم فك تشفير واستعادة الملف بنجاح!'
                        : 'File decrypted and restored!'}
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono truncate mt-0.5">
                      {decResult.filename} · {formatBytes(decResult.size)}
                    </div>
                  </div>
                </div>
                <a
                  href={decResult.url}
                  download={decResult.filename}
                  className="w-full sm:w-auto min-h-[42px] px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{t.common.download}</span>
                </a>
              </div>

              {decResult.isImage && decResult.previewUrl && (
                <div className="p-2 rounded-lg bg-[#090d16] border border-slate-800 flex justify-center">
                  <img
                    src={decResult.previewUrl}
                    alt={decResult.filename}
                    className="max-h-56 rounded object-contain"
                  />
                </div>
              )}

              {decResult.isText && decResult.textContent && (
                <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800 text-xs font-mono text-slate-300 max-h-44 overflow-y-auto whitespace-pre-wrap break-words">
                  {decResult.textContent}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

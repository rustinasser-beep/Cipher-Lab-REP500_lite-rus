import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Sparkles,
  Download,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCode2,
} from 'lucide-react';
import { AppLanguage, HistoryItem } from '../types';
import { translations } from '../lib/i18n';
import { encryptText, decryptData, DecryptionError } from '../lib/cipher';
import { evaluateKeyStrength } from '../lib/keyGen';

interface TextEncryptorProps {
  lang: AppLanguage;
  sharedKey: string;
  onUpdateSharedKey: (key: string) => void;
  onOpenKeyGen: () => void;
  onInspectCiphertext: (ciphertext: string) => void;
  iterations: number;
  onAddHistory: (item: HistoryItem) => void;
}

export const TextEncryptor: React.FC<TextEncryptorProps> = ({
  lang,
  sharedKey,
  onUpdateSharedKey,
  onOpenKeyGen,
  onInspectCiphertext,
  iterations,
  onAddHistory,
}) => {
  const t = translations[lang];

  // Encrypt State
  const [plaintext, setPlaintext] = useState<string>('');
  const [encKey, setEncKey] = useState<string>(sharedKey);
  const [showEncKey, setShowEncKey] = useState<boolean>(false);
  const [mobileSubTab, setMobileSubTab] = useState<'encrypt' | 'decrypt' | 'both'>('encrypt');
  const [ciphertext, setCiphertext] = useState<string>('');
  const [encLoading, setEncLoading] = useState<boolean>(false);
  const [encProgress, setEncProgress] = useState<string>('');
  const [encCopied, setEncCopied] = useState<boolean>(false);
  const [encStats, setEncStats] = useState<{
    durationMs: number;
    codesCount: number;
    bytes: number;
  } | null>(null);
  const [encError, setEncError] = useState<string>('');

  // Decrypt State
  const [decInput, setDecInput] = useState<string>('');
  const [decKey, setDecKey] = useState<string>(sharedKey);
  const [showDecKey, setShowDecKey] = useState<boolean>(false);
  const [decResult, setDecResult] = useState<string>('');
  const [decLoading, setDecLoading] = useState<boolean>(false);
  const [decProgress, setDecProgress] = useState<string>('');
  const [decCopied, setDecCopied] = useState<boolean>(false);
  const [decStats, setDecStats] = useState<{
    durationMs: number;
    bytes: number;
    iterations: number;
  } | null>(null);
  const [decError, setDecError] = useState<string>('');
  const [decInputCopied, setDecInputCopied] = useState<boolean>(false);

  // Lightweight status toast
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Keep synced if sharedKey changed from outside
  useEffect(() => {
    if (sharedKey) {
      setEncKey(sharedKey);
      setDecKey(sharedKey);
    }
  }, [sharedKey]);

  // Handle Encrypt
  const handleEncrypt = async () => {
    setEncError('');
    if (!plaintext) {
      setEncError(
        lang === 'ar' ? 'الرجاء إدخال النص المراد تشفيره' : 'Please enter a message to encrypt'
      );
      return;
    }
    if (!encKey) {
      setEncError(lang === 'ar' ? 'الرجاء إدخال المفتاح السري' : 'Please enter a secret key');
      return;
    }

    setEncLoading(true);
    setEncProgress(t.common.working);

    try {
      const result = await encryptText(plaintext, encKey, iterations, (status) => {
        setEncProgress(status);
      });
      setCiphertext(result.ciphertext);
      setEncStats({
        durationMs: result.stats.durationMs,
        codesCount: result.stats.repCodesCount,
        bytes: result.stats.cipherBytes,
      });

      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'encrypt',
        type: 'text',
        summary: plaintext.slice(0, 32) + (plaintext.length > 32 ? '...' : ''),
        iterations,
        durationMs: result.stats.durationMs,
        status: 'success',
      });
    } catch (err: any) {
      setEncError(err.message || 'Encryption error');
      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'encrypt',
        type: 'text',
        summary: 'Failed encryption',
        iterations,
        durationMs: 0,
        status: 'error',
        errorMessage: err.message,
      });
    } finally {
      setEncLoading(false);
      setEncProgress('');
    }
  };

  // Handle Decrypt
  const handleDecrypt = async () => {
    setDecError('');
    if (!decInput.trim()) {
      setDecError(
        lang === 'ar' ? 'الرجاء لصق النص المشفر (Base64)' : 'Please paste the ciphertext'
      );
      return;
    }
    if (!decKey) {
      setDecError(lang === 'ar' ? 'الرجاء إدخال المفتاح السري' : 'Please enter the secret key');
      return;
    }

    setDecLoading(true);
    setDecProgress(t.common.working);

    try {
      const result = await decryptData(decInput.trim(), decKey, (status) => {
        setDecProgress(status);
      });

      if (result.plaintext !== undefined) {
        setDecResult(result.plaintext);
        setDecStats({
          durationMs: result.stats.durationMs,
          bytes: result.stats.outputBytes,
          iterations: result.stats.iterations,
        });

        onAddHistory({
          id: Math.random().toString(36).substring(2, 9),
          timestamp: Date.now(),
          mode: 'decrypt',
          type: 'text',
          summary: result.plaintext.slice(0, 32) + (result.plaintext.length > 32 ? '...' : ''),
          iterations: result.stats.iterations,
          durationMs: result.stats.durationMs,
          status: 'success',
        });
      }
    } catch (err: any) {
      const msg = err instanceof DecryptionError ? err.message : `Error: ${err.message}`;
      setDecError(msg);
      setDecResult('');
      onAddHistory({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode: 'decrypt',
        type: 'text',
        summary: 'Failed decryption',
        iterations: 0,
        durationMs: 0,
        status: 'error',
        errorMessage: msg,
      });
    } finally {
      setDecLoading(false);
      setDecProgress('');
    }
  };

  const showToast = (message: string, sub?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, sub });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  };

  const handleCopy = async (text: string, target: 'ciphertext' | 'plaintext' | 'decInput') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (target === 'ciphertext') {
        setEncCopied(true);
        setTimeout(() => setEncCopied(false), 2000);
        showToast(
          lang === 'ar' ? 'تم نسخ النص المشفر بنجاح!' : 'Ciphertext copied to clipboard!',
          `${text.length.toLocaleString()} ${lang === 'ar' ? 'حرف' : 'chars'}`
        );
      } else if (target === 'decInput') {
        setDecInputCopied(true);
        setTimeout(() => setDecInputCopied(false), 2000);
        showToast(
          lang === 'ar' ? 'تم نسخ النص المشفر!' : 'Ciphertext copied!',
          `${text.length.toLocaleString()} ${lang === 'ar' ? 'حرف' : 'chars'}`
        );
      } else {
        setDecCopied(true);
        setTimeout(() => setDecCopied(false), 2000);
        showToast(
          lang === 'ar' ? 'تم نسخ النص الصريح بنجاح!' : 'Plaintext copied to clipboard!'
        );
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleDownloadCiphertext = () => {
    if (!ciphertext) return;
    const blob = new Blob([ciphertext], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encrypted_message_${Date.now()}.rep500`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendToDecrypt = () => {
    if (!ciphertext) return;
    setDecInput(ciphertext);
    setDecKey(encKey);
    setMobileSubTab('decrypt');
  };

  const encStrength = evaluateKeyStrength(encKey);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Mobile Sub-Tab Switcher (Phones & small tablets) */}
      <div className="lg:hidden grid grid-cols-3 gap-1 p-1 bg-[#111726] rounded-xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMobileSubTab('encrypt')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] ${
            mobileSubTab === 'encrypt'
              ? 'bg-amber-500 text-slate-950'
              : 'text-slate-300 hover:text-white active:bg-slate-800'
          }`}
        >
          <Lock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t.common.encrypt}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSubTab('decrypt')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[42px] ${
            mobileSubTab === 'decrypt'
              ? 'bg-cyan-500 text-slate-950'
              : 'text-slate-300 hover:text-white active:bg-slate-800'
          }`}
        >
          <Unlock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{t.common.decrypt}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileSubTab('both')}
          className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center transition-colors cursor-pointer min-h-[42px] ${
            mobileSubTab === 'both'
              ? 'bg-slate-700 text-white'
              : 'text-slate-300 hover:text-white active:bg-slate-800'
          }`}
        >
          <span className="truncate">{lang === 'ar' ? 'الاثنين معاً' : 'Both'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* ----------------- ENCRYPT PANEL ----------------- */}
        <div
          className={`bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 flex-col gap-4 min-w-0 ${
            mobileSubTab === 'decrypt' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {t.common.encrypt}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setPlaintext(
                  lang === 'ar'
                    ? 'مرحباً! هذه رسالة مشفرة بنظام REP500 Lite السريع.'
                    : 'Hello! This message is protected with fast REP500 Lite.'
                );
              }}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 min-h-[36px]"
            >
              {lang === 'ar' ? 'نص تجريبي' : 'Sample Text'}
            </button>
          </div>

          {/* Plaintext Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label htmlFor="enc-plain-input" className="font-semibold text-slate-300 truncate">
                {t.textModule.plainLabel}
              </label>
              <span className="font-mono text-slate-400 text-[11px] shrink-0">
                {plaintext.length.toLocaleString()} {t.common.characters}
              </span>
            </div>
            <textarea
              id="enc-plain-input"
              rows={4}
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              placeholder={t.textModule.plainPlaceholder}
              className="w-full bg-[#090d16] border border-slate-800 focus:border-amber-500 rounded-xl p-3 text-base sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-y font-mono leading-relaxed"
            />
          </div>

          {/* Secret Key Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label
                htmlFor="enc-key-input"
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
                id="enc-key-input"
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
                title={showEncKey ? t.common.hideKey : t.common.showKey}
                aria-label={showEncKey ? t.common.hideKey : t.common.showKey}
              >
                {showEncKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {encKey && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onOpenKeyGen}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 py-0.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.common.generateKey}</span>
                </button>
              </div>
            )}
          </div>

          {/* Encrypt Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              id="enc-run-btn"
              type="button"
              onClick={handleEncrypt}
              disabled={encLoading}
              className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:bg-amber-500/50 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {encLoading ? encProgress || t.common.working : t.common.encrypt}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPlaintext('');
                setCiphertext('');
                setEncStats(null);
                setEncError('');
              }}
              className="min-h-[46px] min-w-[46px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title={t.common.clear}
              aria-label={t.common.clear}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Encrypt Error Display */}
          {encError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{encError}</span>
            </div>
          )}

          {/* Ciphertext Output Area */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <label htmlFor="enc-out-area" className="font-semibold text-slate-300">
                {t.textModule.cipherLabel}
              </label>
              <div className="flex items-center gap-2">
                {encStats && (
                  <span className="font-mono text-emerald-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {encStats.durationMs}ms · {encStats.codesCount.toLocaleString()} REP
                    </span>
                  </span>
                )}
                {ciphertext && (
                  <button
                    type="button"
                    onClick={() => handleCopy(ciphertext, 'ciphertext')}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      encCopied
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
                    }`}
                  >
                    {encCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="enc-out-area"
              rows={4}
              readOnly
              value={ciphertext}
              placeholder={
                lang === 'ar'
                  ? 'ستظهر النتيجة المشفرة (Base64 Envelope) هنا...'
                  : 'Encrypted Base64 envelope appears here...'
              }
              className={`w-full bg-[#090d16] border rounded-xl p-3 text-xs text-amber-200 font-mono focus:outline-none resize-y leading-relaxed select-all transition-colors ${
                encCopied
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-slate-800 focus:border-amber-500/60'
              }`}
            />

            {/* Dedicated Copy to Clipboard & Secondary Actions */}
            {ciphertext && (
              <div className="space-y-2 pt-0.5">
                <button
                  type="button"
                  id="btn-copy-ciphertext"
                  onClick={() => handleCopy(ciphertext, 'ciphertext')}
                  className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    encCopied
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                      : 'bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/30 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {encCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 stroke-[2.5] shrink-0" />
                      <span>{t.common.copiedToClipboard}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{t.common.copyToClipboard}</span>
                    </>
                  )}
                </button>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadCiphertext}
                    className="min-h-[40px] px-2 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-200 text-[11px] sm:text-xs font-semibold border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{t.common.download}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToDecrypt}
                    className="min-h-[40px] px-2 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-amber-300 text-[11px] sm:text-xs font-semibold border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {lang === 'ar' ? 'لفك التشفير' : 'To Decrypt'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onInspectCiphertext(ciphertext)}
                    className="min-h-[40px] px-2 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-cyan-300 text-[11px] sm:text-xs font-semibold border border-slate-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lang === 'ar' ? 'فحص' : 'Inspect'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ----------------- DECRYPT PANEL ----------------- */}
        <div
          className={`bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 flex-col gap-4 min-w-0 ${
            mobileSubTab === 'encrypt' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
                <Unlock className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {t.common.decrypt}
              </h2>
            </div>

            <label className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 min-h-[36px]">
              <FileCode2 className="w-3.5 h-3.5 shrink-0" />
              <span>{lang === 'ar' ? 'ملف .rep500' : 'Load .rep500'}</span>
              <input
                type="file"
                accept=".rep500,.txt,.b64"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const text = await file.text();
                    setDecInput(text);
                  }
                }}
              />
            </label>
          </div>

          {/* Ciphertext Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label htmlFor="dec-cipher-input" className="font-semibold text-slate-300 truncate">
                {t.textModule.cipherLabel}
              </label>
              <div className="flex items-center gap-2 shrink-0">
                {decInput.trim() && (
                  <button
                    type="button"
                    onClick={() => handleCopy(decInput, 'decInput')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer border ${
                      decInputCopied
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700'
                    }`}
                  >
                    {decInputCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-cyan-400" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                )}
                <span className="font-mono text-slate-400 text-[11px]">
                  {decInput.length.toLocaleString()} {t.common.characters}
                </span>
              </div>
            </div>
            <textarea
              id="dec-cipher-input"
              rows={4}
              value={decInput}
              onChange={(e) => setDecInput(e.target.value)}
              placeholder={t.textModule.cipherPlaceholder}
              className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors resize-y font-mono leading-relaxed"
            />
          </div>

          {/* Secret Key Input for Decrypt */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <label
                htmlFor="dec-key-input"
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
                id="dec-key-input"
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
                title={showDecKey ? t.common.hideKey : t.common.showKey}
                aria-label={showDecKey ? t.common.hideKey : t.common.showKey}
              >
                {showDecKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Decrypt Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              id="dec-run-btn"
              type="button"
              onClick={handleDecrypt}
              disabled={decLoading}
              className="flex-1 min-h-[46px] py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 disabled:bg-cyan-500/50 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              <Unlock className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">
                {decLoading ? decProgress || t.common.working : t.common.decrypt}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setDecInput('');
                setDecResult('');
                setDecStats(null);
                setDecError('');
              }}
              className="min-h-[46px] min-w-[46px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-300 border border-slate-700 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title={t.common.clear}
              aria-label={t.common.clear}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Decrypt Error Display */}
          {decError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{decError}</span>
            </div>
          )}

          {/* Plaintext Result Output Area */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap justify-between items-center gap-2 text-xs">
              <label htmlFor="dec-out-area" className="font-semibold text-slate-300">
                {t.textModule.plainLabel}
              </label>
              <div className="flex items-center gap-2">
                {decStats && (
                  <span className="font-mono text-cyan-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {decStats.durationMs}ms · {Math.round(decStats.iterations / 1000)}k
                    </span>
                  </span>
                )}
                {decResult && (
                  <button
                    type="button"
                    onClick={() => handleCopy(decResult, 'plaintext')}
                    className={`px-2 py-1 rounded-lg border text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      decCopied
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-emerald-300'
                    }`}
                  >
                    {decCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{t.common.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-emerald-400" />
                        <span>{t.common.copy}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <textarea
              id="dec-out-area"
              rows={4}
              readOnly
              value={decResult}
              placeholder={
                lang === 'ar'
                  ? 'ستظهر الرسالة الأصلية بعد فك التشفير هنا...'
                  : 'Decrypted message appears here...'
              }
              className={`w-full bg-[#090d16] border rounded-xl p-3 text-sm text-emerald-300 font-mono focus:outline-none resize-y leading-relaxed select-all transition-colors ${
                decCopied ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800'
              }`}
            />

            {/* Dedicated Copy to Clipboard Button for Decrypted Text */}
            {decResult && (
              <div className="space-y-2 pt-0.5">
                <button
                  type="button"
                  id="btn-copy-decrypted"
                  onClick={() => handleCopy(decResult, 'plaintext')}
                  className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                    decCopied
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {decCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 stroke-[2.5] shrink-0" />
                      <span>{t.common.copiedToClipboard}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{t.common.copyToClipboard}</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.textModule.decSuccess}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centered Mobile-Safe Flat Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#111726] border border-emerald-500/60 text-slate-100 pointer-events-none sm:min-w-[280px] max-w-md mx-auto"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-start min-w-0">
            <p className="text-xs sm:text-sm font-bold text-emerald-300 truncate">
              {toast.message}
            </p>
            {toast.sub && (
              <p className="text-[11px] font-mono text-slate-400 truncate">{toast.sub}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

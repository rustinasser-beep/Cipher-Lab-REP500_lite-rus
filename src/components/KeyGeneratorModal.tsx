import React, { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, X, Sparkles } from 'lucide-react';
import { AppLanguage, KeyGenOptions } from '../types';
import { translations } from '../lib/i18n';
import { evaluateKeyStrength, generateCryptoRandomKey } from '../lib/keyGen';

interface KeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  onApplyKey: (key: string, target: 'encrypt' | 'decrypt' | 'both') => void;
}

export const KeyGeneratorModal: React.FC<KeyGeneratorModalProps> = ({
  isOpen,
  onClose,
  lang,
  onApplyKey,
}) => {
  const t = translations[lang];

  const [options, setOptions] = useState<KeyGenOptions>({
    length: 24,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    type: 'complex',
    wordCount: 4,
  });

  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = () => {
    const key = generateCryptoRandomKey(options);
    setGeneratedKey(key);
  };

  useEffect(() => {
    if (isOpen) {
      handleGenerate();
    }
  }, [isOpen, options]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const strength = evaluateKeyStrength(generatedKey);

  const handleCopy = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="keygen-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111726] border border-slate-700 rounded-2xl w-full max-w-lg flex flex-col max-h-[90dvh] my-auto overflow-hidden"
      >
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/25 shrink-0">
              <Key className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="keygen-modal-title"
                className="text-sm sm:text-base font-bold text-slate-100 truncate"
              >
                {t.keyGenModal.title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            title={t.common.close}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0 ms-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {/* Key Display Card */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {strength.entropyBits} {t.common.bit}
              </span>
              <span className={`font-bold font-mono ${strength.color}`}>
                {strength.label[lang]}
              </span>
            </div>

            <div className="font-mono text-sm sm:text-base break-all text-amber-300 select-all p-3 rounded-lg bg-[#111726] border border-slate-800 min-h-[48px] flex items-center">
              {generatedKey}
            </div>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-200 ${
                  strength.score === 4
                    ? 'bg-cyan-400 w-full'
                    : strength.score === 3
                    ? 'bg-emerald-400 w-3/4'
                    : strength.score === 2
                    ? 'bg-amber-400 w-1/2'
                    : 'bg-red-400 w-1/4'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="btn-modal-regen-key"
                type="button"
                onClick={handleGenerate}
                className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{t.keyGenModal.generateNew}</span>
              </button>
              <button
                id="btn-modal-copy-key"
                type="button"
                onClick={handleCopy}
                className="min-h-[42px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.common.copied : t.common.copy}</span>
              </button>
            </div>
          </div>

          {/* Key Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {lang === 'ar' ? 'نوع المفتاح:' : 'Key Type:'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['complex', 'passphrase', 'hex', 'pin'] as const).map((typeKey) => {
                const labelMap = {
                  complex: t.keyGenModal.typeComplex,
                  passphrase: t.keyGenModal.typePassphrase,
                  hex: t.keyGenModal.typeHex,
                  pin: t.keyGenModal.typePin,
                };
                const active = options.type === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setOptions({ ...options, type: typeKey })}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold border transition-colors text-start cursor-pointer ${
                      active
                        ? 'bg-amber-500/15 border-amber-500/60 text-amber-300'
                        : 'bg-[#090d16] border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {labelMap[typeKey]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Length / Word Slider */}
          {options.type !== 'passphrase' ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.keyGenModal.length}</span>
                <span className="font-mono font-bold text-amber-400">{options.length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={options.length}
                onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{lang === 'ar' ? 'عدد الكلمات:' : 'Word Count:'}</span>
                <span className="font-mono font-bold text-amber-400">
                  {options.wordCount || 4}
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={options.wordCount || 4}
                onChange={(e) => setOptions({ ...options, wordCount: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer bg-slate-800 h-2 rounded-lg"
              />
            </div>
          )}

          {/* Apply Key Action */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                onApplyKey(generatedKey, 'both');
                onClose();
              }}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              {t.keyGenModal.useInBoth}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

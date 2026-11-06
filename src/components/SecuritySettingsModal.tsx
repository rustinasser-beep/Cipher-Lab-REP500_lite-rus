import React, { useState, useEffect } from 'react';
import { Sliders, X, Zap, ShieldCheck, Gauge, Info, Check, Minus, Plus } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface SecuritySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  currentIterations: number;
  onSaveIterations: (iter: number) => void;
}

const MIN_ITER = 10_000;
const MAX_ITER = 1_000_000;

export const SecuritySettingsModal: React.FC<SecuritySettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentIterations,
  onSaveIterations,
}) => {
  const t = translations[lang];
  const [iter, setIter] = useState<number>(currentIterations);

  useEffect(() => {
    setIter(currentIterations);
  }, [currentIterations, isOpen]);

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

  const clampIter = (val: number) => {
    if (Number.isNaN(val)) return 100_000;
    return Math.min(MAX_ITER, Math.max(MIN_ITER, Math.round(val)));
  };

  const presets = [
    {
      value: 25_000,
      label: t.settingsModal.presetUltraFast,
      icon: Zap,
      color: 'text-emerald-400',
      tag: '25k',
    },
    {
      value: 50_000,
      label: t.settingsModal.presetFast,
      icon: Zap,
      color: 'text-emerald-400',
      tag: '50k',
    },
    {
      value: 100_000,
      label: t.settingsModal.presetLiteDefault,
      icon: Gauge,
      color: 'text-amber-400',
      tag: 'Lite 100k',
    },
    {
      value: 300_000,
      label: t.settingsModal.presetHigh,
      icon: ShieldCheck,
      color: 'text-cyan-400',
      tag: '300k',
    },
    {
      value: 600_000,
      label: t.settingsModal.presetOriginal,
      icon: ShieldCheck,
      color: 'text-slate-300',
      tag: '600k',
    },
  ];

  const handleSave = () => {
    onSaveIterations(clampIter(iter));
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="security-settings-title"
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
            <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shrink-0">
              <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3
                id="security-settings-title"
                className="text-sm sm:text-base font-bold text-slate-100 truncate"
              >
                {t.settingsModal.title}
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
          <p className="text-xs text-slate-400 leading-relaxed">{t.settingsModal.desc}</p>

          {/* Custom +/- & Numeric Control + Slider */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-200">{t.settingsModal.customIter}</span>
              <span className="font-mono text-cyan-300 font-bold">
                {iter.toLocaleString()} {lang === 'ar' ? 'تكرار' : 'iter'}
              </span>
            </div>

            {/* Direct Stepper + Numeric Input for effortless mobile adjustment */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIter((prev) => clampIter(prev - 10_000))}
                className="min-h-[42px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                title="-10,000"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>10k</span>
              </button>

              <input
                type="number"
                min={MIN_ITER}
                max={MAX_ITER}
                step={5000}
                value={iter}
                onChange={(e) => {
                  const raw = Number(e.target.value);
                  if (!Number.isNaN(raw)) {
                    setIter(Math.max(0, Math.min(MAX_ITER, raw)));
                  }
                }}
                onBlur={() => setIter((prev) => clampIter(prev))}
                className="flex-1 min-w-0 min-h-[42px] bg-[#111726] border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-center font-mono text-base sm:text-sm font-bold text-amber-300 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setIter((prev) => clampIter(prev + 10_000))}
                className="min-h-[42px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                title="+10,000"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>10k</span>
              </button>
            </div>

            <input
              type="range"
              min={MIN_ITER}
              max={MAX_ITER}
              step={5000}
              value={clampIter(iter)}
              onChange={(e) => setIter(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-800 h-2 rounded-lg"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>10k</span>
              <span>100k (Lite)</span>
              <span>1,000k</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            {presets.map((preset) => {
              const isSelected = iter === preset.value;
              const Icon = preset.icon;
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setIter(preset.value)}
                  className={`w-full p-3 rounded-xl border text-start flex items-center justify-between transition-colors cursor-pointer min-h-[52px] ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/70'
                      : 'bg-[#090d16] border-slate-800 hover:bg-slate-800/70 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${preset.color}`} />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-100 flex items-center gap-2">
                        <span className="font-mono">{preset.value.toLocaleString()}</span>
                        <span className={`text-[10px] font-mono font-bold ${preset.color}`}>
                          [{preset.tag}]
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {preset.label}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 ms-2" />}
                </button>
              );
            })}
          </div>

          {/* Compatibility Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t.settingsModal.warning}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-800 bg-[#0d1322] flex items-center justify-end">
          <button
            id="btn-save-settings"
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>{t.settingsModal.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

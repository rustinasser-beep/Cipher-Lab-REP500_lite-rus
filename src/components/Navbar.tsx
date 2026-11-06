import React from 'react';
import { Shield, Key, Sliders, Globe, Lock, History } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';

interface NavbarProps {
  lang: AppLanguage;
  onToggleLang: () => void;
  onOpenKeyGen: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  currentIterations: number;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onOpenKeyGen,
  onOpenSettings,
  onOpenHistory,
  currentIterations,
  historyCount,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-[#0d1322] sticky top-0 z-40 w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 sm:h-15 flex items-center justify-between gap-2">
        {/* Brand & Lite Identity */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shrink-0">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {lang === 'ar' ? 'مختبر REP500' : 'Cipher Lab REP500'}
              </h1>
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 shrink-0">
                Lite
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block truncate">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Desktop & Tablet Action Controls + Compact Mobile Fallback */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Key Generator Shortcut (visible on sm+, on mobile handled by large QuickActions bar) */}
          <button
            id="btn-nav-keygen"
            type="button"
            onClick={onOpenKeyGen}
            className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer min-h-[40px]"
            title={t.common.generateKey}
            aria-label={t.common.generateKey}
          >
            <Key className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="hidden md:inline">{t.common.generateKey}</span>
          </button>

          {/* PBKDF2 Speed Settings */}
          <button
            id="btn-nav-settings"
            type="button"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer min-h-[38px] sm:min-h-[40px]"
            title={t.common.settings}
            aria-label={t.common.settings}
          >
            <Sliders className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-mono text-xs text-cyan-300">
              {currentIterations >= 1000
                ? `${Math.round(currentIterations / 1000)}k`
                : currentIterations}
            </span>
          </button>

          {/* History Drawer (sm+ in header; on mobile inside QuickActions) */}
          <button
            id="btn-nav-history"
            type="button"
            onClick={onOpenHistory}
            className="hidden sm:flex relative items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px]"
            title={t.common.history}
            aria-label={t.common.history}
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-mono font-bold text-slate-950 flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            id="btn-nav-lang"
            type="button"
            onClick={onToggleLang}
            className="flex items-center justify-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-xs font-semibold cursor-pointer min-h-[38px] sm:min-h-[40px]"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-mono font-bold">
              {lang === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>
        </div>
      </div>

      {/* Desktop-only Sub-ribbon (hidden on mobile to preserve >85% viewport height) */}
      <div className="hidden sm:block bg-[#090d16] border-t border-slate-800/80 px-4 py-1 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono truncate">
          <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate">{t.badgeClientOnly}</span>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Key, Sliders, History, Globe } from 'lucide-react';
import { AppLanguage } from '../types';

interface MobileQuickActionsProps {
  lang: AppLanguage;
  onOpenKeyGen: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onToggleLang: () => void;
  currentIterations: number;
  historyCount: number;
}

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({
  lang,
  onOpenKeyGen,
  onOpenSettings,
  onOpenHistory,
  onToggleLang,
  currentIterations,
  historyCount,
}) => {
  return (
    <div className="sm:hidden w-full">
      <div className="grid grid-cols-4 gap-1.5 bg-[#111726] p-1.5 rounded-2xl border border-slate-800">
        {/* Key Generator Button */}
        <button
          id="btn-mobile-keygen"
          type="button"
          onClick={onOpenKeyGen}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#0b0f19] active:bg-slate-800 border border-slate-800 transition-colors text-center min-h-[54px] cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center mb-1">
            <Key className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
            {lang === 'ar' ? 'مفتاح جديد' : 'Gen Key'}
          </span>
        </button>

        {/* Security / PBKDF2 Speed Settings */}
        <button
          id="btn-mobile-settings"
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#0b0f19] active:bg-slate-800 border border-slate-800 transition-colors text-center min-h-[54px] cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-1">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-mono font-bold text-cyan-300 truncate w-full">
            {currentIterations >= 1000
              ? `${Math.round(currentIterations / 1000)}k`
              : currentIterations}{' '}
            {lang === 'ar' ? 'تكرار' : 'iter'}
          </span>
        </button>

        {/* History Drawer */}
        <button
          id="btn-mobile-history"
          type="button"
          onClick={onOpenHistory}
          className="relative flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#0b0f19] active:bg-slate-800 border border-slate-800 transition-colors text-center min-h-[54px] cursor-pointer"
        >
          {historyCount > 0 && (
            <span className="absolute top-1 end-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-mono font-bold text-slate-950 flex items-center justify-center">
              {historyCount > 9 ? '9+' : historyCount}
            </span>
          )}
          <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center mb-1">
            <History className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
            {lang === 'ar' ? 'السجل' : 'History'}
          </span>
        </button>

        {/* Language Toggle */}
        <button
          id="btn-mobile-lang"
          type="button"
          onClick={onToggleLang}
          className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#0b0f19] active:bg-slate-800 border border-slate-800 transition-colors text-center min-h-[54px] cursor-pointer"
        >
          <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-1">
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-slate-200 truncate w-full">
            {lang === 'ar' ? 'English' : 'عربي'}
          </span>
        </button>
      </div>
    </div>
  );
};

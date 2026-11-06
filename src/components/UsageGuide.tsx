import React from 'react';
import {
  BookOpen,
  Key,
  Lock,
  Unlock,
  FileUp,
  Sliders,
  Search,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';
import { MainTabType } from './MobileBottomNav';

interface UsageGuideProps {
  lang: AppLanguage;
  onNavigateTab: (tab: MainTabType) => void;
  onOpenKeyGen: () => void;
  onOpenSettings: () => void;
}

export const UsageGuide: React.FC<UsageGuideProps> = ({
  lang,
  onNavigateTab,
  onOpenKeyGen,
  onOpenSettings,
}) => {
  const t = translations[lang];
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  const steps = [
    {
      icon: Key,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
      title: t.guideModule.step1Title,
      desc: t.guideModule.step1Desc,
      actionLabel: t.guideModule.step1Action,
      onAction: onOpenKeyGen,
    },
    {
      icon: Lock,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/25',
      title: t.guideModule.step2Title,
      desc: t.guideModule.step2Desc,
      actionLabel: t.guideModule.step2Action,
      onAction: () => onNavigateTab('text'),
    },
    {
      icon: Unlock,
      iconColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25',
      title: t.guideModule.step3Title,
      desc: t.guideModule.step3Desc,
      actionLabel: t.guideModule.step2Action,
      onAction: () => onNavigateTab('text'),
    },
    {
      icon: FileUp,
      iconColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/25',
      title: t.guideModule.step4Title,
      desc: t.guideModule.step4Desc,
      actionLabel: t.guideModule.step4Action,
      onAction: () => onNavigateTab('file'),
    },
    {
      icon: Sliders,
      iconColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/25',
      title: t.guideModule.step5Title,
      desc: t.guideModule.step5Desc,
      actionLabel: t.guideModule.step5Action,
      onAction: onOpenSettings,
    },
    {
      icon: Search,
      iconColor: 'text-slate-300 bg-slate-800 border-slate-700',
      title: t.guideModule.step6Title,
      desc: t.guideModule.step6Desc,
      actionLabel: t.guideModule.step6Action,
      onAction: () => onNavigateTab('inspector'),
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">
              {t.guideModule.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              {t.guideModule.desc}
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Text Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={index}
              className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${step.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-100">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={step.onAction}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b0f19] hover:bg-slate-800 active:bg-slate-800 text-amber-400 border border-slate-800 text-xs font-bold transition-colors cursor-pointer min-h-[42px]"
                >
                  <span>{step.actionLabel}</span>
                  <ArrowIcon className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Essential Notes Box */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
        <h3 className="text-sm font-bold text-slate-100">
          {t.guideModule.tipsTitle}
        </h3>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.guideModule.tip1}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{t.guideModule.tip2}</span>
          </li>
          <li className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{t.guideModule.tip3}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

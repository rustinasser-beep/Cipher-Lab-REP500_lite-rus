import React from 'react';
import { FileText, FileUp, BookOpen, Search, Grid } from 'lucide-react';
import { AppLanguage } from '../types';

export type MainTabType = 'text' | 'file' | 'guide' | 'inspector' | 'matrix';

interface MobileBottomNavProps {
  lang: AppLanguage;
  activeTab: MainTabType;
  onSelectTab: (tab: MainTabType) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  activeTab,
  onSelectTab,
}) => {
  const tabs: Array<{
    id: MainTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      id: 'text',
      label: lang === 'ar' ? 'نصوص' : 'Text',
      icon: FileText,
    },
    {
      id: 'file',
      label: lang === 'ar' ? 'ملفات' : 'Files',
      icon: FileUp,
    },
    {
      id: 'guide',
      label: lang === 'ar' ? 'الشرح' : 'Guide',
      icon: BookOpen,
    },
    {
      id: 'inspector',
      label: lang === 'ar' ? 'فاحص' : 'Inspect',
      icon: Search,
    },
    {
      id: 'matrix',
      label: lang === 'ar' ? 'مصفوفة' : 'Matrix',
      icon: Grid,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0d1322] border-t border-slate-800 px-1.5 pt-1 pb-[max(env(safe-area-inset-bottom),0.35rem)]"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`mobile-nav-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-colors cursor-pointer relative min-h-[48px] ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200 active:bg-slate-800'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-amber-400 rounded-full" />
              )}

              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-amber-400 stroke-[2.25]' : 'text-slate-400'
                }`}
              />

              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

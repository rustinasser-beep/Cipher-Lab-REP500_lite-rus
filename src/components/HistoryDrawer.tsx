import React, { useEffect } from 'react';
import { History, X, Trash2, CheckCircle2, AlertCircle, File, FileText } from 'lucide-react';
import { AppLanguage, HistoryItem } from '../types';
import { translations } from '../lib/i18n';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  history: HistoryItem[];
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  lang,
  history,
  onClearHistory,
}) => {
  const t = translations[lang];

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex justify-end bg-black/80"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111726] border-s border-slate-800 w-full max-w-md h-full flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#0d1322]">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-100">{t.common.history}</h3>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                title={t.common.clear}
                aria-label={t.common.clear}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t.common.close}
              title={t.common.close}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              {lang === 'ar'
                ? 'لا توجد عمليات مسجلة في هذه الجلسة'
                : 'No cryptographic operations in this session'}
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#090d16] border border-slate-800 space-y-1.5 font-mono text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        item.mode === 'encrypt'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-cyan-500/15 text-cyan-400'
                      }`}
                    >
                      {item.mode.toUpperCase()}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      {item.type === 'file' ? (
                        <File className="w-3 h-3" />
                      ) : (
                        <FileText className="w-3 h-3" />
                      )}
                      <span>{item.type}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-slate-300 truncate font-sans text-xs">{item.summary}</div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <span>{item.durationMs}ms</span>
                  {item.iterations > 0 && <span>{item.iterations.toLocaleString()} iter</span>}
                  <span>
                    {item.status === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

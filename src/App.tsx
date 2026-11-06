/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { FileText, FileUp, Search, Grid, ShieldAlert, BookOpen } from 'lucide-react';
import { AppLanguage, HistoryItem } from './types';
import { translations } from './lib/i18n';
import { DEFAULT_PBKDF2_ITERATIONS } from './lib/cipher';
import { checkBrowserCryptoSupport } from './lib/utils';
import { Navbar } from './components/Navbar';
import { TextEncryptor } from './components/TextEncryptor';
import { MobileBottomNav, MainTabType } from './components/MobileBottomNav';
import { MobileQuickActions } from './components/MobileQuickActions';
import { UsageGuide } from './components/UsageGuide';

// Lazy-load secondary tools and modals to keep initial load instantaneous
const FileEncryptor = React.lazy(() =>
  import('./components/FileEncryptor').then((m) => ({ default: m.FileEncryptor }))
);
const EnvelopeInspector = React.lazy(() =>
  import('./components/EnvelopeInspector').then((m) => ({ default: m.EnvelopeInspector }))
);
const RepTableVisualizer = React.lazy(() =>
  import('./components/RepTableVisualizer').then((m) => ({ default: m.RepTableVisualizer }))
);
const KeyGeneratorModal = React.lazy(() =>
  import('./components/KeyGeneratorModal').then((m) => ({ default: m.KeyGeneratorModal }))
);
const SecuritySettingsModal = React.lazy(() =>
  import('./components/SecuritySettingsModal').then((m) => ({ default: m.SecuritySettingsModal }))
);
const HistoryDrawer = React.lazy(() =>
  import('./components/HistoryDrawer').then((m) => ({ default: m.HistoryDrawer }))
);

const TabLoadingFallback: React.FC<{ lang: AppLanguage }> = ({ lang }) => (
  <div className="flex items-center justify-center p-10 min-h-[200px] text-slate-400 text-xs font-mono">
    {lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}
  </div>
);

export default function App() {
  const [lang, setLang] = useState<AppLanguage>('ar');
  const [activeTab, setActiveTab] = useState<MainTabType>('text');
  const [sharedKey, setSharedKey] = useState<string>('');
  const [iterations, setIterations] = useState<number>(DEFAULT_PBKDF2_ITERATIONS);

  // Modals & Drawers
  const [isKeyGenOpen, setIsKeyGenOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Cross-component inspector target
  const [inspectorPayload, setInspectorPayload] = useState<string>('');

  // Ephemeral session history (capped at 30 items)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const t = translations[lang];

  const cryptoSupport = useMemo(() => checkBrowserCryptoSupport(), []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleAddHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev.slice(0, 29)]);
  };

  const handleApplyKey = (key: string) => {
    setSharedKey(key);
  };

  const handleInspectCiphertext = (cipher: string) => {
    setInspectorPayload(cipher);
    setActiveTab('inspector');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-[#e2e8f0] flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenKeyGen={() => setIsKeyGenOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        currentIterations={iterations}
        historyCount={history.length}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-3 sm:space-y-5 pb-24 sm:pb-10">
        {/* Mobile Quick Action Strip (Phones only - Direct thumb access) */}
        <MobileQuickActions
          lang={lang}
          onOpenKeyGen={() => setIsKeyGenOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onToggleLang={handleToggleLang}
          currentIterations={iterations}
          historyCount={history.length}
        />

        {/* Insecure Context Warning Banner (shown only if WebCrypto is missing) */}
        {!cryptoSupport.supported && (
          <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-3.5 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed min-w-0">
              <span className="font-bold text-red-300 block mb-0.5">
                {lang === 'ar'
                  ? 'واجهة التشفير غير متوفرة في هذا الاتصال:'
                  : 'Web Cryptography Unavailable:'}
              </span>
              <p className="text-slate-300">
                {lang === 'ar'
                  ? 'يرجى فتح التطبيق عبر اتصال آمن HTTPS أو localhost لتفعيل محرك التشفير المحلي.'
                  : 'Please access via HTTPS or localhost to enable local Web Cryptography.'}
              </p>
            </div>
          </div>
        )}

        {/* Desktop / Tablet Navigation Tabs (Hidden on phones where MobileBottomNav is fixed) */}
        <div className="hidden sm:flex justify-center border-b border-slate-800 pb-3">
          <nav className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-[#111726] border border-slate-800">
            <button
              id="tab-text"
              type="button"
              onClick={() => setActiveTab('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                activeTab === 'text'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>{t.tabs.text}</span>
            </button>

            <button
              id="tab-file"
              type="button"
              onClick={() => setActiveTab('file')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                activeTab === 'file'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileUp className="w-4 h-4 shrink-0" />
              <span>{t.tabs.file}</span>
            </button>

            <button
              id="tab-guide"
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>{t.tabs.guide}</span>
            </button>

            <button
              id="tab-inspector"
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                activeTab === 'inspector'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              <span>{t.tabs.inspector}</span>
            </button>

            <button
              id="tab-matrix"
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
                activeTab === 'matrix'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Grid className="w-4 h-4 shrink-0" />
              <span>{t.tabs.matrix}</span>
            </button>
          </nav>
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'text' && (
            <TextEncryptor
              lang={lang}
              sharedKey={sharedKey}
              onUpdateSharedKey={setSharedKey}
              onOpenKeyGen={() => setIsKeyGenOpen(true)}
              onInspectCiphertext={handleInspectCiphertext}
              iterations={iterations}
              onAddHistory={handleAddHistory}
            />
          )}

          {activeTab === 'file' && (
            <Suspense fallback={<TabLoadingFallback lang={lang} />}>
              <FileEncryptor
                lang={lang}
                sharedKey={sharedKey}
                onUpdateSharedKey={setSharedKey}
                onOpenKeyGen={() => setIsKeyGenOpen(true)}
                iterations={iterations}
                onAddHistory={handleAddHistory}
              />
            </Suspense>
          )}

          {activeTab === 'guide' && (
            <UsageGuide
              lang={lang}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenKeyGen={() => setIsKeyGenOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'inspector' && (
            <Suspense fallback={<TabLoadingFallback lang={lang} />}>
              <EnvelopeInspector lang={lang} initialCiphertext={inspectorPayload} />
            </Suspense>
          )}

          {activeTab === 'matrix' && (
            <Suspense fallback={<TabLoadingFallback lang={lang} />}>
              <RepTableVisualizer lang={lang} sharedKey={sharedKey} />
            </Suspense>
          )}
        </div>
      </main>

      {/* Modals & Drawers */}
      <Suspense fallback={null}>
        {isKeyGenOpen && (
          <KeyGeneratorModal
            isOpen={isKeyGenOpen}
            onClose={() => setIsKeyGenOpen(false)}
            lang={lang}
            onApplyKey={handleApplyKey}
          />
        )}

        {isSettingsOpen && (
          <SecuritySettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            lang={lang}
            currentIterations={iterations}
            onSaveIterations={setIterations}
          />
        )}

        {isHistoryOpen && (
          <HistoryDrawer
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            lang={lang}
            history={history}
            onClearHistory={() => setHistory([])}
          />
        )}
      </Suspense>

      {/* Compact Footer */}
      <footer className="border-t border-slate-800 bg-[#090d16] py-5 px-4 text-center mb-14 sm:mb-0">
        <div className="max-w-7xl mx-auto space-y-1.5 text-[11px] sm:text-xs font-mono text-slate-400">
          <p>{t.footer.spec}</p>
          <p className="text-emerald-400/90">{t.footer.privacy}</p>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav lang={lang} activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

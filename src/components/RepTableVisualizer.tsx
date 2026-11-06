import React, { useState, useEffect } from 'react';
import { Grid, Search, Key, ChevronDown, ChevronUp } from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';
import { deriveKeys, buildRepresentationTable, utf8ToBytes } from '../lib/cipher';

interface RepTableVisualizerProps {
  lang: AppLanguage;
  sharedKey: string;
}

export const RepTableVisualizer: React.FC<RepTableVisualizerProps> = ({
  lang,
  sharedKey,
}) => {
  const t = translations[lang];

  const [testPassword, setTestPassword] = useState<string>(sharedKey || 'secret_key_demo');
  const [debouncedPassword, setDebouncedPassword] = useState<string>(
    sharedKey || 'secret_key_demo'
  );
  const [selectedByte, setSelectedByte] = useState<number>(65); // 'A'
  const [inputChar, setInputChar] = useState<string>('A');
  const [codesForByte, setCodesForByte] = useState<number[]>([]);
  const [showAllCodes, setShowAllCodes] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchCodeInput, setSearchCodeInput] = useState<string>('');
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    byte?: number;
    char?: string;
  } | null>(null);

  useEffect(() => {
    if (sharedKey) {
      setTestPassword(sharedKey);
    }
  }, [sharedKey]);

  // Debounce key input by 250ms to prevent unnecessary work while typing on mobile
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPassword(testPassword);
    }, 250);
    return () => clearTimeout(timer);
  }, [testPassword]);

  useEffect(() => {
    let isCancelled = false;

    async function loadTable() {
      if (!debouncedPassword) return;
      setLoading(true);
      try {
        const previewSalt = utf8ToBytes('rep500_preview_salt_demo');
        const { tableKeyBits } = await deriveKeys(debouncedPassword, previewSalt, 10_000);
        const table = await buildRepresentationTable(tableKeyBits);

        if (!isCancelled) {
          setCodesForByte(table.encodeTable[selectedByte] || []);
        }
      } catch (e) {
        console.error('Failed to build preview table', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    loadTable();
    return () => {
      isCancelled = true;
    };
  }, [debouncedPassword, selectedByte]);

  const handleCharChange = (val: string) => {
    setInputChar(val);
    if (val.length > 0) {
      const code = val.charCodeAt(0);
      if (code >= 0 && code <= 255) {
        setSelectedByte(code);
      }
    }
  };

  const handleSearchCode = async () => {
    if (!searchCodeInput.trim() || !debouncedPassword) return;
    const num = Number(searchCodeInput.trim());
    if (Number.isNaN(num)) {
      setSearchResult({ found: false });
      return;
    }

    try {
      const previewSalt = utf8ToBytes('rep500_preview_salt_demo');
      const { tableKeyBits } = await deriveKeys(debouncedPassword, previewSalt, 10_000);
      const table = await buildRepresentationTable(tableKeyBits);

      const byteValue = table.decodeMap.get(num);
      if (byteValue !== undefined) {
        const char =
          byteValue >= 32 && byteValue <= 126
            ? String.fromCharCode(byteValue)
            : 'Non-printable';
        setSearchResult({ found: true, byte: byteValue, char });
      } else {
        setSearchResult({ found: false });
      }
    } catch {
      setSearchResult({ found: false });
    }
  };

  const displayedCodes = showAllCodes ? codesForByte : codesForByte.slice(0, 100);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Overview & Controls */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {t.matrixModule.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{t.matrixModule.desc}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="text-sm sm:text-base font-bold font-mono text-amber-400">256</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'ar' ? 'قيم البايت' : 'Byte Values'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="text-sm sm:text-base font-bold font-mono text-cyan-400">500</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'ar' ? 'كود لكل بايت' : 'Codes / Byte'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="text-sm sm:text-base font-bold font-mono text-emerald-400">
              128,000
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'ar' ? 'إجمالي الأكواد' : 'Unique Codes'}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#090d16] border border-slate-800">
            <div className="text-sm sm:text-base font-bold font-mono text-slate-200">11</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'ar' ? 'رقماً لكل كود' : 'Digits / Code'}
            </div>
          </div>
        </div>

        {/* Key & Byte Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {lang === 'ar'
                  ? 'مفتاح اشتقاق المصفوفة:'
                  : 'Key used to derive permutation:'}
              </span>
            </label>
            <input
              type="text"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              placeholder="Enter key..."
              className="w-full min-h-[42px] bg-[#090d16] border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-base sm:text-xs font-mono text-slate-100 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              {t.matrixModule.testByte}:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={1}
                value={inputChar}
                onChange={(e) => handleCharChange(e.target.value)}
                placeholder="A"
                className="w-14 min-h-[42px] bg-[#090d16] border border-slate-800 focus:border-amber-500 rounded-xl px-2 py-2 text-base sm:text-xs font-mono text-center font-bold text-amber-400 focus:outline-none"
              />
              <input
                type="number"
                min={0}
                max={255}
                value={selectedByte}
                onChange={(e) => {
                  const num = Number(e.target.value);
                  if (num >= 0 && num <= 255) {
                    setSelectedByte(num);
                    setInputChar(String.fromCharCode(num));
                  }
                }}
                className="flex-1 min-w-0 min-h-[42px] bg-[#090d16] border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-base sm:text-xs font-mono text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Representations Display (Lightweight sliced DOM by default) */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {t.matrixModule.repSlotsForByte}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold border border-amber-500/25">
              Byte {selectedByte} (0x{selectedByte.toString(16).padStart(2, '0').toUpperCase()})
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {displayedCodes.length} / {codesForByte.length}
          </span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs font-mono text-amber-300">
            {t.common.working}
          </div>
        ) : (
          <>
            <div className="max-h-72 overflow-y-auto p-3 rounded-xl bg-[#090d16] border border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 font-mono text-[11px]">
              {displayedCodes.map((code, idx) => (
                <div
                  key={idx}
                  className="p-1.5 rounded bg-[#111726] border border-slate-800 text-amber-200 flex items-center justify-between gap-1"
                >
                  <span className="text-slate-500 text-[10px]">#{idx + 1}</span>
                  <span className="font-semibold">{code}</span>
                </div>
              ))}
            </div>

            {codesForByte.length > 100 && (
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setShowAllCodes((prev) => !prev)}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  {showAllCodes ? (
                    <>
                      <ChevronUp className="w-4 h-4 text-amber-400" />
                      <span>
                        {lang === 'ar' ? 'عرض أول 100 كود فقط (أخف)' : 'Show first 100 only'}
                      </span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-amber-400" />
                      <span>
                        {lang === 'ar'
                          ? 'عرض جميع الأكواد الـ 500'
                          : 'Show all 500 codes'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reverse Lookup Test Tool */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-3">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            {lang === 'ar' ? 'اختبار فك الشفرة العكسي للكود' : 'Reverse Code Lookup'}
          </span>
        </h4>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            inputMode="numeric"
            value={searchCodeInput}
            onChange={(e) => setSearchCodeInput(e.target.value)}
            placeholder="10000045231"
            className="flex-1 min-h-[44px] bg-[#090d16] border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-base sm:text-xs font-mono text-slate-100 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearchCode}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0"
          >
            {lang === 'ar' ? 'فحص الكود' : 'Lookup'}
          </button>
        </div>

        {searchResult && (
          <div>
            {searchResult.found ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
                <span>
                  Byte <strong>{searchResult.byte}</strong> (0x
                  {searchResult.byte?.toString(16).padStart(2, '0').toUpperCase()})
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 font-bold">
                  Char: &apos;{searchResult.char}&apos;
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-mono">
                {lang === 'ar'
                  ? 'الكود غير موجود ضمن النطاق أو لا يطابق هذا المفتاح.'
                  : 'Code not found in valid range for this key.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

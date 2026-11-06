import React, { useState, useEffect } from 'react';
import {
  Search,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { AppLanguage } from '../types';
import { translations } from '../lib/i18n';
import { inspectEnvelope, base64ToBytes, toHex, LEGACY_PBKDF2_ITERATIONS } from '../lib/cipher';
import { formatBytes } from '../lib/utils';

interface EnvelopeInspectorProps {
  lang: AppLanguage;
  initialCiphertext?: string;
}

export const EnvelopeInspector: React.FC<EnvelopeInspectorProps> = ({
  lang,
  initialCiphertext = '',
}) => {
  const t = translations[lang];
  const [inputCiphertext, setInputCiphertext] = useState<string>(initialCiphertext);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    if (initialCiphertext) {
      setInputCiphertext(initialCiphertext);
    }
  }, [initialCiphertext]);

  const inspection = inspectEnvelope(inputCiphertext);

  let saltHex = '';
  let ivHex = '';
  const sampleCodes: string[] = [];

  if (inspection.valid && inspection.envelope) {
    try {
      saltHex = toHex(base64ToBytes(inspection.envelope.salt));
      ivHex = toHex(base64ToBytes(inspection.envelope.iv));
    } catch {}

    const data = inspection.envelope.data || '';
    for (let i = 0; i < Math.min(data.length, 110); i += 11) {
      sampleCodes.push(data.slice(i, i + 11));
    }
  }

  const handleCopyJson = async () => {
    if (!inspection.rawJson) return;
    await navigator.clipboard.writeText(inspection.rawJson);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header & Input */}
      <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-slate-800">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-100">
              {t.inspectorModule.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {t.inspectorModule.desc}
            </p>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputCiphertext}
          onChange={(e) => setInputCiphertext(e.target.value)}
          placeholder={t.inspectorModule.inputPlaceholder}
          className="w-full bg-[#090d16] border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-base sm:text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors font-mono resize-y"
        />

        {inputCiphertext.trim() && (
          <div>
            {inspection.valid && inspection.envelope ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{t.inspectorModule.validEnvelope}</span>
                </div>
                <span className="font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {inspection.envelope.alg}
                </span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{inspection.error || t.inspectorModule.invalidEnvelope}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Envelope Details Breakdown */}
      {inspection.valid && inspection.envelope && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Metadata & Crypto Tokens */}
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 min-w-0">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                {lang === 'ar' ? 'معاملات المظروف المشفر' : 'Envelope Parameters'}
              </span>
            </h4>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between items-center gap-2">
                <span className="text-slate-400">{t.inspectorModule.version}:</span>
                <span className="font-bold text-cyan-300">v{inspection.envelope.v}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between items-center gap-2">
                <span className="text-slate-400">{t.inspectorModule.algorithm}:</span>
                <span className="font-bold text-amber-300 text-end">
                  {inspection.envelope.alg}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 flex justify-between items-center gap-2">
                <span className="text-slate-400">{t.common.iterations}:</span>
                <span className="font-bold text-slate-100">
                  {(inspection.envelope.iter || LEGACY_PBKDF2_ITERATIONS).toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 space-y-1">
                <div className="flex flex-wrap justify-between gap-1 text-slate-400">
                  <span>{t.inspectorModule.saltBase64}:</span>
                  <span className="text-slate-200 break-all">{inspection.envelope.salt}</span>
                </div>
                <div className="text-[11px] text-slate-500 break-all select-all">
                  0x{saltHex}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 space-y-1">
                <div className="flex flex-wrap justify-between gap-1 text-slate-400">
                  <span>{t.inspectorModule.ivBase64}:</span>
                  <span className="text-slate-200 break-all">{inspection.envelope.iv}</span>
                </div>
                <div className="text-[11px] text-slate-500 break-all select-all">0x{ivHex}</div>
              </div>

              {inspection.envelope.type === 'file' && (
                <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800 space-y-1 text-slate-300">
                  <div className="flex flex-wrap justify-between gap-1">
                    <span className="text-slate-400">{t.fileModule.originalName}:</span>
                    <span className="font-bold text-amber-300 break-all">
                      {inspection.envelope.filename}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-between gap-1 text-[11px] text-slate-500">
                    <span>{t.fileModule.mimeType}:</span>
                    <span className="break-all">{inspection.envelope.mime}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* REP500 Stream Analysis */}
          <div className="bg-[#111726] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 min-w-0">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
              <Database className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {lang === 'ar' ? 'تحليل تمثيل REP500' : 'REP500 Stream Metrics'}
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <div className="text-base sm:text-lg font-bold font-mono text-amber-400">
                  {inspection.stats?.codesCount.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {t.inspectorModule.tokenCount}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800">
                <div className="text-base sm:text-lg font-bold font-mono text-cyan-400">
                  {inspection.stats ? formatBytes(inspection.stats.rawSize) : '0'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Base64</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold block">
                {lang === 'ar'
                  ? 'عينة من الأكواد الـ 11 رقماً المشفرة:'
                  : 'Sample 11-digit REP Codes:'}
              </label>
              <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-[#090d16] border border-slate-800 max-h-36 overflow-y-auto font-mono text-xs text-amber-300">
                {sampleCodes.map((code, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 rounded bg-[#111726] border border-slate-800 text-[11px]"
                  >
                    #{idx + 1}: {code}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyJson}
                className="w-full sm:w-auto min-h-[42px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedJson ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>
                  {copiedJson
                    ? t.common.copied
                    : lang === 'ar'
                    ? 'نسخ بيانات JSON للمظروف'
                    : 'Copy JSON Envelope'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

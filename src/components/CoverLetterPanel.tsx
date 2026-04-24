'use client';
import { useState } from 'react';
import type { ResumeOutput } from '../lib/types';

interface Props {
  coverLetter: string; resume: ResumeOutput | null;
  jobDesc: string; setJobDesc: (v: string) => void;
  companyName: string; setCompanyName: (v: string) => void;
  hiringManager: string; setHiringManager: (v: string) => void;
  onGenerate: () => void; loading: boolean; dark: boolean;
}

export default function CoverLetterPanel({ coverLetter, resume, jobDesc, setJobDesc, companyName, setCompanyName, hiringManager, setHiringManager, onGenerate, loading, dark: D }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = () => { navigator.clipboard.writeText(coverLetter); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const inp = `w-full border rounded-lg px-3 py-2 text-sm outline-none transition ${D ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-teal-400' : 'bg-white border-gray-200 text-gray-900 focus:border-teal-400'}`;
  const card = `${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-4`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={card}>
        <p className={`text-xs font-medium mb-3 ${D ? 'text-gray-400' : 'text-gray-500'}`}>Customize your cover letter</p>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className={`text-xs mb-1 block ${D ? 'text-gray-400' : 'text-gray-400'}`}>Company name</label>
            <input className={inp} placeholder="Google" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className={`text-xs mb-1 block ${D ? 'text-gray-400' : 'text-gray-400'}`}>Hiring manager</label>
            <input className={inp} placeholder="Sarah Johnson" value={hiringManager} onChange={e => setHiringManager(e.target.value)} />
          </div>
        </div>
        <label className={`text-xs mb-1 block ${D ? 'text-gray-400' : 'text-gray-400'}`}>Job description (paste for a tailored letter)</label>
        <textarea className={inp + ' resize-y'} rows={3} placeholder="Paste the job description here…" value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
        <button onClick={onGenerate} disabled={loading || !resume}
          className="mt-3 w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm rounded-xl transition flex items-center justify-center gap-2">
          {loading ? <><Spin /> Writing…</> : '✦ Generate / Regenerate cover letter'}
        </button>
      </div>

      {coverLetter && (
        <div className={`${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-8`}>
          <div className="flex justify-between items-center mb-5">
            <p className={`text-xs font-medium uppercase tracking-wide ${D ? 'text-gray-400' : 'text-gray-400'}`}>Cover Letter</p>
            <button onClick={copy} className={`text-xs px-3 py-1.5 border rounded-lg transition ${D ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className={`text-sm whitespace-pre-wrap leading-relaxed ${D ? 'text-gray-200' : 'text-gray-700'}`} style={{ fontFamily: 'Georgia, serif' }}>
            {coverLetter}
          </div>
        </div>
      )}

      {!coverLetter && (
        <div className={`text-center py-16 text-sm ${D ? 'text-gray-500' : 'text-gray-400'}`}>
          Fill in the fields above and click Generate to create your cover letter.
        </div>
      )}
    </div>
  );
}

function Spin() {
  return <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

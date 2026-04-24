'use client';
import { useState } from 'react';
import type { ResumeOutput } from '../lib/types';

interface ATSResult {
  overallScore: number;
  breakdown: Record<string, { score: number; feedback: string }>;
  missingKeywords: string[];
  topSuggestions: string[];
}

export default function ATSScorePanel({ resume, dark: D }: { resume: ResumeOutput | null; dark: boolean }) {
  const [jobDesc, setJobDesc] = useState('');
  const [result,  setResult]  = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const analyze = async () => {
    if (!resume) { setError('Generate your resume first.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/ats-score', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({resume,jobDescription:jobDesc}) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch(e:unknown) { setError(e instanceof Error ? e.message : 'Analysis failed.'); }
    finally { setLoading(false); }
  };

  const sc = (s:number) => s>=80?'text-green-500':s>=60?'text-amber-500':'text-red-500';
  const bar= (s:number) => s>=80?'bg-green-400':s>=60?'bg-amber-400':'bg-red-400';
  const labels: Record<string,string> = { formatting:'Formatting', keywords:'Keywords', quantification:'Quantification', summaryStrength:'Summary Strength', skillsMatch:'Skills Match' };
  const card = `${D?'bg-gray-800 border-gray-700':'bg-white border-gray-100'} border rounded-xl`;
  const inp  = `w-full border rounded-lg px-3 py-2 text-sm outline-none transition resize-y ${D?'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-teal-400':'bg-white border-gray-200 focus:border-teal-400'}`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`${card} p-4 space-y-3`}>
        <p className={`text-xs font-medium ${D?'text-gray-400':'text-gray-500'}`}>Paste a job description for a tailored score (optional)</p>
        <textarea className={inp} rows={3} placeholder="Paste job description here…" value={jobDesc} onChange={e=>setJobDesc(e.target.value)}/>
        <button onClick={analyze} disabled={loading||!resume}
          className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm rounded-xl transition flex items-center justify-center gap-2">
          {loading?<><Spin/> Analyzing…</>:'⚡ Analyze ATS Score'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
        {!resume && <p className={`text-xs text-center ${D?'text-gray-500':'text-gray-400'}`}>Generate your resume first to unlock ATS analysis.</p>}
      </div>

      {result && <>
        {/* Overall */}
        <div className={`${card} p-6 flex items-center gap-6`}>
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke={D?'#374151':'#e5e7eb'} strokeWidth="3"/>
              <circle cx="18" cy="18" r="15.9" fill="none"
                stroke={result.overallScore>=80?'#4ade80':result.overallScore>=60?'#fbbf24':'#f87171'}
                strokeWidth="3" strokeDasharray={`${result.overallScore} 100`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-lg font-bold ${sc(result.overallScore)}`}>{result.overallScore}</span>
            </div>
          </div>
          <div>
            <p className={`text-sm font-semibold ${D?'text-gray-200':'text-gray-800'}`}>ATS Score</p>
            <p className={`text-xs mt-1 ${D?'text-gray-400':'text-gray-400'}`}>
              {result.overallScore>=80?'Great! Your resume is well-optimized.':result.overallScore>=60?'Good start — a few improvements needed.':'Needs work — follow the suggestions below.'}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className={`${card} p-5 space-y-4`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${D?'text-gray-400':'text-gray-500'}`}>Score Breakdown</p>
          {Object.entries(result.breakdown).map(([k,v])=>(
            <div key={k}>
              <div className="flex justify-between text-xs mb-1">
                <span className={D?'text-gray-300':'text-gray-600'}>{labels[k]||k}</span>
                <span className={`font-semibold ${sc(v.score)}`}>{v.score}/100</span>
              </div>
              <div className={`h-1.5 rounded-full overflow-hidden mb-1 ${D?'bg-gray-700':'bg-gray-100'}`}>
                <div className={`h-full rounded-full ${bar(v.score)} transition-all duration-700`} style={{width:`${v.score}%`}}/>
              </div>
              <p className={`text-xs ${D?'text-gray-400':'text-gray-400'}`}>{v.feedback}</p>
            </div>
          ))}
        </div>

        {/* Missing keywords */}
        {result.missingKeywords?.length>0 && (
          <div className={`rounded-xl border p-4 ${D?'bg-amber-900/20 border-amber-700':'bg-amber-50 border-amber-100'}`}>
            <p className={`text-xs font-semibold mb-2 ${D?'text-amber-400':'text-amber-700'}`}>Missing Keywords</p>
            <div className="flex flex-wrap gap-2">
              {result.missingKeywords.map((kw,i)=>(
                <span key={i} className={`text-xs rounded-full px-2.5 py-0.5 ${D?'bg-amber-800/50 text-amber-300':'bg-amber-100 text-amber-700'}`}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {result.topSuggestions?.length>0 && (
          <div className={`${card} p-4`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${D?'text-gray-400':'text-gray-500'}`}>Top Suggestions</p>
            <ul className="space-y-2">
              {result.topSuggestions.map((s,i)=>(
                <li key={i} className={`flex gap-2 text-sm ${D?'text-gray-300':'text-gray-600'}`}>
                  <span className="text-teal-500 font-bold flex-shrink-0">→</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>}
    </div>
  );
}

function Spin() {
  return <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>;
}

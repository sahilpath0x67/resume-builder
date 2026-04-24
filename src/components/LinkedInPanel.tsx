'use client';
import { useState } from 'react';
import type { ResumeOutput } from '../lib/types';

export default function LinkedInPanel({ resume, dark: D }: { resume: ResumeOutput | null; dark: boolean }) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [error,   setError]   = useState('');

  const generate = async () => {
    if (!resume) { setError('Generate your resume first.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/linkedin-summary', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({resume}) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setText(data.linkedin);
    } catch(e:unknown) { setError(e instanceof Error ? e.message : 'Failed.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const card = `${D?'bg-gray-800 border-gray-700':'bg-white border-gray-100'} border rounded-xl`;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className={`${card} p-5`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </div>
          <div>
            <p className={`text-sm font-semibold ${D?'text-gray-200':'text-gray-800'}`}>LinkedIn About Section</p>
            <p className={`text-xs ${D?'text-gray-400':'text-gray-400'}`}>AI-written, first-person, ready to paste</p>
          </div>
        </div>
        <button onClick={generate} disabled={loading||!resume}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-xl transition flex items-center justify-center gap-2">
          {loading?<><Spin/> Writing…</>:'✦ Generate LinkedIn About'}
        </button>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        {!resume && <p className={`text-xs text-center mt-2 ${D?'text-gray-500':'text-gray-400'}`}>Generate your resume first to unlock this feature.</p>}
      </div>

      {text && (
        <div className={`${card} p-6`}>
          <div className="flex justify-between items-center mb-4">
            <p className={`text-xs font-semibold uppercase tracking-wide ${D?'text-gray-400':'text-gray-400'}`}>Your LinkedIn About</p>
            <button onClick={copy} className={`text-xs px-3 py-1.5 border rounded-lg transition ${D?'border-gray-600 text-gray-300 hover:bg-gray-700':'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {copied?'✓ Copied':'Copy'}
            </button>
          </div>
          <div className={`text-sm whitespace-pre-wrap leading-relaxed rounded-lg p-4 border ${D?'bg-gray-700 border-gray-600 text-gray-200':'bg-gray-50 border-gray-100 text-gray-700'}`}>
            {text}
          </div>
          <p className={`text-xs mt-3 ${D?'text-gray-500':'text-gray-400'}`}>Tip: LinkedIn → Edit profile → About → paste this in.</p>
        </div>
      )}
    </div>
  );
}

function Spin() {
  return <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>;
}

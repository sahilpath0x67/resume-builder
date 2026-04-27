'use client';

import { useState, useEffect } from 'react';
import type { FormData, ResumeOutput, Experience, Education } from '../lib/types';
import { downloadPDF, downloadHTML, copyAsText } from '../lib/exportUtils';
import ResumePreview from '../components/ResumePreview';
import CoverLetterPanel from '../components/CoverLetterPanel';
import ATSScorePanel from '../components/ATSScorePanel';
import LinkedInPanel from '../components/LinkedInPanel';

const EMPTY_EXP = (): Experience => ({ company: '', role: '', start: '', end: '', desc: '' });
const EMPTY_EDU = (): Education => ({ institution: '', degree: '', start: '', end: '' });

const LEFT_TABS = ['Basics', 'Experience', 'Education', 'Skills'];
const RIGHT_PANELS = [
  { id: 'preview', label: '📄 Preview' },
  { id: 'cover', label: '✉ Cover Letter' },
  { id: 'ats', label: '⚡ ATS Score' },
  { id: 'linkedin', label: '🔗 LinkedIn' },
] as const;
type RightPanel = (typeof RIGHT_PANELS)[number]['id'];

export default function Home() {
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');
  const [form, setForm] = useState<FormData>({
    name: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '',
    summary: '', skills: '', achievements: '',
    experience: [EMPTY_EXP()], education: [EMPTY_EDU()],
  });
  const [resume, setResume] = useState<ResumeOutput | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'ok' | 'err'>('ok');
  const [jobDesc, setJobDesc] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [hiringMgr, setHiringMgr] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  // Apply dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const setF = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const upExp = (i: number, k: keyof Experience, v: string) =>
    setForm(f => { const e = [...f.experience]; e[i] = { ...e[i], [k]: v }; return { ...f, experience: e }; });
  const upEdu = (i: number, k: keyof Education, v: string) =>
    setForm(f => { const e = [...f.education]; e[i] = { ...e[i], [k]: v }; return { ...f, education: e }; });
  const addExp = () => setForm(f => ({ ...f, experience: [...f.experience, EMPTY_EXP()] }));
  const delExp = (i: number) => setForm(f => ({ ...f, experience: f.experience.filter((_, x) => x !== i) }));
  const addEdu = () => setForm(f => ({ ...f, education: [...f.education, EMPTY_EDU()] }));
  const delEdu = (i: number) => setForm(f => ({ ...f, education: f.education.filter((_, x) => x !== i) }));

  const generateResume = async () => {
    if (!form.name && !form.jobTitle) { setStatus('Please fill in your name and job title.'); setStatusType('err'); return; }
    setLoading(true); setStatus('AI is crafting your resume…'); setStatusType('ok');
    try {
      const res = await fetch('/api/generate-resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResume(data.resume); setStatus('Resume generated! ✓'); setRightPanel('preview');
    } catch (e: unknown) { setStatus(e instanceof Error ? e.message : 'Something went wrong.'); setStatusType('err'); }
    finally { setLoading(false); }
  };

  const generateCoverLetter = async () => {
    if (!resume) { setStatus('Generate your resume first.'); setStatusType('err'); return; }
    setCoverLoading(true);
    try {
      const res = await fetch('/api/generate-cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume, jobDescription: jobDesc, companyName, hiringManager: hiringMgr }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCoverLetter(data.coverLetter); setRightPanel('cover');
    } catch { setStatus('Cover letter failed.'); setStatusType('err'); }
    finally { setCoverLoading(false); }
  };

  const handleCopy = () => {
    if (!resume) return;
    navigator.clipboard.writeText(copyAsText(resume));
    setCopyDone(true); setTimeout(() => setCopyDone(false), 2000);
  };

  // ---------- style helpers ----------
  const D = dark;
  const card = `${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl`;
  const inp = `w-full border rounded-lg px-3 py-2 text-sm outline-none transition
    ${D ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:border-teal-400' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'}`;
  const ta = inp + ' resize-y';
  const panel = `${D ? 'bg-gray-900' : 'bg-gray-50'} border-r ${D ? 'border-gray-700' : 'border-gray-200'}`;
  const lbl = `text-xs font-medium mt-2 mb-1 ${D ? 'text-gray-400' : 'text-gray-400'}`;
  const tabBtn = (active: boolean) => `px-3 py-1.5 text-xs font-medium rounded-lg transition ${active ? 'bg-teal-500 text-white' : D ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`;

  return (
    <div className={`min-h-screen flex flex-col ${D ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>

      {/* ── HEADER ── */}
      <header className={`flex items-center gap-3 px-5 py-2.5 border-b ${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} no-print z-10`}>
        <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm select-none">R</div>
        <span className={`font-semibold text-sm ${D ? 'text-gray-100' : 'text-gray-900'}`}>AI Resume Builder</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Dark / Light toggle */}
          <button onClick={() => setDark(d => !d)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition
              ${D ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}`}>
            {D ? '☀ Light mode' : '🌙 Dark mode'}
          </button>
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
            className={`text-xs px-3 py-1.5 rounded-lg border transition
           ${D ? 'border-teal-600 text-teal-400 hover:bg-teal-900' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>
            Get Gemini API Key ↗
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 53px)' }}>

        {/* ── LEFT ── */}
        <div className={`w-[400px] min-w-[320px] flex flex-col no-print ${panel}`}>

          {/* Left tabs */}
          <div className={`flex px-3 pt-3 gap-0.5 border-b ${D ? 'border-gray-700' : 'border-gray-100'}`}>
            {LEFT_TABS.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} className={tabBtn(activeTab === i)}>{t}</button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1">

            {/* BASICS */}
            {activeTab === 0 && <>
              <p className={lbl}>Full name *</p>
              <input className={inp} placeholder="Jane Smith" value={form.name} onChange={e => setF('name', e.target.value)} />
              <p className={lbl}>Job title *</p>
              <input className={inp} placeholder="Senior Product Manager" value={form.jobTitle} onChange={e => setF('jobTitle', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <div><p className={lbl}>Email</p><input className={inp} placeholder="jane@email.com" value={form.email} onChange={e => setF('email', e.target.value)} /></div>
                <div><p className={lbl}>Phone</p><input className={inp} placeholder="+91 98765 43210" value={form.phone} onChange={e => setF('phone', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><p className={lbl}>Location</p><input className={inp} placeholder="Mumbai, India" value={form.location} onChange={e => setF('location', e.target.value)} /></div>
                <div><p className={lbl}>LinkedIn / Portfolio</p><input className={inp} placeholder="linkedin.com/in/jane" value={form.linkedin} onChange={e => setF('linkedin', e.target.value)} /></div>
              </div>
              <p className={lbl}>Summary (optional — AI will write one)</p>
              <textarea className={ta} rows={3} placeholder="Paste an existing summary or leave blank…" value={form.summary} onChange={e => setF('summary', e.target.value)} />
            </>}

            {/* EXPERIENCE */}
            {activeTab === 1 && <>
              {form.experience.map((exp, i) => (
                <div key={i} className={`${card} p-3 mb-3 space-y-2`}>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="Company" value={exp.company} onChange={e => upExp(i, 'company', e.target.value)} />
                    <input className={inp} placeholder="Your role / title" value={exp.role} onChange={e => upExp(i, 'role', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="Start (e.g. Jan 2021)" value={exp.start} onChange={e => upExp(i, 'start', e.target.value)} />
                    <input className={inp} placeholder="End (or Present)" value={exp.end} onChange={e => upExp(i, 'end', e.target.value)} />
                  </div>
                  <textarea className={ta} rows={2} placeholder="Key achievements / responsibilities…" value={exp.desc} onChange={e => upExp(i, 'desc', e.target.value)} />
                  {form.experience.length > 1 && <button onClick={() => delExp(i)} className="text-xs text-red-400 hover:text-red-500">Remove</button>}
                </div>
              ))}
              <button onClick={addExp} className={`text-sm border rounded-lg px-3 py-1.5 transition ${D ? 'border-teal-600 text-teal-400 hover:bg-teal-900' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>+ Add position</button>
            </>}

            {/* EDUCATION */}
            {activeTab === 2 && <>
              {form.education.map((edu, i) => (
                <div key={i} className={`${card} p-3 mb-3 space-y-2`}>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="Institution" value={edu.institution} onChange={e => upEdu(i, 'institution', e.target.value)} />
                    <input className={inp} placeholder="Degree / Field" value={edu.degree} onChange={e => upEdu(i, 'degree', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inp} placeholder="Start year" value={edu.start} onChange={e => upEdu(i, 'start', e.target.value)} />
                    <input className={inp} placeholder="End year" value={edu.end} onChange={e => upEdu(i, 'end', e.target.value)} />
                  </div>
                  {form.education.length > 1 && <button onClick={() => delEdu(i)} className="text-xs text-red-400 hover:text-red-500">Remove</button>}
                </div>
              ))}
              <button onClick={addEdu} className={`text-sm border rounded-lg px-3 py-1.5 transition ${D ? 'border-teal-600 text-teal-400 hover:bg-teal-900' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>+ Add education</button>
            </>}

            {/* SKILLS */}
            {activeTab === 3 && <>
              <p className={lbl}>Skills (comma-separated)</p>
              <textarea className={ta} rows={3} placeholder="Python, SQL, Figma, Leadership…" value={form.skills} onChange={e => setF('skills', e.target.value)} />
              <p className={lbl}>Achievements / Certifications</p>
              <textarea className={ta} rows={3} placeholder="AWS Certified, built a product used by 50k users…" value={form.achievements} onChange={e => setF('achievements', e.target.value)} />
            </>}

          </div>

          {/* Bottom buttons */}
          <div className={`p-4 border-t ${D ? 'border-gray-700' : 'border-gray-100'} space-y-2`}>
            <button onClick={generateResume} disabled={loading}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition flex items-center justify-center gap-2">
              {loading ? <><Spin light /> Generating resume…</> : '✦ Generate resume with AI'}
            </button>
            <button onClick={generateCoverLetter} disabled={coverLoading || !resume}
              className={`w-full py-2 text-sm rounded-xl border disabled:opacity-40 transition flex items-center justify-center gap-2
                ${D ? 'border-teal-600 text-teal-400 hover:bg-teal-900' : 'border-teal-200 text-teal-600 hover:bg-teal-50'}`}>
              {coverLoading ? <><Spin /> Writing…</> : '✉ Generate cover letter'}
            </button>
            {status && <p className={`text-xs text-center ${statusType === 'err' ? 'text-red-400' : 'text-teal-500'}`}>{status}</p>}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${D ? 'bg-gray-900' : 'bg-gray-50'}`}>

          {/* Right panel tabs + export */}
          <div className={`flex items-center justify-between px-4 py-2.5 border-b no-print gap-2 flex-wrap ${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-1 flex-wrap">
              {RIGHT_PANELS.map(p => (
                <button key={p.id} onClick={() => setRightPanel(p.id)} className={tabBtn(rightPanel === p.id)}>{p.label}</button>
              ))}
            </div>

            {rightPanel === 'preview' && resume && (
              <div className="relative">
                <button onClick={() => setExportOpen(o => !o)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition">
                  ↓ Export ▾
                </button>
                {exportOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                    <div className={`absolute right-0 top-full mt-1 border rounded-xl shadow-lg z-20 overflow-hidden w-52 ${D ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      {[
                        { label: '↓ Download PDF', action: () => { downloadPDF('resume-output', `${resume.name}_resume.pdf`); setExportOpen(false); } },
                        { label: '↓ Download HTML/CSS', action: () => { downloadHTML(resume); setExportOpen(false); } },
                        { label: copyDone ? '✓ Copied!' : '📋 Copy as plain text', action: () => { handleCopy(); setExportOpen(false); } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action}
                          className={`w-full text-left px-4 py-2.5 text-xs border-b last:border-0 transition
                            ${D ? 'text-gray-300 hover:bg-gray-700 border-gray-700' : 'text-gray-700 hover:bg-gray-50 border-gray-50'}`}>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {rightPanel === 'preview' && (resume ? <ResumePreview resume={resume} dark={dark} /> : <EmptyState dark={dark} />)}
            {rightPanel === 'cover' && <CoverLetterPanel coverLetter={coverLetter} resume={resume} jobDesc={jobDesc} setJobDesc={setJobDesc} companyName={companyName} setCompanyName={setCompanyName} hiringManager={hiringMgr} setHiringManager={setHiringMgr} onGenerate={generateCoverLetter} loading={coverLoading} dark={dark} />}
            {rightPanel === 'ats' && <ATSScorePanel resume={resume} dark={dark} />}
            {rightPanel === 'linkedin' && <LinkedInPanel resume={resume} dark={dark} />}
          </div>
        </div>

      </div>
    </div>
  );
}

function Spin({ light }: { light?: boolean }) {
  return <span className={`inline-block w-3 h-3 border-2 rounded-full animate-spin flex-shrink-0 ${light ? 'border-white/30 border-t-white' : 'border-teal-200 border-t-teal-500'}`} />;
}

function EmptyState({ dark: D }: { dark: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
      <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="16" x2="12" y2="16" />
        </svg>
      </div>
      <div className="text-center">
        <p className={`text-sm font-medium ${D ? 'text-gray-300' : 'text-gray-600'}`}>Your resume will appear here</p>
        <p className={`text-xs mt-1 ${D ? 'text-gray-500' : 'text-gray-400'}`}>Fill in your details, then click<br /><span className="text-teal-500 font-medium">Generate resume with AI</span></p>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs max-w-xs">
        {['✦ AI-written bullets', '✉ Cover letter', '⚡ ATS score checker', '🔗 LinkedIn bio writer'].map(f => (
          <div key={f} className={`flex items-center gap-1.5 border rounded-lg px-3 py-2 ${D ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-500'}`}>{f}</div>
        ))}
      </div>
    </div>
  );
}

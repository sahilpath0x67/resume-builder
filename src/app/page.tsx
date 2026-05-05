'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/useAuth';
import { saveCV, deleteCV } from '../lib/userStore';
import type { SavedCV } from '../lib/userStore';
import type { FormData, ResumeOutput, Experience, Education } from '../lib/types';
import { downloadPDF, downloadHTML, copyAsText } from '../lib/exportUtils';
import ClassicTemplate  from '../components/templates/ClassicTemplate';
import ModernTemplate   from '../components/templates/ModernTemplate';
import MinimalTemplate  from '../components/templates/MinimalTemplate';
import ExecutiveTemplate from '../components/templates/ExecutiveTemplate';
import CreativeTemplate  from '../components/templates/CreativeTemplate';
import CompactTemplate   from '../components/templates/CompactTemplate';
import BoldTemplate      from '../components/templates/BoldTemplate';
import CoverLetterPanel from '../components/CoverLetterPanel';
import ATSScorePanel    from '../components/ATSScorePanel';
import LinkedInPanel    from '../components/LinkedInPanel';
import SavedCVsPanel    from '../components/SavedCVsPanel';

// ── helpers ──────────────────────────────────────────────────────────────────
function formToResume(form: FormData): ResumeOutput {
  return {
    name: form.name, title: form.jobTitle, email: form.email,
    phone: form.phone, location: form.location, linkedin: form.linkedin,
    summary: form.summary,
    experience: form.experience.filter(e => e.company || e.role).map(e => ({
      company: e.company, role: e.role,
      period: `${e.start}${e.end ? ` – ${e.end}` : ''}`,
      bullets: e.desc ? e.desc.split('\n').filter(Boolean) : [],
    })),
    education: form.education.filter(e => e.institution || e.degree).map(e => ({
      institution: e.institution, degree: e.degree,
      period: `${e.start}${e.end ? ` – ${e.end}` : ''}`,
    })),
    skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
    achievements: form.achievements ? form.achievements.split('\n').filter(Boolean) : [],
  };
}

const EMPTY_EXP = (): Experience => ({ company: '', role: '', start: '', end: '', desc: '' });
const EMPTY_EDU = (): Education => ({ institution: '', degree: '', start: '', end: '' });
const EMPTY_FORM = (): FormData => ({
  name: '', jobTitle: '', email: '', phone: '', location: '', linkedin: '',
  summary: '', skills: '', achievements: '',
  experience: [EMPTY_EXP()], education: [EMPTY_EDU()],
});

type TemplateId = 'classic' | 'modern' | 'minimal' | 'executive' | 'creative' | 'compact' | 'bold';
const TEMPLATES: { id: TemplateId; label: string; desc: string; color: string }[] = [
  { id: 'classic',   label: 'Classic',   desc: 'Traditional serif',     color: '#1D9E75' },
  { id: 'modern',    label: 'Modern',    desc: 'Two-column sidebar',    color: '#0F6E56' },
  { id: 'minimal',   label: 'Minimal',   desc: 'Clean centred',         color: '#6b7280' },
  { id: 'executive', label: 'Executive', desc: 'Navy & gold',           color: '#f59e0b' },
  { id: 'creative',  label: 'Creative',  desc: 'Purple timeline',       color: '#7c3aed' },
  { id: 'compact',   label: 'Compact',   desc: 'Two-column green',      color: '#059669' },
  { id: 'bold',      label: 'Bold',      desc: 'Dark header red accent', color: '#e11d48' },
];
const TEMPLATE_MAP = { classic: ClassicTemplate, modern: ModernTemplate, minimal: MinimalTemplate, executive: ExecutiveTemplate, creative: CreativeTemplate, compact: CompactTemplate, bold: BoldTemplate };

const LEFT_TABS   = ['Basics', 'Experience', 'Education', 'Skills'] as const;
const RIGHT_PANELS = [
  { id: 'preview',  label: 'Preview',      icon: '📄' },
  { id: 'saved',    label: 'My CVs',       icon: '💾' },
  { id: 'cover',    label: 'Cover Letter', icon: '✉'  },
  { id: 'ats',      label: 'ATS Score',    icon: '⚡' },
  { id: 'linkedin', label: 'LinkedIn',     icon: '🔗' },
] as const;
type RightPanel = (typeof RIGHT_PANELS)[number]['id'];

// ─────────────────────────────────────────────────────────────────────────────
export default function Home() {
  const [dark, setDark]             = useState(true);
  const [activeTab, setActiveTab]   = useState(0);
  const [rightPanel, setRightPanel] = useState<RightPanel>('preview');
  const [template, setTemplate]     = useState<TemplateId>('classic');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showUpgrade, setShowUpgrade]     = useState(false);
  const [showUserMenu, setShowUserMenu]   = useState(false);
  const [savingCV, setSavingCV]           = useState(false);

  const router = useRouter();
  // const { user, profile, isPro, refreshProfile } = useAuth(); (replaced with temporary override for testing)
  const { user, profile, isPro: _isPro, refreshProfile } = useAuth();
  const isPro = true; // temporary override for testing
  const [form, setForm] = useState<FormData>(() => {
    if (typeof window === 'undefined') return EMPTY_FORM();
    try { const s = localStorage.getItem('resume-form'); return s ? JSON.parse(s) : EMPTY_FORM(); }
    catch { return EMPTY_FORM(); }
  });

  const [resume, setResume] = useState<ResumeOutput | null>(() => {
    if (typeof window === 'undefined') return null;
    try { const s = localStorage.getItem('resume-output'); return s ? JSON.parse(s) : null; }
    catch { return null; }
  });

  const [coverLetter, setCoverLetter]   = useState('');
  const [loading, setLoading]           = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);
  const [status, setStatus]             = useState('');
  const [statusType, setStatusType]     = useState<'ok' | 'err'>('ok');
  const [jobDesc, setJobDesc]           = useState('');
  const [companyName, setCompanyName]   = useState('');
  const [hiringMgr, setHiringMgr]       = useState('');
  const [copyDone, setCopyDone]         = useState(false);
  const [exportOpen, setExportOpen]     = useState(false);

  useEffect(() => { if (resume) localStorage.setItem('resume-output', JSON.stringify(resume)); }, [resume]);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); document.body.style.background = dark ? '#111827' : '#f9fafb'; }, [dark]);
  useEffect(() => { localStorage.setItem('resume-form', JSON.stringify(form)); }, [form]);

  const setF   = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));
  const upExp  = (i: number, k: keyof Experience, v: string) => setForm(f => { const e = [...f.experience]; e[i] = { ...e[i], [k]: v }; return { ...f, experience: e }; });
  const upEdu  = (i: number, k: keyof Education,  v: string) => setForm(f => { const e = [...f.education];  e[i] = { ...e[i], [k]: v }; return { ...f, education:  e }; });
  const addExp = () => setForm(f => ({ ...f, experience: [...f.experience, EMPTY_EXP()] }));
  const delExp = (i: number) => setForm(f => ({ ...f, experience: f.experience.filter((_, x) => x !== i) }));
  const addEdu = () => setForm(f => ({ ...f, education: [...f.education, EMPTY_EDU()] }));
  const delEdu = (i: number) => setForm(f => ({ ...f, education: f.education.filter((_, x) => x !== i) }));

  const requirePro = (action: () => void) => { if (!isPro) { setShowUpgrade(true); return; } action(); };

  const generateResume = async () => {
    if (!form.name && !form.jobTitle) { setStatus('Please fill in your name and job title.'); setStatusType('err'); return; }
    setLoading(true); setStatus('AI is crafting your resume…'); setStatusType('ok');
    try {
      const res  = await fetch('/api/generate-resume', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResume(data.resume); setStatus('Resume generated! ✓'); setRightPanel('preview');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setStatus(msg.includes('429') || msg.includes('quota') ? 'Rate limit reached. Please wait and try again.' : 'Failed to generate. Please try again.');
      setStatusType('err');
    } finally { setLoading(false); }
  };

  const generateCoverLetter = async () => {
    if (!resume) { setStatus('Generate your resume first.'); setStatusType('err'); return; }
    setCoverLoading(true);
    try {
      const res  = await fetch('/api/generate-cover-letter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resume, jobDescription: jobDesc, companyName, hiringManager: hiringMgr }) });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setCoverLetter(data.coverLetter); setRightPanel('cover');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setStatus(msg.includes('429') || msg.includes('quota') ? 'Rate limit reached. Please wait and try again.' : 'Failed to generate cover letter.');
      setStatusType('err');
    } finally { setCoverLoading(false); }
  };

  const handleCopy = () => {
    if (!resume) return;
    navigator.clipboard.writeText(copyAsText(resume));
    setCopyDone(true); setTimeout(() => setCopyDone(false), 2000);
  };

  const clearAll = () => {
    localStorage.removeItem('resume-form'); localStorage.removeItem('resume-output');
    setForm(EMPTY_FORM()); setResume(null); setCoverLetter('');
  };

  // ── Saved CVs ─────────────────────────────────────────────────────────────
  const handleSaveCV = async (name: string) => {
    if (!user || !resume) return;
    setSavingCV(true);
    try {
      const cv: SavedCV = { id: Date.now().toString(), name, resume, coverLetter: coverLetter || undefined, updatedAt: Date.now() };
      await saveCV(user.uid, cv);
      await refreshProfile();
      setStatus('CV saved! ✓'); setStatusType('ok');
    } catch { setStatus('Failed to save CV.'); setStatusType('err'); }
    finally { setSavingCV(false); }
  };

  const handleDeleteCV = async (id: string) => {
    if (!user) return;
    try { await deleteCV(user.uid, id); await refreshProfile(); }
    catch { setStatus('Failed to delete CV.'); setStatusType('err'); }
  };

  const handleLoadCV = (cv: SavedCV) => {
    setResume(cv.resume);
    if (cv.coverLetter) setCoverLetter(cv.coverLetter);
    setRightPanel('preview');
    setStatus(`Loaded: ${cv.name}`); setStatusType('ok');
  };

  // ── Stripe checkout ───────────────────────────────────────────────────────
  const handleUpgrade = async () => {
    if (!user) { router.push('/auth'); return; }
    try {
      const res  = await fetch('/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ uid: user.uid, email: user.email }) });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { setStatus('Could not start checkout. Please try again.'); setStatusType('err'); }
  };

  const liveResume       = resume ?? formToResume(form);
  const TemplateComponent = TEMPLATE_MAP[template];
  const savedCVs          = profile?.cvs ?? [];

  // ── Style tokens ──────────────────────────────────────────────────────────
  const D           = dark;
  const bg          = D ? '#111827' : '#f9fafb';
  const cardBg      = D ? '#1f2937' : '#ffffff';
  const cardBorder  = D ? '#374151' : '#e5e7eb';
  const subtleBg    = D ? '#374151' : '#f3f4f6';
  const textPrimary = D ? '#f9fafb' : '#111827';
  const textSec     = D ? '#9ca3af' : '#6b7280';
  const textMuted   = D ? '#6b7280' : '#9ca3af';

  const inp: React.CSSProperties = { width: '100%', padding: '10px 14px', fontSize: 13, borderRadius: 12, border: `1px solid ${cardBorder}`, background: D ? '#111827' : '#fff', color: textPrimary, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' };
  const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 500, color: textSec, marginBottom: 6, marginTop: 12 };
  const secCard: React.CSSProperties = { background: D ? '#111827' : '#f9fafb', border: `1px solid ${cardBorder}`, borderRadius: 16, padding: 16, marginBottom: 12 };

  const progressItems = [
    { label: 'Basics',     filled: !!(form.name || form.jobTitle) },
    { label: 'Experience', filled: form.experience.some(e => e.company) },
    { label: 'Education',  filled: form.education.some(e => e.institution) },
    { label: 'Skills',     filled: !!(form.skills) },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: bg, color: textPrimary, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes modalIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        input:focus, textarea:focus { border-color: #1D9E75 !important; box-shadow: 0 0 0 3px rgba(29,158,117,0.15) !important; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${D ? '#374151' : '#e5e7eb'}; border-radius: 99px; }
        .hov-red:hover { color: #f87171 !important; }
        .hov-teal:hover { background: rgba(29,158,117,0.1) !important; }
        .hov-row:hover { background: ${D ? 'rgba(55,65,81,0.5)' : '#f9fafb'} !important; }
        .hov-tab:hover { opacity: 0.8; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: `1px solid ${cardBorder}`, background: cardBg, flexShrink: 0, zIndex: 10 }}>
        {/* AnantaCV Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#0F6E56,#1D9E75)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>A</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: textPrimary, letterSpacing: '-0.01em' }}>Ananta<span style={{ color: '#1D9E75' }}>CV</span></span>
        </div>

        {/* Progress pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 12 }}>
          {progressItems.map(({ label, filled }) => (
            <span key={label} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500, background: filled ? 'rgba(29,158,117,0.15)' : subtleBg, color: filled ? '#1D9E75' : textMuted, border: `1px solid ${filled ? 'rgba(29,158,117,0.3)' : cardBorder}`, transition: 'all 0.2s' }}>
              {filled ? '✓ ' : ''}{label}
            </span>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          {isPro && <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, background: 'rgba(29,158,117,0.15)', color: '#1D9E75', border: '1px solid rgba(29,158,117,0.3)' }}>✦ Pro</span>}
          <button onClick={() => setDark(d => !d)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 500, border: `1px solid ${cardBorder}`, background: subtleBg, color: textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
            {D ? '☀ Light' : '🌙 Dark'}
          </button>
          {!isPro && (
            <button onClick={() => setShowUpgrade(true)} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
              ✦ Upgrade
            </button>
          )}
          {/* User menu */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(m => !m)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 10, border: `1px solid ${cardBorder}`, background: subtleBg, color: textSec, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#1D9E75', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>
                  {(user.displayName ?? user.email ?? '?')[0].toUpperCase()}
                </div>
                {user.displayName ?? user.email?.split('@')[0]}
              </button>
              {showUserMenu && (
                <>
                  <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowUserMenu(false)} />
                  <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 20, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 14, boxShadow: '0 10px 30px rgba(0,0,0,0.2)', overflow: 'hidden', minWidth: 180 }}>
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${cardBorder}` }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: textPrimary }}>{user.displayName ?? 'User'}</p>
                      <p style={{ margin: 0, fontSize: 11, color: textSec }}>{user.email}</p>
                    </div>
                    <button onClick={() => { setShowUserMenu(false); setRightPanel('saved'); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 12, background: 'transparent', border: 'none', color: textPrimary, cursor: 'pointer', fontFamily: 'inherit' }}>
                      💾 My saved CVs
                    </button>
                    {!isPro && (
                      <button onClick={() => { setShowUserMenu(false); setShowUpgrade(true); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 12, background: 'transparent', border: 'none', color: '#1D9E75', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                        ✦ Upgrade to Pro
                      </button>
                    )}
                    <button onClick={async () => { await signOut(auth); setShowUserMenu(false); }} style={{ width: '100%', textAlign: 'left', padding: '10px 16px', fontSize: 12, background: 'transparent', borderTop: `1px solid ${cardBorder}`, color: '#f87171', cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderTopWidth: 1, borderTopStyle: 'solid', borderTopColor: cardBorder }}>
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => router.push('/auth')} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 8, border: `1px solid ${cardBorder}`, background: 'transparent', color: textSec, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              👤 Login
            </button>
          )}
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 57px)' }}>

        {/* ══ LEFT PANEL ══ */}
        <div style={{ width: 380, minWidth: 300, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${cardBorder}`, background: cardBg, flexShrink: 0 }}>
          <div style={{ display: 'flex', padding: '12px 12px 10px', gap: 4, borderBottom: `1px solid ${cardBorder}`, flexShrink: 0 }}>
            {LEFT_TABS.map((t, i) => (
              <button key={t} onClick={() => setActiveTab(i)} className="hov-tab" style={{ padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: activeTab === i ? '#1D9E75' : 'transparent', color: activeTab === i ? '#fff' : textSec }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {activeTab === 0 && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                <label style={lbl}>Full name <span style={{ color: '#1D9E75' }}>*</span></label>
                <input style={inp} placeholder="Jane Smith" value={form.name} onChange={e => setF('name', e.target.value)} />
                <label style={lbl}>Job title <span style={{ color: '#1D9E75' }}>*</span></label>
                <input style={inp} placeholder="Senior Product Manager" value={form.jobTitle} onChange={e => setF('jobTitle', e.target.value)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="jane@email.com" value={form.email} onChange={e => setF('email', e.target.value)} /></div>
                  <div><label style={lbl}>Phone</label><input style={inp} placeholder="+1 555 000 0000" value={form.phone} onChange={e => setF('phone', e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div><label style={lbl}>Location</label><input style={inp} placeholder="New York, USA" value={form.location} onChange={e => setF('location', e.target.value)} /></div>
                  <div><label style={lbl}>LinkedIn / Portfolio</label><input style={inp} placeholder="linkedin.com/in/jane" value={form.linkedin} onChange={e => setF('linkedin', e.target.value)} /></div>
                </div>
                <label style={{ ...lbl, marginTop: 12 }}>Summary <span style={{ color: textMuted, fontWeight: 400 }}>— optional</span></label>
                <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={3} placeholder="Paste an existing summary or leave blank…" value={form.summary} onChange={e => setF('summary', e.target.value)} />
              </div>
            )}
            {activeTab === 1 && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                {form.experience.map((exp, i) => (
                  <div key={i} style={secCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted }}>Position {i + 1}</span>
                      {form.experience.length > 1 && <button onClick={() => delExp(i)} className="hov-red" style={{ fontSize: 11, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Remove</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input style={inp} placeholder="Company" value={exp.company} onChange={e => upExp(i, 'company', e.target.value)} />
                      <input style={inp} placeholder="Role / title" value={exp.role} onChange={e => upExp(i, 'role', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                      <input style={inp} placeholder="Start (e.g. Jan 2021)" value={exp.start} onChange={e => upExp(i, 'start', e.target.value)} />
                      <input style={inp} placeholder="End (or Present)" value={exp.end} onChange={e => upExp(i, 'end', e.target.value)} />
                    </div>
                    <textarea style={{ ...inp, resize: 'vertical', marginTop: 8, lineHeight: 1.6 }} rows={2} placeholder="Key achievements & responsibilities…" value={exp.desc} onChange={e => upExp(i, 'desc', e.target.value)} />
                  </div>
                ))}
                <button onClick={addExp} className="hov-teal" style={{ fontSize: 13, border: `1px solid rgba(29,158,117,0.4)`, borderRadius: 12, padding: '8px 16px', color: '#1D9E75', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'background 0.15s' }}>
                  <span style={{ fontSize: 16 }}>+</span> Add position
                </button>
              </div>
            )}
            {activeTab === 2 && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                {form.education.map((edu, i) => (
                  <div key={i} style={secCard}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: textMuted }}>Education {i + 1}</span>
                      {form.education.length > 1 && <button onClick={() => delEdu(i)} className="hov-red" style={{ fontSize: 11, color: textMuted, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>Remove</button>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input style={inp} placeholder="Institution" value={edu.institution} onChange={e => upEdu(i, 'institution', e.target.value)} />
                      <input style={inp} placeholder="Degree / Field" value={edu.degree} onChange={e => upEdu(i, 'degree', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                      <input style={inp} placeholder="Start year" value={edu.start} onChange={e => upEdu(i, 'start', e.target.value)} />
                      <input style={inp} placeholder="End year" value={edu.end} onChange={e => upEdu(i, 'end', e.target.value)} />
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} className="hov-teal" style={{ fontSize: 13, border: `1px solid rgba(29,158,117,0.4)`, borderRadius: 12, padding: '8px 16px', color: '#1D9E75', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 16 }}>+</span> Add education
                </button>
              </div>
            )}
            {activeTab === 3 && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                <label style={lbl}>Skills <span style={{ color: textMuted, fontWeight: 400 }}>— comma separated</span></label>
                <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={3} placeholder="Python, SQL, Figma, Leadership…" value={form.skills} onChange={e => setF('skills', e.target.value)} />
                <label style={{ ...lbl, marginTop: 16 }}>Achievements & Certifications</label>
                <textarea style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} rows={3} placeholder="AWS Certified, built a product used by 50k users…" value={form.achievements} onChange={e => setF('achievements', e.target.value)} />
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{ padding: '14px 16px', borderTop: `1px solid ${cardBorder}`, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0, background: cardBg }}>
            <button onClick={() => requirePro(generateResume)} disabled={loading} style={{ width: '100%', padding: '11px 0', borderRadius: 12, border: 'none', background: loading ? '#5DCAA5' : '#1D9E75', color: '#fff', fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.8 : 1, transition: 'background 0.15s', fontFamily: 'inherit' }}>
              {loading ? <><Spinner light /> Generating…</> : isPro ? '✦ Enhance with AI' : '🔒 Enhance with AI (Pro)'}
            </button>
            <button onClick={() => requirePro(generateCoverLetter)} disabled={coverLoading} style={{ width: '100%', padding: '9px 0', borderRadius: 12, border: `1px solid ${isPro ? 'rgba(29,158,117,0.5)' : cardBorder}`, background: 'transparent', color: isPro ? '#1D9E75' : textSec, fontSize: 13, fontWeight: 500, cursor: coverLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s', fontFamily: 'inherit' }}>
              {coverLoading ? <><Spinner /> Writing…</> : isPro ? '✉ Generate cover letter' : '🔒 Cover letter (Pro)'}
            </button>
            <button onClick={clearAll} style={{ width: '100%', padding: '8px 0', borderRadius: 12, border: `1px solid ${cardBorder}`, background: 'transparent', color: textMuted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear all
            </button>
            {status && (
              <div style={{ padding: '8px 12px', borderRadius: 10, fontSize: 12, textAlign: 'center', background: statusType === 'err' ? 'rgba(239,68,68,0.1)' : 'rgba(29,158,117,0.1)', color: statusType === 'err' ? '#f87171' : '#1D9E75', border: `1px solid ${statusType === 'err' ? 'rgba(239,68,68,0.2)' : 'rgba(29,158,117,0.2)'}` }}>
                {status}
              </div>
            )}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: bg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `1px solid ${cardBorder}`, background: cardBg, flexShrink: 0, gap: 12 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {RIGHT_PANELS.map(p => {
                const locked = !isPro && p.id !== 'preview' && p.id !== 'saved';
                return (
                  <button key={p.id} onClick={() => locked ? setShowUpgrade(true) : setRightPanel(p.id)} className="hov-tab" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', background: rightPanel === p.id ? '#1D9E75' : 'transparent', color: rightPanel === p.id ? '#fff' : textSec, opacity: locked ? 0.6 : 1 }}>
                    <span style={{ fontSize: 13 }}>{locked ? '🔒' : p.icon}</span>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {rightPanel === 'preview' && (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowTemplates(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 10, border: `1px solid ${cardBorder}`, background: subtleBg, color: textSec, cursor: 'pointer', fontFamily: 'inherit' }}>
                    🎨 {TEMPLATES.find(t => t.id === template)?.label} ▾
                  </button>
                  {showTemplates && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setShowTemplates(false)} />
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 20, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden', width: 220 }}>
                        {TEMPLATES.map(t => (
                          <button key={t.id} onClick={() => { setTemplate(t.id); setShowTemplates(false); }} style={{ width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, background: template === t.id ? 'rgba(29,158,117,0.08)' : 'transparent', color: textPrimary, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderBottom: `1px solid ${cardBorder}` }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                            <div>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: template === t.id ? '#1D9E75' : textPrimary }}>{t.label} {template === t.id ? '✓' : ''}</p>
                              <p style={{ margin: 0, fontSize: 10, color: textMuted }}>{t.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              {rightPanel === 'preview' && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <button onClick={() => setExportOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 12, fontWeight: 500, borderRadius: 10, border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ↓ Export ▾
                  </button>
                  {exportOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setExportOpen(false)} />
                      <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, zIndex: 20, background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', overflow: 'hidden', width: 210 }}>
                        {[
                          { label: 'Download PDF', action: () => { downloadPDF('resume-output', `${liveResume.name}_resume.pdf`); setExportOpen(false); } },
                          { label: 'Download HTML',action: () => { downloadHTML(liveResume); setExportOpen(false); } },
                          { label: copyDone ? 'Copied!' : 'Copy as text', action: () => { handleCopy(); setExportOpen(false); } },
                        ].map(item => (
                          <button key={item.label} onClick={item.action} className="hov-row" style={{ width: '100%', textAlign: 'left', padding: '11px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', color: textPrimary, cursor: 'pointer', fontFamily: 'inherit', border: 'none', borderBottom: `1px solid ${cardBorder}`, transition: 'background 0.1s' }}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
            {rightPanel === 'preview'  && <TemplateComponent resume={liveResume} dark={dark} />}
            {rightPanel === 'saved'    && (
              user
                ? <SavedCVsPanel cvs={savedCVs} dark={dark} onLoad={handleLoadCV} onDelete={handleDeleteCV} onSave={handleSaveCV} saving={savingCV} currentResume={resume} />
                : <div style={{ textAlign: 'center', padding: '60px 20px', color: textSec }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>💾</div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: textPrimary, marginBottom: 8 }}>Sign in to save your CVs</p>
                    <p style={{ fontSize: 13, marginBottom: 20 }}>Create a free account to save and access your CVs from anywhere.</p>
                    <button onClick={() => router.push('/auth')} style={{ padding: '10px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Sign in / Sign up</button>
                  </div>
            )}
            {rightPanel === 'cover'    && <CoverLetterPanel coverLetter={coverLetter} resume={resume} jobDesc={jobDesc} setJobDesc={setJobDesc} companyName={companyName} setCompanyName={setCompanyName} hiringManager={hiringMgr} setHiringManager={setHiringMgr} onGenerate={generateCoverLetter} loading={coverLoading} dark={dark} />}
            {rightPanel === 'ats'      && <ATSScorePanel resume={resume} dark={dark} />}
            {rightPanel === 'linkedin' && <LinkedInPanel  resume={resume} dark={dark} />}
          </div>
        </div>
      </div>

      {/* ── UPGRADE MODAL ── */}
      {showUpgrade && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100 }} onClick={() => setShowUpgrade(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 101, background: cardBg, borderRadius: 24, padding: '36px 32px', width: 400, maxWidth: '90vw', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.4)', animation: 'modalIn 0.2s ease', border: `1px solid ${cardBorder}` }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>✦</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: textPrimary }}>Upgrade to Pro</h2>
            <p style={{ color: textSec, fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>Manual resume building is always free. Unlock AI features with Pro.</p>
            <div style={{ textAlign: 'left', background: D ? '#111827' : '#f9fafb', borderRadius: 14, padding: '16px 20px', marginBottom: 24, border: `1px solid ${cardBorder}` }}>
              {['✦ AI-written bullet points', '✉ Cover letter generator', '⚡ ATS score analysis', '🔗 LinkedIn About writer'].map(f => (
                <div key={f} style={{ fontSize: 13, color: textSec, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1D9E75' }}>✓</span> {f}
                </div>
              ))}
            </div>
            <button onClick={handleUpgrade} style={{ width: '100%', padding: '13px 0', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 10 }}>
              Upgrade — $9 / month
            </button>
            <button onClick={() => setShowUpgrade(false)} style={{ background: 'none', border: 'none', color: textMuted, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Maybe later
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Spinner({ light }: { light?: boolean }) {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid', borderColor: light ? 'rgba(255,255,255,0.3)' : '#e5e7eb', borderTopColor: light ? '#fff' : '#1D9E75', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />;
}
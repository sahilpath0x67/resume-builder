'use client';
import { useState } from 'react';
import type { ResumeOutput } from '../lib/types';

interface ATSResult {
  overallScore: number;
  breakdown: Record<string, { score: number; feedback: string }>;
  missingKeywords: string[];
  topSuggestions: string[];
}

const LABELS: Record<string, string> = {
  formatting: 'Formatting',
  keywords: 'Keywords',
  quantification: 'Quantification',
  summaryStrength: 'Summary Strength',
  skillsMatch: 'Skills Match',
};

export default function ATSScorePanel({
  resume,
  dark: D,
}: {
  resume: ResumeOutput | null;
  dark: boolean;
}) {
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<ATSResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!resume) { setError('Generate your resume first.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/ats-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume, jobDescription: jobDesc }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
        setError('Rate limit reached. Please wait a minute and try again.');
      } else {
        setError('Analysis failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Color tokens ──
  const bg = D ? '#1f2937' : '#ffffff';
  const bgSubtle = D ? '#111827' : '#f9fafb';
  const borderCol = D ? '#374151' : '#e5e7eb';
  const borderSub = D ? '#1f2937' : '#f3f4f6';
  const text = D ? '#f3f4f6' : '#111827';
  const textMuted = D ? '#9ca3af' : '#6b7280';
  const inputBg = D ? '#374151' : '#ffffff';
  const trackBg = D ? '#374151' : '#f3f4f6';

  const scoreColor = (s: number) =>
    s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';
  const scoreText = (s: number) =>
    s >= 80 ? '#16a34a' : s >= 60 ? '#d97706' : '#dc2626';
  const barColor = (s: number) =>
    s >= 80 ? '#4ade80' : s >= 60 ? '#fbbf24' : '#f87171';

  const cardStyle: React.CSSProperties = {
    background: bg,
    border: `1px solid ${borderCol}`,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 13,
    borderRadius: 10,
    border: `1px solid ${borderCol}`,
    background: inputBg,
    color: text,
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    resize: 'vertical',
    minHeight: 90,
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── INPUT CARD ── */}
      <div style={cardStyle}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: '#1D9E75',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 15, flexShrink: 0,
          }}>⚡</div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: text }}>ATS Score Analyzer</p>
            <p style={{ margin: 0, fontSize: 11, color: textMuted }}>
              Check how well your resume passes automated screening
            </p>
          </div>
          <div style={{
            fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 99,
            background: resume ? '#d1fae5' : D ? '#3b1e06' : '#fef3c7',
            color: resume ? '#065f46' : D ? '#fbbf24' : '#92400e',
            flexShrink: 0,
          }}>
            {resume ? '✓ Resume ready' : '⚠ Generate resume first'}
          </div>
        </div>

        {/* Job description */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: textMuted, marginBottom: 6 }}>
            Job description{' '}
            <span style={{ fontWeight: 400, color: D ? '#6b7280' : '#9ca3af' }}>
              — paste for a tailored score (optional)
            </span>
          </label>
          <textarea
            style={inputStyle}
            rows={3}
            placeholder="Paste the job description here for a more accurate score…"
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
          />
        </div>

        {/* Analyze button */}
        <button
          onClick={analyze}
          disabled={loading || !resume}
          style={{
            width: '100%',
            padding: '11px 0',
            borderRadius: 12,
            border: 'none',
            background: loading ? '#5DCAA5' : '#1D9E75',
            color: '#fff',
            fontSize: 13,
            fontWeight: 500,
            cursor: loading || !resume ? 'not-allowed' : 'pointer',
            opacity: !resume ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontFamily: 'inherit',
            transition: 'background 0.15s',
          }}
        >
          {loading ? <><Spin /> Analyzing…</> : '⚡ Analyze ATS Score'}
        </button>

        {error && (
          <p style={{ fontSize: 12, color: '#f87171', margin: '10px 0 0', textAlign: 'center' }}>
            {error}
          </p>
        )}
      </div>

      {/* ── RESULTS ── */}
      {result && (
        <>
          {/* Overall score */}
          <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* Donut */}
            <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" width="88" height="88" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.9" fill="none" stroke={trackBg} strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15.9" fill="none"
                  stroke={scoreColor(result.overallScore)}
                  strokeWidth="3"
                  strokeDasharray={`${result.overallScore} 100`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: scoreText(result.overallScore) }}>
                  {result.overallScore}
                </span>
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: text }}>ATS Score</p>
              <p style={{ margin: 0, fontSize: 12, color: textMuted, lineHeight: 1.5 }}>
                {result.overallScore >= 80
                  ? '🎉 Great! Your resume is well-optimized for ATS.'
                  : result.overallScore >= 60
                    ? '👍 Good start — a few improvements will help.'
                    : '⚠ Needs work — follow the suggestions below.'}
              </p>
              {/* Mini score bar */}
              <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: trackBg, width: 200, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: scoreColor(result.overallScore),
                  width: `${result.overallScore}%`,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div style={{ ...cardStyle, padding: 20 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', color: textMuted, margin: '0 0 16px',
            }}>
              Score Breakdown
            </p>
            {result.breakdown && Object.entries(result.breakdown).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: text }}>
                    {LABELS[k] || k}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: scoreText(v.score) }}>
                    {v.score}/100
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: trackBg, overflow: 'hidden', marginBottom: 5 }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: barColor(v.score),
                    width: `${v.score}%`,
                    transition: 'width 0.7s ease',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: textMuted, margin: 0 }}>{v.feedback}</p>
              </div>
            ))}
          </div>

          {/* Missing keywords */}
          {result.missingKeywords?.length > 0 && (
            <div style={{
              border: `1px solid ${D ? '#78350f' : '#fde68a'}`,
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              background: D ? '#1c1006' : '#fffbeb',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: D ? '#fbbf24' : '#92400e', margin: '0 0 10px' }}>
                ⚠ Missing Keywords
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.missingKeywords.map((kw, i) => (
                  <span key={i} style={{
                    fontSize: 11, padding: '3px 10px', borderRadius: 99,
                    background: D ? '#3b1e06' : '#fef3c7',
                    color: D ? '#fbbf24' : '#92400e',
                    fontWeight: 500,
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.topSuggestions?.length > 0 && (
            <div style={cardStyle}>
              <p style={{
                fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: textMuted, margin: '0 0 12px',
              }}>
                Top Suggestions
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.topSuggestions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: 99,
                      background: D ? '#064e3b' : '#d1fae5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, marginTop: 1,
                    }}>
                      <span style={{ fontSize: 10, color: '#1D9E75', fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize: 12, color: text, margin: 0, lineHeight: 1.6 }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty state when no result yet */}
      {!result && !loading && (
        <div style={{
          background: bg,
          border: `1px solid ${borderCol}`,
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#E1F5EE',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 24,
          }}>⚡</div>
          <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 500, color: text }}>
            Your ATS score will appear here
          </p>
          <p style={{ margin: 0, fontSize: 13, color: textMuted, lineHeight: 1.6 }}>
            {!resume
              ? 'Generate your resume first, then run the analysis.'
              : 'Click Analyze ATS Score above to check your resume.'}
          </p>

          {resume && (
            <div style={{
              marginTop: 24, textAlign: 'left',
              border: `1px solid ${borderSub}`,
              borderRadius: 12, padding: 16, background: bgSubtle,
            }}>
              <p style={{
                margin: '0 0 10px', fontSize: 11, fontWeight: 600,
                color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                What we check
              </p>
              {[
                'Keyword density and relevance',
                'Quantified achievements in bullets',
                'Formatting and structure',
                'Summary strength',
                'Skills match to job description',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#1D9E75', fontSize: 11, marginTop: 1, flexShrink: 0 }}>✦</span>
                  <span style={{ fontSize: 12, color: textMuted }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spin() {
  return (
    <span style={{
      display: 'inline-block',
      width: 14, height: 14,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}
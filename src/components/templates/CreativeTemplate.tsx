import type { ResumeOutput } from '../../lib/types';

export default function CreativeTemplate({ resume, dark: D }: { resume: ResumeOutput; dark: boolean }) {
  const bg        = D ? '#1f2937' : '#fafafa';
  const textC     = D ? '#f3f4f6' : '#18181b';
  const textMuted = D ? '#9ca3af' : '#71717a';
  const borderCol = D ? '#374151' : '#e4e4e7';
  const cardBg    = D ? '#111827' : '#ffffff';

  return (
    <div id="resume-output" style={{
      maxWidth: 680, margin: '0 auto', background: bg, borderRadius: 14,
      padding: '36px 40px', fontFamily: 'Inter, sans-serif',
      fontSize: 13, lineHeight: 1.6, color: textC,
      boxShadow: D ? '0 1px 3px rgba(0,0,0,0.4)' : '0 2px 16px rgba(0,0,0,0.06)',
    }}>
      {/* Header with large initial */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 28 }}>
        {/* Big letter avatar */}
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
          {resume.name?.[0] ?? '?'}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: textC, margin: '0 0 2px', letterSpacing: '-0.02em' }}>{resume.name}</h1>
          {resume.title && <p style={{ fontSize: 13, fontWeight: 500, color: '#7c3aed', margin: '0 0 8px' }}>{resume.title}</p>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 11, color: textMuted }}>
            {resume.email    && <span>{resume.email}</span>}
            {resume.phone    && <span>{resume.phone}</span>}
            {resume.location && <span>{resume.location}</span>}
            {resume.linkedin && <span style={{ color: '#7c3aed' }}>{resume.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* Skills pills row at top */}
      {resume.skills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 24, paddingBottom: 20, borderBottom: `1px solid ${borderCol}` }}>
          {resume.skills.map((s, i) => (
            <span key={i} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 99, fontWeight: 500, background: i % 3 === 0 ? 'rgba(124,58,237,0.1)' : i % 3 === 1 ? 'rgba(236,72,153,0.1)' : 'rgba(14,165,233,0.1)', color: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#db2777' : '#0284c7' }}>{s}</span>
          ))}
        </div>
      )}

      {resume.summary && (
        <div style={{ background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 12, padding: '14px 18px', marginBottom: 20, borderLeft: '3px solid #7c3aed' }}>
          <p style={{ fontSize: 12.5, lineHeight: 1.8, margin: 0, color: textMuted }}>{resume.summary}</p>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <CreativeSection title="Experience" accent="#7c3aed">
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < resume.experience.length - 1 ? 16 : 0 }}>
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c3aed', marginTop: 3, flexShrink: 0 }} />
                {i < resume.experience.length - 1 && <div style={{ width: 1, flex: 1, background: borderCol, marginTop: 4 }} />}
              </div>
              <div style={{ flex: 1, paddingBottom: i < resume.experience.length - 1 ? 12 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: textC }}>{exp.role}</span>
                  <span style={{ fontSize: 10, color: textMuted, background: D ? '#374151' : '#f4f4f5', padding: '2px 8px', borderRadius: 4 }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, margin: '1px 0 5px' }}>{exp.company}</p>
                {exp.bullets?.length > 0 && <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{exp.bullets.map((b, j) => <li key={j} style={{ fontSize: 11.5, marginBottom: 3, color: textMuted, lineHeight: 1.65 }}>{b}</li>)}</ul>}
              </div>
            </div>
          ))}
        </CreativeSection>
      )}

      {resume.education?.length > 0 && (
        <CreativeSection title="Education" accent="#db2777">
          {resume.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 10, background: cardBg, border: `1px solid ${borderCol}`, borderRadius: 10, padding: '10px 14px' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 12, color: textC }}>{edu.institution}</span>
                <p style={{ fontSize: 11, color: textMuted, fontStyle: 'italic', margin: '2px 0 0' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: 10, color: textMuted, alignSelf: 'flex-start' }}>{edu.period}</span>
            </div>
          ))}
        </CreativeSection>
      )}

      {resume.achievements?.length > 0 && (
        <CreativeSection title="Achievements" accent="#0284c7">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {resume.achievements.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 14, color: '#0284c7', flexShrink: 0, marginTop: 1 }}>★</span>
                <span style={{ fontSize: 12, color: textMuted, lineHeight: 1.65 }}>{a}</span>
              </div>
            ))}
          </div>
        </CreativeSection>
      )}
    </div>
  );
}

function CreativeSection({ title, children, accent }: { title: string; children: React.ReactNode; accent: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ width: 20, height: 20, borderRadius: 6, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 12, fontWeight: 700, color: accent, margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
import type { ResumeOutput } from '../../lib/types';

export default function MinimalTemplate({ resume, dark: D }: { resume: ResumeOutput; dark: boolean }) {
  const bg        = D ? '#1f2937' : '#ffffff';
  const textC     = D ? '#f3f4f6' : '#111827';
  const textMuted = D ? '#9ca3af' : '#6b7280';
  const borderCol = D ? '#374151' : '#e5e7eb';

  return (
    <div id="resume-output" style={{
      maxWidth: 680, margin: '0 auto', background: bg, borderRadius: 14,
      padding: '44px 48px', fontFamily: 'Inter, sans-serif',
      fontSize: 13, lineHeight: 1.6, color: textC,
      boxShadow: D ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Header — name centred */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 30, fontWeight: 300, letterSpacing: '0.12em', textTransform: 'uppercase', color: textC, margin: '0 0 6px' }}>{resume.name}</h1>
        {resume.title && <p style={{ fontSize: 12, fontWeight: 500, color: textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 12px' }}>{resume.title}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '4px 16px', fontSize: 11, color: textMuted }}>
          {resume.email    && <span>{resume.email}</span>}
          {resume.phone    && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.linkedin && <span>{resume.linkedin}</span>}
        </div>
        <div style={{ width: '100%', height: 1, background: borderCol, marginTop: 16 }} />
      </div>

      {resume.summary && (
        <MinSection title="Summary" border={borderCol}>
          <p style={{ fontSize: 12.5, lineHeight: 1.9, margin: 0, color: textMuted }}>{resume.summary}</p>
        </MinSection>
      )}

      {resume.experience?.length > 0 && (
        <MinSection title="Experience" border={borderCol}>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: textC }}>{exp.company}</span>
                <span style={{ fontSize: 11, color: textMuted }}>{exp.period}</span>
              </div>
              <p style={{ fontSize: 12, color: textMuted, fontStyle: 'italic', margin: '2px 0 6px' }}>{exp.role}</p>
              {exp.bullets?.length > 0 && <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{exp.bullets.map((b, j) => <li key={j} style={{ fontSize: 12, marginBottom: 3, color: textMuted, lineHeight: 1.65 }}>{b}</li>)}</ul>}
            </div>
          ))}
        </MinSection>
      )}

      {resume.education?.length > 0 && (
        <MinSection title="Education" border={borderCol}>
          {resume.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 8 }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: textC }}>{edu.institution}</span>
                <p style={{ fontSize: 12, color: textMuted, fontStyle: 'italic', margin: '2px 0 0' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: 11, color: textMuted }}>{edu.period}</span>
            </div>
          ))}
        </MinSection>
      )}

      {resume.skills?.length > 0 && (
        <MinSection title="Skills" border={borderCol}>
          <p style={{ fontSize: 12, color: textMuted, margin: 0, lineHeight: 1.9 }}>{resume.skills.join('  ·  ')}</p>
        </MinSection>
      )}

      {resume.achievements?.length > 0 && (
        <MinSection title="Achievements" border={borderCol}>
          <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{resume.achievements.map((a, i) => <li key={i} style={{ fontSize: 12, marginBottom: 3, color: textMuted, lineHeight: 1.65 }}>{a}</li>)}</ul>
        </MinSection>
      )}
    </div>
  );
}

function MinSection({ title, children, border }: { title: string; children: React.ReactNode; border: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1D9E75', margin: '0 0 10px', paddingBottom: 5, borderBottom: `1px solid ${border}` }}>{title}</h2>
      {children}
    </div>
  );
}
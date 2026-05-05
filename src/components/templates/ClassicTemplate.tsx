import type { ResumeOutput } from '../../lib/types';

export default function ClassicTemplate({ resume, dark: D }: { resume: ResumeOutput; dark: boolean }) {
  const bg        = D ? '#1f2937' : '#ffffff';
  const textC     = D ? '#f3f4f6' : '#111827';
  const textMuted = D ? '#9ca3af' : '#6b7280';
  const borderCol = D ? '#374151' : '#e5e7eb';
  const skillBg   = D ? '#064e3b' : '#E1F5EE';
  const skillText = D ? '#6ee7b7' : '#0F6E56';

  return (
    <div id="resume-output" style={{
      maxWidth: 680, margin: '0 auto', background: bg, borderRadius: 14,
      padding: '40px 44px', fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 13, lineHeight: 1.6, color: textC,
      boxShadow: D ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: textC, margin: '0 0 3px' }}>{resume.name}</h1>
        {resume.title && <p style={{ fontSize: 13, fontWeight: 600, color: '#1D9E75', fontFamily: 'Inter, sans-serif', margin: '0 0 8px' }}>{resume.title}</p>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', fontSize: 11, color: textMuted, fontFamily: 'Inter, sans-serif' }}>
          {resume.email    && <span>✉ {resume.email}</span>}
          {resume.phone    && <span>📞 {resume.phone}</span>}
          {resume.location && <span>📍 {resume.location}</span>}
          {resume.linkedin && <span style={{ color: '#1D9E75' }}>🔗 {resume.linkedin}</span>}
        </div>
        <div style={{ height: 2, background: '#1D9E75', marginTop: 14, borderRadius: 1 }} />
      </div>

      {resume.summary && <Section title="Professional Summary" border={borderCol}><p style={{ fontSize: 12.5, lineHeight: 1.8, margin: 0, color: textC }}>{resume.summary}</p></Section>}

      {resume.experience?.length > 0 && (
        <Section title="Experience" border={borderCol}>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < resume.experience.length - 1 ? 16 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 2 }}>
                <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Inter, sans-serif', color: textC }}>{exp.company}</span>
                <span style={{ fontSize: 11, color: textMuted, fontFamily: 'Inter, sans-serif' }}>{exp.period}</span>
              </div>
              <div style={{ fontSize: 12, color: '#1D9E75', fontFamily: 'Inter, sans-serif', fontStyle: 'italic', marginBottom: 5 }}>{exp.role}</div>
              {exp.bullets?.length > 0 && <ul style={{ paddingLeft: '1.25em', margin: 0 }}>{exp.bullets.map((b, j) => <li key={j} style={{ fontSize: 12, marginBottom: 3, color: textC, lineHeight: 1.65 }}>{b}</li>)}</ul>}
            </div>
          ))}
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education" border={borderCol}>
          {resume.education.map((edu, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: i < resume.education.length - 1 ? 10 : 0 }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: 13, fontFamily: 'Inter, sans-serif', color: textC }}>{edu.institution}</span>
                <p style={{ fontSize: 12, color: textMuted, fontFamily: 'Inter, sans-serif', fontStyle: 'italic', margin: '2px 0 0' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: 11, color: textMuted, fontFamily: 'Inter, sans-serif' }}>{edu.period}</span>
            </div>
          ))}
        </Section>
      )}

      {resume.skills?.length > 0 && (
        <Section title="Skills" border={borderCol}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {resume.skills.map((s, i) => <span key={i} style={{ background: skillBg, color: skillText, borderRadius: 99, fontSize: 11, padding: '3px 11px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>{s}</span>)}
          </div>
        </Section>
      )}

      {resume.achievements?.length > 0 && (
        <Section title="Achievements & Certifications" border={borderCol}>
          <ul style={{ paddingLeft: '1.25em', margin: 0 }}>{resume.achievements.map((a, i) => <li key={i} style={{ fontSize: 12, marginBottom: 3, color: textC, lineHeight: 1.65 }}>{a}</li>)}</ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children, border }: { title: string; children: React.ReactNode; border: string }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1D9E75', fontFamily: 'Inter, sans-serif', margin: '0 0 8px', paddingBottom: 4, borderBottom: `1px solid ${border}` }}>{title}</h2>
      {children}
    </div>
  );
}
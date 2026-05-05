import type { ResumeOutput } from '../../lib/types';

export default function ModernTemplate({ resume, dark: D }: { resume: ResumeOutput; dark: boolean }) {
  const bg        = D ? '#1f2937' : '#ffffff';
  const sidebar   = D ? '#111827' : '#0F6E56';
  const textC     = D ? '#f3f4f6' : '#111827';
  const textMuted = D ? '#9ca3af' : '#6b7280';

  return (
    <div id="resume-output" style={{
      maxWidth: 680, margin: '0 auto', background: bg, borderRadius: 14, overflow: 'hidden',
      display: 'grid', gridTemplateColumns: '200px 1fr',
      fontFamily: 'Inter, sans-serif', fontSize: 13, lineHeight: 1.6,
      boxShadow: D ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      {/* Sidebar */}
      <div style={{ background: sidebar, padding: '32px 20px', color: '#fff' }}>
        {/* Avatar circle */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
          {resume.name?.[0] ?? '?'}
        </div>
        <h1 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>{resume.name}</h1>
        {resume.title && <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>{resume.title}</p>}

        {/* Contact */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>Contact</p>
          {resume.email    && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', margin: '0 0 5px', wordBreak: 'break-all' }}>{resume.email}</p>}
          {resume.phone    && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', margin: '0 0 5px' }}>{resume.phone}</p>}
          {resume.location && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', margin: '0 0 5px' }}>{resume.location}</p>}
          {resume.linkedin && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', margin: '0 0 5px', wordBreak: 'break-all' }}>{resume.linkedin}</p>}
        </div>

        {/* Skills */}
        {resume.skills?.length > 0 && (
          <div>
            <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>Skills</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {resume.skills.map((s, i) => (
                <span key={i} style={{ fontSize: 10, color: '#fff', background: 'rgba(255,255,255,0.15)', borderRadius: 4, padding: '3px 8px' }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 28px', color: textC }}>
        {resume.summary && (
          <div style={{ marginBottom: 20 }}>
            <SidebarSectionTitle>Profile</SidebarSectionTitle>
            <p style={{ fontSize: 12, lineHeight: 1.8, margin: 0, color: textMuted }}>{resume.summary}</p>
          </div>
        )}

        {resume.experience?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SidebarSectionTitle>Experience</SidebarSectionTitle>
            {resume.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: textC }}>{exp.role}</span>
                  <span style={{ fontSize: 10, color: textMuted }}>{exp.period}</span>
                </div>
                <p style={{ fontSize: 11, color: '#1D9E75', fontWeight: 600, margin: '1px 0 5px' }}>{exp.company}</p>
                {exp.bullets?.length > 0 && <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{exp.bullets.map((b, j) => <li key={j} style={{ fontSize: 11, marginBottom: 2, color: textMuted, lineHeight: 1.6 }}>{b}</li>)}</ul>}
              </div>
            ))}
          </div>
        )}

        {resume.education?.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <SidebarSectionTitle>Education</SidebarSectionTitle>
            {resume.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: textC }}>{edu.institution}</span>
                  <span style={{ fontSize: 10, color: textMuted }}>{edu.period}</span>
                </div>
                <p style={{ fontSize: 11, color: textMuted, margin: '2px 0 0', fontStyle: 'italic' }}>{edu.degree}</p>
              </div>
            ))}
          </div>
        )}

        {resume.achievements?.length > 0 && (
          <div>
            <SidebarSectionTitle>Achievements</SidebarSectionTitle>
            <ul style={{ paddingLeft: '1.2em', margin: 0 }}>{resume.achievements.map((a, i) => <li key={i} style={{ fontSize: 11, marginBottom: 3, color: textMuted, lineHeight: 1.6 }}>{a}</li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
      <div style={{ width: 3, height: 16, background: '#1D9E75', borderRadius: 99 }} />
      <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#1D9E75', margin: 0 }}>{children}</h2>
    </div>
  );
}
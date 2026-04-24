import type { ResumeOutput } from '../lib/types';

export default function ResumePreview({ resume, dark: D }: { resume: ResumeOutput; dark: boolean }) {
  return (
    <div
      id="resume-output"
      className={`max-w-2xl mx-auto shadow-sm rounded-xl p-10 ${D ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}
      style={{ fontFamily: 'Georgia, serif', fontSize: '13px', lineHeight: '1.6' }}
    >
      {/* Header */}
      <div className="mb-5">
        <h1 style={{ fontSize: '26px', fontWeight: 700, fontFamily: 'sans-serif', marginBottom: '2px' }}>
          {resume.name}
        </h1>
        {resume.title && (
          <p style={{ fontSize: '13px', color: '#1D9E75', fontWeight: 600, fontFamily: 'sans-serif', marginBottom: '6px' }}>
            {resume.title}
          </p>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: D ? '#9ca3af' : '#6b7280', fontFamily: 'sans-serif' }}>
          {resume.email    && <span>{resume.email}</span>}
          {resume.phone    && <span>{resume.phone}</span>}
          {resume.location && <span>{resume.location}</span>}
          {resume.linkedin && <span style={{ color: '#1D9E75' }}>{resume.linkedin}</span>}
        </div>
        <div style={{ height: '2px', background: '#1D9E75', marginTop: '12px', borderRadius: '1px' }} />
      </div>

      {resume.summary && (
        <Section title="Professional Summary" dark={D}>
          <p style={{ fontSize: '12px', lineHeight: '1.8' }}>{resume.summary}</p>
        </Section>
      )}

      {resume.experience?.length > 0 && (
        <Section title="Experience" dark={D}>
          {resume.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>{exp.company}</span>
                <span style={{ fontSize: '11px', color: D ? '#9ca3af' : '#9ca3af', fontFamily: 'sans-serif' }}>{exp.period}</span>
              </div>
              <div style={{ fontSize: '12px', color: D ? '#9ca3af' : '#6b7280', fontFamily: 'sans-serif', fontStyle: 'italic', marginBottom: '4px' }}>{exp.role}</div>
              <ul style={{ paddingLeft: '1.2em', margin: 0 }}>
                {(exp.bullets || []).map((b, j) => (
                  <li key={j} style={{ fontSize: '12px', marginBottom: '2px' }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education" dark={D}>
          {resume.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'sans-serif' }}>{edu.institution}</span>
                <p style={{ fontSize: '12px', color: D ? '#9ca3af' : '#6b7280', fontFamily: 'sans-serif', fontStyle: 'italic', margin: '1px 0 0' }}>{edu.degree}</p>
              </div>
              <span style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'sans-serif' }}>{edu.period}</span>
            </div>
          ))}
        </Section>
      )}

      {resume.skills?.length > 0 && (
        <Section title="Skills" dark={D}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {resume.skills.map((s, i) => (
              <span key={i} style={{ background: '#E1F5EE', color: '#0F6E56', borderRadius: '20px', fontSize: '11px', padding: '3px 10px', fontFamily: 'sans-serif', fontWeight: 500 }}>{s}</span>
            ))}
          </div>
        </Section>
      )}

      {resume.achievements?.length > 0 && (
        <Section title="Achievements & Certifications" dark={D}>
          <ul style={{ paddingLeft: '1.2em', margin: 0 }}>
            {resume.achievements.map((a, i) => (
              <li key={i} style={{ fontSize: '12px', marginBottom: '2px' }}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children, dark: D }: { title: string; children: React.ReactNode; dark: boolean }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#1D9E75', fontFamily: 'sans-serif', marginBottom: '6px',
        paddingBottom: '3px', borderBottom: `0.5px solid ${D ? '#374151' : '#e5e7eb'}`
      }}>{title}</h2>
      {children}
    </div>
  );
}

import type { ResumeOutput } from './types';

export type InsightSeverity = 'high' | 'medium' | 'low';
export type InsightSection = 'basics' | 'experience' | 'education' | 'skills' | 'ats';

export interface ResumeIssue {
  id: string;
  severity: InsightSeverity;
  section: InsightSection;
  title: string;
  detail: string;
  action: string;
}

export interface ResumeInsights {
  score: number;
  words: number;
  completion: number;
  issues: ResumeIssue[];
  strengths: string[];
  exportReady: boolean;
}

const ACTION_VERBS = [
  'achieved', 'analyzed', 'automated', 'built', 'created', 'delivered', 'designed', 'developed',
  'drove', 'executed', 'generated', 'grew', 'implemented', 'improved', 'increased', 'launched',
  'led', 'managed', 'optimized', 'reduced', 'saved', 'streamlined',
];

const PLACEHOLDER_PATTERN = /\[[^\]]+\]|\byour company\b|\bcompany name\b/i;
const METRIC_PATTERN = /\d+(%|\+|k|m|\$|x|\/|\s?(percent|users|customers|million|thousand|team|members|hours|days|weeks|months))/i;

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
}

function hasActionVerb(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return ACTION_VERBS.some(verb => lower.startsWith(verb));
}

export function analyzeResume(resume: ResumeOutput | null): ResumeInsights {
  if (!resume) {
    return {
      score: 0,
      words: 0,
      completion: 0,
      issues: [
        {
          id: 'empty',
          severity: 'high',
          section: 'basics',
          title: 'Start with your basic details',
          detail: 'Add your name, target title, and at least one experience entry to unlock useful feedback.',
          action: 'Edit basics',
        },
      ],
      strengths: [],
      exportReady: false,
    };
  }

  const issues: ResumeIssue[] = [];
  const strengths: string[] = [];
  const bullets = resume.experience.flatMap(exp => exp.bullets ?? []).filter(Boolean);
  const quantified = bullets.filter(METRIC_PATTERN.test.bind(METRIC_PATTERN)).length;
  const actionBullets = bullets.filter(hasActionVerb).length;
  const allText = [
    resume.name,
    resume.title,
    resume.summary,
    ...bullets,
    ...resume.skills,
    ...resume.achievements,
  ].join(' ');
  const words = wordCount(allText);

  const contactFields = [resume.email, resume.phone, resume.location, resume.linkedin].filter(Boolean).length;
  if (!resume.name || !resume.title) {
    issues.push({
      id: 'missing-basics',
      severity: 'high',
      section: 'basics',
      title: 'Name or target title is missing',
      detail: 'Recruiters and ATS systems need a clear name and target role at the top.',
      action: 'Edit basics',
    });
  } else {
    strengths.push('Clear headline with name and target title.');
  }

  if (contactFields < 3) {
    issues.push({
      id: 'thin-contact',
      severity: 'medium',
      section: 'basics',
      title: 'Contact section is thin',
      detail: 'Add email, phone, location, and LinkedIn or portfolio where possible.',
      action: 'Edit basics',
    });
  } else {
    strengths.push('Contact details are easy to scan.');
  }

  const summaryWords = wordCount(resume.summary);
  if (summaryWords < 25) {
    issues.push({
      id: 'summary-short',
      severity: 'medium',
      section: 'basics',
      title: 'Summary needs more signal',
      detail: 'Aim for 40-80 words that mention your role, strengths, and measurable value.',
      action: 'Use summary templates',
    });
  } else if (summaryWords <= 90) {
    strengths.push('Summary length is in a strong range.');
  }

  if (resume.experience.length === 0 || bullets.length === 0) {
    issues.push({
      id: 'no-bullets',
      severity: 'high',
      section: 'experience',
      title: 'Experience needs achievement bullets',
      detail: 'Add 3-5 bullets per role. Focus on results, scope, and measurable outcomes.',
      action: 'Edit experience',
    });
  } else {
    if (actionBullets / bullets.length < 0.7) {
      issues.push({
        id: 'weak-verbs',
        severity: 'medium',
        section: 'experience',
        title: 'More bullets should start with action verbs',
        detail: `${actionBullets}/${bullets.length} bullets start with strong verbs. Start more bullets with words like Led, Built, Improved, or Delivered.`,
        action: 'Edit bullets',
      });
    } else {
      strengths.push('Most bullets start with strong action verbs.');
    }

    if (quantified / bullets.length < 0.5) {
      issues.push({
        id: 'few-metrics',
        severity: 'high',
        section: 'experience',
        title: 'Add more measurable results',
        detail: `${quantified}/${bullets.length} bullets include numbers. Add metrics like %, $, time saved, users, revenue, or team size.`,
        action: 'Add metrics',
      });
    } else {
      strengths.push('Strong use of metrics in experience bullets.');
    }
  }

  if (resume.skills.length < 8) {
    issues.push({
      id: 'few-skills',
      severity: 'medium',
      section: 'skills',
      title: 'Skills section is light',
      detail: 'A competitive resume usually includes 8-12 relevant hard and soft skills.',
      action: 'Add skill pack',
    });
  } else {
    strengths.push('Skills section has enough breadth for ATS scanning.');
  }

  if (resume.education.length === 0) {
    issues.push({
      id: 'missing-education',
      severity: 'low',
      section: 'education',
      title: 'Education is missing',
      detail: 'Add education, certifications, bootcamps, or relevant training if applicable.',
      action: 'Edit education',
    });
  }

  if (PLACEHOLDER_PATTERN.test(allText)) {
    issues.push({
      id: 'placeholders',
      severity: 'high',
      section: 'ats',
      title: 'Placeholder text remains',
      detail: 'Replace bracketed placeholders before exporting. Recruiters notice these immediately.',
      action: 'Review text',
    });
  }

  if (words < 180) {
    issues.push({
      id: 'too-short',
      severity: 'medium',
      section: 'experience',
      title: 'Resume may be too short',
      detail: `${words} words is light for most applications. Add stronger bullets and detail.`,
      action: 'Expand content',
    });
  } else if (words <= 650) {
    strengths.push('Resume length is suitable for a one-page CV.');
  }

  const high = issues.filter(issue => issue.severity === 'high').length;
  const medium = issues.filter(issue => issue.severity === 'medium').length;
  const completionItems = [
    Boolean(resume.name && resume.title),
    contactFields >= 3,
    summaryWords >= 25,
    bullets.length >= 3,
    resume.skills.length >= 8,
    resume.education.length > 0,
  ];
  const completion = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);
  const score = Math.max(0, Math.min(100, completion - high * 12 - medium * 6));

  return {
    score,
    words,
    completion,
    issues: issues.sort((a, b) => {
      const weight = { high: 0, medium: 1, low: 2 };
      return weight[a.severity] - weight[b.severity];
    }),
    strengths: strengths.slice(0, 5),
    exportReady: score >= 75 && high === 0,
  };
}

import type { Experience, FormData, ResumeOutput } from './types';

export type SummaryTemplateId = 'impact' | 'technical' | 'leadership' | 'career-change';
export type BulletTemplateId = 'impact' | 'leadership' | 'process' | 'customer';
export type SkillPresetId = 'software' | 'product' | 'marketing' | 'operations';
export type AchievementTemplateId = 'certification' | 'launch' | 'award' | 'improvement';

export const SUMMARY_TEMPLATES: { id: SummaryTemplateId; label: string }[] = [
  { id: 'impact', label: 'Impact' },
  { id: 'technical', label: 'Technical' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'career-change', label: 'Career shift' },
];

export const BULLET_TEMPLATES: { id: BulletTemplateId; label: string }[] = [
  { id: 'impact', label: 'Impact' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'process', label: 'Process' },
  { id: 'customer', label: 'Customer' },
];

export const SKILL_PRESETS: { id: SkillPresetId; label: string; skills: string[] }[] = [
  { id: 'software', label: 'Software', skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'APIs', 'Testing', 'Git', 'Problem solving'] },
  { id: 'product', label: 'Product', skills: ['Roadmapping', 'User research', 'Analytics', 'Prioritization', 'Stakeholder management', 'A/B testing', 'Agile', 'Go-to-market'] },
  { id: 'marketing', label: 'Marketing', skills: ['Campaign strategy', 'SEO', 'Content marketing', 'Email marketing', 'Analytics', 'Brand positioning', 'Copywriting', 'Lead generation'] },
  { id: 'operations', label: 'Operations', skills: ['Process improvement', 'Vendor management', 'Reporting', 'Budgeting', 'Cross-functional coordination', 'Quality control', 'Scheduling', 'Documentation'] },
];

export const ACHIEVEMENT_TEMPLATES: { id: AchievementTemplateId; label: string; text: string }[] = [
  { id: 'certification', label: 'Certification', text: 'Earned [certification] to strengthen expertise in [skill/domain].' },
  { id: 'launch', label: 'Launch', text: 'Launched [project/product/process] that supported [team/customer/business outcome].' },
  { id: 'award', label: 'Award', text: 'Recognized for [achievement] based on [impact, quality, or leadership].' },
  { id: 'improvement', label: 'Improvement', text: 'Improved [metric/process] by [number] through [action taken].' },
];

const fallback = (value: string | undefined, text: string) => value?.trim() || text;
const cleanList = (items: string[]) => items.map(item => item.trim()).filter(Boolean);

function firstSkills(form: FormData, count = 4): string {
  const skills = cleanList(form.skills.split(',')).slice(0, count);
  return skills.length ? skills.join(', ') : 'communication, execution, problem solving, and collaboration';
}

function currentExperience(form: FormData): Experience | undefined {
  return form.experience.find(exp => exp.company || exp.role || exp.desc);
}

export function buildSummaryTemplate(form: FormData, templateId: SummaryTemplateId): string {
  const title = fallback(form.title, 'professional');
  const location = form.location.trim();
  const exp = currentExperience(form);
  const roleContext = exp?.role || title;
  const companyContext = exp?.company ? ` at ${exp.company}` : '';
  const skills = firstSkills(form);
  const locationText = location ? ` based in ${location}` : '';

  if (templateId === 'technical') {
    return `${title}${locationText} with hands-on experience in ${skills}. Known for translating requirements into reliable solutions, improving workflows, and collaborating with teams to deliver practical results.`;
  }

  if (templateId === 'leadership') {
    return `${title}${locationText} with experience guiding teams, coordinating stakeholders, and moving work from planning to delivery. Brings strengths in ${skills}, with a focus on clear execution and measurable outcomes.`;
  }

  if (templateId === 'career-change') {
    return `Adaptable ${title}${locationText} bringing experience as ${roleContext}${companyContext} and strengths in ${skills}. Combines fast learning, structured problem solving, and cross-functional communication to contribute quickly in new environments.`;
  }

  return `Results-focused ${title}${locationText} with experience as ${roleContext}${companyContext}. Skilled in ${skills}, with a track record of improving processes, supporting teams, and delivering work that creates measurable business value.`;
}

export function buildBulletTemplate(exp: Experience, templateId: BulletTemplateId): string {
  const role = fallback(exp.role, 'role');
  const area = exp.company ? `at ${exp.company}` : 'for the team';

  if (templateId === 'leadership') {
    return `Led [team/project] ${area} to deliver [outcome] ahead of schedule.`;
  }

  if (templateId === 'process') {
    return `Improved [process/workflow] in ${role} by reducing [time/cost/errors] by [number].`;
  }

  if (templateId === 'customer') {
    return `Supported [customers/stakeholders] by resolving [problem] and improving satisfaction by [number].`;
  }

  return `Delivered [project/result] ${area}, increasing [metric] by [number] through [action].`;
}

export function mergeSkills(existingSkills: string, preset: SkillPresetId): string {
  const presetSkills = SKILL_PRESETS.find(item => item.id === preset)?.skills ?? [];
  const merged = [...cleanList(existingSkills.split(',')), ...presetSkills];
  const unique = [...new Map(merged.map(skill => [skill.toLowerCase(), skill])).values()];
  return unique.join(', ');
}

export function buildCoverLetterDraft(resume: ResumeOutput, companyName: string, hiringManager: string, jobDesc: string): string {
  const company = companyName.trim() || 'your company';
  const manager = hiringManager.trim() || 'Hiring Manager';
  const title = resume.title || 'the role';
  const skillText = resume.skills?.slice(0, 5).join(', ') || 'relevant skills';
  const firstRole = resume.experience?.[0];
  const achievement = firstRole?.bullets?.[0] || resume.achievements?.[0] || 'delivered reliable results across projects and team priorities';
  const jobLine = jobDesc.trim()
    ? `The role stood out to me because it calls for strengths that match my background, especially ${skillText}.`
    : `I am drawn to the opportunity to bring my background in ${skillText} to your team.`;

  return `Dear ${manager},

I am excited to apply for ${title} at ${company}. ${jobLine}

In my recent work${firstRole ? ` as ${firstRole.role || resume.title} at ${firstRole.company}` : ''}, I ${achievement.replace(/\.$/, '')}. I would bring the same practical, outcome-focused approach to ${company}, along with strengths in ${skillText}.

Thank you for your time and consideration. I would welcome the chance to discuss how my experience can support your team.`;
}

export function buildLinkedInAboutDraft(resume: ResumeOutput): string {
  const title = resume.title || 'professional';
  const skillText = resume.skills?.slice(0, 6).join(', ') || 'problem solving, communication, and execution';
  const firstRole = resume.experience?.[0];
  const achievement = firstRole?.bullets?.[0] || resume.achievements?.[0];

  return `I am a ${title} focused on turning ideas, requirements, and team goals into practical results. My work sits at the intersection of ${skillText}, and I enjoy building clear systems that help people move faster and make better decisions.

${achievement ? `One achievement I am proud of: ${achievement.replace(/\.$/, '')}. ` : ''}${firstRole ? `Most recently, I worked as ${firstRole.role || title} at ${firstRole.company}, where I contributed across execution, collaboration, and continuous improvement.` : 'I bring a flexible, hands-on approach and a strong interest in learning from every project.'}

I am always interested in thoughtful teams, useful products, and work that creates measurable value.`;
}

export function extractJobKeywords(jobDescription: string, resume: ResumeOutput | null): string[] {
  const stopWords = new Set([
    'about', 'after', 'also', 'and', 'are', 'but', 'can', 'for', 'from', 'have', 'into', 'our', 'that', 'the', 'this', 'with', 'will', 'you', 'your',
    'ability', 'across', 'based', 'business', 'candidate', 'company', 'experience', 'including', 'looking', 'preferred', 'required', 'responsibilities',
  ]);
  const resumeText = JSON.stringify(resume ?? {}).toLowerCase();
  const words = jobDescription
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));

  const counts = new Map<string, number>();
  for (const word of words) counts.set(word, (counts.get(word) ?? 0) + 1);

  return [...counts.entries()]
    .filter(([word]) => !resumeText.includes(word))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 12)
    .map(([word]) => word);
}

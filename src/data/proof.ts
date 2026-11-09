// Client proof. Each section on the site that uses these renders ONLY when
// the list has at least one entry, so an empty list means nothing shows.
// Add real, permissioned quotes and case studies only.
//
// Testimonial example:
//   { quote: 'What they said.', name: 'Jane Doe', role: 'Executive Director', org: 'Example Org' }
//   (Leave name blank and set role/org generically if the person asked to stay anonymous.)
//
// Case study example:
//   { org: 'Example Org', stage: 'Grant Readiness', constraint: 'What the diagnostic named',
//     action: 'What the 90-day plan did', result: 'What changed, with numbers if you have them' }

export interface Testimonial { quote: string; name?: string; role: string; org?: string }
export interface CaseStudy { org: string; stage: string; constraint: string; action: string; result: string }

export const testimonials: Testimonial[] = [];
export const caseStudies: CaseStudy[] = [];

// Past talks, panels, and workshops. The "Recent Engagements" list on
// /about#speaking renders only when this has entries.
//   { title: 'Talk title', event: 'Event or host', date: 'Month YYYY' }
export interface Talk { title: string; event: string; date?: string }
export const talks: Talk[] = [];

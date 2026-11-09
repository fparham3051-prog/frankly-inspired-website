// The single InstitutionalOS question bank (tier 2). Every question-based
// free tool renders its questions from here (QuestionSection.astro) and
// scores them through healthEngine.ts, so one question means one thing
// everywhere and every answer lands on one of the seven Health Index
// dimensions. Edit wording here, not in the pages.
//
// Answers use the evidence rubric (RubricKey.astro): 1 Not in place,
// 2 Talked about, 3 Informal, 4 Documented, 5 Verified -> 0/25/50/75/100%.

export type DimensionKey = 'strategy' | 'program' | 'revenue' | 'leadership' | 'operations' | 'partnerships' | 'governance';

export interface Dimension { key: DimensionKey; num: number; label: string; short: string; anchor: string }
export interface Tool { key: string; name: string; href: string }
export interface Area { key: string; tool: string; index: number; label: string; dimension: DimensionKey; help: string; helpClass: string; basis: string }
export interface Item { id: string; tool: string; name: string; area: string; text: string }

// Same order, names, and numbering as the homepage and the paid diagnostic.
// "label" matches the backend's healthIndex.js and the operations app.
export const DIMENSIONS: Dimension[] = [
  { key: 'strategy', num: 1, label: 'Strategy and Positioning', short: 'Strategy', anchor: 'pillar-sustainability' },
  { key: 'program', num: 2, label: 'Program and Impact Evidence', short: 'Program evidence', anchor: 'pillar-program' },
  { key: 'revenue', num: 3, label: 'Revenue and Financial Health', short: 'Revenue', anchor: 'pillar-revenue' },
  { key: 'leadership', num: 4, label: 'Leadership and Organizational Capacity', short: 'Leadership', anchor: 'pillar-leadership' },
  { key: 'operations', num: 5, label: 'Operations and Infrastructure', short: 'Operations', anchor: 'pillar-operations' },
  { key: 'partnerships', num: 6, label: 'Partnerships and Ecosystem', short: 'Partnerships', anchor: 'pillar-partnership' },
  { key: 'governance', num: 7, label: 'Governance and Risk', short: 'Governance', anchor: 'pillar-governance' },
];

export const TOOLS: Tool[] = [
  {
    "key": "self-assessment",
    "name": "Nonprofit Sustainability Self-Assessment",
    "href": "/assessment"
  },
  {
    "key": "leadership",
    "name": "Leadership & Operations Score",
    "href": "/leadership-health"
  },
  {
    "key": "institutional-advancement",
    "name": "Institutional Advancement Score",
    "href": "/institutional-advancement-score"
  },
  {
    "key": "sustainability",
    "name": "Sustainability Strategy Score",
    "href": "/sustainability-score"
  },
  {
    "key": "revenue-growth",
    "name": "Revenue & Growth Score",
    "href": "/revenue-growth-score"
  }
];

export const AREAS: Area[] = [
  {
    "key": "self-assessment:1",
    "tool": "self-assessment",
    "index": 1,
    "label": "Sustainability Strategy",
    "dimension": "strategy",
    "help": "",
    "helpClass": "",
    "basis": "Strategic planning and risk practice drawn from BoardSource and nonprofit strategic-planning standards."
  },
  {
    "key": "self-assessment:2",
    "tool": "self-assessment",
    "index": 2,
    "label": "Revenue Diversification",
    "dimension": "revenue",
    "help": "",
    "helpClass": "",
    "basis": "Revenue-concentration and pipeline practice drawn from Nonprofit Finance Fund and AFP guidance."
  },
  {
    "key": "self-assessment:3",
    "tool": "self-assessment",
    "index": 3,
    "label": "Leadership & Organizational Development",
    "dimension": "leadership",
    "help": "",
    "helpClass": "",
    "basis": "Role clarity, bench strength, and board alignment drawn from BoardSource and the Daring to Lead studies."
  },
  {
    "key": "self-assessment:4",
    "tool": "self-assessment",
    "index": 4,
    "label": "Operations & Infrastructure",
    "dimension": "operations",
    "help": "",
    "helpClass": "",
    "basis": "Systems, KPI, and documentation practice drawn from the Performance Imperative (Leap Ambassadors)."
  },
  {
    "key": "self-assessment:5",
    "tool": "self-assessment",
    "index": 5,
    "label": "Partnership & Ecosystem Strategy",
    "dimension": "partnerships",
    "help": "",
    "helpClass": "",
    "basis": "Partnership formalization practice drawn from collective-impact and MOU standards."
  },
  {
    "key": "self-assessment:6",
    "tool": "self-assessment",
    "index": 6,
    "label": "Program & Impact Evidence",
    "dimension": "program",
    "help": "Based on the Performance Imperative framework from the Leap Ambassadors Community and standard outcome-measurement practice.",
    "helpClass": "section-note",
    "basis": "Based on the Performance Imperative framework from the Leap Ambassadors Community and standard outcome-measurement practice."
  },
  {
    "key": "self-assessment:7",
    "tool": "self-assessment",
    "index": 7,
    "label": "Governance & Risk",
    "dimension": "governance",
    "help": "Based on the governance questions in Part VI of IRS Form 990 and BoardSource research on board practice.",
    "helpClass": "section-note",
    "basis": "Based on the governance questions in Part VI of IRS Form 990 and BoardSource research on board practice."
  },
  {
    "key": "leadership:1",
    "tool": "leadership",
    "index": 1,
    "label": "Governance Health",
    "dimension": "governance",
    "help": "Based on BoardSource's \"Leading with Intent\" national board-practices research.",
    "helpClass": "fh-field-help",
    "basis": "Based on BoardSource's \"Leading with Intent\" national board-practices research."
  },
  {
    "key": "leadership:2",
    "tool": "leadership",
    "index": 2,
    "label": "Leadership Succession & Bench Strength",
    "dimension": "leadership",
    "help": "Based on CompassPoint & the Meyer Foundation's \"Daring to Lead\" national study of nonprofit executive leadership.",
    "helpClass": "fh-field-help",
    "basis": "Based on CompassPoint & the Meyer Foundation's \"Daring to Lead\" national study of nonprofit executive leadership."
  },
  {
    "key": "leadership:3",
    "tool": "leadership",
    "index": 3,
    "label": "Organizational Alignment & Execution",
    "dimension": "leadership",
    "help": "Based on three outcomes from McKinsey's Organizational Health Index (OHI): Direction, Accountability, and Capabilities.",
    "helpClass": "fh-field-help",
    "basis": "Based on three outcomes from McKinsey's Organizational Health Index (OHI): Direction, Accountability, and Capabilities."
  },
  {
    "key": "leadership:4",
    "tool": "leadership",
    "index": 4,
    "label": "Change Leadership Capacity",
    "dimension": "leadership",
    "help": "Based on John Kotter's 8-Step Change Model (Harvard Business School, \"Leading Change\").",
    "helpClass": "fh-field-help",
    "basis": "Based on John Kotter's 8-Step Change Model (Harvard Business School, \"Leading Change\")."
  },
  {
    "key": "institutional-advancement:1",
    "tool": "institutional-advancement",
    "index": 1,
    "label": "Gift Portfolio Strategy & Staffing",
    "dimension": "revenue",
    "help": "Based on AFP's fundraising staffing and portfolio-size benchmarks.",
    "helpClass": "fh-field-help",
    "basis": "Based on AFP's fundraising staffing and portfolio-size benchmarks."
  },
  {
    "key": "institutional-advancement:2",
    "tool": "institutional-advancement",
    "index": 2,
    "label": "Moves Management & Stewardship",
    "dimension": "revenue",
    "help": "Based on Cornell's moves-management framework and Penelope Burk's donor-centered fundraising research.",
    "helpClass": "fh-field-help",
    "basis": "Based on Cornell's moves-management framework and Penelope Burk's donor-centered fundraising research."
  },
  {
    "key": "institutional-advancement:3",
    "tool": "institutional-advancement",
    "index": 3,
    "label": "Campaign Structure & Readiness",
    "dimension": "revenue",
    "help": "Based on standard capital-campaign phase methodology (feasibility, quiet phase, public phase).",
    "helpClass": "fh-field-help",
    "basis": "Based on standard capital-campaign phase methodology (feasibility, quiet phase, public phase)."
  },
  {
    "key": "institutional-advancement:4",
    "tool": "institutional-advancement",
    "index": 4,
    "label": "Events as Strategy",
    "dimension": "revenue",
    "help": "Based on standard nonprofit fundraising event ROI benchmarks.",
    "helpClass": "fh-field-help",
    "basis": "Based on standard nonprofit fundraising event ROI benchmarks."
  },
  {
    "key": "institutional-advancement:5",
    "tool": "institutional-advancement",
    "index": 5,
    "label": "Planned & Legacy Giving",
    "dimension": "revenue",
    "help": "Based on Giving USA's bequest-giving data, the Chronicle of Philanthropy's planned-giving research, and FreeWill's donor bequest data.",
    "helpClass": "fh-field-help",
    "basis": "Based on Giving USA's bequest-giving data, the Chronicle of Philanthropy's planned-giving research, and FreeWill's donor bequest data."
  },
  {
    "key": "sustainability:1",
    "tool": "sustainability",
    "index": 1,
    "label": "Strategic Clarity & Public Value",
    "dimension": "strategy",
    "help": "Based on Mark Moore's Strategic Triangle (Harvard Kennedy School).",
    "helpClass": "fh-field-help",
    "basis": "Based on Mark Moore's Strategic Triangle (Harvard Kennedy School)."
  },
  {
    "key": "sustainability:2",
    "tool": "sustainability",
    "index": 2,
    "label": "Risk Identification & Management",
    "dimension": "governance",
    "help": "Based on the COSO Enterprise Risk Management Framework.",
    "helpClass": "fh-field-help",
    "basis": "Based on the COSO Enterprise Risk Management Framework."
  },
  {
    "key": "sustainability:3",
    "tool": "sustainability",
    "index": 3,
    "label": "Impact & Financial Sustainability Integration",
    "dimension": "program",
    "help": "Based on the Matrix Map / \"dual bottom line\" model (Bell, Masaoka & Zimmerman, \"Nonprofit Sustainability\").",
    "helpClass": "fh-field-help",
    "basis": "Based on the Matrix Map / \"dual bottom line\" model (Bell, Masaoka & Zimmerman, \"Nonprofit Sustainability\")."
  },
  {
    "key": "sustainability:4",
    "tool": "sustainability",
    "index": 4,
    "label": "Roadmap & Implementation Discipline",
    "dimension": "strategy",
    "help": "Based on the Balanced Scorecard (Kaplan & Norton, Harvard Business School).",
    "helpClass": "fh-field-help",
    "basis": "Based on the Balanced Scorecard (Kaplan & Norton, Harvard Business School)."
  }
];

export const ITEMS: Item[] = [
  {
    "id": "self-assessment:p1q1",
    "tool": "self-assessment",
    "name": "p1q1",
    "area": "self-assessment:1",
    "text": "Our organization has a clear, written strategic plan that guides major decisions."
  },
  {
    "id": "self-assessment:p1q2",
    "tool": "self-assessment",
    "name": "p1q2",
    "area": "self-assessment:1",
    "text": "Leadership regularly reviews organizational risks and has a plan to address them."
  },
  {
    "id": "self-assessment:p1q3",
    "tool": "self-assessment",
    "name": "p1q3",
    "area": "self-assessment:1",
    "text": "We have a defined sustainability roadmap for the next 1-3 years."
  },
  {
    "id": "self-assessment:p2q1",
    "tool": "self-assessment",
    "name": "p2q1",
    "area": "self-assessment:2",
    "text": "We track how much of our budget depends on any single funder, and act before one source grows too large a share."
  },
  {
    "id": "self-assessment:p2q2",
    "tool": "self-assessment",
    "name": "p2q2",
    "area": "self-assessment:2",
    "text": "We have active strategies for grants, corporate partnerships, and earned or contracted revenue."
  },
  {
    "id": "self-assessment:p2q3",
    "tool": "self-assessment",
    "name": "p2q3",
    "area": "self-assessment:2",
    "text": "We track and forecast our revenue pipeline at least quarterly."
  },
  {
    "id": "self-assessment:p3q1",
    "tool": "self-assessment",
    "name": "p3q1",
    "area": "self-assessment:3",
    "text": "Roles and performance expectations are clearly defined across the organization."
  },
  {
    "id": "self-assessment:p3q2",
    "tool": "self-assessment",
    "name": "p3q2",
    "area": "self-assessment:3",
    "text": "Leadership has a plan for developing staff and building bench strength."
  },
  {
    "id": "self-assessment:p3q3",
    "tool": "self-assessment",
    "name": "p3q3",
    "area": "self-assessment:3",
    "text": "The board and executive team agree on strategic priorities in writing and revisit them together at least once a year."
  },
  {
    "id": "self-assessment:p4q1",
    "tool": "self-assessment",
    "name": "p4q1",
    "area": "self-assessment:4",
    "text": "We use consistent systems (CRM, project management, etc.) to track our work and data."
  },
  {
    "id": "self-assessment:p4q2",
    "tool": "self-assessment",
    "name": "p4q2",
    "area": "self-assessment:4",
    "text": "We have KPIs or dashboards that leadership reviews regularly."
  },
  {
    "id": "self-assessment:p4q3",
    "tool": "self-assessment",
    "name": "p4q3",
    "area": "self-assessment:4",
    "text": "Our operational workflows are documented well enough that a new hire could follow them."
  },
  {
    "id": "self-assessment:p5q1",
    "tool": "self-assessment",
    "name": "p5q1",
    "area": "self-assessment:5",
    "text": "We maintain active partnerships across sectors (education, workforce, government, corporate, community) and know what each one contributes."
  },
  {
    "id": "self-assessment:p5q2",
    "tool": "self-assessment",
    "name": "p5q2",
    "area": "self-assessment:5",
    "text": "We have a deliberate strategy for building and stewarding partnerships, not just ad hoc relationships."
  },
  {
    "id": "self-assessment:p5q3",
    "tool": "self-assessment",
    "name": "p5q3",
    "area": "self-assessment:5",
    "text": "Our key partnerships are formalized (MOUs or agreements) where appropriate."
  },
  {
    "id": "self-assessment:p6q1",
    "tool": "self-assessment",
    "name": "p6q1",
    "area": "self-assessment:6",
    "text": "Each major program has a written logic model or theory of change linking its activities to the outcomes we expect."
  },
  {
    "id": "self-assessment:p6q2",
    "tool": "self-assessment",
    "name": "p6q2",
    "area": "self-assessment:6",
    "text": "We regularly collect outcome data (changes in participants’ lives), not just outputs such as people served or sessions held."
  },
  {
    "id": "self-assessment:p6q3",
    "tool": "self-assessment",
    "name": "p6q3",
    "area": "self-assessment:6",
    "text": "We use our results to improve or change programs, and could show a funder an example of when we did."
  },
  {
    "id": "self-assessment:p7q1",
    "tool": "self-assessment",
    "name": "p7q1",
    "area": "self-assessment:7",
    "text": "Our board has adopted the core policies Form 990 asks about: conflict of interest, whistleblower, and document retention."
  },
  {
    "id": "self-assessment:p7q2",
    "tool": "self-assessment",
    "name": "p7q2",
    "area": "self-assessment:7",
    "text": "The full board receives our Form 990 before it’s filed and reviews our annual financial statements or audit."
  },
  {
    "id": "self-assessment:p7q3",
    "tool": "self-assessment",
    "name": "p7q3",
    "area": "self-assessment:7",
    "text": "The board formally evaluates the executive director at least once a year."
  },
  {
    "id": "leadership:g1",
    "tool": "leadership",
    "name": "g1",
    "area": "leadership:1",
    "text": "Our board recruits deliberately, using a written profile of the skills, perspectives, and community relationships our mission needs."
  },
  {
    "id": "leadership:g2",
    "tool": "leadership",
    "name": "g2",
    "area": "leadership:1",
    "text": "Board members have written expectations that include advocating for our mission, not just fundraising and compliance, and they meet them."
  },
  {
    "id": "leadership:g3",
    "tool": "leadership",
    "name": "g3",
    "area": "leadership:1",
    "text": "Board agendas set aside real time for strategy and organizational direction at most meetings, not just reports and fundraising updates."
  },
  {
    "id": "leadership:s1",
    "tool": "leadership",
    "name": "s1",
    "area": "leadership:2",
    "text": "We have a documented, board-approved plan for what happens if our Executive Director leaves unexpectedly."
  },
  {
    "id": "leadership:s2",
    "tool": "leadership",
    "name": "s2",
    "area": "leadership:2",
    "text": "A specific staff member has been named, and prepared, to step in as interim leader if our Executive Director left unexpectedly."
  },
  {
    "id": "leadership:s3",
    "tool": "leadership",
    "name": "s3",
    "area": "leadership:2",
    "text": "Our organization actively invests in developing future leaders (training, mentorship, real delegated authority) rather than concentrating leadership in one person."
  },
  {
    "id": "leadership:a1",
    "tool": "leadership",
    "name": "a1",
    "area": "leadership:3",
    "text": "Our top priorities for this year are written down and shared with staff at every level, so anyone on the team could name them."
  },
  {
    "id": "leadership:a2",
    "tool": "leadership",
    "name": "a2",
    "area": "leadership:3",
    "text": "Roles, decision rights, and performance expectations are clearly defined and consistently followed."
  },
  {
    "id": "leadership:a3",
    "tool": "leadership",
    "name": "a3",
    "area": "leadership:3",
    "text": "Staff skills and training needs are reviewed regularly, and gaps are actively addressed."
  },
  {
    "id": "leadership:c1",
    "tool": "leadership",
    "name": "c1",
    "area": "leadership:4",
    "text": "When we take on a major change, leadership deliberately builds urgency and a guiding coalition to drive it, rather than mandating it top-down."
  },
  {
    "id": "leadership:c2",
    "tool": "leadership",
    "name": "c2",
    "area": "leadership:4",
    "text": "We communicate a clear vision for change and track visible short-term wins along the way, not just a distant end goal."
  },
  {
    "id": "leadership:c3",
    "tool": "leadership",
    "name": "c3",
    "area": "leadership:4",
    "text": "We make changes stick by building them into roles, routines, and policies, so they hold after attention moves elsewhere."
  },
  {
    "id": "institutional-advancement:gp1",
    "tool": "institutional-advancement",
    "name": "gp1",
    "area": "institutional-advancement:1",
    "text": "We segment donors into clear gift levels (e.g., broad-based/annual, mid-level, major, principal) and use a different strategy for each, not one blanket approach."
  },
  {
    "id": "institutional-advancement:gp2",
    "tool": "institutional-advancement",
    "name": "gp2",
    "area": "institutional-advancement:1",
    "text": "Major and principal gift relationships are assigned to a specific staff member's portfolio, not left to whoever has time."
  },
  {
    "id": "institutional-advancement:gp3",
    "tool": "institutional-advancement",
    "name": "gp3",
    "area": "institutional-advancement:1",
    "text": "Board members and other volunteer leaders have defined roles in identifying prospects and opening doors, not just staff."
  },
  {
    "id": "institutional-advancement:mm1",
    "tool": "institutional-advancement",
    "name": "mm1",
    "area": "institutional-advancement:2",
    "text": "We track donors through defined stages (e.g., identification, qualification, cultivation, solicitation, stewardship), not just \"contacted\" or \"not.\""
  },
  {
    "id": "institutional-advancement:mm2",
    "tool": "institutional-advancement",
    "name": "mm2",
    "area": "institutional-advancement:2",
    "text": "Every gift is acknowledged promptly with more than a generic, automated receipt."
  },
  {
    "id": "institutional-advancement:mm3",
    "tool": "institutional-advancement",
    "name": "mm3",
    "area": "institutional-advancement:2",
    "text": "We have a deliberate stewardship plan for donors after the ask, not just before it: impact updates, personal touches, recognition tied to gift level."
  },
  {
    "id": "institutional-advancement:cs1",
    "tool": "institutional-advancement",
    "name": "cs1",
    "area": "institutional-advancement:3",
    "text": "Before launching a campaign, we run a real feasibility assessment (confidential interviews with top prospects), rather than setting a goal and hoping."
  },
  {
    "id": "institutional-advancement:cs2",
    "tool": "institutional-advancement",
    "name": "cs2",
    "area": "institutional-advancement:3",
    "text": "We understand and plan for a quiet/leadership phase, securing a strong majority of the goal from major donors before any public announcement."
  },
  {
    "id": "institutional-advancement:cs3",
    "tool": "institutional-advancement",
    "name": "cs3",
    "area": "institutional-advancement:3",
    "text": "We have a realistic campaign timeline and a specific, compelling case for support, not a general \"help us\" appeal."
  },
  {
    "id": "institutional-advancement:ev1",
    "tool": "institutional-advancement",
    "name": "ev1",
    "area": "institutional-advancement:4",
    "text": "We track true net revenue and cost-per-dollar-raised for each event, not just gross revenue."
  },
  {
    "id": "institutional-advancement:ev2",
    "tool": "institutional-advancement",
    "name": "ev2",
    "area": "institutional-advancement:4",
    "text": "Our events are planned as cultivation touchpoints, with follow-up for key guests, not only as fundraising transactions."
  },
  {
    "id": "institutional-advancement:ev3",
    "tool": "institutional-advancement",
    "name": "ev3",
    "area": "institutional-advancement:4",
    "text": "We evaluate whether each event is worth repeating based on ROI and strategic fit, rather than running it again out of habit."
  },
  {
    "id": "institutional-advancement:pg1",
    "tool": "institutional-advancement",
    "name": "pg1",
    "area": "institutional-advancement:5",
    "text": "We actively invite donors to consider a bequest or legacy gift, through stewardship conversations, website materials, or a named legacy society, rather than only responding if a donor raises it first."
  },
  {
    "id": "institutional-advancement:pg2",
    "tool": "institutional-advancement",
    "name": "pg2",
    "area": "institutional-advancement:5",
    "text": "We keep a list of likely bequest prospects based on giving history and engagement, not guesswork."
  },
  {
    "id": "institutional-advancement:pg3",
    "tool": "institutional-advancement",
    "name": "pg3",
    "area": "institutional-advancement:5",
    "text": "When a donor lets us know about a planned or bequest gift, we have a deliberate way to steward that commitment (recognition, updates, a legacy society) not just a thank-you and a file."
  },
  {
    "id": "sustainability:st1",
    "tool": "sustainability",
    "name": "st1",
    "area": "sustainability:1",
    "text": "Our top two or three strategic priorities are written down and used consistently by staff, board, and leadership."
  },
  {
    "id": "sustainability:st2",
    "tool": "sustainability",
    "name": "st2",
    "area": "sustainability:1",
    "text": "Our strategy clearly identifies who benefits from our work and what specific value we create for them."
  },
  {
    "id": "sustainability:st3",
    "tool": "sustainability",
    "name": "st3",
    "area": "sustainability:1",
    "text": "We have written criteria for deciding whether a new opportunity or request fits our strategic priorities."
  },
  {
    "id": "sustainability:r1",
    "tool": "sustainability",
    "name": "r1",
    "area": "sustainability:2",
    "text": "We maintain a written list of our top risks (financial, operational, reputational, and strategic), not just an informal sense of them."
  },
  {
    "id": "sustainability:r2",
    "tool": "sustainability",
    "name": "r2",
    "area": "sustainability:2",
    "text": "Risk is reviewed on a regular, scheduled basis, not just when something goes wrong or during a funding application."
  },
  {
    "id": "sustainability:r3",
    "tool": "sustainability",
    "name": "r3",
    "area": "sustainability:2",
    "text": "We have a written contingency plan for losing our largest funding source or a key leader suddenly."
  },
  {
    "id": "sustainability:i1",
    "tool": "sustainability",
    "name": "i1",
    "area": "sustainability:3",
    "text": "We track, program by program, which programs are financially self-sustaining and which are subsidized by other revenue."
  },
  {
    "id": "sustainability:i2",
    "tool": "sustainability",
    "name": "i2",
    "area": "sustainability:3",
    "text": "Decisions about which programs to grow, maintain, or sunset weigh both mission impact and financial contribution together."
  },
  {
    "id": "sustainability:i3",
    "tool": "sustainability",
    "name": "i3",
    "area": "sustainability:3",
    "text": "Leadership and the board review, at least once a year, which mission-critical programs aren't financially sustainable on their own and how they'll be funded."
  },
  {
    "id": "sustainability:e1",
    "tool": "sustainability",
    "name": "e1",
    "area": "sustainability:4",
    "text": "Our strategic priorities are translated into specific initiatives with owners and timelines, not just stated goals."
  },
  {
    "id": "sustainability:e2",
    "tool": "sustainability",
    "name": "e2",
    "area": "sustainability:4",
    "text": "We track a small set of key metrics regularly (at least quarterly) that show whether we're actually executing the strategy."
  },
  {
    "id": "sustainability:e3",
    "tool": "sustainability",
    "name": "e3",
    "area": "sustainability:4",
    "text": "Progress against our strategic plan is reviewed and adjusted at least once or twice a year, not filed away until the next planning cycle."
  }
];

// Revenue & Growth Score is figures, not answers: each metric counts as
// one item on Revenue and Financial Health.
export const METRIC_DIMENSION: DimensionKey = 'revenue';

export const RUBRIC = ['Not in place', 'Talked about', 'Informal', 'Documented', 'Verified'];

export const areasFor = (tool: string) => AREAS.filter((a) => a.tool === tool).sort((a, b) => a.index - b.index);
export const itemsFor = (areaKey: string) => ITEMS.filter((i) => i.area === areaKey);
export const dimension = (k: DimensionKey) => DIMENSIONS.find((d) => d.key === k)!;

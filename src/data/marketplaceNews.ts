export interface NewsItem {
  id: string;
  title: string;
  topic: string;
  source: string;
  date: string;
  summary: string;
  body: string;
  readers?: number;
}

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Accreditation standards update: what practices must change this year",
    topic: "Compliance",
    source: "Practicare Insights",
    date: "2026-08-18",
    readers: 970,
    summary:
      "New evidence requirements mean practices need documented, date-stamped checklists for infection control and cold-chain monitoring.",
    body:
      "Assessors are increasingly asking for time-stamped evidence rather than policy documents alone. Practices that log daily checks digitally are passing first time, while paper-based practices are being asked for remediation. Review your infection control, cold chain and emergency equipment checks, and make sure each has a named owner and a visible completion history.",
  },
  {
    id: "n2",
    title: "Practice manager salary benchmarks released for 2026",
    topic: "Workforce",
    source: "Industry Report",
    date: "2026-08-11",
    summary:
      "Median practice manager remuneration rose 4.8% year on year, with the largest gains in regional multi-site groups.",
    body:
      "The latest benchmarking data shows multi-site practice managers commanding a premium of 12-18% over single-site roles. Retention strategies that worked best were structured rostering, clear escalation paths and documented career progression.",
  },
  {
    id: "n3",
    title: "Cyber security: five controls every clinic should have in place",
    topic: "IT & Technology",
    source: "MediTech IT Partners",
    date: "2026-08-04",
    readers: 1176,
    summary:
      "MFA, patched clinical software, tested backups, staff phishing training and least-privilege access remain the highest-value controls.",
    body:
      "Most clinical data incidents still start with a compromised password or an unpatched workstation. Start with multi-factor authentication on email and clinical software, verify that backups restore, and review who still has access after staff changes.",
  },
  {
    id: "n4",
    title: "Bulk-billing incentive changes: modelling the impact on your revenue",
    topic: "Finance",
    source: "Ledger Health Accounting",
    date: "2026-07-28",
    readers: 292,
    summary:
      "Practices should re-run their billing mix scenarios now, before the new incentive tiers take effect.",
    body:
      "The change affects short and standard consultations differently. Model your last three months of billing against the new tiers to see whether your current mix still covers overheads, and review your fee schedule accordingly.",
  },
  {
    id: "n5",
    title: "Recruitment: how to cut nurse time-to-hire in half",
    topic: "Recruitment",
    source: "Pulse Medical Recruitment",
    date: "2026-07-20",
    readers: 540,
    summary:
      "Pre-verified AHPRA candidate pools and structured onboarding checklists are the biggest levers on time-to-hire.",
    body:
      "Practices that keep a live shortlist and a standard onboarding checklist fill vacancies in around 18 days versus 40 for ad-hoc hiring. Standardise the first two weeks: access, training modules, buddy shifts and a 14-day review.",
  },
  {
    id: "n6",
    title: "Cold chain breaches: the three most common causes",
    topic: "Compliance",
    source: "Practicare Insights",
    date: "2026-07-09",
    readers: 118,
    summary:
      "Door-ajar events, unmonitored weekends and unlabelled stock rotation account for most reported breaches.",
    body:
      "Twice-daily logging with min/max recording, a weekend escalation contact and clear stock rotation labelling resolve the majority of breaches before vaccines are lost.",
  },
];

export function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.round(diff / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString();
}

export const NEWS_TOPICS = ["All", ...Array.from(new Set(NEWS.map((n) => n.topic)))];

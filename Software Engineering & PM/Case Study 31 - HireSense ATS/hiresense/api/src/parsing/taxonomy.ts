// Canonical skill ids (lowercase) → accepted spellings. Matching is word-boundary, case-insensitive.
export const SKILLS: Record<string, string[]> = {
  react: ["React", "React.js", "ReactJS"],
  typescript: ["TypeScript", "TS"],
  javascript: ["JavaScript", "ES6", "JS"],
  "next.js": ["Next.js", "NextJS"],
  vue: ["Vue", "Vue.js"],
  angular: ["Angular"],
  html: ["HTML", "HTML5"],
  css: ["CSS", "CSS3", "SCSS"],
  tailwind: ["Tailwind", "Tailwind CSS"],
  redux: ["Redux"],
  graphql: ["GraphQL"],
  java: ["Java"],
  "spring boot": ["Spring Boot", "Spring Framework"],
  "node.js": ["Node.js", "NodeJS", "Node"],
  python: ["Python"],
  django: ["Django"],
  fastapi: ["FastAPI"],
  sql: ["SQL"],
  postgresql: ["PostgreSQL", "Postgres"],
  mysql: ["MySQL"],
  mongodb: ["MongoDB"],
  redis: ["Redis"],
  kafka: ["Kafka", "Apache Kafka"],
  microservices: ["Microservices"],
  hibernate: ["Hibernate"],
  excel: ["Excel", "MS Excel", "Advanced Excel"],
  "power bi": ["Power BI", "PowerBI"],
  tableau: ["Tableau"],
  pandas: ["Pandas"],
  statistics: ["Statistics"],
  "machine learning": ["Machine Learning", "ML"],
  aws: ["AWS", "Amazon Web Services"],
  azure: ["Azure"],
  gcp: ["GCP", "Google Cloud"],
  docker: ["Docker"],
  kubernetes: ["Kubernetes", "K8s"],
  terraform: ["Terraform"],
  jenkins: ["Jenkins"],
  "ci/cd": ["CI/CD", "CICD"],
  linux: ["Linux"],
  ansible: ["Ansible"],
  prometheus: ["Prometheus"],
  selenium: ["Selenium", "Selenium WebDriver"],
  cypress: ["Cypress"],
  playwright: ["Playwright"],
  jmeter: ["JMeter"],
  postman: ["Postman"],
  testng: ["TestNG"],
  junit: ["JUnit"],
  "test automation": ["Test Automation", "Automation Testing"],
  salesforce: ["Salesforce"],
  hubspot: ["HubSpot"],
  crm: ["CRM"],
  "lead generation": ["Lead Generation", "Lead Gen"],
  "cold calling": ["Cold Calling"],
  negotiation: ["Negotiation"],
  git: ["Git", "GitHub"],
  agile: ["Agile", "Scrum"],
  jira: ["Jira"],
};

export const SKILL_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(SKILLS).map(([id, aliases]) => [id, aliases[0]!]),
);

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const SKILL_PATTERNS: [string, RegExp][] = Object.entries(SKILLS).map(([id, aliases]) => [
  id,
  // "." before counts as part of a word so "Node.js" never matches the "JS" alias of JavaScript
  new RegExp(`(?<![A-Za-z0-9.])(?:${aliases.map(esc).join("|")})(?![A-Za-z0-9])`, "i"),
]);

export function matchSkills(text: string): string[] {
  return SKILL_PATTERNS.filter(([, re]) => re.test(text)).map(([id]) => id);
}

// Canonical city → spellings.
export const CITIES: Record<string, string[]> = {
  Bengaluru: ["Bengaluru", "Bangalore"],
  Mumbai: ["Mumbai", "Bombay"],
  Pune: ["Pune"],
  Hyderabad: ["Hyderabad"],
  Chennai: ["Chennai", "Madras"],
  Gurugram: ["Gurugram", "Gurgaon"],
  Noida: ["Noida"],
  Delhi: ["New Delhi", "Delhi"],
  Kolkata: ["Kolkata", "Calcutta"],
  Ahmedabad: ["Ahmedabad"],
  Jaipur: ["Jaipur"],
  Kochi: ["Kochi", "Cochin"],
  Indore: ["Indore"],
  Chandigarh: ["Chandigarh"],
  Lucknow: ["Lucknow"],
  Nagpur: ["Nagpur"],
  Coimbatore: ["Coimbatore"],
  Bhubaneswar: ["Bhubaneswar"],
};

const CITY_PATTERNS: [string, RegExp][] = Object.entries(CITIES).map(([city, names]) => [
  city,
  new RegExp(`(?<![A-Za-z])(?:${names.map(esc).join("|")})(?![A-Za-z])`, "i"),
]);

/** The city mentioned first in the text (a contact line lists the candidate's city before anything else). */
export function matchCity(text: string): string | null {
  let best: { city: string; at: number } | null = null;
  for (const [city, re] of CITY_PATTERNS) {
    const at = text.search(re);
    if (at >= 0 && (!best || at < best.at)) best = { city, at };
  }
  return best?.city ?? null;
}

/** True when the text names this specific (canonical) city under any of its spellings. */
export function mentionsCity(text: string, city: string): boolean {
  return CITY_PATTERNS.some(([c, re]) => c === city && re.test(text));
}

/**
 * Illustrative university tiers used ONLY by the bias audit (the case study's internal review
 * found legacy ranking tracked university tier). Scoring and ranking never read this.
 */
export const UNIVERSITIES: Record<string, 1 | 2 | 3> = {
  "IIT Bombay": 1,
  "IIT Delhi": 1,
  "IIT Madras": 1,
  "BITS Pilani": 1,
  "NIT Trichy": 1,
  "IIIT Hyderabad": 1,
  "VIT Vellore": 2,
  "Manipal Institute of Technology": 2,
  "PES University": 2,
  "Thapar Institute of Engineering": 2,
  "COEP Technological University": 2,
  "SRM Institute of Science and Technology": 2,
  "Amity University": 2,
  "Savitribai Phule Pune University": 3,
  "University of Mumbai": 3,
  "Osmania University": 3,
  "Rashtrasant Tukadoji Maharaj Nagpur University": 3,
  "Rajiv Gandhi Proudyogiki Vishwavidyalaya": 3,
  "Dr. A.P.J. Abdul Kalam Technical University": 3,
  "Gujarat Technological University": 3,
  "Visvesvaraya Technological University": 3,
  "Anna University": 3,
};

export function matchUniversity(text: string): string | null {
  const lower = text.toLowerCase();
  // longest name first so "IIT Bombay" never shadows a longer name that contains it
  for (const u of Object.keys(UNIVERSITIES).sort((a, b) => b.length - a.length))
    if (lower.includes(u.toLowerCase())) return u;
  return null;
}

export function universityTier(u: string | null): string {
  const t = u ? UNIVERSITIES[u] : undefined;
  return t ? `Tier ${t}` : "Unknown";
}

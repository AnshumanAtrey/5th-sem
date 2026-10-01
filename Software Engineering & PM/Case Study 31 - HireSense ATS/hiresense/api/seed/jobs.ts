import type { Criteria } from "../src/types";

export interface JobSeed {
  title: string;
  department: string;
  applications: number;
  yearsMean: number;
  yearsSd: number;
  titles: string[];
  pool: string[]; // optional skills candidates for this role tend to have
  degrees: string[];
  criteria: Criteria;
  /** Later criteria version, applied to applications on/after `from`. */
  revision?: { from: string; note: string; criteria: Criteria };
}

const b = (...rows: [number, number, number][]) => rows.map(([min, max, score]) => ({ min, max, score }));

export const JOBS: JobSeed[] = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    applications: 420,
    yearsMean: 5.5,
    yearsSd: 3,
    titles: ["Frontend Engineer", "Senior Frontend Engineer", "UI Developer", "Software Engineer (Frontend)", "Web Developer"],
    pool: ["javascript", "next.js", "redux", "css", "html", "tailwind", "graphql", "node.js", "git", "agile"],
    degrees: ["B.Tech, Computer Science", "B.E., Information Technology", "BCA", "B.Sc, Computer Science"],
    criteria: { mandatorySkills: ["react", "typescript"], bands: b([0, 2, 20], [2, 4, 55], [4, 7, 85], [7, 12, 90], [12, 99, 80]), threshold: 80, location: "Bengaluru", remoteAllowed: true },
    revision: {
      from: "2026-03-01",
      note: "Lowered threshold 80 → 75 and widened the 2–4 yr band after hiring-manager review",
      criteria: { mandatorySkills: ["react", "typescript"], bands: b([0, 2, 25], [2, 4, 60], [4, 7, 85], [7, 12, 90], [12, 99, 80]), threshold: 75, location: "Bengaluru", remoteAllowed: true },
    },
  },
  {
    title: "Backend Engineer (Java)",
    department: "Engineering",
    applications: 380,
    yearsMean: 4.5,
    yearsSd: 2.8,
    titles: ["Java Developer", "Backend Engineer", "Software Engineer", "Senior Java Developer"],
    pool: ["microservices", "hibernate", "kafka", "mysql", "postgresql", "redis", "docker", "aws", "git", "jenkins"],
    degrees: ["B.Tech, Computer Science", "B.E., Computer Engineering", "B.Tech, Electronics & Communication", "MCA"],
    criteria: { mandatorySkills: ["java", "spring boot", "sql"], bands: b([0, 1, 30], [1, 3, 60], [3, 6, 85], [6, 10, 90], [10, 99, 85]), threshold: 60, location: "Pune", remoteAllowed: false },
  },
  {
    title: "Data Analyst",
    department: "Analytics",
    applications: 360,
    yearsMean: 3,
    yearsSd: 2.2,
    titles: ["Data Analyst", "Business Analyst", "MIS Executive", "Analytics Associate"],
    pool: ["python", "power bi", "tableau", "pandas", "statistics", "machine learning"],
    degrees: ["B.Sc, Statistics", "B.Com", "B.Tech, Computer Science", "BBA", "M.Sc, Mathematics"],
    criteria: { mandatorySkills: ["sql", "excel"], bands: b([0, 1, 50], [1, 3, 75], [3, 6, 85], [6, 99, 80]), threshold: 70, location: "Mumbai", remoteAllowed: true },
  },
  {
    title: "DevOps Engineer",
    department: "Platform",
    applications: 300,
    yearsMean: 4.5,
    yearsSd: 2.6,
    titles: ["DevOps Engineer", "Site Reliability Engineer", "Cloud Engineer", "Systems Engineer"],
    pool: ["terraform", "jenkins", "ci/cd", "linux", "ansible", "prometheus", "python", "git", "azure", "gcp"],
    degrees: ["B.Tech, Computer Science", "B.E., Information Technology", "B.Tech, Electronics & Communication", "BCA"],
    criteria: { mandatorySkills: ["aws", "docker", "kubernetes"], bands: b([0, 2, 30], [2, 4, 65], [4, 8, 85], [8, 99, 90]), threshold: 65, location: "Hyderabad", remoteAllowed: true },
  },
  {
    title: "QA Automation Engineer",
    department: "Quality",
    applications: 280,
    yearsMean: 3.5,
    yearsSd: 2.2,
    titles: ["QA Engineer", "Test Automation Engineer", "SDET", "Quality Analyst"],
    pool: ["testng", "junit", "cypress", "playwright", "postman", "jmeter", "test automation", "jira", "agile", "git"],
    degrees: ["B.Tech, Computer Science", "B.E., Information Technology", "B.Sc, Computer Science", "BCA"],
    criteria: { mandatorySkills: ["selenium", "java"], bands: b([0, 1, 40], [1, 3, 70], [3, 6, 85], [6, 99, 80]), threshold: 70, location: "Chennai", remoteAllowed: false },
  },
  {
    title: "Sales Development Representative",
    department: "Sales",
    applications: 260,
    yearsMean: 2.5,
    yearsSd: 2,
    titles: ["Sales Development Representative", "Business Development Executive", "Inside Sales Associate", "Account Executive"],
    pool: ["salesforce", "hubspot", "lead generation", "cold calling", "negotiation", "excel"],
    degrees: ["BBA", "B.Com", "MBA, Marketing", "BA, Economics"],
    criteria: { mandatorySkills: ["crm"], bands: b([0, 1, 60], [1, 3, 80], [3, 5, 75], [5, 99, 60]), threshold: 60, location: "Gurugram", remoteAllowed: false },
  },
];

// Synthetic candidate profiles. Everything here is dummy data generated from a fixed seed.
import { CITIES, SKILL_LABEL, UNIVERSITIES } from "../src/parsing/taxonomy";
import type { JobSeed } from "./jobs";
import type { Rng } from "./rng";

const WOMEN = ["Priya", "Ananya", "Aishwarya", "Kavya", "Sneha", "Pooja", "Neha", "Divya", "Riya", "Shreya", "Meera", "Isha", "Nandini", "Aditi", "Sanya", "Tanvi", "Fatima", "Zoya", "Ayesha", "Harpreet", "Simran", "Lakshmi", "Revathi", "Deepika", "Anjali", "Swati", "Shruti", "Megha", "Pallavi", "Nisha", "Sakshi", "Mehak", "Radhika", "Keerthana", "Bhavya", "Sana", "Farah", "Jasleen", "Ishita", "Madhuri"];
const MEN = ["Arjun", "Rahul", "Rohan", "Aditya", "Vikram", "Karan", "Siddharth", "Aman", "Nikhil", "Varun", "Rohit", "Akash", "Harsh", "Kunal", "Pranav", "Yash", "Ishaan", "Aarav", "Vivek", "Manish", "Sandeep", "Imran", "Faisal", "Arif", "Gurpreet", "Harjeet", "Suresh", "Ramesh", "Karthik", "Venkat", "Arvind", "Abhishek", "Deepak", "Tushar", "Omkar", "Sahil", "Ankit", "Mohit", "Tanmay", "Anirudh"];
const NEUTRAL = ["Kiran", "Sai", "Noor", "Arya", "Jaya", "Ashwin", "Shiv", "Ray"];
const SURNAMES = ["Sharma", "Verma", "Iyer", "Nair", "Menon", "Reddy", "Rao", "Patel", "Shah", "Mehta", "Desai", "Kulkarni", "Deshpande", "Joshi", "Patil", "Jadhav", "Gupta", "Agarwal", "Bansal", "Singh", "Kaur", "Gill", "Khan", "Shaikh", "Qureshi", "Ansari", "Das", "Banerjee", "Chatterjee", "Mukherjee", "Bose", "Sen", "Pillai", "Krishnan", "Subramanian", "Naidu", "Chowdhury", "Mishra", "Tiwari", "Pandey", "Yadav", "Saxena", "Kapoor", "Malhotra", "Bhatia", "D'Souza", "Fernandes", "Pereira", "Thomas", "George"];
const COMPANIES = ["Infosys", "TCS", "Wipro", "Zoho", "Freshworks", "Swiggy", "Razorpay", "Flipkart", "Paytm", "CRED", "Zomato", "Accenture", "Capgemini", "Cognizant", "HCLTech", "Tech Mahindra", "LTIMindtree", "Deloitte", "Myntra", "PhonePe", "Meesho", "Urban Company", "InMobi", "BrowserStack", "Postman", "Chargebee", "Druva", "Persistent Systems", "Nykaa", "Groww", "Zeta", "ShareChat", "Dream11", "Juspay", "MakeMyTrip"];
const DOMAINS = ["gmail.com", "outlook.com", "yahoo.co.in", "proton.me"];

export type Gender = "Woman" | "Man" | "Non-binary" | "Prefer not to say";
export type CaseType = "standard" | "scanned" | "two_column" | "creative_headings" | "odd_dates";

export interface Job {
  title: string;
  company: string;
  start: [number, number]; // [year, monthIndex]
  end: [number, number] | "present";
  bullets: string[];
}

export interface Profile {
  name: string;
  email: string;
  phone: string;
  gender: Gender;
  age: number;
  city: string;
  university: string;
  degree: string;
  gradYear: number;
  headline: string;
  summary: string;
  skills: string[]; // canonical ids
  jobs: Job[];
  years: number; // ground truth: union of job spans
  appliedAt: Date;
  caseType: CaseType;
}

const BULLETS = [
  "Built and shipped {a} features used by 1M+ monthly users",
  "Migrated a legacy module to {a}, cutting page load time by 35%",
  "Owned the {a} and {b} workstream end-to-end with product and design",
  "Automated reporting with {a}, saving the team 6 hours a week",
  "Mentored two junior teammates on {a} best practices",
  "Reduced incident count by 40% by hardening {a} pipelines",
  "Designed {a} dashboards adopted by regional leadership",
  "Improved {a} test coverage from 45% to 80%",
  "Closed INR 1.2 Cr pipeline through {a}-driven outreach",
];

export const ageBand = (age: number) => (age < 30 ? "18–29" : age < 40 ? "30–39" : "40+");

export function makeProfile(r: Rng, job: JobSeed, appliedAt: Date): Omit<Profile, "caseType"> {
  const gender = r.weighted<Gender>([["Woman", 40], ["Man", 54], ["Non-binary", 2], ["Prefer not to say", 4]]);
  const first = gender === "Woman" ? r.pick(WOMEN) : gender === "Man" ? r.pick(MEN) : r.pick(NEUTRAL.concat(WOMEN, MEN));
  const last = r.pick(SURNAMES);
  const name = `${first} ${last}`;
  const email = `${first}.${last.replace(/[^A-Za-z]/g, "")}${r.int(1, 99)}@${r.pick(DOMAINS)}`.toLowerCase();
  const phone = `+91 ${r.int(6, 9)}${r.int(1000, 9999)} ${r.int(10000, 99999)}`;

  const years = Math.max(0, Math.min(18, r.normal(job.yearsMean, job.yearsSd)));
  const age = Math.round(21 + years + r.int(0, 3));
  const city = r.chance(0.45) ? job.criteria.location : r.pick(Object.keys(CITIES).filter((c) => c !== job.criteria.location));

  const unis = Object.entries(UNIVERSITIES);
  const tier = r.weighted<1 | 2 | 3>([[1, 12], [2, 33], [3, 55]]);
  const university = r.pick(unis.filter(([, t]) => t === tier))[0];

  const skills = [
    ...job.criteria.mandatorySkills.filter(() => r.chance(0.84)),
    ...r.sample(job.pool, r.int(2, Math.min(6, job.pool.length))),
  ];

  // Split the career into 1–4 jobs ending at (or shortly before) the application date.
  const jobs: Job[] = [];
  let months = Math.round(years * 12);
  const totalMonths = months;
  let cursor = appliedAt.getFullYear() * 12 + appliedAt.getMonth();
  const endsNow = r.chance(0.75);
  if (!endsNow) cursor -= r.int(1, 4);
  const count = months < 12 ? (months > 2 ? 1 : 0) : Math.min(4, 1 + Math.floor(months / r.int(18, 36)));
  for (let i = 0; i < count; i++) {
    const span = i === count - 1 ? months : Math.max(6, Math.round(months / (count - i) + r.int(-6, 6)));
    const end = cursor;
    const start = end - span;
    const [a, b2] = r.sample(skills, 2);
    jobs.push({
      title: r.pick(job.titles),
      company: r.pick(COMPANIES),
      start: [Math.floor(start / 12), start % 12],
      end: i === 0 && endsNow ? "present" : [Math.floor(end / 12), end % 12],
      bullets: r.sample(BULLETS, 2).map((t) => t.replace("{a}", label(a)).replace("{b}", label(b2 ?? a))),
    });
    months -= span;
    cursor = start - r.int(1, 3); // gap between jobs is not experience
  }
  const truthMonths = jobs.reduce((s, j) => {
    const e = j.end === "present" ? appliedAt.getFullYear() * 12 + appliedAt.getMonth() : j.end[0] * 12 + j.end[1];
    return s + (e - (j.start[0] * 12 + j.start[1]));
  }, 0);

  const firstStart = jobs.length ? jobs[jobs.length - 1]!.start[0] : appliedAt.getFullYear();
  const headline = jobs[0]?.title ?? `Aspiring ${job.titles[0]}`;
  return {
    name, email, phone, gender, age, city, university,
    degree: r.pick(job.degrees),
    gradYear: jobs.length ? firstStart : appliedAt.getFullYear() - r.int(0, 1),
    headline,
    summary: totalMonths >= 12
      ? `${headline} with ${Math.floor(totalMonths / 12)}+ years of experience. Comfortable with ${skills.slice(0, 3).map(label).join(", ")}.`
      : `Early-career ${job.titles[0]!.toLowerCase()} looking for a first full-time role. Comfortable with ${skills.slice(0, 3).map(label).join(", ")}.`,
    skills,
    jobs,
    years: Math.round((truthMonths / 12) * 10) / 10,
    appliedAt,
  };
}

export const label = (id: string | undefined) => (id ? SKILL_LABEL[id] ?? id : "");

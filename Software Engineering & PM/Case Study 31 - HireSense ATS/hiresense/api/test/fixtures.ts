import type { Profile } from "../seed/people";
import type { Criteria, ParsedResume } from "../src/types";

export const criteria = (over: Partial<Criteria> = {}): Criteria => ({
  mandatorySkills: ["react", "typescript"],
  bands: [
    { min: 0, max: 2, score: 20 },
    { min: 2, max: 4, score: 55 },
    { min: 4, max: 7, score: 85 },
    { min: 7, max: 99, score: 90 },
  ],
  threshold: 80,
  location: "Bengaluru",
  remoteAllowed: true,
  ...over,
});

export const parsed = (over: Partial<ParsedResume> = {}): ParsedResume => ({
  name: "Test Candidate",
  email: "t@example.com",
  phone: null,
  location: "Bengaluru",
  skills: ["react", "typescript", "css"],
  yearsExperience: 5,
  university: "Anna University",
  confidence: 0.9,
  breakdown: { textLayer: 1, fields: {} },
  issues: [],
  textChars: 1500,
  parser: "test",
  ...over,
});

export const profile = (over: Partial<Profile> = {}): Profile => ({
  name: "Ananya Iyer",
  email: "ananya.iyer@example.com",
  phone: "+91 98765 43210",
  gender: "Woman",
  age: 29,
  city: "Pune",
  university: "PES University",
  degree: "B.Tech, Computer Science",
  gradYear: 2019,
  headline: "Frontend Engineer",
  summary: "Frontend Engineer with 5+ years of experience. Comfortable with React, TypeScript, CSS.",
  skills: ["react", "typescript", "css", "redux"],
  jobs: [
    { title: "Frontend Engineer", company: "Zoho", start: [2022, 2], end: "present", bullets: ["Built React features used by 1M+ monthly users"] },
    { title: "UI Developer", company: "Infosys", start: [2019, 6], end: [2022, 0], bullets: ["Migrated a legacy module to TypeScript"] },
  ],
  years: 6.1,
  appliedAt: new Date("2026-03-15T10:00:00Z"),
  caseType: "standard",
  ...over,
});

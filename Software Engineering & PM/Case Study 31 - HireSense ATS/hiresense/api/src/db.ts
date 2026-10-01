import { Database } from "bun:sqlite";
import { mkdirSync } from "node:fs";

export const DATA_DIR = process.env.HIRESENSE_DATA ?? `${import.meta.dir}/../data/`;
export const RESUME_DIR = `${DATA_DIR}resumes/`;
mkdirSync(RESUME_DIR, { recursive: true });

export const SCHEMA = /* sql */ `
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  opened_at TEXT NOT NULL,
  auto_reject_paused INTEGER NOT NULL DEFAULT 0,
  paused_reason TEXT
);

-- Ranking criteria are data, not code: every change is a new immutable version.
CREATE TABLE IF NOT EXISTS criteria_versions (
  id INTEGER PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  version INTEGER NOT NULL,
  criteria TEXT NOT NULL,
  note TEXT,
  author TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (job_id, version)
);

CREATE TABLE IF NOT EXISTS candidates (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  created_at TEXT NOT NULL
);

-- Voluntary self-identification. Read only by the audit module, never by screening.
CREATE TABLE IF NOT EXISTS self_id (
  candidate_id INTEGER PRIMARY KEY REFERENCES candidates(id),
  gender TEXT NOT NULL DEFAULT 'Prefer not to say',
  age_band TEXT NOT NULL DEFAULT 'Prefer not to say'
);

CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY,
  candidate_id INTEGER NOT NULL REFERENCES candidates(id),
  job_id INTEGER NOT NULL REFERENCES jobs(id),
  resume_file TEXT NOT NULL,
  applied_at TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'seed',
  status TEXT,
  score INTEGER,
  criteria_version_id INTEGER,
  legacy_outcome TEXT,
  legacy_score INTEGER
);
CREATE INDEX IF NOT EXISTS applications_job ON applications(job_id, status);

CREATE TABLE IF NOT EXISTS parses (
  id INTEGER PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  parser TEXT NOT NULL,
  result TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS parses_app ON parses(application_id, is_current);

-- Every automated (and human) decision with its reason and full CFG trace. Append-only.
CREATE TABLE IF NOT EXISTS decision_log (
  id INTEGER PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  job_id INTEGER NOT NULL,
  outcome TEXT NOT NULL,
  tentative_outcome TEXT,
  reason_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  score INTEGER NOT NULL,
  criteria_version_id INTEGER NOT NULL,
  parser TEXT NOT NULL,
  confidence REAL NOT NULL,
  trace TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS decision_app ON decision_log(application_id);
CREATE INDEX IF NOT EXISTS decision_outcome ON decision_log(outcome, reason_code);
CREATE TRIGGER IF NOT EXISTS decision_log_no_update BEFORE UPDATE ON decision_log
  BEGIN SELECT RAISE(ABORT, 'decision_log is append-only'); END;
CREATE TRIGGER IF NOT EXISTS decision_log_no_delete BEFORE DELETE ON decision_log
  BEGIN SELECT RAISE(ABORT, 'decision_log is append-only'); END;

CREATE TABLE IF NOT EXISTS audits (
  id INTEGER PRIMARY KEY,
  job_id INTEGER,
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  trigger TEXT NOT NULL,
  results TEXT NOT NULL,
  breached INTEGER NOT NULL,
  min_ratio REAL,
  severity TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Seed-only ground truth, used to measure parser accuracy honestly.
CREATE TABLE IF NOT EXISTS seed_truth (
  application_id INTEGER PRIMARY KEY,
  case_type TEXT NOT NULL,
  truth TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

export function openDb(path = `${DATA_DIR}hiresense.db`) {
  const db = new Database(path, { create: true, strict: true });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

export type DB = ReturnType<typeof openDb>;

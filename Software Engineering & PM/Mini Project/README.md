# SE&PM Mini Project — EmpowerHR

the mini project for Software Engineering & Project Management, sem 5. this folder is the whole
submission in one place: the project management documents on one side, the actual working code on
the other. think of it like a case file, the paperwork up front, the evidence (the app) attached.

> this is the **mini project**, not the exam/final project. the exam project is a separate thing
> (Case Study 31 - HireSense ATS), kept in its own folder next to this one.

## what the project is

**EmpowerHR** (in-app name *LeavePortal*), an Employee Leave, Approval & Performance Management
Portal. a full-stack web app where employees apply for leave, it gets approved through a
manager &rarr; HR workflow, balances are tracked, and managers run lightweight performance goals
with feedback.

- **frontend:** React + Vite
- **backend:** Node + Express
- **database:** PostgreSQL via Prisma
- **infra:** Docker (local DB), Terraform + GitHub Actions

the SE&PM parts the subject actually cares about: a two-step approval **workflow**, **role-based
access** (employee / manager / HR, decided server-side so the client can't fake it), an immutable
**audit trail** on every state change, and the full doc trail (BRD &rarr; SOW &rarr; SRS &rarr;
sprint plan) that drove the build.

## live app (test it right now)

it's deployed on Azure, so you don't have to run anything to see it work:

**https://icy-smoke-09b038b0f.2.azurestaticapps.net/**

sign in with these Azure Entra ID accounts to see each role's view (same password for all):

| role | login | what you'll see |
|------|-------|-----------------|
| HR | `priya.sharma@shlokkadam46gmail.onmicrosoft.com` | company-wide dashboards, final approvals, leave config |
| Manager | `arjun.mehta@shlokkadam46gmail.onmicrosoft.com` | their team's requests, first-step approvals, team goals |
| Employee | `rahul.verma@shlokkadam46gmail.onmicrosoft.com` | apply for leave, own balances, own goals |

**password (all accounts):** `TempPass2026!`

the seeded data (leave requests, balances, approval logs, performance goals) is already linked to
each account, so the views fill in on login. full account list + notes are in
`Documents/Deployment-and-Demo-Accounts.txt`.

## where everything is

```
Mini Project/
├── README.md          <- you are here, the map
├── Documents/         <- the project-management paperwork (PDFs + demo video)
└── EmpowerHR/         <- the actual code (full-stack app)
```

### Documents/

| file | what it is | who made it |
|------|-----------|-------------|
| `BRD.pdf` | Business Requirements Document, the "what the business needs" | Rajneesh |
| `SOW.pdf` | Statement of Work, scope / deliverables / milestones / acceptance | **Anshuman** (project manager) |
| `SRS.pdf` | Software Requirements Specification, the detailed "what it must do" | Shlok + Prince |
| `Sprint-Planner.pdf` | Sprint plan, the work broken into sprints | Om |
| `Architecture-and-Data-Flow-Guide.pdf` | system architecture + how data moves (frontend &rarr; API &rarr; Prisma &rarr; Postgres) | team |
| `Solution-Demo.mp4` | ~70s video walkthrough of the running app | Prince |
| `Deployment-and-Demo-Accounts.txt` | live Azure app URL + the login accounts for each role | team |

reading order if you want the story: BRD (why) &rarr; SOW (the plan) &rarr; SRS (the spec)
&rarr; Sprint-Planner (how we scheduled it) &rarr; Architecture guide (how it's built) &rarr;
Solution-Demo (see it run).

### EmpowerHR/

the full-stack code. `backend/` is the Express API (routes, services, Prisma schema + migrations),
`frontend/` is the React + Vite app, `infra/` has the Terraform, and the `*.md` guides at its root
cover deployment and onboarding. it also lives on the team GitHub (this is a clone of it):

**https://github.com/Shlokmonster/EmpowerHR**

## team & my role

i was the **tech lead** on this, and i also owned the **SOW** (project manager on the doc). the rest
of the split:

- Rajneesh &rarr; BRD
- Anshuman (me) &rarr; SOW
- Shlok + Prince &rarr; SRS
- Om &rarr; Sprint Planner
- Prince &rarr; solution demo video

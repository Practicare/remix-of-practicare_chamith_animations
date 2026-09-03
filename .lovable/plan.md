# Practicare Best-Practice Onboarding Plan

## Goal
Get a new practice from signup to first meaningful action in under 10 minutes, while still setting up the data foundations required for Inventory, Checklists, Tasks, and Accreditation workflows.

## Guiding Principles
1. **Progressive setup** — collect only what is needed to start; defer advanced config.
2. **Industry-aware defaults** — tailor departments, rooms, stock categories, and checklist templates to the selected industry.
3. **Role-first access control** — create roles and assign permissions before inviting staff.
4. **Data order matters** — set up locations → stock → staff → roles → checklists → tasks.
5. **Show value quickly** — surface a “first win” (e.g. completed checklist, low-stock alert) within the first session.

---

## Proposed Onboarding Flow

### Phase 1: Welcome & Context (1 step)
- Short value proposition + industry selector.
- Capture: practice name, country, industry (Medical / Dental / Allied Health / Specialist / Cosmetic / Other).
- Use the industry choice to seed default departments, room names, stock categories, and checklist templates later.

### Phase 2: Practice Foundation (1 step)
- Practice email, phone, timezone, address.
- Choose site / location name (default: main practice site).
- Optional: logo upload.

### Phase 3: Locations Setup (1 step)
- Add rooms / stock locations.
- Provide AI-assisted “Generate rooms” based on industry (e.g. Consulting Room 1, Treatment Room 1, Sterilisation Room for dental).
- Allow manual add/edit of room number, name, and type.
- This unlocks Inventory allocation and room-specific checklists.

### Phase 4: Stock & Inventory Setup (1 step)
- Choose setup method:
  - AI import from invoices/receipts/photos.
  - CSV upload.
  - Manual add.
- Seed default inventory categories per industry.
- Capture initial stock levels and expiry dates where available.
- Link items to stock locations created in Phase 3.

### Phase 5: Team & Roles (1 step)
- Add staff members (name, email, role category: Clinician / Practice Nurse / Admin / Manager).
- Create or select roles with permissions (View / Edit / Create per module).
- Send invites.
- Enforce role-level permissions from first login.

### Phase 6: Checklists & Tasks (1 step)
- Industry-specific checklist templates (e.g. Daily Opening Checklist, Sterilisation Log, Stock Count).
- One-tap activate templates.
- Optionally auto-create first recurring task from a KPI or compliance due date.

### Phase 7: Go-Live Dashboard (completion step)
- Summary of what was configured.
- Quick links to:
  - Run first checklist
  - View inventory / low stock
  - Invite remaining staff
  - Set up accreditation documents
- Mark onboarding complete and redirect to Dashboard.

---

## Industry-Specific Defaults

| Industry | Default Departments | Suggested Rooms | Default Stock Categories | Starter Checklists |
|---|---|---|---|---|
| GP / Primary Care | Clinical, Admin, Nursing | Consulting Room 1-3, Treatment Room, Reception | Medical consumables, Vaccines, PPE, Stationery | Daily opening, Vaccine fridge check, Sterilisation |
| Dental | Clinical, Admin, Hygiene | Surgery 1-2, Sterilisation, Reception | Dental materials, Instruments, PPE, Disinfectants | Daily opening, Sterilisation log, Autoclave test |
| Allied Health | Therapy, Admin | Treatment Room 1-2, Gym area | Therapy supplies, PPE, Equipment | Equipment check, Daily opening |
| Specialist / Cosmetic | Clinical, Admin | Procedure Room 1-2, Recovery, Reception | Cosmetic consumables, Medical supplies, PPE | Procedure room check, Expiry review |

---

## Role & Permission Model

Default roles to create:
- **Practice Manager** — full access except billing owner.
- **Clinician** — view/edit own tasks, checklists, patient-related stock; no admin settings.
- **Practice Nurse** — tasks, checklists, stock checkout, rooms.
- **Reception / Admin** — tasks, memos, noticeboards, limited stock view.
- **Custom Role** — user-defined module permissions.

Use the existing 3-state permission matrix (View / Edit / Create) per module.

---

## Implementation Steps

1. Refactor `/onboarding/team` from 6 generic steps into the 7-phase flow above.
2. Add an `Industry` selector at the start and use it to seed defaults.
3. Build a reusable `RoomSetupStep` with AI generation + manual editing.
4. Build a reusable `StockImportStep` supporting AI scan, CSV, and manual entry.
5. Build a `TeamRolesStep` that combines staff invitation with role assignment.
6. Build a `ChecklistsActivationStep` with industry templates.
7. Create an `OnboardingCompletionStep` summary + go-live CTA.
8. Persist onboarding progress so users can resume.
9. Add a post-onboarding “Setup Assistant” widget on the Dashboard for skipped steps.

---

## Success Metrics
- Time to first checklist completion ≤ 10 minutes.
- Inventory has at least one location and one item after onboarding.
- Every invited user has a role assigned.
- At least one checklist template activated.

---

## Notes
- Keep the existing visual style: teal primary, rounded-lg cards, square buttons, no hover-only actions.
- Mobile-first: each step should work on a phone without horizontal scroll.
- Avoid asking for billing/plan selection during onboarding; handle that separately or after go-live.

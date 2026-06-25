# HeliosChart — Mock EHR (Conventional Mode)

A **front-end-only** mock EHR built to show non-clinical teammates *why conventional
EHRs feel painful*: information is stored but not connected to action. The centerpiece
is the **Note → Orders disconnect** — a clinician writes "Start ramipril 2.5 mg daily"
in a note, and nothing flows downstream. Every action must be re-entered by hand across
many disconnected tabs.

> ⚠️ Demonstration only. Not for clinical use. All patients/data are fictional. No real PHI.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

Build a static bundle:

```bash
pnpm build && pnpm preview
```

> Requires Node ≥ 20. A self-contained Node 22 LTS is linked into `~/.local/bin` on this
> machine; `pnpm` is at `/opt/homebrew/bin`.

## The demo (click **"Demo Script"**, bottom-left, for a live checklist)

1. **Schedule** → click **Thompson, Maria** (9:20).
2. **Chart → Summary**, then **Notes**. Type the plan, or click **Insert Template**:
   *"Start ramipril 2.5 mg daily. Check BMP in 1–2 weeks. Follow up in 4 weeks."*
3. Go to **Orders** — the workspace is **empty**. The note created nothing. *(This is the point.)*
4. Search **ramipril** → fill dose/route/freq/pharmacy → **Sign**. Now it appears in **Meds**.
5. Orders → **Labs** → search **BMP** → interval "In 1–2 weeks" → **Sign**.
6. Orders toolbar → **Follow-up** → 4 weeks → creates a task routed to the front desk.
7. Back to **Notes** → manually type **Patient Instructions** → **Sign Note**.
8. Notes → **Close Encounter** → outstanding items block close; inbox tasks linger.

The right-hand **Encounter To-Do** and the **Demo Script** panel both update live so the
audience watches the manual work accumulate.

## Stack & structure

- React 19 + TypeScript + Vite, React Router v7, hand-written CSS (deliberately dated/dense).
- State: one `useReducer` store in `src/store/EhrStore.tsx`.
- `src/data/` — hardcoded fake data. `src/shell/` — app chrome. `src/components/` — reusable
  "ugly" widgets. `src/modules/` — screens (schedule, inbox, documents, patients, chart/*).

## Intelligent HxR mode

The header toggle is present but disabled ("coming soon"). The seam is in place
(`EhrStore.mode`, `NoteEditor.onPlanTextChange`) for a future build that detects clinical
intent from the note and drafts orders/tasks for clinician review.

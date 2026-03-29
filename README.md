# Kanban Dashboard — Role-Adaptive Board

A role-adaptive Kanban dashboard that dynamically adapts its displayed information and features based on one of three roles: **Product Owner**, **Scrum Master**, and **Developer**. Each role sees custom, value-driven information relevant to their workflow.

## Features

### Shared
- Drag-and-drop Kanban board with 5 columns (Backlog, To Do, In Progress, Review, Done)
- Glassmorphism card design with backdrop blur and frosted-glass borders
- Dark mode with textured noise-grain background
- Mouse-driven parallax tilt on cards
- Staggered entrance animations with `prefers-reduced-motion` support
- Column hover glow during drag operations

### Product Owner View
- Priority heat strips (color-coded P0–P3)
- Release progress bar
- Epic swimlane filter toggle
- Value/effort badges on cards
- Velocity trend chart
- Priority breakdown grid

### Scrum Master View
- WIP limit indicators (pulsing red on violation)
- Sprint burndown chart
- Blocker overlay with one-click clear
- Team workload distribution bars
- Cycle time visibility
- Cumulative flow diagram (CFD)

### Developer View
- "My Tasks" filter toggle
- Subtask checklists with progress rings
- PR linkage badges (branch name + status)
- Code review request sidebar
- Personal velocity stats
- Quick-assign "Take it" button on unassigned cards

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4 + CSS custom properties
- **Drag-and-Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Charts:** Recharts
- **Animation:** Framer Motion
- **State:** Zustand
- **Icons:** Lucide React
- **Fonts:** Outfit + Source Code Pro
- **Testing:** Playwright (E2E) + Vitest (unit)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e
```

## Deployment

Deployed on Vercel. Push to `main` for production, PRs get preview deployments.

```bash
vercel deploy
```

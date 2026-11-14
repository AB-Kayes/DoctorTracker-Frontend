# DoctorTracker Frontend Application

Modern clinical administrative client application built with Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, and TanStack React Query v5.

## Design System & UX
- Directly ports the design system, Geist typography, warm layered surfaces, and animations from `nexus-management`.
- Fixed left sidebar navigation with dynamic badge counters and full-width main view on the right.
- Command Palette (`⌘K` / `Ctrl+K`) for rapid global keyboard navigation.
- Comprehensive Nexus CRUD Suite:
  - Instant debounced multi-field search
  - Column sorting with toggle arrows
  - Multi-select checkboxes with floating Bulk Action Bar
  - Quick filter tabs with live item count chips
  - DateRangePicker with calendar popovers and presets
  - Instant client-side CSV export
  - Nexus Prime pagination with page size selector
  - Responsive Dialog Modals for Create & Edit workflows
  - Destructive `ConfirmAction` alert dialogs
- Interactive Recharts data visualizations:
  - Patient Admissions Area Chart (gradient fill)
  - Department Specialization Bar Chart
  - Patient Clinical Status Donut Chart

## Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Configure .env.local
cp .env.example .env.local
# Default: NEXT_PUBLIC_API_URL=http://localhost:5000/api

# 3. Start development server
npm run dev
# Application available on http://localhost:3000
```

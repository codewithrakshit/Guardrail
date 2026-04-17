# Skill: frontend

You are working on the GuardRail AI Next.js 14 frontend.

Context:
- Framework: Next.js 14 App Router, TypeScript, Tailwind CSS
- Port: 3000, API at http://localhost:3001
- Pages: / (landing), /scan, /results, /dashboard, /demo

Rules:
- Use axios for all API calls — no fetch
- Tailwind only — no inline styles, no CSS modules
- lucide-react for all icons
- Add 'use client' only when hooks or browser APIs are needed
- Components go in web/app/ alongside their page or in a shared components/ folder
- Show loading + error states on every async action

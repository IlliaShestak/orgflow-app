---
name: OrgFlow Design System
description: Visual design tokens, component patterns, and UI conventions for OrgFlow (Design 3 — Tricolor Minimal)
triggers: ["design", "color", "font", "style", "UI", "component", "button", "badge", "sidebar", "layout", "tailwind", "class", "kanban", "table", "avatar", "card", "tab"]
---

## Design Direction
**Tricolor Minimal** — clean white backgrounds, dark sidebar, three brand colors used as semantic accents.
Font: Plus Jakarta Sans (Google Fonts — add to layout.tsx)

## Color Palette (Tailwind CSS custom config)
Add to `tailwind.config.ts`:
```js
colors: {
  brand: {
    blue:         '#0A3D91',
    'blue-soft':  '#4472CA',
    'blue-tint':  '#E8EDF8',
    orange:       '#E85D04',
    'orange-soft':'#F4845F',
    'orange-tint':'#FDF0E8',
    green:        '#0B7B45',
    'green-soft': '#3CB371',
    'green-tint': '#E6F5EE',
  },
  sidebar: '#1A1D2E',
}
```

## Color Semantic Meaning (NEVER mix up)
| Color  | When to use                                          |
|--------|------------------------------------------------------|
| Blue   | Candidate status badge, active sidebar item indicator, informational elements |
| Orange | Primary CTA buttons (Add, Save, Submit), Active member accent, onboarding progress bars |
| Green  | Knowledge coverage indicators, success states, covered topic highlights |
| Sidebar dark (#1A1D2E) | Sidebar background only |
| White  | Main content area background |
| Off-white (#F7F8FA) | Page background (body) |

## Layout Structure
```
[Sidebar 220px fixed] | [Main content area flex-1]
                           [TopBar sticky h-14]
                           [Page content with padding p-7 p-8]
```

## Sidebar
- Background: `bg-[#1A1D2E]`
- Logo area at top with brand icon (gradient orange→blue) + "OrgFlow" text
- Nav items: `text-white/55`, hover: `bg-white/6 text-white/85`
- Active item: `bg-white/10 text-white font-medium` + left border indicator `bg-[#E85D04] w-[3px]`
- Section labels: `text-[9px] font-semibold tracking-[1.2px] uppercase text-white/25`
- User card at bottom with small avatar (orange background) + name/role

## Top Bar
- Background: white, `border-b border-gray-100`, height `h-14`
- Left: breadcrumb (`text-sm text-gray-400 / text-gray-800 font-medium`)
- Right: tab switcher (table/kanban) + primary action button

## Primary Button (orange CTA)
```
bg-[#E85D04] hover:bg-[#F4845F] text-white
rounded-[7px] px-[14px] py-[7px] text-xs font-semibold
```

## Secondary / Outline Button
```
bg-white border border-gray-200 hover:border-[#E85D04] hover:text-[#E85D04]
text-gray-600 rounded-[7px] px-4 py-2 text-xs font-medium
```

## Tab Switcher (table/kanban toggle)
```
Container: bg-gray-100 rounded-[7px] p-[3px] flex gap-0.5
Active tab: bg-white text-gray-800 shadow-sm rounded-[5px]
Inactive tab: text-gray-400 hover:text-gray-600
```

## Status Badges (member status)
```
Observer/Candidate: bg-[#E8EDF8] text-[#0A3D91]
Active (Full):      bg-[#FDF0E8] text-[#E85D04]  — or use green for "active state"
Alumni:             bg-gray-100 text-gray-500
```

## State Badges (Active/Inactive)
```
Active:   dot bg-[#0B7B45] + "Активний" text-[#5A6080] font-medium
Inactive: dot bg-gray-400  + "Неактивний"
```

## Cards
```
bg-white border border-gray-100 rounded-[10px] overflow-hidden
Card header: px-4 py-3.5 border-b border-gray-100 flex items-center justify-between
```

## Data Table
- Header: `bg-[#F7F8FA] text-[10px] font-semibold tracking-[0.8px] uppercase text-gray-400`
- Row: `border-b border-gray-100 hover:bg-[#FAFBFD] transition-colors`
- Cell padding: `px-4 py-3`

## Kanban Board
Column header colors:
- Observer/Candidate: `bg-[#E8EDF8] text-[#0A3D91]` with count badge `bg-[#0A3D91] text-white`
- Active/Full: `bg-[#FDF0E8] text-[#E85D04]` with count badge `bg-[#E85D04] text-white`
- Alumni: `bg-gray-100 text-gray-500` with count badge `bg-gray-400 text-white`

Member card: `bg-white border border-gray-200 rounded-[8px] p-3 hover:shadow-md hover:border-[#E85D04] cursor-pointer transition-all`

## Member Avatar
- Shape: circle `rounded-full`
- Size variants: `w-8 h-8` (small), `w-[34px] h-[34px]` (default), `w-10 h-10` (large)
- Content: 2-letter initials, centered
- Colors: use brand colors by rotation (blue, orange, green) or based on role

## Progress Bar (onboarding)
```
Container: bg-gray-100 rounded-[2px] h-1
Fill: bg-[#E85D04] rounded-[2px] h-1
```

## Knowledge Coverage Bar
```
Container: bg-gray-100 rounded-[2px] h-[5px] w-20
Fill: bg-[#3CB371] rounded-[2px] h-[5px]
```

## Stat Cards (top of member list page)
```
bg-white rounded-[10px] border-t-[3px] border-[COLOR] p-5
Label: text-[11px] font-medium uppercase tracking-[0.3px] text-gray-400
Value: text-[32px] font-bold tracking-[-1px] text-[COLOR]
Sub: text-xs text-gray-400
```
Color per card: Blue for Candidates, Orange for Active, Green for КСПЗ coverage, Gray for Alumni

## Empty States
```
Centered in content area
Icon (outline, 48px, text-gray-300)
Title: text-sm font-medium text-gray-600
Description: text-xs text-gray-400
Action button if relevant
```

## Typography Scale
```
Page title (Syne or Plus Jakarta Sans): text-[22px] font-bold tracking-[-0.3px]
Section title: text-sm font-semibold text-gray-800
Card title: text-[13px] font-semibold
Body: text-[13px] text-gray-700
Small/meta: text-[11px] text-gray-400
Nav item: text-[13px]
```

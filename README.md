# Expense Tracker — Frontend

React single-page app for tracking expenses: a personal tracker for every user, plus shared **company workspaces** where members submit expenses and workspace admins approve them. Responsive from phone to desktop.

**Live demo:** [https://expense-tracker-client-jet.vercel.app](https://expense-tracker-client-jet.vercel.app)  
**API:** [https://expense-tracker-server-wc9u.onrender.com](https://expense-tracker-server-wc9u.onrender.com) · [Backend repo](https://github.com/Anjana412/Expense-tracker-server)

## Features

### Personal tracker (every account)

- Add, edit, delete expenses with category, date and notes
- Monthly budget with remaining amount and % used (the card turns red when exceeded)
- Dashboard with This month / Last month / This year filters, search, sort, monthly trend and category charts
- Reports by month, year and category, and CSV export (dates exported as `yyyy-mm-dd`)

### Company workspaces

- Create a workspace (you become its admin and owner), invite people by email
- Invitations appear for the invitee, who can accept or decline
- Members add company expenses and see only their own; they can edit or delete only while the expense is pending
- Workspace admins approve or reject expenses, edit the workspace budget, remove members, and view company reports including a by-member breakdown and CSV export
- The owner can promote/demote admins and delete the workspace
- Personal and company expenses are never mixed in totals, charts, reports or CSVs

### Platform owner (Super Admin)

- Create and delete admin accounts
- See all workspaces (name, owner, member count only) and platform analytics (counts only)
- Cannot create workspaces or see any company or personal expenses

### Quality

- Unknown URLs redirect to the home page
- Role-based route guards (UX only; the backend enforces every permission)
- Expired or invalid sessions are cleared and sent to `/login`
- Confirm dialogs for destructive actions, toast feedback, loading and empty states
- Mobile navigation bar with the signed-in user's name and role

## Tech stack

React 19 · Vite · Tailwind CSS 4 · React Router 7 · Axios · Recharts · React Toastify

## Setup

Requires Node.js 18+ and the [backend](https://github.com/Anjana412/Expense-tracker-server) running.

```bash
git clone https://github.com/Anjana412/Expense-tracker-client.git
cd Expense-tracker-client
npm install
cp .env.example .env     # on Windows PowerShell: Copy-Item .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

### Environment variables

```env
VITE_API_URL=http://localhost:4000
```

Vite reads this only at startup, so restart `npm run dev` after changing it. If it is not set, the app falls back to the production API, so set it when developing locally. On **Vercel**, set `VITE_API_URL` under Project Settings → Environment Variables.

## Project structure

```text
src/
├── api/
│   └── api.js                         # Axios instance + every endpoint
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout
│   │   ├── Sidebar
│   │   ├── MobileNavbar
│   │   └── navConfig
│   │
│   ├── ui/
│   │   ├── ConfirmDialog
│   │   ├── ExpenseRowActions
│   │   └── chartTheme
│   │
│   ├── workspace/
│   │   ├── StatusBadge
│   │   └── WorkspaceTabs
│   │
│   ├── landing/
│   │   ├── DashboardPreview
│   │   └── MeterGauge
│   │
│   ├── DashboardContent.jsx
│   ├── ProtectedRoute.jsx
│   └── RedirectIfLoggedIn.jsx
│
├── pages/
│   ├── Landing
│   ├── Authpage
│   ├── Dashboard
│   ├── Addexpense
│   ├── Editexpense
│   ├── Viewexpense
│   ├── Reports
│   ├── Workspaces
│   ├── WorkspaceDetail
│   ├── WorkspaceExpenses
│   ├── WorkspaceReports
│   ├── ManageAdmin
│   ├── CreateAdmin
│   ├── AllWorkspaces
│   └── Globalanlytics
│
├── utils/
│   ├── auth.js                         # Session helpers
│   └── format.js                       # Currency, UTC dates, CSV
│
├── App.jsx
└── main.jsx
```

## Routes

| Path | Who |
|---|---|
| `/`, `/login`, `/register` | Public (signed-in users are redirected to their dashboard) |
| `/dashboard`, `/admin/dashboard`, `/superadmin/dashboard` | Any signed-in role |
| `/addexpense`, `/editexpense/:id`, `/expenses`, `/reports` | Any signed-in role (personal tracker) |
| `/workspaces`, `/workspaces/:id`, `/workspaces/:id/expenses`, `/workspaces/:id/reports` | User, Admin |
| `/superadmin/admins`, `/superadmin/admins/create`, `/superadmin/workspaces`, `/analytics` | Super Admin |

## Known limitations

- The session is a 1-hour token kept in `localStorage`, with no refresh token.

## Deployment

Hosted on **Vercel**. Set `VITE_API_URL` to the Render API URL for production builds.

## Author

**Anjana T** · anjanat0001@gmail.com · [GitHub](https://github.com/Anjana412)
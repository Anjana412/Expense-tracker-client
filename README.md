# Expense Tracker — Frontend

A React-based expense tracking application for both personal and team/office use. Built with Vite and styled with Tailwind CSS.

## Features

- User authentication (login & register)
- Personal expense management — add, edit, delete expenses
- Team expense tracking and analytics
- Role-based dashboards (User, Admin, Super Admin)
- Monthly trends and category breakdowns
- Budget management
- Export expenses as CSV
- Global analytics for admins

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Axios
- Recharts
- React Router

## Getting Started

### Prerequisites

- Node.js v18+
- Backend server running (see Expensetracker-server)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/Expensetracker-client.git
cd Expensetracker-client
npm install
```

### Environment Variables

Create a `.env` file in the root:

```
VITE_API_URL=http://localhost:4000
```

### Run Locally

```bash
npm run dev
```

App runs at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Deployment

Deployed on **Vercel**. Set the following environment variable in your Vercel project settings:

```
VITE_API_URL=https://your-render-backend-url.onrender.com
```

## Folder Structure

```
src/
├── components/       # Reusable UI components
├── pages/            # Page-level components
├── api.js            # Axios API config and all API calls
└── main.jsx          # App entry point
```
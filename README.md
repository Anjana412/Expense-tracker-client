# Expense Tracker — Frontend (MERN Stack)

A responsive expense management application built with React and Vite that helps users track personal and team expenses, manage budgets, and analyze spending patterns through interactive dashboards and reports. The application supports role-based access for Users, Admins, and Super Admins, making it suitable for both individual and organizational expense tracking.

## Live Demo

**Frontend:** https://expense-tracker-client-jet.vercel.app
**Backend:** https://expense-tracker-server-wc9u.onrender.com

## Features

### User Authentication
- Secure Signup with Name, Email, and Password
- Encrypted Passwords using bcrypt
- JWT Authorization for secure login
- Protected Routes based on user role

### Expense Management
- Full CRUD: Add, Edit, Delete, and View Expenses
- Category-wise expense tracking
- Filter by category, date, and amount range
- CSV Export for expense reports

### Role-Based Access
- **User:** Personal expense dashboard and budget management
- **Admin:** Team expense tracking and reports
- **Super Admin:** Global analytics across all users

### Analytics & Reports
- Monthly spending trends (line chart)
- Category breakdown with progress bars
- Top spenders leaderboard
- Team and global expense analytics

### User Interface
- Responsive Design for mobile, tablet, and desktop using Tailwind CSS
- Interactive Dashboard with real-time data
- Smooth navigation with React Router

## Technologies Used

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Recharts
- React Toastify

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Frontend Setup

```bash
git clone https://github.com/Anjana412/Expense-tracker-client.git
cd Expense-tracker-client
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Environment Variables

Frontend `.env`:
```env
VITE_API_URL=http://localhost:4000
```

## Project Structure

```
src/
├── api/
├── assets/
├── components/
│   ├── layout/
│   └── ui/
├── images/
├── pages/
│   ├── Addexpense.jsx
│   ├── Authpage.jsx
│   ├── CreateTeam.jsx
│   ├── Dashboard.jsx
│   ├── Editexpense.jsx
│   ├── Globalanalytics.jsx
│   ├── Manageusers.jsx
│   ├── Reports.jsx
│   ├── Teamexpense.jsx
│   ├── Teamreport.jsx
│   ├── Viewexpense.jsx
│   └── ViewTeam.jsx
├── App.jsx
└── main.jsx
```

## Deployment

- **Frontend:** Vercel
- **Backend API:** Render

## Author

**Anjana T**

Email: anjanat0001@gmail.com

GitHub: https://github.com/Anjana412
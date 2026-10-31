import { useState } from "react";
import { Link } from "react-router-dom";
import MeterGauge from "../components/landing/MeterGauge";
import DashboardPreview from "../components/landing/DashboardPreview";

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

const PERSONAL = [
  ["Expenses", "Add, edit and delete expenses with a title, amount, category and date. Search, filter by period or category, and sort your history."],
  ["Monthly budget", "Set a monthly budget and see how much of it is left as you add expenses."],
  ["Charts and reports", "A monthly spending trend, a category breakdown and a full-year report. Export your expenses to CSV."],
];
const COMPANY = [
  ["Workspaces", "Create a company workspace and invite employees by email. Employees join only after they accept."],
  ["Kept separate", "A workspace sees company expenses only. Your personal expenses are never visible to it."],
  ["Review and approve", "Employees submit company expenses. Admins approve or reject them and see spending by category, month and member, against a company budget."],
];
const STEPS = [
  ["Create your account", "Register with your name, email and a password, then sign in."],
  ["Record your expenses", "Add each expense as you spend. Categories and dates keep everything organised."],
  ["Check the budget", "Open the dashboard and reports to see where the money went and how much of the budget is left."],
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700";
const container = "max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12";
const primaryBtn = `inline-flex items-center justify-center rounded-md bg-violet-700 hover:bg-violet-800 text-white font-semibold px-5 py-3 text-[15px] no-underline transition-colors ${focusRing}`;
const secondaryBtn = `inline-flex items-center justify-center rounded-md border border-[#1B1A2E]/30 hover:border-[#1B1A2E] text-[#1B1A2E] font-semibold px-5 py-3 text-[15px] no-underline transition-colors ${focusRing}`;

const Label = ({ n, children }) => (
  <p className="font-mono text-xs uppercase tracking-[0.14em] text-violet-800 m-0">{n} / {children}</p>
);

const Ledger = ({ title, rows }) => (
  <div>
    <h3 className="font-display text-xl text-[#1B1A2E] m-0 pb-3 border-b-2 border-[#1B1A2E]">{title}</h3>
    <dl className="m-0">
      {rows.map(([name, text]) => (
        <div key={name} className="grid sm:grid-cols-[170px_1fr] gap-x-6 gap-y-1 py-4 border-b border-[#1B1A2E]/15">
          <dt className="font-semibold text-[15px] text-[#1B1A2E]">{name}</dt>
          <dd className="m-0 text-[15px] leading-relaxed text-gray-700">{text}</dd>
        </div>
      ))}
    </dl>
  </div>
);

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="font-[Inter,sans-serif] text-gray-800 bg-[#FAF8F5] min-h-screen">
      <style>{`
        .font-display { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-weight: 700; letter-spacing: -0.015em; }
        html { scroll-padding-top: 64px; }
        @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
      `}</style>

      <a href="#main" className={`sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:bg-white focus:text-violet-800 focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg ${focusRing}`}>Skip to content</a>

      <header className="sticky top-0 z-50 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#1B1A2E]/15">
        <nav aria-label="Main" className={`${container} h-14 flex items-center justify-between gap-4`}>
          <a href="#home" className={`flex items-center gap-2.5 no-underline rounded ${focusRing}`}>
            <span className="w-8 h-8 bg-violet-700 rounded-md flex items-center justify-center text-white" aria-hidden="true"><i className="ti ti-wallet text-base" /></span>
            <span className="text-[17px] font-extrabold text-[#1B1A2E] tracking-tight">Expense Meter</span>
          </a>

          <ul className="hidden md:flex list-none m-0 p-0 items-center gap-8">
            {NAV.map((n) => (
              <li key={n.href}><a href={n.href} className={`text-sm font-medium text-gray-700 hover:text-violet-800 no-underline rounded ${focusRing}`}>{n.label}</a></li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className={`text-sm font-semibold text-[#1B1A2E] hover:text-violet-800 no-underline px-3 py-2 rounded-md ${focusRing}`}>Log in</Link>
            <Link to="/register" className={`${primaryBtn} !px-4 !py-2 !text-sm`}>Get started</Link>
          </div>

          <button type="button" className={`md:hidden w-11 h-11 rounded-md border border-[#1B1A2E]/25 bg-white text-gray-800 flex items-center justify-center cursor-pointer ${focusRing}`}
            aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen((o) => !o)}>
            <i className={`ti ${menuOpen ? "ti-x" : "ti-menu-2"} text-xl`} aria-hidden="true" />
          </button>
        </nav>

        {menuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-[#1B1A2E]/15 bg-[#FAF8F5] px-5 pb-4">
            <ul className="list-none m-0 p-0 py-1">
              {NAV.map((n) => (
                <li key={n.href}><a href={n.href} onClick={() => setMenuOpen(false)} className={`block py-3 text-[15px] font-medium text-gray-800 no-underline rounded ${focusRing}`}>{n.label}</a></li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 pt-3 border-t border-[#1B1A2E]/15">
              <Link to="/login" className={secondaryBtn}>Log in</Link>
              <Link to="/register" className={primaryBtn}>Get started</Link>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        <section id="home" aria-labelledby="hero-title" className={`${container} pt-8 pb-12 md:pt-14 md:pb-16 grid lg:grid-cols-[1.25fr_0.75fr] gap-10 lg:gap-16 items-center`}>
          <div>
            <h1 id="hero-title" className="font-display text-[2.5rem] sm:text-6xl lg:text-[4.25rem] leading-[1.04] text-[#1B1A2E] m-0">Take control of your expenses.</h1>
            <p className="text-lg leading-relaxed text-gray-700 mt-5 mb-0 max-w-xl">
              Write down what you spend, set a monthly budget, and see where the money goes. Running a business? Create a company workspace and invite your team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Link to="/register" className={primaryBtn}>Get started</Link>
              <a href="#features" className={secondaryBtn}>Explore features</a>
            </div>
            <ul className="list-none p-0 m-0 mt-10 pt-4 border-t border-[#1B1A2E]/20 flex flex-wrap gap-x-8 gap-y-1 font-mono text-xs uppercase tracking-wider text-gray-700">
              <li>Personal tracker</li><li>Company workspaces</li><li>CSV export</li>
            </ul>
          </div>

          <div className="bg-white border border-[#1B1A2E]/20 rounded-lg p-5 sm:p-6 shadow-[0_2px_0_rgba(27,26,46,0.1)] w-full max-w-md lg:max-w-none mx-auto">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-sm font-semibold text-[#1B1A2E] m-0">This month's budget</p>
              <span className="font-mono text-xs text-gray-600">Sample data</span>
            </div>
            <div className="max-w-[17rem] mx-auto mt-3"><MeterGauge percent={71} /></div>
            <div className="text-center -mt-1">
              <p className="font-mono text-2xl font-semibold m-0 tabular-nums text-[#1B1A2E]">₹14,200 <span className="text-sm font-normal text-gray-600">of ₹20,000</span></p>
              <p className="text-sm text-gray-600 m-0 mt-1">₹5,800 left to spend</p>
            </div>
            <ul className="list-none p-0 m-0 mt-5 border-t border-[#1B1A2E]/15 divide-y divide-[#1B1A2E]/10">
              {[["Groceries", "Food", "₹1,250"], ["Metro card", "Transport", "₹500"], ["Electricity bill", "Bills", "₹2,100"]].map(([t, c, a]) => (
                <li key={t} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-[#1B1A2E]">{t} <span className="text-gray-500">· {c}</span></span>
                  <span className="font-mono font-semibold tabular-nums text-[#1B1A2E]">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="features" aria-labelledby="features-title" className="border-t border-[#1B1A2E]/20">
          <div className={`${container} py-12 md:py-16`}>
            <Label n="01">Features</Label>
            <h2 id="features-title" className="font-display text-3xl sm:text-4xl text-[#1B1A2E] mt-3 mb-2 max-w-2xl leading-tight">One tracker for your own money and your company's.</h2>
            <p className="text-base text-gray-700 mt-0 mb-9 max-w-2xl leading-relaxed">Start with personal tracking. Add a company workspace whenever you need one; the two stay apart.</p>
            <div className="grid lg:grid-cols-2 gap-x-14 gap-y-10">
              <Ledger title="Personal tracking" rows={PERSONAL} />
              <Ledger title="Company workspaces" rows={COMPANY} />
            </div>
          </div>
        </section>

        <section id="how-it-works" aria-labelledby="how-title" className="border-t border-[#1B1A2E]/20">
          <div className={`${container} py-12 md:py-16`}>
            <Label n="02">How it works</Label>
            <h2 id="how-title" className="font-display text-3xl sm:text-4xl text-[#1B1A2E] mt-3 mb-9 leading-tight">Three steps.</h2>
            <ol className="list-none p-0 m-0 grid md:grid-cols-3 gap-x-10 gap-y-8">
              {STEPS.map(([title, text], i) => (
                <li key={title} className="border-t-2 border-[#1B1A2E] pt-4">
                  <p className="font-mono text-sm text-violet-800 m-0" aria-hidden="true">0{i + 1}</p>
                  <h3 className="text-lg font-semibold text-[#1B1A2E] m-0 mt-1"><span className="sr-only">Step {i + 1}: </span>{title}</h3>
                  <p className="text-[15px] leading-relaxed text-gray-700 m-0 mt-2">{text}</p>
                </li>
              ))}
            </ol>
            <p className="text-[15px] text-gray-700 mt-8 mb-0 max-w-2xl">Need to manage a business? Create a company workspace from the Workspaces page at any time, then invite your employees.</p>
          </div>
        </section>

        <section aria-labelledby="preview-title" className="border-t border-[#1B1A2E]/20">
          <div className={`${container} py-12 md:py-16`}>
            <Label n="03">Dashboard</Label>
            <h2 id="preview-title" className="font-display text-3xl sm:text-4xl text-[#1B1A2E] mt-3 mb-2 leading-tight">Your spending at a glance.</h2>
            <p className="text-base text-gray-700 mt-0 mb-8 max-w-2xl leading-relaxed">Totals, budget left, a six-month trend, your categories and your latest expenses on one page.</p>
            <DashboardPreview />
          </div>
        </section>

        <section aria-labelledby="cta-title" className={`${container} pb-12 md:pb-16`}>
          <div className="rounded-lg bg-[#1B1A2E] text-white p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 id="cta-title" className="font-display text-2xl sm:text-3xl m-0">Start tracking your spending.</h2>
              <p className="text-base text-gray-300 mt-2 mb-0">Create an account, add your first expense, and set a budget.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link to="/register" className="inline-flex items-center justify-center rounded-md bg-white text-[#1B1A2E] hover:bg-violet-100 font-semibold px-5 py-3 text-[15px] no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Create your account</Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-md border border-white/40 text-white hover:bg-white/10 font-semibold px-5 py-3 text-[15px] no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Log in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#1B1A2E]/20">
        <div className={`${container} py-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6`}>
          <div className="max-w-sm">
            <p className="flex items-center gap-2 text-[16px] font-extrabold text-[#1B1A2E] m-0">
              <span className="w-7 h-7 bg-violet-700 rounded-md flex items-center justify-center text-white" aria-hidden="true"><i className="ti ti-wallet text-sm" /></span>
              Expense Meter
            </p>
            <p className="text-sm text-gray-700 mt-2 mb-0 leading-relaxed">A full-stack expense tracker built with React, Node.js, Express and MongoDB by Anjana T.</p>
          </div>
          <nav aria-label="Footer" className="flex gap-12">
            <ul className="list-none m-0 p-0 flex flex-col gap-2 text-sm">
              <li><a href="#features" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>Features</a></li>
              <li><a href="#how-it-works" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>How it works</a></li>
              <li><Link to="/login" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>Log in</Link></li>
              <li><Link to="/register" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>Create account</Link></li>
            </ul>
            <ul className="list-none m-0 p-0 flex flex-col gap-2 text-sm">
              <li><a href="https://github.com/Anjana412/Expense-tracker-client" target="_blank" rel="noopener noreferrer" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>Source code on GitHub</a></li>
              <li><a href="https://github.com/Anjana412" target="_blank" rel="noopener noreferrer" className={`text-gray-800 hover:text-violet-800 no-underline rounded ${focusRing}`}>Anjana's GitHub profile</a></li>
            </ul>
          </nav>
        </div>
        <p className={`${container} pb-6 text-xs text-gray-600 m-0`}>© {new Date().getFullYear()} Anjana T. Portfolio project.</p>
      </footer>
    </div>
  );
};

export default Landing;

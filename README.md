![Klavora Brand Header](public/favicon.svg)
# Klavora Admin Console


An executive-grade, real-time administrative platform for **Klavora** — managing independent pharmacy subscriptions, platform MRR metrics, batch inventory movements, and customer support tickets across Ghana.

---

## Key Features

- **Dashboard & Time-Aware Greetings**: Real-time overview of active subscriptions, total pharmacies, monthly recurring revenue (MRR), and time-based founder greetings (Morning/Afternoon/Evening).
- **Pharmacy Network Management**: Search, filter by region/plan/status, sort, suspend, or override pharmacy accounts across 8 regions in Ghana.
- **Subscriptions & Billing**: Real-time MRR breakdown, active vs overdue subscription tracking, 30-day manual overrides, and plan tier configurations (*Starter*, *Growth*, *Scale*).
- **Support Operations**: Ticketing workspace with status management, Founder direct replies, internal notes, and media screenshot attachments.
- **Activity Feed**: Global FEFO stock movement logs (*Sale*, *Restock*, *Reversal*, *Reconciliation*) with staff attribution.
- **Brand System & Visual Design**:
  - Custom vector brand logo incorporating the Klavora medical cross mark.
  - High-contrast typography (*Plus Jakarta Sans*, *Inter*, *JetBrains Mono*).
  - Smart semantic badges with automatic light/dark contrast adjustments.
- **Responsive Layout**: Designed for desktop workstations, tablets, and mobile devices with a slide-out drawer menu and quick theme toggling.
- **Security & Session Safety**: Logout confirmation modal and GitGuardian-compliant demo access.

---

## Demo Access

To preview the dashboard, launch the application and click **Auto-fill** on the sign-in page, or enter:

- **Email**: `admin@klavora.io`
- **Password**: `demo-access`

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Remix Icon](https://remixicon.com/)
- **Typography**: Google Fonts (*Plus Jakarta Sans*, *Inter*, *JetBrains Mono*)

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone the repository
git clone https://github.com/Bryt19/Klave-Admin.git

# Navigate into the project directory
cd Klave-Admin

# Install dependencies
npm install
```

### Development Server

Start the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

Type-check TypeScript and compile the production bundle:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

### Vercel Deployment

This project includes a pre-configured `vercel.json` for zero-error deployment on Vercel:

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: `vite`
- **SPA Rewrite Rule**: `/(.*) -> /index.html` (prevents 404 errors on browser page refreshes for client routes like `/pharmacies`, `/subscriptions`, `/support`, `/activity`, `/settings`)
- **Asset Cache**: Long-term immutable caching for production JS/CSS assets in `/assets/`

---

## Project Structure

```text
Klave-Admin/
├── public/
│   └── favicon.svg           # Brand medical cross mark
├── src/
│   ├── components/
│   │   ├── base/             # Atomic UI (Badge, Logo, ConfirmModal)
│   │   └── feature/          # Layout components (Sidebar)
│   ├── hooks/                # Custom React hooks (useTheme)
│   ├── mocks/                # Mock data (pharmacies, activity, support, subscriptions)
│   ├── pages/                # Main application views
│   │   ├── auth/             # LoginPage
│   │   ├── home/             # Overview dashboard
│   │   ├── pharmacies/       # Pharmacies & PharmacyDetails
│   │   ├── subscriptions/    # Subscriptions & Billing
│   │   ├── support/          # Support ticketing platform
│   │   ├── activity/         # Stock movement feed
│   │   └── settings/         # Founder settings & plan pricing
│   ├── router/               # Application routing configuration
│   ├── App.tsx               # Root app layout & responsive shell
│   ├── index.css             # Core design system & theme variables
│   └── main.tsx              # Application entry point
├── tsconfig.json             # TypeScript compiler settings
├── vite.config.ts            # Vite bundler & path alias configuration
└── README.md
```

---

## License

Internal proprietary software developed for Klavora platform operations.

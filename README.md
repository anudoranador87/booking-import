# Booking Import

An interactive, premium hotel management web application designed for independent hotels and receptionists. It automates the parsing and import of Booking.com reservation confirmation emails, allows room assignment planning, displays analytics, and integrates simulated synchronization with Google Sheets.

![Aesthetic Dashboard Preview](https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80)

---

## 🚀 Key Features

### 1. Email Parsing Engine
*   Extracts guest names, reservation numbers, check-in/out dates, room types, nightly prices, total price, payment status, and extras (Breakfast, Parking, Triple Room).
*   Uses robust regex extraction helper rules.
*   **Sample Email Templates**: Built-in test templates in the parser view allow for instant testing without copy-pasting real emails.

### 2. Interactive Executive Dashboard
*   **Analytics & Trend Charts**: Real-time interactive charts built with `recharts` to visualize:
    *   *Revenue Generated per Room* (Area Chart with smooth gradients).
    *   *Noches Reservadas per Room* (Bar Chart displaying occupation frequencies).
*   **Key KPIs**: Live count of total reservations, confirmed bookings, pending payments, and total revenue.

### 3. Visual Occupancy Planner (Calendar Grid)
*   Interactive room layout grid.
*   Filterable start dates with week-by-week/month-by-month pagination.
*   Adjustable date range (7, 14, 21, or 30 days) to optimize grid spacing.
*   **Room Reassignment**: Click on any occupied cell in the grid to open a modal and reassign the guest to a different room.

### 4. Direct CRUD & Reservation Management
*   **Manual Bookings**: Create a new reservation manually from a popup dialog form without needing an email.
*   **Inline Editing**: Expand any row in the reservation table to edit guest details, stay dates, room number, extras, payment status, and custom notes.
*   **Safe Deletion**: Integrated `AlertDialog` prompts for safe deletion of reservations.

### 5. Google Sheets Integration Simulator
*   Fully mockable sync panel with Google OAuth connectivity animation.
*   Configure custom Spreadsheet ID and Tab name.
*   **Visual Step-by-Step Progress**: Shows a detailed step indicator during API writing simulation.
*   **Synchronization History**: Keeps a logged history of all sync operations with records count, status, and direct sheets links.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, TypeScript, Vite.
*   **Styling**: Tailwind CSS, Radix UI primitives.
*   **Charts**: Recharts.
*   **Icons**: Lucide React.
*   **Routing**: Wouter.
*   **Backend Server**: Express.js (Node.js) for serving production builds.

---

## ⚙️ Installation & Usage

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)

### Installation
1.  Navigate to the project root directory:
    ```bash
    cd "Booking import"
    ```
2.  Install dependencies using legacy peer deps to resolve plugin conflicts:
    ```bash
    npm install --legacy-peer-deps
    ```

### Run Locally
To start the Vite development server:
```bash
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your browser.

### Production Build
To bundle the frontend assets and build the Express backend file server:
```bash
npm run build
```
To run the production server:
```bash
npm start
```

---

## 📂 Project Structure

```text
├── client/
│   ├── public/              # Static public assets
│   └── src/
│       ├── components/      # UI components (Dashboard, Planner, Sync, Parser)
│       │   └── ui/          # Radix-ui wrappers (button, input, select, progress)
│       ├── contexts/        # Theme providers
│       ├── hooks/           # State persistence helpers
│       ├── lib/             # Regex parser and utility modules
│       ├── pages/           # View layouts (Home, NotFound)
│       ├── App.tsx          # Main entry routing
│       └── index.css        # Tailwind variables and fonts
├── server/
│   └── index.ts             # Express.js production static file server
├── shared/
│   └── const.ts             # Shared configuration variables
├── ideas.md                 # Initial design and styling concept document
├── package.json             # Build script config and dependencies
└── tsconfig.json            # TypeScript configuration
```

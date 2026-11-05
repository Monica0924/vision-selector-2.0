# BGR NEO Vision Selector — Enterprise Vision Studio (v2.0)

A high-performance, enterprise-grade Industrial Machine Vision selection, optical calculation, and integration tracking suite. Built for industrial vision engineers, automation leads, and plant managers.

Corporate glass cards sit on an advanced **dark machine-vision motion canvas** (`#090D16`) with authoritative **Times New Roman** corporate typography, interactive 3-column summary card filters, public project creation, and password-protected workflow edits.

---

## Key Features & Refactored Highlights

### 1. Global Typography: Times New Roman Across All Interfaces
- **Universal Typography Family**: `"Times New Roman", Times, "Liberation Serif", serif` strictly enforced across all headings, cards, inputs, selects, tables, tooltips, modals, badges, and navigation pills.
- **Authoritative Engineering Aesthetic**: Clean typographic hierarchy with robust line heights and weights providing an elite corporate report aesthetic.

### 2. Header & Proportional Navigation Bar
- **Pixel-Perfect Alignment**: Single neat row containing the BGR NEO official emblem alongside proportional navigation pills (`Match`, `Camera Index`, `Suppliers`, `Project Status`).
- **Uniform Dimensions & Proportions**: Every pill has an exact 42px height, uniform 20px padding, 15px font size, and vertically centered icon and label alignment.
- **Dynamic Alert Counter**: Pulsing crimson beacon and counter badge showing the number of projects currently requiring immediate attention.

### 3. Summary Cards Side-by-Side Layout & Interactive Filtering
- **3-Column Responsive Grid**:
  1. **Total Projects** (`Portfolio Overview`): Displays total pipeline count (e.g. 7 projects).
  2. **Needs Immediate Attention / At Risk** (`Alert Crimson`): Live count of projects that are Delayed, On Hold, or nearing target deadline with low progress (< 14 days, < 50%).
  3. **Fully Completed** (`Closed Loop`): Live count of FAT/SAT verified and production handed-over projects.
- **Full Interactivity & Visual Highlighting**:
  - Clicking any card immediately applies a visual highlight (e.g. glowing active outline, indicator pill, elevated position).
  - Instantly filters the project list below to show only the matching projects.
  - Live filter feedback status bar with instant **Reset Filter** button.
  - Automatic fallback empty state when no projects match a filter.

### 4. Redesigned Project Cards
Each project card cleanly formats all operational metrics:
- **Client / Company Name**: e.g., `TETRAPAK`, `KRONES`, `SANMINA`, `ABB`, `MOTHERSON`, `FLEX` positioned prominently at the top in uppercase bold corporate styling.
- **Project Name & Code**: e.g., `Sugar De-Bagging Application` with dedicated code pill (`TP-SUG-001`) and installation year (`2026`).
- **Status Badge**: Real-time status pill (`⚠️ Delayed`, `⏸️ On hold`, `⚠️ At risk`, `⏱️ On track`, `✓ Completed`).
- **Progress Bar & Deadline**: Percentage indicator (e.g., `35% completed`) alongside completion target date (e.g., `Deadline: 2026-09-30`).
  - *Delayed / At-Risk / On-Hold*: Animated diagonal warning stripes with crimson gradient.
  - *On Track*: Corporate blue gradient.
  - *Completed*: Emerald success gradient.
- **Days Remaining or Overdue Alert**: Explicit message (e.g., `29 days overdue — Immediate escalation required` or `On hold · 104 days remaining`).
- **11-Stage Workflow Breakdown Preview**: Visual 11-step progress bar showing completed stages, current stage checklist preview, and next upcoming milestone.
- **Interactive Workflow Management**: Clicking any card opens the detailed 11-stage workflow modal.

### 5. Security & Authorization Rules
- **Public Project Creation**: Anyone can click `+ Add New Project` at the top-right of the dashboard to create and track a new project without any password requirement.
- **Password-Protected Workflow Edits**:
  - Projects open in **Public Viewing Mode** by default.
  - Modifying progress percentages, toggling 11-stage workflow statuses, editing deadlines, or putting projects on hold requires **Admin Password Authorization**.
  - Default Admin Credentials: `bgrneo2024` or `admin` (also accepts `bgrneo`, `admin123`).
  - Admin mode enables live stage toggles (which auto-calculate progress live), manual progress override slider, deadline date editor, and session lock.

### 6. High-End Vision & Optics Motion Background
- **Deep Machine-Vision Canvas (`#090D16`)**:
  - **Optical Lens Wireframes**: Multi-element concentric wireframes with realistic rotating aperture iris blades, outer millimeter tick calibrations, and focal length labels (`16mm`, `25mm`, `35mm`, `50mm`).
  - **Laser Target Crosshairs & Calibration Reticles**: Red and cyan alignment reticles with targeting brackets, millimeter axes, and coordinate readouts (`CAL-101`).
  - **Optical Scan Beams**: Sweeping horizontal laser scan lines with gradient trails and optical guide marks.
  - **Industrial Camera Glyphs**: Floating C-mount camera wireframes with lens barrel, sensor plane, interface labels (`GigE` / `USB3`), and pulsing green status LEDs.
  - **Sparse Metrology Mesh**: Precision coordinate points connected by distance-based laser lines (zero messy random dots).
  - **Interactive Cursor HUD**: Reticle targeting HUD tracks cursor movement with live field-of-view coordinates.

### 7. Basler Camera Index
- The catalog includes the blaze-101s, blaze-102s, and blaze-112s ToF cameras plus the supplied ace 2 10GigE variants.
- Basler records include resolution, frame rate, sensor, interface, sensor format or ToF optical details, and dedicated product artwork. Pricing is intentionally excluded.

The Keyence catalog also includes the six VJ-Series models (`VJ-H048CX`, `VJ-H048MX`, `VJ-H200CX`, `VJ-H200MX`, `VJ-H500CX`, and `VJ-H500MX`) with dedicated artwork and their pixel, frame-rate, GigE, C-mount, sensor-size, and color/monochrome specifications.

### 8. Order Received Project Archive
- Project Status includes the official order-received archive grouped into `2026 - 2027`, `2025 - 2026`, `2024 - 2025`, and `2023 - 2024` categories.
- The category selector filters the project cards while retaining exact folder names and source modification dates.

---

## File Structure

```text
BGR-NEO-VisionSelector/
├── index.html            # Application shell, header navigation, modals, live status ticker
├── assets/
│   ├── logo.png          # Official BGR NEO corporate logo
│   └── cameras/          # Dedicated vector visuals for industrial cameras
│       ├── allied.svg    # Allied Vision Alvium series
│       ├── basler.svg    # Basler general camera visual
│       ├── basler-ace2.svg # Basler ace 2 product visual
│       ├── basler-blaze.svg # Basler blaze ToF product visual
│       ├── baumer.svg    # Baumer CX / LXT series
│       ├── flir.svg      # Teledyne FLIR Blackfly S
│       ├── hikrobot.svg  # Hikrobot CS / CA series
│       ├── ids.svg       # IDS Imaging uEye CP
│       ├── jai.svg       # JAI Spark / Go series
│       ├── lmi.svg       # LMI Technologies Gocator 3D
│       ├── lucid.svg     # LUCID Vision Phoenix / Triton
│       ├── omron.svg     # Omron Sentech series
│       └── photoneo.svg  # Photoneo PhoXi 3D scanner
├── css/
│   └── app.css           # Times New Roman design system, glassmorphic cards, 3-column stats
├── js/
│   ├── data.js           # Industrial cameras catalog, brand suppliers, 11-stage project datasets
│   ├── filterLogic.js    # Normalized camera matching and requirement gates
│   ├── firebaseStore.js  # Firestore project/catalog persistence and realtime subscription
│   ├── bg.js             # High-end industrial optics canvas motion engine
│   └── app.js            # Recommendation ranking, catalog search, interactive filters, admin auth
└── README.md             # Project documentation
```

---

## Quick Preview & Deployment

This project is a standalone web application requiring zero build steps or npm installations.

### Local Preview via Python HTTP Server:
```bash
# Navigate to the project directory and run:
python -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.

Alternatively, you can open `index.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).

## Firebase Firestore synchronization

The project dashboard uses Firebase Firestore when `firebase-config.js` contains the
Firebase Web App configuration. It continues to use local storage when those values
are blank, so local preview remains usable without a backend.

The app uses the `project_workflow` collection:

- Each project is stored as a document whose ID is the project ID.
- The camera catalog is stored in the `camera_catalog` document.
- Firestore `onSnapshot` updates projects and cameras in every open browser.

Copy the Firebase Web App configuration from **Project settings > Your apps** into
`firebase-config.js`. Enable Firestore Database in the Firebase console, deploy the
site, and configure Firestore Security Rules for the intended public/admin access.
The browser must use only the Firebase Web App configuration; never put service
account credentials in the repository.

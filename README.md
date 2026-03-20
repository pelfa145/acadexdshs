# DSHS Acadex 2026 - Premier Research Platform

A next-generation digital archive for preserving and sharing student research. Rebuilt for the 2026 academic year with a modern glassmorphism UI, real-time interactivity, and persistent local storage.

![Acadex 2026 Banner](https://via.placeholder.com/1200x400/4f46e5/ffffff?text=DSHS+Acadex+2026+Preview)

## ✨ New in 2026 Edition

The platform has been completely revamped to provide a professional, SaaS-like experience while remaining a lightweight static site.

### 🎨 Modern UI/UX
- **Glassmorphism Design:** Contemporary aesthetic with frosted glass effects and subtle gradients.
- **Micro-interactions:** Smooth transitions, card hover effects, and loading states.
- **Responsive Layout:** Mobile-first architecture that adapts seamlessly to phones, tablets, and desktops.
- **Dark Mode Ready:** Built with CSS variables for easy theming.

### 🚀 Enhanced Functionality
- **Smart Library:** Real-time search with debouncing, multi-criteria filtering, and sorting (Newest, Oldest, A-Z).
- **Persistent Storage:** Uses `localStorage` to save uploaded papers, view counts, and user sessions without a backend.
- **Interactive Dashboard:** Animated statistics counters and "Featured Research" highlights.
- **Toast Notifications:** Custom, non-intrusive alerts for user actions (uploads, downloads, citations).
- **Dynamic Views:** Toggle between Grid and List views for the research library.

## 🛠 Features

- **Authentication Simulation:** School email validation (`.edu` or `dshs` domain check).
- **Paper Submission:** Comprehensive upload form with keyword tagging and file preview.
- **Citation Tool:** Auto-generate and copy citations to clipboard.
- **Usage Analytics:** Tracks views and downloads locally for each paper.
- **Strand Management:** Categorized by STEM, ABM, HUMSS, GAS, and ICT.

## 📦 Quick Start

1. Clone or download this repository.
2. Install dependencies (optional, for local server):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` to view the platform.

## 🌍 Deployment

This is a **100% static website** (HTML/CSS/JS). No backend server is required.

1. Push to GitHub.
2. Go to **Settings > Pages**.
3. Select `main` branch as the source.
4. Your site is live!

## 📂 Project Structure

```
dshs-acadex-2026/
├── index.html      # Semantic HTML5 structure
├── styles.css      # Modern CSS3 with Variables & Animations
├── script.js       # Vanilla JS State Management & Logic
├── package.json    # Dev tooling
└── README.md       # Documentation
```

## 💻 Tech Stack

- **Core:** HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES6+)
- **Icons:** Font Awesome 6
- **Typography:** Inter (Sans) & Playfair Display (Serif) via Google Fonts
- **Storage:** Browser LocalStorage API

---

**DSHS Acadex** - Empowering the next generation of researchers.
© 2026 DSHS Research Department. All rights reserved.

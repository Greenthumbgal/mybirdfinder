# 🪶 FeatherLog

**A beautiful backyard bird visitor journal** — built with love for bird-loving moms everywhere.

Track every feathered friend that visits your yard. Log sightings, browse your visitor directory, analyze patterns, and build a personal bird journal — all stored privately on your device.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### Run Locally

```bash
# 1. Navigate to the project folder
cd Bird

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏡 **Dashboard** | Today's count, most common visitor, quick log button |
| 📋 **Bird Log** | Full sightings list with search, filter, and sort |
| ➕ **Log a Bird** | Rich form: species, behavior, location, food, photo, colors, notes |
| 🐦 **Visitor Directory** | Auto-generated species profiles with badges |
| 📊 **Stats** | Charts: frequency, monthly activity, time of day, food & behavior breakdown |
| ⚙️ **Settings** | Export JSON/CSV, import, restore sample data, clear all |
| ❓ **Mystery Bird Mode** | Log unknown species with ID clues for later identification |
| 🖼️ **Photo Upload** | Attach photos (stored as base64 locally) |
| 💾 **localStorage** | All data lives in your browser — no account, no backend |

---

## 🗂️ Project Structure

```
src/
  components/
    Layout/         # Sidebar nav + mobile nav shell
  pages/
    Dashboard/      # Home summary page
    AddSighting/    # Add / edit sighting form
    BirdLog/        # Sightings list with search & filter
    BirdProfiles/   # Auto-generated species directory
    Stats/          # Charts & analytics
    Settings/       # Data management tools
  data/
    sampleData.ts   # 18 demo sightings
  hooks/
    useLocalStorage.ts  # Persistent state hook
  types/
    index.ts        # All TypeScript interfaces
  utils/
    helpers.ts      # Helpers, exporters, profile builder
  index.css         # Global design system (tokens, buttons, shared components)
  App.tsx           # Router + global state
```

---

## 🔮 Future Features

### 📸 Birdfy Photo Import
Automatically pull sighting photos and timestamps from your Birdfy smart feeder camera directly into your log.

### 🤖 AI Photo Identification
Upload a photo and get instant species identification — Merlin / BirdNET-style integration using open bird ID APIs.

### 🎵 Merlin / BirdNET Integration
Identify birds by sound recording. Tap a button, record a chirp, get a species match.

### 🏠 Home Assistant Dashboard
A custom Home Assistant card showing today's backyard activity alongside your smart home dashboard.

### 🌦️ Weather API Integration
Automatically pull in weather data when logging a sighting — no need to type it manually.

### 👨‍👩‍👧 Family-Shared Bird Journal
Cloud sync so the whole family can log sightings from different devices and share one backyard journal.

### 📱 Mobile PWA
Progressive Web App packaging so FeatherLog installs as a native-feeling app on iPhone and Android.

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast dev server + bundler
- **React Router v6** — client-side routing
- **Recharts** — responsive charts
- **localStorage** — zero-backend persistence
- **Google Fonts** — Lora (display) + Inter (body)

---

*Made with 🌿 for bird lovers everywhere.*

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

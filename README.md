# Tally Diary

A beautifully designed, personal journaling application emphasizing absolute data privacy and instantaneous local-first performance.

![Tally Diary](/assets/preview.png) *(Preview snapshot)*

## Features
- **Own Your Data**: Complete privacy. Tally Diary syncs your journal directly to a hidden, secure partition in your personal Google Drive (`appDataFolder`). No centralized third-party servers hold your personal musings.
- **Batched Sync Engine**: Optimized for users with decades of daily logging. Automatically bundles entries into discrete chunks, aggressively mitigating Google Drive API rate-limiting issues.
- **Local-First Architecture**: Your diary loads instantly on launch from `localStorage`. Drive reconciliations happen intelligently in the background.
- **Robust Tracking**: Along with text logging, seamlessly append custom "Tallies" spanning categories like Food, People, or Check-ins alongside an aggregate daily good/bad metric.
- **Reflections**: See visual habit metrics, and experience automatically resurfaced entries like "One year ago today" inside the Insights UI. 
- **Dark & Light Mode**: Fluid transitions that automatically respond to your device's preferences.

## Tech Stack
- **Framework**: [SvelteKit 5](https://svelte.dev/)
- **Core Language**: TypeScript
- **Styling**: Tailwind CSS / Lucide Icons
- **Authentication**: Google Identity Services (OAuth 2.0 PKCE)
- **Data Stores**: Google Drive API (v3) & `localStorage`
- **Hosting Target**: Firebase Hosting (adapter-static)

## Local Development

1. Ensure you have Node.js installed (v20.19+ or v22.12+ recommended).
2. Install the necessary dependencies:

```bash
yarn install
```

3. Boot up the local SvelteKit dev server:

```bash
yarn dev --port 3000
```
> Wait for the console log telling you the application is ready, and navigate to `http://localhost:3000`.

## Deployment (Firebase)

The application utilizes `@sveltejs/adapter-static` rendering a purely client-side SPA payload.

1. Build the production asset bundle into the `/build` directory:
```bash
yarn build
```

2. Push the files to Firebase Hosting using your configured `firebase.json`:
```bash
firebase deploy --only hosting
```

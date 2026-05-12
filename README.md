# Crane & AGV Control Dashboard

This repository contains a React + TypeScript frontend for a factory dashboard that connects to a crane via MQTT and displays live telemetry in both 2D and 3D views.

## What it is

- A responsive control panel for crane operation and AGV monitoring
- MQTT-based connection to a crane device
- Live telemetry display: position, angles, and status
- 2D factory map plus a 3D digital twin preview
- Recording toggle for crane telemetry

## Tech stack

- React 19
- TypeScript
- Vite
- Three.js / @react-three/fiber
- MQTT client
- ESLint

## Project layout

- `ui/` — actual frontend app
- `ui/src/` — source code
- `ui/src/components/` — UI panels and views
- `ui/src/hooks/useMqtt.ts` — MQTT integration
- `ui/package.json` — app scripts and dependencies
- `package.json` — root proxy scripts for convenience

## Run locally

From the repository root:

```bash
npm run install
npm run dev
```

Then open the local Vite URL shown in the terminal.

If you prefer to work directly inside the frontend folder:

```bash
cd ui
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production bundle is generated in `ui/dist/`.

## Deploy

The app is a static frontend and can be deployed to any static hosting provider, for example:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

Just deploy the contents of `ui/dist/` after building.

---

# Crane & AGV Dashboard

To repozytorium zawiera frontend React + TypeScript do pulpitu sterowania suwnicą, który łączy się przez MQTT i pokazuje dane w trybie 2D i 3D.

## Co to jest

- Panel sterowania suwnicą i AGV
- Połączenie MQTT z urządzeniem suwnicy
- Live telemetry: pozycja, kąty, status
- Widok 2D mapy hali oraz 3D digital twin
- Przycisk nagrywania danych telemetrycznych

## Stos technologiczny

- React 19
- TypeScript
- Vite
- Three.js / @react-three/fiber
- MQTT
- ESLint

## Struktura projektu

- `ui/` — właściwa aplikacja front-end
- `ui/src/` — kod źródłowy
- `ui/src/components/` — komponenty interfejsu
- `ui/src/hooks/useMqtt.ts` — integracja MQTT
- `ui/package.json` — skrypty i zależności aplikacji
- `package.json` — skrypty główne do uruchamiania z katalogu root

## Uruchamianie lokalne

Z katalogu głównego repozytorium:

```bash
npm run install
npm run dev
```

Następnie otwórz adres Vite wyświetlony w terminalu.

Możesz też pracować bezpośrednio z katalogu `ui`:

```bash
cd ui
npm install
npm run dev
```

## Budowanie

```bash
npm run build
```

Gotowa aplikacja pojawi się w `ui/dist/`.

## Wdrażanie

Aplikacja jest statyczna i można ją wdrożyć na dowolnym hostingu statycznym, np.:

- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

Wystarczy wdrożyć zawartość katalogu `ui/dist/` po zbudowaniu.

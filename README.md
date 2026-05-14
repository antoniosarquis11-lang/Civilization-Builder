# Civilization Builder — 50-Year Nation Simulator

A React/Vite browser app where users create a fictional country, set policies, simulate 50 years of history, and receive charts, events, national statistics, and a final civilization report.

## Features

- Country creation: name, geography, population, resources, political system, development level
- Policy sliders: tax, education, military, infrastructure, welfare, trade openness, environmental regulation, anti-corruption
- 50-year simulation engine
- Timeline events every 5 years
- GDP, GDP per capita, stability, inequality, innovation, corruption, environment, military and diplomacy calculations
- Charts powered by Recharts
- Final national ending and score
- Saves latest simulation in localStorage
- Fully static: no backend required

## Run locally

```bash
npm install
npm run dev
```

## Build for Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

## Publish workflow

1. Upload this full project to a GitHub repository.
2. Go to Netlify.
3. Add new project → Import existing project.
4. Select the GitHub repository.
5. Use build command `npm run build` and publish directory `dist`.
6. Deploy.

## Notes

This is version 1. It is intentionally static and browser-only. Later versions could add accounts, saved civilizations, leaderboards, AI-generated histories, maps, diplomacy, wars, revolutions and multiplayer worlds.

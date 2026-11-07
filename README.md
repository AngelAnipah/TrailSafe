# TrailSafe UT

> Before you hike in Utah, know if it’s safe today - and make sure someone knows you’re out there.

TrailSafe UT helps hikers make safer, explainable trail decisions using live weather, avalanche conditions, daylight, and trail difficulty. It also provides a timed check-in flow that can simulate an emergency alert if a hiker does not return on time.

## Features

- Browse 8 curated Utah trails with a live, explainable Safety Score
- Filter trails by **Go**, **Caution**, and **Avoid**
- View weather now and over the next six hours
- See avalanche danger by Utah region
- Compare estimated finish time with sunset
- Get a packing checklist tailored to today’s conditions
- Start a hike, set an expected return time, and choose an emergency contact
- Simulate a missed check-in alert with last trail and location

## Safety Score

| Factor | Weight |
|---|---:|
| Weather | 40% |
| Avalanche danger | 30% |
| Daylight | 20% |
| Trail difficulty | 10% |

- **85–100:** Go
- **60–84:** Caution
- **Below 60:** Avoid

## Tech Stack

- Next.js
- Tailwind CSS
- Leaflet + OpenStreetMap
- Open-Meteo API
- localStorage
- Vercel

## Team Roles

- **Frontend:** Trail picker and detail screens
- **Data / Scoring:** Open-Meteo integration, safety formula, trail data
- **Safety Flow:** Hike timer, check-in, alert simulation
- **Pitch / Demo:** Slides and 2-minute judge demo

## Getting Started

```bash
git clone https://github.com/YOUR-USERNAME/trailsafe-ut.git
cd trailsafe-ut
npm install
npm run dev

# 🏁 F1 Clash Zero — F1 Team Principal Game

**Built on $0 budget.** Mobile-first, web-tech (HTML/JS/Canvas) wrapped as native Android/iOS with Capacitor — duplicated play style from **Football Legend** and reimagined as **F1 Clash**.

> Football Legend → F1 Clash Zero translation:
> - **Become a Legend (player career)** → **Become a Legend: Driver Career**
> - **Master League (squad builder)** → **Team Principal Mode (2 drivers + 6 car components)**
> - **Honest simulation engine (displayed odds = true odds)** → **Honest race engine (displayed win % = true Monte Carlo)**
> - **Ghost PvP async** → **Ghost Duels async (zero-budget, serverless)**
> - **Capacitor + Supabase** → Same stack

## Repo Structure

```
game/       The game itself (engine, team management, UI, cloud, tests). Runs in any browser.
app/        Capacitor Android/iOS wrapper (builds APK/AAB/IPA)
docs/       GDD, Architecture, Roadmap
tests/      Fairness + progression tests
```

## Quick Start

```bash
cd game
python3 -m http.server 8000
# open http://localhost:8000
```

## Build APK (like Football Legend)

```bash
cd app
npm install
node copy-game.js
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Core Principles (from Football Legend, non-negotiable)

1. **Simulation is never rigged** — displayed win % ARE the engine's true odds (enforced by `tests/test-fairness.js`)
2. **Global identity** — fictional drivers/teams, not licensed F1 (zero budget = no IP)
3. **Losses never deduct money** — gate receipts / sponsorship model, not punishment
4. **Mobile is end goal** — browser is for testing

## F1 Clash Mechanics Modeled

- **Team Loadout:** 2 Drivers + 6 Components (Brakes, Gearbox, Rear Wing, Front Wing, Suspension, Engine)
- **Driver Stats:** Overtaking, Defending, Qualifying, Race Pace, Tyre Management, Consistency
- **Component Stats:** Speed, Cornering, Power Unit, Reliability, Pit Stop Time
- **Track Stats:** Each circuit has 2 boosted stats (e.g., Monza = Speed + Overtaking, Monaco = Cornering + Defending)
- **Race Strategy:** Tyre compounds (Soft/Medium/Hard/Wet), Engine modes (Push/Standard/Conserve), Power Unit bar, Pit timing
- **Race Events:** Safety Car (VSC-style), Mechanical Failure, Weather Change (dry->wet)
- **Progression:** Series 1-10 unlock, Crate system, Duplicate upgrades, Coins + Bucks + Legacy Points
- **PvP:** Async Ghost Duels (like Football Legend Ghost PvP) — real players' validated teams, AI tactics

See `docs/GDD.md` for full design.

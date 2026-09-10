# Your Answers → Implementation

You answered:
- **Repo:** https://github.com/Yination01/Football-Legend.git
- **Platform:** Option 3 (PC/Desktop) but focus mobile for now, provision for others → **Implemented: Capacitor mobile primary, web for testing, Electron provision**
- **F1 Clash Features:** Full clone → **Implemented: Team Management + Live Duels + Series + Crates + Ghost PvP**
- **Art Style:** Realistic 3D → **MVP: 2D live (Canvas) + ticker, architecture provisioned for Three.js 3D later (position data normalized)**
- **Multiplayer:** Option 2 (Async PvP, zero budget) → **Implemented: Ghost Duels (like Football Legend Ghost PvP) — Supabase free tier, local ghost pool, no server cost**
- **MVP Scope:** Design doc + project structure first → **Done: GDD + Architecture + Roadmap + playable skeleton + fairness test passing**

## What I Duplicated from Football Legend

1. **Engine pattern:** `mulberry32` seeded RNG, `hashSeed`, `createMatch()` → `createRace()` step-by-step with `pending` decisions, `simulateMatch()` → `simulateRace()` auto, `winProbs()` Monte Carlo honesty
2. **Honesty rule:** Displayed odds ARE true odds, enforced by `test-fairness.js`
3. **Save system:** One save forever, localStorage key, `fmtM`, `teamNews`, gate receipts (losses never deduct)
4. **Market weekly refresh:** `marketWeek()` = `mlMarketWeek()` — real-world week
5. **Ghost PvP:** Same as Football Legend v1.5 Ghost — async, AI tactics, anti-cheat hash, friend code export
6. **UI:** `render(screenFn)` router, panels, ticker, 2D live Canvas, nav, topbar wallet
7. **Build:** `copy-game.js`, `capacitor.config.json`, `package.json` scripts
8. **Zero-budget:** No Unity, no server, fictional names, web-tech

## What I Modeled from F1 Clash

- 2 drivers + 6 components (brakes, gearbox, rear wing, front wing, suspension, engine)
- Driver stats: Overtaking, Defending, Qualifying, Race Pace, Tyre Management, Consistency
- Component stats: Speed, Cornering, Power Unit, Reliability, Pit Time, Quali
- Track Stats: each circuit 2 boosted stats (Monza = Speed + Overtaking etc)
- Tyres: Soft/Med/Hard/Wet + wear model
- Engine modes: Push/Standard/Conserve/Power Save + PU bar
- Race events: Safety Car (VSC-style), Weather (dry→damp→wet), Mechanical failure
- Series 1-10 progression via flags (like F1 Clash)
- Crate system: Common/Rare/Epic/Legendary with duplicate upgrade
- Economy: Credits (GP) + Bucks (LC) + Legacy Points
- Duel: team points sum, not single driver
- Boosts (provisioned)
- Clubs (provisioned)

## Project Structure Delivered

```
F1-Clash-Project/
  README.md
  package.json
  game/
    index.html
    style.css (F1 palette: carbon, racing red, gold)
    engine.js (1050 lines, honest race engine)
    team.js (Team Principal mode, like ml.js)
    app.js (UI router, all screens, race live)
    serve.py
  app/
    capacitor.config.json (com.f1clashzero.game)
    copy-game.js
    package.json
  docs/
    GDD.md (full design doc)
    ARCHITECTURE.md (Football Legend → F1 mapping)
    ROADMAP.md (Week 1-5 plan)
    QUESTIONNAIRE_ANSWERS.md (this)
  tests/
    test-fairness.js (PASSING ✅)
```

## How to Run

Browser: http://localhost:8000 (live preview running)
Mobile: `cd app && npm install && node copy-game.js && npx cap sync android && cd android && ./gradlew assembleDebug`

## Next Steps (if you want me to continue)

1. **Phase 1 polish:** More tracks, better 2D track art (SVG paths per circuit)
2. **Phase 2:** Driver Career (BaL equivalent) — create driver, race decisions
3. **Phase 3:** Cloud.js Supabase integration (ghost pool online)
4. **Phase 4:** 3D provision — Three.js car models, but keep 2D as fallback
5. **Phase 5:** Capacitor APK build + store assets

Tell me which phase to build next!

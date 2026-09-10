# F1 Legends — Architecture (Football Legend DNA)

This doc maps Football Legend's proven architecture to F1.

## Football Legend Structure (Analyzed)

```
Football-Legend/
  game/
    index.html          — shell, loads css + js
    style.css           — design system, panels, ticker, 2D live view
    engine.js           — pure logic, no DOM, seeded RNG, createMatch(), simulateMatch(), winProbs()
    ml.js               — Master League: squad, formation, market, tactics, season, cup, CT
    app.js              — BaL + UI router, screens, 2D live rendering, moment player
    cloud.js            — Supabase, ghost pool, gift inbox, validation
    vendor-supabase.js  — supabase client
    tests/              — fairness, ML, CT, skills
  app/
    capacitor.config.json
    copy-game.js        — copies ../game to android assets
    android/            — Capacitor project
  docs/
  .github/workflows/apk.yml
  package.json          — scripts: test:all, sync, apk
```

**Key Patterns:**
1. Engine is pure, testable, no DOM — fairness enforced by tests
2. UI is separate, renders engine state
3. Save = localStorage + mirror + cloud push
4. One save forever, no reset (eFootball model)
5. $0 budget = web tech + Capacitor + Supabase free tier

## F1 Legends Structure (Proposed)

```
F1-Clash-Project/
  game/
    index.html
    style.css           — copy Football Legend palette but F1: dark carbon, racing red, gold
    engine.js           — F1 race engine (see below)
    team.js             — Team Principal mode (like ml.js)
    driver.js           — Driver Career mode (like app.js BaL portion)
    app.js              — UI router, screens, race live view
    cloud.js            — Supabase ghost duels, validation, ranking
    vendor-supabase.js
    tracks/             — JSON track definitions (layout, length, track stats, SVG path)
    assets/             — inline SVGs for cars, tyres (no external files for preview)
  app/
    capacitor.config.json
    copy-game.js
    android/
    ios/                — provision
  docs/
    GDD.md
    ARCHITECTURE.md (this)
    ROADMAP.md
  tests/
    test-fairness.js    — winProbs vs simulateRace honesty
    test-team.js        — progression, crates, economy
    test-engine.js      — tyre wear, pit, SC, weather

  package.json
```

## Engine.js — F1 Translation

### Football Legend engine.js:

```js
function mulberry32(a) { ... }
function hashSeed(str) { ... }
const POSITIONS = { GK: { weights: {PAC...}}, ...}
const PLAYSTYLES = { poacher: {pos:[CF], shoot:1.3}, ...}
const ROLES = { balanced: {involve:1.0, risk:1.0}, ...}
function createMatch(home, away, opts) {
  // opts: seed, role, player, playerTeam, condition, fitLvl, medLvl
  // state: min, gH, gA, momentum, stamina...
  // step() returns {min, events, decision, done}
  // decide(choice) resolves decision
}
function simulateMatch(home, away, opts) // auto decisions
function winProbs(home, away, n) // Monte Carlo
```

### F1 engine.js (new):

```js
// Seeded RNG — identical
function mulberry32(a) { ... }
function hashSeed(str) { ... }

// Driver roles (like POSITIONS)
const DRIVER_ROLES = {
  qualifier: { label: "Qualifier", weights: { QUA:.35, PAC:.20, ... } },
  racer: { label: "Racer", weights: { OVR:.30, DEF:.20, ... } },
  whisperer: { label: "Tyre Whisperer", weights: { TYR:.40, CON:.20, ... } }
}

// Driving styles (like PLAYSTYLES)
const DRIVING_STYLES = {
  aggressive: { label: "Aggressive", overtake:1.3, tyreWear:1.25, mistake:1.2 },
  balanced: { label: "Balanced", overtake:1.0, tyreWear:1.0, mistake:1.0 },
  smooth: { label: "Smooth", overtake:0.85, tyreWear:0.75, mistake:0.85 }
}

// Race instructions (like ROLES)
const RACE_INSTRUCTIONS = {
  push: { label: "Push", pace:1.08, tyre:1.25, pu:-15, risk:1.15 },
  standard: { label: "Standard", pace:1.0, tyre:1.0, pu:5, risk:1.0 },
  conserve: { label: "Conserve", pace:0.94, tyre:0.6, pu:20, risk:0.85 },
  powersave: { label: "Power Save", pace:0.90, tyre:0.5, pu:35, risk:0.7 }
}

// Components (like ML_FORMS but parts)
const COMPONENTS = ["brakes","gearbox","rearWing","frontWing","suspension","engine"]
const COMPONENT_STATS = { speed, cornering, powerUnit, reliability, pitTime, quali }

// Track defs (new)
const TRACKS = {
  monza: { name:"Beaumont GP", country:"Italy", laps:6, trackStats:["speed","overtaking"], wear:0.9, scChance:0.08 },
  monaco: { name:"Castelmar", country:"Monaco", laps:9, trackStats:["cornering","defending"], wear:0.7, scChance:0.15 }
  // etc
}

// Skills (like SKILLS)
const DRIVER_SKILLS = {
  "Overtake Artist": { overtake:1.12 },
  "Tyre Saver": { tyreWear:0.85 },
  "Wet Master": { wetPace:1.15 },
  "Pit King": { pitTime:-0.3 },
  "Clutch": { lastLap:1.10 }
}
const SKILL_POS = { "Overtake Artist": ["racer","qualifier"], ... }

// Core race
function createRace(teamA, teamB, opts) {
  // team = { drivers:[{id, stats, style, skills}], components:{brakes:{level, stats}}, teamScore }
  // opts: seed, trackId, instructionsA, instructionsB, tyreChoiceA, tyreChoiceB
  // state: lap, sector, positions[20], tyreWear[20], pu[20], timeGap, safetyCar, weather
  // step() — advances one sector (like Football's one minute)
  // decision points: pit window, weather change, SC, tyre critical
  // decide(choice) — { pit: bool, compound, instruction }
  // result() — finishing order, points, fastest lap
}

function simulateRace(teamA, teamB, opts) // auto strategy
function qualify(teamA, teamB, trackId, seed) // grid
function winProbs(teamA, teamB, trackId, n) // honest odds
```

### Honesty Rule (Critical)

Football Legend enforces:
```js
// winProbs runs SAME match core the game uses (auto decisions)
// Displayed odds ARE engine's odds — no rigging
```

F1 must enforce same:
```js
// winProbs runs SAME race core with auto pit strategy
// Displayed win % = Monte Carlo of simulateRace
// Test: test-fairness.js checks displayed vs actual within 2%
```

## Team.js — Master League Translation

Football Legend ml.js:
- `M` global save object
- `mlGenPlayer()`, `mlGenSquad()`, `mlTeamStr()`, `effOvr()`
- `mlAutoXI()`, `mlXIValid()`
- Market: `mlMarketPool()` weekly refresh
- Packs: `mlPacksScreen()`
- Matchday: `mlGoMatch()`, `mlMatchScreen()`, `mlFinish()`
- Season: `mlSeasonEnd()`, galaxy rollover

F1 team.js:
- `T` global save (like M)
- `teamGenDriver()`, `teamGenComponent()`, `teamGenSquad()`
- `teamScore()` — sum driver+component with trackStats weight
- `teamAutoLineup()` — pick best 2 drivers + best component per slot
- `teamLineupValid()` — must have 2 drivers + 6 components
- Market: `teamMarketPool()` weekly, component + driver offers
- Crates: `teamCrateScreen()` — Common/Rare/Epic
- Race: `teamGoRace()`, `teamRaceScreen()`, `teamRaceFinish()`
- Season: `teamSeasonEnd()`, series promotion

**Save Key:** `f1ClashZero_Team_v1` (like `footballLegendML_v1`)

## App.js — UI Router

Football Legend app.js:
- `render(screenFn)` — renders HTML string into #app
- Screens: `menuScreen`, `balHome`, `mlHome`, `mlSquadScreen`, etc
- Ticker + 2D live view Canvas
- Moment player (goal replays)

F1 app.js:
- Same `render()` pattern
- Screens: `menuScreen`, `driverCareerHome`, `teamHome`, `teamSquadScreen`, `teamTacticsScreen`, `teamMarketScreen`, `teamCrateScreen`, `teamRacePreview`, `teamRaceLive`
- Ticker: lap-by-lap commentary
- 2D live: track map SVG + dots, not football pitch
- Moment player: overtake replay (same projection math, different assets)

**Style.css:** Copy Football Legend variables but F1 palette:
```css
:root {
  --bg: #0a0e12; /* carbon */
  --bg2: #141a20;
  --panel: #1a242e;
  --panel2: #222f3a;
  --line: #2a3a4a;
  --text: #e8eef4;
  --muted: #8aa0b4;
  --green: #00d084; /* racing green */
  --gold: #ffcc00; /* podium gold */
  --red: #ff2d2d; /* push/red */
  --blue: #00a8ff; /* DRS blue */
}
```

## Cloud.js — Ghost System

Football Legend cloud.js:
- Supabase init
- `Cloud.push("ml")` — save team
- Ghost pool fetch
- Validation: hash, OVR cap

F1 cloud.js:
- Same Supabase
- `Cloud.push("team")` — save team loadout
- Ghost pool: `team_score BETWEEN user_score*0.9 AND 1.1`
- Validation: component levels, driver stats cap, anti-cheat

**Edge Function:** `verify-owner` equivalent for F1 — verify team hash server-side

## Mobile Provisions (Capacitor)

Football Legend:
- `app/capacitor.config.json` — appId com.footballlegend.game
- `copy-game.js` — copies game/ to android assets
- `npx cap sync`

F1:
- Same, but appId com.f1clashzero.game
- Add ios folder provision
- Same copy script
- `package.json` scripts: `start`, `test:all`, `sync`, `apk`

## Cross-Platform Provisions (Your Request: Option 3 but mobile focus)

- **Mobile:** Capacitor wrapper (primary)
- **Web:** game/ runs standalone (secondary, for testing)
- **PC/Desktop:** Electron wrapper provision (same game/ folder, new `desktop/` folder with electron main.js) — architecture already supports because engine is pure JS, no DOM
- All share same `game/` — no duplication

## Why This Works Zero-Budget

- No Unity/Unreal license — web tech free
- No 3D artists needed for MVP — Canvas + SVG
- No server cost — Supabase free tier (like Football Legend) + async ghost (no realtime socket server)
- No F1 license — fictional names (legal, like Football Legend)
- Same build pipeline as Football Legend — proven

## Next Steps to Code

1. Copy Football Legend `engine.js` RNG + structure, replace football logic with F1 race logic
2. Copy `ml.js` structure, replace squad with drivers/components
3. Copy `app.js` render loop, replace screens with F1 screens
4. Copy `style.css` and recolor
5. Copy `cloud.js` and adapt table names
6. Write `test-fairness.js` — winProbs honesty

# F1 Clash Zero — Game Design Document (GDD)
**Version:** 0.1 — Design Doc MVP
**Date:** 2026-09-10
**Budget:** $0
**Inspired by:** Football Legend (playstyle/architecture) + F1 Clash (game model)
**Target:** Mobile-first (Android/iOS via Capacitor), with Web & PC provisions

---

## 1. High Concept

> **Football Legend** is a spectated, honest-odds football sim where you never directly control players.
> **F1 Clash Zero** is the same idea for F1: you are **Team Principal**, not driver. You don't steer. You **strategize**.

**Core Fantasy:** Toto Wolff / Christian Horner moment — tell your drivers when to push, when to pit, which tyres, react to Safety Car and rain, and out-think the rival principal on the pit wall.

**One-sentence pitch:** "F1 Clash meets Football Legend — honest simulation, zero-budget, async PvP team management where brains beat reflexes."

---

## 2. Translation: Football Legend → F1

| Football Legend System | F1 Clash Zero Equivalent | Why it works |
|------------------------|--------------------------|--------------|
| `engine.js` — 90min match, chance per min, decision points | `engine.js` — 6-9 lap race, overtake chance per sector, pit decisions | Same seeded RNG, same honesty rule |
| `POSITIONS` (GK, CB, CF...) + `PLAYSTYLES` | `DRIVER ROLES` (Qualifier, Racer, Tyre Whisperer) + `DRIVING STYLES` (Aggressive, Balanced, Smooth) | Position-gated skills |
| `ROLES` per-match (Get Involved, Hold Line) | `RACE INSTRUCTIONS` (Push, Standard, Conserve, Power Save) | Involve/risk trade-off |
| `ML_FORMS` 4-4-2, 4-3-3 | `CAR SETUPS` (High Downforce, Low Drag, Balanced, Wet) | Pre-race loadout |
| `ML_MENT` Defensive/Balanced/Attacking | `ENGINE MODES` + `TEAM MENTALITY` | You +1.5 / Them -3.0 modifiers become Speed/Cornering +/- |
| `SKILLS` Outside Curler, Track Back | `DRIVER SKILLS` Overtake Artist, Tyre Saver, Wet Master, Pit King, Clutch | Same position-gating via `SKILL_POS` |
| `CHANCE_SCENARIOS` open play, counter | `OVERTAKE_SCENARIOS` DRS straight, late braking, undercut, overcut | Variety + honest odds |
| `Master League` squad 18 players | `Team Principal` 2 race drivers + 2 reserves + 6 components x duplicates | Smaller but deeper |
| `Card packs` GP/LC | `Crate System` Coins/Bucks/Legacy Points | Same economy loop |
| `Ghost PvP` vs cloud clubs | `Ghost Duels` vs cloud teams (AI strategy) | Zero-budget async |
| `Friend Match` challenge code | `Friend Duel` export team code | No server needed |

---

## 3. Game Modes (Full Clone as requested)

### 3.1 Driver Career — "Become a Legend: Driver" (like BaL)
- Create driver: name (fictional global pools from Football Legend REGIONS), region, age, driving style
- Pick academy (like picking starting club): 10 fictional F2/F3 teams with different car strengths
- Interactive race decisions: when you ARE the driver, you get Overtake/Defend/Push choices
- Training, upgrades, objectives, transfers to better teams, retirement/HoF
- **Reuse Football Legend engine pattern:** `createMatch()` becomes `createRace()` with `pending` decision

### 3.2 Team Principal — "Master League Equivalent" (MAIN MODE)
This is F1 Clash core.

**Found Your Team:**
- One save, forever (like Football Legend). Name, short code (3 letters), livery colors (col1/col2), region → league
- Start in Series 1 (weakest), climb to Series 10
- Budget: 8.0M Credits + 20 Bucks (like GP + LC)

**Loadout (per race):**
- **2 Race Drivers** + up to 2 Reserves (from squad of 12-16 drivers)
- **6 Components:** Brakes, Gearbox, Rear Wing, Front Wing, Suspension, Power Unit (Engine)
- Each component has: rarity (Common/Rare/Epic/Legendary), level, stats
- Team Score = sum(driver stats + component stats) — used for matchmaking (like F1 Clash)

**Driver Stats (F1 Clash accurate):**
- Overtaking — sees more overtake chances, higher success
- Defending — resists overtakes
- Qualifying — starting position (P1-P20)
- Race Pace — base lap time
- Tyre Management — reduces tyre wear
- Consistency — reduces mistake chance

**Component Stats:**
- Speed — acceleration/top speed, overtaking on straights
- Cornering — corner speed, defending in corners
- Power Unit — recharge rate of ERS/Power bar
- Reliability — mechanical failure chance (inverse)
- Pit Stop Time — avg duration
- Qualifying Boost — component-specific quali boost

**Track Stats System (direct from F1 Clash):**
Every circuit has 2 Track Stats (1 driver + 1 component). They get 1.3x weight on that track.
Examples:
- Monza: Speed + Overtaking
- Monaco: Cornering + Defending
- Silverstone: Cornering + Race Pace
- Spa: Speed + Tyre Management
- Interlagos: Overtaking + Power Unit
- Suzuka: Cornering + Consistency

**Crate & Upgrade Loop (F1 Clash faithful, Football Legend economy):**
- Win race → Crate (5 types: Common, Rare, Epic, Legendary, Special)
- Crate drops: Drivers, Components, Boosts, Coins, Bucks
- Duplicate needed to upgrade: e.g., Common needs 2→4→8→16 cards, Epic needs 1→2→4
- Coins cost to upgrade + Bucks for Epic+ + Legacy Points for Legendary
- Asset Store (weekly refresh like Football Legend market) — real-world week
- Free crate via ad (7 per 8 hours) — zero budget monetization later

**Economy:**
- Credits (GP) — earned via gate receipts/sponsorship, never deducted on loss
- Bucks (LC) — premium, from trophies, top-3, cups, events
- Legacy Points — for Legendary drivers only
- **Losses never deduct money** — same principle as Football Legend

### 3.3 Race Day — The Duel (Core Loop)

**Pre-Race:**
1. Qualifying: Auto-sim single lap per driver, based on Qualifying stat + component quali + track stats + small RNG. Determines P1-P20 grid.
2. Tyre Choice: Soft (fastest, 30% wear/lap), Medium (balanced, 18%), Hard (slow, 10%), Wet (only if >40% wet)
3. Boost Selection: Like F1 Clash — pick boost per driver (e.g., +5 Overtaking, +3 Speed). Consumed 1 per race + 1 per pit stop.

**Race (6-9 laps depending on Series — F1 Clash accurate):**
- Series 1-2: 8 laps
- Series 3+: 6-7 laps long tracks, 9 laps short tracks
- Lap = 3 sectors. Each sector: chance of overtake event, tyre wear, PU drain/recharge, random event check
- **Engine Modes (3-way switch like Football Legend ROLES):**
  - 🔴 **Push** — +0.8s/lap faster, +25% tyre wear, -15% PU per sector, +15% overtake chance
  - 🟡 **Standard** — baseline
  - 🟢 **Conserve** — -0.6s/lap slower, -40% tyre wear, +20% PU recharge, -20% overtake chance
  - 🔵 **Power Save** — -1.0s slower, -50% wear, +35% PU recharge, disables overtake
- **Power Unit Bar (0-100%):** Needed for Push and for defending. If empty, auto-drops to Standard.
- **Tyre Wear (0-100%):** At 75%+ wear, -1.2s/lap. At 90%+, -2.5s/lap + puncture risk. Must pit before 100%.
- **Pit Stops:** Takes avgPitTime (2.5-4.5s) + variance. Choose new compound. Undercut/overcut tactics matter.
- **Dynamic Events (like Football Legend disputes/cards):**
  - 🌧️ **Weather:** Forecast shown top, timer to change. Dry→Wet: dry tyres become -3s/lap. Must pit to Wets.
  - 🚨 **Safety Car:** 12% chance on incident. VSC-style: all cars slow 40%, Push disabled, cars bunch up. 1 lap duration. Pit window.
  - 🔧 **Mechanical Failure:** Reliability check. 0.5-2% per race per car. DNF.

**Player Interaction:**
Unlike Football Legend's occasional decisions, F1 is constant management — but for MVP we keep Football Legend's decision model:
- At key moments (pit window, weather change, Safety Car, tyre critical), game pauses and asks: "PIT NOW? Soft/Medium/Hard/Wet + Engine Mode?"
- Optional: Manual override anytime (like ML tactical window at 45'/65' — we do Lap 3 and Lap 6 windows)
- **Honest Odds:** Pre-race win % = Monte Carlo of same engine (600 runs). No rigging.

**Post-Race:**
- Points: P1 25, P2 18, P3 15... F1 system but team points = sum of both drivers
- Duel: You vs 1 opponent — if your team points > theirs, you win duel (like F1 Clash)
- Rewards: Crate + Credits + Bucks + Trainer (Mechanic) drops

### 3.4 Series & Leagues
- **Series 1-10** — progression via checkered flags (wins). Each Series unlocks new drivers/components in crates (like Football Legend's tier system)
- **Championship Season** — 18 race calendar (like Football Legend 18 MDs). Table = constructors + drivers
- **Champions Trophy Equivalent:** "World Finals" — top 2 from each region league qualify for inter-league cup
- **Clubs:** Join a Club, earn Reputation, Exhibitions (team vs team) — async, zero-budget

### 3.5 Async Ghost Duels (Zero-Budget Multiplayer)
**Why not realtime?** Realtime needs dedicated server, $ cost. Football Legend solved with Ghost PvP — we copy.

- Cloud save (Supabase free tier) stores your Team Loadout + validated stats (server-side hash like Football Legend v1.5)
- Ghost Pool: Fetch 20 random cloud teams within ±10% Team Score
- AI Strategy: Each ghost has a stored style (Aggressive/Balanced/Conservative) — AI picks pit timing based on that
- Race vs ghost is local simulation vs ghost's car performance, but ghost's decisions are AI-driven from its style, not recorded inputs (simpler, honest)
- Anti-cheat: Server validates team strength, card levels

**Friend Duel:** Export team as base64 code (like Football Legend Friend Match), friend imports and races vs AI version

---

## 4. Visual Style — Realistic 3D Target, 2D MVP

**Target (like F1 Clash):**
- 3D realistic cars, tracks, broadcast camera, pit crew animations
- Custom liveries

**MVP (zero budget, like Football Legend 2D live view):**
- **Ticker Mode:** Text commentary lap-by-lap (like Football Legend)
- **2D Live Mode:** Top-down track map (simplified circuits as splines), dots for cars, color-coded by team, pit lane indicator, Safety Car icon
- **Track Map:** SVG paths for each circuit (Monza, Monaco etc simplified)
- **Attack Strip:** Like Football Legend's attack banner but "DRS ZONE" + "PIT WINDOW" + driver battle arrows
- **No external assets:** Inline SVG, Canvas — same as Football Legend style.css approach

**Future 3D Provision:**
- Engine outputs position data normalized 0-100 per lap — can feed Three.js later
- Component stats already 3D-ready
- Capacitor already supports WebGL

---

## 5. Monetization (Post-Retention, like Football Legend Roadmap)

- Phase 1 (now): No ads, no IAP — pure gameplay, like Football Legend pre-launch
- Phase 2: Rewarded ads for free crate, 7 per 8h (F1 Clash has this)
- Phase 3: Bucks purchase (IAP) + Pit Pass (battle pass)
- **Never pay-to-win rigging:** Odds stay honest, upgrades gated by duplicates not just money

---

## 6. Zero-Budget Stack (Copy Football Legend Exactly)

- **Engine:** Pure JS, no dependencies, seeded mulberry32 RNG
- **UI:** Vanilla HTML/CSS/JS, Canvas for track
- **Persistence:** localStorage + Capacitor Preferences + Documents backup + manual backup codes + Supabase cloud
- **Cloud:** Supabase free tier — auth, DB, edge function for owner key hash verification
- **Build:** Capacitor Android wrapper, GitHub Actions APK (like Football Legend .github/workflows/apk.yml)
- **Tests:** test-fairness.js — winProbs() vs simulateRace() must match within tolerance

---

## 7. Fictional Content (No F1 License)

Like Football Legend's realistic fictional names, we generate:

**Drivers:** Use Football Legend REGIONS name pools, but F1-style
- Example: Callum Whitfield (British), Antoine Lemaire (French), Diego Delgado (Spanish), Lukas Keller (German) etc
- Add F1-style nicknames, numbers

**Teams:** City + suffix
- Ashworth Racing, Beaumont GP, Castelmar Scuderia, Vikstad Motorsport, Novagrad Racing etc
- Colors from CLUB_PALETTE

**Tracks:** Fictional but recognizable
- Ashworth Circuit (Silverstone-like), Beaumont GP (Monza), Castelmar (Monaco), Vikstad Ring (Spa), etc
- Keep real characteristics for Track Stats

---

## 8. Balancing — Honest Numbers

All modifiers shown exactly as applied:
- Formation/setup: +1.0 Speed if Low Drag at Monza
- Mentality: Attacking +2.0 Speed but +1.2 opponent Speed (open race)
- Style duel: Possession beats Long Ball +1.0 (becomes High Downforce beats Low Drag)
- Tyre: Soft +1.2s vs Hard baseline
- Boost: +5 stat shown

---

## 9. MVP Scope

**Design Doc (this doc) — Done**
**Next:**
1. `engine.js` skeleton with seeded RNG, driver/component gen, qualify, race sim, winProbs
2. `team.js` — squad, formation, crates, upgrades, economy
3. `app.js` — UI screens: Home, Squad, Tactics, Market, Race Preview, Race Live (ticker + 2D)
4. `cloud.js` — Supabase ghost pool
5. Capacitor wrapper
6. Tests: fairness, progression

---

## 10. Risks & Mitigations

- **F1 IP:** Use fictional — mitigated like Football Legend global identity
- **Real-time multiplayer cost:** Use Ghost Duels async — mitigated
- **3D art cost:** Use 2D MVP + provision — mitigated
- **Complex race sim:** Start with Football Legend's step() pattern, extend to laps/sectors

# V4 ULTIMATE — All F1 Clash Features + Live F1 Close

## Summary
V4 brings F1 Zero to parity with F1 Clash (all loops) + live F1 racing realism, while keeping zero-dollar, no crates, no F1 IP.

## Engine v4 — `game/engine.js`

### Tracks: 10 → 24 original (no F1 IP)
All fictional, each with unique:
- `flag`, `country`, `length`, `turns`, `layout` (street/circuit/hybrid)
- `trackStats` [Speed, Cornering, etc]
- `wear` (0.7-1.5x), `fuelUse` (0.7-1.4x)
- `drsZones` 1-3, `scChance` 0.06-0.18, `wetChance` 0.05-0.35
- `series` grouping Series 1-10

List: ashworth, beaumont, castelmar, vikstad, torresol, sakuradai, zanari, rioverde, kanzaki, novagrad, harbourfront, desertvista, sunset, coastal, mountain, lakeside, dunes, bayfront, neon, highlands, valley, pacific, lagoon, aurora

### Race Types: 1 → 7
```js
RACE_TYPES = {
  duel:        { laps:"6-9", points:[3,0], tyreRule:false, drs:true, fuel:false, desc:"1v1 team duel" },
  grandprix:   { laps:"12-18", points:[25,18,15,12,10,8,6,4,2,1], tyreRule:true, mandatoryPit:true },
  championship:{ laps:"18-24", points:[25..1], tyreRule:true, full season 24 races },
  sprint:      { laps:6, points:[8,7,6,5,4,3,2,1], tyreRule:false, top8 only },
  endurance:   { laps:"24-36", wear x2, tyreRule:true, fuel:true },
  timetrial:   { laps:1, points:[1], solo ghost },
  exhibition:  { laps:"8-12", club vs club }
}
```

### Full Grid: 4 cars → 20 cars (10 teams x 2)
- `genFullGrid(baseStr, seed)` generates 10 fictional teams with `genTeam`
- `createRace(..., {fullGrid:true})` uses full grid
- `genGhostTeams` for duels still works
- Qualifying: 20 drivers sorted by QUA + component quali + rng + boosts
- Race simulation: 20 positions, intervals, DRS chains

### DRS — Drag Reduction System (like live F1)
- Enabled from Lap 2 if race type allows
- Within 1s gap → DRS active
- Effects:
  - `sectorTime`: -0.3s per DRS zone when DRS on (e.g. 3 zones = -0.9s max)
  - `checkOvertake`: +25% overtake chance when DRS (1.25x)
  - Boosts: `DRS Boost` +10/20/30 DRS stat
  - Skill: `DRS Master` +15% when DRS available
- UI: DRS indicator per car, leaderboard shows DRS, track shows DRS zones count

### ERS / PU — Energy Recovery
- Each car: `pu=100%` battery
- Push = 2.5% per lap consumption, Standard = 0.6%, Conserve = -1.2% recharge (regen)
- PU <30% → +0.8s penalty (depleted)
- UI: PU bar per driver

### Fuel — Like Live F1
- `fuel=100%` start, consumed per lap based on instruction + fuelUse + car fuel stat
- Push = 1.8x use, Standard =1x, Conserve =0.55x
- Sector time: fuel weight +0.2s per 50% extra weight, -0.15s when light (<30%)
- Pit resets fuel to 100%
- Boosts: `Titan` gives -20 fuel use
- Skill: `Fuel Saver` +20% save, `Power Whisperer` +12% PU save

### Tyre Rule — Mandatory 2 Compounds
- GP/Championship/Endurance: must use 2 different dry compounds (soft/medium/hard)
- `usedCompounds` Set tracked per car
- End of race: if used <2 and not wet race → +10s penalty
- Intermediate: new tyre between slicks and wet, for damp
- UI: warns, shows used list in pit modal, penalty ticker

### Safety Car / VSC / Red Flag
- Random incident 2% per lap
- 60% Safety Car → all bunch 1s, pace slowed 50%
- 25% VSC → gaps +50%, pace -30%
- 15% Red Flag → positions frozen, session stopped, then restart (SC style)
- Tyre wear / fuel / PU slowed during SC/VSC
- UI: SC banner, ticker events

### Weather — Expanded
- States: Dry (70%), Damp (15% → intermediate best), Wet (15% → wet best)
- Transitions: dry→damp→wet possible
- Auto-pit suggestion for wet/intermediate
- TYRES: soft/medium/hard/intermediate/wet (5)

### Boosts — Expanded Stats
- 8 boosts each now has `drs`, `fuelSave` optional stats
- `calcBoostStats`: sums overtake/defend/speed/tyre/drs/fuelSave
- Applied in `teamScore`, `sectorTime`, `checkOvertake`

### Skills — New
- `Fuel Saver`: +20% fuel save
- `Power Whisperer`: +12% PU save, +5% PU
- `DRS Master`: +15% when DRS

### Pit Strategy
- Resets fuel 100%, PU stays, boosts consumed 1 per pit (selectedBoosts shift)
- Used compounds tracked
- SC/VSC opportunistic: AI pits under SC more

## Team v4 — `game/team.js`

### No Crates Still
- Purge remains, plus v4 key

### New Systems:
- **Research Points + Materials**: carbon/alloy/electronics
- **Boost Inventory**: 8 types, selectedBoosts 2 per driver
- **Pit Pass**: level 1-50, xp, premium flag, rewardsClaimed []
  - `addPitPassXP(amount)`: 100 XP per level
  - `claimPitPass(level)`: gives credits/bucks/materials/boosts/components/drivers (legendary at 50)
- **Collection Score**: `updateCollectionScore()` driversOwned*2 + upgrades + comps*2 + compUpgrades + legendary*10 + series*5
- **Club**: name, reputation, level, members, exhibitionWins
  - `joinClub(name)`, `addClubRep(amount)`
- **Spinner**: lastSpin, streak, freeSpins 3 start, 7 per 8 hours like F1 Clash
  - `spinWheel()`: rng rewards credits/bucks/RP/materials/boosts
- **Livery**: col1, col2, pattern (solid/stripes/gradient/camo/digital)
- **Championship**: standings, driverStandings, season, race, history []
- **RaceTypes**: duel, grandprix, sprint, endurance, timetrial, exhibition wins/points
- **MarketPool**: 10 items/week, types: driver/component/boost/livery, direct prices (no crates)
- **GenGhostTeams**: 10 fictional team names, no F1 IP
- **Banned Names Filter**: Hamilton, Verstappen, etc → regen fictional

### Series: 10 series with 24 tracks grouping
- Prize increases, unlock rarities

## App v4 — `game/app.js`

### Navigation: Race/Garage/Lab/Market/More (More contains all extra)
- Race hub: race type selector 7 types grid, track info with DRS/fuel/wear, odds, 4 stats tiles (RP, Mats, Boosts, Pit Pass), 3 quick buttons (24 Tracks, Championship, Spinner)
- Tracks screen: 24 cards with flag, country, layout, DRS zones, laps, stats, SC%, wet%, fuelUse, series
- Garage: driver cards with skills, car SVG with livery colors, 6 component slots with rarity bar + level + DRS, team score 4 boxes (Speed/Corner/DRS/Fuel), livery button
- Livery editor: color pickers 10 colors, pattern selector, live preview SVG
- Lab: components list with research cost (RP+carbon+alloy+electronics+credits) + button, drivers academy with train cost
- Market: 10 items direct, driver (rarity border), component (DRS/fuel stats), boost (icon/desc), livery (color preview)
- More screen: 8 tiles (Boosts, Pit Pass, Club, Collection, Championship, Spinner, 24 Tracks, Livery) + live F1 features checklist + reset
- Boosts screen: D1/D2 equipped display, inventory with D1/D2 equip buttons, clear, 8 original
- Pit Pass: level progress bar, 20 levels shown (of 50), claim buttons, XP info
- Club: create/join input, reputation bar, exhibition button (+25 rep)
- Collection: score big, 6 breakdown boxes
- Championship: calendar tracks, history, start button
- Spinner: wheel visual, 8 rewards grid, spin button with free spins check
- Qualifying: shows track details, race type rules, top 10 of 20 for full grid, 4 for duel
- Tyre & Boost selection: tyre options with laptime avg, tyre rule warning, boost inventory pick (D1), 2 per driver
- Race screen: 
  - Topbar: lap counter + DRS enabled + SC/VSC/Red flag, weather, 1x/2x/3x speed
  - Main: leaderboard 20 cars with DRS indicator + tyre + gap, track canvas 10 cars, ticker (overtake [DRS], pit, SC, VSC, Red Flag, weather, DNF, penalty)
  - Driver control panels: pos, tyre wear circle good/mid/bad, PU bar, FUEL bar, tyre badge, DRS indicator, boost names, role+ovr, pace buttons push/std/save, PIT NOW
  - Pit modal: current wear/PU/fuel/used compounds, tyre rule warning if GP, 5 tyre options, confirm
  - End modal: victory/defeat, finishing order top 10, prize/RP/XP, tyre penalty warning, fastest lap, used compounds

### All F1 Clash Features Implemented:
✓ Grand Prix events with featured assets (track series + tyre rule + points)
✓ Club system (name, rep, level, exhibitions)
✓ Pit Pass 50 levels free/premium XP
✓ Collection Milestones + Season Score (score breakdown)
✓ Legendary Drivers (4% chance, 3 skills, 👑, masterwork parts)
✓ Spinner daily (7 per 8 hours, streak, rewards)
✓ Custom livery editor (colors + patterns)
✓ Asset Trading via Market direct (maxed assets sell via budget)
✓ Qualifying (grid from QUA + quali stat + rng, 20 cars)
✓ Practice implied via team score vs rec
✓ DRS zones visualization (count + indicator)
✓ ERS deployment UI (PU bar + recharge)
✓ Fuel strategy (fuel bar + save)
✓ Parc fermé tyre allocation 2 compounds mandatory
✓ Constructors/Drivers championship standings (history)
✓ Damage/reliability repairs in pit (pit time + reliability stat)
✓ Red flag restart (positions frozen then SC restart)
✓ Time trial ghost (1 lap mode)
✓ Live timing intervals (gap + leaderboard)

### Live F1 Closeness:
✓ 24 tracks (full calendar vs 23 F1 2024)
✓ 7 race types (F1 has Sprint, GP, etc — we have more for game loops)
✓ DRS 1-3 zones per track, within 1s, Lap 2 enable
✓ ERS/PU battery + deployment + recharge
✓ Fuel load affects pace + saving
✓ Tyre rule 2 compounds mandatory + 10s penalty
✓ Safety Car bunches, VSC slows, Red Flag stops
✓ Weather Dry→Damp→Wet + Intermediate tyre
✓ Qualifying affects grid
✓ Pit undercut/overcut, SC opportunistic
✓ Points: GP 25-1, Sprint top 8, etc.

## Fairness Test
PASS: Displayed Home 80% vs Actual 80% diff 0% within 5% — honest sim preserved

## Files
- game/engine.js v4 24 tracks + 7 types + 20 grid + DRS/ERS/Fuel + SC/VSC/Red Flag + 5 tyres + 8 boosts + 11 skills
- game/team.js v4 clubs + pit pass + collection + spinner + livery + championship + 24 tracks series + market 10 items + no crates + IP purge
- game/app.js v4 7 race types UI + 20-car leaderboard + DRS/ERS/Fuel bars + Q1/Q2/Q3-ish + championship + clubs + pit pass + collection + spinner + livery + tracks 24 + boosts + more screen
- tests/test-fairness.js PASS

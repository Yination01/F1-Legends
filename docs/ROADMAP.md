# F1 Legends — Roadmap

## Shipped ✅
- **Design Doc v0.1** — GDD, Architecture, Roadmap (this)
- **Football Legend Analysis** — playstyle DNA extracted
- **F1 Clash Mechanics Research** — track stats, components, crates, duels

## MVP Phase 1 — Engine Skeleton (Week 1) — NEXT
- [ ] `game/engine.js` — seeded RNG, driver gen, component gen, track defs, qualify(), createRace(), simulateRace(), winProbs()
- [ ] `tests/test-fairness.js` — honesty: displayed win % == engine win % (500 runs, ±3% tolerance)
- [ ] `game/tracks/` — 6 fictional tracks with SVG paths (Monza-like, Monaco-like, etc)
- [ ] Basic 2D track rendering in Canvas (dots)

## MVP Phase 2 — Team Management (Week 2)
- [ ] `game/team.js` — T save object, teamGen, teamScore(), autoLineup, market weekly refresh, crate system, upgrade logic
- [ ] Economy: Credits + Bucks + Legacy Points, gate receipts model (losses never deduct)
- [ ] `game/app.js` — Screens: Home, Squad, Tactics, Market, Crates
- [ ] `game/style.css` — F1 palette, panels, nav
- [ ] `game/index.html` — shell
- [ ] Local save/load, backup codes

## MVP Phase 3 — Race Day (Week 3)
- [ ] `game/app.js` — Race Preview (grid, odds, track stats, tyre choice)
- [ ] `game/app.js` — Race Live: Ticker mode + 2D Live mode (track map + dots)
- [ ] Pit strategy decisions (like Football Legend decision points)
- [ ] Safety Car, Weather, Mechanical Failure events
- [ ] Race Finish + rewards + crate

## MVP Phase 4 — Season & Ghost PvP (Week 4)
- [ ] Season: 18 race calendar, constructors table, promotion Series 1-10
- [ ] Ghost Duels: local ghost pool (no cloud yet), AI styles
- [ ] Friend Duel: export/import team code
- [ ] `game/cloud.js` — Supabase integration (auth, cloud save, ghost pool)
- [ ] Global rankings (like Football Legend)

## MVP Phase 5 — Capacitor & Launch Prep (Week 5)
- [ ] `app/` — Capacitor config, copy-game.js, android wrapper
- [ ] Build debug APK
- [ ] Device test
- [ ] Store assets: icon, splash, listing copy, privacy policy
- [ ] Play Console internal track

## Post-MVP — Polish
- [ ] Driver Career mode (Become a Legend driver)
- [ ] Clubs (like F1 Clash Clubs + Exhibitions)
- [ ] Boosts system
- [ ] Legendary drivers + Special Editions
- [ ] 3D provision: Three.js track view (optional, behind flag)
- [ ] Electron desktop wrapper (PC provision)
- [ ] Monetization: rewarded ads, Pit Pass

## Deferred Until Revenue (like Football Legend)
- [ ] Real-time PvP (needs server beyond Supabase free tier) — Ghost first
- [ ] Full 3D realistic cars/tracks (needs artists)
- [ ] Official F1 license (needs $$$)
- [ ] Real-time multiplayer matchmaking infra

## Build Commands (mirrors Football Legend)

```json
{
  "scripts": {
    "start": "python3 game/serve.py",
    "test": "node tests/test-fairness.js",
    "test:all": "node tests/suite.js",
    "copy-game": "npm --prefix app run copy-game",
    "sync": "npm --prefix app run sync",
    "apk": "./scripts/build-apk.sh"
  }
}
```

## Success Metrics (like Football Legend honesty)

- [ ] Fairness test: 0 failures
- [ ] Win % displayed vs actual: <3% diff over 500 runs
- [ ] APK builds and installs
- [ ] Ghost duel works offline (local pool) + online (Supabase)
- [ ] 5-10 friend playtesters complete Series 1

## Owner Actions (like Football Legend docs/V14-RELEASE-CHECKLIST.md)

- [ ] Supabase project setup (free tier)
- [ ] Deploy `verify-team` edge function
- [ ] Set OWNER_KEY_HASH secret
- [ ] Build final APK on JDK 17 machine
- [ ] Back up keystore 2+ places
- [ ] Play Console $25 (from revenue)

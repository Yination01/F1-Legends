# 🏁 F1 Legends — F1 Team Principal Game

**Built on $0 budget.** Mobile-first, web-tech (HTML/JS/Canvas) wrapped as native Android/iOS with Capacitor — duplicated play style from **Football Legend** and reimagined as **F1 Clash**.

> Football Legend → F1 Legends translation:
> - **Become a Legend (player career)** → **Become a Legend: Driver Career**
> - **Master League (squad builder)** → **Team Principal Mode (2 drivers + 6 car components)**
> - **Honest simulation engine (displayed odds = true odds)** → **Honest race engine (displayed win % = true Monte Carlo)**
> - **Ghost PvP async** → **Ghost Duels async (zero-budget, serverless)**
> - **Capacitor + Supabase** → Same stack

## Repo Structure

```
game/       The game itself (engine, team management, UI, cloud, tests). Runs in any browser.
app/        Capacitor Android/iOS wrapper (builds APK/AAB/IPA)
docs/       GDD, Architecture, Roadmap, APK guide
.github/    GitHub Actions workflow for APK build
```

## Quick Start (Web)

```bash
cd game
python3 serve.py
# open http://localhost:8000
```

## Quick Start (Android APK)

### Cloud Build (Recommended)
Push to main -> GitHub Actions builds APK automatically.

1. Go to https://github.com/Yination01/F1-Legends/actions
2. Run "Build APK" workflow
3. Download artifact `F1-Legends-debug` -> app-debug.apk
4. `adb install app-debug.apk`

See `docs/APK_GUIDE.md` for local build.

### Current rebuild

The game is being simplified into a clean, mobile-first team-principal loop:

`Home → Opponent → Optional tyres → Race → Results → Upgrade → Next race`

See [docs/SIMPLE_RACE_REBUILD.md](docs/SIMPLE_RACE_REBUILD.md) for the nine objectives, design rules, validation checklist, and honest implementation status. Do not use the legacy feature list below as a completion claim; the rebuild document is the source of truth.

## Existing systems
- Multiple local save slots
- Boosts, research, components, and driver training
- Fictional tracks, drivers, and teams
- Deterministic progression without crate loot boxes
- Capacitor app wrapper: `com.f1clashzero.game`

Some existing systems remain in the data model while the player-facing flow is consolidated.

## Zero Budget Stack
- HTML/JS/Canvas (no Unity/Unreal)
- Capacitor for native wrapper
- Supabase free tier for cloud saves (optional)
- GitHub Actions free for APK builds

## License
Original fictional content — no F1 IP.

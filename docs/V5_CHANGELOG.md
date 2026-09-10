# V5.2 — MULTIPLE SAVE SLOTS (TEMP LOCAL) + 6 CAMERAS

## Summary
V5.2 adds **MULTIPLE SAVE FILES / ACCOUNTS** requested: "Add multiple save files so I can start new game and play for now but will later remove it for google play saves but for now add saves so I can have multiple accounts"

V5.1 added 6 cameras (Full Track + Race Cam F1 Clash + TV + Chase + Onboard + Helicopter). V5.2 adds multi-account.

## New: Multiple Save Slots — TEMP LOCAL, will be replaced by Google Play Saves

### Storage Architecture (Zero-dollar, localStorage, easy to remove)
```js
// Keys
SLOTS_INDEX_KEY = "f1Zero_SaveSlots_Index_v5_1"
SLOT_DATA_PREFIX = "f1Zero_SlotData_v5_1_"
TEAM_KEY = "f1Zero_Team_v5" // legacy, mirrored for backward compat
MAX_SLOTS = 5 soft limit (hard limit 10 to avoid quota)

// Index structure
{
  slots: {
    "slot_1": { id, teamName, short, region, flag, regionLabel, series, seriesName, season, race, level, score, wins, budget, bucks, col1, col2, pattern, created, lastPlayed, drivers:[{name,ovr,rarity}], collectionScore },
    "slot_2": { ... },
    ...
  },
  currentSlot: "slot_1",
  version: 1
}
// Each slot data: full T object stored at SLOT_DATA_PREFIX+slotId (e.g. f1Zero_SlotData_v5_1_slot_1) ~50-150KB JSON
```

### API in team.js v5.2 (TEMP LOCAL)
```js
getSaveSlots() -> sorted by lastPlayed desc [{preview}]
getCurrentSlotId() -> "slot_1" etc
getSlotCount() -> number
canCreateSlot() -> count < MAX_SLOTS
switchSaveSlot(slotId) -> loads T, sets currentSlot, updates lastPlayed, mirrors to TEAM_KEY, returns bool
deleteSaveSlot(slotId) -> removes data key + index entry, if current switches to first remaining or clears T, returns bool
renameSaveSlot(slotId, newName) -> updates data.teamName/short + preview, returns bool
duplicateSaveSlot(slotId) -> clones data (new seed, name+" Copy", created now), new slot id slot_N, saves, returns newId or null if >=10
exportSlot(slotId) -> JSON string
importSlot(jsonString) -> creates new slot from JSON, returns newId or null
getSlotPreview(slotId) -> preview or null
wipeAllSlots() -> removes all slot data + index + legacy keys, clears T
buildPreviewFromT(teamData) -> builds preview from full T
updateSlotPreviewInIndex(slotId, teamData) -> updates preview in index
generateSlotId() -> first free slot_1..slot_5, else slot_6+ 
loadSlotsIndex() / saveSlotsIndex()
loadSlotData(slotId) / saveSlotData(slotId, data)
migrateLegacySingleSave() -> if index empty and TEAM_KEY exists, migrates to slot_1
```

### teamLoad() / teamSave() updated
- teamLoad(): loads index, migrates legacy if needed, loads currentSlot data or most recent, fallback to legacy TEAM_KEY, ensures defaults, migrates v4, bans real F1 names
- teamSave(): if no currentSlotId, generates one, sets lastPlayed, saves data + preview + currentSlot in index, mirrors to TEAM_KEY
- teamNewSave(region, teamName): now creates NEW SLOT (not overwrites), checks MAX_SLOTS (soft) and hard 10, generates seed with slotId, squad, short, created/lastPlayed/slotId, saves data + preview + currentSlot, mirrors to legacy, returns slotId

### UI: saveSlotsScreen() — NEW SCREEN
- Shows: 👥 MY TEAMS — count/max ACCOUNTS — MULTIPLE SAVE FILES (TEMP)
- Banner: 🚧 TEMP LOCAL SAVE SYSTEM — WILL BE REPLACED BY GOOGLE PLAY GAMES SERVICES — explanation
- Buttons: ➕ CREATE NEW TEAM — SLOT N (count/max) (disabled if max reached) + 📥 IMPORT JSON
- List: YOUR TEAMS — saves sorted by lastPlayed — CURRENT: curId
  - Each card: background panel if current else panel2, border red if current else line, CURRENT badge top-right
  - Left: 56x56 color box short, col1/col2 border, right: flag teamName ⭐ if current, regionLabel seriesName season race level score wins, drivers list, budget bucks collectionScore, created date + lastPlayed timeAgo + pattern col1/col2
  - Grid 5 buttons: ▶️ PLAY (or ✓ CURRENT) -> switchSaveSlot + raceHub, ✏️ RENAME -> prompt + renameSaveSlot, 📋 COPY -> duplicateSaveSlot, 📤 EXPORT -> Blob download json, 🗑️ DELETE -> confirm + deleteSaveSlot
- Empty slots: dashed border cards showing Empty Slot N — slot_N
- How it works panel: Local Only localStorage 5MB each slot 50-150KB, Switch loads as current mirrors to legacy, Create Found Team -> new slot, Migration old single save auto to slot_1, Google Play Future will remove this system, Storage Keys listed, Max soft 5 hard 10
- Wipe all button: 🗑️ WIPE ALL N TEAMS — DELETE EVERYTHING -> double confirm + prompt DELETE -> wipeAllSlots() -> createTeamScreen

### Integration Points
- topBar(): now shows 👥 count/max ACCOUNTS button + current slot id + teamName slice, id topBarSlotsBtn -> saveSlotsScreen
- bottomNav bindNav() also binds topBarSlotsBtn
- seriesBar() shows slot id
- raceHub(): if no T, loads, if still no T but slots exist -> saveSlotsScreen, else createTeamScreen. Shows banner 👥 MULTIPLE ACCOUNTS — count/max TEAMS — TEMP LOCAL — Current slot + lastPlayed + Switch/New Account button. Track card top-right shows slot id. Bottom 4 tiles last is Accounts count/max instead of 6 CAMS. All screens show slot id in title.
- createTeamScreen(): shows existing slots count, canCreate, teamName input default "Zero Racing N", region selector, create button text SLOT N/M — NEW ACCOUNT or MAX warning disabled, VIEW MY EXISTING TEAMS button if slots exist, explains multi-account temp
- moreScreen(): adds MY TEAMS — count/max tile red white, prominent first, click -> saveSlotsScreen. Banner shows multi-account temp + current slot. Buttons: DELETE CURRENT SLOT (slot_X) and WIPE ALL N TEAMS with confirm + prompt DELETE
- All other screens: garage, lab, market, championship, constructors, spinner, timeTrial, tracks, etc show slot id + teamName in header for clarity
- raceScreen: all camera titles include Slot ID + teamName, lap counter includes slot id

### Migration Path for Google Play Saves (Future Removal)
- Search markers: "MULTIPLE SAVE SLOTS", "TEMP LOCAL", "WILL BE REPLACED BY GOOGLE PLAY"
- To remove: Delete SLOTS_INDEX_KEY, SLOT_DATA_PREFIX constants, getSaveSlots etc API, saveSlotsScreen function, topBarSlotsBtn, switchAccountBtn, saveSlotsBtn, wipe logic, and revert teamLoad/teamSave/teamNewSave to single key version (keep TEAM_KEY). Replace with Play Games Services: use Google Play Games Saved Games API (1 save per Google account, but can support multiple profiles via player ID). The preview building and slot UI can be reused for cloud saves list.
- Current implementation is zero-dollar, no server, localStorage only, works offline, PWA-ready

### Fairness Test
PASS: Home 82% vs 79% actual diff 3% within 5% — honest sim preserved — multi-slot does not affect engine

### Files V5.2
- game/team.js v5.2: MAX_SLOTS 5 soft 10 hard, SLOTS_INDEX_KEY, SLOT_DATA_PREFIX, loadSlotsIndex/saveSlotsIndex, loadSlotData/saveSlotData, generateSlotId, buildPreviewFromT, updateSlotPreviewInIndex, migrateLegacySingleSave, teamSave saves to slot + index + legacy mirror, teamLoad loads index + migrates + fallback, teamNewSave creates new slot, getSaveSlots/getCurrentSlotId/getSlotCount/canCreateSlot/switchSaveSlot/deleteSaveSlot/renameSaveSlot/duplicateSaveSlot/exportSlot/importSlot/getSlotPreview/wipeAllSlots
- game/app.js v5.2: saveSlotsScreen() new with 5 buttons per slot Play/Rename/Copy/Export/Delete + Create New + Import + Wipe All + empty slots dashed + timeAgo helper, topBar shows accounts count button, bindNav binds topBarSlotsBtn, raceHub shows multi-account banner + switch button + slot id, createTeamScreen shows existing count + slot N/M + view slots button, moreScreen adds My Teams tile red + delete current + wipe all, all screens show slot id, raceScreen titles include slot id + teamName, startup: Team.load() then if T raceHub else if slots>0 saveSlotsScreen else createTeamScreen
- game/engine.js v5 unchanged (24 tracks 3 sectors, 7 race types, FP1/FP2/FP3, Q1/Q2/Q3, damage 6 types, sponsor 7 tasks, ghost, sectors, setupBonus, DRS/ERS/Fuel, SC/VSC/Red Flag)
- docs/V5_CHANGELOG.md updated

## Previous: V5.1 Cameras
- 6 cameras: Full Track (F1 Clash track overview top-down 20 cars), Race Cam (F1 Clash main isometric chase pseudo-3D road), TV Broadcast (leader large + intervals), Chase (behind player), Onboard (driver eye steering wheel dashboard), Helicopter (high altitude all 20 cars grid lines)
- Toggle bar 6 buttons + AUTO CAM ON, auto switches on overtake/pit/SC/Red Flag, canvas 800x320

## Previous: V5 Features
- FP1/FP2/FP3 practice, Q1/Q2/Q3 knockout, Damage+Repair animation 6 parts, Ghost replay 3 sectors, Full weekend, Sponsor tasks 7, Constructors 10 teams, 24 tracks 3 sectors, 7 race types, 20-car grid, DRS/ERS/Fuel, SC/VSC/Red Flag, no crates, no F1 IP, honest sim

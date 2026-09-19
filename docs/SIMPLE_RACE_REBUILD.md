# F1 Legends — Simple Race Rebuild

## Purpose

F1 Legends is being rebuilt around a simple, mobile-first team-principal loop inspired by the accessibility of arcade racing managers. The game uses original branding, original fictional teams and tracks, and original artwork. It is not intended to reproduce protected branding, assets, or proprietary UI exactly.

## Target player loop

```text
Home → Opponent → Optional tyres → Race → Results → Upgrade → Next race
```

A new player should be able to understand the next action without opening a secondary menu.

## Nine rebuild objectives

### 1. Clear home screen

The home screen should show only the information needed to make the next decision:

- Team name and rating
- Current series and progress
- Credits
- Next track and opponent
- Primary Race button
- Garage and Upgrade buttons

Save-slot administration, internal IDs, version labels, and development notes should not be part of the default home flow.

### 2. Garage progression

The garage should present:

- Driver 1 and Driver 2 cards
- Driver ratings and roles
- Car performance rating
- Upgradeable components
- Upgrade cost and result
- One clear upgrade action

Research points, materials, collection scoring, and detailed component metadata may remain in the data model, but should be secondary to the basic upgrade decision.

### 3. Opponent matchup

Before a race, the player should see:

- Their team and two drivers
- The rival team and two drivers
- Simple performance comparison
- Track name and race length
- Optional tyre choice
- One large Start Race button

### 4. Simple race setup

The default setup should be:

1. Show the matchup
2. Offer optional tyre selection
3. Start the race

Practice, qualifying, boost selection, and advanced setup should not block a first-time player. If retained, they belong behind an explicit Advanced option.

### 5. Reliable full-track presentation

There is one supported race view: a readable full-track view.

Requirements:

- The whole circuit remains visible
- Cars stay on the circuit path
- Player cars are highlighted
- Rival cars use a contrasting style
- Cars move smoothly between updates
- The view scales to the available viewport
- No camera selector or camera-specific labels
- No undefined ticker events

### 6. Simple race controls

The default race HUD contains:

- Lap
- Position
- Gap
- Tyre condition
- Push
- Standard
- Conserve
- Pit
- Short, readable race notifications

Fuel, ERS/PU, detailed damage, sector telemetry, and technical debug values should be hidden from the default HUD. The simulation may retain simplified internal calculations while the player-facing controls remain small in number.

### 7. Results and rewards loop

Every completed race should end on a clear result screen containing:

- Win/loss or finishing position
- Reward credits
- Rating/progression change
- Upgrade progress
- Race Again button
- Upgrade button
- Home button

The result screen should not require the player to navigate through technical reports before taking the next action.

### 8. Consistent visual language

The UI direction is:

- Full-width responsive layout
- Dark navy background
- Red primary action
- Large mobile-friendly cards
- Clear hierarchy
- Fewer borders and smaller labels
- No internal version strings
- No internal slot IDs in normal play
- No camera references
- No development-only feature claims

### 9. Simplified progression

The intended progression is:

```text
Race → Earn credits → Upgrade driver/car → Enter next series → Race again
```

Clubs, spinners, pit passes, ghost replay, collections, constructors, and other secondary systems must not compete with this loop. They can be removed, hidden, or deferred until the core loop is stable.

## Current implementation status

| Objective | Status | Notes |
|---|---|---|
| Clear home screen | Partial | Next Race, matchup, Race, Garage, and Upgrade actions exist. Legacy cards still need removal from the primary flow. |
| Garage progression | Partial | Garage and Lab systems exist, but the presentation still needs consolidation. |
| Opponent matchup | Partial | Home matchup card exists; a dedicated pre-race matchup screen is still needed. |
| Simple race setup | Not complete | Existing practice, qualifying, and race-type paths still expose complexity. |
| Full-track presentation | Partial | Full-track mode is the supported view, but circuit rendering and animation need polish. |
| Simple race controls | Partial | Pace and pit controls exist; technical telemetry still needs to be removed from the default HUD. |
| Results and rewards | Existing / needs redesign | Rewards are processed, but the result screen needs the simplified action loop. |
| Consistent visual language | Partial | Responsive styling has been added, but legacy screens still use older layouts. |
| Simplified progression | Not complete | The new home card is present, but the end-to-end loop still needs consolidation. |

This table is the source of truth for implementation claims. A feature should only be marked complete after it has been tested through the player flow in the PWA.

## Validation requirements

Before declaring the rebuild complete:

- `node --check game/app.js`
- `npm test`
- `git diff --check`
- Test a new save from tutorial through first race
- Test an existing save through Race Again and Upgrade
- Confirm the UI fills the preview viewport
- Confirm no camera toolbar or camera label appears
- Confirm no `undefined` race notification appears
- Confirm the PWA loads the current source without stale service-worker content

## Implementation rule

Do not claim the nine objectives are complete while any objective is marked Partial or Not complete in this document. Update this document whenever a player-facing objective changes status.

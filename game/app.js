"use strict";
// F1 ZERO v5.2 — MULTIPLE SAVE SLOTS (TEMP LOCAL, WILL BE REPLACED BY GOOGLE PLAY SAVES) + SIMPLE RACE
// Features: Full Track + Race Cam (F1 Clash) + TV + Chase + Onboard + Helicopter + Multiple Accounts

function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function toast(msg){
  let t=$("#toast");
  if(!t){ t=document.createElement("div"); t.id="toast"; t.style.cssText="position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#1c1f2a;border:1px solid #2e3345;color:#fff;padding:10px 16px;border-radius:10px;z-index:9999;font-weight:700;max-width:90%;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.6)"; document.body.appendChild(t); }
  t.textContent=msg; t.style.display="block"; setTimeout(()=>t.style.display="none",2500);
}
function render(fn){
  const app=$("#app");
  try{
    app.innerHTML=typeof fn==="function"?fn():fn;
    window.scrollTo(0,0);
  }catch(err){
    console.error("F1 Legends screen failed to render", err);
    app.innerHTML=`<div style="min-height:100vh;background:#0c0e12;color:#fff;padding:24px;font-family:Inter,system-ui,sans-serif"><h2 style="color:#ff5252">F1 Legends could not load this screen</h2><p style="color:#aeb4c5">Your save is still stored. Reload the app to try again.</p><button id="reloadAppBtn" style="padding:12px 16px;background:#e10600;border:0;border-radius:8px;color:#fff;font-weight:800">RELOAD APP</button></div>`;
    $("#reloadAppBtn")?.addEventListener("click",()=>location.reload());
  }
}
function timeAgo(ts){
  const diff = Date.now() - ts;
  const s = Math.floor(diff/1000);
  if(s<60) return `${s}s ago`;
  const m = Math.floor(s/60);
  if(m<60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if(h<24) return `${h}h ago`;
  const d = Math.floor(h/24);
  if(d<7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}
function topBar(){
  const T=Team.T;
  if(!T){
    const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
    const count = slots.length;
    return `<div class="topbar-clash"><div class="topbar-left"><div class="logo-clash"><span>F1</span><b>ZERO</b> ULTIMATE+ ${count?`· ${count} TEAMS`:``}</div></div><div class="topbar-right"><button class="btn-clash btn-dark" id="topBarSlotsBtn" style="width:auto;padding:6px 10px;font-size:10px">👥 ${count}/${Team.MAX_SLOTS||5} ACCOUNTS</button></div></div>`;
  }
  const curId = Team.getCurrentSlotId ? Team.getCurrentSlotId() : null;
  const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
  return `<div class="topbar-clash"><div class="topbar-left"><div class="logo-clash"><span>F1</span><b>ZERO</b></div><div class="level-badge">S${T.series} Lv${T.pitPass.level}</div><div class="team-score-badge">${Team.score()}</div><div class="level-badge" style="background:var(--panel2);border:1px solid var(--line)">${curId||"slot"} · ${T.teamName.slice(0,12)}</div></div><div class="topbar-right"><div class="currency"><span class="ico ico-coin">C</span>${T.budget.toFixed(1)}M</div><div class="currency"><span class="ico ico-buck">B</span>${T.bucks}</div><button class="btn-clash btn-dark" id="topBarSlotsBtn" style="width:auto;padding:4px 8px;font-size:9px;margin-left:6px">👥 ${slots.length}/${Team.MAX_SLOTS||5}</button></div></div>`;
}
function bottomNav(active){
  const tabs=[{id:"race",ico:"🏁",lbl:"Race"},{id:"garage",ico:"🔧",lbl:"Garage"},{id:"lab",ico:"🔬",lbl:"Lab"},{id:"market",ico:"🛒",lbl:"Market"},{id:"more",ico:"☰",lbl:"More"}];
  return `<div class="bottom-nav">${tabs.map(t=>`<div class="nav-tab ${active===t.id?"active":""}" data-nav="${t.id}"><span class="ico">${t.ico}</span><span class="lbl">${t.lbl}</span></div>`).join("")}</div>`;
}
function bindNav(){
  $$("[data-nav]").forEach(el=>el.onclick=()=>{
    const id=el.dataset.nav;
    if(id==="race") render(raceHub);
    if(id==="garage") render(garageScreen);
    if(id==="lab") render(labScreen);
    if(id==="market") render(marketScreen);
    if(id==="more") render(moreScreen);
  });
  const topSlots = $("#topBarSlotsBtn");
  if(topSlots) topSlots.onclick=()=>render(saveSlotsScreen);
}
function seriesBar(){
  const T=Team.T; if(!T) return "";
  const series=Team.SERIES[T.series-1]; const rec=series.str+5; const myScore=Team.score(); const good=myScore>=rec; const progress=Math.min(100,Math.max(5,(myScore/(rec+15))*100));
  return `<div class="series-bar"><div class="series-info"><h3>${series.name} — ${Team.T.championship.season} season</h3><p>${T.wins} wins · ${T.flags} flags · ${T.collection.score} collection · No crates · V5.2 SLOTS+6CAMS · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</p></div><div class="series-progress"><div><div class="progress-track"><div class="progress-fill" style="width:${progress}%"></div></div><div class="score-vs ${good?"good":"bad"}" style="font-size:10px;margin-top:2px">${myScore} vs ${rec} rec</div></div></div></div>`;
}

/* ===== SAVE SLOTS SCREEN — MULTIPLE ACCOUNTS (TEMP LOCAL) ===== */
function saveSlotsScreen(){
  const slots = Team.getSaveSlots();
  const curId = Team.getCurrentSlotId();
  const canCreate = Team.canCreateSlot();
  const count = slots.length;
  const max = Team.MAX_SLOTS||5;

  setTimeout(()=>{
    bindNav();
    $("#createNewSlotBtn")?.addEventListener("click", ()=>render(createTeamScreen));
    $("#backToRaceFromSlots")?.addEventListener("click", ()=>{
      if(Team.T) render(raceHub);
      else if(count>0) render(saveSlotsScreen);
      else render(createTeamScreen);
    });
    $$("[data-play-slot]").forEach(el=>el.onclick=()=>{
      const id = el.dataset.playSlot;
      // Auto-save current before switching to preserve progress
      if(Team.T) Team.save();
      if(Team.switchSaveSlot(id)){
        toast(`✅ Loaded ${Team.T.teamName} — ${id} — You can switch back anytime!`);
        render(raceHub);
      } else {
        toast("Failed to load slot");
      }
    });
    $$("[data-delete-slot]").forEach(el=>el.onclick=()=>{
      const id = el.dataset.deleteSlot;
      const preview = Team.getSlotPreview(id);
      if(!preview) return;
      if(!confirm(`Delete team "${preview.teamName}" (${id})? This cannot be undone!`)) return;
      Team.deleteSaveSlot(id);
      toast(`🗑️ Deleted ${preview.teamName}`);
      render(saveSlotsScreen);
    });
    $$("[data-duplicate-slot]").forEach(el=>el.onclick=()=>{
      const id = el.dataset.duplicateSlot;
      const newId = Team.duplicateSaveSlot(id);
      if(newId){
        toast(`📋 Duplicated to ${newId}`);
        render(saveSlotsScreen);
      } else {
        toast("Cannot duplicate — max slots reached (10 hard limit)");
      }
    });
    $$("[data-rename-slot]").forEach(el=>el.onclick=()=>{
      const id = el.dataset.renameSlot;
      const preview = Team.getSlotPreview(id);
      const newName = prompt(`Rename team "${preview.teamName}" (${id}):`, preview.teamName);
      if(!newName || !newName.trim()) return;
      if(Team.renameSaveSlot(id, newName.trim())){
        toast(`✏️ Renamed to ${newName.trim()}`);
        render(saveSlotsScreen);
      }
    });
    $$("[data-export-slot]").forEach(el=>el.onclick=()=>{
      const id = el.dataset.exportSlot;
      const json = Team.exportSlot(id);
      if(!json){ toast("Export failed"); return; }
      const blob = new Blob([json], {type:"application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href=url; a.download=`${id}_${Team.getSlotPreview(id)?.teamName||"team"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`📤 Exported ${id}`);
    });
    $("#importSlotBtn")?.addEventListener("click", ()=>{
      const input = document.createElement("input");
      input.type="file"; input.accept=".json,application/json";
      input.onchange=(e)=>{
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload=()=>{
          const newId = Team.importSlot(reader.result);
          if(newId){
            toast(`📥 Imported as ${newId}`);
            render(saveSlotsScreen);
          } else {
            toast("Import failed — invalid file or max slots reached");
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
    $("#wipeAllSlotsBtn")?.addEventListener("click", ()=>{
      if(!confirm(`⚠️ WIPE ALL ${count} TEAMS? This deletes ALL save files permanently! Cannot be undone!`)) return;
      if(!confirm(`Final confirmation: Delete ALL ${count} accounts? Type OK will be next.`)) return;
      const ok = prompt(`Type DELETE to confirm wiping all ${count} teams:`);
      if(ok!=="DELETE"){ toast("Cancelled"); return; }
      Team.wipeAllSlots();
      toast("🗑️ All slots wiped");
      render(createTeamScreen);
    });
  },0);

  const slotsHtml = slots.map(s=>{
    const isCurrent = s.id===curId;
    const drivers = s.drivers?.map(d=>`${d.name.split(" ").pop()} ${d.ovr}`).join(", ")||"No drivers";
    return `<div style="background:${isCurrent?"var(--panel)":"var(--panel2)"};border:2px solid ${isCurrent?"var(--red)":"var(--line)"};border-radius:12px;padding:12px;margin-bottom:12px;position:relative;overflow:hidden">
      ${isCurrent?`<div style="position:absolute;top:0;right:0;background:var(--red);color:white;padding:2px 8px;border-radius:0 12px 0 8px;font-size:9px;font-weight:900">CURRENT • ${s.id}</div>`:`<div style="position:absolute;top:0;right:0;background:var(--panel);border:1px solid var(--line);padding:2px 8px;border-radius:0 12px 0 8px;font-size:9px">${s.id}</div>`}
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:56px;height:56px;border-radius:12px;background:${s.col1};border:3px solid ${s.col2};display:flex;align-items:center;justify-content:center;font-weight:900;font-size:18px;color:${s.col2};flex-shrink:0">${s.short}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:900;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.flag} ${s.teamName} ${isCurrent?"⭐":""}</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">${s.regionLabel} · ${s.seriesName} · S${s.season} R${s.race+1}/18 · Lv${s.level} · Score ${s.score} · ${s.wins} wins</div>
          <div style="font-size:10px;color:var(--muted);margin-top:2px">${drivers} · 💰${s.budget.toFixed(1)}M 💎${s.bucks} · 📚${s.collectionScore}</div>
          <div style="font-size:9px;color:var(--muted);margin-top:2px">Created ${new Date(s.created).toLocaleDateString()} · Last ${timeAgo(s.lastPlayed)} · ${s.pattern} ${s.col1}/${s.col2}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:6px;margin-top:10px">
        <button class="btn-clash ${isCurrent?"btn-dark":"btn-red"}" data-play-slot="${s.id}" style="padding:8px 4px;font-size:10px">${isCurrent?"✓ CURRENT":"▶️ PLAY"}</button>
        <button class="btn-clash btn-dark" data-rename-slot="${s.id}" style="padding:8px 4px;font-size:10px">✏️ RENAME</button>
        <button class="btn-clash btn-dark" data-duplicate-slot="${s.id}" style="padding:8px 4px;font-size:10px">📋 COPY</button>
        <button class="btn-clash btn-dark" data-export-slot="${s.id}" style="padding:8px 4px;font-size:10px">📤 EXPORT</button>
        <button class="btn-clash btn-dark" data-delete-slot="${s.id}" style="padding:8px 4px;font-size:10px;background:rgba(225,6,0,.15);color:var(--red);border:1px solid var(--red)">🗑️ DELETE</button>
      </div>
    </div>`;
  }).join("");

  const emptySlots = Math.max(0, max - count);
  const emptyHtml = Array.from({length: emptySlots}, (_,i)=>{
    const slotNum = count + i + 1;
    return `<div style="background:var(--bg2);border:1px dashed var(--line);border-radius:12px;padding:16px;margin-bottom:12px;text-align:center;opacity:0.7">
      <div style="font-size:24px">➕</div><div style="font-weight:800;font-size:12px;margin-top:6px">Empty Slot ${slotNum} — slot_${slotNum}</div><div style="font-size:10px;color:var(--muted);margin-top:4px">Create a new team to fill this slot</div>
    </div>`;
  }).join("");

  return `${topBar()}<div class="main-content"><div style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <h3 style="font-weight:900">👥 MY TEAMS — ${count}/${max} ACCOUNTS — MULTIPLE SAVE FILES (TEMP)</h3>
      <button class="btn-clash btn-dark" id="backToRaceFromSlots" style="width:auto;padding:6px 12px;font-size:11px">← BACK</button>
    </div>

    <div style="background:rgba(255,204,0,.1);border:1px solid rgba(255,204,0,.3);border-radius:8px;padding:10px;font-size:11px">
      <b>🚧 TEMP LOCAL SAVE SYSTEM — WILL BE REPLACED BY GOOGLE PLAY GAMES SERVICES</b><br>
      For now: Create up to ${max} local accounts (hard limit 10) to test multiple careers. Each slot is independent: team, drivers, components, research, Pit Pass, club, ghosts, damage history, weekend progress.<br>
      <span style="font-size:10px;color:var(--muted)">- PLAY loads that team as current (mirrored to legacy key for old code)<br>
      - RENAME changes team name + short<br>
      - COPY duplicates team to new slot (seed regenerated, name + " Copy")<br>
      - EXPORT downloads JSON, IMPORT loads JSON as new slot<br>
      - DELETE removes slot + data file<br>
      - All slots stored as ${Team.SLOT_DATA_PREFIX||"f1Zero_SlotData_"}slot_N + index ${Team.SLOTS_INDEX_KEY||"f1Zero_SaveSlots_Index_"}. Later will be cloud saves via Play Games.</span>
    </div>

    <div style="display:flex;gap:8px">
      <button class="btn-clash ${canCreate?"btn-red":"btn-dark"}" id="createNewSlotBtn" style="flex:1" ${!canCreate?"disabled":""}>${canCreate?`➕ CREATE NEW TEAM — SLOT ${count+1} (${count}/${max})`:`⚠️ MAX ${max} TEAMS REACHED — DELETE ONE TO CREATE NEW`}</button>
      <button class="btn-clash btn-dark" id="importSlotBtn" style="flex:0 0 auto;width:auto;padding:10px 14px;font-size:11px">📥 IMPORT JSON</button>
    </div>

    <div>
      <div style="font-weight:800;font-size:12px;margin-bottom:8px">YOUR TEAMS — ${count} SAVES — SORTED BY LAST PLAYED — CURRENT: ${curId||"none"}</div>
      ${slots.length?slotsHtml:`<div style="text-align:center;padding:30px;background:var(--panel);border:1px solid var(--line);border-radius:12px"><div style="font-size:32px">🏁</div><div style="font-weight:900;margin-top:8px">No teams yet — Create your first team!</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Each slot is a separate account with its own career, like multiple accounts in F1 Clash.</div></div>`}
      ${emptyHtml}
    </div>

    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px">
      <div style="font-weight:800;font-size:12px">HOW MULTIPLE ACCOUNTS WORK — TEMP LOCAL</div>
      <div style="font-size:11px;color:var(--muted);margin-top:6px">
      • <b>Local Only:</b> Saves in browser localStorage (5MB limit) — each slot ~50-150KB JSON<br>
      • <b>Switch:</b> PLAY button loads slot as current, updates lastPlayed, mirrors to legacy key ${"f1Zero_Team_v5"} for old screens<br>
      • <b>Create:</b> Found Team screen → newSave creates new slot ID slot_1..slot_5 (or slot_6+ if beyond MAX but <10)<br>
      • <b>Migration:</b> Old single save auto-migrated to slot_1 on first load<br>
      • <b>Google Play Future:</b> This whole system will be removed and replaced by Play Games cloud saves (1 account = Google account, but multiple local profiles still possible via Play Games player IDs). Code marked TEMP for easy removal: search "MULTIPLE SAVE SLOTS" and "TEMP LOCAL".<br>
      • <b>Storage Keys:</b> Index = ${Team.SLOTS_INDEX_KEY||"f1Zero_SaveSlots_Index_v5_1"} holds previews, Data = ${Team.SLOT_DATA_PREFIX||"f1Zero_SlotData_v5_1_"}+slotId holds full T JSON<br>
      • <b>Max:</b> ${max} soft limit (UI warning), 10 hard limit (code prevents >10 to avoid localStorage quota)
      </div>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button class="btn-clash btn-dark" id="wipeAllSlotsBtn" style="flex:1;background:rgba(225,6,0,.15);color:var(--red);border:1px solid var(--red)">🗑️ WIPE ALL ${count} TEAMS — DELETE EVERYTHING</button>
      </div>
    </div>
  </div></div>${bottomNav("more")}`;
}

/* ===== RACE HUB ===== */
function raceHub(){
  const T=Team.T;
  if(!T){
    Team.load();
    if(!Team.T){
      const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
      if(slots.length>0){
        render(saveSlotsScreen);
        return "";
      } else {
        render(createTeamScreen);
        return "";
      }
    }
  }
  const track=Engine.TRACK_LIST[T.race % Engine.TRACK_LIST.length];
  const myTeam=Team.currentLoadout();
  const ghost=Team.genGhostTeams(1)[0];
  const probs=Engine.winProbs(myTeam, {name:ghost.name||"Rival Team", short:ghost.short||"RIV", col1:ghost.col1, drivers:ghost.drivers.slice(0,2), components:ghost.components, boosts:[[],[]]}, track.id, 200);
  const raceTypes=Object.values(Engine.RACE_TYPES);
  const weekend=T.weekend;
  const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
  setTimeout(()=>{
    bindNav();
    $$("[data-race-type]").forEach(el=>el.onclick=()=>{
      const rt=el.dataset.raceType; window._selectedRaceType=rt; $$("[data-race-type]").forEach(x=>x.classList.remove("selected")); el.classList.add("selected");
      const rtDef=Engine.RACE_TYPES[rt]; $("#raceTypeDesc").innerHTML=`<b>${rtDef.icon} ${rtDef.name}</b> — ${rtDef.desc}<br><span style="font-size:10px">Laps: ${rtDef.laps} · Points: ${rtDef.points.join(", ")||"None"} · Tyre Rule: ${rtDef.tyreRule?"Yes":"No"} · DRS: ${rtDef.drs?"Yes":"No"} · Fuel: ${rtDef.fuel?"Yes":"No"} · Weekend: ${rtDef.hasPractice?"FP1/FP2/FP3 + ":""}${rtDef.hasQuali?"Q1/Q2/Q3 + ":""}Race · Cameras: 6 · Accounts: ${slots.length}/${Team.MAX_SLOTS||5}</span>`;
    });
    $("#playRaceBtn").onclick=()=>{
      const rt=window._selectedRaceType||"grandprix"; const rtDef=Engine.RACE_TYPES[rt]; Team.startWeekend(track.id, rt);
      if(rt==="timetrial") render(()=>timeTrialScreen(track, myTeam));
      else if(rtDef.hasPractice) render(()=>weekendHubScreen(track, myTeam, ghost, probs, rt));
      else if(rtDef.hasQuali) render(()=>qualifyingKnockoutScreen(track, myTeam, ghost, rt));
      else render(()=>qualifyingScreen(track, myTeam, ghost, probs, rt));
    };
    $("#viewTracksBtn").onclick=()=>render(tracksScreen);
    $("#champBtn").onclick=()=>render(championshipScreen);
    $("#spinnerBtn").onclick=()=>render(spinnerScreen);
    $("#constructorsBtn").onclick=()=>render(constructorsScreen);
    $("#timeTrialBtn").onclick=()=>render(()=>timeTrialScreen(track, myTeam));
    $("#switchAccountBtn")?.addEventListener("click", ()=>render(saveSlotsScreen));
  },0);
  if(!window._selectedRaceType) window._selectedRaceType="grandprix";
  const rtDef=Engine.RACE_TYPES[window._selectedRaceType];
  const weekendBanner=weekend.stage!=="idle"?`<div style="background:rgba(0,168,255,.15);border:1px solid var(--blue);border-radius:8px;padding:8px;font-size:11px;margin-bottom:12px"><b>🔄 WEEKEND IN PROGRESS:</b> ${weekend.track?Engine.TRACKS[weekend.track]?.name:""} · ${weekend.raceType?Engine.RACE_TYPES[weekend.raceType]?.name:""} · Stage: ${weekend.stage} · Setup Bonus: +${weekend.setupBonus.setup} setup +${weekend.setupBonus.quali} quali +${weekend.setupBonus.race} race · Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div>`:"";
  return `${topBar()}${seriesBar()}<div class="main-content"><div style="padding:12px;display:flex;flex-direction:column;gap:12px">
  <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;display:flex;justify-content:space-between;align-items:center">
    <div><div style="font-weight:900;font-size:12px">👥 MULTIPLE ACCOUNTS — ${slots.length}/${Team.MAX_SLOTS||5} TEAMS — TEMP LOCAL</div><div style="font-size:10px;color:var(--muted)">Current: ${Team.getCurrentSlotId?Team.getCurrentSlotId():"slot_1"} · ${T.teamName} · Last ${timeAgo(T.lastPlayed||Date.now())} · Switch anytime, each slot independent career. Will be replaced by Google Play saves.</div></div>
    <button class="btn-clash btn-dark" id="switchAccountBtn" style="width:auto;padding:6px 12px;font-size:10px">👥 SWITCH / NEW ACCOUNT</button>
  </div>
  ${weekendBanner}
  <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden">
    <div style="height:140px;background: radial-gradient(600px 200px at 50% 30%, #1e2535, #0c0e12);display:flex;align-items:center;justify-content:center;position:relative">
      <div style="font-size:48px">🏎️</div><div style="position:absolute;bottom:8px;left:12px;background:rgba(0,0,0,.6);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:800">${track.flag} ${track.name}</div>
      <div style="position:absolute;bottom:8px;right:12px;background:var(--red);padding:4px 10px;border-radius:20px;font-size:10px;font-weight:900">LAP ${track.laps} · ${track.length}KM · ${track.turns} TURNS</div>
      <div style="position:absolute;top:8px;right:12px;background:var(--panel2);border:1px solid var(--line);padding:4px 8px;border-radius:6px;font-size:9px;font-weight:700">${track.layout.toUpperCase()} · ${track.drsZones} DRS · ${track.sectors.length} SECTORS · SIMPLE RACE · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div>
    </div>
    <div style="padding:12px">
      <div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:900;font-size:14px">${track.name}</div><div style="font-size:11px;color:var(--muted)">${track.desc}</div><div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap"><span class="badge" style="background:var(--panel2);border:1px solid var(--line)">${track.trackStats[0]}</span><span class="badge" style="background:var(--panel2);border:1px solid var(--line)">${track.trackStats[1]}</span><span class="badge" style="background:rgba(225,6,0,.15);color:var(--red);border:1px solid var(--red)">Wear x${track.wear}</span><span class="badge" style="background:rgba(0,168,255,.15);color:var(--blue)">Fuel x${track.fuelUse}</span><span class="badge" style="background:var(--panel2)">${track.sectors.map(s=>s.name).join(" / ")}</span><span class="badge" style="background:rgba(255,204,0,.15);color:var(--gold)">SIMPLE RACE</span><span class="badge" style="background:rgba(0,255,0,.15);color:var(--green)">SLOT ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</span></div></div>
      <div style="text-align:right"><div style="font-size:10px;color:var(--muted)">WIN ODDS</div><div style="font-weight:900;font-size:18px;color:${probs.home>=50?"var(--green)":"var(--red)"}">${probs.home}%</div><div style="font-size:9px;color:var(--muted)">Honest sim</div></div></div>
      <div style="margin-top:12px"><div style="font-weight:800;font-size:11px;margin-bottom:6px">RACE TYPE — 7 TYPES + FULL WEEKEND + SIMPLE RACE + MULTI-ACCOUNT</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${raceTypes.map(rt=>`<div class="car-component-slot ${window._selectedRaceType===rt.id?"selected":""}" data-race-type="${rt.id}" style="position:static;width:auto;height:auto;padding:8px"><div style="font-size:16px">${rt.icon}</div><div style="font-size:9px;font-weight:800;margin-top:2px">${rt.name}</div><div style="font-size:8px;color:var(--muted)">${rt.laps} laps</div><div style="font-size:7px;color:var(--muted)">${rt.hasPractice?"FP+":""}${rt.hasQuali?"Q+":""}R</div></div>`).join("")}</div><div id="raceTypeDesc" style="margin-top:8px;background:var(--bg2);border-radius:6px;padding:8px;font-size:11px"><b>${rtDef.icon} ${rtDef.name}</b> — ${rtDef.desc}<br><span style="font-size:10px">Laps: ${rtDef.laps} · Points: ${rtDef.points.join(", ")||"None"} · Tyre Rule: ${rtDef.tyreRule?"Yes":"No"} · DRS: ${rtDef.drs?"Yes":"No"} · Weekend: ${rtDef.hasPractice?"FP1/FP2/FP3 + ":""}${rtDef.hasQuali?"Q1/Q2/Q3 + ":""}Race · 6 Cameras · Accounts ${slots.length}/${Team.MAX_SLOTS||5}</span></div></div>
      <button class="btn-clash btn-red" id="playRaceBtn" style="margin-top:12px">🏁 ${rtDef.icon} START WEEKEND: ${rtDef.hasPractice?"FP1 → ":""}${rtDef.hasQuali?"Q1/Q2/Q3 → ":""}${rtDef.name.toUpperCase()} — ${track.name} — 6 CAMS — SLOT ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</button>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center"><div style="font-size:18px">🔬</div><div style="font-weight:800;font-size:11px;margin-top:4px">${T.research.points} RP</div><div style="font-size:9px;color:var(--muted)">Research</div></div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center"><div style="font-size:18px">🪨</div><div style="font-weight:800;font-size:11px;margin-top:4px">${T.materials.carbon}</div><div style="font-size:9px;color:var(--muted)">Materials</div></div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center"><div style="font-size:18px">🚀</div><div style="font-weight:800;font-size:11px;margin-top:4px">${Object.values(T.boostInventory).reduce((a,b)=>a+b,0)}</div><div style="font-size:9px;color:var(--muted)">Boosts</div></div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px;text-align:center"><div style="font-size:18px">👥</div><div style="font-weight:800;font-size:11px;margin-top:4px">${slots.length}/${Team.MAX_SLOTS||5}</div><div style="font-size:9px;color:var(--muted)">Accounts</div></div>
  </div>
  <div style="display:flex;gap:8px"><button class="btn-clash btn-dark" id="viewTracksBtn" style="flex:1">🗺️ 24 TRACKS</button><button class="btn-clash btn-dark" id="champBtn" style="flex:1">🏆 CHAMP</button><button class="btn-clash btn-dark" id="constructorsBtn" style="flex:1">🏗️ CONSTRUCTORS</button><button class="btn-clash btn-dark" id="timeTrialBtn" style="flex:1">⏱️ TT + GHOST</button></div>
  </div></div>${bottomNav("race")}`;
}

/* ===== WEEKEND HUB ===== */
function weekendHubScreen(track, myTeam, ghost, probs, raceTypeId){
  const T=Team.T; const rt=Engine.RACE_TYPES[raceTypeId]; const weekend=T.weekend; const practiceSessions=["fp1","fp2","fp3"];
  setTimeout(()=>{
    bindNav();
    $$("[data-practice]").forEach(el=>el.onclick=()=>{ const sess=el.dataset.practice; render(()=>practiceScreen(track, myTeam, sess, raceTypeId, ghost, probs)); });
    $("#goQualiBtn").onclick=()=>render(()=>qualifyingKnockoutScreen(track, myTeam, ghost, raceTypeId));
    $("#skipPracticeBtn").onclick=()=>render(()=>qualifyingKnockoutScreen(track, myTeam, ghost, raceTypeId));
    $("#backHub").onclick=()=>render(raceHub);
  },0);
  const practiceResults=practiceSessions.map(sId=>{
    const res=weekend.practiceResults[sId]; const def=Engine.PRACTICE_SESSIONS[sId];
    if(!res) return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${def.icon} ${def.name} — ${def.desc}</span><span style="font-size:10px;background:var(--red);color:white;padding:2px 6px;border-radius:4px">NOT DONE</span></div><div style="font-size:10px;color:var(--muted);margin-top:4px">Focus: ${def.focus.join(", ")} · Bonus: +${def.bonus.setup} setup ${def.bonus.quali?`+${def.bonus.quali} quali`:""} ${def.bonus.race?`+${def.bonus.race} race`:""}</div><button class="btn-clash btn-red" data-practice="${sId}" style="margin-top:8px;padding:8px;font-size:11px">▶️ RUN ${def.name}</button></div>`;
    return `<div style="background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid var(--green)"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${def.icon} ${def.name} — ${res.laps} laps · Best ${res.bestLap.toFixed(3)}s</span><span style="font-size:10px;background:var(--green);color:black;padding:2px 6px;border-radius:4px">DONE ✓</span></div><div style="font-size:10px;color:var(--muted);margin-top:4px">Setup +${res.bonus.setup} · Tyre deg: S ${res.tyreData.soft.deg.toFixed(2)} M ${res.tyreData.medium.deg.toFixed(2)} H ${res.tyreData.hard.deg.toFixed(2)}</div></div>`;
  }).join("");
  const totalSetup=weekend.setupBonus.setup+weekend.setupBonus.quali+weekend.setupBonus.race;
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="lap-counter">${track.flag} ${track.name} · ${rt.icon} ${rt.name} Weekend · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div class="weather-widget">Setup +${totalSetup} · 6 CAMS</div></div><div class="main-content" style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:900;font-size:14px">🏁 RACE WEEKEND — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${T.teamName}</div><div style="font-size:11px;color:var(--muted);margin-top:4px">FP1 → FP2 → FP3 → Q1/Q2/Q3 → Race. Setup bonus carries. simple race in race.</div><div style="margin-top:8px;display:flex;gap:6px"><span class="badge" style="background:var(--panel2)">FP1 ${weekend.practiceResults.fp1?"✓":"○"}</span><span class="badge" style="background:var(--panel2)">FP2 ${weekend.practiceResults.fp2?"✓":"○"}</span><span class="badge" style="background:var(--panel2)">FP3 ${weekend.practiceResults.fp3?"✓":"○"}</span><span class="badge" style="background:var(--panel2)">Q1/Q2/Q3 ${weekend.qualiResult?"✓":"○"}</span><span class="badge" style="background:var(--red);color:white">Race 6 CAMS</span></div></div>
    <h4 style="font-weight:800;font-size:12px">🔧 PRACTICE SESSIONS</h4>${practiceResults}
    <div style="display:flex;gap:8px"><button class="btn-clash btn-dark" id="backHub" style="flex:1">← BACK</button><button class="btn-clash btn-dark" id="skipPracticeBtn" style="flex:1">⏭️ SKIP TO QUALI</button><button class="btn-clash btn-red" id="goQualiBtn" style="flex:1">🎯 GO TO Q1/Q2/Q3 →</button></div>
  </div></div>`;
}
function practiceScreen(track, myTeam, sessionId, raceTypeId, ghost, probs){
  const session=Engine.PRACTICE_SESSIONS[sessionId]; const rng=Engine.mulberry32(Engine.hashSeed(Team.T.seed+":practice:"+track.id+":"+sessionId+":"+Date.now())); const result=Engine.simulatePractice(myTeam, track.id, sessionId, rng);
  setTimeout(()=>{ $("#confirmPracticeBtn").onclick=()=>{ Team.addPracticeResult(sessionId, result); Team.save(); toast(`✅ ${session.name} done! +${result.bonus.setup} setup`); render(()=>weekendHubScreen(track, myTeam, ghost, probs, raceTypeId)); }; $("#redoPracticeBtn").onclick=()=>render(()=>practiceScreen(track, myTeam, sessionId, raceTypeId, ghost, probs)); },0);
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="lap-counter">${session.icon} ${session.name} — ${track.name} · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div class="weather-widget">${result.laps} laps</div></div><div class="main-content" style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div class="track-map"><div style="text-align:center"><div style="font-size:32px">${session.icon}</div><div style="font-weight:900;margin-top:8px">${session.name.toUpperCase()} — ${session.desc}</div></div></div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:12px">📊 SESSION RESULTS — ${result.laps} laps</div>
      <div style="margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:8px">
        <div style="background:var(--panel2);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--muted)">BEST LAP</div><div style="font-weight:900;font-size:16px">${result.bestLap.toFixed(3)}s</div></div>
        <div style="background:var(--panel2);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--muted)">AVG PACE</div><div style="font-weight:900;font-size:16px">${result.avgLap.toFixed(3)}s</div></div>
        <div style="background:var(--panel2);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--muted)">SETUP</div><div style="font-weight:900;font-size:16px">${result.setupProgress}%</div></div>
        <div style="background:var(--panel2);border-radius:8px;padding:10px;text-align:center"><div style="font-size:10px;color:var(--muted)">BONUS</div><div style="font-weight:900;font-size:12px">+${result.bonus.setup} setup</div></div>
      </div></div>
    <div style="display:flex;gap:8px"><button class="btn-clash btn-dark" id="redoPracticeBtn" style="flex:1">🔄 REDO</button><button class="btn-clash btn-red" id="confirmPracticeBtn" style="flex:1">✅ CONFIRM → HUB</button></div>
  </div></div>`;
}
function qualifyingKnockoutScreen(track, myTeam, ghost, raceTypeId){
  const rt=Engine.RACE_TYPES[raceTypeId]; const isFullGrid=rt.id!=="duel"; const seed=Engine.hashSeed(Team.T.seed+":quali:knockout:"+track.id+":"+raceTypeId); const qualiResult=Engine.simulateQualifyingKnockout(myTeam, {drivers:ghost.drivers.slice(0,2), components:ghost.components}, track.id, seed, isFullGrid);
  setTimeout(()=>{
    $$("[data-quali-session]").forEach(el=>el.onclick=()=>{ const sessId=el.dataset.qualiSession; $$("[data-quali-session]").forEach(x=>x.classList.remove("active")); el.classList.add("active"); $$("[data-quali-content]").forEach(c=>c.style.display=c.dataset.qualiContent===sessId?"block":"none"); });
    $("#goRaceBtn").onclick=()=>{ Team.setQualiResult(qualiResult); Team.save(); const probs=Engine.winProbs(myTeam, {name:ghost.name||"Rival Team", short:ghost.short||"RIV", col1:ghost.col1, drivers:ghost.drivers.slice(0,2), components:ghost.components}, track.id, 200); render(()=>tyreAndBoostSelection(track, myTeam, ghost, probs, qualiResult.finalGrid, raceTypeId)); };
  },0);
  const sessionTabs=qualiResult.sessions.map(s=>`<div class="car-component-slot ${s.id==="Q1"?"selected":""}" data-quali-session="${s.id}" style="position:static;width:auto;height:auto;padding:8px;cursor:pointer"><div style="font-weight:900;font-size:11px">${s.name}</div><div style="font-size:9px;color:var(--muted)">${s.duration} min</div></div>`).join("");
  const sessionContents=qualiResult.sessions.map(s=>{ const rows=s.cars.map(c=>`<div class="quali-row ${c.id===myTeam.drivers[0].id||c.id===myTeam.drivers[1].id?"you":""} ${c.elim?"eliminated":""}" style="${c.elim?"opacity:0.5":""}"><span class="quali-pos">P${c.pos} ${c.elim?"❌":""}</span><span class="quali-driver">${c.name} · ${c.team}</span><span class="quali-time">${c.time.toFixed(3)}s</span></div>`).join(""); return `<div data-quali-content="${s.id}" style="display:${s.id==="Q1"?"block":"none"}"><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:12px"><div style="padding:10px;font-weight:900;font-size:12px;background:var(--bg2);border-bottom:1px solid var(--line)">${s.name} — ${s.duration} MIN — ${s.cars.length} CARS</div>${rows}</div></div>`; }).join("");
  const finalGridRows=qualiResult.finalGrid.map(q=>`<div class="quali-row ${q.id===myTeam.drivers[0].id||q.id===myTeam.drivers[1].id?"you":""}"><span class="quali-pos">P${q.grid}</span><span class="quali-driver">${q.name} · ${q.teamName}</span><span class="quali-time">${q.time.toFixed(3)}s</span></div>`).join("");
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="lap-counter">${track.flag} ${track.name} · ${rt.icon} ${rt.name} · Q1/Q2/Q3 · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div class="weather-widget">Pole ${qualiResult.pole.time.toFixed(3)}s</div></div><div class="main-content" style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:900;font-size:14px">🎯 QUALIFYING — Q1/Q2/Q3 KNOCKOUT — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div style="display:flex;gap:6px;margin-top:10px">${sessionTabs}<div class="car-component-slot" data-quali-session="FINAL" style="position:static;width:auto;height:auto;padding:8px;cursor:pointer;background:var(--red);color:white"><div style="font-weight:900;font-size:11px">FINAL GRID</div></div></div></div>${sessionContents}<div data-quali-content="FINAL" style="display:none"><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;margin-top:12px"><div style="padding:10px;font-weight:900;font-size:12px;background:var(--bg2);border-bottom:1px solid var(--line)">FINAL GRID — 20 CARS — POLE ${qualiResult.pole.name}</div>${finalGridRows}</div></div><button class="btn-clash btn-red" id="goRaceBtn">🏁 CONTINUE TO TYRE & BOOST →</button></div></div>`;
}
function timeTrialScreen(track, myTeam){
  const T=Team.T; const ghosts=T.ghosts[track.id]||[]; const bestGhost=ghosts[0];
  setTimeout(()=>{
    bindNav(); $("#runTimeTrialBtn").onclick=()=>{ const rng=Engine.mulberry32(Engine.hashSeed(T.seed+":tt:"+track.id+":"+Date.now())); const driver=myTeam.drivers[0]; const ghostLap=Engine.createGhostLap(driver, myTeam, track.id, rng()); Team.addGhost(track.id, ghostLap); Team.save(); toast(`⏱️ ${ghostLap.total.toFixed(3)}s`); render(()=>timeTrialScreen(track, myTeam)); };
    $("#backRaceHub").onclick=()=>render(raceHub);
  },0);
  const ghostRows=ghosts.map((g,i)=>`<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ${i===0?"var(--gold)":"var(--line)"}"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${i===0?"🏆 BEST ":""}${g.driverName} — ${g.total.toFixed(3)}s</span><span style="font-size:10px;color:var(--muted)">${new Date(g.timestamp).toLocaleTimeString()}</span></div><div style="font-size:10px;color:var(--muted);margin-top:4px">S1 ${g.sectors[0].time.toFixed(3)}s · S2 ${g.sectors[1].time.toFixed(3)}s · S3 ${g.sectors[2].time.toFixed(3)}s</div></div>`).join("") || `<div style="text-align:center;padding:20px;color:var(--muted)">No ghost laps yet</div>`;
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">⏱️ TIME TRIAL — ${track.flag} ${track.name} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backRaceHub" style="width:auto;padding:6px 12px;font-size:11px">← RACE HUB</button></div><button class="btn-clash btn-red" id="runTimeTrialBtn" style="margin-top:12px">⏱️ RUN TIME TRIAL — ${myTeam.drivers[0].name}</button><div style="margin-top:16px"><div style="font-weight:800;font-size:12px">GHOST LEADERBOARD — ${ghosts.length} laps</div><div style="margin-top:8px">${ghostRows}</div></div></div></div>${bottomNav("race")}`;
}
function tracksScreen(){
  setTimeout(()=>{ bindNav(); $("#backToRace").onclick=()=>render(raceHub); },0);
  const tracks=Engine.TRACK_LIST.map(t=>`<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="height:80px;background: radial-gradient(400px 100px at 50% 30%, #1e2535, #0c0e12);display:flex;align-items:center;justify-content:center;position:relative"><div style="font-size:28px">🏁</div><div style="position:absolute;top:6px;left:8px;background:rgba(0,0,0,.6);padding:2px 8px;border-radius:10px;font-size:10px">${t.flag} ${t.country}</div><div style="position:absolute;top:6px;right:8px;background:var(--panel2);padding:2px 8px;border-radius:10px;font-size:9px">${t.layout} · ${t.drsZones} DRS</div><div style="position:absolute;bottom:6px;left:8px;font-size:10px;font-weight:800">${t.name}</div><div style="position:absolute;bottom:6px;right:8px;font-size:9px;background:var(--red);padding:2px 6px;border-radius:4px">${t.laps} LAPS</div></div><div style="padding:10px"><div style="font-size:11px;color:var(--muted)">${t.desc}</div></div></div>`).join("");
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h3 style="font-weight:900">24 TRACKS — 3 SECTORS — SIMPLE RACE — ${Team.getSlotCount?Team.getSlotCount():""} TEAMS</h3><button class="btn-clash btn-dark" id="backToRace" style="width:auto;padding:6px 12px;font-size:11px">← BACK</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${tracks}</div></div></div>${bottomNav("race")}`;
}
function garageScreen(){
  const T=Team.T; const allComps=[...Object.values(T.squad.components)]; if(T.inventory) allComps.push(...T.inventory); const myTeam=Team.currentLoadout();
  setTimeout(()=>{ bindNav(); $$("[data-comp]").forEach(el=>el.onclick=()=>{ const type=el.dataset.comp; const comps=allComps.filter(c=>c.type===type).sort((a,b)=>(b.stats.speed+b.stats.cornering)-(a.stats.speed+a.stats.cornering)); if(!comps.length) return; const curId=T.lineup.components[type]; const idx=comps.findIndex(c=>c.id===curId); const next=comps[(idx+1)%comps.length]; T.lineup.components[type]=next.id; Team.save(); render(garageScreen); }); $$("[data-driver-slot]").forEach(el=>el.onclick=()=>showDriverPicker(+el.dataset.driverSlot)); $("#liveryBtn").onclick=()=>render(liveryScreen); },0);
  function compSlot(type,label,icon){ const id=T.lineup.components[type]; const comp=allComps.find(c=>c.id===id)||T.squad.components[type]; if(!comp) return ""; return `<div class="car-component-slot slot-${type} selected" data-comp="${type}"><div class="rarity-bar rarity-${comp.rarity}" style="position:absolute;top:0;left:0;right:0;height:3px"></div><div class="comp-slot-icon">${icon}</div><div class="comp-slot-label">${label}</div><div class="comp-slot-level">Lv${comp.level} ${comp.stats.speed}</div></div>`; }
  const driversRow=myTeam.drivers.map((d,i)=>`<div class="driver-card-clash selected" data-driver-slot="${i}"><div class="rarity-bar rarity-${d.rarity||"common"}"></div><div class="driver-header"><div class="driver-avatar" style="background:${T.livery?.col1||T.col1};color:${T.livery?.col2||T.col2}">${d.name[0]}</div><div class="driver-info"><div class="driver-name">${d.name} ${d.isLegendary?"👑":""}</div><div class="driver-team">${d.role} · ${d.style} · ${d.age}y</div></div><div class="driver-ovr">${d.ovr}</div></div><div class="driver-stats-mini"><span class="stat-mini">OVR <b>${d.stats.OVR}</b></span><span class="stat-mini">PAC <b>${d.stats.PAC}</b></span><span class="stat-mini">QUA <b>${d.stats.QUA}</b></span><span class="stat-mini">TYR <b>${d.stats.TYR}</b></span></div></div>`).join("");
  return `${topBar()}${seriesBar()}<div class="main-content"><div class="garage-container"><div class="drivers-row">${driversRow}</div><div class="car-display"><div class="car-svg-wrap"><svg viewBox="0 0 200 80" style="width:100%;height:100%"><rect x="20" y="25" width="160" height="30" rx="15" fill="${T.livery?.col1||T.col1}" stroke="${T.livery?.col2||T.col2}" stroke-width="2"/><circle cx="50" cy="55" r="14" fill="#111" stroke="#333" stroke-width="2"/><circle cx="50" cy="55" r="6" fill="#444"/><circle cx="150" cy="55" r="14" fill="#111" stroke="#333" stroke-width="2"/><circle cx="150" cy="55" r="6" fill="#444"/><rect x="80" y="15" width="40" height="20" rx="6" fill="${T.livery?.col2||T.col2}" opacity=".9"/><text x="100" y="28" text-anchor="middle" font-size="10" font-weight="900" fill="${T.livery?.col1||T.col1}">${T.short}</text></svg></div>${compSlot("frontWing","F Wing","🪽")}${compSlot("brakes","Brakes","🛞")}${compSlot("suspension","Susp.","🔩")}${compSlot("rearWing","R Wing","🪽")}${compSlot("gearbox","Gearbox","⚙️")}${compSlot("engine","Engine","🔥")}</div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px"><div style="display:flex;justify-content:space-between;font-size:11px;font-weight:800"><span>TEAM SCORE</span><span style="color:var(--gold)">${Team.score()} TS · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</span></div><button class="btn-clash btn-dark" id="liveryBtn" style="margin-top:8px">🎨 CUSTOM LIVERY</button></div></div></div>${bottomNav("garage")}`;
}
function showDriverPicker(slot){
  const T=Team.T; const sorted=[...T.squad.drivers].sort((a,b)=>b.ovr-a.ovr); const modal=document.createElement("div"); modal.className="modal-overlay"; modal.innerHTML=`<div class="modal-clash"><div class="modal-header"><div class="modal-title">Select Driver ${slot+1} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><button class="modal-close" id="closeModal">✕</button></div><div style="max-height:60vh;overflow-y:auto">${sorted.map(d=>`<div class="tyre-option" data-pick="${d.id}"><div class="driver-avatar" style="width:36px;height:36px;background:${d.isLegendary?"linear-gradient(45deg, #ff8000, #ffcc00)":"var(--panel2)"}">${d.name[0]}</div><div class="tyre-details"><div class="tyre-name">${d.name} ${d.isLegendary?"👑 LEGENDARY":""} <span style="color:var(--gold)">OVR ${d.ovr}/${d.pot}</span></div><div class="tyre-desc">${d.role} · ${d.style} · ${d.age}y · ${d.rarity}</div></div></div>`).join("")}</div></div>`;
  document.body.appendChild(modal); modal.querySelector("#closeModal").onclick=()=>modal.remove(); modal.onclick=(e)=>{ if(e.target===modal) modal.remove(); }; modal.querySelectorAll("[data-pick]").forEach(el=>el.onclick=()=>{ T.lineup.drivers[slot]=+el.dataset.pick; Team.save(); modal.remove(); render(garageScreen); });
}
function liveryScreen(){
  const T=Team.T; const colors=["#e10600","#00a8ff","#ffcc00","#00d084","#a335ee","#ff8000","#ffffff","#000000","#1e90ff","#ff1493"]; const patterns=["solid","stripes","gradient","camo","digital"];
  setTimeout(()=>{ $$("[data-col1]").forEach(el=>el.onclick=()=>{ T.livery.col1=el.dataset.col1; Team.save(); render(liveryScreen); }); $$("[data-col2]").forEach(el=>el.onclick=()=>{ T.livery.col2=el.dataset.col2; Team.save(); render(liveryScreen); }); $$("[data-pattern]").forEach(el=>el.onclick=()=>{ T.livery.pattern=el.dataset.pattern; Team.save(); render(liveryScreen); }); $("#backGarage").onclick=()=>render(garageScreen); },0);
  return `${topBar()}<div class="main-content"><div style="padding:12px"><h3 style="font-weight:900">🎨 LIVERY EDITOR — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${T.teamName}</h3><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px"><div style="height:100px;display:flex;align-items:center;justify-content:center;background:var(--bg2);border-radius:8px"><svg viewBox="0 0 200 80" style="width:200px;height:80px"><rect x="20" y="25" width="160" height="30" rx="15" fill="${T.livery.col1}" stroke="${T.livery.col2}" stroke-width="3"/><circle cx="50" cy="55" r="14" fill="#111"/><circle cx="150" cy="55" r="14" fill="#111"/><rect x="80" y="15" width="40" height="20" rx="6" fill="${T.livery.col2}"/><text x="100" y="28" text-anchor="middle" font-size="10" font-weight="900" fill="${T.livery.col1}">${T.short}</text></svg></div><div style="margin-top:12px"><div style="font-weight:800;font-size:11px">PRIMARY</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${colors.map(c=>`<div data-col1="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};border:2px solid ${T.livery.col1===c?"white":"transparent"};cursor:pointer"></div>`).join("")}</div></div><div style="margin-top:12px"><div style="font-weight:800;font-size:11px">SECONDARY</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${colors.map(c=>`<div data-col2="${c}" style="width:32px;height:32px;border-radius:50%;background:${c};border:2px solid ${T.livery.col2===c?"white":"transparent"};cursor:pointer"></div>`).join("")}</div></div><div style="margin-top:12px"><div style="font-weight:800;font-size:11px">PATTERN</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${patterns.map(p=>`<div data-pattern="${p}" style="padding:6px 12px;background:${T.livery.pattern===p?"var(--red)":"var(--panel2)"};border-radius:6px;font-size:11px;font-weight:700;cursor:pointer">${p}</div>`).join("")}</div></div><button class="btn-clash btn-dark" id="backGarage" style="margin-top:12px">← BACK</button></div></div></div>${bottomNav("garage")}`;
}
function labScreen(){
  const T=Team.T; const allComps=[...Object.values(T.squad.components)]; if(T.inventory) allComps.push(...T.inventory);
  setTimeout(()=>{ bindNav(); $$("[data-research]").forEach(el=>el.onclick=()=>{ const comp=allComps.find(c=>c.id===+el.dataset.research); if(Team.doResearch(comp)){ Team.save(); toast(`🔬 ${comp.type} → Lv${comp.level}!`); render(labScreen); } else toast("Need RP/materials/credits"); }); $$("[data-train]").forEach(el=>el.onclick=()=>{ const d=T.squad.drivers.find(x=>x.id===+el.dataset.train); if(Team.doTrain(d)){ Team.save(); toast(`📈 ${d.name} → OVR ${d.ovr}!`); render(labScreen); } else toast("Need RP or MAX"); }); },0);
  const compRows=allComps.sort((a,b)=>b.stats.speed-a.stats.speed).map(c=>`<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${c.type.toUpperCase()} · ${c.rarity.toUpperCase()} · Lv${c.level}</span><span style="font-size:11px;color:var(--gold)">${c.stats.speed} SPD</span></div><button class="btn-clash ${Team.canResearch(c)?"btn-red":"btn-dark"}" data-research="${c.id}" style="margin-top:8px;padding:8px;font-size:11px">${Team.canResearch(c)?"🔬 RESEARCH →":"NEED RESOURCES"}</button></div>`).join("");
  const driverRows=[...T.squad.drivers].sort((a,b)=>b.ovr-a.ovr).map(d=>`<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${d.name} ${d.isLegendary?"👑":""} · OVR ${d.ovr}/${d.pot}</span><span style="font-size:11px;color:var(--gold)">${d.role}</span></div><button class="btn-clash ${Team.canTrain(d)?"btn-gold":"btn-dark"}" data-train="${d.id}" style="margin-top:8px;padding:8px;font-size:11px">${Team.canTrain(d)?"📈 TRAIN →":d.ovr>=d.pot?"MAX":"NEED RP"}</button></div>`).join("");
  return `${topBar()}<div class="main-content"><div style="padding:12px"><h3 style="font-weight:900">RESEARCH LAB — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${T.teamName}</h3><h4 style="font-weight:800;font-size:12px;margin:12px 0 8px">🔧 COMPONENTS</h4>${compRows}<h4 style="font-weight:800;font-size:12px;margin:16px 0 8px">👥 DRIVERS ACADEMY</h4>${driverRows}</div></div>${bottomNav("lab")}`;
}
function marketScreen(){
  const pool=Team.marketPool();
  setTimeout(()=>{ bindNav(); $$("[data-buy]").forEach(b=>b.onclick=()=>{ const entry=pool[+b.dataset.buy]; if(!entry) return; const price=entry.item.bucksPrice?entry.item.bucksPrice:entry.item.price; if(entry.item.bucksPrice){ if(Team.T.bucks<price){ toast("Not enough Bucks"); return; } Team.T.bucks-=price; } else { if(Team.T.budget<price){ toast("Not enough Credits"); return; } Team.T.budget=Math.round((Team.T.budget-price)*10)/10; } if(entry.type==="driver"){ if(Team.T.squad.drivers.length>=20){ toast("Squad full"); return; } Team.T.squad.drivers.push(entry.item); } else if(entry.type==="component"){ Team.T.inventory=Team.T.inventory||[]; Team.T.inventory.push(entry.item); } else if(entry.type==="boost"){ Team.T.boostInventory[entry.item.id]=(Team.T.boostInventory[entry.item.id]||0)+entry.item.qty; } else if(entry.type==="livery"){ Team.T.livery.col1=entry.item.col1; Team.T.livery.col2=entry.item.col2; Team.T.livery.pattern=entry.item.pattern; } Team.save(); Team.updateCollectionScore(); toast(`✅ ${entry.item.name||entry.item.type} acquired!`); render(marketScreen); }); },0);
  const rows=pool.map((e,i)=>{
    if(e.type==="driver"){ const d=e.item; return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px;border-left:3px solid ${d.rarity==="legendary"?"#ff8000":d.rarity==="epic"?"#a335ee":d.rarity==="rare"?"#1e90ff":"#8b90a5"}"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${d.name} ${d.isLegendary?"👑 LEGENDARY":""} · ${d.rarity.toUpperCase()}</span><span style="font-size:11px;color:var(--gold)">OVR ${d.ovr}/${d.pot}</span></div><div style="font-size:10px;color:var(--muted)">${d.role} · ${d.style} · age ${d.age}</div><div style="text-align:right;margin-top:8px"><button class="btn-clash ${d.rarity==="legendary"?"btn-gold":"btn-red"}" data-buy="${i}" style="width:auto;padding:6px 12px;font-size:11px">${d.bucksPrice?d.bucksPrice+" Bucks":Team.fmtM(d.price)}</button></div></div>`; }
    else if(e.type==="component"){ const c=e.item; return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="font-weight:800;font-size:12px">${c.type.toUpperCase()} · ${c.rarity.toUpperCase()}</span><span style="font-size:11px;color:var(--gold)">Lv${c.level} · ${c.stats.speed} SPD</span></div><div style="text-align:right;margin-top:8px"><button class="btn-clash btn-red" data-buy="${i}" style="width:auto;padding:6px 12px;font-size:11px">${c.bucksPrice?c.bucksPrice+" Bucks":Team.fmtM(c.price)}</button></div></div>`; }
    else if(e.type==="boost"){ const b=e.item; return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:center"><span style="font-size:24px">${Engine.BOOSTS[b.id].icon}</span><div><div style="font-weight:800;font-size:12px">${b.name} x${b.qty}</div><div style="font-size:10px;color:var(--muted)">${Engine.BOOSTS[b.id].desc}</div></div></div><div style="text-align:right;margin-top:8px"><button class="btn-clash btn-blue" data-buy="${i}" style="width:auto;padding:6px 12px;font-size:11px">${Team.fmtM(b.price)}</button></div></div>`; }
    else { const l=e.item; return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:center"><div style="width:40px;height:20px;border-radius:4px;background:${l.col1};border:2px solid ${l.col2}"></div><div><div style="font-weight:800;font-size:12px">Livery: ${l.pattern}</div></div></div><div style="text-align:right;margin-top:8px"><button class="btn-clash btn-dark" data-buy="${i}" style="width:auto;padding:6px 12px;font-size:11px">${Team.fmtM(l.price)}</button></div></div>`; }
  }).join("");
  return `${topBar()}<div class="main-content"><div style="padding:12px"><h3 style="font-weight:900">MARKET — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${Team.T.teamName}</h3>${rows}</div></div>${bottomNav("market")}`;
}
const TUTORIAL_STEPS = [
  ["🏁 Welcome to F1 Legends", "The Race hub is your home base. Build a team, improve your score, and climb through the series.", "Start with Practice, then qualify and race when your car is ready. On the Race hub, tap the highlighted race card, choose tyres, and press Start Race."],
  ["🔧 Build your team", "Garage is where you choose drivers, fit components, and set your lineup. Better parts and trained drivers improve pace.", "Check the Lab regularly for research and driver training."],
  ["⏱️ Prepare for the weekend", "Practice helps you learn the circuit and qualifying sets your starting position. Use each session to make progress.", "You can always return to the hub between sessions."],
  ["🏎️ Manage the race", "Set Push, Standard, or Save pace for each driver. Watch tyre wear and fuel, and pit when a fresh set or repairs are worth the time.", "A steady strategy often beats an early gamble."],
  ["💾 Your career is yours", "Your slot saves automatically after important actions. More includes boosts, the market, save slots, and this Help & Tips guide.", "Good luck, Team Principal — let’s race!"]
];
function tutorialKey(){ return `f1Zero_TutorialSeen_${Team.getCurrentSlotId ? Team.getCurrentSlotId() : "default"}`; }
function showTutorial(force=false){
  if(!force && localStorage.getItem(tutorialKey())) return;
  let step=0;
  const modal=document.createElement("div"); modal.className="modal-overlay";
  const draw=()=>{ const x=TUTORIAL_STEPS[step]; modal.innerHTML=`<div class="modal-clash" style="max-width:430px"><div class="modal-header"><div class="modal-title">TEAM PRINCIPAL BRIEFING</div><button class="modal-close" id="tutorialClose">✕</button></div><div style="font-size:34px;text-align:center;padding:8px">${x[0].split(" ")[0]}</div><h2 style="font-size:19px;text-align:center;margin:4px 0 10px">${x[0].slice(2)}</h2><p style="font-size:13px;line-height:1.5;color:var(--text)">${x[1]}</p><p style="font-size:11px;line-height:1.5;color:var(--muted);margin-top:8px">💡 ${x[2]}</p><div style="display:flex;gap:5px;justify-content:center;margin:16px 0">${TUTORIAL_STEPS.map((_,i)=>`<span style="width:24px;height:4px;border-radius:4px;background:${i===step?"var(--red)":"var(--line)"}"></span>`).join("")}</div><div style="display:flex;gap:8px"><button class="btn-clash btn-dark" id="skipTutorial" style="flex:1">SKIP</button><button class="btn-clash btn-red" id="nextTutorial" style="flex:2">${step===TUTORIAL_STEPS.length-1?"LET’S RACE":"NEXT"}</button></div></div>`;
    modal.querySelector("#nextTutorial").onclick=()=>{ if(step===TUTORIAL_STEPS.length-1){ localStorage.setItem(tutorialKey(),"1"); modal.remove(); } else { step++; draw(); } };
    modal.querySelector("#skipTutorial").onclick=()=>{ localStorage.setItem(tutorialKey(),"1"); modal.remove(); };
    modal.querySelector("#tutorialClose").onclick=()=>modal.remove();
  }; draw(); document.body.appendChild(modal);
}
function helpScreen(){
  setTimeout(()=>{ bindNav(); $("#replayTutorialBtn").onclick=()=>showTutorial(true); $("#backMoreHelp").onclick=()=>render(moreScreen); },0);
  const sections=[
    ["🏁 Race modes", "Practice and qualifying build your weekend. In the race, balance pace, tyres, fuel, and pit timing."],
    ["🔧 Garage & drivers", "Use your strongest lineup, fit matching components, and train drivers in the Lab as resources allow."],
    ["🔬 Research & training", "Research raises component levels; training raises driver OVR. Save RP and materials for upgrades that matter."],
    ["🛒 Market & currencies", "Credits buy regular items, Bucks buy premium offers, and boosts are consumables. Check prices before committing."],
    ["🧠 Race strategy", "Push gains pace but wears tyres and fuel faster. Standard is reliable; Save protects a driver for a late attack."],
    ["💾 Save behavior", "Progress saves after races, upgrades, purchases, and settings. Each team slot is an independent local career."]
  ];
  return `${topBar()}<div class="main-content"><div style="padding:12px"><h3 style="font-weight:900">💡 HELP & TIPS</h3><p style="font-size:11px;color:var(--muted);margin:6px 0 12px">Quick answers for new and returning team principals.</p>${sections.map(x=>`<div style="background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:11px;margin-bottom:8px"><div style="font-weight:900;font-size:12px">${x[0]}</div><div style="font-size:11px;line-height:1.45;color:var(--muted);margin-top:5px">${x[1]}</div></div>`).join("")}<button class="btn-clash btn-red" id="replayTutorialBtn" style="width:100%;margin-top:5px">↻ REPLAY FIRST-TIME TUTORIAL</button><button class="btn-clash btn-dark" id="backMoreHelp" style="width:100%;margin-top:8px">← BACK TO MORE</button></div></div>${bottomNav("more")}`;
}

function moreScreen(){
  const T=Team.T;
  const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
  setTimeout(()=>{
    bindNav();
    $("#boostsBtn").onclick=()=>render(boostsScreen);
    $("#pitPassBtn").onclick=()=>render(pitPassScreen);
    $("#clubBtn").onclick=()=>render(clubScreen);
    $("#collectionBtn").onclick=()=>render(collectionScreen);
    $("#champBtn2").onclick=()=>render(championshipScreen);
    $("#constructorsBtn2").onclick=()=>render(constructorsScreen);
    $("#spinnerBtn2").onclick=()=>render(spinnerScreen);
    $("#tracksBtn2").onclick=()=>render(tracksScreen);
    $("#helpBtn").onclick=()=>render(helpScreen);
    $("#tutorialBtn").onclick=()=>showTutorial(true);
    $("#liveryBtn2").onclick=()=>render(liveryScreen);
    $("#timeTrialBtn2").onclick=()=>{ const track=Engine.TRACK_LIST[T.race % Engine.TRACK_LIST.length]; render(()=>timeTrialScreen(track, Team.currentLoadout())); };
    $("#saveSlotsBtn").onclick=()=>render(saveSlotsScreen);
    $("#resetBtn").onclick=()=>{
      if(confirm(`Delete current team "${T.teamName}" (${Team.getCurrentSlotId?Team.getCurrentSlotId():""})? This deletes only this slot, other ${slots.length-1} teams remain.`)){
        const curId = Team.getCurrentSlotId();
        if(curId){
          Team.deleteSaveSlot(curId);
          toast(`🗑️ Deleted ${curId}`);
          const remaining = Team.getSaveSlots();
          if(remaining.length>0) render(saveSlotsScreen);
          else render(createTeamScreen);
        }
      }
    };
    $("#wipeAllBtn").onclick=()=>{
      if(confirm(`WIPE ALL ${slots.length} TEAMS? Cannot be undone!`)){
        if(prompt(`Type DELETE to wipe all ${slots.length} teams:`)==="DELETE"){
          Team.wipeAllSlots();
          toast("🗑️ All wiped");
          render(createTeamScreen);
        }
      }
    };
  },0);
  return `${topBar()}<div class="main-content"><div style="padding:12px;display:flex;flex-direction:column;gap:10px">
    <h3 style="font-weight:900">ALL FEATURES — V5.2 MULTI-ACCOUNT + SIMPLE RACE</h3>
    <div style="background:rgba(0,255,0,.1);border:1px solid rgba(0,255,0,.3);border-radius:8px;padding:10px;font-size:11px"><b>👥 MULTIPLE ACCOUNTS — TEMP LOCAL — ${slots.length}/${Team.MAX_SLOTS||5} TEAMS</b><br>Current: ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} · ${T.teamName} · ${T.short} · S${T.series} Lv${T.pitPass.level} · Last ${timeAgo(T.lastPlayed||Date.now())}<br><span style="font-size:10px;color:var(--muted)">Each slot independent career. Later replaced by Google Play cloud saves. Manage in My Teams screen.</span></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="background:var(--red);color:white;border:1px solid var(--red);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="saveSlotsBtn"><div style="font-size:24px">👥</div><div style="font-weight:900;font-size:12px;margin-top:6px">MY TEAMS — ${slots.length}/${Team.MAX_SLOTS||5}</div><div style="font-size:10px">Switch / New Account</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="boostsBtn"><div style="font-size:24px">🚀</div><div style="font-weight:800;font-size:12px;margin-top:6px">Boosts</div><div style="font-size:10px;color:var(--muted)">${Object.values(T.boostInventory).reduce((a,b)=>a+b,0)} owned</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="pitPassBtn"><div style="font-size:24px">🎫</div><div style="font-weight:800;font-size:12px;margin-top:6px">Pit Pass</div><div style="font-size:10px;color:var(--muted)">Lv${T.pitPass.level}/50</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="clubBtn"><div style="font-size:24px">👥</div><div style="font-weight:800;font-size:12px;margin-top:6px">Club</div><div style="font-size:10px;color:var(--muted)">${T.club.name||"No club"}</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="collectionBtn"><div style="font-size:24px">📚</div><div style="font-weight:800;font-size:12px;margin-top:6px">Collection</div><div style="font-size:10px;color:var(--muted)">${T.collection.score} score</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="champBtn2"><div style="font-size:24px">🏆</div><div style="font-weight:800;font-size:12px;margin-top:6px">Championship</div><div style="font-size:10px;color:var(--muted)">S${T.season} R${T.race+1}/18</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="constructorsBtn2"><div style="font-size:24px">🏗️</div><div style="font-weight:800;font-size:12px;margin-top:6px">Constructors</div><div style="font-size:10px;color:var(--muted)">${T.constructors.history.length} races</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="spinnerBtn2"><div style="font-size:24px">🎰</div><div style="font-weight:800;font-size:12px;margin-top:6px">Spinner</div><div style="font-size:10px;color:var(--muted)">${T.spinner.freeSpins||0} free</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="timeTrialBtn2"><div style="font-size:24px">⏱️</div><div style="font-weight:800;font-size:12px;margin-top:6px">Ghost Replay</div><div style="font-size:10px;color:var(--muted)">${Object.keys(T.ghosts).length} tracks</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="tracksBtn2"><div style="font-size:24px">🗺️</div><div style="font-weight:800;font-size:12px;margin-top:6px">24 Tracks</div><div style="font-size:10px;color:var(--muted)">simple race</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="liveryBtn2"><div style="font-size:24px">🎨</div><div style="font-weight:800;font-size:12px;margin-top:6px">Livery</div><div style="font-size:10px;color:var(--muted)">${T.livery.pattern}</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="helpBtn"><div style="font-size:24px">💡</div><div style="font-weight:800;font-size:12px;margin-top:6px">Help & Tips</div><div style="font-size:10px;color:var(--muted)">Guides and hints</div></div>
      <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center;cursor:pointer" id="tutorialBtn"><div style="font-size:24px">🎓</div><div style="font-weight:800;font-size:12px;margin-top:6px">Tutorial</div><div style="font-size:10px;color:var(--muted)">Replay briefing</div></div>
    </div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:12px">V5.2 — MULTI-ACCOUNT + SIMPLE RACE</div><div style="font-size:11px;color:var(--muted);margin-top:6px">
<b>NEW V5.2:</b> Multiple save slots — up to ${Team.MAX_SLOTS||5} local accounts (hard 10) for testing. Each slot independent. Will be replaced by Google Play Games cloud saves.<br>
<b>V5.1:</b> simple race: Full Track (map) + Race Cam (F1 Clash isometric) + TV + Chase + Onboard + Helicopter, auto cam ON.<br>
<b>V5:</b> FP1/FP2/FP3, Q1/Q2/Q3 knockout, Damage+Repair animation, Ghost replay 3 sectors, Full weekend, Sponsor tasks, Constructors.<br>
All previous: 24 tracks, 7 race types, 20-car grid, DRS/ERS/Fuel, SC/VSC/Red Flag, no crates, no F1 IP, honest sim.
</div></div>
    <div style="display:flex;gap:8px">
      <button class="btn-clash btn-dark" id="resetBtn" style="flex:1">🗑️ DELETE CURRENT SLOT (${Team.getCurrentSlotId?Team.getCurrentSlotId():""})</button>
      <button class="btn-clash btn-dark" id="wipeAllBtn" style="flex:1;background:rgba(225,6,0,.15);color:var(--red);border:1px solid var(--red)">🗑️ WIPE ALL ${slots.length} TEAMS</button>
    </div>
  </div></div>${bottomNav("more")}`;
}
function boostsScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $$("[data-use-boost]").forEach(el=>el.onclick=()=>{ const boostId=el.dataset.useBoost; const driverIdx=+el.dataset.driver; if(Team.useBoost(boostId, driverIdx)){ Team.save(); toast(`🚀 ${Engine.BOOSTS[boostId].name} → D${driverIdx+1}`); render(boostsScreen); } else toast("No boosts"); }); $$("[data-clear-boosts]").forEach(el=>el.onclick=()=>{ Team.clearBoosts(+el.dataset.clearBoosts); Team.save(); render(boostsScreen); }); $("#backMore").onclick=()=>render(moreScreen); },0);
  const inventory=Object.entries(T.boostInventory).filter(([k,v])=>v>0).map(([id,qty])=>{ const b=Engine.BOOSTS[id]; return `<div style="background:var(--panel2);border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:8px;display:flex;gap:10px;align-items:center"><div style="font-size:28px">${b.icon}</div><div style="flex:1"><div style="font-weight:800;font-size:12px">${b.name} <span style="background:${b.color};color:white;padding:2px 6px;border-radius:4px;font-size:9px">${b.rarity.toUpperCase()}</span></div><div style="font-size:10px;color:var(--muted)">${b.desc}</div><div style="font-size:10px;color:var(--gold)">Qty: ${qty}</div></div><div style="display:flex;flex-direction:column;gap:4px"><button class="btn-clash btn-red" data-use-boost="${id}" data-driver="0" style="padding:6px 10px;font-size:10px">D1</button><button class="btn-clash btn-blue" data-use-boost="${id}" data-driver="1" style="padding:6px 10px;font-size:10px">D2</button></div></div>`; }).join("") || `<div style="text-align:center;padding:20px;color:var(--muted)">No boosts</div>`;
  const drivers=T.lineup.drivers.map((did,i)=>{ const d=T.squad.drivers.find(x=>x.id===did); const sel=T.selectedBoosts[i]||[]; return `<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:900;font-size:13px">${d?d.name:"Driver "+(i+1)} · ${d?d.ovr+" OVR":""}</span><button class="btn-clash btn-dark" data-clear-boosts="${i}" style="width:auto;padding:4px 10px;font-size:10px">CLEAR</button></div><div style="margin-top:8px;min-height:40px;background:var(--bg2);border-radius:8px;padding:8px;display:flex;gap:6px;flex-wrap:wrap">${sel.length?sel.map(bId=>{ const b=Engine.BOOSTS[bId]; return `<span style="background:${b.color};color:white;padding:4px 8px;border-radius:12px;font-size:11px;font-weight:700">${b.icon} ${b.name}</span>`; }).join(""):`<span style="font-size:11px;color:var(--muted)">No boosts</span>`}</div></div>`; }).join("");
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">🚀 BOOSTS — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${T.teamName}</h3><button class="btn-clash btn-dark" id="backMore" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div>${drivers}<h4 style="font-weight:800;font-size:12px;margin:16px 0 8px">INVENTORY</h4>${inventory}</div></div>${bottomNav("more")}`;
}
function pitPassScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $$("[data-claim-pass]").forEach(el=>el.onclick=()=>{ const lvl=+el.dataset.claimPass; if(T.pitPass.level<lvl){ toast("Level not reached"); return; } const rew=Team.claimPitPass(lvl); if(rew){ toast(`🎫 Lv${lvl} claimed!`); render(pitPassScreen); } else toast("Already claimed"); }); $("#backMore2").onclick=()=>render(moreScreen); },0);
  const levels=Array.from({length:20},(_,i)=>i+1).map(lvl=>{ const claimed=T.pitPass.rewardsClaimed.includes(lvl); const reachable=T.pitPass.level>=lvl; const rewards={1:"1M CR + 2x Focus",2:"5 Bucks + 10 RP",3:"Materials Pack",5:"2x Aero + 2x Power",10:"15 Bucks + Phantom",15:"Epic Engine",20:"Epic Driver",25:"25 Bucks + Legendary Boosts",30:"Legendary Engine",50:"Legendary Driver 👑"}; return `<div style="background:${claimed?"var(--panel2)":reachable?"var(--panel)":"var(--bg2)"};border:1px solid var(--line);border-radius:8px;padding:10px;margin-bottom:6px;opacity:${reachable?1:.5};display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:900;font-size:12px">Lv${lvl} ${claimed?"✓ CLAIMED":reachable?"● READY":"○ LOCKED"}</div><div style="font-size:10px;color:var(--muted)">${rewards[lvl]||"Random rewards"}</div></div><button class="btn-clash ${claimed?"btn-dark":reachable?"btn-gold":"btn-dark"}" data-claim-pass="${lvl}" style="width:auto;padding:6px 12px;font-size:11px">${claimed?"CLAIMED":reachable?"CLAIM":"LOCKED"}</button></div>`; }).join("");
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">🎫 PIT PASS — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} — 50 LEVELS</h3><button class="btn-clash btn-dark" id="backMore2" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px"><div style="display:flex;justify-content:space-between"><span style="font-weight:800">Level ${T.pitPass.level}/50</span><span style="font-size:11px">${T.pitPass.xp}/100 XP</span></div><div style="margin-top:8px;height:8px;background:var(--panel2);border-radius:4px;overflow:hidden"><div style="width:${T.pitPass.xp}%;height:100%;background:linear-gradient(90deg, var(--red), var(--gold))"></div></div></div><div style="margin-top:12px">${levels}</div></div></div>${bottomNav("more")}`;
}
function clubScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $("#joinClubBtn").onclick=()=>{ const name=$("#clubNameInput").value.trim()||"Zero Racing Club"; Team.joinClub(name); Team.save(); render(clubScreen); }; $("#exhibitionBtn").onclick=()=>{ const repEarned=25+Math.floor(Math.random()*20); Team.addClubRep(repEarned); Team.T.club.exhibitionWins++; Team.save(); toast(`👥 +${repEarned} rep`); render(clubScreen); }; $("#backMore3").onclick=()=>render(moreScreen); },0);
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">👥 CLUB — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backMore3" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div>${T.club.name?`<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:12px"><div style="font-weight:900;font-size:16px">${T.club.name}</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Level ${T.club.level} · ${T.club.reputation} rep</div><button class="btn-clash btn-red" id="exhibitionBtn" style="margin-top:12px">⚔️ CLUB EXHIBITION</button></div>`:`<div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:12px"><input id="clubNameInput" type="text" placeholder="Zero Racing Club" style="width:100%;padding:10px;border-radius:8px;background:var(--bg2);border:1px solid var(--line);color:white"/><button class="btn-clash btn-red" id="joinClubBtn" style="margin-top:10px">👥 CREATE/JOIN CLUB</button></div>`}</div></div>${bottomNav("more")}`;
}
function collectionScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $("#backMore4").onclick=()=>render(moreScreen); },0); const c=T.collection;
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">📚 COLLECTION — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backMore4" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px;margin-top:12px"><div style="font-weight:900;font-size:24px;text-align:center">${c.score}</div><div style="text-align:center;font-size:11px;color:var(--muted)">Total Collection Score — Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div></div></div></div>${bottomNav("more")}`;
}
function championshipScreen(){
  const T=Team.T; const tracks=Team.SERIES[T.series-1].tracks;
  setTimeout(()=>{ bindNav(); $("#backRace").onclick=()=>render(raceHub); $("#startChampBtn").onclick=()=>{ const track=Engine.TRACKS[tracks[0]]; const myTeam=Team.currentLoadout(); Team.startWeekend(track.id, "championship"); render(()=>weekendHubScreen(track, myTeam, Team.genGhostTeams(1)[0], {home:50,away:50,draw:0}, "championship")); }; },0);
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">🏆 CHAMPIONSHIP — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backRace" style="width:auto;padding:6px 12px;font-size:11px">← RACE</button></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px"><div style="font-weight:800">Season ${T.season} — Series ${T.series} — ${T.teamName}</div><div style="margin-top:10px"><div style="font-weight:700;font-size:11px">CALENDAR</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${tracks.map(id=>{ const t=Engine.TRACKS[id]; return `<span class="badge" style="background:var(--panel2)">${t.flag} ${t.name}</span>`; }).join("")}</div></div><button class="btn-clash btn-red" id="startChampBtn" style="margin-top:12px">🏁 START CHAMPIONSHIP WEEKEND</button></div></div></div>${bottomNav("race")}`;
}
function constructorsScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $("#backMore6").onclick=()=>render(moreScreen); },0); const history=T.constructors.history.slice(-20);
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">🏗️ CONSTRUCTORS — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backMore6" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin-top:12px"><div style="margin-top:8px;background:var(--bg2);border-radius:8px;padding:10px;max-height:300px;overflow-y:auto">${history.length?history.map(h=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line);font-size:11px"><span>S${h.season} R${h.race} ${h.track}</span><span style="font-weight:800">P${h.pos} +${h.points} pts</span></div>`).join(""):`<div style="color:var(--muted);font-size:11px">No races yet</div>`}</div></div></div></div>${bottomNav("more")}`;
}
function spinnerScreen(){
  const T=Team.T; setTimeout(()=>{ bindNav(); $("#spinBtn").onclick=()=>{ if((T.spinner.freeSpins||0)<=0 && Date.now()-T.spinner.lastSpin<8*3600*1000){ toast("No free spins"); return; } const rew=Team.spinWheel(); toast(`🎰 ${rew.label}!`); render(spinnerScreen); }; $("#backMore5").onclick=()=>render(moreScreen); },0); const canSpin=(T.spinner.freeSpins||0)>0 || Date.now()-T.spinner.lastSpin>8*3600*1000;
  return `${topBar()}<div class="main-content"><div style="padding:12px"><div style="display:flex;justify-content:space-between;align-items:center"><h3 style="font-weight:900">🎰 SPINNER — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</h3><button class="btn-clash btn-dark" id="backMore5" style="width:auto;padding:6px 12px;font-size:11px">← MORE</button></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:20px;margin-top:12px;text-align:center"><div style="font-size:64px">🎰</div><button class="btn-clash ${canSpin?"btn-gold":"btn-dark"}" id="spinBtn" style="margin-top:16px">${canSpin?"🎰 SPIN NOW!":"⏰ WAIT 8 HOURS"}</button></div></div></div>${bottomNav("more")}`;
}
function qualifyingScreen(track, myTeam, ghost, probs, raceType){
  const seed=Engine.hashSeed(Team.T.seed+":quali:"+Team.T.race+":"+raceType); const isFullGrid=raceType==="championship"||raceType==="grandprix"||raceType==="endurance"; const quali=Engine.qualify(myTeam, {drivers:ghost.drivers.slice(0,2), components:ghost.components}, track.id, seed, isFullGrid);
  setTimeout(()=>{ $("#startRaceBtn").onclick=()=>render(()=>tyreAndBoostSelection(track, myTeam, ghost, probs, quali, raceType)); },0);
  const qualiDisplay=isFullGrid?quali.slice(0,10):quali;
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="lap-counter">${track.flag} ${track.name} · ${Engine.RACE_TYPES[raceType].icon} ${Engine.RACE_TYPES[raceType].name} · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div></div><div class="main-content" style="padding:12px;display:flex;flex-direction:column;gap:12px"><div class="quali-results"><div style="padding:10px;font-weight:900;font-size:12px;background:var(--bg2);border-bottom:1px solid var(--line)">QUALIFYING — ${isFullGrid?"20-CAR GRID":"4-CAR DUEL"}</div>${qualiDisplay.map(q=>`<div class="quali-row ${q.teamIdx===0?"you":""}"><span class="quali-pos">P${q.grid}</span><span class="quali-driver">${q.name}</span><span class="quali-time">${(90+q.grid*0.3).toFixed(3)}s</span></div>`).join("")}</div><button class="btn-clash btn-red" id="startRaceBtn">CONTINUE TO TYRE & BOOST →</button></div></div>`;
}
function tyreAndBoostSelection(track, myTeam, ghost, probs, quali, raceType){
  const tyreTimes={ soft: (track.laps*28)-2.5, medium: (track.laps*28)-0.8, hard: (track.laps*28), intermediate: (track.laps*30), wet: (track.laps*32) };
  let selectedTyres=myTeam.tyre||["medium","medium"]; let selectedBoosts=Team.T.selectedBoosts||[[],[]];
  setTimeout(()=>{
    $$("[data-tyre-select]").forEach(el=>el.onclick=()=>{ const idx=+el.dataset.idx; const tyre=el.dataset.tyreSelect; selectedTyres[idx]=tyre; $$(`[data-idx="${idx}"]`).forEach(x=>x.classList.remove("selected")); el.classList.add("selected"); });
    $("#confirmTyresBtn").onclick=()=>{ myTeam.tyre=selectedTyres; myTeam.boosts=selectedBoosts; ghost.tyre=["medium","medium"]; ghost.boosts=[[],[]]; Team.T.selectedBoosts=selectedBoosts; Team.save(); render(()=>raceScreen(track, myTeam, ghost, probs, quali, raceType)); };
    $$("[data-boost-pick]").forEach(el=>el.onclick=()=>{ const boostId=el.dataset.boostPick; if((Team.T.boostInventory[boostId]||0)<=0){ toast("No boosts"); return; } if(Team.useBoost(boostId, 0)){ selectedBoosts=Team.T.selectedBoosts; Team.save(); render(()=>tyreAndBoostSelection(track, myTeam, ghost, probs, quali, raceType)); } });
  },0);
  function tyreOptions(idx){ return Object.entries(Engine.TYRES).map(([id,t])=>`<div class="tyre-option ${selectedTyres[idx]===id?"selected":""}" data-tyre-select="${id}" data-idx="${idx}"><div class="tyre-icon-big" style="background:${t.color};color:${id==="medium"||id==="hard"?"#000":"#fff"}">${t.short}</div><div class="tyre-details"><div class="tyre-name">${t.label}</div><div class="tyre-desc">${t.desc} · Life ${t.life}%</div></div><div class="tyre-stats"><div class="tyre-laptime">${tyreTimes[id].toFixed(1)}s</div></div></div>`).join(""); }
  const boostInventory=Object.entries(Team.T.boostInventory).filter(([k,v])=>v>0).map(([id,qty])=>{ const b=Engine.BOOSTS[id]; return `<div class="tyre-option" data-boost-pick="${id}" data-driver-idx="0" style="cursor:pointer"><div class="tyre-icon-big" style="background:${b.color}">${b.icon}</div><div class="tyre-details"><div class="tyre-name">${b.name} x${qty}</div><div class="tyre-desc">${b.desc}</div></div></div>`; }).join("");
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="lap-counter">TYRE & BOOST — ${Engine.RACE_TYPES[raceType].name} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div></div><div class="main-content" style="padding:12px;display:flex;flex-direction:column;gap:12px">
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="padding:12px;background:var(--bg2);border-bottom:1px solid var(--line)"><div style="font-weight:900;font-size:13px">${myTeam.drivers[0].name}</div></div>${tyreOptions(0)}</div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden"><div style="padding:12px;background:var(--bg2);border-bottom:1px solid var(--line)"><div style="font-weight:900;font-size:13px">${myTeam.drivers[1].name}</div></div>${tyreOptions(1)}</div>
    <div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:900;font-size:12px;margin-bottom:8px">🚀 SELECT BOOSTS</div>${boostInventory||"<div style='color:var(--muted);font-size:11px'>No boosts</div>"}</div>
    <button class="btn-clash btn-red" id="confirmTyresBtn">🏁 START ${Engine.RACE_TYPES[raceType].name.toUpperCase()} → SIMPLE RACE — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</button>
  </div></div>`;
}

/* ===== RACE SCREEN — WITH SIMPLE RACE LIKE F1 CLASH ===== */
function raceScreen(track, myTeam, ghost, probs, quali, raceType){
  const isFullGrid=raceType==="championship"||raceType==="grandprix"||raceType==="endurance"||raceType==="exhibition";
  const ghostTeam={ name:ghost.name, short:ghost.short, drivers:ghost.drivers.slice(0,2), components:ghost.components, boosts:ghost.boosts||[[],[]], instruction:["standard","standard"], tyre:ghost.tyre||["medium","medium"] };
  const seed=Engine.hashSeed(Team.T.seed+":race:"+Team.T.season+":"+Team.T.race+":"+raceType);
  const setupBonus=Team.T.weekend.setupBonus||{ setup:0, quali:0, race:0 };
  const race=Engine.createRace(myTeam, isFullGrid?null:ghostTeam, {seed, trackId:track.id, laps:track.laps, raceType, auto:false, fullGrid:isFullGrid, baseStr:Team.SERIES[Team.T.series-1].str, setupBonus});
  let timer=null, speed=2, over=false; let myInstructions=[...myTeam.instruction];
  let cameraMode="race"; let cameraAuto=true;
  const CAMERAS={
    full:{ id:"full", name:"Full Track", icon:"🗺️", desc:"Top-down map — F1 Clash track overview" },
    race:{ id:"race", name:"Race Cam", icon:"🏎️", desc:"F1 Clash main — isometric chase" },
    tv:{ id:"tv", name:"TV Broadcast", icon:"📺", desc:"Live F1 TV — leader + intervals" },
    chase:{ id:"chase", name:"Chase", icon:"🎥", desc:"Behind your car" },
    onboard:{ id:"onboard", name:"Onboard", icon:"👁️", desc:"Driver's eye" },
    helicopter:{ id:"helicopter", name:"Helicopter", icon:"🚁", desc:"High altitude all cars" }
  };
  setTimeout(()=>{
    const ticker=$("#raceTicker"), lb=$("#leaderboard"), canvas=$("#trackCanvas"); const ctx=canvas?canvas.getContext("2d"):null;
    if(canvas){ canvas.width=800; canvas.height=320; }
    function addTicker(txt,cls){ const d=document.createElement("div"); d.className="ticker-event "+(cls||""); d.innerHTML=txt; ticker.prepend(d); }
    function updateLeaderboard(positions){
      const sorted=positions.sort((a,b)=>a.pos-b.pos);
      lb.innerHTML=sorted.map(p=>`<div class="lb-row ${p.teamIdx===0?"you":""}"><span class="lb-pos">P${p.pos}</span><span class="lb-name">${p.name.split(" ").pop()}${p.drs?" <span style='color:var(--green)'>DRS</span>":""}${p.totalDamage>30?` <span style='color:var(--red)'>⚠️${p.totalDamage}%</span>`:""}</span><span class="lb-tyre tyre-${p.tyre}"></span><span class="lb-gap">${p.gap?`+${p.gap.toFixed(1)}s`:""}</span></div>`).join("");
    }
    function drawFullTrack(positions){
      if(!ctx) return; ctx.clearRect(0,0,800,320); ctx.fillStyle="#0a0c10"; ctx.fillRect(0,0,800,320);
      ctx.strokeStyle="#2a3445"; ctx.lineWidth=24; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.beginPath();
      if(track.layout==="street"){ ctx.moveTo(60,160); ctx.lineTo(120,70); ctx.lineTo(240,70); ctx.lineTo(300,130); ctx.lineTo(300,200); ctx.lineTo(240,260); ctx.lineTo(120,260); ctx.lineTo(60,180); ctx.closePath(); }
      else if(track.layout==="speed"){ ctx.moveTo(50,160); ctx.lineTo(200,50); ctx.lineTo(550,50); ctx.lineTo(650,160); ctx.lineTo(550,270); ctx.lineTo(200,270); ctx.closePath(); }
      else { ctx.moveTo(50,160); ctx.lineTo(150,60); ctx.lineTo(380,60); ctx.lineTo(480,160); ctx.lineTo(380,260); ctx.lineTo(150,260); ctx.closePath(); }
      ctx.stroke(); ctx.strokeStyle="#3a4a5a"; ctx.lineWidth=1; ctx.setLineDash([10,10]); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="rgba(0,255,0,0.25)"; ctx.font="8px sans-serif"; for(let i=0;i<track.drsZones;i++){ ctx.fillRect(100+i*130, 24, 44, 10); ctx.fillText(`DRS${i+1}`, 100+i*130, 20); }
      ctx.fillStyle="#ffcc00"; ctx.font="10px sans-serif"; ctx.fillText("S1 "+track.sectors[0].name, 80, 40); ctx.fillText("S2 "+track.sectors[1].name, 320, 40); ctx.fillText("S3 "+track.sectors[2].name, 520, 230);
      positions.slice(0,20).forEach(p=>{
        const angle=(p.pos/20)*Math.PI*2; const baseX=track.layout==="speed"?100+(p.pos/20)*520:220+Math.cos(angle)*150; const baseY=track.layout==="speed"?160+Math.sin(angle)*90:160+Math.sin(angle)*90;
        const cx=baseX, cy=baseY;
        ctx.fillStyle="rgba(0,0,0,0.5)"; ctx.beginPath(); ctx.ellipse(cx+2, cy+2, 9, 5, 0, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(cx,cy,8,0,7); ctx.fillStyle=p.teamIdx===0?"#e10600":`hsl(${p.teamIdx*36}, 85%, 60%)`; ctx.fill(); ctx.strokeStyle="white"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle="white"; ctx.font="bold 9px sans-serif"; ctx.textAlign="center"; ctx.fillText(p.pos,cx,cy+3);
        if(p.drs){ ctx.fillStyle="#00ff00"; ctx.fillRect(cx-9, cy-14, 18, 5); }
        if(p.totalDamage>30){ ctx.fillStyle="#ff2d2d"; ctx.beginPath(); ctx.arc(cx+11,cy-11,5,0,7); ctx.fill(); }
        if(p.pos<=3){ ctx.fillStyle="white"; ctx.font="8px sans-serif"; ctx.fillText(p.name.split(" ").pop(), cx, cy+18); }
      });
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.textAlign="left"; ctx.fillText(`🗺️ FULL TRACK — ${track.name} — ${track.length}km ${track.turns} turns ${track.drsZones} DRS — Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}`, 10, 18);
      ctx.fillStyle="#ffcc00"; ctx.font="10px sans-serif"; ctx.fillText(`S1 ${track.sectors[0].stat} / S2 ${track.sectors[1].stat} / S3 ${track.sectors[2].stat} — All 20 cars — ${Team.T.teamName}`, 10, 305);
    }
    function drawRaceCamera(positions){
      if(!ctx) return; ctx.clearRect(0,0,800,320);
      const grad=ctx.createLinearGradient(0,0,0,130); grad.addColorStop(0,"#1a2a4a"); grad.addColorStop(1,"#0a0c10"); ctx.fillStyle=grad; ctx.fillRect(0,0,800,130);
      const horizon=100; const roadWidthTop=140;
      ctx.fillStyle="#2a3445"; ctx.beginPath(); ctx.moveTo(0,320); ctx.lineTo(800,320); ctx.lineTo(400+roadWidthTop/2, horizon); ctx.lineTo(400-roadWidthTop/2, horizon); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#ffffff"; ctx.lineWidth=2; ctx.setLineDash([22,16]); ctx.beginPath(); ctx.moveTo(400, horizon); ctx.lineTo(400, 320); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle=track.layout==="street"?"#ff2d2d":"#ffcc00"; ctx.fillRect(0, 310, 70, 12); ctx.fillRect(730, 310, 70, 12);
      let focusPositions=[...positions].sort((a,b)=>a.pos-b.pos); const playerPos=Math.min(...positions.filter(p=>p.teamIdx===0).map(p=>p.pos)); const battleWindow=focusPositions.filter(p=>Math.abs(p.pos-playerPos)<=2); const displayCars=battleWindow.length>=3?battleWindow:focusPositions.slice(0,6);
      displayCars.forEach((p, idx)=>{
        const depth=idx/displayCars.length; const y=285-depth*175; const scale=1-depth*0.65; const xOffset=(p.pos%2===0?-1:1)*(22+depth*32)+(p.gap?Math.min(44, p.gap*9):0); const x=400+xOffset; const carW=52*scale, carH=20*scale;
        ctx.fillStyle="rgba(0,0,0,0.6)"; ctx.fillRect(x-carW/2+3, y+2, carW, carH/2);
        const bodyColor=p.teamIdx===0?"#e10600":`hsl(${p.teamIdx*36}, 85%, 60%)`;
        // Readable top-down single-seater silhouette: nose, cockpit, sidepods and rear wing.
        ctx.fillStyle=bodyColor; ctx.beginPath(); ctx.moveTo(x, y-carH/2-5*scale); ctx.lineTo(x+carW*.22,y-carH/2); ctx.lineTo(x+carW/2,y-carH*.18); ctx.lineTo(x+carW*.38,y+carH/2); ctx.lineTo(x-carW*.38,y+carH/2); ctx.lineTo(x-carW/2,y-carH*.18); ctx.lineTo(x-carW*.22,y-carH/2); ctx.closePath(); ctx.fill();
        ctx.fillStyle="#151922"; ctx.beginPath(); ctx.ellipse(x,y-carH*.08,carW*.16,carH*.24,0,0,7); ctx.fill();
        ctx.fillStyle="#111"; ctx.fillRect(x-carW*.48,y+carH*.28,carW*.96,2*scale); ctx.fillRect(x-carW*.48,y-carH*.42,carW*.96,2*scale);
        ctx.strokeStyle=p.teamIdx===0?"#fff":"rgba(255,255,255,.55)"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle="white"; ctx.font=`bold ${13*scale}px sans-serif`; ctx.textAlign="center"; ctx.fillText("P"+p.pos, x, y-carH/2-7*scale);
        ctx.font=`${10*scale}px sans-serif`; ctx.fillText(p.name.split(" ").pop(), x, y+carH/2+12*scale);
        if(p.drs){ ctx.fillStyle="#00ff00"; ctx.font=`bold ${9*scale}px sans-serif`; ctx.fillText("DRS", x+carW/2+7, y); }
        if(p.totalDamage>40){ ctx.fillStyle="rgba(100,100,100,0.45)"; ctx.beginPath(); ctx.arc(x-carW/2, y, 7*scale, 0, 7); ctx.fill(); }
        ctx.fillStyle=Engine.TYRES[p.tyre]?.color||"#ffcc00"; ctx.beginPath(); ctx.arc(x-carW/2+5*scale, y+carH/2, 5*scale, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x+carW/2-5*scale, y+carH/2, 5*scale, 0, 7); ctx.fill();
        if(idx>0&&displayCars[idx-1].gap&&displayCars[idx-1].gap<0.5){ ctx.fillStyle="#ffcc00"; ctx.font=`${11*scale}px sans-serif`; ctx.fillText("⚔️", x, y-carH); }
      });
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.textAlign="left"; ctx.fillText(`🏎️ RACE CAM — ${track.name} — Battle P${Math.max(1,playerPos-1)}-P${playerPos+1} — ${Team.T.teamName} [${Team.getCurrentSlotId?Team.getCurrentSlotId():""}]`, 10, 18);
      ctx.fillStyle="#00ff00"; ctx.font="10px sans-serif"; ctx.fillText(`DRS ${track.drsZones} zones · Fuel x${track.fuelUse} · Wear x${track.wear} · ${displayCars.length} cars — F1 Clash view`, 10, 32);
    }
    function drawTVCamera(positions){
      if(!ctx) return; ctx.clearRect(0,0,800,320); ctx.fillStyle="#0a0c10"; ctx.fillRect(0,0,800,320);
      ctx.strokeStyle="#2a3445"; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(20,40); ctx.lineTo(90,25); ctx.lineTo(160,25); ctx.lineTo(180,50); ctx.lineTo(160,75); ctx.lineTo(90,75); ctx.closePath(); ctx.stroke();
      positions.slice(0,10).forEach(p=>{ const angle=(p.pos/10)*Math.PI*2; const cx=100+Math.cos(angle)*40; const cy=50+Math.sin(angle)*18; ctx.fillStyle=p.teamIdx===0?"#e10600":`hsl(${p.teamIdx*36},70%,50%)`; ctx.beginPath(); ctx.arc(cx,cy,3.5,0,7); ctx.fill(); });
      const leader=positions.find(p=>p.pos===1);
      if(leader){
        ctx.fillStyle="#1c1f2a"; ctx.fillRect(220,30,380,220); ctx.strokeStyle=leader.teamIdx===0?"#e10600":`hsl(${leader.teamIdx*36},70%,50%)`; ctx.lineWidth=3; ctx.strokeRect(220,30,380,220);
        ctx.fillStyle=leader.teamIdx===0?"#e10600":`hsl(${leader.teamIdx*36},85%,60%)`; ctx.fillRect(330,90,160,70); ctx.fillStyle="#111"; ctx.fillRect(380,95,60,35);
        ctx.fillStyle="white"; ctx.font="bold 26px sans-serif"; ctx.textAlign="center"; ctx.fillText("P1 "+leader.name.split(" ").pop(), 410, 185);
        ctx.font="14px sans-serif"; ctx.fillText(`${leader.tyre.toUpperCase()} ${100-leader.wear}% | PU ${leader.pu}% | Fuel ${leader.fuel}% ${leader.drs?"DRS":""}`, 410, 205);
      }
      ctx.fillStyle="white"; ctx.font="bold 11px sans-serif"; ctx.textAlign="left"; ctx.fillText("INTERVALS — LIVE TIMING", 620, 35);
      positions.slice(0,10).forEach((p,i)=>{ ctx.font="10px sans-serif"; ctx.fillStyle=p.teamIdx===0?"#ffcc00":"#aaa"; ctx.fillText(`P${p.pos} ${p.name.split(" ").pop().slice(0,9)} +${p.gap?p.gap.toFixed(1)+"s":"LEAD"}`, 620, 50+i*18); });
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.fillText(`📺 TV — ${track.name} — LAP ${race.state.lap}/${track.laps} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}`, 10, 18);
    }
    function drawChaseCamera(positions){
      if(!ctx) return; const playerCar=positions.filter(p=>p.teamIdx===0).sort((a,b)=>a.pos-b.pos)[0]||positions[0];
      ctx.clearRect(0,0,800,320); const grad=ctx.createLinearGradient(0,0,0,320); grad.addColorStop(0,"#0a1a2a"); grad.addColorStop(1,"#1a2a3a"); ctx.fillStyle=grad; ctx.fillRect(0,0,800,320);
      ctx.fillStyle="#2a3445"; ctx.beginPath(); ctx.moveTo(0,320); ctx.lineTo(800,320); ctx.lineTo(500,90); ctx.lineTo(300,90); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="white"; ctx.lineWidth=2; ctx.setLineDash([16,16]); ctx.beginPath(); ctx.moveTo(400,90); ctx.lineTo(400,320); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle="#e10600"; ctx.fillRect(360,240,80,40); ctx.fillStyle="#111"; ctx.fillRect(380,244,40,20); ctx.fillStyle="white"; ctx.font="bold 11px sans-serif"; ctx.textAlign="center"; ctx.fillText(playerCar.name.split(" ").pop()+" P"+playerCar.pos, 400, 235);
      positions.filter(p=>p.pos<playerCar.pos).slice(0,4).forEach((p,i)=>{ const y=190-i*45; const scale=1-i*0.22; const x=400+(p.pos%2?-22:22); const w=64*scale, h=26*scale; ctx.fillStyle=`hsl(${p.teamIdx*36},80%,60%)`; ctx.fillRect(x-w/2, y-h/2, w, h); ctx.fillStyle="white"; ctx.font=`bold ${11*scale}px sans-serif`; ctx.fillText("P"+p.pos+" "+p.name.split(" ").pop(), x, y-h/2-5); });
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.textAlign="left"; ctx.fillText(`🎥 CHASE — Behind ${playerCar.name} P${playerCar.pos} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}`, 10, 18);
    }
    function drawOnboardCamera(positions){
      if(!ctx) return; const playerCar=positions.filter(p=>p.teamIdx===0)[0]||positions[0];
      ctx.clearRect(0,0,800,320); ctx.fillStyle="#0a0a0a"; ctx.fillRect(0,0,800,320);
      const curve=Math.sin(Date.now()/900)*35; ctx.fillStyle="#2a3445"; ctx.beginPath(); ctx.moveTo(0,320); ctx.lineTo(800,320); ctx.lineTo(400+curve+70, 70); ctx.lineTo(400+curve-70, 70); ctx.closePath(); ctx.fill();
      ctx.strokeStyle="#333"; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(400, 280, 75, Math.PI, 0); ctx.stroke(); ctx.fillStyle="#e10600"; ctx.beginPath(); ctx.arc(400, 280, 9, 0, 7); ctx.fill();
      ctx.fillStyle="#111"; ctx.fillRect(0,220,800,100); ctx.fillStyle="#00ff00"; ctx.font="bold 15px monospace"; ctx.textAlign="left"; ctx.fillText(`P${playerCar.pos} LAP ${race.state.lap}/${track.laps} ${playerCar.tyre.toUpperCase()} ${100-playerCar.wear}%`, 20, 240); ctx.fillText(`PU ${playerCar.pu}% FUEL ${playerCar.fuel}% ${playerCar.drs?"DRS":""}`, 20, 260);
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.fillText(`👁️ ONBOARD — ${playerCar.name} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${Team.T.teamName}`, 10, 18);
    }
    function drawHelicopterCamera(positions){
      if(!ctx) return; ctx.clearRect(0,0,800,320); ctx.fillStyle="#0a1a0a"; ctx.fillRect(0,0,800,320);
      ctx.strokeStyle="#2a3445"; ctx.lineWidth=32; ctx.beginPath(); ctx.moveTo(100,160); ctx.lineTo(200,70); ctx.lineTo(420,70); ctx.lineTo(620,70); ctx.lineTo(720,160); ctx.lineTo(620,250); ctx.lineTo(420,250); ctx.lineTo(200,250); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle="rgba(255,255,255,0.06)"; ctx.lineWidth=1; for(let i=0;i<800;i+=40){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,320); ctx.stroke(); } for(let i=0;i<320;i+=40){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(800,i); ctx.stroke(); }
      positions.forEach(p=>{ const angle=(p.pos/20)*Math.PI*2; const r=100+(p.teamIdx*6); const cx=410+Math.cos(angle)*r; const cy=160+Math.sin(angle)*r*0.65; ctx.fillStyle=p.teamIdx===0?"#e10600":`hsl(${p.teamIdx*36},80%,60%)`; ctx.beginPath(); ctx.arc(cx,cy,6,0,7); ctx.fill(); ctx.fillStyle="white"; ctx.font="7px sans-serif"; ctx.textAlign="center"; ctx.fillText(p.pos,cx,cy+2); });
      ctx.fillStyle="white"; ctx.font="bold 12px sans-serif"; ctx.textAlign="left"; ctx.fillText(`🚁 HELICOPTER — ${track.name} — All 20 cars — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}`, 10, 18);
    }
    function drawTrack(positions){
      // One dependable view: the entire circuit is always visible.
      drawFullTrack(positions);
    }
    function updateDriverPanels(positions){
      myTeam.drivers.forEach((d,idx)=>{
        const p=positions.find(x=>x.id===d.id); if(!p) return; const panel=$(`#dcp-${idx}`); if(!panel) return;
        panel.querySelector(".dcp-pos").textContent=`P${p.pos}`; panel.querySelector(".tyre-wear-circle").textContent=`${100-p.wear}%`;
        const wearEl=panel.querySelector(".tyre-wear-circle"); wearEl.className="tyre-wear-circle "+(p.wear<50?"good":p.wear<75?"mid":"bad");
        panel.querySelector(".pu-fill").style.width=`${p.pu}%`; const fuelEl=panel.querySelector(".fuel-fill"); if(fuelEl) fuelEl.style.width=`${p.fuel}%`;
        panel.querySelector(".dcp-tyre-badge").className=`badge badge-${p.tyre}`; panel.querySelector(".dcp-tyre-badge").textContent=p.tyre[0].toUpperCase();
        const drsEl=panel.querySelector(".drs-indicator"); if(drsEl) drsEl.style.display=p.drs?"inline":"none";
        const dmgEl=panel.querySelector(".damage-indicator"); if(dmgEl){ dmgEl.textContent=p.totalDamage>0?`⚠️${p.totalDamage}% dmg`:"✅ No dmg"; dmgEl.style.color=p.totalDamage>30?"var(--red)":p.totalDamage>0?"var(--gold)":"var(--green)"; }
        const sectorEl=panel.querySelector(".sector-times"); if(sectorEl&&p.sectors){ sectorEl.textContent=`S1 ${p.sectors[0]?.time?.toFixed(2)||"--"} S2 ${p.sectors[1]?.time?.toFixed(2)||"--"} S3 ${p.sectors[2]?.time?.toFixed(2)||"--"}`; }
      });
    }
    function showPitModal(carId){
      const car=race.cars.find(c=>c.id===carId); if(!car) return; clearInterval(timer);
      const modal=document.createElement("div"); modal.className="modal-overlay";
      const damageList=Object.entries(car.damage).filter(([k,v])=>v>0).map(([k,v])=>{ const dt=Engine.DAMAGE_TYPES[k]; return `<div style="display:flex;justify-content:space-between;background:rgba(255,0,0,.1);border:1px solid rgba(255,0,0,.3);border-radius:6px;padding:6px;margin-bottom:4px"><span>${dt.icon} ${dt.label} ${v}%</span><span>Repair +${dt.repair.toFixed(1)}s</span></div>`; }).join("") || `<div style="color:var(--green);font-size:11px">✅ No damage — clean!</div>`;
      const totalRepair=Object.entries(car.damage).reduce((sum,[k,v])=>{ const dt=Engine.DAMAGE_TYPES[k]; return sum+(v>0?dt.repair*(v/100):0); },0);
      modal.innerHTML=`<div class="modal-clash"><div class="modal-header"><div class="modal-title">PIT — ${car.driver.name} — ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><button class="modal-close" id="closePit">✕</button></div><div style="padding:12px"><div style="font-size:11px;color:var(--muted);margin-bottom:8px">Current: ${car.tyre} ${Math.round(car.tyreWear)}% worn · PU ${Math.round(car.pu)}% · Fuel ${Math.round(car.fuel)}% · Damage ${Math.round(car.totalDamage)}%</div><div style="background:var(--bg2);border-radius:8px;padding:10px;margin-bottom:12px"><div style="font-weight:800;font-size:11px;margin-bottom:6px">🔧 DAMAGE</div>${damageList}<div style="margin-top:8px;font-size:11px;font-weight:800">Total Repair: +${totalRepair.toFixed(1)}s</div><label style="display:flex;align-items:center;gap:8px;margin-top:8px;font-size:11px"><input type="checkbox" id="repairDamageCheck" ${car.totalDamage>20?"checked":""}> <span>🔧 REPAIR ALL DAMAGE (+${totalRepair.toFixed(1)}s)</span></label></div>${Object.entries(Engine.TYRES).map(([id,t])=>`<div class="tyre-option" data-pit-tyre="${id}"><div class="tyre-icon-big" style="background:${t.color};color:${id==="medium"||id==="hard"?"#000":"#fff"}">${t.short}</div><div class="tyre-details"><div class="tyre-name">${t.label}</div><div class="tyre-desc">${t.desc}</div></div></div>`).join("")}<div style="padding:12px;display:flex;gap:8px"><button class="btn-clash btn-dark" id="cancelPit" style="flex:1">CANCEL</button><button class="btn-clash btn-blue" id="confirmPit" style="flex:1" disabled>SELECT TYRE</button></div></div></div>`;
      document.body.appendChild(modal); let selected=null;
      modal.querySelectorAll("[data-pit-tyre]").forEach(el=>el.onclick=()=>{ modal.querySelectorAll("[data-pit-tyre]").forEach(x=>x.classList.remove("selected")); el.classList.add("selected"); selected=el.dataset.pitTyre; modal.querySelector("#confirmPit").disabled=false; });
      function close(){ modal.remove(); runClock(); } modal.querySelector("#closePit").onclick=close; modal.querySelector("#cancelPit").onclick=close; modal.onclick=(e)=>{ if(e.target===modal) close(); };
      modal.querySelector("#confirmPit").onclick=()=>{
        if(!selected) return; const repair=modal.querySelector("#repairDamageCheck")?.checked||false;
        race.decide([{carId,pit:true,tyre:selected,repair}]); addTicker(`🔧 PIT: ${car.driver.name} → ${selected}`, "pit"); modal.remove(); runClock();
      };
    }
    function endRace(){
      if(over) return; over=true; clearInterval(timer); const res=race.result(); const won=res.winner===0;
      const prize=won?2:0.4;
      Team.T.budget=Math.round((Team.T.budget+prize)*10)/10; Team.T.research.points+=won?25:10;
      Team.T.materials.carbon+=won?30:12; Team.T.materials.alloy+=won?25:10; Team.T.materials.electronics+=won?15:6;
      if(won){ const bId=Object.keys(Engine.BOOSTS)[Math.floor(Math.random()*6)]; Team.T.boostInventory[bId]=(Team.T.boostInventory[bId]||0)+1; Team.addPitPassXP(25); }
      res.finishingOrder.forEach(f=>{ if(f.totalDamage>0){ Team.addDamageRecord({ track:track.name, lap:track.laps, driver:f.name, damageType:Object.keys(f.damage||{}).filter(k=>f.damage[k]>0).join(","), amount:Math.round(f.totalDamage), reason:"Race damage", timestamp:Date.now() }); } });
      let sponsorCredits=0, sponsorXP=0; const sponsorDone=res.sponsorResults||[]; sponsorDone.forEach(s=>{ sponsorCredits+=s.reward.credits||0; sponsorXP+=s.reward.xp||0; if(s.reward.bucks) Team.T.bucks+=s.reward.bucks; if(s.reward.boost) Team.T.boostInventory[s.reward.boost]=(Team.T.boostInventory[s.reward.boost]||0)+1; });
      Team.T.budget=Math.round((Team.T.budget+sponsorCredits)*10)/10; Team.addPitPassXP(sponsorXP); Team.T.sponsors.completed+=sponsorDone.length; Team.T.sponsors.creditsEarned+=sponsorCredits;
      if(isFullGrid){ res.finishingOrder.forEach((f,i)=>{ if(f.teamIdx===0){ Team.T.championship.history.push({ race:Team.T.race+1, track:track.name, pos:f.pos, points:f.points, raceType }); Team.T.wins+=f.pos<=3?1:0; } }); Team.updateConstructorsStandings(res); Team.T.race++; if(Team.T.race>=18){ Team.T.season++; Team.T.race=0; Team.T.wins=0; } } else { Team.T.wins+=won?1:0; Team.T.flags+=1; Team.T.race++; if(Team.T.race>=18){ Team.T.season++; Team.T.race=0; Team.T.wins=0; } }
      Team.T.club.reputation+=won?15:3; Team.updateCollectionScore(); Team.T.weekend={ stage:"idle", track:null, raceType:null, practiceResults:{}, qualiResult:null, setupBonus:{ setup:0, quali:0, race:0, tyre:0 } }; Team.save();
      const modal=document.createElement("div"); modal.className="modal-overlay"; modal.innerHTML=`<div class="modal-clash"><div style="padding:20px;text-align:center"><div style="font-size:48px">${won?"🏆":"😤"}</div><div style="font-weight:900;font-size:20px;margin-top:8px">${won?"VICTORY":"DEFEAT"} — ${Engine.RACE_TYPES[raceType].name} — Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div style="font-size:13px;color:var(--muted);margin-top:4px">${track.name} · ${Team.T.teamName} · Fastest ${res.fastestLap.driver} ${res.fastestLap.time.toFixed(3)}s</div><div style="margin-top:12px;text-align:left;background:var(--bg2);border-radius:8px;padding:10px;max-height:200px;overflow-y:auto">${res.finishingOrder.slice(0,10).map(f=>`<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;${f.teamIdx===0?"color:var(--gold);font-weight:800":""}"><span>P${f.pos} ${f.name}</span><span style="font-weight:800">${f.points} pts</span></div>`).join("")}</div><button class="btn-clash btn-red" id="finishRaceBtn" style="margin-top:12px">CONTINUE →</button></div></div>`;
      document.body.appendChild(modal); modal.querySelector("#finishRaceBtn").onclick=()=>{ modal.remove(); render(raceHub); };
    }
    function step(){
      const s=race.step(); if(s.positions){ updateLeaderboard(s.positions); drawTrack(s.positions); updateDriverPanels(s.positions); }
      $("#lapCounter").textContent=`LAP ${s.lap}/${track.laps} ${s.drsEnabled?"· DRS":""} ${s.safetyCar?"· SC":s.vsc?"· VSC":s.redFlag?"· RED FLAG":""} · S${s.sectorInLap} ${track.sectors[s.sectorInLap-1]?.name||""} · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}`;
      for(const ev of s.events){
        if(ev.type==="overtake"){ addTicker(`⚔️ ${ev.attName||ev.att||"Car"} ${ev.drs?"[DRS] ":""}→ P${race.cars.find(c=>c.id===ev.attacker)?.position||"?"} L${ev.lap||"?"}`, "overtake"); if(cameraAuto&&ev.drs){ cameraMode="race"; updateCameraButtons(); } }
        if(ev.type==="pit"){ addTicker(`🔧 ${ev.driver} → ${ev.tyre} L${ev.lap}`, "pit"); if(cameraAuto){ cameraMode="tv"; updateCameraButtons(); } }
        if(ev.type==="safetyCarOut"){ addTicker(`🚨 SAFETY CAR L${ev.lap}`, "sc"); $("#scBanner").textContent=`SAFETY CAR — ${ev.reason}`; $("#scBanner").classList.remove("hidden"); if(cameraAuto){ cameraMode="full"; updateCameraButtons(); } }
        if(ev.type==="safetyCarIn"){ addTicker(`🟢 SAFETY CAR IN L${ev.lap}`, "sc"); $("#scBanner").classList.add("hidden"); }
        if(ev.type==="redFlag"){ addTicker(`🔴 RED FLAG L${ev.lap}`, "sc"); $("#scBanner").textContent="RED FLAG"; $("#scBanner").style.background="var(--red)"; $("#scBanner").classList.remove("hidden"); if(cameraAuto){ cameraMode="helicopter"; updateCameraButtons(); } }
      }
      if(s.decision){ const critical=s.decision.cars[0]; if(critical&&(critical.wear>85||critical.fuel<20||critical.totalDamage>40)){ showPitModal(critical.id); return; } }
      if(s.done) endRace();
    }
    function updateCameraButtons(){ /* Camera switching removed: full track is the only race view. */ }
    function runClock(){ clearInterval(timer); timer=setInterval(step, speed===1?6000:speed===2?3000:1000); }
    $$("[data-pace]").forEach(btn=>btn.onclick=()=>{ const idx=+btn.dataset.idx; const pace=btn.dataset.pace; myInstructions[idx]=pace; myTeam.drivers.forEach((d,i)=>{ const car=race.cars.find(c=>c.id===d.id); if(car&&i===idx) car.instruction=pace; }); const panel=$(`#dcp-${idx}`); panel.querySelectorAll(".pace-btn").forEach(b=>b.className="pace-btn"); btn.classList.add(`active-${pace}`); });
    $$("[data-pit]").forEach(btn=>btn.onclick=()=>showPitModal(+btn.dataset.pit));
    $$("[data-speed]").forEach(btn=>btn.onclick=()=>{ speed=+btn.dataset.speed; $$("[data-speed]").forEach(b=>b.classList.remove("active-standard")); btn.classList.add("active-standard"); if(timer) runClock(); });

    updateCameraButtons();
    addTicker(`🏁 ${Engine.RACE_TYPES[raceType].icon} ${Engine.RACE_TYPES[raceType].name} at ${track.name}! Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${Team.T.teamName}`, "");
    runClock();
  },0);
  return `<div class="race-screen simple-race"><div class="race-topbar"><div class="race-top-left"><div class="lap-counter" id="lapCounter">LAP 1/${track.laps} ${Engine.RACE_TYPES[raceType].icon} ${Engine.RACE_TYPES[raceType].name} · ${Team.getCurrentSlotId?Team.getCurrentSlotId():""}</div><div class="safety-car-banner hidden" id="scBanner">SAFETY CAR</div></div><div style="display:flex;gap:6px;align-items:center"><div class="weather-widget"><span class="weather-icon">☀️</span><span>22°C</span><span style="color:var(--muted)">Dry</span></div><div style="display:flex;gap:4px"><button class="pace-btn active-standard" data-speed="1" style="padding:4px 8px;font-size:10px">1x</button><button class="pace-btn" data-speed="2" style="padding:4px 8px;font-size:10px;background:var(--medium);color:#000">2x</button><button class="pace-btn" data-speed="3" style="padding:4px 8px;font-size:10px">3x</button></div></div></div>
  <div style="background:var(--panel);border-bottom:1px solid var(--line);padding:8px 10px;display:flex;align-items:center;justify-content:space-between">
    <span style="font-weight:900;font-size:11px">🗺️ FULL TRACK</span><span style="font-size:10px;color:var(--muted)">All cars · Your battle is highlighted</span>
  </div>
  <div style="background:var(--bg2);padding:6px 10px;font-size:10px;color:var(--muted);border-bottom:1px solid var(--line)">Strategy view · Slot ${Team.getCurrentSlotId?Team.getCurrentSlotId():""} ${Team.T.teamName}</div>
  <div class="race-main"><div class="leaderboard" id="leaderboard"></div><div class="track-view"><canvas class="track-canvas" id="trackCanvas" style="width:100%;height:320px;background:#0a0c10;border-radius:8px"></canvas><div class="race-ticker" id="raceTicker"></div></div></div><div class="drivers-control">${myTeam.drivers.map((d,i)=>`<div class="driver-control-panel" id="dcp-${i}"><div class="dcp-header"><span class="dcp-name">${d.name.split(" ").pop()} <span class="drs-indicator" style="display:none;background:var(--green);color:#000;padding:1px 4px;border-radius:4px;font-size:8px">DRS</span> <span class="damage-indicator" style="font-size:8px">✅ No dmg</span></span><span class="dcp-pos">P${i+1}</span></div><div class="dcp-stats"><div style="display:flex;flex-direction:column;align-items:center"><div class="tyre-wear-circle good">100%</div><div class="dcp-stat-label">Tyre</div></div><div style="flex:1"><div class="dcp-stat-label">PU <span class="badge badge-${myTeam.tyre[i]} dcp-tyre-badge" style="float:right">${myTeam.tyre[i][0].toUpperCase()}</span></div><div class="pu-bar"><div class="pu-fill" style="width:100%"></div></div><div class="dcp-stat-label" style="margin-top:4px">FUEL</div><div class="pu-bar" style="background:#1a1a1a"><div class="fuel-fill" style="width:100%;height:100%;background:linear-gradient(90deg, #ff8c00, #ffcc00);border-radius:3px"></div></div><div class="dcp-stat-label sector-times" style="margin-top:4px;font-size:9px">S1 -- S2 -- S3 --</div></div></div><div class="pace-buttons"><div class="pace-btn ${myInstructions[i]==="push"?"active-push":""}" data-pace="push" data-idx="${i}"><span class="ico">⏩</span>Push</div><div class="pace-btn ${myInstructions[i]==="standard"?"active-standard":""}" data-pace="standard" data-idx="${i}"><span class="ico">▶️</span>Std</div><div class="pace-btn ${myInstructions[i]==="conserve"?"active-conserve":""}" data-pace="conserve" data-idx="${i}"><span class="ico">⏸️</span>Save</div></div><button class="pit-btn" data-pit="${d.id}">PIT NOW + REPAIR</button></div>`).join("")}</div></div>`;
}
function createTeamScreen(){
  let region="britain";
  const existingSlots = Team.getSaveSlots ? Team.getSaveSlots() : [];
  const canCreate = Team.canCreateSlot ? Team.canCreateSlot() : true;
  setTimeout(()=>{
    $$("[data-reg]").forEach(o=>o.onclick=()=>{ region=o.dataset.reg; $$("[data-reg]").forEach(x=>x.classList.toggle("selected", x.dataset.reg===region)); });
    $("#createBtn").onclick=()=>{
      const name=($("#teamNameInput").value||"").trim()||"Zero Racing";
      if(!canCreate && existingSlots.length>=Team.MAX_SLOTS){
        toast(`⚠️ Max ${Team.MAX_SLOTS} teams reached — delete one in My Teams`);
        return;
      }
      const newId = Team.newSave(region, name);
      if(newId){
        toast(`✅ Created ${name} as ${newId} — ${existingSlots.length+1}/${Team.MAX_SLOTS} accounts`);
        render(raceHub);
        setTimeout(()=>showTutorial(),120);
      } else {
        toast("Failed to create — max slots reached");
        render(saveSlotsScreen);
      }
    };
    $("#viewSlotsBtn")?.addEventListener("click", ()=>render(saveSlotsScreen));
  },0);
  return `<div style="height:100%;display:flex;flex-direction:column;background:var(--bg)"><div class="topbar-clash"><div class="logo-clash"><span>F1</span><b>ZERO ULTIMATE+</b> — ${existingSlots.length}/${Team.MAX_SLOTS||5} ACCOUNTS — MULTI-SAVE TEMP</div></div><div class="main-content" style="padding:16px;display:flex;flex-direction:column;gap:16px"><div style="text-align:center;padding:20px 0"><div style="font-size:48px">🏁</div><h1 style="font-weight:900;font-size:22px;margin-top:8px">FOUND YOUR TEAM — ${existingSlots.length>0?`NEW ACCOUNT #${existingSlots.length+1}`:"FIRST TEAM"} — V5.2 MULTI-SAVE</h1><p style="font-size:12px;color:var(--muted);margin-top:4px">100% original · ${existingSlots.length} existing teams · Up to ${Team.MAX_SLOTS||5} accounts (hard 10) · Each slot independent career · Will be replaced by Google Play cloud saves</p><p style="font-size:11px;color:var(--green);margin-top:4px">✓ No crates · ✓ No F1 IP · ✓ Honest sim · ✓ simple race · ✓ Multi-account temp</p></div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px"><label style="font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)">Team Name — Original Only — Slot ${existingSlots.length+1}/${Team.MAX_SLOTS||5}</label><input id="teamNameInput" type="text" placeholder="Zero Racing" value="Zero Racing ${existingSlots.length+1}" style="width:100%;margin-top:6px;padding:12px;border-radius:8px;background:var(--bg2);border:1px solid var(--line);color:white;font-weight:700"/><div style="margin-top:14px"><label style="font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)">Home Region — Fictional Pools</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">${Object.entries(Engine.REGIONS).map(([id,r])=>`<div class="car-component-slot ${id==="britain"?"selected":""}" data-reg="${id}" style="position:static;width:auto;height:auto;padding:10px;flex-direction:row;gap:8px"><span style="font-size:18px">${r.flag}</span><span style="font-size:11px;font-weight:700">${r.label}</span></div>`).join("")}</div></div><button class="btn-clash ${canCreate?"btn-red":"btn-dark"}" id="createBtn" style="margin-top:16px" ${!canCreate?"disabled":""}>${canCreate?`🏁 FOUND TEAM → SLOT ${existingSlots.length+1}/${Team.MAX_SLOTS||5} — ${existingSlots.length>0?"NEW ACCOUNT":"FIRST TEAM"}`:`⚠️ MAX ${Team.MAX_SLOTS||5} TEAMS — DELETE ONE`}</button>${existingSlots.length>0?`<button class="btn-clash btn-dark" id="viewSlotsBtn" style="margin-top:8px">👥 VIEW MY ${existingSlots.length} EXISTING TEAMS</button>`:""}</div><div style="background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px"><div style="font-weight:800;font-size:12px">V5.2 — MULTI-ACCOUNT + SIMPLE RACE — TEMP LOCAL</div><div style="font-size:11px;color:var(--muted);margin-top:6px">
<b>NEW V5.2 Multiple Accounts (TEMP):</b><br>
• Up to ${Team.MAX_SLOTS||5} local save slots (hard limit 10) — each is independent team like multiple accounts in F1 Clash<br>
• Slot IDs: slot_1, slot_2, etc — stored as ${Team.SLOT_DATA_PREFIX||"f1Zero_SlotData_"}+ID + index ${Team.SLOTS_INDEX_KEY||"f1Zero_SaveSlots_Index_"}<br>
• Create new team → new slot, Play loads slot as current, Rename/Copy/Export/Delete per slot<br>
• Existing ${existingSlots.length} teams: ${existingSlots.map(s=>`${s.id} ${s.teamName} S${s.series} ${s.short}`).join(", ")||"none"}<br>
• Later removed for Google Play Games cloud saves — code marked TEMP LOCAL for easy removal<br><br>
<b>V5.1 Cameras:</b> Full Track (map) + Race Cam (F1 Clash main) + TV + Chase + Onboard + Helicopter, auto cam ON
</div></div></div></div>`;
}

// ===== STARTUP WITH SLOTS =====
try{
  Team.load();
  if(Team.T){
    render(raceHub);
  } else {
    const slots = Team.getSaveSlots ? Team.getSaveSlots() : [];
    if(slots.length>0) render(saveSlotsScreen);
    else render(createTeamScreen);
  }
}catch(err){
  console.error("F1 Legends startup failed", err);
  const app=$("#app");
  if(app) app.innerHTML=`<div style="min-height:100vh;background:#0c0e12;color:#fff;padding:24px;font-family:Inter,system-ui,sans-serif"><h2 style="color:#ff5252">F1 Legends failed to start</h2><p style="color:#aeb4c5">Reload the app to try again. Your saved team has not been deleted.</p><button id="reloadStartupBtn" style="padding:12px 16px;background:#e10600;border:0;border-radius:8px;color:#fff;font-weight:800">RELOAD APP</button></div>`;
  $("#reloadStartupBtn")?.addEventListener("click",()=>location.reload());
}

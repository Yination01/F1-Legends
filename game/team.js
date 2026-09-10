"use strict";
// F1 ZERO v5.1 — MULTIPLE SAVE SLOTS (TEMP LOCAL — WILL BE REPLACED BY GOOGLE PLAY SAVES)
// Supports up to MAX_SLOTS local accounts for testing multiple careers
// Structure: Index holds metadata, each slot data stored separately

const TEAM_KEY = "f1Zero_Team_v5"; // legacy single save, kept for migration
const SLOTS_INDEX_KEY = "f1Zero_SaveSlots_Index_v5_1";
const SLOT_DATA_PREFIX = "f1Zero_SlotData_v5_1_";
const MAX_SLOTS = 5; // 5 accounts for now, easy to expand to 8/10

let T = null;
let currentSlotId = null;
const E = typeof Engine !== "undefined" ? Engine : (typeof require !== "undefined" ? require("./engine.js") : null);

const SERIES = [
  { id:1, name:"Series 1 — Rookie", str:60, prize:1.5, tracks:["ashworth","beaumont","castelmar"], unlock:["common"] },
  { id:2, name:"Series 2 — Club", str:64, prize:2.0, tracks:["ashworth","beaumont","castelmar","vikstad"], unlock:["common","rare"] },
  { id:3, name:"Series 3 — Pro", str:68, prize:2.8, tracks:["vikstad","torresol","sakuradai","zanari"], unlock:["common","rare"] },
  { id:4, name:"Series 4 — Contender", str:72, prize:3.5, tracks:["torresol","sakuradai","zanari","rioverde"], unlock:["rare"] },
  { id:5, name:"Series 5 — Challenger", str:76, prize:4.5, tracks:["rioverde","kanzaki","novagrad","harbourfront"], unlock:["rare","epic"] },
  { id:6, name:"Series 6 — Elite", str:80, prize:6.0, tracks:["kanzaki","novagrad","harbourfront","desertvista"], unlock:["epic"] },
  { id:7, name:"Series 7 — Masters", str:84, prize:8.0, tracks:["desertvista","sunset","coastal","mountain"], unlock:["epic"] },
  { id:8, name:"Series 8 — Legends", str:88, prize:10.0, tracks:["coastal","mountain","lakeside","dunes"], unlock:["epic","legendary"] },
  { id:9, name:"Series 9 — Champions", str:90, prize:12.0, tracks:["bayfront","neon","highlands","valley"], unlock:["legendary"] },
  { id:10, name:"Series 10 — Hall of Fame", str:93, prize:15.0, tracks:["pacific","lagoon","aurora","ashworth","beaumont","castelmar","vikstad","torresol"], unlock:["legendary"] }
];

function fmtM(x){ return (x>=1?x.toFixed(1)+"M":Math.round(x*1000)+"K")+" CR"; }
function fmtB(x){ return x+" Bucks"; }

// ===== SLOTS INDEX MANAGEMENT =====
function loadSlotsIndex(){
  try{
    const raw = localStorage.getItem(SLOTS_INDEX_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      if(parsed && parsed.slots) return parsed;
    }
  }catch(e){ console.warn("Failed to load slots index", e); }
  return { slots: {}, currentSlot: null, version: 1 };
}
function saveSlotsIndex(idx){
  try{ localStorage.setItem(SLOTS_INDEX_KEY, JSON.stringify(idx)); }catch(e){ console.warn("Failed to save slots index", e); }
}
function loadSlotData(slotId){
  try{
    const raw = localStorage.getItem(SLOT_DATA_PREFIX+slotId);
    if(raw) return JSON.parse(raw);
  }catch(e){ console.warn("Failed to load slot data", slotId, e); }
  return null;
}
function saveSlotData(slotId, data){
  try{
    localStorage.setItem(SLOT_DATA_PREFIX+slotId, JSON.stringify(data));
    // Also mirror to legacy TEAM_KEY if this is current slot for backward compat
    if(slotId === currentSlotId){
      try{ localStorage.setItem(TEAM_KEY, JSON.stringify(data)); }catch(e){}
    }
    return true;
  }catch(e){
    console.warn("Failed to save slot data", slotId, e);
    return false;
  }
}
function generateSlotId(){
  const idx = loadSlotsIndex();
  // Find first free slot_1 .. slot_MAX
  for(let i=1;i<=MAX_SLOTS;i++){
    const id = `slot_${i}`;
    if(!idx.slots[id]) return id;
  }
  // If all occupied, generate slot_{n+1}
  let n = MAX_SLOTS+1;
  while(idx.slots[`slot_${n}`]) n++;
  return `slot_${n}`;
}
function buildPreviewFromT(teamData){
  if(!teamData) return null;
  const region = E && E.REGIONS ? E.REGIONS[teamData.region] : { flag:"🏁", label:teamData.region };
  return {
    id: null, // filled later
    teamName: teamData.teamName,
    short: teamData.short,
    region: teamData.region,
    flag: region ? region.flag : "🏁",
    regionLabel: region ? region.label : teamData.region,
    series: teamData.series,
    seriesName: SERIES[teamData.series-1]?.name || `Series ${teamData.series}`,
    season: teamData.season,
    race: teamData.race,
    level: teamData.pitPass?.level || 1,
    score: (()=>{ try{ return E.teamScore({drivers:teamData.lineup.drivers.map(id=>teamData.squad.drivers.find(d=>d.id===id)).filter(Boolean), components:Object.fromEntries(Object.entries(teamData.lineup.components).map(([k,id])=>[k, Object.values(teamData.squad.components).find(c=>c.id===id)||teamData.squad.components[k]]))}); }catch(e){ return teamData.collection?.score||0; } })(),
    wins: teamData.wins||0,
    flags: teamData.flags||0,
    budget: teamData.budget||0,
    bucks: teamData.bucks||0,
    col1: teamData.livery?.col1 || teamData.col1 || "#e10600",
    col2: teamData.livery?.col2 || teamData.col2 || "#ffffff",
    pattern: teamData.livery?.pattern || "solid",
    created: teamData.created || Date.now(),
    lastPlayed: Date.now(),
    drivers: (teamData.squad?.drivers||[]).slice(0,2).map(d=>({ name:d.name, ovr:d.ovr, rarity:d.rarity })),
    collectionScore: teamData.collection?.score||0
  };
}
function updateSlotPreviewInIndex(slotId, teamData){
  const idx = loadSlotsIndex();
  const preview = buildPreviewFromT(teamData);
  if(!preview) return;
  preview.id = slotId;
  preview.lastPlayed = Date.now();
  if(idx.slots[slotId]){
    preview.created = idx.slots[slotId].created || teamData.created || Date.now();
  } else {
    preview.created = teamData.created || Date.now();
  }
  idx.slots[slotId] = preview;
  if(!idx.currentSlot) idx.currentSlot = slotId;
  saveSlotsIndex(idx);
}

// ===== LEGACY MIGRATION =====
function migrateLegacySingleSave(){
  try{
    const legacyRaw = localStorage.getItem(TEAM_KEY);
    if(!legacyRaw) return null;
    const legacyData = JSON.parse(legacyRaw);
    if(!legacyData || !legacyData.teamName) return null;
    const idx = loadSlotsIndex();
    // If index already has slots, don't auto-migrate to avoid duplication, but ensure legacy slot exists as slot_1 if empty
    if(Object.keys(idx.slots).length>0) return null;
    // Create slot_1 from legacy
    const slotId = "slot_1";
    legacyData.created = legacyData.created || Date.now();
    legacyData.lastPlayed = Date.now();
    saveSlotData(slotId, legacyData);
    const preview = buildPreviewFromT(legacyData);
    preview.id = slotId;
    preview.created = legacyData.created;
    preview.lastPlayed = Date.now();
    idx.slots[slotId] = preview;
    idx.currentSlot = slotId;
    saveSlotsIndex(idx);
    console.log("Migrated legacy save to", slotId);
    return slotId;
  }catch(e){ console.warn("Migration failed", e); return null; }
}

// ===== CORE TEAM FUNCTIONS (with slots) =====
function teamSave(){
  if(!T) return;
  // If no currentSlotId, try to get from index or create
  if(!currentSlotId){
    const idx = loadSlotsIndex();
    if(idx.currentSlot){
      currentSlotId = idx.currentSlot;
    } else {
      // No slot yet, create one
      const newId = generateSlotId();
      currentSlotId = newId;
      T.created = T.created || Date.now();
    }
  }
  T.lastPlayed = Date.now();
  saveSlotData(currentSlotId, T);
  updateSlotPreviewInIndex(currentSlotId, T);
  // Update currentSlot in index
  const idx = loadSlotsIndex();
  idx.currentSlot = currentSlotId;
  saveSlotsIndex(idx);
}

function teamLoad(){
  try{
    // First try to load slots index
    let idx = loadSlotsIndex();
    // If no slots, try migrate legacy
    if(Object.keys(idx.slots).length===0){
      const migrated = migrateLegacySingleSave();
      if(migrated){
        idx = loadSlotsIndex(); // reload after migration
      }
    }
    // If still no slots, check for v4 legacy
    if(Object.keys(idx.slots).length===0){
      try{
        const v4=localStorage.getItem("f1Zero_Team_v4");
        if(v4){
          const v4Data = JSON.parse(v4);
          if(v4Data && v4Data.teamName){
            const slotId = "slot_1";
            v4Data.created = v4Data.created || Date.now();
            saveSlotData(slotId, v4Data);
            const preview = buildPreviewFromT(v4Data);
            preview.id = slotId;
            preview.created = v4Data.created;
            preview.lastPlayed = Date.now();
            idx.slots[slotId]=preview;
            idx.currentSlot=slotId;
            saveSlotsIndex(idx);
          }
        }
      }catch(e){}
    }

    if(idx.currentSlot && idx.slots[idx.currentSlot]){
      const data = loadSlotData(idx.currentSlot);
      if(data){
        T = data;
        currentSlotId = idx.currentSlot;
      } else {
        // Data missing, try another slot
        const firstSlotId = Object.keys(idx.slots)[0];
        if(firstSlotId){
          const fallbackData = loadSlotData(firstSlotId);
          if(fallbackData){
            T = fallbackData;
            currentSlotId = firstSlotId;
            idx.currentSlot = firstSlotId;
            saveSlotsIndex(idx);
          }
        }
      }
    } else if(Object.keys(idx.slots).length>0){
      // No current set, pick most recent
      const sorted = Object.values(idx.slots).sort((a,b)=>b.lastPlayed-a.lastPlayed);
      const mostRecent = sorted[0];
      if(mostRecent){
        const data = loadSlotData(mostRecent.id);
        if(data){
          T = data;
          currentSlotId = mostRecent.id;
          idx.currentSlot = mostRecent.id;
          saveSlotsIndex(idx);
        }
      }
    }
  }catch(e){
    console.warn("teamLoad failed", e);
    T=null;
    currentSlotId=null;
  }

  // Fallback to legacy single key if slots failed
  if(!T){
    try{
      const d=localStorage.getItem(TEAM_KEY);
      if(d) {
        T=JSON.parse(d);
        currentSlotId = "slot_1";
        // Create index for it
        const idx = loadSlotsIndex();
        if(!idx.slots[currentSlotId]){
          const preview = buildPreviewFromT(T);
          preview.id = currentSlotId;
          preview.created = T.created || Date.now();
          idx.slots[currentSlotId]=preview;
          idx.currentSlot=currentSlotId;
          saveSlotsIndex(idx);
          saveSlotData(currentSlotId, T);
        }
      }
    }catch(e){ T=null; }
  }

  if(T){
    // Ensure defaults (same as before)
    if(T.bucks===undefined) T.bucks=75;
    if(T.research===undefined) T.research={ points:100, level:1 };
    if(T.materials===undefined) T.materials={ carbon:200, alloy:200, electronics:120 };
    if(T.boosts===undefined) T.boosts={ focus:5, aero:3, power:3, grip:2, endurance:2, warrior:1, phantom:0, titan:0 };
    if(T.boostInventory===undefined) T.boostInventory=Object.assign({}, T.boosts);
    if(T.pitPass===undefined) T.pitPass={ level:1, xp:0, premium:false, rewardsClaimed:[] };
    if(T.collection===undefined) T.collection={ score:0, driversOwned:0, componentsOwned:0 };
    if(T.club===undefined) T.club={ name:"", reputation:0, level:1, members:1 };
    if(T.spinner===undefined) T.spinner={ lastSpin:0, streak:0 };
    if(T.livery===undefined) T.livery={ col1:"#e10600", col2:"#ffffff", pattern:"solid" };
    if(T.championship===undefined) T.championship={ standings:[], driverStandings:[], season:1, race:0 };
    if(T.raceTypes===undefined) T.raceTypes={ duel:{ wins:0 }, grandprix:{ wins:0, points:0 }, sprint:{ wins:0 }, endurance:{ wins:0 }, timetrial:{ best:999 } };
    if(T.practice===undefined) T.practice={};
    if(T.setup===undefined) T.setup={};
    if(T.ghosts===undefined) T.ghosts={};
    if(T.timeTrial===undefined) T.timeTrial={};
    if(T.sponsors===undefined) T.sponsors={ tasks:[], completed:0, creditsEarned:0 };
    if(T.constructors===undefined) T.constructors={ standings:[], history:[] };
    if(T.weekend===undefined) T.weekend={ stage:"idle", track:null, raceType:null, practiceResults:{}, qualiResult:null, setupBonus:{ setup:0, quali:0, race:0 } };
    if(T.damageHistory===undefined) T.damageHistory=[];
    if(T.created===undefined) T.created=Date.now();
    if(T.lastPlayed===undefined) T.lastPlayed=Date.now();
    if(T.crates) delete T.crates;
    const banned=["Hamilton","Verstappen","Leclerc","Norris","Russell","Sainz","Alonso","Gasly","Ocon","Perez","Bottas","Massa","Senna","Piquet","Schumacher","Vettel","Raikkonen","Button","Rosberg","Magnussen","Hulkenberg","Stroll","Tsunoda","Albon","Zhou","Kubica","Mazepin","Ricciardo","Piastri","Hunt","Lauda","Prost","Clark"];
    for(const d of T.squad?.drivers||[]){
      if(banned.some(b=>d.name.includes(b))){
        const rng=E.mulberry32(E.hashSeed(T.seed+":rename:"+d.id));
        d.name=E.genDriverName(rng, T.region);
      }
    }
  }
}

function pickRole(rng){ const roles=Object.keys(E.DRIVER_ROLES); return roles[Math.floor(rng()*roles.length)]; }
function teamGenSquad(rng, region, baseStr){
  const squad=E.genTeam(rng, region, baseStr);
  const extra=[];
  for(let i=0;i<6;i++){
    const role=pickRole(rng);
    extra.push(E.genDriver(rng, region, role, Math.round(baseStr+(rng()-0.5)*10-2)));
  }
  squad.drivers=[...squad.drivers,...extra];
  for(const d of squad.drivers){
    const n=d.isLegendary?3:d.ovr>80?2:d.ovr>70?1:0;
    const pool=E.skillsFor(d.role).slice();
    d.skills=[];
    for(let i=0;i<n&&pool.length;i++) d.skills.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);
  }
  return squad;
}
function teamNewSave(region, teamName){
  // This now creates a NEW SLOT if possible
  const idx = loadSlotsIndex();
  const existingCount = Object.keys(idx.slots).length;
  if(existingCount >= MAX_SLOTS){
    // If max reached, we will overwrite the oldest or return null — for now we allow creating slot_{n+1} beyond MAX but warn
    // To strictly enforce MAX, return false
    // We'll allow beyond MAX up to 10 for flexibility, but UI will warn
    // Check if we can still create
    if(existingCount >= 10){
      console.warn("Max slots reached");
      return null;
    }
  }
  const slotId = generateSlotId();
  const seed="f1_"+Date.now().toString(36)+"_"+slotId;
  const rng=E.mulberry32(E.hashSeed(seed+":squad"));
  const baseStr=60;
  const squad=teamGenSquad(rng, region, baseStr);
  const short=(teamName.replace(/[^A-Za-z]/g,"")||"F1Z").slice(0,3).toUpperCase();
  const now = Date.now();
  T={
    seed, region, teamName, short,
    col1:"#e10600", col2:"#ffffff",
    livery:{ col1:"#e10600", col2:"#ffffff", pattern:"solid" },
    series:1, season:1, race:0,
    results:[], squad,
    lineup:{ drivers:[squad.drivers[0].id, squad.drivers[1].id], components:{} },
    budget:20.0, bucks:75,
    research:{ points:120, level:1 },
    materials:{ carbon:250, alloy:250, electronics:150 },
    boosts:{ focus:8, aero:5, power:5, grip:3, endurance:3, warrior:2, phantom:1, titan:1 },
    boostInventory:{ focus:8, aero:5, power:5, grip:3, endurance:3, warrior:2, phantom:1, titan:1 },
    selectedBoosts:[["focus","aero"],["focus","power"]],
    pitPass:{ level:1, xp:0, premium:false, rewardsClaimed:[], maxLevel:50 },
    collection:{ score:0, driversOwned:0, componentsOwned:0, legendaryCount:0 },
    club:{ name:"", reputation:0, level:1, members:1, exhibitionWins:0 },
    spinner:{ lastSpin:0, streak:0, freeSpins:3 },
    championship:{ standings:[], driverStandings:[], season:1, race:0, history:[] },
    constructors:{ standings:[], history:[] },
    raceTypes:{ duel:{ wins:0, losses:0 }, grandprix:{ wins:0, points:0, events:0 }, sprint:{ wins:0 }, endurance:{ wins:0 }, timetrial:{ best:999, ghosts:{} }, exhibition:{ wins:0 } },
    practice:{},
    setup:{},
    ghosts:{},
    timeTrial:{},
    sponsors:{ tasks:[], completed:0, creditsEarned:0 },
    weekend:{ stage:"idle", track:null, raceType:null, practiceResults:{}, qualiResult:null, setupBonus:{ setup:0, quali:0, race:0, tyre:0 } },
    damageHistory:[],
    news:[], trophies:[], wins:0, flags:0, scouted:[],
    daily:{ lastLogin:0, streak:0, rewards:[] },
    created: now,
    lastPlayed: now,
    slotId: slotId
  };
  for(const type of E.COMPONENT_TYPES){
    const comps=Object.values(squad.components).filter(c=>c.type===type);
    if(comps.length) T.lineup.components[type]=comps[0].id;
  }
  teamAutoLineup();
  updateCollectionScore();
  teamNews(`🏁 ${teamName} founded! Series 1. 24 tracks, 7 race types, FP1/FP2/FP3, Q1/Q2/Q3, damage, ghost replay — no crates. Slot ${slotId}`);
  currentSlotId = slotId;
  // Save slot data + index
  saveSlotData(slotId, T);
  const preview = buildPreviewFromT(T);
  preview.id = slotId;
  preview.created = now;
  preview.lastPlayed = now;
  const newIdx = loadSlotsIndex();
  newIdx.slots[slotId]=preview;
  newIdx.currentSlot=slotId;
  saveSlotsIndex(newIdx);
  // Also save to legacy key for backward compat
  try{ localStorage.setItem(TEAM_KEY, JSON.stringify(T)); }catch(e){}
  return slotId;
}
function teamScore(){
  const team=teamCurrentLoadout();
  return E.teamScore(team);
}
function teamCurrentLoadout(){
  if(!T) return null;
  const drivers=T.lineup.drivers.map(id=>T.squad.drivers.find(d=>d.id===id)).filter(Boolean);
  const comps={};
  for(const type of E.COMPONENT_TYPES){
    const id=T.lineup.components[type];
    const comp=findComp(id)||T.squad.components[type];
    if(comp) comps[type]=comp;
  }
  const boosts=T.selectedBoosts||[["focus"],["focus"]];
  const setupBonus=T.weekend?.setupBonus||{ setup:0, quali:0, race:0 };
  return { name:T.teamName, short:T.short, col1:T.livery?.col1||T.col1, col2:T.livery?.col2||T.col2, drivers, components:comps, boosts, instruction:["standard","standard"], tyre:["medium","medium"], setupBonus };
}
function findComp(id){
  if(!T) return null;
  for(const c of Object.values(T.squad.components)) if(c.id===id) return c;
  if(T.inventory) for(const c of T.inventory) if(c.id===id) return c;
  return null;
}
function teamAutoLineup(){
  if(!T) return;
  const sorted=[...T.squad.drivers].sort((a,b)=>b.ovr-a.ovr);
  T.lineup.drivers=sorted.slice(0,2).map(d=>d.id);
  const allComps=[...Object.values(T.squad.components)];
  if(T.inventory) allComps.push(...T.inventory);
  for(const type of E.COMPONENT_TYPES){
    const best=allComps.filter(c=>c.type===type).sort((a,b)=>(b.stats.speed+b.stats.cornering)-(a.stats.speed+a.stats.cornering))[0];
    if(best) T.lineup.components[type]=best.id;
  }
}
function teamNews(txt){ if(!T) return; T.news.unshift({s:T.season,r:T.race,txt}); T.news=T.news.slice(0,50); }
function marketWeek(){ return Math.floor(Date.now()/(7*864e5)); }
function marketPool(){
  const week=marketWeek();
  const rng=E.mulberry32(E.hashSeed(T.seed+":mkt:v5:w"+week));
  const pool=[];
  const rarities=T.series<3?["common"]:T.series<6?["common","rare"]:T.series<8?["rare","epic"]:["epic","legendary"];
  for(let i=0;i<10;i++){
    if(rng()<0.35){
      const role=pickRole(rng);
      const base=SERIES[T.series-1].str+(rng()-0.5)*6;
      const d=E.genDriver(rng, T.region, role, Math.round(base));
      const rar=rarities[Math.floor(rng()*rarities.length)];
      d.rarity=rar;
      d.price=rar==="common"?1.5:rar==="rare"?3.5:rar==="epic"?7:14;
      d.bucksPrice=rar==="legendary"?25:0;
      pool.push({type:"driver", item:d});
    } else if(rng()<0.65){
      const compType=E.COMPONENT_TYPES[Math.floor(rng()*E.COMPONENT_TYPES.length)];
      const rar=rarities[Math.floor(rng()*rarities.length)];
      const base=SERIES[T.series-1].str+(rng()-0.5)*6;
      const c=E.genComponent(rng, compType, rar, Math.round(base));
      c.price=rar==="common"?1.2:rar==="rare"?2.8:rar==="epic"?6:12;
      c.bucksPrice=rar==="legendary"?20:0;
      pool.push({type:"component", item:c});
    } else if(rng()<0.85){
      const boostIds=Object.keys(E.BOOSTS);
      const bId=boostIds[Math.floor(rng()*boostIds.length)];
      const b=E.BOOSTS[bId];
      pool.push({type:"boost", item:{ id:bId, name:b.name, icon:b.icon, rarity:b.rarity, qty:3, price: b.rarity==="common"?0.8:b.rarity==="rare"?1.5:b.rarity==="epic"?3:6 }});
    } else {
      const colors=["#e10600","#00a8ff","#ffcc00","#00d084","#a335ee","#ff8000","#ffffff","#000000"];
      pool.push({type:"livery", item:{ col1:colors[Math.floor(rng()*colors.length)], col2:colors[Math.floor(rng()*colors.length)], pattern:pick(rng,["solid","stripes","gradient","camo","digital"]), price:2.5 }});
    }
  }
  return pool;
}
function researchCost(comp){ const base=comp.level; return { research:base*15, carbon:base*20, alloy:base*15, electronics:base*10, credits:base*0.8 }; }
function canResearch(comp){ const cost=researchCost(comp); return T.research.points>=cost.research && T.materials.carbon>=cost.carbon && T.materials.alloy>=cost.alloy && T.materials.electronics>=cost.electronics && T.budget>=cost.credits; }
function doResearch(comp){
  if(!canResearch(comp)) return false;
  const cost=researchCost(comp);
  T.research.points-=cost.research; T.materials.carbon-=cost.carbon; T.materials.alloy-=cost.alloy; T.materials.electronics-=cost.electronics; T.budget=Math.round((T.budget-cost.credits)*10)/10;
  comp.level++; comp.stats.speed+=1+Math.floor(comp.level/3); comp.stats.cornering+=1+Math.floor(comp.level/3); comp.stats.powerUnit+=1; comp.stats.reliability=Math.min(99, comp.stats.reliability+1); comp.stats.pitTime=Math.max(1.8, comp.stats.pitTime-0.05); comp.stats.drs=Math.min(99, (comp.stats.drs||70)+1); comp.stats.fuel=Math.min(99, (comp.stats.fuel||70)+1);
  T.research.level=Math.floor(allComponentsAvgLevel());
  updateCollectionScore();
  return true;
}
function allComponentsAvgLevel(){
  const all=[...Object.values(T.squad.components)]; if(T.inventory) all.push(...T.inventory); if(!all.length) return 1; return all.reduce((s,c)=>s+c.level,0)/all.length;
}
function trainCost(driver){ const base=Math.floor(driver.ovr/10); return { research:base*8, credits:base*0.5 }; }
function canTrain(driver){ const c=trainCost(driver); return T.research.points>=c.research && T.budget>=c.credits && driver.ovr<driver.pot; }
function doTrain(driver){
  if(!canTrain(driver)) return false;
  const cost=trainCost(driver);
  T.research.points-=cost.research; T.budget=Math.round((T.budget-cost.credits)*10)/10;
  driver.ovr=Math.min(driver.pot, driver.ovr+1);
  const keys=Object.keys(driver.stats); const k=keys[Math.floor(Math.random()*keys.length)]; driver.stats[k]=Math.min(95, driver.stats[k]+1);
  updateCollectionScore();
  return true;
}
function useBoost(boostId, driverIdx){
  if((T.boostInventory[boostId]||0)<=0) return false;
  T.boostInventory[boostId]--;
  if(!T.selectedBoosts[driverIdx]) T.selectedBoosts[driverIdx]=[];
  if(T.selectedBoosts[driverIdx].length>=2){
    const ret=T.selectedBoosts[driverIdx].shift();
    T.boostInventory[ret]=(T.boostInventory[ret]||0)+1;
  }
  T.selectedBoosts[driverIdx].push(boostId);
  return true;
}
function clearBoosts(driverIdx){
  const sel=T.selectedBoosts[driverIdx]||[];
  for(const b of sel) T.boostInventory[b]=(T.boostInventory[b]||0)+1;
  T.selectedBoosts[driverIdx]=[];
}
function genGhostTeams(n){
  const ghosts=[];
  const rng=E.mulberry32(E.hashSeed(T.seed+":ghosts:v5"));
  for(let i=0;i<n;i++){
    const region=Object.keys(E.REGIONS)[Math.floor(rng()*8)];
    const base=teamScore()+(rng()-0.5)*10;
    const squad=teamGenSquad(rng, region, Math.max(55, Math.round(base)));
    const team={ name:`${pick(rng,["Apex","Vortex","Titan","Nova","Zenith","Pulse","Vertex","Stratos","Nebula","Horizon"])} ${pick(rng,["Racing","Motorsport","GP","Competition","Dynamics"])}`, short:`G${i+1}`, col1:"#"+Math.floor(rng()*16777215).toString(16).padStart(6,"0"), drivers:squad.drivers.slice(0,2), components:squad.components, teamScore:E.teamScore({drivers:squad.drivers.slice(0,2), components:squad.components}), style:["aggressive","balanced","conservative"][Math.floor(rng()*3)] };
    ghosts.push(team);
  }
  return ghosts;
}
function updateCollectionScore(){
  if(!T) return;
  const driversOwned=T.squad.drivers.length;
  const driversUpgrades=T.squad.drivers.reduce((s,d)=>s+(d.ovr-60),0);
  const allComps=[...Object.values(T.squad.components)]; if(T.inventory) allComps.push(...T.inventory);
  const compsOwned=allComps.length;
  const compsUpgrades=allComps.reduce((s,c)=>s+(c.level-1)*2,0);
  const legendary=T.squad.drivers.filter(d=>d.rarity==="legendary").length + allComps.filter(c=>c.rarity==="legendary").length;
  const score=driversOwned*2 + driversUpgrades + compsOwned*2 + compsUpgrades + legendary*10 + T.series*5;
  T.collection={ score, driversOwned, componentsOwned:compsOwned, legendaryCount:legendary, driversUpgrades, compsUpgrades, highestSeries:T.series };
}
function spinWheel(){
  const rng=E.mulberry32(E.hashSeed(T.seed+":spin:"+Date.now()));
  const rewards=[
    { type:"credits", amount:1.5, icon:"💰", label:"1.5M Credits" },
    { type:"bucks", amount:5, icon:"💎", label:"5 Bucks" },
    { type:"research", amount:20, icon:"🔬", label:"20 RP" },
    { type:"materials", amount:{carbon:30,alloy:20,electronics:10}, icon:"🪨", label:"Materials Pack" },
    { type:"boost", id:"focus", qty:2, icon:"🎯", label:"2x Focus Boost" },
    { type:"boost", id:"aero", qty:1, icon:"🪽", label:"Aero Boost" },
    { type:"boost", id:"phantom", qty:1, icon:"👻", label:"Phantom Boost" },
    { type:"credits", amount:3, icon:"💰", label:"3M Credits Jackpot!" }
  ];
  const reward=pick(rng, rewards);
  if(reward.type==="credits") T.budget=Math.round((T.budget+reward.amount)*10)/10;
  if(reward.type==="bucks") T.bucks+=reward.amount;
  if(reward.type==="research") T.research.points+=reward.amount;
  if(reward.type==="materials"){ T.materials.carbon+=reward.amount.carbon; T.materials.alloy+=reward.amount.alloy; T.materials.electronics+=reward.amount.electronics; }
  if(reward.type==="boost"){ T.boostInventory[reward.id]=(T.boostInventory[reward.id]||0)+reward.qty; }
  T.spinner.lastSpin=Date.now();
  T.spinner.streak++;
  T.spinner.freeSpins=Math.max(0, (T.spinner.freeSpins||0)-1);
  teamSave();
  return reward;
}
function claimPitPass(level){
  if(T.pitPass.rewardsClaimed.includes(level)) return null;
  const rewards={
    1:{ credits:1, boosts:{focus:2} },
    2:{ bucks:5, research:10 },
    3:{ materials:{carbon:30,alloy:20,electronics:10} },
    5:{ boosts:{aero:2, power:2} },
    10:{ bucks:15, boosts:{phantom:1} },
    15:{ component:{type:"engine", rarity:"epic"} },
    20:{ driver:{ rarity:"epic" } },
    25:{ bucks:25, boosts:{titan:1, phantom:1} },
    30:{ component:{type:"engine", rarity:"legendary"} },
    50:{ driver:{ rarity:"legendary", isLegendary:true } }
  };
  const rew=rewards[level];
  if(!rew) return null;
  T.pitPass.rewardsClaimed.push(level);
  if(rew.credits) T.budget+=rew.credits;
  if(rew.bucks) T.bucks+=rew.bucks;
  if(rew.research) T.research.points+=rew.research;
  if(rew.materials){ T.materials.carbon+=rew.materials.carbon; T.materials.alloy+=rew.materials.alloy; T.materials.electronics+=rew.materials.electronics; }
  if(rew.boosts){ for(const k in rew.boosts) T.boostInventory[k]=(T.boostInventory[k]||0)+rew.boosts[k]; }
  if(rew.component){
    const rng=E.mulberry32(E.hashSeed(T.seed+":pitpass:"+level));
    const comp=E.genComponent(rng, rew.component.type, rew.component.rarity, SERIES[T.series-1].str+5);
    T.inventory=T.inventory||[]; T.inventory.push(comp);
  }
  if(rew.driver){
    const rng=E.mulberry32(E.hashSeed(T.seed+":pitpass:driver:"+level));
    const role=pickRole(rng);
    const d=E.genDriver(rng, T.region, role, rew.driver.rarity==="legendary"?88:80);
    d.rarity=rew.driver.rarity; d.isLegendary=!!rew.driver.isLegendary;
    T.squad.drivers.push(d);
  }
  teamSave();
  return rew;
}
function addPitPassXP(amount){
  T.pitPass.xp+=amount;
  while(T.pitPass.xp>=100 && T.pitPass.level<50){
    T.pitPass.xp-=100;
    T.pitPass.level++;
    teamNews(`🏁 PIT PASS LEVEL UP → ${T.pitPass.level}! Claim reward.`);
  }
}
function joinClub(name){ T.club.name=name; T.club.level=1; T.club.reputation=0; }
function addClubRep(amount){ T.club.reputation+=amount; T.club.level=Math.floor(T.club.reputation/100)+1; }

// v5 new functions
function startWeekend(trackId, raceTypeId){
  T.weekend={ stage:"practice", track:trackId, raceType:raceTypeId, practiceResults:{}, qualiResult:null, setupBonus:{ setup:0, quali:0, race:0, tyre:0 } };
  teamSave();
}
function addPracticeResult(sessionId, result){
  T.weekend.practiceResults[sessionId]=result;
  T.weekend.setupBonus.setup+=result.bonus.setup||0;
  T.weekend.setupBonus.quali+=result.bonus.quali||0;
  T.weekend.setupBonus.race+=result.bonus.race||0;
  T.weekend.setupBonus.tyre+=result.bonus.tyre||0;
  if(!T.practice[result.track]) T.practice[result.track]=[];
  T.practice[result.track].push(result);
  teamSave();
}
function setQualiResult(result){
  T.weekend.qualiResult=result;
  T.weekend.stage="race";
  teamSave();
}
function addGhost(trackId, ghost){
  if(!T.ghosts[trackId]) T.ghosts[trackId]=[];
  T.ghosts[trackId].push(ghost);
  T.ghosts[trackId]=T.ghosts[trackId].sort((a,b)=>a.total-b.total).slice(0,10);
  const best=Math.min(...T.ghosts[trackId].map(g=>g.total));
  T.raceTypes.timetrial.best=Math.min(T.raceTypes.timetrial.best, best);
  if(!T.timeTrial[trackId]||best<T.timeTrial[trackId]) T.timeTrial[trackId]=best;
  teamSave();
}
function addDamageRecord(record){
  T.damageHistory.unshift(record);
  T.damageHistory=T.damageHistory.slice(0,20);
  teamSave();
}
function updateConstructorsStandings(raceResult){
  const entry={ season:T.season, race:T.race, track:raceResult.track, points:raceResult.finishingOrder.filter(f=>f.teamIdx===0).reduce((s,f)=>s+f.points,0), pos:Math.min(...raceResult.finishingOrder.filter(f=>f.teamIdx===0).map(f=>f.pos)) };
  T.constructors.history.push(entry);
  teamSave();
}

// ===== MULTIPLE SAVE SLOTS API (TEMP LOCAL) =====
function getSaveSlots(){
  const idx = loadSlotsIndex();
  const slots = Object.values(idx.slots).sort((a,b)=>b.lastPlayed-a.lastPlayed);
  return slots;
}
function getCurrentSlotId(){ 
  if(currentSlotId) return currentSlotId;
  const idx = loadSlotsIndex();
  return idx.currentSlot || null;
}
function getSlotCount(){
  const idx = loadSlotsIndex();
  return Object.keys(idx.slots).length;
}
function canCreateSlot(){
  return getSlotCount() < MAX_SLOTS;
}
function switchSaveSlot(slotId){
  const data = loadSlotData(slotId);
  if(!data) return false;
  T = data;
  currentSlotId = slotId;
  T.lastPlayed = Date.now();
  saveSlotData(slotId, T);
  const idx = loadSlotsIndex();
  if(idx.slots[slotId]){
    idx.slots[slotId].lastPlayed = Date.now();
  }
  idx.currentSlot = slotId;
  saveSlotsIndex(idx);
  try{ localStorage.setItem(TEAM_KEY, JSON.stringify(T)); }catch(e){}
  return true;
}
function deleteSaveSlot(slotId){
  const idx = loadSlotsIndex();
  if(!idx.slots[slotId]) return false;
  delete idx.slots[slotId];
  try{ localStorage.removeItem(SLOT_DATA_PREFIX+slotId); }catch(e){}
  // If deleting current, switch to another or clear
  if(idx.currentSlot === slotId){
    const remaining = Object.keys(idx.slots);
    if(remaining.length>0){
      const newCurrent = remaining[0];
      idx.currentSlot = newCurrent;
      const newData = loadSlotData(newCurrent);
      if(newData){
        T = newData;
        currentSlotId = newCurrent;
        try{ localStorage.setItem(TEAM_KEY, JSON.stringify(T)); }catch(e){}
      } else {
        T = null;
        currentSlotId = null;
      }
    } else {
      idx.currentSlot = null;
      T = null;
      currentSlotId = null;
      try{ localStorage.removeItem(TEAM_KEY); }catch(e){}
    }
  }
  saveSlotsIndex(idx);
  return true;
}
function renameSaveSlot(slotId, newName){
  const data = loadSlotData(slotId);
  if(!data) return false;
  const short=(newName.replace(/[^A-Za-z]/g,"")||"F1Z").slice(0,3).toUpperCase();
  data.teamName = newName;
  data.short = short;
  saveSlotData(slotId, data);
  const idx = loadSlotsIndex();
  if(idx.slots[slotId]){
    idx.slots[slotId].teamName = newName;
    idx.slots[slotId].short = short;
    saveSlotsIndex(idx);
  }
  if(currentSlotId === slotId){
    T = data;
    try{ localStorage.setItem(TEAM_KEY, JSON.stringify(T)); }catch(e){}
  }
  return true;
}
function duplicateSaveSlot(slotId){
  const idx = loadSlotsIndex();
  if(Object.keys(idx.slots).length >= 10) return null; // hard limit 10 even if MAX is 5
  const data = loadSlotData(slotId);
  if(!data) return null;
  const newSlotId = generateSlotId();
  const cloned = JSON.parse(JSON.stringify(data));
  cloned.seed = "f1_"+Date.now().toString(36)+"_"+newSlotId;
  cloned.teamName = cloned.teamName + " Copy";
  cloned.created = Date.now();
  cloned.lastPlayed = Date.now();
  cloned.slotId = newSlotId;
  saveSlotData(newSlotId, cloned);
  const preview = buildPreviewFromT(cloned);
  preview.id = newSlotId;
  preview.created = cloned.created;
  preview.lastPlayed = cloned.lastPlayed;
  const newIdx = loadSlotsIndex();
  newIdx.slots[newSlotId]=preview;
  saveSlotsIndex(newIdx);
  return newSlotId;
}
function exportSlot(slotId){
  const data = loadSlotData(slotId);
  if(!data) return null;
  return JSON.stringify(data);
}
function importSlot(jsonString){
  try{
    const data = JSON.parse(jsonString);
    if(!data.teamName || !data.squad) return null;
    const idx = loadSlotsIndex();
    if(Object.keys(idx.slots).length >= 10) return null;
    const newSlotId = generateSlotId();
    data.slotId = newSlotId;
    data.lastPlayed = Date.now();
    if(!data.created) data.created = Date.now();
    saveSlotData(newSlotId, data);
    const preview = buildPreviewFromT(data);
    preview.id = newSlotId;
    preview.created = data.created;
    preview.lastPlayed = data.lastPlayed;
    const newIdx = loadSlotsIndex();
    newIdx.slots[newSlotId]=preview;
    saveSlotsIndex(newIdx);
    return newSlotId;
  }catch(e){ return null; }
}
function getSlotPreview(slotId){
  const idx = loadSlotsIndex();
  return idx.slots[slotId] || null;
}
function wipeAllSlots(){
  const idx = loadSlotsIndex();
  for(const id of Object.keys(idx.slots)){
    try{ localStorage.removeItem(SLOT_DATA_PREFIX+id); }catch(e){}
  }
  try{ localStorage.removeItem(SLOTS_INDEX_KEY); }catch(e){}
  try{ localStorage.removeItem(TEAM_KEY); }catch(e){}
  try{ localStorage.removeItem("f1Zero_Team_v4"); }catch(e){}
  T=null;
  currentSlotId=null;
}

function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

const Team={ 
  load:teamLoad, save:teamSave, newSave:teamNewSave, score:teamScore, currentLoadout:teamCurrentLoadout, autoLineup:teamAutoLineup, marketPool, genGhostTeams, 
  get T(){return T;}, set T(v){T=v;}, 
  SERIES, fmtM, fmtB, researchCost, canResearch, doResearch, trainCost, canTrain, doTrain, useBoost, clearBoosts, updateCollectionScore, spinWheel, claimPitPass, addPitPassXP, joinClub, addClubRep, startWeekend, addPracticeResult, setQualiResult, addGhost, addDamageRecord, updateConstructorsStandings,
  // Slots API
  getSaveSlots, getCurrentSlotId, getSlotCount, canCreateSlot, switchSaveSlot, deleteSaveSlot, renameSaveSlot, duplicateSaveSlot, exportSlot, importSlot, getSlotPreview, wipeAllSlots,
  MAX_SLOTS,
  SLOTS_INDEX_KEY, SLOT_DATA_PREFIX
};
if(typeof window!=="undefined") window.Team=Team;
if(typeof module!=="undefined") module.exports=Team;

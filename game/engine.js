/* ============================================================
   F1 ZERO — Ultimate+ Engine v5
   ALL FEATURES: 24 tracks, 7 race types, 20-car grid,
   FP1/FP2/FP3 practice, Q1/Q2/Q3 knockout, DRS/ERS/Fuel,
   Damage+Repair animation, Time Trial ghost replay,
   Sponsor tasks, Full race weekend, Sector times
   NO CRATES, NO F1 IP
   ============================================================ */

function mulberry32(a){ return function(){ a|=0; a=(a+0x6D2B79F5)|0; let t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function hashSeed(str){ let h=1779033703^str.length; for(let i=0;i<str.length;i++){ h=Math.imul(h^str.charCodeAt(i),3432918353); h=(h<<13)|(h>>>19); } return (h^=h>>>16)>>>0; }
function pick(rng,arr){ return arr[Math.floor(rng()*arr.length)]; }

/* ---------- 100% FICTIONAL NAME POOLS ---------- */
const REGIONS={
  britain:{ label:"Northern Isles", flag:"🏴", first:["Callum","Harry","Jack","Oliver","Mason","Reece","Jordan","Kieran","Declan","Conor","Liam","Nathan","Owen","Rhys","Finn","Ellis","Theo","Harrison"], last:["Whitfield","Harrington","Bexley","Crowther","Aldridge","Fenwick","Marsden","Holloway","Pemberton","Radcliffe","Stanton","Draycott","Farnsworth","Grantham","Hartwell","Larkin","Ashcombe","Brentwood"] },
  westeuro:{ label:"Western Coast", flag:"🌊", first:["Antoine","Hugo","Mathis","Enzo","Jules","Noah","Leo","Bastien","Florian","Maxime","Romain","Yanis","Luc","Timo","Emile","Arthur"], last:["Lemaire","Rousseau","Girard","Fontaine","Moreau","Dubois","Marchand","Perrin","Baptiste","Carpentier","Vasseur","Leroux","Chastain","Delacroix","Berger","Weiss"] },
  southeuro:{ label:"Sun Peninsula", flag:"☀️", first:["Diego","Mateo","Santiago","Alejandro","Nicolas","Pablo","Javier","Andres","Marco","Lorenzo","Davide","Riccardo","Alessio","Federico","Luca","Giorgio"], last:["Delgado","Cabrera","Valdez","Salazar","Fuentes","Navarro","Moretti","Ricci","Greco","Marino","Ferraro","Santoro","Rossi","Conti","Bianchi","Esposito"] },
  northeuro:{ label:"Frostlands", flag:"❄️", first:["Lukas","Finn","Jonas","Niklas","Lars","Sven","Erik","Emil","Mikkel","Anders","Kasper","Henrik","Oskar","Viktor","Jesper","Rasmus"], last:["Keller","Brandt","Vogel","Lindqvist","Sorensen","Bakker","Visser","Holm","Nyberg","Dahl","Eriksen","Falk","Gundersen","Hoffmann","Jensen","Kruger"] },
  easteuro:{ label:"East Valley", flag:"🏔️", first:["Luka","Marko","Nikola","Andrej","Milan","Piotr","Jakub","Tomas","Matej","Dario","Bartosz","Filip","Ivan","Szymon","Petar","Zoran"], last:["Kovac","Novak","Petrovic","Horvat","Zielinski","Dvorak","Marek","Jovanovic","Kowalczyk","Babic","Sokolov","Wojcik","Novotny","Stankovic","Kral","Havel"] },
  southam:{ label:"Southern Wilds", flag:"🌿", first:["Thiago","Rafael","Bruno","Gustavo","Vinicius","Joao","Pedro","Lucas","Caio","Renan","Facundo","Agustin","Joaquin","Emiliano","Matias","Franco"], last:["Marinho","Cardoso","Teixeira","Barbosa","Moreira","Batista","Correia","Azevedo","Peixoto","Sarmiento","Quintero","Villalba","Escobar","Palacios","Benitez","Roldan"] },
  africa:{ label:"Golden Savannah", flag:"🦁", first:["Sadio","Kwame","Yaya","Emeka","Amadou","Idrissa","Tariq","Youssef","Karim","Moussa","Cheikh","Abdou","Kofi","Sekou","Femi","Malik"], last:["Diallo","Mensah","Traore","Ndiaye","Keita","Osei","Cisse","Toure","Sarr","Kamara","Coulibaly","Doumbia","Gueye","Bakayoko","Konate","Fofana"] },
  asia:{ label:"Eastern Horizon", flag:"🌏", first:["Takumi","Kaoru","Ritsu","Daichi","Sora","Minjae","Jisung","Hyeon","Haruki","Kenji","Akira","Ryo","Wei","Zhen","Arif","Rizky"], last:["Tanaka","Morita","Hayashi","Nakamura","Fujimoto","Kang","Baek","Seo","Hwang","Zhang","Liu","Nakajima","Wirawan","Farhan","Rahimi","Azizi"] }
};
function genDriverName(rng,region){
  const r=REGIONS[region]||REGIONS[pick(rng,Object.keys(REGIONS))];
  return pick(rng,r.first)+" "+pick(rng,r.last);
}

/* ---------- DRIVER ROLES ---------- */
const DRIVER_ROLES={
  qualifier:{ label:"Qualifier", weights:{QUA:.35,PAC:.20,OVR:.15,DEF:.10,TYR:.10,CON:.10}, desc:"Saturday specialist"},
  racer:{ label:"Racer", weights:{OVR:.25,PAC:.25,DEF:.20,QUA:.10,TYR:.10,CON:.10}, desc:"Sunday warrior"},
  whisperer:{ label:"Whisperer", weights:{TYR:.40,CON:.20,PAC:.15,OVR:.15,DEF:.05,QUA:.05}, desc:"Tyre saver"},
  balanced:{ label:"Balanced", weights:{QUA:.18,PAC:.18,OVR:.18,DEF:.16,TYR:.15,CON:.15}, desc:"All-rounder"}
};
function baseDriverStats(role){
  const t={
    qualifier:{QUA:78,PAC:72,OVR:68,DEF:64,TYR:66,CON:70},
    racer:{QUA:68,PAC:76,OVR:75,DEF:72,TYR:68,CON:70},
    whisperer:{QUA:65,PAC:68,OVR:70,DEF:66,TYR:80,CON:76},
    balanced:{QUA:70,PAC:70,OVR:70,DEF:70,TYR:70,CON:70}
  }[role]; return Object.assign({},t);
}
function calcDriverOVR(stats,role){
  const w=DRIVER_ROLES[role].weights; let s=0; for(const k in w) s+=(stats[k]||0)*w[k]; return Math.round(s);
}
const DRIVING_STYLES={
  aggressive:{ label:"Aggressive", overtake:1.30, tyreWear:1.25, mistake:1.20, defend:1.10, desc:"High risk"},
  balanced:{ label:"Balanced", overtake:1.0, tyreWear:1.0, mistake:1.0, defend:1.0, desc:"Safe"},
  smooth:{ label:"Smooth", overtake:0.85, tyreWear:0.75, mistake:0.80, defend:0.95, desc:"Tyre saver"},
  clutch:{ label:"Clutch", overtake:1.15, tyreWear:1.0, mistake:0.90, defend:1.15, desc:"Last lap"}
};
const RACE_INSTRUCTIONS={
  push:{ label:"🔴 Push", pace:1.08, tyre:1.30, pu:-18, fuel:-12, risk:1.20, overtake:1.25, desc:"Fast, high wear"},
  standard:{ label:"🟡 Standard", pace:1.0, tyre:1.0, pu:5, fuel:-8, risk:1.0, overtake:1.0, desc:"Baseline"},
  conserve:{ label:"🟢 Conserve", pace:0.94, tyre:0.60, pu:18, fuel:-4, risk:0.85, overtake:0.80, desc:"Saves tyres/PU/fuel"},
  powersave:{ label:"🔵 Power Save", pace:0.90, tyre:0.50, pu:32, fuel:-2, risk:0.70, overtake:0.50, desc:"Max recharge"}
};

/* ---------- COMPONENTS + DAMAGE ---------- */
const COMPONENT_TYPES=["brakes","gearbox","rearWing","frontWing","suspension","engine"];
const COMPONENT_RARITY={
  common:{ label:"STANDARD", boost:0, cls:"rarcommon", maxLvl:5, color:"#8b90a5" },
  rare:{ label:"TUNED", boost:3, cls:"rarrare", maxLvl:8, color:"#1e90ff" },
  epic:{ label:"PROTOTYPE", boost:6, cls:"rarepic", maxLvl:12, color:"#a335ee" },
  legendary:{ label:"MASTERWORK", boost:10, cls:"rarlegend", maxLvl:15, color:"#ff8000" }
};
function genComponent(rng,type,rarity,baseStr){
  const rar=COMPONENT_RARITY[rarity];
  const variance=(rng()-0.5)*6;
  const stats={
    speed:Math.round(baseStr+variance+(type==="engine"?4:0)+(type.includes("Wing")?2:0)+rar.boost),
    cornering:Math.round(baseStr+variance+(type==="suspension"?4:0)+(type.includes("Wing")?3:0)+rar.boost),
    powerUnit:Math.round(baseStr+variance+(type==="engine"?5:0)+rar.boost),
    reliability:Math.round(70+rng()*20+rar.boost),
    pitTime:Math.round((3.5-rar.boost*0.08+(rng()-0.5)*0.6)*10)/10,
    quali:Math.round(baseStr*0.2+rar.boost*0.5),
    drs:Math.round(70+rng()*15+rar.boost),
    fuel:Math.round(70+rng()*15+rar.boost)
  };
  return { id:Math.floor(rng()*1e9), type, rarity, level:1, stats, baseStr, name:`${rar.label} ${type.toUpperCase()}`, damage:0 };
}
const DAMAGE_TYPES={
  frontWing:{ label:"Front Wing", pace:0.15, icon:"🪽", repair:2.5 },
  rearWing:{ label:"Rear Wing", pace:0.12, icon:"🪽", repair:2.2 },
  floor:{ label:"Floor", pace:0.10, icon:"🔩", repair:3.0 },
  suspension:{ label:"Suspension", pace:0.18, icon:"⚙️", repair:3.5 },
  brakes:{ label:"Brakes", pace:0.08, icon:"🛞", repair:1.8 },
  engine:{ label:"Engine", pace:0.20, icon:"🔥", repair:4.0 }
};

/* ---------- 24 ORIGINAL TRACKS ---------- */
const TRACKS={
  ashworth:{ id:"ashworth", name:"Ashworth Circuit", country:"Northland", flag:"🏴", laps:7, length:5.9, turns:18, layout:"flowing", trackStats:["cornering","racePace"], wear:0.85, scChance:0.10, wetChance:0.35, drsZones:2, fuelUse:1.0, desc:"Fast, flowing high-speed corners", series:[1,2], sectors:[{name:"S1 High Speed", stat:"cornering", len:0.35},{name:"S2 Technical", stat:"tyreManagement", len:0.30},{name:"S3 Straight", stat:"speed", len:0.35}] },
  beaumont:{ id:"beaumont", name:"Beaumont Park", country:"Valdorra", flag:"🟩", laps:6, length:5.8, turns:11, layout:"speed", trackStats:["speed","overtaking"], wear:0.95, scChance:0.08, wetChance:0.10, drsZones:3, fuelUse:1.1, desc:"Long straights, low downforce test", series:[1,2], sectors:[{name:"S1 Straight", stat:"speed", len:0.4},{name:"S2 Chicane", stat:"cornering", len:0.25},{name:"S3 Straight", stat:"speed", len:0.35}] },
  castelmar:{ id:"castelmar", name:"Castelmar Bay", country:"Cavella", flag:"🌊", laps:9, length:3.3, turns:19, layout:"street", trackStats:["cornering","defending"], wear:0.65, scChance:0.18, wetChance:0.15, drsZones:1, fuelUse:0.8, desc:"Tight street circuit, walls close", series:[1,2], sectors:[{name:"S1 Harbour", stat:"defending", len:0.3},{name:"S2 Old Town", stat:"cornering", len:0.4},{name:"S3 Bay", stat:"overtaking", len:0.3}] },
  vikstad:{ id:"vikstad", name:"Vikstad Ring", country:"Nordmark", flag:"❄️", laps:6, length:7.0, turns:20, layout:"endurance", trackStats:["speed","tyreManagement"], wear:0.90, scChance:0.12, wetChance:0.40, drsZones:2, fuelUse:1.2, desc:"Longest lap, elevation, weather lottery", series:[3,4], sectors:[{name:"S1 Uphill", stat:"powerUnit", len:0.35},{name:"S2 Forest", stat:"tyreManagement", len:0.35},{name:"S3 Downhill", stat:"speed", len:0.30}] },
  torresol:{ id:"torresol", name:"Torresol Circuit", country:"Solare", flag:"☀️", laps:7, length:4.6, turns:16, layout:"technical", trackStats:["tyreManagement","consistency"], wear:1.10, scChance:0.07, wetChance:0.10, drsZones:2, fuelUse:1.0, desc:"Abrasive surface, tyre killer", series:[3,4], sectors:[{name:"S1 Abrasive", stat:"tyreManagement", len:0.4},{name:"S2 Technical", stat:"cornering", len:0.3},{name:"S3 Straight", stat:"speed", len:0.3}] },
  sakuradai:{ id:"sakuradai", name:"Sakuradai Speedway", country:"Kansai", flag:"🌸", laps:7, length:5.8, turns:18, layout:"figure8", trackStats:["cornering","consistency"], wear:0.80, scChance:0.09, wetChance:0.25, drsZones:1, fuelUse:1.0, desc:"Figure-8, technical favourite", series:[3,4], sectors:[{name:"S1 Esses", stat:"cornering", len:0.35},{name:"S2 Spoon", stat:"consistency", len:0.35},{name:"S3 130R", stat:"speed", len:0.30}] },
  zanari:{ id:"zanari", name:"Zanari International", country:"Zanara", flag:"🦁", laps:6, length:5.4, turns:15, layout:"desert", trackStats:["speed","consistency"], wear:1.0, scChance:0.09, wetChance:0.05, drsZones:3, fuelUse:1.15, desc:"Desert heat, sand, high deg", series:[3,4], sectors:[{name:"S1 Desert", stat:"speed", len:0.4},{name:"S2 Oasis", stat:"cornering", len:0.25},{name:"S3 Straight", stat:"speed", len:0.35}] },
  rioverde:{ id:"rioverde", name:"Rio Verde Circuit", country:"Veridia", flag:"🌿", laps:8, length:4.3, turns:15, layout:"bumpy", trackStats:["overtaking","powerUnit"], wear:0.88, scChance:0.11, wetChance:0.30, drsZones:2, fuelUse:0.95, desc:"Anti-clockwise, bumpy, overtaking", series:[5,6], sectors:[{name:"S1 Bumpy", stat:"powerUnit", len:0.3},{name:"S2 Infield", stat:"overtaking", len:0.35},{name:"S3 Straight", stat:"speed", len:0.35}] },
  kanzaki:{ id:"kanzaki", name:"Kanzaki Raceway", country:"Tohoku", flag:"⛩️", laps:7, length:4.8, turns:20, layout:"twisty", trackStats:["cornering","powerUnit"], wear:0.82, scChance:0.10, wetChance:0.20, drsZones:1, fuelUse:1.0, desc:"Tight and twisty, hard on PU", series:[5,6], sectors:[{name:"S1 Hairpins", stat:"cornering", len:0.4},{name:"S2 Esses", stat:"cornering", len:0.35},{name:"S3 Straight", stat:"powerUnit", len:0.25}] },
  novagrad:{ id:"novagrad", name:"Novagrad Autodrom", country:"Vostok", flag:"🏔️", laps:6, length:5.2, turns:16, layout:"altitude", trackStats:["defending","tyreManagement"], wear:0.92, scChance:0.13, wetChance:0.18, drsZones:2, fuelUse:0.85, desc:"High altitude, thin air", series:[5,6], sectors:[{name:"S1 Altitude", stat:"powerUnit", len:0.35},{name:"S2 Technical", stat:"tyreManagement", len:0.3},{name:"S3 Straight", stat:"defending", len:0.35}] },
  harbourfront:{ id:"harbourfront", name:"Harbourfront Street", country:"Serapura", flag:"🌃", laps:8, length:5.0, turns:23, layout:"night", trackStats:["defending","consistency"], wear:0.78, scChance:0.16, wetChance:0.25, drsZones:2, fuelUse:0.9, desc:"Night race, harbour lights, walls", series:[5,6], sectors:[{name:"S1 Harbour", stat:"defending", len:0.35},{name:"S2 City", stat:"consistency", len:0.35},{name:"S3 Straight", stat:"speed", len:0.30}] },
  desertvista:{ id:"desertvista", name:"Desert Vista GP", country:"Qasara", flag:"🏜️", laps:6, length:5.4, turns:16, layout:"desert", trackStats:["speed","powerUnit"], wear:1.05, scChance:0.08, wetChance:0.02, drsZones:3, fuelUse:1.2, desc:"Night desert, high speed", series:[7,8], sectors:[{name:"S1 Straight", stat:"speed", len:0.4},{name:"S2 Complex", stat:"powerUnit", len:0.3},{name:"S3 Straight", stat:"speed", len:0.3}] },
  sunset:{ id:"sunset", name:"Sunset Speedway", country:"Emirara", flag:"🌅", laps:6, length:5.2, turns:16, layout:"twilight", trackStats:["tyreManagement","racePace"], wear:0.90, scChance:0.09, wetChance:0.05, drsZones:2, fuelUse:1.1, desc:"Twilight to night, temp drop", series:[7,8], sectors:[{name:"S1 Sunset", stat:"tyreManagement", len:0.35},{name:"S2 Twilight", stat:"racePace", len:0.3},{name:"S3 Night", stat:"speed", len:0.35}] },
  coastal:{ id:"coastal", name:"Coastal Loop", country:"Australis", flag:"🦘", laps:7, length:5.3, turns:16, layout:"park", trackStats:["cornering","overtaking"], wear:0.86, scChance:0.10, wetChance:0.20, drsZones:3, fuelUse:1.0, desc:"Parkland, fast and flowing", series:[7,8], sectors:[{name:"S1 Park", stat:"cornering", len:0.35},{name:"S2 Coastal", stat:"overtaking", len:0.35},{name:"S3 Straight", stat:"speed", len:0.30}] },
  mountain:{ id:"mountain", name:"Mountain Pass", country:"Alpina", flag:"⛰️", laps:6, length:4.3, turns:10, layout:"elevation", trackStats:["cornering","powerUnit"], wear:0.80, scChance:0.11, wetChance:0.30, drsZones:1, fuelUse:0.9, desc:"Short lap, big elevation, hills", series:[7,8], sectors:[{name:"S1 Uphill", stat:"powerUnit", len:0.4},{name:"S2 Summit", stat:"cornering", len:0.3},{name:"S3 Downhill", stat:"speed", len:0.30}] },
  lakeside:{ id:"lakeside", name:"Lakeside Circuit", country:"Pannonia", flag:"🌊", laps:8, length:4.3, turns:14, layout:"technical", trackStats:["cornering","tyreManagement"], wear:0.88, scChance:0.12, wetChance:0.15, drsZones:1, fuelUse:0.95, desc:"Tight and twisty, hard to overtake", series:[9,10], sectors:[{name:"S1 Lake", stat:"cornering", len:0.4},{name:"S2 Chicane", stat:"tyreManagement", len:0.3},{name:"S3 Straight", stat:"defending", len:0.30}] },
  dunes:{ id:"dunes", name:"Dunes City Circuit", country:"Azeria", flag:"🏙️", laps:8, length:6.0, turns:20, layout:"street", trackStats:["speed","defending"], wear:0.84, scChance:0.15, wetChance:0.10, drsZones:3, fuelUse:1.1, desc:"Long straight + castle section", series:[9,10], sectors:[{name:"S1 Castle", stat:"defending", len:0.35},{name:"S2 Old Town", stat:"cornering", len:0.3},{name:"S3 Straight", stat:"speed", len:0.35}] },
  bayfront:{ id:"bayfront", name:"Bayfront Street", country:"Floridia", flag:"🌴", laps:7, length:5.4, turns:19, layout:"street", trackStats:["overtaking","consistency"], wear:0.82, scChance:0.14, wetChance:0.35, drsZones:2, fuelUse:1.0, desc:"Around stadium, temporary circuit", series:[9,10], sectors:[{name:"S1 Stadium", stat:"overtaking", len:0.35},{name:"S2 Bay", stat:"consistency", len:0.3},{name:"S3 Straight", stat:"speed", len:0.35}] },
  neon:{ id:"neon", name:"Neon Strip Circuit", country:"Nevada", flag:"🎰", laps:6, length:6.1, turns:17, layout:"night", trackStats:["speed","racePace"], wear:0.88, scChance:0.13, wetChance:0.02, drsZones:3, fuelUse:1.15, desc:"Saturday night, cold temps, long straights", series:[9,10], sectors:[{name:"S1 Strip", stat:"speed", len:0.4},{name:"S2 Sphere", stat:"racePace", len:0.25},{name:"S3 Straight", stat:"speed", len:0.35}] },
  highlands:{ id:"highlands", name:"Highlands Circuit", country:"Texana", flag:"🤠", laps:7, length:5.5, turns:20, layout:"elevation", trackStats:["cornering","overtaking"], wear:0.90, scChance:0.11, wetChance:0.15, drsZones:2, fuelUse:1.05, desc:"Elevation 30m, blind corners, wind", series:[9,10], sectors:[{name:"S1 Esses", stat:"cornering", len:0.4},{name:"S2 Infield", stat:"overtaking", len:0.3},{name:"S3 Straight", stat:"speed", len:0.30}] },
  valley:{ id:"valley", name:"Valley Autodromo", country:"Azteca", flag:"🌵", laps:8, length:4.3, turns:17, layout:"altitude", trackStats:["powerUnit","defending"], wear:0.94, scChance:0.10, wetChance:0.10, drsZones:2, fuelUse:0.8, desc:"Highest altitude, 2200m, thin air", series:[9,10], sectors:[{name:"S1 Stadium", stat:"powerUnit", len:0.3},{name:"S2 Snakes", stat:"defending", len:0.4},{name:"S3 Straight", stat:"speed", len:0.30}] },
  pacific:{ id:"pacific", name:"Pacific Ring", country:"Zhongguo", flag:"🐉", laps:7, length:5.4, turns:16, layout:"technical", trackStats:["tyreManagement","cornering"], wear:0.92, scChance:0.09, wetChance:0.20, drsZones:2, fuelUse:1.0, desc:"Snail turn, long back straight", series:[9,10], sectors:[{name:"S1 Snail", stat:"cornering", len:0.4},{name:"S2 Back", stat:"tyreManagement", len:0.3},{name:"S3 Straight", stat:"speed", len:0.30}] },
  lagoon:{ id:"lagoon", name:"Lagoon Park", country:"Canadia", flag:"🍁", laps:7, length:4.3, turns:14, layout:"park", trackStats:["speed","defending"], wear:0.80, scChance:0.12, wetChance:0.25, drsZones:2, fuelUse:1.0, desc:"Island circuit, walls close", series:[9,10], sectors:[{name:"S1 Hairpin", stat:"defending", len:0.3},{name:"S2 Chicane", stat:"speed", len:0.35},{name:"S3 Wall", stat:"defending", len:0.35}] },
  aurora:{ id:"aurora", name:"Aurora Speedway", country:"Fennica", flag:"🌌", laps:6, length:4.0, turns:15, layout:"short", trackStats:["racePace","consistency"], wear:0.78, scChance:0.08, wetChance:0.15, drsZones:1, fuelUse:0.85, desc:"Shortest lap, high downforce", series:[9,10], sectors:[{name:"S1 Short", stat:"racePace", len:0.35},{name:"S2 Twist", stat:"consistency", len:0.35},{name:"S3 Straight", stat:"speed", len:0.30}] }
};
const TRACK_LIST=Object.values(TRACKS);

/* ---------- RACE TYPES ---------- */
const RACE_TYPES={
  duel:{ id:"duel", name:"Duel", icon:"⚔️", laps:"6-9", desc:"1v1 vs ghost, quick, core mode", points:[25,18,15], tyreRule:false, drs:true, fuel:false, mandatoryPit:false, hasPractice:false, hasQuali:false },
  grandprix:{ id:"grandprix", name:"Grand Prix", icon:"🏆", laps:"12-18", desc:"Full weekend: FP1/FP2/FP3 + Q1/Q2/Q3 + Race, featured boosts, sponsor tasks", points:[25,18,15,12,10,8,6,4,2,1], tyreRule:true, drs:true, fuel:true, mandatoryPit:true, hasPractice:true, hasQuali:true },
  championship:{ id:"championship", name:"Championship", icon:"🌍", laps:"18-24", desc:"Full season 24 races, constructors + drivers, full weekend each", points:[25,18,15,12,10,8,6,4,2,1], tyreRule:true, drs:true, fuel:true, mandatoryPit:true, hasPractice:true, hasQuali:true },
  sprint:{ id:"sprint", name:"Sprint", icon:"⚡", laps:"6", desc:"Short, no mandatory pit, top 8 points, single quali", points:[8,7,6,5,4,3,2,1], tyreRule:false, drs:true, fuel:false, mandatoryPit:false, hasPractice:false, hasQuali:true },
  endurance:{ id:"endurance", name:"Endurance", icon:"⏳", laps:"24-36", desc:"2x wear, fuel critical, 2-3 stops, practice optional", points:[25,18,15,12,10,8,6,4,2,1], tyreRule:true, drs:true, fuel:true, mandatoryPit:true, hasPractice:true, hasQuali:true },
  timetrial:{ id:"timetrial", name:"Time Trial", icon:"⏱️", laps:"1", desc:"Solo quali, beat ghost lap, sector ghost replay", points:[], tyreRule:false, drs:false, fuel:false, mandatoryPit:false, hasPractice:false, hasQuali:false },
  exhibition:{ id:"exhibition", name:"Club Exhibition", icon:"👥", laps:"12", desc:"Team vs team, club reputation, full weekend", points:[25,18,15], tyreRule:true, drs:true, fuel:true, mandatoryPit:true, hasPractice:true, hasQuali:true }
};

/* ---------- PRACTICE ---------- */
const PRACTICE_SESSIONS={
  fp1:{ id:"fp1", name:"FP1", icon:"🔧", duration:30, desc:"Hard tyre learning, track acclimatization, reliability check", focus:["reliability","tyreLearning"], bonus:{ setup:2, tyre:5 } },
  fp2:{ id:"fp2", name:"FP2", icon:"⚙️", duration:30, desc:"Quali sim + Race sim, setup optimization, long run", focus:["qualiPace","racePace","setup"], bonus:{ setup:5, quali:3, race:3 } },
  fp3:{ id:"fp3", name:"FP3", icon:"🎯", duration:30, desc:"Final setup, quali trim, last checks before Q1", focus:["qualiTrim","setupFinal"], bonus:{ setup:3, quali:5 } }
};

/* ---------- QUALIFYING Q1/Q2/Q3 ---------- */
const QUALI_FORMATS={
  single:{ id:"single", name:"Single Session", desc:"20 cars, 1 session, grid sorted", sessions:1, elim:[0] },
  knockout:{ id:"knockout", name:"Q1/Q2/Q3 Knockout", desc:"Q1 18min 20→15, Q2 15min 15→10, Q3 12min top 10 shootout", sessions:3, elim:[5,5,0], times:[18,15,12] }
};

/* ---------- TYRES ---------- */
const TYRES={
  soft:{ label:"Soft", short:"S", pace:1.12, wear:0.32, color:"#ff2d2d", life:28, compound:"soft", desc:"Fastest, short life", mandatory:true },
  medium:{ label:"Medium", short:"M", pace:1.05, wear:0.18, color:"#ffcc00", life:45, compound:"medium", desc:"Balanced", mandatory:true },
  hard:{ label:"Hard", short:"H", pace:1.00, wear:0.10, color:"#e0e0e0", life:70, compound:"hard", desc:"Slow, long life", mandatory:true },
  intermediate:{ label:"Intermediate", short:"I", pace:0.98, wear:0.15, color:"#00c853", life:50, wet:true, intermediate:true, desc:"Damp/wet crossover" },
  wet:{ label:"Wet", short:"W", pace:0.95, wear:0.12, color:"#00a8ff", life:60, wet:true, desc:"Full wet" }
};

/* ---------- BOOSTS ---------- */
const BOOSTS={
  focus:{ id:"focus", name:"Focus Protocol", icon:"🎯", rarity:"common", color:"#8b90a5", stats:{ overtake:2, defend:1, tyreUse:1 }, desc:"Basic concentration. +2 Overtake", duration:"Until pit" },
  aero:{ id:"aero", name:"Aero Efficiency", icon:"🪽", rarity:"rare", color:"#1e90ff", stats:{ corners:2, defend:2, speed:1 }, desc:"Improved airflow. +2 Cornering", duration:"Until pit" },
  power:{ id:"power", name:"Power Surge", icon:"⚡", rarity:"rare", color:"#1e90ff", stats:{ speed:3, overtake:1, puRecharge:1 }, desc:"Extra PU. +3 Speed", duration:"Until pit" },
  grip:{ id:"grip", name:"Grip Matrix", icon:"🛞", rarity:"epic", color:"#a335ee", stats:{ tyreUse:3, corners:2, consistency:1 }, desc:"Advanced compound. +3 Tyre Save", duration:"Until pit" },
  endurance:{ id:"endurance", name:"Endurance Core", icon:"🔋", rarity:"epic", color:"#a335ee", stats:{ tyreUse:2, reliability:2, puRecharge:2, fuelSave:2 }, desc:"Long stint. +2 Tyre +2 Fuel", duration:"Until pit" },
  warrior:{ id:"warrior", name:"Warrior Mode", icon:"⚔️", rarity:"epic", color:"#a335ee", stats:{ overtake:3, defend:2, speed:2 }, desc:"Aggressive. +3 Overtake", duration:"Until pit" },
  phantom:{ id:"phantom", name:"Phantom Slip", icon:"👻", rarity:"legendary", color:"#ff8000", stats:{ overtake:5, speed:3, corners:2, drs:2 }, desc:"Legendary slipstream. +5 Overtake +2 DRS", duration:"Until pit" },
  titan:{ id:"titan", name:"Titan Guard", icon:"🛡️", rarity:"legendary", color:"#ff8000", stats:{ defend:5, reliability:3, tyreUse:2, fuelSave:1 }, desc:"Unbreakable. +5 Defend", duration:"Until pit" }
};
const BOOST_LIST=Object.values(BOOSTS);

/* ---------- SKILLS ---------- */
const DRIVER_SKILLS={
  "Overtake Artist":{ overtake:1.15, desc:"More overtake" },
  "Tyre Saver":{ tyreWear:0.85, desc:"-15% wear" },
  "Wet Master":{ wetPace:1.12, desc:"+12% wet" },
  "Pit King":{ pitTime:-0.4, desc:"-0.4s pit" },
  "Clutch":{ lastLap:1.12, desc:"+12% last lap" },
  "Qualifier":{ quali:1.10, desc:"+10% quali" },
  "Defender":{ defend:1.15, desc:"+15% defend" },
  "Consistent":{ mistake:0.80, desc:"-20% mistakes" },
  "Power Whisperer":{ puSave:0.85, desc:"-15% PU drain" },
  "Fuel Saver":{ fuelSave:0.85, desc:"-15% fuel use" },
  "DRS Master":{ drs:1.20, desc:"+20% DRS" },
  "Setup Guru":{ setup:1.15, desc:"+15% setup bonus" },
  "Damage Resistant":{ damage:0.70, desc:"-30% damage taken" }
};
const SKILL_POS={
  "Overtake Artist":["racer","balanced","qualifier"],
  "Tyre Saver":["whisperer","balanced"],
  "Wet Master":["whisperer","balanced","racer"],
  "Pit King":["balanced","qualifier"],
  "Clutch":["racer","balanced"],
  "Qualifier":["qualifier","balanced"],
  "Defender":["racer","balanced"],
  "Consistent":["whisperer","balanced"],
  "Power Whisperer":["whisperer","balanced"],
  "Fuel Saver":["whisperer","balanced"],
  "DRS Master":["racer","qualifier"],
  "Setup Guru":["balanced","qualifier","whisperer"],
  "Damage Resistant":["balanced","racer"]
};
function skillsFor(role){ return Object.keys(SKILL_POS).filter(s=>SKILL_POS[s].includes(role)); }
function skillLegal(skill,role){ return !!(SKILL_POS[skill]&&SKILL_POS[skill].includes(role)); }
function skillsActive(skills,role){ return (skills||[]).filter(s=>skillLegal(s,role)); }
function skillMul(skills,key){
  let m=1;
  for(const s of skills||[]){ const def=DRIVER_SKILLS[s]; if(!def) continue; if(def[key]) m*=def[key]; if(key==="tyreWear"&&def.tyreWear) m*=def.tyreWear; }
  if(key==="pitTime"){ let add=0; for(const s of skills||[]){ const def=DRIVER_SKILLS[s]; if(def&&def.pitTime) add+=def.pitTime; } return {mul:m,add}; }
  return m;
}
function calcBoostStats(boostIds){
  let total={ overtake:0, defend:0, speed:0, corners:0, tyreUse:0, reliability:0, puRecharge:0, consistency:0, fuelSave:0, drs:0 };
  for(const id of boostIds||[]){ const b=BOOSTS[id]; if(!b) continue; for(const k in b.stats) total[k]=(total[k]||0)+b.stats[k]; }
  return total;
}
function applyBoostToCar(car,boostIds){
  const boostStats=calcBoostStats(boostIds);
  let paceBonus=0;
  paceBonus+=(boostStats.speed||0)*0.02;
  paceBonus+=(boostStats.corners||0)*0.015;
  paceBonus+=(boostStats.overtake||0)*0.01;
  return paceBonus;
}

/* ---------- SPONSOR TASKS ---------- */
const SPONSOR_TASKS={
  podium:{ id:"podium", label:"Podium Finish", icon:"🏆", desc:"Finish on podium (Top 3)", reward:{ credits:2, xp:15, bucks:2 }, check:(result)=>result.finishingOrder.some(f=>f.teamIdx===0&&f.pos<=3) },
  overtake:{ id:"overtake", label:"Overtake Master", icon:"⚔️", desc:"Overtake 3+ cars during race", reward:{ credits:1, xp:10 }, check:(result, meta)=> (meta.overtakes||0)>=3 },
  fastest:{ id:"fastest", label:"Fastest Lap", icon:"⚡", desc:"Set fastest lap of race", reward:{ credits:1.5, xp:12, boost:"focus" }, check:(result)=>result.finishingOrder.some(f=>f.teamIdx===0&&f.fastest) },
  noPit:{ id:"noPit", label:"No Mistakes", icon:"🎯", desc:"Finish without major mistakes", reward:{ credits:1, xp:8 }, check:(result, meta)=> (meta.mistakes||0)===0 },
  fuelSave:{ id:"fuelSave", label:"Fuel Saver", icon:"⛽", desc:"Finish with >20% fuel on both cars", reward:{ credits:1, xp:8, research:5 }, check:(result, meta)=> (meta.minFuel||0)>20 },
  tyreRule:{ id:"tyreRule", label:"Strategy Master", icon:"🛞", desc:"Use 2 compounds, no penalty", reward:{ credits:1, xp:10 }, check:(result, meta)=> (meta.tyreRuleOk||false) },
  drs:{ id:"drs", label:"DRS Expert", icon:"🪽", desc:"5+ DRS overtakes", reward:{ credits:1, xp:10 }, check:(result, meta)=> (meta.drsOvertakes||0)>=5 }
};

/* ---------- FULL GRID ---------- */
function genFullGrid(rng, baseStr){
  const teams=[];
  const teamNames=["Apex","Vortex","Titan","Nova","Zenith","Pulse","Vertex","Stratos","Nebula","Horizon"];
  const suffix=["Racing","Motorsport","GP","Competition","Dynamics","Engineering","Performance","Racing Team","Motors","F1 Team"];
  for(let t=0;t<10;t++){
    const region=Object.keys(REGIONS)[Math.floor(rng()*8)];
    const teamName=`${teamNames[t]} ${suffix[Math.floor(rng()*suffix.length)]}`;
    const drivers=[];
    for(let d=0;d<2;d++){
      const roles=Object.keys(DRIVER_ROLES);
      const role=roles[Math.floor(rng()*roles.length)];
      drivers.push(genDriver(rng, region, role, Math.round(baseStr+(rng()-0.5)*8)));
    }
    const components={};
    const rarities=["common","rare","epic"];
    for(const type of COMPONENT_TYPES){ const rar=pick(rng,rarities); components[type]=genComponent(rng,type,rar,baseStr); }
    teams.push({ id:t, name:teamName, short:teamName.slice(0,3).toUpperCase(), col1:"#"+Math.floor(rng()*16777215).toString(16).padStart(6,"0"), col2:"#ffffff", region, drivers, components, teamScore:0 });
  }
  return teams;
}

/* ---------- PRACTICE ENGINE ---------- */
function simulatePractice(team, trackId, sessionId, rng){
  const track=TRACKS[trackId]||TRACKS.ashworth;
  const session=PRACTICE_SESSIONS[sessionId]||PRACTICE_SESSIONS.fp1;
  const compStats=calcTeamComponentStats(team.components);
  const driverAvg=team.drivers.reduce((s,d)=>s+calcDriverOVR(d.stats,d.role||"balanced"),0)/team.drivers.length;
  const basePace=(driverAvg+compStats.speed*0.5+compStats.cornering*0.5)/2;
  const setupProgress=Math.min(100, 20+Math.floor(rng()*30)+(compStats.speed>75?10:0));
  const tyreData={
    soft:{ deg: track.wear*0.32*(1+rng()*0.3), pace: basePace*1.12 },
    medium:{ deg: track.wear*0.18*(1+rng()*0.2), pace: basePace*1.05 },
    hard:{ deg: track.wear*0.10*(1+rng()*0.2), pace: basePace*1.0 }
  };
  const qualiSim=90 - basePace*0.15 - (rng()-0.5)*2 + (sessionId==="fp2"?0:sessionId==="fp3"?-0.5:1);
  const raceSim=32 + (100-basePace)*0.12 + (rng()-0.5)*1.5;
  const issues=[];
  if(rng()<0.15) issues.push({ type:"reliability", desc:"Minor PU issue detected", fix:"PU check", cost:0.1 });
  if(rng()<0.10) issues.push({ type:"setup", desc:"Understeer in "+track.sectors[1].name, fix:"Front wing +2", cost:0 });
  const bonus={ setup: session.bonus.setup + (team.drivers.some(d=>d.skills.includes("Setup Guru"))?2:0), quali: session.bonus.quali||0, race: session.bonus.race||0, tyre: session.bonus.tyre||0 };
  return { session:sessionId, track:trackId, setupProgress, tyreData, qualiSim, raceSim, issues, bonus, laps: Math.floor(8+rng()*12), bestLap: qualiSim, avgLap: raceSim };
}

/* ---------- Q1/Q2/Q3 KNOCKOUT ---------- */
function simulateQualifyingKnockout(teamA, teamB, trackId, seed, fullGrid){
  const rng=mulberry32(seed||12345);
  const track=TRACKS[trackId]||TRACKS.ashworth;
  // Build 20 cars like race
  let cars=[];
  if(fullGrid){
    const allTeams=genFullGrid(rng, 70);
    allTeams[0]={ id:0, name:teamA.name, short:teamA.short, col1:teamA.col1||"#e10600", col2:"#fff", drivers:teamA.drivers, components:teamA.components, teamScore:0 };
    let carId=0;
    for(let t=0;t<10;t++){
      const team=allTeams[t];
      const compStats=calcTeamComponentStats(team.components);
      for(let d=0;d<2;d++){
        const driver=team.drivers[d]; if(!driver) continue;
        const boostIds=(t===0&&teamA.boosts)?(teamA.boosts[d]||[]):[];
        const qStat=driver.stats.QUA+compStats.quali*0.5+(driver.skills.includes("Qualifier")?5:0)+(calcBoostStats(boostIds).overtake||0)*0.5+(team.setupBonus?.quali||0);
        cars.push({ id:carId++, teamIdx:t, driver, team, compStats, boostIds, qStat, times:{q1:0,q2:0,q3:0}, best:0, eliminated:false, elimSession:null });
      }
    }
  } else {
    // 4 cars duel -> single session
    function teamToCars(team,teamIdx){
      const compStats=calcTeamComponentStats(team.components);
      for(let i=0;i<2;i++){
        const d=team.drivers[i]; if(!d) continue;
        const boostIds=(team.boosts&&team.boosts[i])||[];
        const qStat=d.stats.QUA+compStats.quali*0.5+(d.skills.includes("Qualifier")?5:0)+(calcBoostStats(boostIds).overtake||0)*0.5;
        cars.push({ id:teamIdx*2+i, teamIdx, driver:d, team, compStats, boostIds, qStat, times:{q1:0,q2:0,q3:0}, best:0, eliminated:false, elimSession:null });
      }
    }
    teamToCars(teamA,0); teamToCars(teamB,1);
  }

  const sessions=[];
  if(fullGrid){
    // Q1: 20 cars, 18 min, eliminate bottom 5
    const q1=cars.map(c=>{ const noise=(rng()-0.5)*1.5; const time=90-c.qStat*0.15+noise; return {...c, time, sessionTime:time}; }).sort((a,b)=>a.time-b.time);
    q1.forEach((c,i)=>{ c.times.q1=c.time; c.best=c.time; if(i>=15){ c.eliminated=true; c.elimSession="Q1"; c.grid=16+(i-15); } });
    const q1Survivors=q1.filter(c=>!c.eliminated);
    sessions.push({ id:"Q1", name:"Q1", duration:18, cars:q1.map(c=>({id:c.id,name:c.driver.name,team:c.team.name,time:c.time,pos:c.eliminated?c.grid:q1.indexOf(c)+1,elim:c.eliminated})), elim: q1.filter(c=>c.eliminated) });

    // Q2: 15 cars, 15 min, eliminate bottom 5
    const q2=q1Survivors.map(c=>{ const noise=(rng()-0.5)*1.0; const time=90-c.qStat*0.15+noise-0.2; return {...c, time, sessionTime:time}; }).sort((a,b)=>a.time-b.time);
    q2.forEach((c,i)=>{ c.times.q2=c.time; c.best=Math.min(c.times.q1,c.time); if(i>=10){ c.eliminated=true; c.elimSession="Q2"; c.grid=11+(i-10); } });
    const q2Survivors=q2.filter(c=>!c.eliminated);
    sessions.push({ id:"Q2", name:"Q2", duration:15, cars:q2.map(c=>({id:c.id,name:c.driver.name,team:c.team.name,time:c.time,pos:c.eliminated?c.grid:q2.indexOf(c)+1,elim:c.eliminated})), elim: q2.filter(c=>c.eliminated) });

    // Q3: 10 cars, 12 min, top 10
    const q3=q2Survivors.map(c=>{ const noise=(rng()-0.5)*0.6; const time=90-c.qStat*0.15+noise-0.4; return {...c, time, sessionTime:time}; }).sort((a,b)=>a.time-b.time);
    q3.forEach((c,i)=>{ c.times.q3=c.time; c.best=Math.min(c.times.q1,c.times.q2,c.time); c.grid=i+1; });
    sessions.push({ id:"Q3", name:"Q3", duration:12, cars:q3.map(c=>({id:c.id,name:c.driver.name,team:c.team.name,time:c.time,pos:q3.indexOf(c)+1,elim:false})), elim:[] });

    // Final grid: Q3 P1-10, Q2 P11-15, Q1 P16-20
    const finalGrid=[...q3, ...q2.filter(c=>c.eliminated), ...q1.filter(c=>c.eliminated)].sort((a,b)=>a.grid-b.grid).map(c=>({id:c.id,name:c.driver.name,teamIdx:c.teamIdx,teamName:c.team.name,grid:c.grid,time:c.best,times:c.times,eliminatedSession:c.elimSession|| (c.grid<=10?"Q3":c.grid<=15?"Q2":"Q1") }));
    return { format:"knockout", sessions, finalGrid, pole:finalGrid[0] };
  } else {
    // Single session for duel
    const q=cars.map(c=>{ const noise=(rng()-0.5)*2; const time=90-c.qStat*0.15+noise; return {...c,time}; }).sort((a,b)=>a.time-b.time);
    const finalGrid=q.map((c,i)=>({id:c.id,name:c.driver.name,teamIdx:c.teamIdx,teamName:c.team.name,grid:i+1,time:c.time,times:{q1:c.time},eliminatedSession:"Q1"}));
    sessions.push({ id:"Q1", name:"Qualifying", duration:12, cars:finalGrid.map((c,i)=>({id:c.id,name:c.name,team:c.teamName,time:c.time,pos:i+1,elim:false})), elim:[] });
    return { format:"single", sessions, finalGrid, pole:finalGrid[0] };
  }
}

/* ---------- TIME TRIAL GHOST ---------- */
function createGhostLap(driver, team, trackId, seed){
  const rng=mulberry32(seed||123);
  const track=TRACKS[trackId]||TRACKS.ashworth;
  const compStats=calcTeamComponentStats(team.components);
  const basePace=(driver.stats.PAC+driver.stats.OVR+compStats.speed*0.5+compStats.cornering*0.5)/2;
  const sectors=track.sectors.map(s=>{
    let t=30;
    t-=(basePace-70)*0.12;
    if(s.stat==="speed"&&compStats.speed>75) t-=0.4;
    if(s.stat==="cornering"&&compStats.cornering>75) t-=0.4;
    if(s.stat==="tyreManagement"&&driver.stats.TYR>75) t-=0.2;
    if(s.stat==="powerUnit"&&compStats.powerUnit>75) t-=0.3;
    t+=(rng()-0.5)*0.8;
    return { name:s.name, time:Math.max(20,t), stat:s.stat };
  });
  const total=sectors.reduce((sum,s)=>sum+s.time,0);
  return { driverId:driver.id, driverName:driver.name, trackId, total, sectors, timestamp:Date.now(), seed };
}
function compareGhosts(ghostA, ghostB){
  if(!ghostA||!ghostB) return null;
  const diffs=ghostA.sectors.map((s,i)=>({ sector:s.name, delta: s.time - (ghostB.sectors[i]?.time||0), a:s.time, b:ghostB.sectors[i]?.time||0 }));
  const totalDelta=ghostA.total-ghostB.total;
  return { diffs, totalDelta, faster: totalDelta<0? ghostA.driverName : ghostB.driverName };
}

/* ============================================================
   RACE ENGINE — 20-CAR GRID, DRS/ERS/FUEL, DAMAGE, GHOST
   ============================================================ */
function createRace(teamA, teamB, opts){
  const o=opts||{};
  const rng=mulberry32(o.seed!=null?o.seed:Math.floor(Math.random()*2**31));
  const track=TRACKS[o.trackId]||TRACKS.ashworth;
  const raceType=RACE_TYPES[o.raceType]||RACE_TYPES.duel;
  const laps=o.laps||track.laps;
  const fullGrid=o.fullGrid||false;
  const setupBonus=o.setupBonus||{ setup:0, quali:0, race:0, tyre:0 };

  let cars=[];
  if(fullGrid){
    const baseStr=o.baseStr||70;
    const allTeams=genFullGrid(rng, baseStr);
    allTeams[0]={ id:0, name:teamA.name, short:teamA.short, col1:teamA.col1||"#e10600", col2:"#fff", drivers:teamA.drivers, components:teamA.components, teamScore:0, setupBonus };
    let carId=0;
    for(let t=0;t<10;t++){
      const team=allTeams[t];
      const compStats=calcTeamComponentStats(team.components);
      for(let d=0;d<2;d++){
        const driver=team.drivers[d]; if(!driver) continue;
        const role=driver.role||"balanced";
        const style=DRIVING_STYLES[driver.style]||DRIVING_STYLES.balanced;
        const activeSkills=skillsActive(driver.skills,role);
        const basePace=(driver.stats.PAC+driver.stats.OVR+compStats.speed*0.5+compStats.cornering*0.5)/2 + (setupBonus.race||0)*0.1;
        const boostIds=(t===0 && teamA.boosts)? (teamA.boosts[d]||[]) : [];
        const boostPace=applyBoostToCar({driver}, boostIds);
        cars.push({
          id:carId++, teamIdx:t, driver, team, compStats, role, style, skills:activeSkills, boostIds, boostPace, pace:basePace+boostPace,
          tyre:(t===0 && teamA.tyre)? teamA.tyre[d]||"medium" : pick(rng,["soft","medium","hard"]), tyreWear:0, pu:100, fuel:100, position:0, lap:0, sector:0, totalTime:0, lastLapTime:0, pitStops:0, instruction:(t===0 && teamA.instruction)? teamA.instruction[d]||"standard" : pick(rng,["standard","standard","conserve"]), mistake:false, dnf:false, gridPos:0, drs:false, ers:100, usedCompounds:new Set(),
          damage:{ frontWing:0, rearWing:0, floor:0, suspension:0, brakes:0, engine:0 }, totalDamage:0, sectors:[], lastSectorTime:0, overtakes:0, drsOvertakes:0, mistakes:0
        });
      }
    }
  } else {
    function teamToCars(team,teamIdx){
      const compStats=calcTeamComponentStats(team.components);
      for(let i=0;i<2;i++){
        const d=team.drivers[i]; if(!d) continue;
        const role=d.role||"balanced";
        const style=DRIVING_STYLES[d.style]||DRIVING_STYLES.balanced;
        const activeSkills=skillsActive(d.skills,role);
        const basePace=(d.stats.PAC+d.stats.OVR+compStats.speed*0.5+compStats.cornering*0.5)/2 + (setupBonus.race||0)*0.1;
        const boostIds=(team.boosts&&team.boosts[i])||[];
        const boostPace=applyBoostToCar({driver:d}, boostIds);
        cars.push({
          id:teamIdx*2+i, teamIdx, driver:d, team, compStats, role, style, skills:activeSkills, boostIds, boostPace, pace:basePace+boostPace,
          tyre:(team.tyre&&team.tyre[i])||"medium", tyreWear:0, pu:100, fuel:100, position:0, lap:0, sector:0, totalTime:0, lastLapTime:0, pitStops:0, instruction:(team.instruction&&team.instruction[i])||"standard", mistake:false, dnf:false, gridPos:0, drs:false, ers:100, usedCompounds:new Set([ (team.tyre&&team.tyre[i])||"medium" ]),
          damage:{ frontWing:0, rearWing:0, floor:0, suspension:0, brakes:0, engine:0 }, totalDamage:0, sectors:[], lastSectorTime:0, overtakes:0, drsOvertakes:0, mistakes:0
        });
      }
    }
    teamToCars(teamA,0); teamToCars(teamB,1);
  }

  // Qualifying for grid
  const qualiTimes=cars.map(c=>{
    const qStat=c.driver.stats.QUA+c.compStats.quali*0.5+(c.skills.includes("Qualifier")?5:0)+ (calcBoostStats(c.boostIds).overtake||0)*0.5 + (setupBonus.quali||0);
    const noise=(rng()-0.5)*3;
    return {car:c, time:90-qStat*0.15+noise};
  }).sort((a,b)=>a.time-b.time);
  qualiTimes.forEach((q,idx)=>{ q.car.gridPos=idx+1; q.car.position=idx+1; q.car.totalTime=idx*0.8; });

  const st={
    lap:1, sector:1, totalSectors:laps*3, sectorIdx:0, safetyCar:false, vsc:false, redFlag:false, scLaps:0, vscLaps:0,
    weather:o.weather||"dry", wetLevel:0, done:false, events:[], pending:null, teamAPoints:0, teamBPoints:0,
    drsEnabled:false, lapForDRS:2
  };

  function calcTeamComponentStats(comps){
    if(!comps) return {speed:70,cornering:70,powerUnit:70,reliability:85,pitTime:3.2,quali:10,drs:70,fuel:70};
    let s=0,c=0,pu=0,rel=0,pt=0,q=0,drs=0,fuel=0,cnt=0;
    for(const k of COMPONENT_TYPES){ const comp=comps[k]; if(!comp) continue; s+=comp.stats.speed; c+=comp.stats.cornering; pu+=comp.stats.powerUnit; rel+=comp.stats.reliability; pt+=comp.stats.pitTime; q+=comp.stats.quali; drs+=comp.stats.drs||70; fuel+=comp.stats.fuel||70; cnt++; }
    if(!cnt) cnt=1;
    return {speed:Math.round(s/cnt),cornering:Math.round(c/cnt),powerUnit:Math.round(pu/cnt),reliability:Math.round(rel/cnt),pitTime:Math.round(pt/cnt*10)/10,quali:Math.round(q),drs:Math.round(drs/cnt),fuel:Math.round(fuel/cnt)};
  }
  function trackBoost(car){
    let boost=1;
    for(const ts of track.trackStats){
      if(ts==="speed"&&car.compStats.speed>75) boost+=0.04;
      if(ts==="cornering"&&car.compStats.cornering>75) boost+=0.04;
      if(ts==="overtaking"&&car.driver.stats.OVR>75) boost+=0.04;
      if(ts==="defending"&&car.driver.stats.DEF>75) boost+=0.04;
      if(ts==="racePace"&&car.driver.stats.PAC>75) boost+=0.03;
      if(ts==="tyreManagement"&&car.driver.stats.TYR>75) boost+=0.03;
      if(ts==="consistency"&&car.driver.stats.CON>75) boost+=0.03;
      if(ts==="powerUnit"&&car.compStats.powerUnit>75) boost+=0.03;
    }
    const bStats=calcBoostStats(car.boostIds);
    if(track.trackStats.includes("overtaking")&&bStats.overtake) boost+=bStats.overtake*0.01;
    if(track.trackStats.includes("defending")&&bStats.defend) boost+=bStats.defend*0.01;
    if(track.trackStats.includes("speed")&&bStats.speed) boost+=bStats.speed*0.008;
    if(car.skills.includes("Setup Guru")) boost+=0.02;
    return boost;
  }
  function damagePenalty(car){
    let pen=0;
    for(const k in car.damage){
      const dmg=car.damage[k];
      const type=DAMAGE_TYPES[k];
      if(type) pen+=dmg/100*type.pace;
    }
    return pen;
  }
  function sectorTime(car, sectorIdx){
    if(car.dnf) return 999;
    const sectorDef=track.sectors[sectorIdx%3]||track.sectors[0];
    const tyreDef=TYRES[car.tyre]||TYRES.medium;
    const instr=RACE_INSTRUCTIONS[car.instruction]||RACE_INSTRUCTIONS.standard;
    const style=car.style;
    let t=30;
    t-=(car.pace-70)*0.12;
    t*=1/(instr.pace*trackBoost(car)*(style.overtake*0.15+0.85));
    t*=1/tyreDef.pace;
    if(sectorDef.stat==="cornering"&&car.compStats.cornering<70) t+=0.3;
    if(sectorDef.stat==="speed"&&car.compStats.speed<70) t+=0.3;
    if(sectorDef.stat==="powerUnit"&&car.compStats.powerUnit<70) t+=0.25;
    if(car.tyreWear>70) t+=0.8; if(car.tyreWear>85) t+=1.5; if(car.tyreWear>95) t+=3;
    if(st.weather==="wet"&&!tyreDef.wet) t+=4;
    if(st.weather==="dry"&&tyreDef.wet) t+=2.5;
    if(st.weather==="damp"){ if(tyreDef.wet) t+=0.5; else if(tyreDef.label==="Soft") t+=1.2; }
    if(car.pu<20&&instr.pace>1) t+=0.6;
    if(car.fuel<20) t+=0.4;
    if(car.fuel>80) t+=0.2;
    if(st.safetyCar) t+=4;
    if(st.vsc) t+=2;
    if(st.redFlag) t+=10;
    // Damage penalty
    t+=damagePenalty(car);
    // DRS
    if(st.drsEnabled&&car.drs){
      const ahead=cars.find(c=>c.position===car.position-1);
      if(ahead && (ahead.totalTime-car.totalTime)<1.0){
        t-=0.3;
        car.drs=true;
      } else car.drs=false;
    }
    // Skills + Boosts
    if(car.skills.includes("Wet Master")&&st.weather!=="dry") t*=1/1.08;
    if(car.skills.includes("Clutch")&&st.lap===laps&&st.sector===3) t*=1/1.10;
    if(car.skills.includes("DRS Master")&&car.drs) t-=0.15;
    const bStats=calcBoostStats(car.boostIds);
    if(bStats.tyreUse) t-=bStats.tyreUse*0.05;
    if(bStats.corners&&track.trackStats.includes("cornering")) t-=bStats.corners*0.04;
    t+=(rng()-0.5)*0.6;
    const mistakeChance=0.015*instr.risk*style.mistake*(car.skills.includes("Consistent")?0.7:1);
    if(rng()<mistakeChance){ t+=1.5+rng()*2; car.mistake=true; car.mistakes++; } else car.mistake=false;
    if(st.lap===laps) t-=0.2;
    return Math.max(20,t);
  }
  function maybeDamage(car, incident){
    if(car.skills.includes("Damage Resistant")&&rng()<0.3) return null;
    const roll=rng();
    let dmgType=null;
    if(roll<0.3) dmgType="frontWing";
    else if(roll<0.5) dmgType="rearWing";
    else if(roll<0.65) dmgType="floor";
    else if(roll<0.80) dmgType="suspension";
    else if(roll<0.90) dmgType="brakes";
    else dmgType="engine";
    const dmgAmount=10+Math.floor(rng()*30);
    car.damage[dmgType]=Math.min(100, car.damage[dmgType]+dmgAmount);
    car.totalDamage=Object.values(car.damage).reduce((a,b)=>a+b,0)/6;
    return { type:"damage", car:car.id, driver:car.driver.name, damageType:dmgType, amount:dmgAmount, lap:st.lap, reason:incident||"Contact" };
  }
  function checkOvertake(attacker,defender){
    if(attacker.dnf||defender.dnf) return false;
    if(Math.abs(attacker.position-defender.position)!==1) return false;
    if(attacker.position<=defender.position) return false;
    const attInstr=RACE_INSTRUCTIONS[attacker.instruction]||RACE_INSTRUCTIONS.standard;
    let chance=0.12;
    chance*=attInstr.overtake; chance*=attacker.style.overtake;
    chance*=1/(defender.style.defend*0.5+0.5);
    if(attacker.skills.includes("Overtake Artist")) chance*=1.18;
    if(defender.skills.includes("Defender")) chance*=0.82;
    if(attacker.tyreWear<defender.tyreWear-15) chance*=1.25;
    if(attacker.pu>defender.pu+20) chance*=1.15;
    if(attacker.fuel<defender.fuel-10) chance*=1.05;
    const paceDiff=attacker.pace-defender.pace; chance*=1+paceDiff*0.02;
    if(track.trackStats.includes("overtaking")) chance*=1.15;
    if(track.trackStats.includes("speed")&&attacker.compStats.speed>defender.compStats.speed) chance*=1.10;
    const attBoost=calcBoostStats(attacker.boostIds); const defBoost=calcBoostStats(defender.boostIds);
    if(attBoost.overtake) chance*=1+attBoost.overtake*0.03;
    if(defBoost.defend) chance*=1-defBoost.defend*0.02;
    if(attBoost.drs&&attacker.drs) chance*=1+attBoost.drs*0.04;
    if(attacker.drs) chance*=1.25;
    // Damage affects defending
    if(defender.totalDamage>30) chance*=1.15;
    if(attacker.totalDamage>40) chance*=0.85;
    if(st.safetyCar||st.vsc||st.redFlag) chance=0;
    return rng()<chance;
  }
  function sortPositions(){
    const active=cars.filter(c=>!c.dnf).sort((a,b)=>{ if(a.lap!==b.lap) return b.lap-a.lap; return a.totalTime-b.totalTime; });
    const dnf=cars.filter(c=>c.dnf);
    const ordered=[...active,...dnf];
    ordered.forEach((c,i)=>c.position=i+1);
  }
  function maybeSafetyCar(){
    if(st.safetyCar){ st.scLaps--; if(st.scLaps<=0){ st.safetyCar=false; st.events.push({type:"safetyCarIn",lap:st.lap,sector:st.sector}); st.drsEnabled=false; } return; }
    if(st.vsc){ st.vscLaps--; if(st.vscLaps<=0){ st.vsc=false; st.events.push({type:"vscIn",lap:st.lap}); } return; }
    if(st.redFlag){ return; }
    const baseChance=track.scChance*0.03;
    if(rng()<baseChance){
      const roll=rng();
      if(roll<0.6){
        st.safetyCar=true; st.scLaps=2+Math.floor(rng()*2);
        st.events.push({type:"safetyCarOut",lap:st.lap,sector:st.sector,reason:pick(rng,["Incident at Turn 4","Debris on track","Car stopped","Collision"])});
        const leaderTime=Math.min(...cars.filter(c=>!c.dnf).map(c=>c.totalTime));
        cars.forEach(c=>{ if(!c.dnf){ const gap=c.totalTime-leaderTime; c.totalTime=leaderTime+gap*0.3; } });
        // Damage chance under SC incident
        const damagedCar=pick(rng,cars.filter(c=>!c.dnf));
        if(damagedCar&&rng()<0.4){
          const dmgEv=maybeDamage(damagedCar,"Incident causing Safety Car");
          if(dmgEv) st.events.push(dmgEv);
        }
      } else if(roll<0.85){
        st.vsc=true; st.vscLaps=1+Math.floor(rng()*2);
        st.events.push({type:"vscOut",lap:st.lap,sector:st.sector,reason:"Hazard on track"});
      } else {
        st.redFlag=true;
        st.events.push({type:"redFlag",lap:st.lap,reason:"Heavy crash — session stopped"});
        setTimeout(()=>{ st.redFlag=false; st.events.push({type:"redFlagIn",lap:st.lap}); }, 0);
      }
    }
  }
  function maybeWeather(){
    if(rng()<0.015){
      if(st.weather==="dry"&&rng()<track.wetChance){ st.weather="damp"; st.wetLevel=30; st.events.push({type:"weather",from:"dry",to:"damp",lap:st.lap}); }
      else if(st.weather==="damp"){ if(rng()<0.5){ st.weather="wet"; st.wetLevel=70; st.events.push({type:"weather",from:"damp",to:"wet",lap:st.lap}); } else { st.weather="dry"; st.wetLevel=0; st.events.push({type:"weather",from:"damp",to:"dry",lap:st.lap}); } }
      else if(st.weather==="wet"&&rng()<0.3){ st.weather="damp"; st.wetLevel=40; st.events.push({type:"weather",from:"wet",to:"damp",lap:st.lap}); }
    }
  }
  function maybeMechanical(){
    for(const car of cars){ if(car.dnf) continue; const failChance=(100-car.compStats.reliability)/100*0.003*(1+car.totalDamage/100); if(rng()<failChance){ car.dnf=true; st.events.push({type:"dnf",car:car.id,driver:car.driver.name,lap:st.lap,reason:"Mechanical failure"}); } }
  }
  function maybeContactDamage(){
    if(rng()<0.02){
      const c1=pick(rng,cars.filter(c=>!c.dnf));
      const c2=cars.find(c=>c.position===c1.position-1||c.position===c1.position+1);
      if(c1&&c2&&!c2.dnf&&rng()<0.3){
        const dmg1=maybeDamage(c1,"Contact with "+c2.driver.name);
        const dmg2=maybeDamage(c2,"Contact with "+c1.driver.name);
        if(dmg1) st.events.push(dmg1);
        if(dmg2) st.events.push(dmg2);
      }
    }
  }
  function checkPitNeeded(car){
    if(car.tyreWear>88) return true;
    if(car.fuel<15) return true;
    if(car.totalDamage>50) return true;
    if(st.weather==="wet"&&!TYRES[car.tyre].wet) return true;
    if(st.weather==="dry"&&TYRES[car.tyre].wet) return true;
    if(st.weather==="damp"&&TYRES[car.tyre].label==="Soft"&&car.tyreWear>60) return true;
    if(st.safetyCar&&car.tyreWear>55&&rng()<0.6) return true;
    if(st.vsc&&car.tyreWear>60&&rng()<0.5) return true;
    if(raceType.tyreRule&&st.lap>laps*0.6&&car.usedCompounds.size<2) return true;
    return false;
  }
  function doPit(car,newTyre,newInstr,repairDamage){
    const basePit=car.compStats.pitTime;
    const skillMod=car.skills.includes("Pit King")?-0.4:0;
    const boostStats=calcBoostStats(car.boostIds);
    const boostPit=boostStats.reliability? -0.1*boostStats.reliability : 0;
    let repairTime=0;
    let repaired=[];
    if(repairDamage&&car.totalDamage>0){
      for(const k in car.damage){
        if(car.damage[k]>0){
          const type=DAMAGE_TYPES[k];
          repairTime+=type.repair*(car.damage[k]/100);
          repaired.push({ part:k, label:type.label, icon:type.icon, amount:car.damage[k] });
          car.damage[k]=0;
        }
      }
      car.totalDamage=0;
    }
    const pitTime=basePit+skillMod+boostPit+repairTime+(rng()-0.5)*0.6;
    car.totalTime+=pitTime; car.tyre=newTyre; car.tyreWear=0; car.fuel=100; car.pitStops++; car.usedCompounds.add(newTyre);
    if(newInstr) car.instruction=newInstr;
    st.events.push({type:"pit",car:car.id,driver:car.driver.name,tyre:newTyre,time:pitTime.toFixed(1),lap:st.lap,repair:repaired.length?true:false,repaired,repairTime:repairTime.toFixed(1)});
  }

  function step(){
    if(st.done) return {sector:st.sectorIdx,lap:st.lap,events:[],decision:null,done:true,positions:cars.map(c=>({id:c.id,pos:c.position,time:c.totalTime,tyre:c.tyre,wear:Math.round(c.tyreWear),pu:Math.round(c.pu),fuel:Math.round(c.fuel),dnf:c.dnf,damage:c.damage,totalDamage:Math.round(c.totalDamage)}))};
    st.sectorIdx++; st.sector=((st.sectorIdx-1)%3)+1; st.lap=Math.floor((st.sectorIdx-1)/3)+1;
    if(st.lap>laps){ st.done=true; return finish(); }
    if(st.lap>=st.lapForDRS) st.drsEnabled=true;
    const sectorEvents=[];
    maybeWeather(); maybeSafetyCar(); maybeMechanical(); maybeContactDamage();
    for(const car of cars){
      if(car.dnf) continue;
      const t=sectorTime(car, st.sector-1);
      car.totalTime+=t; car.lastLapTime+=t; car.lastSectorTime=t;
      car.sectors.push({ lap:st.lap, sector:st.sector, time:t, total:car.totalTime });
      if(st.sector===3){ car.lap++; car.lastLapTime=0; }
      const tyreDef=TYRES[car.tyre]||TYRES.medium;
      const instr=RACE_INSTRUCTIONS[car.instruction]||RACE_INSTRUCTIONS.standard;
      const bStats=calcBoostStats(car.boostIds);
      const tyreSave=bStats.tyreUse?1-bStats.tyreUse*0.04:1;
      const fuelSave=bStats.fuelSave?1-bStats.fuelSave*0.04:1;
      const wearRate=tyreDef.wear*instr.tyre*car.style.tyreWear*(car.skills.includes("Tyre Saver")?0.85:1)*(car.skills.includes("Fuel Saver")?0.95:1)*track.wear*tyreSave;
      car.tyreWear+=wearRate*(10+rng()*4);
      car.pu+=instr.pu*(car.compStats.powerUnit/80)*(car.skills.includes("Power Whisperer")?1.15:1)*(bStats.puRecharge?1+bStats.puRecharge*0.05:1);
      car.pu=Math.max(0,Math.min(100,car.pu));
      car.fuel+=instr.fuel*(car.compStats.fuel/80)*(car.skills.includes("Fuel Saver")?0.85:1)*(bStats.fuelSave?1-bStats.fuelSave*0.05:1);
      car.fuel=Math.max(0,Math.min(100,car.fuel));
      if(o.auto||car.teamIdx!==0){ if(checkPitNeeded(car)){ let nextTyre="medium"; if(st.weather==="wet") nextTyre="wet"; else if(st.weather==="damp") nextTyre="intermediate"; else if(car.lap>laps*0.6) nextTyre="soft"; else if(rng()<0.5) nextTyre="medium"; else nextTyre="hard";
        if(raceType.tyreRule&&car.usedCompounds.size<2){ const unused=["soft","medium","hard"].filter(c=>!car.usedCompounds.has(c)); if(unused.length) nextTyre=pick(rng,unused); }
        doPit(car,nextTyre,null,car.totalDamage>20); } }
    }
    sortPositions();
    const ordered=[...cars].sort((a,b)=>b.position-a.position);
    for(const att of ordered){
      if(att.dnf) continue; const def=cars.find(c=>c.position===att.position-1); if(!def) continue;
      if(checkOvertake(att,def)){
        const tmpTime=att.totalTime; att.totalTime=def.totalTime-0.15; def.totalTime=tmpTime+0.15;
        att.overtakes++; if(att.drs) att.drsOvertakes++;
        st.events.push({type:"overtake",attacker:att.id,defender:def.id,lap:st.lap,sector:st.sector,attName:att.driver.name,defName:def.driver.name,drs:att.drs,sectorTime:att.lastSectorTime});
        sectorEvents.push({type:"overtake",att:att.driver.name,def:def.driver.name});
        sortPositions();
      }
    }
    let decision=null;
    const playerCars=cars.filter(c=>c.teamIdx===0&&!c.dnf);
    const needPit=playerCars.some(c=>c.tyreWear>82||c.fuel<20||c.totalDamage>40||(st.weather==="wet"&&!TYRES[c.tyre].wet)||(st.weather==="dry"&&TYRES[c.tyre].wet));
    const bigEvent=st.events.some(e=>e.type==="safetyCarOut"||e.type==="vscOut"||e.type==="redFlag"||e.type==="weather"||e.type==="damage");
    if(!o.auto&&(needPit||bigEvent||st.lap===Math.floor(laps/2))){
      if(st.sector===2&&!st.pending){
        decision={type:needPit?"pit":bigEvent?"strategy":"tactical",lap:st.lap,weather:st.weather,safetyCar:st.safetyCar,vsc:st.vsc,redFlag:st.redFlag,drs:st.drsEnabled,cars:playerCars.map(c=>({id:c.id,name:c.driver.name,tyre:c.tyre,wear:Math.round(c.tyreWear),pu:Math.round(c.pu),fuel:Math.round(c.fuel),pos:c.position,used:Array.from(c.usedCompounds),damage:c.damage,totalDamage:Math.round(c.totalDamage),overtakes:c.overtakes}))};
        st.pending=decision;
      }
    }
    const allEvents=[...st.events.splice(0,st.events.length),...sectorEvents];
    if(st.lap>=laps&&st.sector===3) st.done=true;
    return {sector:st.sectorIdx,lap:st.lap,sectorInLap:st.sector,events:allEvents,decision,done:st.done,positions:cars.map(c=>({id:c.id,teamIdx:c.teamIdx,name:c.driver.name,pos:c.position,time:c.totalTime,gap:c.totalTime-Math.min(...cars.filter(x=>!x.dnf).map(x=>x.totalTime)),tyre:c.tyre,wear:Math.round(c.tyreWear),pu:Math.round(c.pu),fuel:Math.round(c.fuel),dnf:c.dnf,grid:c.gridPos,boosts:c.boostIds,drs:c.drs,used:Array.from(c.usedCompounds),damage:c.damage,totalDamage:Math.round(c.totalDamage),overtakes:c.overtakes,drsOvertakes:c.drsOvertakes,lastSectorTime:c.lastSectorTime,sectors:c.sectors.slice(-3)})),weather:st.weather,safetyCar:st.safetyCar,vsc:st.vsc,redFlag:st.redFlag,drsEnabled:st.drsEnabled,raceType:raceType.id,track:track.id};
  }

  function finish(){
    const finishOrder=[...cars].sort((a,b)=>{ if(a.dnf&&!b.dnf) return 1; if(!a.dnf&&b.dnf) return -1; if(a.dnf&&b.dnf) return 0; return a.totalTime-b.totalTime; });
    const pointsSystem=raceType.points.length?raceType.points:[25,18,15,12,10,8,6,4,2,1];
    let teamAPts=0,teamBPts=0;
    const driverPoints={};
    // Fastest lap
    let fastestLapTime=Infinity; let fastestCar=null;
    for(const car of cars){ if(!car.dnf&&car.sectors.length){ const lapTimes={}; car.sectors.forEach(s=>{ if(!lapTimes[s.lap]) lapTimes[s.lap]=0; lapTimes[s.lap]+=s.time; }); for(const lap in lapTimes){ if(lapTimes[lap]<fastestLapTime){ fastestLapTime=lapTimes[lap]; fastestCar=car; } } } }
    finishOrder.forEach((c,i)=>{
      if(c.dnf) return;
      const pts=pointsSystem[i]||0;
      driverPoints[c.driver.name]=(driverPoints[c.driver.name]||0)+pts;
      if(c.teamIdx===0) teamAPts+=pts; else if(!fullGrid) teamBPts+=pts;
      if(c===fastestCar) c.fastestLap=true;
    });
    if(raceType.tyreRule){
      for(const car of cars){
        if(car.dnf) continue;
        if(car.usedCompounds.size<2&&!Array.from(car.usedCompounds).some(c=>TYRES[c].wet)){
          car.totalTime+=10;
          st.events.push({type:"penalty",car:car.id,driver:car.driver.name,reason:"Tyre rule: must use 2 compounds"});
        }
      }
      finishOrder.sort((a,b)=>{ if(a.dnf&&!b.dnf) return 1; if(!a.dnf&&b.dnf) return -1; return a.totalTime-b.totalTime; });
    }
    const meta={
      overtakes: cars.filter(c=>c.teamIdx===0).reduce((s,c)=>s+c.overtakes,0),
      drsOvertakes: cars.filter(c=>c.teamIdx===0).reduce((s,c)=>s+c.drsOvertakes,0),
      mistakes: cars.filter(c=>c.teamIdx===0).reduce((s,c)=>s+c.mistakes,0),
      minFuel: Math.min(...cars.filter(c=>c.teamIdx===0).map(c=>c.fuel)),
      tyreRuleOk: cars.filter(c=>c.teamIdx===0).every(c=>c.usedCompounds.size>=2||Array.from(c.usedCompounds).some(t=>TYRES[t].wet)),
      fastestLap: fastestCar?.teamIdx===0,
      totalDamage: cars.filter(c=>c.teamIdx===0).reduce((s,c)=>s+c.totalDamage,0)
    };
    // Sponsor tasks
    const sponsorResults=[];
    for(const taskId in SPONSOR_TASKS){
      const task=SPONSOR_TASKS[taskId];
      const done=task.check({finishingOrder:finishOrder.map((c,i)=>({pos:i+1,teamIdx:c.teamIdx,fastest:c.fastestLap}))}, meta);
      if(done) sponsorResults.push({ id:taskId, ...task, done });
    }
    return {done:true,finishingOrder:finishOrder.map((c,i)=>({pos:i+1,id:c.id,name:c.driver.name,teamIdx:c.teamIdx,teamName:c.team.name,short:c.team.short||c.team.name.slice(0,3),time:c.totalTime,dnf:c.dnf,points:c.dnf?0:pointsSystem[i]||0,fastest:c.fastestLap||false,tyre:c.tyre,used:Array.from(c.usedCompounds),damage:c.damage,totalDamage:c.totalDamage,sectors:c.sectors, overtakes:c.overtakes})),teamAPoints:teamAPts,teamBPoints:teamBPts,winner:fullGrid? (finishOrder[0]?.teamIdx===0?0:1) : (teamAPts>teamBPts?0:teamAPts<teamBPts?1:-1),positions:cars.map(c=>({id:c.id,teamIdx:c.teamIdx,name:c.driver.name,pos:c.position,time:c.totalTime,dnf:c.dnf})),driverPoints,raceType:raceType.id,fastestLap:{ time:fastestLapTime, driver:fastestCar?.driver.name||"None" },meta,sponsorResults,track:track.id,laps};
  }
  function decide(choices){
    if(!st.pending) return {events:[]};
    st.pending=null; const evs=[];
    for(const ch of choices||[]){
      const car=cars.find(c=>c.id===ch.carId); if(!car) continue;
      if(ch.instruction) car.instruction=ch.instruction;
      if(ch.pit){ doPit(car,ch.tyre||"medium",ch.instruction||null,ch.repair||false); evs.push({type:"playerPit",car:car.id,tyre:ch.tyre,repair:ch.repair}); }
    }
    return {events:evs,done:st.done};
  }
  function result(){ return finish(); }
  return {step,decide,result,state:st,cars,track,laps,raceType};
}

function calcTeamComponentStats(comps){
  if(!comps) return {speed:70,cornering:70,powerUnit:70,reliability:85,pitTime:3.2,quali:10,drs:70,fuel:70};
  let s=0,c=0,pu=0,rel=0,pt=0,q=0,drs=0,fuel=0,cnt=0;
  for(const k of COMPONENT_TYPES){ const comp=comps[k]; if(!comp) continue; s+=comp.stats.speed; c+=comp.stats.cornering; pu+=comp.stats.powerUnit; rel+=comp.stats.reliability; pt+=comp.stats.pitTime; q+=comp.stats.quali; drs+=comp.stats.drs||70; fuel+=comp.stats.fuel||70; cnt++; }
  if(!cnt) cnt=1;
  return {speed:Math.round(s/cnt),cornering:Math.round(c/cnt),powerUnit:Math.round(pu/cnt),reliability:Math.round(rel/cnt),pitTime:Math.round(pt/cnt*10)/10,quali:Math.round(q),drs:Math.round(drs/cnt),fuel:Math.round(fuel/cnt)};
}
function teamScore(team){
  if(!team||!team.drivers||!team.components) return 40;
  const comp=calcTeamComponentStats(team.components);
  const driverAvg=team.drivers.reduce((sum,d)=>sum+calcDriverOVR(d.stats,d.role||"balanced"),0)/Math.max(1,team.drivers.length);
  return Math.round((driverAvg*0.6+comp.speed*0.15+comp.cornering*0.15+comp.powerUnit*0.05+comp.quali*0.05)*10)/10;
}
function winProbs(teamA,teamB,trackId,n){
  n=n||300; let w=0,d=0,l=0;
  for(let i=0;i<n;i++){ const r=simulateRace(teamA,teamB,{seed:777000+i*13,trackId,auto:true,fast:true}); if(r.teamAPoints>r.teamBPoints) w++; else if(r.teamAPoints<r.teamBPoints) l++; else d++; }
  return {home:Math.round(w/n*100),draw:Math.round(d/n*100),away:Math.round(l/n*100)};
}
function simulateRace(teamA,teamB,opts){
  const o=opts||{}; const race=createRace(teamA,teamB,{seed:o.seed,trackId:o.trackId,laps:o.laps,raceType:o.raceType,auto:true,weather:o.weather,fullGrid:o.fullGrid,baseStr:o.baseStr,setupBonus:o.setupBonus});
  const events=[]; while(true){ const s=race.step(); if(!o.fast) for(const e of s.events) events.push(e); if(s.done) break; }
  const res=race.result(); return Object.assign({events:o.fast?[]:events},res);
}
function qualify(teamA,teamB,trackId,seed,fullGrid){
  const rng=mulberry32(seed||123);
  const race=createRace(teamA,teamB,{seed,trackId,auto:true,fullGrid:!!fullGrid});
  return race.cars.map(c=>({id:c.id,name:c.driver.name,teamIdx:c.teamIdx,teamName:c.team.name,grid:c.gridPos,time:90-c.driver.stats.QUA*0.15+(rng()-0.5)*2})).sort((a,b)=>a.grid-b.grid);
}
function genDriver(rng,region,role,ovr){
  const age=18+Math.floor(rng()*17);
  const pot=Math.min(94,ovr+(age<22?6+Math.floor(rng()*8):age<27?2+Math.floor(rng()*5):0));
  const stats=baseDriverStats(role);
  for(const k in stats) stats[k]=Math.max(40,Math.min(95,stats[k]+Math.floor((rng()-0.5)*10)));
  const ovrCalc=calcDriverOVR(stats,role);
  const isLegendary=rng()<0.04;
  return {id:Math.floor(rng()*1e9),name:genDriverName(rng,region),role,age,stats,ovr:ovrCalc,pot,fit:100,value:(ovrCalc-50)*0.1+1,wage:Math.round(4+Math.pow(Math.max(0,ovrCalc-50),1.6)*0.55),style:pick(rng,Object.keys(DRIVING_STYLES)),skills:[],rarity:isLegendary?"legendary":ovr>82?"epic":ovr>74?"rare":"common",isLegendary};
}
function genTeam(rng,region,baseStr){
  const roles=["qualifier","racer","balanced","whisperer"];
  const drivers=[]; for(let i=0;i<4;i++){ const role=roles[i%4]; drivers.push(genDriver(rng,region,role,Math.round(baseStr+(rng()-0.5)*8))); }
  const components={}; const rarities=["common","rare","epic"];
  for(const type of COMPONENT_TYPES){ const rar=pick(rng,rarities); components[type]=genComponent(rng,type,rar,baseStr); }
  return {drivers,components};
}

const Engine={ mulberry32, hashSeed, pick, genDriverName, REGIONS, DRIVER_ROLES, DRIVING_STYLES, RACE_INSTRUCTIONS, COMPONENT_TYPES, COMPONENT_RARITY, TRACKS, TRACK_LIST, RACE_TYPES, PRACTICE_SESSIONS, QUALI_FORMATS, TYRES, BOOSTS, BOOST_LIST, DAMAGE_TYPES, SPONSOR_TASKS, calcBoostStats, applyBoostToCar, DRIVER_SKILLS, SKILL_POS, skillsFor, skillLegal, skillsActive, skillMul, createRace, simulateRace, winProbs, qualify, simulateQualifyingKnockout, simulatePractice, createGhostLap, compareGhosts, teamScore, calcTeamComponentStats, genDriver, genComponent, genTeam, genFullGrid, baseDriverStats, calcDriverOVR };
if(typeof module!=="undefined") module.exports=Engine;
if(typeof window!=="undefined") window.Engine=Engine;

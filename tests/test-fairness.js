// F1 Clash Zero — Fairness Test (mirrors Football Legend test-fairness.js)
// Ensures displayed win % == true engine odds
const Engine = require("../game/engine.js");

function testFairness() {
  console.log("=== F1 Fairness Test: winProbs() vs simulateRace() ===");
  const rng = Engine.mulberry32(12345);
  const region = "britain";
  const teamA = Engine.genTeam(rng, region, 70);
  const teamB = Engine.genTeam(rng, region, 70);
  const trackId = "beaumont";

  // Normalize to Team format
  const tA = { name:"Team A", short:"TMA", drivers: teamA.drivers.slice(0,2), components: teamA.components, instruction:["standard","standard"], tyre:["medium","medium"] };
  const tB = { name:"Team B", short:"TMB", drivers: teamB.drivers.slice(0,2), components: teamB.components, instruction:["standard","standard"], tyre:["medium","medium"] };

  const probs = Engine.winProbs(tA, tB, trackId, 500);
  console.log(`Displayed odds: Home ${probs.home}% Draw ${probs.draw}% Away ${probs.away}%`);

  // Re-run 500 to verify close
  let w=0,l=0,d=0;
  for (let i=0;i<500;i++) {
    const r = Engine.simulateRace(tA, tB, { seed: 999000+i*7, trackId, auto:true, fast:true });
    if (r.teamAPoints > r.teamBPoints) w++;
    else if (r.teamAPoints < r.teamBPoints) l++;
    else d++;
  }
  const actual = { home: Math.round(w/500*100), draw: Math.round(d/500*100), away: Math.round(l/500*100) };
  console.log(`Actual  odds: Home ${actual.home}% Draw ${actual.draw}% Away ${actual.away}%`);

  const diffHome = Math.abs(probs.home - actual.home);
  const diffAway = Math.abs(probs.away - actual.away);
  console.log(`Diff: Home ${diffHome}% Away ${diffAway}%`);

  if (diffHome <= 5 && diffAway <=5) {
    console.log("✅ PASS — odds honest within 5% tolerance (Monte Carlo variance)");
    process.exit(0);
  } else {
    console.log("❌ FAIL — odds mismatch >5%, possible rigging");
    process.exit(1);
  }
}

testFairness();

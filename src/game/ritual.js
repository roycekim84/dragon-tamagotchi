import { canRitual } from "./moon.js";

const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));

export function calcRitualChance(stats, synergyBonus = 0) {
  let p = 0.50;
  p += Math.max(0, Math.min(15, (stats.health - 60) * 0.5)) / 100;
  p += Math.max(0, Math.min(12, (stats.mood - 40) * 0.3)) / 100;
  p += Math.max(0, Math.min(15, synergyBonus)) / 100;
  return clamp(p, 0.05, 0.95);
}

export function tryRitual(state, phase) {
  if (!canRitual(phase)) return { ok:false, reason:"not_available" };
  if (state.stats.health < 60 || state.stats.mood < 40) return { ok:false, reason:"requirements" };
  if (!state.runes.slot1 || !state.runes.slot2 || !state.runes.slot3) return { ok:false, reason:"need_runes" };

  const chance = calcRitualChance(state.stats, 8); // MVP: 고정 시너지 보너스
  const roll = Math.random();
  const success = roll < chance;

  // 결과 반영
  if (!success) {
    state.stats.energy = Math.max(0, state.stats.energy - 10);
    state.stats.mood = Math.max(0, state.stats.mood - 5);
  } else {
    // MVP: 우선 "희귀 해금 토큰"을 하나 준다고 치자
    // (나중에 룬 테마/위상별로 분기)
    state.ritual.rareUnlocks.star = true;
  }

  state.ritual.lastResult = { success, chance, roll, at: Date.now(), phase };
  return { ok:true, success, chance, roll };
}

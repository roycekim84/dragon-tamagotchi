const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));

export function applyOfflineProgress(state, now = Date.now()) {
  const last = state.meta.lastTickAt ?? now;
  const dtMs = Math.max(0, now - last);
  const hours = dtMs / (1000 * 60 * 60);

  // 시간당 감소량(MVP)
  state.stats.hunger = clamp(state.stats.hunger - 8 * hours);
  state.stats.clean  = clamp(state.stats.clean  - 5 * hours);
  state.stats.mood   = clamp(state.stats.mood   - 4 * hours);
  state.stats.energy = clamp(state.stats.energy - 6 * hours);

  // health는 조건부로 감소
  const bad = (state.stats.hunger < 20) || (state.stats.clean < 20);
  if (bad) state.stats.health = clamp(state.stats.health - 2 * hours);

  state.meta.lastTickAt = now;
}

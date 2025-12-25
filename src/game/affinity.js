const clamp = (v, a=0, b=100) => Math.max(a, Math.min(b, v));

export function addAffinity(state, element, amount) {
  if (!state.affinity[element] && state.affinity[element] !== 0) return;
  state.affinity[element] = clamp(state.affinity[element] + amount);
}

export function gainExp(state, amount) {
  state.dragon.exp += amount;
}

export function maybeEvolve(state) {
  const exp = state.dragon.exp;

  if (state.dragon.stage === "hatchling" && exp >= 100) {
    state.dragon.stage = "juvenile";
    return { evolved:true, to:"juvenile" };
  }
  if (state.dragon.stage === "juvenile" && exp >= 300) {
    state.dragon.stage = "adult";
    // MVP: 가장 높은 친화도로 원소 결정
    const best = Object.entries(state.affinity).sort((a,b)=>b[1]-a[1])[0];
    state.dragon.element = best?.[0] ?? "fire";
    return { evolved:true, to:"adult", element: state.dragon.element };
  }
  return { evolved:false };
}

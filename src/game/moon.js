export const MOON_PHASES = ["NEW","WAX_CRES","FIRST_Q","WAX_GIB","FULL","WAN_GIB","LAST_Q","WAN_CRES"];

export function getMoonPhaseIndex(date = new Date()) {
  // 8일 주기(서버/클라 기준 일단 단순)
  const day = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return day % 8;
}

export function canRitual(phase) {
  return phase === "NEW" || phase === "FULL";
}

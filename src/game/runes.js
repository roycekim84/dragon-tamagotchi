// MVP: 룬은 그냥 id만. 나중에 catalog 붙이면 됨.
export const RUNE_POOL = [
  "fire_core","water_tide","wind_gale","earth_stone","light_radiance","dark_shadow"
];

export function randomRune() {
  return RUNE_POOL[Math.floor(Math.random() * RUNE_POOL.length)];
}

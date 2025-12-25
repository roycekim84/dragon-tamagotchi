export function createInitialState() {
  return {
    dragon: {
      name: "루키",
      stage: "hatchling", // hatchling -> juvenile -> adult
      element: "none",    // none | fire | water | wind | earth | light | dark
      exp: 0,
      coins: 0,
    },
    stats: {
      hunger: 70,
      clean: 70,
      mood: 70,
      energy: 70,
      health: 80,
    },
    affinity: { fire: 0, water: 0, wind: 0, earth: 0, light: 0, dark: 0 },
    runes: { slot1: null, slot2: null, slot3: null },
    ritual: { lastResult: null, rareUnlocks: { star:false, abyss:false, ancient:false } },
    meta: { lastTickAt: Date.now(), lastSaveAt: Date.now() },
  };
}

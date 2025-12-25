import { createInitialState } from "./game/state.js";
import { applyOfflineProgress } from "./game/tick.js";
import { getMoonPhaseIndex, MOON_PHASES } from "./game/moon.js";
import { addAffinity } from "./game/affinity.js";
import { randomRune } from "./game/runes.js";
import { tryRitual } from "./game/ritual.js";
import { gainExp, maybeEvolve } from "./game/evolution.js";
import { SpritePlayer } from "./game/renderer/spritePlayer.js";

const $ = (id) => document.getElementById(id);

const state = loadState() ?? createInitialState();
applyOfflineProgress(state);

const player = new SpritePlayer($("dragonCanvas"), 5);
const logLine = $("logLine");
const overlayText = $("overlayText");

setupTabs();
setupButtons();
renderAll();

let last = performance.now();
function loop(now) {
  const dt = (now - last) / 1000; last = now;

  // 자동 틱(1초마다 저장된 lastTickAt로도 굴리지만, 화면은 부드럽게)
  // 여기서는 매 프레임 스탯 변화는 안 하고, 애니만.
  const anim = pickAnim(state.stats);
  player.setAnim(anim);
  player.update(dt);
  player.draw(state.dragon.element === "none" ? "none" : state.dragon.element);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function pickAnim(stats) {
  if (stats.health < 30) return "hurt";
  if (stats.energy < 25) return "tired";
  // happy는 간단히 mood가 높으면
  if (stats.mood > 75) return "happy";
  return "idle";
}

function setupButtons() {
  $("btnSave").onclick = () => { saveState(state); log("saved"); };

  $("btnFeed").onclick = () => {
    state.stats.hunger = Math.min(100, state.stats.hunger + 25);
    state.stats.clean  = Math.max(0, state.stats.clean - 2);
    gainExp(state, 3);
    addAffinity(state, "water", 2); // MVP: 먹이는 물 친화도 살짝 (임시)
    postAction();
    log("마나 먹이 +25");
  };

  $("btnGroom").onclick = () => {
    state.stats.clean = Math.min(100, state.stats.clean + 30);
    state.stats.mood  = Math.min(100, state.stats.mood + 3);
    gainExp(state, 2);
    addAffinity(state, "earth", 2);
    postAction();
    log("비늘 손질 +30");
  };

  $("btnPlay").onclick = () => {
    state.stats.mood   = Math.min(100, state.stats.mood + 25);
    state.stats.energy = Math.max(0, state.stats.energy - 10);
    state.stats.hunger = Math.max(0, state.stats.hunger - 5);
    gainExp(state, 4);
    addAffinity(state, "wind", 3);
    postAction();
    log("교감 +25");
  };

  $("btnRest").onclick = () => {
    state.stats.energy = Math.min(100, state.stats.energy + 40);
    state.stats.hunger = Math.max(0, state.stats.hunger - 5);
    gainExp(state, 2);
    addAffinity(state, "light", 1);
    postAction();
    log("휴식 +40");
  };
}

function postAction() {
  // 간단 회복/패널티
  if (state.stats.hunger < 10 || state.stats.clean < 10) {
    state.stats.health = Math.max(0, state.stats.health - 2);
  } else {
    state.stats.health = Math.min(100, state.stats.health + 0.5);
  }

  const evo = maybeEvolve(state);
  if (evo.evolved) log(`진화! → ${evo.to}${evo.element ? " ("+evo.element+")" : ""}`);

  renderAll();
  saveState(state);
}

function renderAll() {
  // meta line
  const phase = MOON_PHASES[getMoonPhaseIndex(new Date())];
  $("metaLine").textContent =
    `${state.dragon.name} / ${state.dragon.stage} / element=${state.dragon.element} / moon=${phase} / exp=${Math.floor(state.dragon.exp)}`;

  overlayText.textContent = `anim=${pickAnim(state.stats)}`;

  renderBars();
  renderAffinity();
  renderRunes();
  renderRitual();
}

function renderBars() {
  const bars = $("bars");
  const list = [
    ["마나(허기)", "hunger"],
    ["비늘(청결)", "clean"],
    ["야성(기분)", "mood"],
    ["비행력", "energy"],
    ["생명력", "health"],
  ];
  bars.innerHTML = list.map(([label, key]) => {
    const v = state.stats[key];
    return `
      <div class="bar">
        <label>${label}</label>
        <div class="track"><div class="fill" style="width:${v}%"></div></div>
        <span>${Math.floor(v)}</span>
      </div>
    `;
  }).join("");
}

function renderAffinity() {
  const el = $("tab-affinity");
  const entries = Object.entries(state.affinity).sort((a,b)=>b[1]-a[1]);
  el.innerHTML = `
    <div style="display:grid; gap:8px;">
      <div style="color:#9aa4bd;font-size:12px;">숨결 훈련은 다음 단계에서 붙이고, 지금은 버튼 행동으로 친화도가 오릅니다(임시).</div>
      ${entries.map(([k,v]) => `<div>${k}: <b>${Math.floor(v)}</b></div>`).join("")}
    </div>
  `;
}

function renderRunes() {
  const el = $("tab-runes");
  el.innerHTML = `
    <div style="display:grid; gap:10px;">
      <div>슬롯: 
        <b>1</b> ${state.runes.slot1 ?? "-"} |
        <b>2</b> ${state.runes.slot2 ?? "-"} |
        <b>3</b> ${state.runes.slot3 ?? "-"}
      </div>
      <button class="btn" id="btnGetRune">랜덤 룬 획득</button>
      <div style="color:#9aa4bd;font-size:12px;">MVP: 룬은 id만 존재. 나중에 아이콘/효과/테마 확장.</div>
    </div>
  `;
  el.querySelector("#btnGetRune").onclick = () => {
    const r = randomRune();
    // 빈 슬롯부터 채움
    if (!state.runes.slot1) state.runes.slot1 = r;
    else if (!state.runes.slot2) state.runes.slot2 = r;
    else if (!state.runes.slot3) state.runes.slot3 = r;
    else state.runes.slot1 = r; // MVP: 꽉 차면 1번 덮어쓰기
    renderAll();
    saveState(state);
    log(`룬 획득: ${r}`);
  };
}

function renderRitual() {
  const el = $("tab-ritual");
  const phase = MOON_PHASES[getMoonPhaseIndex(new Date())];
  el.innerHTML = `
    <div style="display:grid; gap:10px;">
      <div>오늘 달 위상: <b>${phase}</b></div>
      <div>요구조건: health≥60, mood≥40, 룬 3개 장착</div>
      <button class="btn" id="btnRitual">달의 의식 시도</button>
      <div style="color:#9aa4bd;font-size:12px;">MVP: 성공하면 star 희귀 해금 true(임시).</div>
      <pre style="margin:0; white-space:pre-wrap; color:#9aa4bd;">${state.ritual.lastResult ? JSON.stringify(state.ritual.lastResult,null,2) : "no ritual yet"}</pre>
      <div>희귀 해금: ${JSON.stringify(state.ritual.rareUnlocks)}</div>
    </div>
  `;
  el.querySelector("#btnRitual").onclick = () => {
    const res = tryRitual(state, phase);
    if (!res.ok) log(`의식 불가: ${res.reason}`);
    else log(res.success ? `의식 성공! (p=${res.chance.toFixed(2)})` : `의식 실패 (p=${res.chance.toFixed(2)})`);
    renderAll();
    saveState(state);
  };
}

function setupTabs() {
  document.querySelectorAll(".tab").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
      document.querySelectorAll(".tabpane").forEach(p=>p.classList.remove("active"));
      btn.classList.add("active");
      const name = btn.dataset.tab;
      $(`tab-${name}`).classList.add("active");
    };
  });
}

function log(msg) {
  logLine.textContent = msg;
}

function saveState(s) {
  s.meta.lastSaveAt = Date.now();
  localStorage.setItem("dragon_save_v1", JSON.stringify(s));
}
function loadState() {
  const raw = localStorage.getItem("dragon_save_v1");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

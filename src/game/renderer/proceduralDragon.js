// 64x64 픽셀풍: 사각형 몇 개로 "용 느낌"만 냄 (MVP용)
const P = (r,g,b,a=255) => `rgba(${r},${g},${b},${a/255})`;

export function drawProceduralDragon(ctx, frame64, anim, element) {
  // frame64: 64x64 캔버스에 직접 그림
  ctx.clearRect(0,0,64,64);

  // element 팔레트(대충)
  const pal = {
    none:  { body:P(80,180,120), belly:P(210,220,170), horn:P(230,230,240) },
    fire:  { body:P(220,80,60),  belly:P(240,190,120), horn:P(240,240,210) },
    water: { body:P(70,140,220), belly:P(170,220,240), horn:P(230,240,250) },
    wind:  { body:P(120,220,170),belly:P(210,240,220), horn:P(240,250,240) },
    earth: { body:P(140,110,80), belly:P(210,190,150), horn:P(230,220,210) },
    light: { body:P(220,220,230),belly:P(250,240,190), horn:P(255,250,230) },
    dark:  { body:P(90,70,140),  belly:P(160,130,200), horn:P(220,220,240) },
  }[element] ?? pal.none;

  // anim에 따른 흔들림
  let ox = 0, oy = 0;
  if (anim === "idle")  { oy = (frame64%4===0||frame64%4===2) ? 0 : 1; }
  if (anim === "happy") { oy = (frame64%2===0) ? -1 : 0; }
  if (anim === "tired") { oy = 1; }
  if (anim === "hurt")  { ox = (frame64%2===0) ? -1 : 1; }

  // outline
  const outline = P(10,12,16);

  // 몸통(큰 덩어리)
  fillRect(ctx, 22+ox, 26+oy, 20, 18, pal.body, outline);
  // 배
  fillRect(ctx, 26+ox, 30+oy, 12, 10, pal.belly, outline);
  // 머리
  fillRect(ctx, 30+ox, 18+oy, 16, 12, pal.body, outline);
  // 코
  fillRect(ctx, 44+ox, 22+oy, 6, 4, pal.body, outline);
  // 눈(상태에 따라)
  const eye = anim === "tired" ? [40,22,4,1] : [40,21,4,2];
  ctx.fillStyle = outline;
  ctx.fillRect(eye[0]+ox, eye[1]+oy, eye[2], eye[3]);
  // 뿔
  fillRect(ctx, 32+ox, 14+oy, 4, 4, pal.horn, outline);
  fillRect(ctx, 38+ox, 14+oy, 4, 4, pal.horn, outline);
  // 날개(간단)
  fillRect(ctx, 16+ox, 22+oy, 8, 10, pal.body, outline);
  // 꼬리
  fillRect(ctx, 14+ox, 34+oy, 10, 6, pal.body, outline);

  // hurt 표시(빨간 점)
  if (anim === "hurt") {
    ctx.fillStyle = P(255,80,80);
    ctx.fillRect(28+ox, 24+oy, 2, 2);
  }
}

function fillRect(ctx, x,y,w,h, fill, outline) {
  // outline 박스
  ctx.fillStyle = outline;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x+1, y+1, Math.max(0,w-2), Math.max(0,h-2));
}

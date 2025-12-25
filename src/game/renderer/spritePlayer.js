import { drawProceduralDragon } from "./proceduralDragon.js";

export class SpritePlayer {
  constructor(canvas, scale = 5) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scale = scale;

    // 화면용 캔버스는 확대
    canvas.width = 64 * scale;
    canvas.height = 64 * scale;
    this.ctx.imageSmoothingEnabled = false;

    // 내부 64x64 버퍼
    this.buf = document.createElement("canvas");
    this.buf.width = 64; this.buf.height = 64;
    this.bctx = this.buf.getContext("2d", { alpha:true });
    this.bctx.imageSmoothingEnabled = false;

    this.anim = "idle";
    this.frame = 0;
    this.fps = 6;
    this.acc = 0;
  }

  setAnim(name) {
    if (this.anim !== name) {
      this.anim = name;
      this.frame = 0;
      this.acc = 0;
    }
  }

  update(dt) {
    this.acc += dt;
    const spf = 1 / this.fps;
    while (this.acc >= spf) {
      this.acc -= spf;
      this.frame = (this.frame + 1) % 4;
    }
  }

  draw(element = "none") {
    // 64x64에 먼저 그림
    drawProceduralDragon(this.bctx, this.frame, this.anim, element);

    // 확대해서 출력
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.drawImage(this.buf, 0,0,64,64, 0,0,64*this.scale,64*this.scale);
  }
}

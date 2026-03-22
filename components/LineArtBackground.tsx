"use client";
import { useEffect, useRef } from "react";

interface NetworkAnimationProps {
  maxDistance?: number;
  minDistance?: number;
  heartSpeed?: number;
  particleColor?: string;
  lineColor?: string;
}

export default function LineArtBackground({
  maxDistance = 160,
  minDistance = 50,
  heartSpeed = 40,
  particleColor = "rgba(120, 100, 75, ",
  lineColor = "rgba(140, 115, 85, ",
}: NetworkAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;

    networkRef.current = new Network(canvas, ctx, maxDistance, minDistance, heartSpeed, particleColor, lineColor);
    networkRef.current.start();

    const handleMouse = (e: MouseEvent) => networkRef.current?.updateMouse(e);
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      networkRef.current?.getGrd();
    };

    window.addEventListener("mousemove", handleMouse);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("resize", handleResize);
      networkRef.current?.stop();
    };
  }, [maxDistance, minDistance, heartSpeed, particleColor, lineColor]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ zIndex: 1, pointerEvents: "none" }}
    />
  );
}

class Network {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  aDots: Dot[] = [];
  aLines: Line[] = [];
  iMaxDist: number;
  iMinDist: number;
  beat = 30;
  drawLine = true;
  bRuning = false;
  grd: CanvasGradient | null = null;
  heartSpeed: number;
  particleColor: string;
  lineColor: string;
  mouse = { vx: 0, vy: 0, px: 0, py: 0, x: 0, y: 0, tm: undefined as ReturnType<typeof setTimeout> | undefined, moving: false };

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, maxDist: number, minDist: number, heartSpeed: number, particleColor: string, lineColor: string) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.iMaxDist = maxDist;
    this.iMinDist = minDist;
    this.heartSpeed = heartSpeed;
    this.particleColor = particleColor;
    this.lineColor = lineColor;
    this.mouse.x = this.canvas.width / 2;
    this.mouse.y = this.canvas.height / 2;
    this.getGrd();
  }

  getGrd() {
    this.grd = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    const stops = ["hsla(35, 40%, 70%, 0.08)", "hsla(28, 35%, 65%, 0.06)", "hsla(40, 45%, 72%, 0.07)", "hsla(32, 38%, 68%, 0.05)"];
    stops.forEach((color, i) => this.grd!.addColorStop(i / (stops.length - 1), color));
  }

  buildDot() { this.aDots.push(new Dot(this.mouse)); }
  updateMouse(e: MouseEvent) {
    this.mouse.moving = true;
    if (this.mouse.tm) clearTimeout(this.mouse.tm);
    this.mouse.tm = setTimeout(() => { this.mouse.moving = false; }, 500);
    this.mouse.px = this.mouse.x; this.mouse.py = this.mouse.y;
    this.mouse.x = e.clientX; this.mouse.y = e.clientY;
    this.mouse.vx = this.mouse.x - this.mouse.px;
    this.mouse.vy = this.mouse.y - this.mouse.py;
    this.buildDot(); this.buildDot();
  }

  getDist(a: Dot, b: Dot) { return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2); }

  checkLines() {
    this.aLines = [];
    for (let i = this.aDots.length - 1; i >= 0; i--) {
      for (let j = this.aDots.length - 1; j > i; j--) {
        const d = this.getDist(this.aDots[i], this.aDots[j]);
        if (d < this.iMaxDist && d > this.iMinDist && this.aDots[i].r + this.aDots[j].r > 5.5)
          this.aLines.push(new Line(this.aDots[i], this.aDots[j], d, this.iMaxDist, this.lineColor));
      }
    }
  }

  heartBeat() {
    const rx = Math.random() * window.innerWidth, ry = Math.random() * window.innerHeight;
    for (let i = 0; i < Math.random() * 30 + 20; i++)
      this.aDots.push(new Dot({ x: rx, y: ry, vx: Math.random() * 10 - 5, vy: Math.random() * 8 - 4 }));
    this.beat = 0;
  }

  update() {
    for (let i = this.aDots.length - 1; i >= 0; i--) {
      if (this.aDots[i].alive) this.aDots[i].update(); else this.aDots.splice(i, 1);
    }
    if (this.drawLine) this.checkLines();
    if (this.beat >= this.heartSpeed && !this.mouse.moving) this.heartBeat(); else this.beat++;
  }

  draw() {
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let i = this.aDots.length - 1; i >= 0; i--) this.aDots[i].draw(this.ctx, this.particleColor);
    if (this.drawLine) for (let i = this.aLines.length - 1; i >= 0; i--) this.aLines[i].draw(this.ctx);
  }

  run() { this.update(); this.draw(); if (this.bRuning) requestAnimationFrame(this.run.bind(this)); }
  start() { this.bRuning = true; this.run(); }
  stop() { this.bRuning = false; }
}

class Dot {
  x: number; y: number; vx: number; vy: number; r: number; life: number; alive = true; friction: number; a = 1; lx = 0; ly = 0;
  constructor(mouse: { x: number; y: number; vx: number; vy: number }) {
    this.x = mouse.x; this.y = mouse.y;
    this.vx = (Math.random() * 3 - 1.5 + mouse.vx) * 1.1;
    this.vy = (Math.random() * 3 - 1.5 + mouse.vy) * 1.1;
    this.r = Math.random() * 3;
    this.life = (Math.random() * 4 + 1) * (this.r * 0.3);
    this.friction = Math.random() * 0.18 + 0.02;
  }
  update() {
    if (this.x < 0 || this.x > window.innerWidth) this.vx *= -0.8;
    if (this.y < 0 || this.y > window.innerHeight) this.vy *= -0.8;
    this.lx = this.x; this.ly = this.y;
    this.x += this.vx; this.y += this.vy;
    if (this.vx > 2) this.vx -= this.friction; else if (this.vx < -2) this.vx += this.friction;
    if (this.vy > 2) this.vy -= this.friction; else if (this.vy < -2) this.vy += this.friction;
    if (this.life <= 0) { if (this.a <= 0) this.alive = false; else this.a -= 0.09; } else this.life -= 0.1;
  }
  draw(ctx: CanvasRenderingContext2D, particleColor: string) {
    ctx.beginPath(); ctx.moveTo(this.lx, this.ly); ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `${particleColor}${this.a * 0.6})`; ctx.lineWidth = this.r; ctx.lineCap = "round"; ctx.stroke(); ctx.closePath();
  }
}

class Line {
  x1: number; y1: number; x2: number; y2: number; w = 0.4; size: number; mSize: number; a: number; lineColor: string;
  constructor(dot1: Dot, dot2: Dot, dist: number, mDist: number, lineColor: string) {
    this.x1 = dot1.x; this.y1 = dot1.y; this.x2 = dot2.x; this.y2 = dot2.y;
    this.size = dist; this.mSize = mDist; this.lineColor = lineColor;
    this.a = Math.min(dot1.a, dot2.a, (100 - (dist * 100 / mDist)) / 100);
  }
  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath(); ctx.moveTo(this.x1, this.y1); ctx.lineTo(this.x2, this.y2);
    ctx.strokeStyle = `${this.lineColor}${this.a * 1.5})`; ctx.lineWidth = this.w; ctx.stroke(); ctx.closePath();
  }
}

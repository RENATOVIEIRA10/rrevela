/**
 * StoryCard — Canvas 2D story renderer with biblical design system.
 * Generates 1080×1920 images optimised for Instagram Stories.
 *
 * Design language: Dense biblical aesthetic — ornamental crosses, olive branches,
 * Alpha-Omega symbols, illuminated-manuscript typography.
 *
 * Templates
 *  classico        "A Palavra"            — Imersive verse with cross ornament + olive sprigs
 *  insight         "Ver · Revelar · Viver" — Método Revela study steps (falls back to verse+insight)
 *  palavra-do-dia  "Passagem do Dia"      — Dated passage card with cross divider
 *  estudo          "Revelação"            — Christocentric insight, prominent cross
 *  minimalista     "Contemplação"         — Silent, breathing verse
 */

export type StoryType = "verse" | "verse-reveal" | "study";
export type StoryTemplate = "classico" | "insight" | "palavra-do-dia" | "estudo" | "minimalista";
export type StoryBackground = "escuro" | "papel" | "gradiente";

export interface StoryData {
  type: StoryType;
  reference: string;
  verseText?: string;
  insightText?: string;
  studyTitle?: string;
  studyExcerpt?: string;
  /** Método Revela note fields */
  observation?: string;
  christocentric?: string;
  application?: string;
  prayer?: string;
}

export interface StoryConfig {
  template: StoryTemplate;
  background: StoryBackground;
}

export const TEMPLATE_META: Record<StoryTemplate, { label: string; description: string }> = {
  classico:          { label: "A Palavra",             description: "Versículo imersivo" },
  insight:           { label: "Ver · Revelar · Viver", description: "Método de estudo" },
  "palavra-do-dia":  { label: "Passagem do Dia",       description: "Data e passagem" },
  estudo:            { label: "Revelação",              description: "Conexão cristocêntrica" },
  minimalista:       { label: "Contemplação",           description: "Silêncio e texto" },
};

export const BACKGROUND_META: Record<StoryBackground, { label: string; colors: string[] }> = {
  escuro:    { label: "Noite Santa",      colors: ["#131113", "#1C1A18"] },
  papel:     { label: "Pergaminho",       colors: ["#F2EDE0", "#DACCB0"] },
  gradiente: { label: "Abismo Estrelado", colors: ["#080C16", "#0C1020"] },
};

// ─── Canvas constants ──────────────────────────────────────────────────────────
const W = 1080;
const H = 1920;
const PAD_X = 96;
const CW = W - PAD_X * 2; // content width

const SANS  = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// ─── Text helpers ──────────────────────────────────────────────────────────────
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontStyle = "",
): string[] {
  ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

function adaptiveText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
  maxH: number,
  baseSize: number,
  minSize: number,
  font: string,
  lhRatio: number,
  style = "",
) {
  let size = baseSize;
  let lines: string[] = [];
  while (size >= minSize) {
    lines = wrapText(ctx, text, maxW, size, font, style);
    if (lines.length * size * lhRatio <= maxH) break;
    size -= 2;
  }
  return { fontSize: size, lines };
}

/** Draws lines and returns total height consumed */
function drawLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  startY: number,
  fontSize: number,
  lhRatio: number,
): number {
  const lh = fontSize * lhRatio;
  let y = startY;
  for (const line of lines) { y += lh; ctx.fillText(line, x, y); }
  return y - startY;
}

function getTodayStr(): string {
  const d = new Date();
  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

// ─── Colour system ────────────────────────────────────────────────────────────
function isLight(bg: StoryBackground) { return bg === "papel"; }
function isNight(bg: StoryBackground) { return bg === "gradiente"; }

interface Palette {
  main: string; secondary: string; accent: string;
  muted: string; ref: string; label: string; gold: string;
  crossGlow: string; leafColor: string; lineAlpha: string;
}

function colors(bg: StoryBackground): Palette {
  if (isLight(bg)) return {
    main:      "#2A2015",
    secondary: "#4A3F30",
    accent:    "#7A4E2D",
    muted:     "#806050",
    ref:       "#7A4E2D",
    label:     "#907060",
    gold:      "#8B5E3C",
    crossGlow: "rgba(122,78,45,0.14)",
    leafColor: "rgba(70,100,45,0.42)",
    lineAlpha: "rgba(122,78,45,",
  };
  if (isNight(bg)) return {
    main:      "#E8EEF8",
    secondary: "#B8C4D8",
    accent:    "#90AADA",
    muted:     "#7090B8",
    ref:       "#90AADA",
    label:     "#7090B8",
    gold:      "#90AADA",
    crossGlow: "rgba(100,140,200,0.18)",
    leafColor: "rgba(80,140,90,0.38)",
    lineAlpha: "rgba(100,140,200,",
  };
  // escuro (default dark)
  return {
    main:      "#F5F0E8",
    secondary: "#D4C9B8",
    accent:    "#D4AA6A",
    muted:     "#A89888",
    ref:       "#D4AA6A",
    label:     "#8B7D6E",
    gold:      "#D4AA6A",
    crossGlow: "rgba(212,170,106,0.18)",
    leafColor: "rgba(100,148,70,0.38)",
    lineAlpha: "rgba(180,140,80,",
  };
}

// ─── Background renderers ──────────────────────────────────────────────────────

function drawCrossWatermark(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  h: number, opacity: number, color: string,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = h * 0.058;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.5); ctx.lineTo(cx, cy + h * 0.5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - h * 0.33, cy - h * 0.14); ctx.lineTo(cx + h * 0.33, cy - h * 0.14); ctx.stroke();
  ctx.restore();
}

function drawBgEscuro(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,   "#131113");
  g.addColorStop(0.5, "#1C1A18");
  g.addColorStop(1,   "#111012");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Warm centre glow
  const cg = ctx.createRadialGradient(W / 2, H * 0.44, 0, W / 2, H * 0.44, W * 0.6);
  cg.addColorStop(0, "rgba(100,60,20,0.09)");
  cg.addColorStop(1, "transparent");
  ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
  drawCrossWatermark(ctx, W / 2, H * 0.47, 530, 0.046, "#8B6040");
}

function drawBgPapel(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,   "#F2EDE0");
  g.addColorStop(0.4, "#EAE0C8");
  g.addColorStop(1,   "#DACCB0");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Edge vignette
  const vg = ctx.createRadialGradient(W / 2, H / 2, W * 0.28, W / 2, H / 2, W * 0.88);
  vg.addColorStop(0, "transparent");
  vg.addColorStop(1, "rgba(100,70,30,0.11)");
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // Grain texture
  ctx.fillStyle = "rgba(100,65,25,0.022)";
  for (let i = 0; i < 1200; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.7 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  drawCrossWatermark(ctx, W / 2, H * 0.47, 530, 0.046, "#8B5E3C");
}

function drawBgGradiente(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0,   "#080C16");
  g.addColorStop(0.5, "#0C1020");
  g.addColorStop(1,   "#0A0C14");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Nebula glow
  const ng = ctx.createRadialGradient(W * 0.62, H * 0.34, 0, W * 0.62, H * 0.34, W * 0.52);
  ng.addColorStop(0, "rgba(40,60,130,0.13)");
  ng.addColorStop(1, "transparent");
  ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
  // Stars — denser toward top
  for (let i = 0; i < 130; i++) {
    const sx = Math.random() * W;
    const sy = Math.random() * H * 0.75;
    const sr = Math.random() * 1.8 + 0.3;
    const sa = Math.random() * 0.55 + 0.12;
    ctx.fillStyle = `rgba(200,215,242,${sa})`;
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
  }
  drawCrossWatermark(ctx, W / 2, H * 0.47, 530, 0.052, "#5070A0");
}

function drawBackground(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  if (bg === "papel")     drawBgPapel(ctx);
  else if (bg === "gradiente") drawBgGradiente(ctx);
  else                    drawBgEscuro(ctx);
}

// ─── Shared ornamental elements ────────────────────────────────────────────────

function drawTopBottomBars(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const c = colors(bg);
  const barAlpha = isLight(bg) ? "55" : "88";
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0,   "transparent");
  g.addColorStop(0.25, c.gold + barAlpha);
  g.addColorStop(0.5,  c.gold + "AA");
  g.addColorStop(0.75, c.gold + barAlpha);
  g.addColorStop(1,   "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 6);
  ctx.fillRect(0, H - 6, W, 6);
}

function drawCornerOrnaments(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const alpha = isLight(bg) ? 0.20 : 0.32;
  const rgb   = isLight(bg) ? "122,78,45" : isNight(bg) ? "100,140,200" : "180,140,80";
  const color = `rgba(${rgb},${alpha})`;
  const sz = 72, ins = 60;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  const corners: [number, number, number, number, number, number][] = [
    [ins + sz, ins,     ins,     ins,     ins,     ins + sz],
    [W-ins-sz, ins,     W - ins, ins,     W - ins, ins + sz],
    [ins,      H-ins-sz,ins,     H - ins, ins + sz,H - ins],
    [W-ins-sz, H - ins, W - ins, H - ins, W - ins, H-ins-sz],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of corners) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
  }
  // Tiny dot at each corner tip
  ctx.fillStyle = color;
  for (const [, , x, y] of corners) {
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
}

function drawAlphaOmega(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const alpha = isLight(bg) ? 0.17 : 0.24;
  const rgb   = isLight(bg) ? "122,78,45" : isNight(bg) ? "100,140,200" : "180,140,80";
  ctx.save();
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  ctx.font = `italic 58px ${SERIF}`;
  ctx.textAlign = "left";
  ctx.fillText("Α", 82, 158);
  ctx.textAlign = "right";
  ctx.fillText("Ω", W - 82, H - 124);
  ctx.restore();
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, bg: StoryBackground, small = false) {
  const c  = colors(bg);
  const la = c.lineAlpha;
  const span = small ? 85 : 150;
  const gap  = small ? 20 : 36;
  ctx.strokeStyle = la + "0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2 - span, y); ctx.lineTo(W/2 - gap, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 + gap, y); ctx.lineTo(W/2 + span, y); ctx.stroke();
  // Diamond centre
  ctx.save();
  ctx.fillStyle = la + "0.45)";
  ctx.translate(W / 2, y);
  ctx.rotate(Math.PI / 4);
  const ds = small ? 5.5 : 7.5;
  ctx.fillRect(-ds / 2, -ds / 2, ds, ds);
  ctx.restore();
}

/** Ornate divider with cross centre element and flanking dots */
function drawElaborateDivider(ctx: CanvasRenderingContext2D, y: number, bg: StoryBackground) {
  const c  = colors(bg);
  const la = c.lineAlpha;
  const span = 210, gap = 40;

  ctx.strokeStyle = la + "0.28)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2 - span, y); ctx.lineTo(W/2 - gap, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 + gap, y); ctx.lineTo(W/2 + span, y); ctx.stroke();

  // Flanking dots
  ctx.fillStyle = la + "0.28)";
  for (const dx of [-span + 45, -span / 2, span / 2, span - 45]) {
    ctx.beginPath(); ctx.arc(W / 2 + dx, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }

  // Cross centre
  const cH = 24, cW = 16;
  ctx.strokeStyle = la + "0.5)";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(W/2, y - cH/2);      ctx.lineTo(W/2, y + cH/2);     ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 - cW/2, y - cH*0.12); ctx.lineTo(W/2 + cW/2, y - cH*0.12); ctx.stroke();
  ctx.lineCap = "butt";
}

// ─── Olive branch sprig ────────────────────────────────────────────────────────

function drawOliveLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  rw: number, rh: number,
  angle: number, color: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, rh, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawOliveSprig(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number,
  color: string,
  opacity: number,
  flip = false,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  const dir = flip ? -1 : 1;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6 * scale;
  ctx.lineCap = "round";
  // Stem
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(
    x + 14*scale*dir, y - 20*scale,
    x + 7*scale*dir,  y - 56*scale,
    x + 3*scale*dir,  y - 90*scale,
  );
  ctx.stroke();
  // Leaf pairs
  const ts = [0.13, 0.34, 0.58, 0.80];
  ts.forEach((t, i) => {
    const lx = x + (13 - 9*t)*scale*dir;
    const ly = y - t * 90*scale;
    const side = i % 2 === 0 ? 1 : -1;
    const rw = (7.5 - t*2)*scale, rh = (3.2 - t*0.4)*scale;
    drawOliveLeaf(ctx, lx - 11*scale*dir*side, ly, rw, rh,  dir*side*0.45, color);
    drawOliveLeaf(ctx, lx + 11*scale*dir*side, ly, rw, rh, -dir*side*0.45, color);
  });
  ctx.restore();
}

// ─── Branding footer ──────────────────────────────────────────────────────────
function drawBranding(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const y = H - 95;
  const c = colors(bg);
  ctx.strokeStyle = c.lineAlpha + "0.24)";
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W/2 - 122, y); ctx.lineTo(W/2 - 40, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 + 40, y);  ctx.lineTo(W/2 + 122, y); ctx.stroke();
  ctx.fillStyle = c.accent;
  ctx.font = `600 23px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("VIA REVELA", W / 2, y + 5);
  ctx.fillStyle = c.muted;
  ctx.font = `19px ${SANS}`;
  ctx.fillText("rrevela.lovable.app", W / 2, y + 37);
}

// ─── Prominent cross helper ────────────────────────────────────────────────────
function drawProminentCross(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  h: number, bg: StoryBackground,
) {
  const c   = colors(bg);
  const w   = h * 0.64;
  const bY  = cy - h * 0.13; // crossbar Y
  const lw  = h * 0.065;

  // Outer glow layers
  for (const [lw2, al] of [[h*0.22, 0.10], [h*0.13, 0.14]] as [number,number][]) {
    ctx.strokeStyle = c.crossGlow.replace("0.18", al.toString());
    ctx.lineWidth = lw2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(cx, cy - h/2); ctx.lineTo(cx, cy + h/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - w/2, bY); ctx.lineTo(cx + w/2, bY); ctx.stroke();
  }

  // Main cross
  const mainColor = isLight(bg)
    ? "rgba(122,78,45,0.72)"
    : isNight(bg)
    ? "rgba(140,180,242,0.78)"
    : "rgba(212,170,106,0.92)";
  ctx.strokeStyle = mainColor;
  ctx.lineWidth = lw;
  ctx.beginPath(); ctx.moveTo(cx, cy - h/2); ctx.lineTo(cx, cy + h/2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - w/2, bY); ctx.lineTo(cx + w/2, bY); ctx.stroke();

  // Arm-end flares (small serifs)
  const flareLen = 14;
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = isLight(bg) ? "rgba(122,78,45,0.35)" : isNight(bg) ? "rgba(140,180,242,0.4)" : "rgba(212,170,106,0.5)";
  for (const [px, py, horiz] of [
    [cx, cy - h/2, false], [cx, cy + h/2, false],
    [cx - w/2, bY, true],  [cx + w/2, bY, true],
  ] as [number, number, boolean][]) {
    ctx.save(); ctx.translate(px, py);
    if (horiz) ctx.rotate(Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(-flareLen, -flareLen * 0.45);
    ctx.lineTo(0, 0);
    ctx.lineTo(flareLen, -flareLen * 0.45);
    ctx.stroke();
    ctx.restore();
  }
}

// ─── Template: A Palavra (classico) ───────────────────────────────────────────
function renderClassico(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c    = colors(bg);
  const text = data.verseText || data.studyExcerpt || "";

  drawAlphaOmega(ctx, bg);

  // Ornate cross header element
  drawProminentCross(ctx, W / 2, H * 0.235, 96, bg);

  // Reference
  ctx.fillStyle = c.ref;
  ctx.font = `600 32px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.315);

  drawElaborateDivider(ctx, H * 0.348, bg);

  // Verse text
  const { fontSize, lines } = adaptiveText(
    ctx, `\u201c${text}\u201d`, CW - 40, H * 0.305, 52, 28, SERIF, 1.82, "italic",
  );
  ctx.fillStyle = c.main;
  ctx.font = `italic ${fontSize}px ${SERIF}`;
  const verseBottom = H * 0.370 + drawLines(ctx, lines, W / 2, H * 0.370, fontSize, 1.82);

  // Olive sprigs flanking verse bottom
  const sprigY = Math.min(verseBottom + 72, H * 0.735);
  drawOliveSprig(ctx, W/2 - 58, sprigY, 0.92, c.leafColor, 0.82, false);
  drawOliveSprig(ctx, W/2 + 58, sprigY, 0.92, c.leafColor, 0.82, true);
}

// ─── Template: Ver · Revelar · Viver (insight) ────────────────────────────────
function renderInsight(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);
  const hasNoteFields = !!(data.observation || data.christocentric || data.application);

  if (hasNoteFields) {
    // ── Full Método Revela display ──────────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.fillStyle = c.ref;
    ctx.font = `600 28px ${SANS}`;
    ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.12);

    drawDivider(ctx, H * 0.144, bg, true);

    ctx.fillStyle = c.muted;
    ctx.font = `500 18px ${SANS}`;
    ctx.fillText("MÉTODO REVELA  ·  VER · REVELAR · VIVER", W / 2, H * 0.172);

    const steps = [
      { label: "① VER",     text: data.observation     || "" },
      { label: "② REVELAR", text: data.christocentric  || "" },
      { label: "③ VIVER",   text: data.application     || "" },
    ].filter((s) => s.text);

    const sepColor = c.lineAlpha + "0.20)";
    let curY = H * 0.205;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];

      // Separator (except before first)
      if (i > 0) {
        ctx.strokeStyle = sepColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(PAD_X + 32, curY); ctx.lineTo(W - PAD_X - 32, curY);
        ctx.stroke();
        curY += 46;
      }

      // Step label
      ctx.textAlign = "center";
      ctx.fillStyle = c.accent;
      ctx.font = `600 25px ${SANS}`;
      ctx.fillText(step.label, W / 2, curY + 28);
      curY += 50;

      // Content
      const { fontSize, lines } = adaptiveText(ctx, step.text, CW - 40, H * 0.136, 36, 22, SERIF, 1.76);
      ctx.fillStyle = c.main;
      ctx.font = `${fontSize}px ${SERIF}`;
      const textH = drawLines(ctx, lines, W / 2, curY, fontSize, 1.76);
      curY += textH + 28;
    }

    // Prayer (optional)
    if (data.prayer) {
      curY += 18;
      ctx.textAlign = "center";
      ctx.fillStyle = c.muted;
      ctx.font = `500 18px ${SANS}`;
      ctx.fillText("❤  ORAR", W / 2, curY + 16);
      curY += 38;
      const { fontSize: pf, lines: pl } = adaptiveText(ctx, data.prayer, CW - 40, H * 0.07, 28, 20, SERIF, 1.72, "italic");
      ctx.fillStyle = c.muted;
      ctx.font = `italic ${pf}px ${SERIF}`;
      drawLines(ctx, pl, W / 2, curY, pf, 1.72);
    }
  } else {
    // ── Fallback: verse + insight text ─────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.fillStyle = c.ref;
    ctx.font = `600 30px ${SANS}`;
    ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.22);
    drawDivider(ctx, H * 0.248, bg, true);

    const primaryText  = data.verseText || data.studyExcerpt || "";
    const insightText  = data.insightText || "";
    const hasInsight   = !!insightText;
    const maxPrimaryH  = hasInsight ? H * 0.21 : H * 0.33;
    const v = adaptiveText(ctx, `\u201c${primaryText}\u201d`, CW, maxPrimaryH, 44, 26, SERIF, 1.80, "italic");
    ctx.fillStyle = c.main;
    ctx.font = `italic ${v.fontSize}px ${SERIF}`;
    const verseBottom = H * 0.272 + drawLines(ctx, v.lines, W / 2, H * 0.272, v.fontSize, 1.80);

    if (hasInsight) {
      const iy = Math.max(verseBottom + 52, H * 0.55);
      drawElaborateDivider(ctx, iy, bg);
      ctx.fillStyle = c.accent;
      ctx.font = `600 22px ${SANS}`;
      ctx.fillText("REVELA", W / 2, iy + 42);
      const ins = adaptiveText(ctx, insightText, CW, H * 0.20, 32, 22, SANS, 1.84);
      ctx.fillStyle = c.secondary;
      ctx.font = `${ins.fontSize}px ${SANS}`;
      drawLines(ctx, ins.lines, W / 2, iy + 58, ins.fontSize, 1.84);
    }
  }
}

// ─── Template: Passagem do Dia (palavra-do-dia) ────────────────────────────────
function renderPalavraDoDia(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  ctx.textAlign = "center";
  ctx.fillStyle = c.label;
  ctx.font = `500 21px ${SANS}`;
  ctx.fillText(getTodayStr().toUpperCase(), W / 2, H * 0.210);

  ctx.fillStyle = c.accent;
  ctx.font = `700 40px ${SERIF}`;
  ctx.fillText("PASSAGEM DO DIA", W / 2, H * 0.266);

  drawElaborateDivider(ctx, H * 0.302, bg);

  ctx.fillStyle = c.ref;
  ctx.font = `600 30px ${SANS}`;
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.347);

  const text = data.verseText || data.studyExcerpt || "";
  const v = adaptiveText(ctx, `\u201c${text}\u201d`, CW - 40, H * 0.285, 44, 26, SERIF, 1.85, "italic");
  ctx.fillStyle = c.main;
  ctx.font = `italic ${v.fontSize}px ${SERIF}`;
  const bottom = H * 0.372 + drawLines(ctx, v.lines, W / 2, H * 0.372, v.fontSize, 1.85);

  const insight = data.insightText || data.christocentric || "";
  if (insight) {
    const iy = Math.max(bottom + 62, H * 0.635);
    drawDivider(ctx, iy, bg, true);
    const ins = adaptiveText(ctx, insight, CW, H * 0.135, 28, 20, SANS, 1.80);
    ctx.fillStyle = c.muted;
    ctx.font = `${ins.fontSize}px ${SANS}`;
    drawLines(ctx, ins.lines, W / 2, iy + 22, ins.fontSize, 1.80);
  }
}

// ─── Template: Revelação (estudo) ─────────────────────────────────────────────
function renderEstudo(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  ctx.textAlign = "center";
  ctx.fillStyle = c.label;
  ctx.font = `500 24px ${SANS}`;
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.182);

  // Prominent cross (the focal element)
  drawProminentCross(ctx, W / 2, H * 0.308, 136, bg);

  drawElaborateDivider(ctx, H * 0.390, bg);

  // "REVELAÇÃO" label
  ctx.fillStyle = c.accent;
  ctx.font = `700 27px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("REVELAÇÃO", W / 2, H * 0.433);

  // Main insight text — christocentric > insightText > studyTitle fallback
  const insightText = data.christocentric || data.insightText || (data.studyTitle ? `Estudo de ${data.reference}` : "");
  if (insightText) {
    const ins = adaptiveText(ctx, insightText, CW, H * 0.225, 42, 24, SERIF, 1.80);
    ctx.fillStyle = c.main;
    ctx.font = `${ins.fontSize}px ${SERIF}`;
    const insBottom = H * 0.455 + drawLines(ctx, ins.lines, W / 2, H * 0.455, ins.fontSize, 1.80);

    // Application / study excerpt (secondary, smaller)
    const appText = data.application || data.studyExcerpt || "";
    if (appText) {
      const appY = Math.max(insBottom + 52, H * 0.685);
      drawDivider(ctx, appY, bg, true);
      ctx.fillStyle = c.label;
      ctx.font = `500 18px ${SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("APLICAÇÃO", W / 2, appY + 33);
      const app = adaptiveText(ctx, appText, CW, H * 0.105, 29, 20, SANS, 1.75);
      ctx.fillStyle = c.muted;
      ctx.font = `${app.fontSize}px ${SANS}`;
      drawLines(ctx, app.lines, W / 2, appY + 50, app.fontSize, 1.75);
    }
  }
}

// ─── Template: Contemplação (minimalista) ─────────────────────────────────────
function renderMinimalista(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c    = colors(bg);
  const text = data.verseText || data.studyExcerpt || data.studyTitle || "";

  const v = adaptiveText(ctx, `\u201c${text}\u201d`, CW - 80, H * 0.33, 52, 28, SERIF, 2.0, "italic");
  ctx.fillStyle = c.main;
  ctx.font = `italic ${v.fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  const totalH  = v.lines.length * v.fontSize * 2.0;
  const startY  = (H - totalH) / 2 - 88;
  const bottom  = startY + drawLines(ctx, v.lines, W / 2, startY, v.fontSize, 2.0);

  // Reference
  ctx.fillStyle = c.accent;
  ctx.font = `500 29px ${SANS}`;
  ctx.fillText(`— ${data.reference}`, W / 2, bottom + 66);

  // Small inline cross
  const miniCY = bottom + 110;
  ctx.strokeStyle = c.lineAlpha + "0.35)";
  ctx.lineWidth = 2.2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(W/2, miniCY - 13); ctx.lineTo(W/2, miniCY + 13); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2 - 9,  miniCY - 2); ctx.lineTo(W/2 + 9,  miniCY - 2); ctx.stroke();
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function renderStoryToCanvas(data: StoryData, config?: StoryConfig): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const template = config?.template   ?? "classico";
  const bg       = config?.background ?? "escuro";

  drawBackground(ctx, bg);

  if (template !== "minimalista") {
    drawTopBottomBars(ctx, bg);
    drawCornerOrnaments(ctx, bg);
  }

  switch (template) {
    case "classico":       renderClassico(ctx, data, bg);       break;
    case "insight":        renderInsight(ctx, data, bg);        break;
    case "palavra-do-dia": renderPalavraDoDia(ctx, data, bg);   break;
    case "estudo":         renderEstudo(ctx, data, bg);         break;
    case "minimalista":    renderMinimalista(ctx, data, bg);    break;
  }

  drawBranding(ctx, bg);
  return canvas;
}

export default StoryData;

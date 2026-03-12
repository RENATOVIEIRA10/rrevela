/**
 * StoryCard — Multi-template Canvas 2D story renderer.
 * Generates 1080x1920 images optimized for Instagram Stories.
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
}

export interface StoryConfig {
  template: StoryTemplate;
  background: StoryBackground;
}

export const TEMPLATE_META: Record<StoryTemplate, { label: string; description: string }> = {
  classico: { label: "Clássico da Palavra", description: "Elegante e atemporal" },
  insight: { label: "Versículo + Insight", description: "Com revelação espiritual" },
  "palavra-do-dia": { label: "Palavra do Dia", description: "Destaque diário" },
  estudo: { label: "Estudo Bíblico", description: "Foco em aprofundamento" },
  minimalista: { label: "Minimalista", description: "Limpo e direto" },
};

export const BACKGROUND_META: Record<StoryBackground, { label: string; colors: string[] }> = {
  escuro: { label: "Escuro Premium", colors: ["#1A1C1E", "#2A2520"] },
  papel: { label: "Papel Bíblico", colors: ["#FAF8F4", "#F0E8D8"] },
  gradiente: { label: "Gradiente Suave", colors: ["#2C1810", "#1A1C1E", "#0F1A2E"] },
};

const W = 1080;
const H = 1920;
const PAD_X = 100;
const CONTENT_W = W - PAD_X * 2;

const SANS = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
const SERIF = "Georgia, 'Times New Roman', Times, serif";

// ─── Helpers ────────────────────────────────────────────────

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number, fontFamily: string, fontStyle = ""): string[] {
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

function adaptiveText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxH: number, baseSize: number, minSize: number, font: string, lhRatio: number, style = "") {
  let size = baseSize;
  let lines: string[] = [];
  while (size >= minSize) {
    lines = wrapText(ctx, text, maxW, size, font, style);
    if (lines.length * size * lhRatio <= maxH) break;
    size -= 2;
  }
  return { fontSize: size, lines };
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, startY: number, fontSize: number, lhRatio: number): number {
  const lh = fontSize * lhRatio;
  let y = startY;
  for (const line of lines) { y += lh; ctx.fillText(line, x, y); }
  return y - startY;
}

function getTodayStr(): string {
  const d = new Date();
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

// ─── Background renderers ──────────────────────────────────

function drawBgEscuro(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1A1C1E");
  g.addColorStop(0.5, "#22201C");
  g.addColorStop(1, "#1A1C1E");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawBgPapel(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#FAF8F4");
  g.addColorStop(0.4, "#F5EFE4");
  g.addColorStop(1, "#EDE4D4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  // Subtle noise texture via dots
  ctx.fillStyle = "rgba(139,94,60,0.03)";
  for (let i = 0; i < 800; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 2 + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBgGradiente(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
  g.addColorStop(0, "#2C1810");
  g.addColorStop(0.5, "#1A1C1E");
  g.addColorStop(1, "#0F1A2E");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawBackground(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  if (bg === "papel") drawBgPapel(ctx);
  else if (bg === "gradiente") drawBgGradiente(ctx);
  else drawBgEscuro(ctx);
}

function isLight(bg: StoryBackground) { return bg === "papel"; }

// ─── Shared ornaments ───────────────────────────────────────

function drawCornerOrnaments(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const alpha = isLight(bg) ? 0.15 : 0.35;
  const color = isLight(bg) ? `rgba(139,94,60,${alpha})` : `rgba(84,42,34,${alpha})`;
  const sz = 70, ins = 56;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  const corners = [
    [ins, ins + sz, ins, ins, ins + sz, ins],
    [W - ins - sz, ins, W - ins, ins, W - ins, ins + sz],
    [ins, H - ins - sz, ins, H - ins, ins + sz, H - ins],
    [W - ins - sz, H - ins, W - ins, H - ins, W - ins, H - ins - sz],
  ];
  for (const c of corners) {
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke();
  }
}

function drawTopBottomBars(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const accent = isLight(bg) ? "rgba(139,94,60,0.3)" : "rgba(139,94,60,0.5)";
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.3, accent);
  g.addColorStop(0.5, accent);
  g.addColorStop(0.7, accent);
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 8);
  ctx.fillRect(0, H - 8, W, 8);
}

function drawBranding(ctx: CanvasRenderingContext2D, bg: StoryBackground) {
  const y = H - 90;
  const textColor = isLight(bg) ? "#8B5E3C" : "#8B5E3C";
  const subColor = isLight(bg) ? "#A0927E" : "#5C5046";
  const lineColor = isLight(bg) ? "rgba(139,94,60,0.2)" : "rgba(84,42,34,0.3)";

  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 110, y); ctx.lineTo(W / 2 - 35, y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + 35, y); ctx.lineTo(W / 2 + 110, y); ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = `600 24px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("VIA REVELA", W / 2, y + 6);

  ctx.fillStyle = subColor;
  ctx.font = `20px ${SANS}`;
  ctx.fillText("rrevela.lovable.app", W / 2, y + 38);
}

function drawDivider(ctx: CanvasRenderingContext2D, y: number, bg: StoryBackground, small = false) {
  const cy = y;
  const color = isLight(bg) ? "rgba(139,94,60,0.25)" : "rgba(84,42,34,0.4)";
  const dotColor = isLight(bg) ? "rgba(139,94,60,0.3)" : "rgba(84,42,34,0.5)";
  const span = small ? 70 : 120;
  const gap = small ? 16 : 28;

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - span, cy); ctx.lineTo(W / 2 - gap, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 + gap, cy); ctx.lineTo(W / 2 + span, cy); ctx.stroke();

  ctx.fillStyle = dotColor;
  ctx.beginPath(); ctx.arc(W / 2, cy, small ? 5 : 7, 0, Math.PI * 2); ctx.fill();
}

function drawDiamond(ctx: CanvasRenderingContext2D, y: number, bg: StoryBackground) {
  ctx.fillStyle = isLight(bg) ? "rgba(139,94,60,0.35)" : "rgba(139,94,60,0.5)";
  ctx.font = `50px ${SERIF}`;
  ctx.textAlign = "center";
  ctx.fillText("✦", W / 2, y);
}

// ─── Color palettes per background ─────────────────────────

function colors(bg: StoryBackground) {
  if (isLight(bg)) {
    return { main: "#2A2520", secondary: "#4A3F35", accent: "#8B5E3C", muted: "#6B5D50", ref: "#8B5E3C", label: "#6B5D50" };
  }
  return { main: "#F5F0E8", secondary: "#D4C9B8", accent: "#C4956A", muted: "#B8A898", ref: "#C4956A", label: "#8B7D6E" };
}

// ─── Template: Clássico da Palavra ──────────────────────────

function renderClassico(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  drawDiamond(ctx, H * 0.28, bg);

  // Reference
  ctx.fillStyle = c.ref;
  ctx.font = `600 34px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.33);

  drawDivider(ctx, H * 0.36, bg);

  // Verse text
  const text = data.verseText || data.studyExcerpt || "";
  const { fontSize, lines } = adaptiveText(ctx, `"${text}"`, CONTENT_W, H * 0.32, 48, 28, SERIF, 1.85, "italic");
  ctx.fillStyle = c.main;
  ctx.font = `italic ${fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  drawLines(ctx, lines, W / 2, H * 0.38, fontSize, 1.85);
}

// ─── Template: Versículo + Insight ──────────────────────────

function renderInsight(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  // Pick best primary text and insight text from available data
  const primaryText = data.verseText || data.studyExcerpt || data.studyTitle || "";
  const insightText = data.insightText || (data.verseText ? data.studyExcerpt : "") || "";
  const hasInsight = !!insightText;

  // Reference badge
  ctx.fillStyle = c.ref;
  ctx.font = `600 30px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.22);

  drawDivider(ctx, H * 0.245, bg, true);

  // Primary text (verse or study excerpt)
  const maxPrimaryH = hasInsight ? H * 0.22 : H * 0.35;
  const v = adaptiveText(ctx, `"${primaryText}"`, CONTENT_W, maxPrimaryH, 44, 26, SERIF, 1.8, "italic");
  ctx.fillStyle = c.main;
  ctx.font = `italic ${v.fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  const verseBottom = H * 0.27 + drawLines(ctx, v.lines, W / 2, H * 0.27, v.fontSize, 1.8);

  // Insight section
  if (hasInsight) {
    const insightY = Math.max(verseBottom + 50, H * 0.54);

    drawDivider(ctx, insightY, bg, true);

    // Label
    ctx.fillStyle = c.accent;
    ctx.font = `600 22px ${SANS}`;
    ctx.fillText("REVELA", W / 2, insightY + 40);

    const ins = adaptiveText(ctx, insightText, CONTENT_W, H * 0.2, 32, 22, SANS, 1.85);
    ctx.fillStyle = c.muted;
    ctx.font = `${ins.fontSize}px ${SANS}`;
    ctx.textAlign = "center";
    drawLines(ctx, ins.lines, W / 2, insightY + 55, ins.fontSize, 1.85);
  }
}

// ─── Template: Palavra do Dia ───────────────────────────────

function renderPalavraDoDia(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  // Date
  ctx.fillStyle = c.label;
  ctx.font = `500 22px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText(getTodayStr().toUpperCase(), W / 2, H * 0.2);

  // Title
  ctx.fillStyle = c.accent;
  ctx.font = `700 42px ${SERIF}`;
  ctx.fillText("PALAVRA DO DIA", W / 2, H * 0.26);

  drawDivider(ctx, H * 0.3, bg);

  // Reference
  ctx.fillStyle = c.ref;
  ctx.font = `600 30px ${SANS}`;
  ctx.fillText(data.reference.toUpperCase(), W / 2, H * 0.345);

  // Verse
  const text = data.verseText || data.studyExcerpt || "";
  const v = adaptiveText(ctx, `"${text}"`, CONTENT_W - 40, H * 0.28, 44, 26, SERIF, 1.85, "italic");
  ctx.fillStyle = c.main;
  ctx.font = `italic ${v.fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  const bottom = H * 0.37 + drawLines(ctx, v.lines, W / 2, H * 0.37, v.fontSize, 1.85);

  // Insight if present
  if (data.insightText) {
    const iy = Math.max(bottom + 60, H * 0.62);
    drawDivider(ctx, iy, bg, true);
    const ins = adaptiveText(ctx, data.insightText, CONTENT_W, H * 0.15, 28, 22, SANS, 1.8);
    ctx.fillStyle = c.muted;
    ctx.font = `${ins.fontSize}px ${SANS}`;
    drawLines(ctx, ins.lines, W / 2, iy + 20, ins.fontSize, 1.8);
  }
}

// ─── Template: Estudo Bíblico ───────────────────────────────

function renderEstudo(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  // Label
  ctx.fillStyle = c.label;
  ctx.font = `600 22px ${SANS}`;
  ctx.textAlign = "center";
  ctx.fillText("ESTUDO BÍBLICO", W / 2, H * 0.2);

  // Study title
  const title = data.studyTitle || data.reference;
  const t = adaptiveText(ctx, title, CONTENT_W, H * 0.12, 50, 32, SERIF, 1.55, "600");
  ctx.fillStyle = c.main;
  ctx.font = `600 ${t.fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  const titleBottom = H * 0.22 + drawLines(ctx, t.lines, W / 2, H * 0.22, t.fontSize, 1.55);

  // Reference
  ctx.fillStyle = c.ref;
  ctx.font = `600 28px ${SANS}`;
  ctx.fillText(data.reference.toUpperCase(), W / 2, titleBottom + 40);

  drawDivider(ctx, titleBottom + 70, bg);

  // Excerpt or verse
  const excerpt = data.studyExcerpt || data.verseText || "";
  if (excerpt) {
    const e = adaptiveText(ctx, `"${excerpt}"`, CONTENT_W, H * 0.2, 38, 24, SERIF, 1.8, "italic");
    ctx.fillStyle = c.secondary;
    ctx.font = `italic ${e.fontSize}px ${SERIF}`;
    ctx.textAlign = "center";
    const excerptBottom = titleBottom + 90 + drawLines(ctx, e.lines, W / 2, titleBottom + 90, e.fontSize, 1.8);

    // Insight
    if (data.insightText) {
      const iy = Math.max(excerptBottom + 50, H * 0.6);
      drawDivider(ctx, iy, bg, true);

      ctx.fillStyle = c.accent;
      ctx.font = `600 20px ${SANS}`;
      ctx.fillText("REVELAÇÃO", W / 2, iy + 35);

      const ins = adaptiveText(ctx, data.insightText, CONTENT_W, H * 0.15, 28, 20, SANS, 1.8);
      ctx.fillStyle = c.muted;
      ctx.font = `${ins.fontSize}px ${SANS}`;
      drawLines(ctx, ins.lines, W / 2, iy + 50, ins.fontSize, 1.8);
    }
  }
}

// ─── Template: Minimalista ──────────────────────────────────

function renderMinimalista(ctx: CanvasRenderingContext2D, data: StoryData, bg: StoryBackground) {
  const c = colors(bg);

  // Centered content with lots of breathing room
  const text = data.verseText || data.studyExcerpt || data.studyTitle || "";
  const v = adaptiveText(ctx, `"${text}"`, CONTENT_W - 60, H * 0.3, 46, 28, SERIF, 2, "italic");

  ctx.fillStyle = c.main;
  ctx.font = `italic ${v.fontSize}px ${SERIF}`;
  ctx.textAlign = "center";
  const totalTextH = v.lines.length * v.fontSize * 2;
  const startY = (H - totalTextH) / 2 - 60;
  const bottom = startY + drawLines(ctx, v.lines, W / 2, startY, v.fontSize, 2);

  // Reference below
  ctx.fillStyle = c.accent;
  ctx.font = `500 28px ${SANS}`;
  ctx.fillText(`— ${data.reference}`, W / 2, bottom + 60);
}

// ─── Main render function ───────────────────────────────────

export function renderStoryToCanvas(data: StoryData, config?: StoryConfig): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const template = config?.template ?? "classico";
  const bg = config?.background ?? "escuro";

  // Background
  drawBackground(ctx, bg);

  // Ornaments (skip for minimalista)
  if (template !== "minimalista") {
    drawTopBottomBars(ctx, bg);
    drawCornerOrnaments(ctx, bg);
  }

  // Render template content
  switch (template) {
    case "classico": renderClassico(ctx, data, bg); break;
    case "insight": renderInsight(ctx, data, bg); break;
    case "palavra-do-dia": renderPalavraDoDia(ctx, data, bg); break;
    case "estudo": renderEstudo(ctx, data, bg); break;
    case "minimalista": renderMinimalista(ctx, data, bg); break;
  }

  // Branding
  drawBranding(ctx, bg);

  return canvas;
}

export default StoryData;

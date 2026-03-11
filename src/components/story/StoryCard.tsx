/**
 * StoryCard — renders story art directly onto a Canvas 2D context.
 * This replaces the html2canvas approach which was unreliable on mobile.
 */

export type StoryType = "verse" | "verse-reveal" | "study";

export interface StoryData {
  type: StoryType;
  reference: string;
  verseText?: string;
  insightText?: string;
  studyTitle?: string;
  studyExcerpt?: string;
}

const W = 1080;
const H = 1920;
const PAD_X = 120;
const CONTENT_W = W - PAD_X * 2;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontFamily: string,
  fontStyle: string = ""
): string[] {
  ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`.trim();
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const test = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = test;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function adaptiveFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxHeight: number,
  baseFontSize: number,
  minFontSize: number,
  fontFamily: string,
  lineHeightRatio: number,
  fontStyle: string = ""
): { fontSize: number; lines: string[] } {
  let size = baseFontSize;
  let lines: string[] = [];

  while (size >= minFontSize) {
    lines = wrapText(ctx, text, maxWidth, size, fontFamily, fontStyle);
    const totalHeight = lines.length * size * lineHeightRatio;
    if (totalHeight <= maxHeight) break;
    size -= 2;
  }

  return { fontSize: size, lines };
}

export function renderStoryToCanvas(data: StoryData): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  const sansFont = "system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  const serifFont = "Georgia, Times New Roman, Times, serif";

  // Background
  ctx.fillStyle = "#1A1C1E";
  ctx.fillRect(0, 0, W, H);

  // Top/bottom gradient bars
  const topGrad = ctx.createLinearGradient(0, 0, W, 0);
  topGrad.addColorStop(0, "#542A22");
  topGrad.addColorStop(0.5, "#8B5E3C");
  topGrad.addColorStop(1, "#542A22");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);

  // Corner ornaments (L-shapes)
  const cornerSize = 80;
  const cornerInset = 64;
  ctx.strokeStyle = "rgba(84,42,34,0.4)";
  ctx.lineWidth = 4;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(cornerInset, cornerInset + cornerSize);
  ctx.lineTo(cornerInset, cornerInset);
  ctx.lineTo(cornerInset + cornerSize, cornerInset);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(W - cornerInset - cornerSize, cornerInset);
  ctx.lineTo(W - cornerInset, cornerInset);
  ctx.lineTo(W - cornerInset, cornerInset + cornerSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(cornerInset, H - cornerInset - cornerSize);
  ctx.lineTo(cornerInset, H - cornerInset);
  ctx.lineTo(cornerInset + cornerSize, H - cornerInset);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(W - cornerInset - cornerSize, H - cornerInset);
  ctx.lineTo(W - cornerInset, H - cornerInset);
  ctx.lineTo(W - cornerInset, H - cornerInset - cornerSize);
  ctx.stroke();

  // --- Content rendering (centered vertically) ---
  const isStudy = data.type === "study";
  const hasReveal = data.type === "verse-reveal" || isStudy;

  // Pre-calculate all text blocks to center vertically
  const blocks: { draw: (y: number) => number }[] = [];

  // Diamond ornament
  blocks.push({
    draw: (y) => {
      ctx.fillStyle = "rgba(139,94,60,0.6)";
      ctx.font = `60px ${serifFont}`;
      ctx.textAlign = "center";
      ctx.fillText("✦", W / 2, y + 50);
      return 80;
    },
  });

  // Reference
  blocks.push({
    draw: (y) => {
      ctx.fillStyle = "#C4956A";
      ctx.font = `600 32px ${sansFont}`;
      ctx.textAlign = "center";
      ctx.fillText(data.reference.toUpperCase(), W / 2, y + 36);
      return 56;
    },
  });

  // Divider
  blocks.push({
    draw: (y) => {
      const cy = y + 20;
      ctx.strokeStyle = "rgba(84,42,34,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 130, cy);
      ctx.lineTo(W / 2 - 30, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(W / 2 + 30, cy);
      ctx.lineTo(W / 2 + 130, cy);
      ctx.stroke();

      ctx.fillStyle = "rgba(84,42,34,0.5)";
      ctx.beginPath();
      ctx.arc(W / 2, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      return 60;
    },
  });

  // Main text
  if (isStudy) {
    // Study title
    const titleResult = adaptiveFontSize(ctx, data.studyTitle || "", CONTENT_W, 300, 52, 32, serifFont, 1.6, "600");
    blocks.push({
      draw: (y) => {
        ctx.fillStyle = "#F5F0E8";
        ctx.font = `600 ${titleResult.fontSize}px ${serifFont}`;
        ctx.textAlign = "center";
        const lh = titleResult.fontSize * 1.6;
        let curY = y;
        for (const line of titleResult.lines) {
          curY += lh;
          ctx.fillText(line, W / 2, curY);
        }
        return curY - y + 20;
      },
    });

    if (data.studyExcerpt) {
      const excerptResult = adaptiveFontSize(ctx, `"${data.studyExcerpt}"`, CONTENT_W, 250, 38, 26, serifFont, 1.8, "italic");
      blocks.push({
        draw: (y) => {
          ctx.fillStyle = "#D4C9B8";
          ctx.font = `italic ${excerptResult.fontSize}px ${serifFont}`;
          ctx.textAlign = "center";
          const lh = excerptResult.fontSize * 1.8;
          let curY = y;
          for (const line of excerptResult.lines) {
            curY += lh;
            ctx.fillText(line, W / 2, curY);
          }
          return curY - y + 10;
        },
      });
    }
  } else {
    // Verse text
    const verseText = `"${data.verseText || ""}"`;
    const verseResult = adaptiveFontSize(ctx, verseText, CONTENT_W, 550, 46, 28, serifFont, 1.8, "italic");
    blocks.push({
      draw: (y) => {
        ctx.fillStyle = "#F5F0E8";
        ctx.font = `italic ${verseResult.fontSize}px ${serifFont}`;
        ctx.textAlign = "center";
        const lh = verseResult.fontSize * 1.8;
        let curY = y;
        for (const line of verseResult.lines) {
          curY += lh;
          ctx.fillText(line, W / 2, curY);
        }
        return curY - y + 10;
      },
    });
  }

  // Insight text
  if (hasReveal && data.insightText) {
    // Small divider
    blocks.push({
      draw: (y) => {
        const cy = y + 30;
        ctx.strokeStyle = "rgba(84,42,34,0.3)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W / 2 - 80, cy);
        ctx.lineTo(W / 2 - 20, cy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(W / 2 + 20, cy);
        ctx.lineTo(W / 2 + 80, cy);
        ctx.stroke();
        ctx.fillStyle = "rgba(139,94,60,0.5)";
        ctx.font = `28px ${serifFont}`;
        ctx.textAlign = "center";
        ctx.fillText("✦", W / 2, cy + 4);
        return 60;
      },
    });

    const insightResult = adaptiveFontSize(ctx, data.insightText, CONTENT_W, 250, 32, 24, sansFont, 1.8);
    blocks.push({
      draw: (y) => {
        ctx.fillStyle = "#B8A898";
        ctx.font = `${insightResult.fontSize}px ${sansFont}`;
        ctx.textAlign = "center";
        const lh = insightResult.fontSize * 1.8;
        let curY = y;
        for (const line of insightResult.lines) {
          curY += lh;
          ctx.fillText(line, W / 2, curY);
        }
        return curY - y + 10;
      },
    });
  }

  // Calculate total height of all blocks
  // We need a dry-run to measure heights
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = W;
  tempCanvas.height = H;
  const tempCtx = tempCanvas.getContext("2d")!;

  let totalH = 0;
  const heights: number[] = [];
  for (const block of blocks) {
    // Create a measuring version
    const origDraw = block.draw;
    const h = origDraw.call(null, 0); // y doesn't matter for height calc on temp
    // Actually we need to use the real context for measurement since font metrics matter
    // Let's just re-measure with the real ctx
    heights.push(h);
    totalH += h;
  }

  // Actually, the draw functions modify ctx state, so let's do a proper two-pass
  // Pass 1: measure
  totalH = 0;
  const measuredHeights: number[] = [];
  for (const block of blocks) {
    ctx.save();
    const h = block.draw(-10000); // draw offscreen to measure
    measuredHeights.push(h);
    totalH += h;
    ctx.restore();
  }

  // Clear and redraw background
  ctx.fillStyle = "#1A1C1E";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, W, 12);
  ctx.fillRect(0, H - 12, W, 12);

  // Redraw corners
  ctx.strokeStyle = "rgba(84,42,34,0.4)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cornerInset, cornerInset + cornerSize);
  ctx.lineTo(cornerInset, cornerInset);
  ctx.lineTo(cornerInset + cornerSize, cornerInset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - cornerInset - cornerSize, cornerInset);
  ctx.lineTo(W - cornerInset, cornerInset);
  ctx.lineTo(W - cornerInset, cornerInset + cornerSize);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cornerInset, H - cornerInset - cornerSize);
  ctx.lineTo(cornerInset, H - cornerInset);
  ctx.lineTo(cornerInset + cornerSize, H - cornerInset);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W - cornerInset - cornerSize, H - cornerInset);
  ctx.lineTo(W - cornerInset, H - cornerInset);
  ctx.lineTo(W - cornerInset, H - cornerInset - cornerSize);
  ctx.stroke();

  // Footer area height
  const footerH = 140;
  const availableH = H - 200 - footerH; // 200 top margin, footerH bottom
  const startY = Math.max(200, (H - footerH - totalH) / 2);

  // Pass 2: draw at correct positions
  let curY = startY;
  for (let i = 0; i < blocks.length; i++) {
    const h = blocks[i].draw(curY);
    curY += h;
  }

  // Footer branding
  const footerY = H - 100;
  ctx.strokeStyle = "rgba(84,42,34,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 120, footerY);
  ctx.lineTo(W / 2 - 40, footerY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(W / 2 + 40, footerY);
  ctx.lineTo(W / 2 + 120, footerY);
  ctx.stroke();

  ctx.fillStyle = "#8B5E3C";
  ctx.font = `600 26px ${sansFont}`;
  ctx.textAlign = "center";
  ctx.fillText("VIA REVELA", W / 2, footerY + 6);

  ctx.fillStyle = "#5C5046";
  ctx.font = `22px ${sansFont}`;
  ctx.fillText("rrevela.lovable.app", W / 2, footerY + 40);

  return canvas;
}

export default StoryData;

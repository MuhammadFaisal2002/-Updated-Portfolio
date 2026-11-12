import * as THREE from 'three';

/** Card face texture size in pixels (same 1.6 : 2.25 ratio as the 3D card). */
const FACE_W = 640;
const FACE_H = 900;

const CRIMSON = '#dc143c';
const DISPLAY = "'Itim-Regular', Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export interface BadgeTextures {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  strap: THREE.CanvasTexture;
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D canvas is not available');
  return { canvas, ctx };
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function paintCardBase(ctx: CanvasRenderingContext2D) {
  const bg = ctx.createLinearGradient(0, 0, 0, FACE_H);
  bg.addColorStop(0, '#262626');
  bg.addColorStop(1, '#101010');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, FACE_W, FACE_H);

  // Faint engineering grid, echoing the site background
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 40; x < FACE_W; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, FACE_H);
    ctx.stroke();
  }
  for (let y = 40; y < FACE_H; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(FACE_W, y);
    ctx.stroke();
  }

  // Crimson glow in the top-right corner
  const glow = ctx.createRadialGradient(FACE_W, 0, 0, FACE_W, 0, 520);
  glow.addColorStop(0, 'rgba(220, 20, 60, 0.38)');
  glow.addColorStop(1, 'rgba(220, 20, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, FACE_W, FACE_H);

  // Punched slot where the clip attaches
  roundedRect(ctx, FACE_W / 2 - 62, 26, 124, 24, 12);
  ctx.fillStyle = '#050505';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Bottom accent bar
  ctx.fillStyle = CRIMSON;
  ctx.fillRect(0, FACE_H - 14, FACE_W, 14);
}

function drawLogo(ctx: CanvasRenderingContext2D, centerX: number, baseline: number, size: number) {
  ctx.font = `700 ${size}px ${DISPLAY}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const left = 'MF';
  const right = ' DEVELOPER.';
  const total = ctx.measureText(left).width + ctx.measureText(right).width;
  let x = centerX - total / 2;
  ctx.fillStyle = CRIMSON;
  ctx.fillText(left, x, baseline);
  x += ctx.measureText(left).width;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(right, x, baseline);
}

function paintFront(photo: HTMLImageElement | null) {
  const { canvas, ctx } = makeCanvas(FACE_W, FACE_H);
  paintCardBase(ctx);
  drawLogo(ctx, FACE_W / 2, 112, 40);

  // Photo, cover-cropped into a rounded frame and biased toward the face
  const frame = { x: 80, y: 146, size: 480, radius: 30 };
  ctx.save();
  roundedRect(ctx, frame.x, frame.y, frame.size, frame.size, frame.radius);
  ctx.clip();
  if (photo && photo.naturalWidth > 0) {
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    const sx = (photo.naturalWidth - side) / 2;
    const sy = (photo.naturalHeight - side) * 0.12;
    ctx.drawImage(photo, sx, sy, side, side, frame.x, frame.y, frame.size, frame.size);
  } else {
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(frame.x, frame.y, frame.size, frame.size);
  }
  ctx.restore();
  roundedRect(ctx, frame.x, frame.y, frame.size, frame.size, frame.radius);
  ctx.strokeStyle = CRIMSON;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 52px ${DISPLAY}`;
  ctx.fillText('M Faisal Abshar', FACE_W / 2, 704);

  ctx.fillStyle = CRIMSON;
  ctx.font = `700 31px ${DISPLAY}`;
  ctx.fillText('Full Stack Developer', FACE_W / 2, 752);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 786);
  ctx.lineTo(FACE_W - 120, 786);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = `500 21px ${MONO}`;
  ctx.fillText('KARACHI, PK  ·  UTC+5', FACE_W / 2, 832);
  return canvas;
}

function paintBack() {
  const { canvas, ctx } = makeCanvas(FACE_W, FACE_H);
  paintCardBase(ctx);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = CRIMSON;
  ctx.font = `700 250px ${DISPLAY}`;
  ctx.fillText('MF', FACE_W / 2, 440);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 70px ${DISPLAY}`;
  ctx.fillText('DEVELOPER.', FACE_W / 2, 528);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = `500 22px ${MONO}`;
  ctx.fillText('NEXT.JS  ·  LARAVEL  ·  TYPESCRIPT', FACE_W / 2, 770);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = `500 23px ${MONO}`;
  ctx.fillText('faisalabshar2002@gmail.com', FACE_W / 2, 824);
  return canvas;
}

function paintStrap() {
  const { canvas, ctx } = makeCanvas(1024, 128);
  const bg = ctx.createLinearGradient(0, 0, 0, 128);
  bg.addColorStop(0, '#f02a52');
  bg.addColorStop(0.5, CRIMSON);
  bg.addColorStop(1, '#a80f2e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 128);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.fillRect(0, 0, 1024, 9);
  ctx.fillRect(0, 119, 1024, 9);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 62px ${DISPLAY}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText('MF DEVELOPER', 256, 68);
  ctx.fillText('MF DEVELOPER', 768, 68);
  ctx.beginPath();
  ctx.arc(8, 64, 9, 0, Math.PI * 2);
  ctx.arc(512, 64, 9, 0, Math.PI * 2);
  ctx.arc(1016, 64, 9, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

function toTexture(canvas: HTMLCanvasElement) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/**
 * Paints the badge's front, back and strap onto canvases and returns them as
 * textures. The photo is requested through the Next image optimizer so the
 * badge does not pull the full-size original.
 */
export async function createBadgeTextures(photoSrc: string): Promise<BadgeTextures> {
  const optimized = `/_next/image?url=${encodeURIComponent(photoSrc)}&w=828&q=75`;
  const [photo] = await Promise.all([
    loadImage(optimized).catch(() => loadImage(photoSrc)).catch(() => null),
    document.fonts?.load(`700 52px ${DISPLAY}`).catch(() => undefined),
  ]);

  const strap = toTexture(paintStrap());
  strap.wrapS = THREE.RepeatWrapping;
  strap.wrapT = THREE.RepeatWrapping;

  return { front: toTexture(paintFront(photo)), back: toTexture(paintBack()), strap };
}

import * as THREE from 'three';

/** Card face texture size in pixels (same 1.6 : 2.25 ratio as the 3D card). */
const FACE_W = 640;
const FACE_H = 900;
/** Corner radius in pixels, matching the card geometry's rounded corners. */
const FACE_RADIUS = 44;

const CRIMSON = '#dc143c';
const DISPLAY = "'Itim-Regular', Arial, sans-serif";
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export type BadgeTheme = 'dark' | 'light';

export interface BadgeTextures {
  front: THREE.CanvasTexture;
  back: THREE.CanvasTexture;
  strap: THREE.CanvasTexture;
}

/** Glass tint and ink for each site theme. The card is translucent, so the page shows through. */
interface Palette {
  tintTop: string;
  tintBottom: string;
  rim: string;
  rimOuter: string;
  sheen: string;
  grid: string;
  slot: string;
  ink: string;
  inkSoft: string;
  rule: string;
  textShadow: string;
}

const PALETTES: Record<BadgeTheme, Palette> = {
  dark: {
    tintTop: 'rgba(255, 255, 255, 0.15)',
    tintBottom: 'rgba(255, 255, 255, 0.05)',
    rim: 'rgba(255, 255, 255, 0.5)',
    rimOuter: 'rgba(255, 255, 255, 0.12)',
    sheen: 'rgba(255, 255, 255, 0.11)',
    grid: 'rgba(255, 255, 255, 0.04)',
    slot: 'rgba(0, 0, 0, 0.5)',
    ink: '#ffffff',
    inkSoft: 'rgba(255, 255, 255, 0.72)',
    rule: 'rgba(255, 255, 255, 0.2)',
    textShadow: 'rgba(0, 0, 0, 0.55)',
  },
  light: {
    tintTop: 'rgba(255, 255, 255, 0.78)',
    tintBottom: 'rgba(255, 255, 255, 0.5)',
    rim: 'rgba(255, 255, 255, 0.98)',
    rimOuter: 'rgba(0, 0, 0, 0.16)',
    sheen: 'rgba(255, 255, 255, 0.5)',
    grid: 'rgba(0, 0, 0, 0.035)',
    slot: 'rgba(0, 0, 0, 0.3)',
    ink: '#1a1a1a',
    inkSoft: 'rgba(0, 0, 0, 0.62)',
    rule: 'rgba(0, 0, 0, 0.16)',
    textShadow: 'rgba(255, 255, 255, 0)',
  },
};

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

/** Frosted glass pane: translucent tint, crimson glow, diagonal sheen and a bright rim. */
function paintGlass(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.clearRect(0, 0, FACE_W, FACE_H);
  ctx.save();
  roundedRect(ctx, 0, 0, FACE_W, FACE_H, FACE_RADIUS);
  ctx.clip();

  const tint = ctx.createLinearGradient(0, 0, 0, FACE_H);
  tint.addColorStop(0, p.tintTop);
  tint.addColorStop(1, p.tintBottom);
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, FACE_W, FACE_H);

  ctx.strokeStyle = p.grid;
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

  const glow = ctx.createRadialGradient(FACE_W, 0, 0, FACE_W, 0, 560);
  glow.addColorStop(0, 'rgba(220, 20, 60, 0.34)');
  glow.addColorStop(1, 'rgba(220, 20, 60, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, FACE_W, FACE_H);

  const sheen = ctx.createLinearGradient(0, 0, FACE_W, FACE_H * 0.7);
  sheen.addColorStop(0.22, 'rgba(255, 255, 255, 0)');
  sheen.addColorStop(0.36, p.sheen);
  sheen.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, FACE_W, FACE_H);

  ctx.fillStyle = 'rgba(220, 20, 60, 0.9)';
  ctx.fillRect(0, FACE_H - 10, FACE_W, 10);
  ctx.restore();

  // Rim light: a bright inner edge with a faint outer hairline
  roundedRect(ctx, 1.5, 1.5, FACE_W - 3, FACE_H - 3, FACE_RADIUS - 1.5);
  ctx.strokeStyle = p.rimOuter;
  ctx.lineWidth = 3;
  ctx.stroke();
  roundedRect(ctx, 5, 5, FACE_W - 10, FACE_H - 10, FACE_RADIUS - 5);
  ctx.strokeStyle = p.rim;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Punched slot where the clip attaches
  roundedRect(ctx, FACE_W / 2 - 62, 28, 124, 24, 12);
  ctx.fillStyle = p.slot;
  ctx.fill();
  ctx.strokeStyle = p.rim;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function withTextShadow(ctx: CanvasRenderingContext2D, p: Palette, draw: () => void) {
  ctx.save();
  ctx.shadowColor = p.textShadow;
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  draw();
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, p: Palette, centerX: number, baseline: number, size: number) {
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
  ctx.fillStyle = p.ink;
  ctx.fillText(right, x, baseline);
}

function paintFront(photo: HTMLImageElement | null, p: Palette) {
  const { canvas, ctx } = makeCanvas(FACE_W, FACE_H);
  paintGlass(ctx, p);
  withTextShadow(ctx, p, () => drawLogo(ctx, p, FACE_W / 2, 114, 40));

  // Photo, cover-cropped into a rounded frame and biased toward the face
  const frame = { x: 80, y: 148, size: 480, radius: 30 };
  ctx.save();
  roundedRect(ctx, frame.x, frame.y, frame.size, frame.size, frame.radius);
  ctx.clip();
  if (photo && photo.naturalWidth > 0) {
    const side = Math.min(photo.naturalWidth, photo.naturalHeight);
    const sx = (photo.naturalWidth - side) / 2;
    const sy = (photo.naturalHeight - side) * 0.12;
    ctx.drawImage(photo, sx, sy, side, side, frame.x, frame.y, frame.size, frame.size);
  } else {
    ctx.fillStyle = 'rgba(128, 128, 128, 0.35)';
    ctx.fillRect(frame.x, frame.y, frame.size, frame.size);
  }
  ctx.restore();
  roundedRect(ctx, frame.x, frame.y, frame.size, frame.size, frame.radius);
  ctx.strokeStyle = 'rgba(220, 20, 60, 0.9)';
  ctx.lineWidth = 4;
  ctx.stroke();

  withTextShadow(ctx, p, () => {
    ctx.textAlign = 'center';
    ctx.fillStyle = p.ink;
    ctx.font = `700 52px ${DISPLAY}`;
    ctx.fillText('M Faisal Abshar', FACE_W / 2, 706);
    ctx.fillStyle = CRIMSON;
    ctx.font = `700 31px ${DISPLAY}`;
    ctx.fillText('Full Stack Developer', FACE_W / 2, 754);
  });

  ctx.strokeStyle = p.rule;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(120, 788);
  ctx.lineTo(FACE_W - 120, 788);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = p.inkSoft;
  ctx.font = `500 21px ${MONO}`;
  ctx.fillText('KARACHI, PK  ·  UTC+5', FACE_W / 2, 834);
  return canvas;
}

function paintBack(p: Palette) {
  const { canvas, ctx } = makeCanvas(FACE_W, FACE_H);
  paintGlass(ctx, p);

  withTextShadow(ctx, p, () => {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = CRIMSON;
    ctx.font = `700 250px ${DISPLAY}`;
    ctx.fillText('MF', FACE_W / 2, 440);
    ctx.fillStyle = p.ink;
    ctx.font = `700 70px ${DISPLAY}`;
    ctx.fillText('DEVELOPER.', FACE_W / 2, 528);
  });

  ctx.textAlign = 'center';
  ctx.fillStyle = p.inkSoft;
  ctx.font = `500 22px ${MONO}`;
  ctx.fillText('NEXT.JS · NODE.JS · LARAVEL · TYPESCRIPT', FACE_W / 2, 770);
  ctx.fillStyle = p.ink;
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

/** Never wait on the photo longer than this; the badge is drawn without it instead. */
const PHOTO_TIMEOUT_MS = 8000;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => reject(new Error(`Timed out loading ${src}`)), PHOTO_TIMEOUT_MS);
    img.decoding = 'async';
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error(`Could not load ${src}`));
    };
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
 * textures. The faces are translucent glass panes tinted for the given theme.
 *
 * `photoSrc` should be a small static file. The Next image optimizer is
 * deliberately not used here: a slow or stuck optimizer response would leave
 * the badge waiting, and a missing photo must never stop the badge appearing.
 */
export async function createBadgeTextures(photoSrc: string, theme: BadgeTheme): Promise<BadgeTextures> {
  const [photo] = await Promise.all([
    loadImage(photoSrc).catch(() => null),
    document.fonts?.load(`700 52px ${DISPLAY}`).catch(() => undefined),
  ]);

  const palette = PALETTES[theme];
  const strap = toTexture(paintStrap());
  strap.wrapS = THREE.RepeatWrapping;
  strap.wrapT = THREE.RepeatWrapping;

  return { front: toTexture(paintFront(photo, palette)), back: toTexture(paintBack(palette)), strap };
}

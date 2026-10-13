import * as THREE from 'three';

/**
 * Procedural texture generator for high-fidelity avatar evaluation.
 * Creates clean, anatomically sound textures for skin, realistic eyes (sclera + deep brown iris + pupil + catchlight),
 * and fine silky hair without relying on external broken assets or fake filters.
 */

export function createProceduralSkinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Warm Asian / Vietnamese golden-peach undertone (#F3D3BD to #DEB49B)
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  grad.addColorStop(0, '#F5D7C2'); // Forehead / upper
  grad.addColorStop(0.35, '#EFC8B0'); // Cheeks / nose bridge
  grad.addColorStop(0.55, '#E5BCA2'); // Lower jaw / chin
  grad.addColorStop(1, '#DCB093'); // Neck / base
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle natural blush on cheeks area (UV approximate)
  const leftCheek = ctx.createRadialGradient(340, 480, 10, 340, 480, 140);
  leftCheek.addColorStop(0, 'rgba(215, 120, 115, 0.28)');
  leftCheek.addColorStop(1, 'rgba(215, 120, 115, 0)');
  ctx.fillStyle = leftCheek;
  ctx.beginPath();
  ctx.arc(340, 480, 140, 0, Math.PI * 2);
  ctx.fill();

  const rightCheek = ctx.createRadialGradient(684, 480, 10, 684, 480, 140);
  rightCheek.addColorStop(0, 'rgba(215, 120, 115, 0.28)');
  rightCheek.addColorStop(1, 'rgba(215, 120, 115, 0)');
  ctx.fillStyle = rightCheek;
  ctx.beginPath();
  ctx.arc(684, 480, 140, 0, Math.PI * 2);
  ctx.fill();

  // Gentle natural lip tint (warm soft rose, not heavy makeup)
  const lipGrad = ctx.createRadialGradient(512, 690, 15, 512, 690, 110);
  lipGrad.addColorStop(0, 'rgba(196, 102, 100, 0.45)');
  lipGrad.addColorStop(0.7, 'rgba(180, 88, 88, 0.25)');
  lipGrad.addColorStop(1, 'rgba(180, 88, 88, 0)');
  ctx.fillStyle = lipGrad;
  ctx.beginPath();
  ctx.ellipse(512, 690, 95, 45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Micro skin pore noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.8));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Creates realistic human eye texture:
 * - Off-white sclera with soft limbal shadow and faint micro-capillaries
 * - Warm deep brown / amber Vietnamese-inspired iris with radial stroma fibers
 * - Well-defined black pupil centered
 * - Tiny sharp specularity / catchlight reflection at 10 o'clock
 */
export function createProceduralEyeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = 256;
  const cy = 256;

  // 1. Sclera (củng mạc / lòng trắng ấm tự nhiên, không trắng toát như ma cà rồng)
  const scleraGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 256);
  scleraGrad.addColorStop(0, '#FCFBF8');
  scleraGrad.addColorStop(0.7, '#F4EFE6');
  scleraGrad.addColorStop(0.95, '#E8DDD0');
  scleraGrad.addColorStop(1.0, '#DCBFA8');
  ctx.fillStyle = scleraGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle soft vascular lines in sclera corners
  ctx.strokeStyle = 'rgba(180, 80, 80, 0.12)';
  ctx.lineWidth = 1;
  for (let a = 0; a < 16; a++) {
    const angle = (a / 16) * Math.PI * 2;
    const rStart = 160 + Math.random() * 20;
    const rEnd = 240 + Math.random() * 10;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * rStart, cy + Math.sin(angle) * rStart);
    ctx.lineTo(cx + Math.cos(angle + 0.08) * rEnd, cy + Math.sin(angle + 0.08) * rEnd);
    ctx.stroke();
  }

  // 2. Limbal ring (viền tròng đen sẫm màu)
  const irisRadius = 145;
  ctx.beginPath();
  ctx.arc(cx, cy, irisRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = '#1D130D';
  ctx.fill();

  // 3. Iris stroma (tròng đen màu nâu sẫm ấm đặc trưng Đông Á / Việt Nam)
  const irisGrad = ctx.createRadialGradient(cx, cy, 35, cx, cy, irisRadius);
  irisGrad.addColorStop(0, '#5C381E'); // Inner warm amber collarette
  irisGrad.addColorStop(0.4, '#3E2211'); // Mid deep brown
  irisGrad.addColorStop(0.85, '#26150A'); // Outer deep charcoal brown
  irisGrad.addColorStop(1, '#150B05'); // Dark limbus
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, irisRadius, 0, Math.PI * 2);
  ctx.fill();

  // Radial iris fibers
  ctx.save();
  ctx.translate(cx, cy);
  for (let i = 0; i < 90; i++) {
    const rad = (i / 90) * Math.PI * 2;
    const len = 40 + Math.sin(i * 3.7) * 45;
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(145, 95, 55, 0.35)' : 'rgba(40, 22, 10, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(rad) * 38, Math.sin(rad) * 38);
    ctx.lineTo(Math.cos(rad) * (38 + len), Math.sin(rad) * (38 + len));
    ctx.stroke();
  }
  ctx.restore();

  // 4. Centered Black Pupil (đồng tử đen tuyền, kích thước ~28 tuổi trong ánh sáng bình thường)
  const pupilRadius = 46;
  ctx.beginPath();
  ctx.arc(cx, cy, pupilRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#080808';
  ctx.fill();

  // 5. Catchlight reflection (ánh phản quang nhỏ tự nhiên góc 10 giờ)
  ctx.beginPath();
  ctx.arc(cx - 36, cy - 38, 12, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fill();

  // Secondary soft catchlight at 4 o'clock
  ctx.beginPath();
  ctx.arc(cx + 28, cy + 32, 6, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Creates dark natural hair texture (deep espresso / ebony black with fine soft highlights)
 */
export function createProceduralHairTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep obsidian/espresso black base
  ctx.fillStyle = '#141214';
  ctx.fillRect(0, 0, 512, 512);

  // Vertical strand strands
  for (let x = 0; x < 512; x += 2) {
    const brightness = Math.sin(x * 0.08) * 12 + (Math.random() - 0.5) * 8;
    const colVal = Math.floor(Math.max(10, Math.min(45, 22 + brightness)));
    ctx.strokeStyle = `rgb(${colVal + 2}, ${colVal}, ${colVal + 3})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 6, 512);
    ctx.stroke();
  }

  // Soft subtle sheen band in center
  const sheenGrad = ctx.createLinearGradient(0, 160, 0, 320);
  sheenGrad.addColorStop(0, 'rgba(80, 72, 76, 0)');
  sheenGrad.addColorStop(0.5, 'rgba(120, 105, 110, 0.22)');
  sheenGrad.addColorStop(1, 'rgba(80, 72, 76, 0)');
  ctx.fillStyle = sheenGrad;
  ctx.fillRect(0, 160, 512, 160);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  return texture;
}

/**
 * Creates normal map for subtle silk fabric texture on Ao Ngu Than
 */
export function createSilkNormalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#8080FF'; // flat normal
  ctx.fillRect(0, 0, 256, 256);

  const imgData = ctx.getImageData(0, 0, 256, 256);
  const d = imgData.data;
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const waveX = Math.sin(x * 0.4) * 12;
      const waveY = Math.cos(y * 0.4) * 12;
      d[idx] = Math.min(255, Math.max(0, 128 + waveX));
      d[idx + 1] = Math.min(255, Math.max(0, 128 + waveY));
      d[idx + 2] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

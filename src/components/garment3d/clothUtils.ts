import * as THREE from 'three';

// Archival raw silk ivory tone (#FCFAF6) as strictly specified
export const CLOTH_IVORY_COLOR = 0xFCFAF6;

/**
 * Creates high-fidelity procedural micro-weave normal and bump textures
 * simulating traditional handwoven Vietnamese silk (lụa Vạn Phúc / tơ tằm).
 */
export function createSilkTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Neutral base normal
    ctx.fillStyle = '#8080ff';
    ctx.fillRect(0, 0, size, size);

    // Subtle cross-weave yarns
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 4) {
      // Warp threads
      const v1 = 120 + Math.floor(Math.random() * 25);
      ctx.strokeStyle = `rgb(${v1}, ${v1}, 255)`;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();

      // Weft threads
      const v2 = 120 + Math.floor(Math.random() * 25);
      ctx.strokeStyle = `rgb(${v2}, ${v2}, 255)`;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

/**
 * Procedural radial shadow texture for soft floor grounding plane
 */
export function createSoftShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(26, 36, 33, 0.28)');
    gradient.addColorStop(0.35, 'rgba(26, 36, 33, 0.16)');
    gradient.addColorStop(0.7, 'rgba(26, 36, 33, 0.05)');
    gradient.addColorStop(1, 'rgba(26, 36, 33, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Silk material using MeshPhysicalMaterial with sheen to capture anisotropic silk sheen.
 * Monochromatic ivory #FCFAF6 across all 7 traditional garments.
 */
export function createSilkMaterial(): THREE.MeshPhysicalMaterial {
  const silkTexture = createSilkTexture();

  return new THREE.MeshPhysicalMaterial({
    color: CLOTH_IVORY_COLOR,
    roughness: 0.65,
    metalness: 0.02,
    sheen: 0.80,
    sheenRoughness: 0.40,
    sheenColor: new THREE.Color(0xFFFFFF),
    bumpMap: silkTexture,
    bumpScale: 0.005,
    side: THREE.DoubleSide,
    flatShading: false,
    reflectivity: 0.25,
    clearcoat: 0.06,
    clearcoatRoughness: 0.6,
  });
}

/**
 * Button & clasp material: antique warm bronze with soft metallic glint
 */
export function createButtonMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x9B8355,
    roughness: 0.35,
    metalness: 0.70,
  });
}

/**
 * Brooch / Jade clasp material for royal collar (Áo Nhật Bình)
 */
export function createJadeBroochMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x587B6D,
    roughness: 0.25,
    metalness: 0.15,
  });
}

/**
 * Inner Yếm bodice material: strictly unified ivory silk (#FCFAF6)
 * Difference is revealed purely through light, occlusion, and fold geometry.
 */
export function createInnerYemMaterial(): THREE.MeshPhysicalMaterial {
  return createSilkMaterial();
}

/**
 * Collar and sash trim material: strictly unified ivory silk (#FCFAF6)
 */
export function createContrastCollarMaterial(): THREE.MeshPhysicalMaterial {
  return createSilkMaterial();
}

/**
 * Skirt material: strictly unified ivory silk (#FCFAF6)
 */
export function createDarkSkirtMaterial(): THREE.MeshPhysicalMaterial {
  return createSilkMaterial();
}

/**
 * Creates soft oval contact shadow mesh placed below the garment
 */
export function createGroundShadowMesh(): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(1.4, 0.65);
  geo.rotateX(-Math.PI * 0.5);
  const mat = new THREE.MeshBasicMaterial({
    map: createSoftShadowTexture(),
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -1.32;
  return mesh;
}

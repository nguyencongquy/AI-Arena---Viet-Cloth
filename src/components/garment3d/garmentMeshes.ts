import * as THREE from 'three';
import {
  createSilkMaterial,
  createButtonMaterial,
  createJadeBroochMaterial,
  createGroundShadowMesh,
  createInnerYemMaterial,
  createContrastCollarMaterial
} from './clothUtils';

export interface BuiltGarment3D {
  root: THREE.Group;
  deformableMeshes: {
    geometry: THREE.BufferGeometry;
    origPositions: Float32Array;
    motionProfile: 'torso' | 'sleeves-wide' | 'sleeves-fitted' | 'ribbon' | 'skirt-split' | 'bodice';
  }[];
  cleanUp?: () => void;
}

// =============================================================================
// 1. Áo ngũ thân (Five-panel standing-collar robe with 5 right-side buttons)
// Visual hallmarks:
// - Small upright mandarin collar (cổ đứng lập lĩnh, cao 3-4cm)
// - Asymmetrical curved right lapel (vạt hò) sweeping from neck to right armpit
// - 5 buttons (ngũ khuy) placed down the right overlap
// - Fitted sleeves (tay chẽn) tapering neatly to wrists
// - Knee-length 5-panel body with side hip slits
// =============================================================================
export function buildAoNguThanLegacy(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const btnMat = createButtonMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const shadow = createGroundShadowMesh();
  root.add(shadow);

  const nRows = 36;
  const nCols = 24;

  const getHalfWidth = (t: number): number => {
    if (t < 0.40) {
      const s = t / 0.40;
      return 0.50 * (1 - s) + 0.38 * s;
    } else if (t < 0.75) {
      const s = (t - 0.40) / 0.35;
      return 0.38 * (1 - s) + 0.42 * s;
    } else if (t < 0.90) {
      const s = (t - 0.75) / 0.15;
      return 0.42 * (1 - s) + 0.44 * s;
    } else {
      const s = (t - 0.90) / 0.10;
      return 0.44 * (1 - s) + 0.12 * s;
    }
  };

  const createTorsoPanel = (isFront: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const vCount = (nRows + 1) * (nCols + 1);
    const pos = new Float32Array(vCount * 3);
    const uvs = new Float32Array(vCount * 2);
    let vIdx = 0;
    let uvIdx = 0;

    for (let r = 0; r <= nRows; r++) {
      const t = r / nRows;
      const y = -1.25 + t * 2.38;
      const hw = getHalfWidth(t);
      const depth = 0.08 + t * 0.045;

      for (let c = 0; c <= nCols; c++) {
        const u = c / nCols;
        const x = -hw + u * 2 * hw;
        const normX = hw > 0.001 ? x / hw : 0;
        const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
        const fold = Math.sin(u * Math.PI * 5) * 0.012 * Math.sin(t * Math.PI);

        // Five-panel asymmetrical overlap on front
        let lapel = 0;
        if (isFront && t > 0.35) {
          const lapelCenter = 0.12 + (1 - t) * 0.18;
          const distToLapel = Math.abs(x - lapelCenter);
          if (distToLapel < 0.08) {
            lapel = 0.014 * (1 - distToLapel / 0.08);
          }
        }

        const z = (isFront ? 1 : -0.85) * arc * depth + fold + lapel;

        pos[vIdx] = x;
        pos[vIdx + 1] = y;
        pos[vIdx + 2] = z;

        uvs[uvIdx] = u;
        uvs[uvIdx + 1] = t;

        vIdx += 3;
        uvIdx += 2;
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const a = r * (nCols + 1) + c;
        const b = (r + 1) * (nCols + 1) + c;
        const d = (r + 1) * (nCols + 1) + (c + 1);
        const e = r * (nCols + 1) + (c + 1);
        if (isFront) {
          indices.push(a, b, d, a, d, e);
        } else {
          indices.push(a, d, b, a, e, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const frontGeo = createTorsoPanel(true);
  const backGeo = createTorsoPanel(false);
  geometriesToDispose.push(frontGeo, backGeo);

  root.add(new THREE.Mesh(frontGeo, clothMat));
  root.add(new THREE.Mesh(backGeo, clothMat));

  deformableMeshes.push(
    { geometry: frontGeo, origPositions: new Float32Array(frontGeo.attributes.position.array), motionProfile: 'torso' },
    { geometry: backGeo, origPositions: new Float32Array(backGeo.attributes.position.array), motionProfile: 'torso' }
  );

  // Fitted sleeves (tay chẽn): taper neatly to wrist
  const createFittedSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 18;
    const nRad = 16;
    const startX = sign * 0.43;
    const startY = 0.76;
    const endX = sign * 1.05;
    const endY = 0.10;

    const dirX = endX - startX;
    const dirY = endY - startY;
    const len = Math.hypot(dirX, dirY);
    const perpX = -dirY / (len || 1);
    const perpY = dirX / (len || 1);

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * dirX;
      const cy = startY + t * dirY;
      const r = 0.18 * (1 - t) + 0.095 * t;
      const sag = Math.sin(t * Math.PI) * 0.018;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * perpX;
        pos[vIdx + 1] = cy + Math.cos(phi) * r * perpY - sag;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.82);
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSlv = createFittedSleeve(true);
  const rightSlv = createFittedSleeve(false);
  geometriesToDispose.push(leftSlv, rightSlv);

  root.add(new THREE.Mesh(leftSlv, clothMat));
  root.add(new THREE.Mesh(rightSlv, clothMat));

  deformableMeshes.push(
    { geometry: leftSlv, origPositions: new Float32Array(leftSlv.attributes.position.array), motionProfile: 'sleeves-fitted' },
    { geometry: rightSlv, origPositions: new Float32Array(rightSlv.attributes.position.array), motionProfile: 'sleeves-fitted' }
  );

  // Upright standing mandarin collar (cổ đứng lập lĩnh)
  const collarGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.12, 22, 1, true);
  collarGeo.scale(1, 1, 0.82);
  geometriesToDispose.push(collarGeo);
  const collarMesh = new THREE.Mesh(collarGeo, clothMat);
  collarMesh.position.set(0, 1.19, 0.02);
  root.add(collarMesh);

  // Five traditional buttons (ngũ khuy) placed down the right lapel
  const btnGeo = new THREE.SphereGeometry(0.018, 12, 12);
  geometriesToDispose.push(btnGeo);

  const buttonPositions = [
    [0.05, 1.20, 0.10],   // 1. Neck center
    [0.12, 1.11, 0.105],  // 2. Collar base
    [0.20, 0.98, 0.11],   // 3. Right collarbone
    [0.28, 0.81, 0.115],  // 4. Right armpit
    [0.31, 0.61, 0.11],   // 5. Right ribcage
  ];

  buttonPositions.forEach(([bx, by, bz]) => {
    const b = new THREE.Mesh(btnGeo, btnMat);
    b.position.set(bx, by, bz);
    root.add(b);
  });

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
      btnMat.dispose();
    }
  };
}

// =============================================================================
export function buildAoNguThan(isSelected = false): BuiltGarment3D {
  const root = new THREE.Group();
  const cloth = createSilkMaterial();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const wash = ctx.createLinearGradient(0, 0, 512, 768);
            wash.addColorStop(0, isSelected ? '#F4EDDF' : '#FCFAF6');
wash.addColorStop(0.52, isSelected ? '#E8D8B9' : '#F1EBDE');
wash.addColorStop(1, isSelected ? '#D8C29A' : '#E0D6C3');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 512, 768);
    ctx.lineWidth = 1;
    for (let y = 0; y < 768; y += 7) {
      ctx.strokeStyle = isSelected ? 'rgba(255,248,226,.11)' : 'rgba(77,82,73,.045)';
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
    }
          const ink = isSelected ? 'rgba(47, 82, 77, 0.82)' : 'rgba(103, 92, 75, 0.40)';
          ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.lineWidth = 4;
    // Contemporary lotus-vine ornament: decorative treatment, not a historical reconstruction claim.
    for (const x of [198, 314]) {
      for (const y of [326, 500, 674]) {
        ctx.beginPath(); ctx.moveTo(x, y + 38);
        ctx.bezierCurveTo(x - 12, y + 5, x + 12, y - 13, x, y - 45); ctx.stroke();
        for (const [dx, dy, turn] of [[-15, 12, -.55], [14, -6, .6], [-10, -27, -.5]] as const) {
          ctx.save(); ctx.translate(x + dx, y + dy); ctx.rotate(turn);
          ctx.beginPath(); ctx.ellipse(0, 0, 8, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        }
              // Petals are drawn once per medallion.
          
                ctx.fillStyle = isSelected ? 'rgba(171, 133, 80, 0.84)' : 'rgba(128, 112, 84, 0.30)';
      for (let p = 0; p < 5; p += 1) {
        ctx.save(); ctx.translate(x, y - 48); ctx.rotate((Math.PI * 2 * p) / 5);
        ctx.beginPath(); ctx.ellipse(0, -16, 10, 23, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      ctx.fillStyle = isSelected ? 'rgba(155, 105, 86, 0.84)' : 'rgba(128, 112, 84, 0.30)';
      ctx.beginPath(); ctx.arc(x, y - 48, 5, 0, Math.PI * 2); ctx.fill();

      }
    }
    // Narrow front fastening and small buttons sit on the same continuous cloth surface.
    ctx.strokeStyle = isSelected ? 'rgba(239,220,175,.78)' : 'rgba(105,103,91,.48)';
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(350, 178); ctx.bezierCurveTo(365, 220, 360, 250, 360, 535); ctx.stroke();
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath(); ctx.arc(i === 0 ? 351 : 360, 205 + i * 62, 5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#D7C28F' : '#77756B'; ctx.fill();
    }
    ctx.strokeStyle = isSelected ? 'rgba(242,228,195,.72)' : 'rgba(109,106,94,.42)';
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(216, 153); ctx.quadraticCurveTo(256, 184, 296, 153); ctx.stroke();
  }
  const textile = new THREE.CanvasTexture(canvas);
  textile.colorSpace = THREE.SRGBColorSpace;
  cloth.map = textile;
  cloth.color.set(0xffffff);
  cloth.side = THREE.DoubleSide;
  cloth.roughness = 0.72;
  cloth.sheen = 0.62;

  // One sewn outline: body, shoulders and fitted sleeves are a single connected panel.
  const shape = new THREE.Shape();
  shape.moveTo(-0.14, 1.46);
  shape.quadraticCurveTo(-0.24, 1.49, -0.34, 1.46);
  shape.quadraticCurveTo(-0.47, 1.42, -0.52, 1.30);
  shape.bezierCurveTo(-0.61, 1.11, -0.73, 0.90, -0.79, 0.76);
  shape.quadraticCurveTo(-0.75, 0.66, -0.68, 0.70);
  shape.bezierCurveTo(-0.57, 0.79, -0.49, 0.92, -0.43, 1.00);
  shape.quadraticCurveTo(-0.39, 0.90, -0.37, 0.77);
  shape.bezierCurveTo(-0.39, 0.08, -0.46, -0.84, -0.49, -1.48);
  shape.bezierCurveTo(-0.20, -1.56, 0.20, -1.56, 0.49, -1.48);
  shape.bezierCurveTo(0.46, -0.84, 0.39, 0.08, 0.37, 0.77);
  shape.quadraticCurveTo(0.39, 0.90, 0.43, 1.00);
  shape.bezierCurveTo(0.49, 0.92, 0.57, 0.79, 0.68, 0.70);
  shape.quadraticCurveTo(0.75, 0.67, 0.79, 0.75);
  shape.bezierCurveTo(0.73, 0.90, 0.61, 1.10, 0.52, 1.30);
  shape.quadraticCurveTo(0.47, 1.42, 0.34, 1.46);
  shape.quadraticCurveTo(0.24, 1.49, 0.14, 1.46); shape.lineTo(0.14, 1.58);
  shape.quadraticCurveTo(0, 1.64, -0.14, 1.58); shape.closePath();

  let geometry: THREE.BufferGeometry = new THREE.ShapeGeometry(shape, 32);
  geometry.scale(1.14, 1, 1); // Fuller five-panel silhouette, same robe height.
  // Subdivide triangles for smooth light falloff and slow hem motion.
  for (let level = 0; level < 3; level += 1) {
    const pos = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    const verts: number[][] = [];
    for (let i = 0; i < pos.count; i += 1) verts.push([pos.getX(i), pos.getY(i), 0, uv.getX(i), uv.getY(i)]);
    const triangles = geometry.getIndex() ? Array.from(geometry.getIndex()!.array as ArrayLike<number>) : Array.from({ length: pos.count }, (_, i) => i);
    const midpoints = new Map<string, number>();
    const mid = (a: number, b: number): number => {
      const key = a < b ? a + ':' + b : b + ':' + a;
      const found = midpoints.get(key); if (found !== undefined) return found;
      const next = verts.length; verts.push(verts[a].map((value, axis) => (value + verts[b][axis]) * 0.5)); midpoints.set(key, next); return next;
    };
    const nextTriangles: number[] = [];
    for (let i = 0; i < triangles.length; i += 3) {
      const a = triangles[i], b = triangles[i + 1], c = triangles[i + 2];
      const ab = mid(a, b), bc = mid(b, c), ca = mid(c, a);
      nextTriangles.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
    }
    const next = new THREE.BufferGeometry();
    next.setAttribute('position', new THREE.Float32BufferAttribute(verts.flatMap(v => v.slice(0, 3)), 3));
    next.setAttribute('uv', new THREE.Float32BufferAttribute(verts.flatMap(v => v.slice(3, 5)), 2));
    next.setIndex(nextTriangles); geometry.dispose(); geometry = next;
  }
  const position = geometry.getAttribute('position');
  const original = new Float32Array(position.array as ArrayLike<number>);
  const smooth = (v: number, a: number, b: number) => { const t = THREE.MathUtils.clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), y = position.getY(i);
    const body = smooth(y, -1.5, -1.05) * (1 - smooth(y, 0.92, 1.46));
    const across = Math.min(1, Math.abs(x) / 0.58);
    const fold = (0.060 * Math.cos(x * 13 + y * 0.48) + 0.026 * Math.cos(x * 23 - y * 0.92)) * body;
    const round = 0.20 * Math.sqrt(Math.max(0, 1 - across * across)) * body;
    position.setZ(i, 0.025 + round + fold + 0.034 * Math.sin(y * 6.5 + Math.abs(x) * 3.2) * (1 - body));
  }
    // Fit the textile canvas to the whole robe; ShapeGeometry UVs are not normalized.
      geometry.computeBoundingBox();
        const bounds = geometry.boundingBox;
          if (bounds) {
              const uvPosition = geometry.getAttribute('position');
                  const uv = new Float32Array(uvPosition.count * 2);
                      const uvWidth = Math.max(bounds.max.x - bounds.min.x, 1e-4);
                          const uvHeight = Math.max(bounds.max.y - bounds.min.y, 1e-4);
                              for (let i = 0; i < uvPosition.count; i += 1) {
                                      uv[i * 2] = (uvPosition.getX(i) - bounds.min.x) / uvWidth;
                                            uv[i * 2 + 1] = (uvPosition.getY(i) - bounds.min.y) / uvHeight;
                                                }
                                                    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
                                                      }
                                                      position.needsUpdate = true;
  geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  const garment = new THREE.Mesh(geometry, cloth);
  garment.castShadow = true; garment.receiveShadow = true; root.add(garment);
  const shadow = createGroundShadowMesh(); root.add(shadow);
  return {
    root,
    deformableMeshes: [{ geometry, origPositions: original, motionProfile: 'torso' }],
    cleanUp: () => {
      geometry.dispose(); textile.dispose(); (cloth.bumpMap as THREE.Texture | null)?.dispose(); cloth.dispose();
      shadow.geometry.dispose(); (shadow.material as THREE.Material).dispose();
    },
  };
}

// 2. Áo tấc (Ceremonial wide-sleeved robe)
// Visual hallmarks:
// - Upright standing collar (cổ lập lĩnh) with 5 buttons
// - ENORMOUS CEREMONIAL WIDE FLOWING SLEEVES (tay thụng đại lễ, rộng 38-40cm)
// - Sleeves hang dramatically downwards to waist/knees in heavy, majestic ripples
// - Wide sweeping 5-panel robe body
// =============================================================================
export function buildAoTac(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const btnMat = createButtonMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const shadow = createGroundShadowMesh();
  root.add(shadow);

  const nRows = 36;
  const nCols = 24;

  const createBody = (isFront: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((nRows + 1) * (nCols + 1) * 3);
    let vIdx = 0;

    for (let r = 0; r <= nRows; r++) {
      const t = r / nRows;
      const y = -1.25 + t * 2.38;
      const hw = 0.54 * (1 - t * 0.45) + 0.15 * t;
      const depth = 0.085 + t * 0.045;

      for (let c = 0; c <= nCols; c++) {
        const u = c / nCols;
        const x = -hw + u * 2 * hw;
        const normX = hw > 0.001 ? x / hw : 0;
        const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
        const fold = Math.sin(u * Math.PI * 4) * 0.015 * Math.sin(t * Math.PI);

        pos[vIdx] = x;
        pos[vIdx + 1] = y;
        pos[vIdx + 2] = (isFront ? 1 : -0.85) * arc * depth + fold;
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const a = r * (nCols + 1) + c;
        const b = (r + 1) * (nCols + 1) + c;
        const d = (r + 1) * (nCols + 1) + (c + 1);
        const e = r * (nCols + 1) + (c + 1);
        if (isFront) {
          indices.push(a, b, d, a, d, e);
        } else {
          indices.push(a, d, b, a, e, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const frontBody = createBody(true);
  const backBody = createBody(false);
  geometriesToDispose.push(frontBody, backBody);

  root.add(new THREE.Mesh(frontBody, clothMat));
  root.add(new THREE.Mesh(backBody, clothMat));

  deformableMeshes.push(
    { geometry: frontBody, origPositions: new Float32Array(frontBody.attributes.position.array), motionProfile: 'torso' },
    { geometry: backBody, origPositions: new Float32Array(backBody.attributes.position.array), motionProfile: 'torso' }
  );

  // Massive ceremonial wide sleeves (tay thụng / tay tấc buông rộng qua tay)
  const createCeremonialWideSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nLen = 22;
    const nRad = 20;

    const shoulderX = sign * 0.46;
    const shoulderY = 0.76;
    const cuffX = sign * 1.32;
    const cuffY = -0.12; // hangs very low

    const pos = new Float32Array((nLen + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let i = 0; i <= nLen; i++) {
      const t = i / nLen;
      const cx = shoulderX + t * (cuffX - shoulderX);
      const cy = shoulderY + t * (cuffY - shoulderY);

      // Wide sleeve profile - very deep vertical hanging fabric at cuff (up to 0.48 height)
      const halfH = 0.20 * (1 - t) + 0.48 * t;
      const halfZ = 0.12 * (1 - t) + 0.08 * t;
      const droop = Math.sin(t * Math.PI * 0.85) * 0.06;

      for (let j = 0; j <= nRad; j++) {
        const phi = (j / nRad) * Math.PI * 2;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);

        pos[vIdx] = cx;
        pos[vIdx + 1] = cy + cosP * halfH - droop;
        pos[vIdx + 2] = sinP * halfZ;
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let i = 0; i < nLen; i++) {
      for (let j = 0; j < nRad; j++) {
        const i0 = i * (nRad + 1) + j;
        const i1 = (i + 1) * (nRad + 1) + j;
        const i2 = (i + 1) * (nRad + 1) + (j + 1);
        const i3 = i * (nRad + 1) + (j + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftWide = createCeremonialWideSleeve(true);
  const rightWide = createCeremonialWideSleeve(false);
  geometriesToDispose.push(leftWide, rightWide);

  root.add(new THREE.Mesh(leftWide, clothMat));
  root.add(new THREE.Mesh(rightWide, clothMat));

  deformableMeshes.push(
    { geometry: leftWide, origPositions: new Float32Array(leftWide.attributes.position.array), motionProfile: 'sleeves-wide' },
    { geometry: rightWide, origPositions: new Float32Array(rightWide.attributes.position.array), motionProfile: 'sleeves-wide' }
  );

  // Standing collar
  const collarGeo = new THREE.CylinderGeometry(0.125, 0.135, 0.14, 22, 1, true);
  collarGeo.scale(1, 1, 0.82);
  geometriesToDispose.push(collarGeo);
  const collarMesh = new THREE.Mesh(collarGeo, clothMat);
  collarMesh.position.set(0, 1.20, 0.02);
  root.add(collarMesh);

  // 5 buttons along right lapel
  const btnGeo = new THREE.SphereGeometry(0.020, 12, 12);
  geometriesToDispose.push(btnGeo);
  [[0.06, 1.22, 0.10], [0.14, 1.10, 0.11], [0.22, 0.94, 0.115], [0.29, 0.74, 0.11]].forEach(([bx, by, bz]) => {
    const b = new THREE.Mesh(btnGeo, btnMat);
    b.position.set(bx, by, bz);
    root.add(b);
  });

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
      btnMat.dispose();
    }
  };
}

// =============================================================================
// 3. Áo Nhật Bình (Rectangular-collar royal court robe)
// Visual hallmarks:
// - Prominent wide rectangular chest collar yoke (bản nẹp cổ chữ nhật)
// - Center front parallel opening (đối khâm)
// - Imperial jade brooch clasp (ngọc bội kết nơ) fastening the chest
// - Cuffs with layered ceremonial bands (viền ngũ sắc)
// - Twin decorative ribbon streamers (dải kết) cascading down
// =============================================================================
export function buildAoNhatBinh(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const jadeMat = createJadeBroochMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const shadow = createGroundShadowMesh();
  root.add(shadow);

  const nRows = 36;
  const nCols = 24;

  const createBody = (isFront: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((nRows + 1) * (nCols + 1) * 3);
    let vIdx = 0;

    for (let r = 0; r <= nRows; r++) {
      const t = r / nRows;
      const y = -1.25 + t * 2.38;
      const hw = 0.52 * (1 - t * 0.44) + 0.16 * t;
      const depth = 0.082 + t * 0.045;

      for (let c = 0; c <= nCols; c++) {
        const u = c / nCols;
        const x = -hw + u * 2 * hw;
        const normX = hw > 0.001 ? x / hw : 0;
        const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
        const slitCrease = (isFront && Math.abs(x) < 0.02) ? -0.012 : 0;

        pos[vIdx] = x;
        pos[vIdx + 1] = y;
        pos[vIdx + 2] = (isFront ? 1 : -0.85) * arc * depth + slitCrease;
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const a = r * (nCols + 1) + c;
        const b = (r + 1) * (nCols + 1) + c;
        const d = (r + 1) * (nCols + 1) + (c + 1);
        const e = r * (nCols + 1) + (c + 1);
        if (isFront) {
          indices.push(a, b, d, a, d, e);
        } else {
          indices.push(a, d, b, a, e, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const frontBody = createBody(true);
  const backBody = createBody(false);
  geometriesToDispose.push(frontBody, backBody);

  root.add(new THREE.Mesh(frontBody, clothMat));
  root.add(new THREE.Mesh(backBody, clothMat));

  deformableMeshes.push(
    { geometry: frontBody, origPositions: new Float32Array(frontBody.attributes.position.array), motionProfile: 'torso' },
    { geometry: backBody, origPositions: new Float32Array(backBody.attributes.position.array), motionProfile: 'torso' }
  );

  // Grand rectangular collar yoke (bản nẹp cổ chữ nhật Nhật Bình)
  const yokeLeft = new THREE.BoxGeometry(0.085, 0.72, 0.022);
  const yokeRight = new THREE.BoxGeometry(0.085, 0.72, 0.022);
  const yokeTop = new THREE.BoxGeometry(0.36, 0.085, 0.022);
  geometriesToDispose.push(yokeLeft, yokeRight, yokeTop);

  const mYokeL = new THREE.Mesh(yokeLeft, clothMat);
  mYokeL.position.set(-0.10, 0.78, 0.105);
  const mYokeR = new THREE.Mesh(yokeRight, clothMat);
  mYokeR.position.set(0.10, 0.78, 0.105);
  const mYokeT = new THREE.Mesh(yokeTop, clothMat);
  mYokeT.position.set(0, 1.14, 0.095);

  root.add(mYokeL, mYokeR, mYokeT);

  // Carved Jade Brooch / Buckle (ngọc bội kết nơ giữa ngực)
  const broochGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.022, 16);
  broochGeo.rotateX(Math.PI * 0.5);
  geometriesToDispose.push(broochGeo);
  const broochMesh = new THREE.Mesh(broochGeo, jadeMat);
  broochMesh.position.set(0, 0.76, 0.125);
  root.add(broochMesh);

  // Twin hanging ribbons (dải kết)
  const createRibbon = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nR = 24;
    const pos = new Float32Array((nR + 1) * 2 * 3);
    let vIdx = 0;

    for (let i = 0; i <= nR; i++) {
      const t = i / nR;
      const y = 0.74 - t * 1.50;
      const x = sign * (0.04 + t * 0.08) + Math.sin(t * Math.PI * 3) * 0.015;
      const w = 0.030;
      const z = 0.13 + t * 0.02;

      pos[vIdx] = x - w;
      pos[vIdx + 1] = y;
      pos[vIdx + 2] = z;

      pos[vIdx + 3] = x + w;
      pos[vIdx + 4] = y;
      pos[vIdx + 5] = z;
      vIdx += 6;
    }

    const ind: number[] = [];
    for (let i = 0; i < nR; i++) {
      const a = i * 2;
      const b = (i + 1) * 2;
      const c = (i + 1) * 2 + 1;
      const d = i * 2 + 1;
      ind.push(a, b, c, a, c, d);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(ind);
    geo.computeVertexNormals();
    return geo;
  };

  const leftRibbon = createRibbon(true);
  const rightRibbon = createRibbon(false);
  geometriesToDispose.push(leftRibbon, rightRibbon);

  root.add(new THREE.Mesh(leftRibbon, clothMat));
  root.add(new THREE.Mesh(rightRibbon, clothMat));

  deformableMeshes.push(
    { geometry: leftRibbon, origPositions: new Float32Array(leftRibbon.attributes.position.array), motionProfile: 'ribbon' },
    { geometry: rightRibbon, origPositions: new Float32Array(rightRibbon.attributes.position.array), motionProfile: 'ribbon' }
  );

  // Sleeves with cuffs
  const createSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 18;
    const nRad = 16;
    const startX = sign * 0.44;
    const startY = 0.76;
    const endX = sign * 1.15;
    const endY = 0.08;

    const dirX = endX - startX;
    const dirY = endY - startY;
    const len = Math.hypot(dirX, dirY);
    const perpX = -dirY / (len || 1);
    const perpY = dirX / (len || 1);

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * dirX;
      const cy = startY + t * dirY;
      const r = 0.20 * (1 - t) + 0.17 * t;
      const droop = Math.sin(t * Math.PI) * 0.025;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * perpX;
        pos[vIdx + 1] = cy + Math.cos(phi) * r * perpY - droop;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.85);
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSlv = createSleeve(true);
  const rightSlv = createSleeve(false);
  geometriesToDispose.push(leftSlv, rightSlv);

  root.add(new THREE.Mesh(leftSlv, clothMat));
  root.add(new THREE.Mesh(rightSlv, clothMat));

  deformableMeshes.push(
    { geometry: leftSlv, origPositions: new Float32Array(leftSlv.attributes.position.array), motionProfile: 'sleeves-fitted' },
    { geometry: rightSlv, origPositions: new Float32Array(rightSlv.attributes.position.array), motionProfile: 'sleeves-fitted' }
  );

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
      jadeMat.dispose();
    }
  };
}

// =============================================================================
// 4. Áo yếm (Standalone silk under-bodice panel)
// STRICT REQUIREMENTS:
// - Standalone breast under-bodice: small, thin, curved silk fabric plate (tấm vải ngực nhỏ gọn, mỏng)
// - Shallow chest swell conforming to bust, soft concave scooped neck curve, gently tapered flat base
// - Zero rigid kite/diamond polygon, zero elongated tear drop, zero sleeves or long tunic
// - Extremely delicate silk tie cords (cổ & lưng rất mảnh), pure monochromatic ivory #FCFAF6
// =============================================================================
export function buildAoYem(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  // Ground shadow matching compact under-bodice footprint
  const shadowGeo = new THREE.PlaneGeometry(0.70, 0.35);
  shadowGeo.rotateX(-Math.PI * 0.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: clothMat.bumpMap,
    transparent: true,
    opacity: 0.30,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = -0.38;
  root.add(shadowMesh);
  geometriesToDispose.push(shadowGeo);

  // Breastplate fabric sheet (tấm yếm lụa):
  // Compact proportions: spans from top chest Y = 0.25 down to upper abdomen Y = -0.22 (height = 0.47)
  // Width profile:
  // - Top neck (v = 0): gentle concave scoop, width = 0.24 (hw = 0.12)
  // - Mid bust (v ~ 0.35 - 0.45): curves softly outward to width = 0.44 (hw = 0.22)
  // - Lower hem (v = 1.0): gently tapers to a short horizontal bottom hem, width = 0.26 (hw = 0.13)
  // Result: authentic curved trapezoid / soft shield breast cover, NOT a diamond or pointed droplet!
  const nGridU = 32;
  const nGridV = 28;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array((nGridV + 1) * (nGridU + 1) * 3);
  let vIdx = 0;

  for (let r = 0; r <= nGridV; r++) {
    const v = r / nGridV; // 0: scooped collar at top -> 1: bottom hem
    const y = 0.25 - v * 0.47;

    let hw = 0;
    if (v < 0.40) {
      const s = v / 0.40;
      // Gentle curve outward from collar (0.12) to underarm bust (0.22)
      hw = 0.12 + 0.10 * Math.sin(s * Math.PI * 0.5);
    } else {
      const s = (v - 0.40) / 0.60;
      // Gentle inward taper to flat bottom hem (0.13)
      hw = 0.22 - 0.09 * (s * s);
    }

    // Soft scooped neckline dip at top collar
    const neckDip = v < 0.25 ? (1 - v / 0.25) * 0.038 : 0;

    for (let c = 0; c <= nGridU; c++) {
      const u = c / nGridU;
      const x = -hw + u * 2 * hw;
      const normX = hw > 0.001 ? Math.abs(x) / hw : 0;

      // Shallow natural drape over chest (shallow swell: 0.032m max, thin silk plate)
      const arc = Math.cos(Math.max(-1, Math.min(1, x / (hw || 1))) * (Math.PI * 0.45));
      const bustSwell = Math.sin(v * Math.PI * 0.85) * 0.032;
      const ripple = Math.sin(u * Math.PI * 6) * 0.003 * Math.sin(v * Math.PI);

      const z = arc * (0.02 + bustSwell) + ripple;

      pos[vIdx] = x;
      pos[vIdx + 1] = y - neckDip * (1 - normX * normX * 0.7);
      pos[vIdx + 2] = z;
      vIdx += 3;
    }
  }

  const indices: number[] = [];
  for (let r = 0; r < nGridV; r++) {
    for (let c = 0; c < nGridU; c++) {
      const a = r * (nGridU + 1) + c;
      const b = (r + 1) * (nGridU + 1) + c;
      const d = (r + 1) * (nGridU + 1) + (c + 1);
      const e = r * (nGridU + 1) + (c + 1);
      indices.push(a, b, d, a, d, e);
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geometriesToDispose.push(geo);

  root.add(new THREE.Mesh(geo, clothMat));
  deformableMeshes.push({
    geometry: geo,
    origPositions: new Float32Array(geo.attributes.position.array),
    motionProfile: 'bodice'
  });

  // Delicate top collar hem piping (cổ xây tròn yếm đào viền may rất mảnh)
  const collarBandCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 0.25, 0.024),
    new THREE.Vector3(-0.06, 0.225, 0.035),
    new THREE.Vector3(0, 0.218, 0.038),
    new THREE.Vector3(0.06, 0.225, 0.035),
    new THREE.Vector3(0.12, 0.25, 0.024),
  ]);
  const collarBandGeo = new THREE.TubeGeometry(collarBandCurve, 20, 0.0035, 6, false);
  geometriesToDispose.push(collarBandGeo);
  root.add(new THREE.Mesh(collarBandGeo, clothMat));

  // Extremely delicate Neck Tie Cords (dây cổ lụa mảnh mai vắt lên)
  const neckTieL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.12, 0.25, 0.024),
    new THREE.Vector3(-0.11, 0.35, 0.01),
    new THREE.Vector3(-0.08, 0.44, -0.03),
  ]);
  const neckTieR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 0.25, 0.024),
    new THREE.Vector3(0.11, 0.35, 0.01),
    new THREE.Vector3(0.08, 0.44, -0.03),
  ]);
  const strapGeoL = new THREE.TubeGeometry(neckTieL, 14, 0.0024, 6, false);
  const strapGeoR = new THREE.TubeGeometry(neckTieR, 14, 0.0024, 6, false);
  geometriesToDispose.push(strapGeoL, strapGeoR);
  root.add(new THREE.Mesh(strapGeoL, clothMat));
  root.add(new THREE.Mesh(strapGeoR, clothMat));

  // Extremely delicate Side Back-Tie Cords (dây lưng mảnh quấn ra sau eo)
  const sideTieL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.22, 0.06, 0.03),
    new THREE.Vector3(-0.24, 0.01, -0.02),
    new THREE.Vector3(-0.20, -0.06, -0.06),
  ]);
  const sideTieR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.22, 0.06, 0.03),
    new THREE.Vector3(0.24, 0.01, -0.02),
    new THREE.Vector3(0.20, -0.06, -0.06),
  ]);
  const sideGeoL = new THREE.TubeGeometry(sideTieL, 14, 0.0024, 6, false);
  const sideGeoR = new THREE.TubeGeometry(sideTieR, 14, 0.0024, 6, false);
  geometriesToDispose.push(sideGeoL, sideGeoR);
  root.add(new THREE.Mesh(sideGeoL, clothMat));
  root.add(new THREE.Mesh(sideGeoR, clothMat));

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
      shadowMat.dispose();
    }
  };
}

// =============================================================================
// 5. Áo tứ thân (Four-panel robe with tied front flaps)
// STRICT REQUIREMENTS:
// - Four-panel construction: 2 back panels joined at spine (sống lưng);
//   2 SEPARATE FRONT PANELS OPEN (vạt tả, vạt hữu hoàn toàn mở phía trước)
// - Front chest has a CLEAR OPEN NEGATIVE SPACE CORRIDOR revealing the inner ivory yếm
// - Two front flaps meet lightly at waist, then CASCADE DOWN AS TWO SEPARATE FLOWING TAILS
// - NO solid front tunic, NO pink/cinnabar inner yem (all unified ivory #FCFAF6),
// - NO dark skirt (váy thâm), NO rigid sphere knot or clunky tubular cords
// =============================================================================
export function buildAoTuThan(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const shadow = createGroundShadowMesh();
  root.add(shadow);

  // 1. Recessed Back Panel (2 vạt sau may liền sống lưng, lùi sâu về sau)
  const nRows = 36;
  const nCols = 22;
  const backGeo = new THREE.BufferGeometry();
  const posBack = new Float32Array((nRows + 1) * (nCols + 1) * 3);
  let vIdx = 0;

  for (let r = 0; r <= nRows; r++) {
    const t = r / nRows; // 0: hem y = -1.25 -> 1: shoulder y = 1.15
    const y = -1.25 + t * 2.40;
    const hw = 0.50 * (1 - t * 0.44) + 0.16 * t;

    for (let c = 0; c <= nCols; c++) {
      const u = c / nCols;
      const x = -hw + u * 2 * hw;
      const normX = hw > 0.001 ? x / hw : 0;
      const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
      const seamCrease = Math.abs(x) < 0.025 ? -0.012 * (1 - Math.abs(x) / 0.025) : 0;

      posBack[vIdx] = x;
      posBack[vIdx + 1] = y;
      posBack[vIdx + 2] = -0.12 - arc * 0.05 + seamCrease;
      vIdx += 3;
    }
  }

  const indicesB: number[] = [];
  for (let r = 0; r < nRows; r++) {
    for (let c = 0; c < nCols; c++) {
      const a = r * (nCols + 1) + c;
      const b = (r + 1) * (nCols + 1) + c;
      const d = (r + 1) * (nCols + 1) + (c + 1);
      const e = r * (nCols + 1) + (c + 1);
      indicesB.push(a, d, b, a, e, d);
    }
  }
  backGeo.setAttribute('position', new THREE.BufferAttribute(posBack, 3));
  backGeo.setIndex(indicesB);
  backGeo.computeVertexNormals();
  geometriesToDispose.push(backGeo);
  root.add(new THREE.Mesh(backGeo, clothMat));
  deformableMeshes.push({
    geometry: backGeo,
    origPositions: new Float32Array(backGeo.attributes.position.array),
    motionProfile: 'torso'
  });

  // 2. Inner Yếm Bodice Panel (Tấm yếm lót trong ngực, thuần lụa ngà #FCFAF6)
  // Visible inside the chest opening between the two open front flaps
  const innerBodiceGeo = new THREE.BufferGeometry();
  const nInner = 22;
  const innerPos = new Float32Array((nInner + 1) * 2 * 3);
  let inIdx = 0;
  for (let i = 0; i <= nInner; i++) {
    const u = i / nInner;
    const x = -0.16 + u * 0.32;
    // Scooped upper neckline
    const yTop = 0.86 - Math.abs(x) * 0.28;
    const yBot = 0.16;
    innerPos[inIdx] = x;
    innerPos[inIdx + 1] = yTop;
    innerPos[inIdx + 2] = 0.020 + Math.cos((u - 0.5) * Math.PI) * 0.025;
    innerPos[inIdx + 3] = x;
    innerPos[inIdx + 4] = yBot;
    innerPos[inIdx + 5] = 0.035;
    inIdx += 6;
  }
  const inIndices: number[] = [];
  for (let i = 0; i < nInner; i++) {
    const a = i * 2;
    const b = (i + 1) * 2;
    const c = (i + 1) * 2 + 1;
    const d = i * 2 + 1;
    inIndices.push(a, b, c, a, c, d);
  }
  innerBodiceGeo.setAttribute('position', new THREE.BufferAttribute(innerPos, 3));
  innerBodiceGeo.setIndex(inIndices);
  innerBodiceGeo.computeVertexNormals();
  geometriesToDispose.push(innerBodiceGeo);
  root.add(new THREE.Mesh(innerBodiceGeo, clothMat));

  // Yếm neck cord (dây yếm cổ mảnh mai)
  const yemCordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0.86, 0.02),
    new THREE.Vector3(0, 0.82, 0.032),
    new THREE.Vector3(0.14, 0.86, 0.02),
  ]);
  const yemCordGeo = new THREE.TubeGeometry(yemCordCurve, 16, 0.0035, 6, false);
  geometriesToDispose.push(yemCordGeo);
  root.add(new THREE.Mesh(yemCordGeo, clothMat));

  // 3. Hai Vạt Trước Riêng Biệt (MỞ RỘNG TOÀN BỘ NGỰC, TÁCH RỜI HAI BÊN TẠI EO VÀ GẤU)
  const createTiedFrontFlap = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nR = 36;
    const nC = 12;
    const pos = new Float32Array((nR + 1) * (nC + 1) * 3);
    let idx = 0;

    for (let r = 0; r <= nR; r++) {
      const t = r / nR; // 0: hem at bottom (y=-1.22) -> 1: shoulder (y=1.15)
      const y = -1.22 + t * 2.37;

      let innerX = 0;
      let outerX = 0;

      if (t > 0.45) {
        // UPPER CHEST: CLEAR OPEN NEGATIVE SPACE CORRIDOR!
        // Inner edge stays away at x = ±0.14 to ±0.20, leaving the chest completely open to show the inner yếm!
        const chestFactor = (t - 0.45) / 0.55;
        innerX = sign * (0.04 + chestFactor * 0.12);
        outerX = sign * (0.33 + chestFactor * 0.11);
      } else if (t > 0.38) {
        // WAIST REGION: The two front flaps drape together naturally at the waist
        const waistFactor = (0.45 - t) / 0.07;
        innerX = sign * (0.04 * (1 - waistFactor) + 0.02 * waistFactor);
        outerX = sign * (0.33 * (1 - waistFactor) + 0.18 * waistFactor);
      } else {
        // BELOW WAIST: TWO SEPARATE CASCADING FLAPS (hai dải vạt buông rủ tách đôi!)
        // Diverging outward leaving an open corridor showing through to the back panel
        const tailFactor = (0.38 - t) / 0.38;
        innerX = sign * (0.05 + tailFactor * 0.14);
        outerX = innerX + sign * (0.17 * (1 - tailFactor * 0.15));
      }

      for (let c = 0; c <= nC; c++) {
        const u = c / nC;
        const x = innerX + u * (outerX - innerX);
        const z = 0.075 + Math.sin(t * Math.PI) * 0.03 + Math.sin(u * Math.PI) * 0.012;

        pos[idx] = x;
        pos[idx + 1] = y;
        pos[idx + 2] = z;
        idx += 3;
      }
    }

    const ind: number[] = [];
    for (let r = 0; r < nR; r++) {
      for (let c = 0; c < nC; c++) {
        const a = r * (nC + 1) + c;
        const b = (r + 1) * (nC + 1) + c;
        const d = (r + 1) * (nC + 1) + (c + 1);
        const e = r * (nC + 1) + (c + 1);
        if (isLeft) {
          ind.push(a, b, d, a, d, e);
        } else {
          ind.push(a, d, b, a, e, d);
        }
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(ind);
    geo.computeVertexNormals();
    return geo;
  };

  const leftFlap = createTiedFrontFlap(true);
  const rightFlap = createTiedFrontFlap(false);
  geometriesToDispose.push(leftFlap, rightFlap);
  root.add(new THREE.Mesh(leftFlap, clothMat));
  root.add(new THREE.Mesh(rightFlap, clothMat));

  deformableMeshes.push(
    { geometry: leftFlap, origPositions: new Float32Array(leftFlap.attributes.position.array), motionProfile: 'skirt-split' },
    { geometry: rightFlap, origPositions: new Float32Array(rightFlap.attributes.position.array), motionProfile: 'skirt-split' }
  );

  // Soft draped waist fold (vạt vải vắt chéo mềm mại ngang thắt lưng - KHÔNG dùng khối cầu hay dây cứng)
  const waistFoldGeo = new THREE.CylinderGeometry(0.028, 0.024, 0.14, 16);
  waistFoldGeo.rotateZ(Math.PI * 0.5);
  waistFoldGeo.scale(1.2, 0.5, 0.8);
  waistFoldGeo.translate(0, 0.12, 0.095);
  geometriesToDispose.push(waistFoldGeo);
  root.add(new THREE.Mesh(waistFoldGeo, clothMat));

  // 4. Everyday Fitted Peasant Sleeves (Tay chẽn gọn gàng)
  const createPeasantSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 16;
    const nRad = 16;
    const startX = sign * 0.42;
    const startY = 0.76;
    const endX = sign * 1.08;
    const endY = 0.08;

    const dirX = endX - startX;
    const dirY = endY - startY;
    const len = Math.hypot(dirX, dirY);
    const perpX = -dirY / (len || 1);
    const perpY = dirX / (len || 1);

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * dirX;
      const cy = startY + t * dirY;
      const r = 0.17 * (1 - t) + 0.12 * t;
      const sag = Math.sin(t * Math.PI) * 0.018;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * perpX;
        pos[vIdx + 1] = cy + Math.cos(phi) * r * perpY - sag;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.82);
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSlv = createPeasantSleeve(true);
  const rightSlv = createPeasantSleeve(false);
  geometriesToDispose.push(leftSlv, rightSlv);

  root.add(new THREE.Mesh(leftSlv, clothMat));
  root.add(new THREE.Mesh(rightSlv, clothMat));

  deformableMeshes.push(
    { geometry: leftSlv, origPositions: new Float32Array(leftSlv.attributes.position.array), motionProfile: 'sleeves-fitted' },
    { geometry: rightSlv, origPositions: new Float32Array(rightSlv.attributes.position.array), motionProfile: 'sleeves-fitted' }
  );

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
    }
  };
}

// =============================================================================
// 6. Áo giao lĩnh (Cross-collar robe with wide sleeves and waist sash)
// STRICT REQUIREMENTS:
// - Authentic cross-collar construction (giao lĩnh): TWO REAL OVERLAPPING FABRIC PANELS across chest
// - Inner flap runs diagonally from right shoulder across chest under the left flap
// - Outer flap sweeps from left shoulder completely overlapping across the chest to right hip
// - Closed flowing lower body panels (thân dưới là các mặt vải rủ tự nhiên kín, phẳng có nếp)
// - Flat silk collar hem bands along the lapel edges (KHÔNG dùng ống tube tròn to vẽ thành X)
// - Seamless shoulder-to-sleeve transition into wide ceremonial drooping cuffs (tay thụng nối mềm với vai)
// - Smooth flat waist sash, NO bow or waist knot like tứ thân, unified ivory #FCFAF6
// =============================================================================
export function buildAoGiaoLinh(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const shadow = createGroundShadowMesh();
  root.add(shadow);

  const nR = 36;
  const nC = 24;

  // 1. Draped Lower Back Robe Panel (Thân sau buông rủ kín từ eo xuống gấu)
  const backSkirtGeo = new THREE.BufferGeometry();
  const posBS = new Float32Array((nR + 1) * (nC + 1) * 3);
  let bsIdx = 0;

  for (let r = 0; r <= nR; r++) {
    const t = r / nR; // 0: hem y = -1.25 -> 1: waist y = 0.16
    const y = -1.25 + t * 1.41;
    // Widens gracefully toward hem (0.58) tapering to waist (0.35)
    const hw = 0.58 * (1 - t * 0.40) + 0.12 * t;

    for (let c = 0; c <= nC; c++) {
      const u = c / nC;
      const x = -hw + u * 2 * hw;
      const normX = hw > 0.001 ? x / hw : 0;
      const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
      const fold = Math.sin(u * Math.PI * 5) * 0.014 * (1 - t);

      posBS[bsIdx] = x;
      posBS[bsIdx + 1] = y;
      posBS[bsIdx + 2] = -0.11 - arc * 0.06 + fold;
      bsIdx += 3;
    }
  }

  const indBS: number[] = [];
  for (let r = 0; r < nR; r++) {
    for (let c = 0; c < nC; c++) {
      const a = r * (nC + 1) + c;
      const b = (r + 1) * (nC + 1) + c;
      const d = (r + 1) * (nC + 1) + (c + 1);
      const e = r * (nC + 1) + (c + 1);
      indBS.push(a, d, b, a, e, d);
    }
  }
  backSkirtGeo.setAttribute('position', new THREE.BufferAttribute(posBS, 3));
  backSkirtGeo.setIndex(indBS);
  backSkirtGeo.computeVertexNormals();
  geometriesToDispose.push(backSkirtGeo);
  root.add(new THREE.Mesh(backSkirtGeo, clothMat));
  deformableMeshes.push({
    geometry: backSkirtGeo,
    origPositions: new Float32Array(backSkirtGeo.attributes.position.array),
    motionProfile: 'torso'
  });

  // 2. Draped Lower Front Robe Panel (Thân trước kín buông rủ phẳng liền mạch từ eo xuống gấu)
  const frontSkirtGeo = new THREE.BufferGeometry();
  const posFS = new Float32Array((nR + 1) * (nC + 1) * 3);
  let fsIdx = 0;

  for (let r = 0; r <= nR; r++) {
    const t = r / nR; // 0: hem y = -1.25 -> 1: waist y = 0.16
    const y = -1.25 + t * 1.41;
    const hw = 0.56 * (1 - t * 0.40) + 0.12 * t;

    for (let c = 0; c <= nC; c++) {
      const u = c / nC;
      const x = -hw + u * 2 * hw;
      const normX = hw > 0.001 ? x / hw : 0;
      const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));
      const fold = Math.sin(u * Math.PI * 5) * 0.015 * (1 - t);

      posFS[fsIdx] = x;
      posFS[fsIdx + 1] = y;
      posFS[fsIdx + 2] = 0.085 + arc * 0.045 + fold;
      fsIdx += 3;
    }
  }

  const indFS: number[] = [];
  for (let r = 0; r < nR; r++) {
    for (let c = 0; c < nC; c++) {
      const a = r * (nC + 1) + c;
      const b = (r + 1) * (nC + 1) + c;
      const d = (r + 1) * (nC + 1) + (c + 1);
      const e = r * (nC + 1) + (c + 1);
      indFS.push(a, b, d, a, d, e);
    }
  }
  frontSkirtGeo.setAttribute('position', new THREE.BufferAttribute(posFS, 3));
  frontSkirtGeo.setIndex(indFS);
  frontSkirtGeo.computeVertexNormals();
  geometriesToDispose.push(frontSkirtGeo);
  root.add(new THREE.Mesh(frontSkirtGeo, clothMat));
  deformableMeshes.push({
    geometry: frontSkirtGeo,
    origPositions: new Float32Array(frontSkirtGeo.attributes.position.array),
    motionProfile: 'torso'
  });

  // 3. Upper Back Torso (Thân sau phía trên eo lên vai)
  const nBkR = 20;
  const nBkC = 20;
  const backGeo = new THREE.BufferGeometry();
  const posBk = new Float32Array((nBkR + 1) * (nBkC + 1) * 3);
  let bkIdx = 0;

  for (let r = 0; r <= nBkR; r++) {
    const t = r / nBkR; // 0: waist y=0.16 -> 1: shoulders y=1.15
    const y = 0.16 + t * 0.99;
    const hw = 0.35 * (1 - t * 0.50) + 0.16 * t;

    for (let c = 0; c <= nBkC; c++) {
      const u = c / nBkC;
      const x = -hw + u * 2 * hw;
      const normX = hw > 0.001 ? x / hw : 0;
      const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));

      posBk[bkIdx] = x;
      posBk[bkIdx + 1] = y;
      posBk[bkIdx + 2] = -0.10 - arc * 0.05;
      bkIdx += 3;
    }
  }
  const indBk: number[] = [];
  for (let r = 0; r < nBkR; r++) {
    for (let c = 0; c < nBkC; c++) {
      const a = r * (nBkC + 1) + c;
      const b = (r + 1) * (nBkC + 1) + c;
      const d = (r + 1) * (nBkC + 1) + (c + 1);
      const e = r * (nBkC + 1) + (c + 1);
      indBk.push(a, b, d, a, d, e);
    }
  }
  backGeo.setAttribute('position', new THREE.BufferAttribute(posBk, 3));
  backGeo.setIndex(indBk);
  backGeo.computeVertexNormals();
  geometriesToDispose.push(backGeo);
  root.add(new THREE.Mesh(backGeo, clothMat));

  // 4. Right Inner Flap Panel (Vạt trong: tấm vải thực sự chạy từ vai phải chéo qua ngực sang sườn trái)
  const nFlapR = 24;
  const nFlapC = 16;
  const rFlapGeo = new THREE.BufferGeometry();
  const posRF = new Float32Array((nFlapR + 1) * (nFlapC + 1) * 3);
  let rfIdx = 0;

  for (let r = 0; r <= nFlapR; r++) {
    const t = r / nFlapR; // 0: waist y=0.16 -> 1: shoulder y=1.15
    const y = 0.16 + t * 0.99;
    // Outer side on right:
    const outerX = 0.35 * (1 - t * 0.50) + 0.16 * t;
    // Diagonal inner edge: sweeps from right collar (x=0.15 at top) across to left waist (x=-0.28 at bottom)
    const diagEdgeX = 0.15 * t + (-0.28) * (1 - t);

    for (let c = 0; c <= nFlapC; c++) {
      const u = c / nFlapC;
      const x = diagEdgeX + u * (outerX - diagEdgeX);
      posRF[rfIdx] = x;
      posRF[rfIdx + 1] = y;
      posRF[rfIdx + 2] = 0.055 + Math.sin(u * Math.PI) * 0.02; // Inner layer z
      rfIdx += 3;
    }
  }
  const indRF: number[] = [];
  for (let r = 0; r < nFlapR; r++) {
    for (let c = 0; c < nFlapC; c++) {
      const a = r * (nFlapC + 1) + c;
      const b = (r + 1) * (nFlapC + 1) + c;
      const d = (r + 1) * (nFlapC + 1) + (c + 1);
      const e = r * (nFlapC + 1) + (c + 1);
      indRF.push(a, b, d, a, d, e);
    }
  }
  rFlapGeo.setAttribute('position', new THREE.BufferAttribute(posRF, 3));
  rFlapGeo.setIndex(indRF);
  rFlapGeo.computeVertexNormals();
  geometriesToDispose.push(rFlapGeo);
  root.add(new THREE.Mesh(rFlapGeo, clothMat));

  // 5. Left Outer Flap Panel (Vạt ngoài: tấm vải thực sự sweep từ vai trái ĐÈ HOÀN TOÀN LÊN vạt trong)
  const lFlapGeo = new THREE.BufferGeometry();
  const posLF = new Float32Array((nFlapR + 1) * (nFlapC + 1) * 3);
  let lfIdx = 0;

  for (let r = 0; r <= nFlapR; r++) {
    const t = r / nFlapR; // 0: waist y=0.16 -> 1: shoulder y=1.15
    const y = 0.16 + t * 0.99;
    // Outer side on left:
    const outerX = -(0.35 * (1 - t * 0.50) + 0.16 * t);
    // Overlapping diagonal edge: sweeps from left collar (x=-0.15 at top) across center to right waist (x=+0.32 at bottom)
    const diagEdgeX = -0.15 * t + 0.32 * (1 - t);

    for (let c = 0; c <= nFlapC; c++) {
      const u = c / nFlapC;
      const x = outerX + u * (diagEdgeX - outerX);
      posLF[lfIdx] = x;
      posLF[lfIdx + 1] = y;
      // Raised outer layer z (0.095) so it visibly sits in front of the inner flap (0.055) and casts real shadow!
      posLF[lfIdx + 2] = 0.095 + Math.sin(u * Math.PI) * 0.02;
      lfIdx += 3;
    }
  }
  const indLF: number[] = [];
  for (let r = 0; r < nFlapR; r++) {
    for (let c = 0; c < nFlapC; c++) {
      const a = r * (nFlapC + 1) + c;
      const b = (r + 1) * (nFlapC + 1) + c;
      const d = (r + 1) * (nFlapC + 1) + (c + 1);
      const e = r * (nFlapC + 1) + (c + 1);
      indLF.push(a, b, d, a, d, e);
    }
  }
  lFlapGeo.setAttribute('position', new THREE.BufferAttribute(posLF, 3));
  lFlapGeo.setIndex(indLF);
  lFlapGeo.computeVertexNormals();
  geometriesToDispose.push(lFlapGeo);
  root.add(new THREE.Mesh(lFlapGeo, clothMat));
  deformableMeshes.push({
    geometry: lFlapGeo,
    origPositions: new Float32Array(lFlapGeo.attributes.position.array),
    motionProfile: 'torso'
  });

  // 6. Flat Silk Collar Hem Band along the Outer Lapel Edge (nẹp viền cổ vạt chéo phẳng, mềm mại)
  const outerCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 1.15, 0.096),
    new THREE.Vector3(0.02, 0.70, 0.105),
    new THREE.Vector3(0.32, 0.16, 0.100),
  ]);
  const outerCollarGeo = new THREE.TubeGeometry(outerCollarCurve, 24, 0.007, 6, false);
  geometriesToDispose.push(outerCollarGeo);
  root.add(new THREE.Mesh(outerCollarGeo, clothMat));

  // Inner lapel edge rim showing at the right neck:
  const innerCollarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.15, 1.15, 0.060),
    new THREE.Vector3(0.04, 0.82, 0.065),
    new THREE.Vector3(-0.06, 0.55, 0.062),
  ]);
  const innerCollarGeo = new THREE.TubeGeometry(innerCollarCurve, 18, 0.006, 6, false);
  geometriesToDispose.push(innerCollarGeo);
  root.add(new THREE.Mesh(innerCollarGeo, clothMat));

  // 7. Smooth Flat Silk Waist Sash (Đai lưng lụa phẳng giữ vạt giao chéo gọn gàng)
  const sashGeo = new THREE.CylinderGeometry(0.35, 0.36, 0.11, 28, 1, true);
  sashGeo.scale(1, 1, 0.32);
  sashGeo.translate(0, 0.16, 0.06);
  geometriesToDispose.push(sashGeo);
  root.add(new THREE.Mesh(sashGeo, clothMat));

  // 8. Wide Ceremonial Drooping Sleeves (Tay thụng rộng lớn buông rủ sâu, nối mềm với vai)
  const createCeremonialSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 20;
    const nRad = 18;
    // Connects seamlessly at shoulder line (x = ±0.40, y = 0.82)
    const startX = sign * 0.40;
    const startY = 0.82;
    // Sweeps out and hangs low at wrist cuff (x = ±1.34, y = -0.06)
    const endX = sign * 1.34;
    const endY = -0.06;

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * (endX - startX);
      const cy = startY + t * (endY - startY);
      // Soft transition from fitted shoulder (0.19) to massive wide cuff (0.35)
      const r = 0.19 * (1 - t) + 0.35 * t;
      const sag = Math.sin(t * Math.PI) * 0.05;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * 0.60;
        pos[vIdx + 1] = cy + Math.cos(phi) * r - sag;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.60);
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSlv = createCeremonialSleeve(true);
  const rightSlv = createCeremonialSleeve(false);
  geometriesToDispose.push(leftSlv, rightSlv);
  root.add(new THREE.Mesh(leftSlv, clothMat));
  root.add(new THREE.Mesh(rightSlv, clothMat));
  deformableMeshes.push(
    { geometry: leftSlv, origPositions: new Float32Array(leftSlv.attributes.position.array), motionProfile: 'sleeves-wide' },
    { geometry: rightSlv, origPositions: new Float32Array(rightSlv.attributes.position.array), motionProfile: 'sleeves-wide' }
  );

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
    }
  };
}

// =============================================================================
// 7. Áo bà ba (Traditional Southern short blouse)
// STRICT REQUIREMENTS:
// - SHORT hip-length blouse (ends at hips y = -0.36, NOT down to knees or ankles)
// - Low round neckline (cổ tròn thấp)
// - Center front vertical button placket with 6 round buttons
// - Two lower patch pockets (hai túi đắp thấp) on left and right hem
// - Side hip slits (xẻ tà hai bên hông)
// - Raglan sleeves with subtle wrist taper
// =============================================================================
export function buildAoBaBa(): BuiltGarment3D {
  const root = new THREE.Group();
  const clothMat = createSilkMaterial();
  const btnMat = createButtonMaterial();
  const deformableMeshes: BuiltGarment3D['deformableMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  // Compact ground shadow matching short hip blouse
  const shadowGeo = new THREE.PlaneGeometry(1.10, 0.50);
  shadowGeo.rotateX(-Math.PI * 0.5);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: clothMat.bumpMap,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = -0.65;
  root.add(shadowMesh);
  geometriesToDispose.push(shadowGeo);

  const nRows = 26;
  const nCols = 20;

  // Short blouse profile from hem (t=0, y=-0.36) to shoulders (t=1, y=0.55)
  const getBaBaHalfWidth = (t: number): number => {
    if (t < 0.25) {
      // Gentle hip flare at hem with side slit
      const s = t / 0.25;
      return 0.38 * (1 - s) + 0.32 * s;
    } else if (t < 0.65) {
      // Natural waist indentation
      const s = (t - 0.25) / 0.40;
      return 0.32 * (1 - s) + 0.35 * s;
    } else {
      // Bust to shoulder
      const s = (t - 0.65) / 0.35;
      return 0.35 * (1 - s) + 0.33 * s;
    }
  };

  const createBaBaTorso = (isFront: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array((nRows + 1) * (nCols + 1) * 3);
    let vIdx = 0;

    for (let r = 0; r <= nRows; r++) {
      const t = r / nRows;
      // Short blouse height span: 0.55 down to -0.36 (total height 0.91)
      const y = -0.36 + t * 0.91;
      const hw = getBaBaHalfWidth(t);
      const depth = 0.080 + t * 0.035;

      // Center front slit crease
      const centerCrease = (isFront && Math.abs(t - 0.5) < 0.45) ? 0.008 : 0;

      for (let c = 0; c <= nCols; c++) {
        const u = c / nCols;
        const x = -hw + u * 2 * hw;
        const normX = hw > 0.001 ? x / hw : 0;
        const arc = Math.cos(Math.max(-1, Math.min(1, normX)) * (Math.PI * 0.5));

        // Soft natural silk ripples
        const wave = Math.sin(u * Math.PI * 4) * 0.008 * Math.sin(t * Math.PI);

        // Round neckline dip at top
        const neckScoop = (t > 0.85 && Math.abs(x) < 0.16)
          ? ((t - 0.85) / 0.15) * (1 - Math.abs(x) / 0.16) * 0.06
          : 0;

        pos[vIdx] = x;
        pos[vIdx + 1] = y - neckScoop;
        pos[vIdx + 2] = (isFront ? 1 : -0.85) * arc * depth + wave + centerCrease;
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < nCols; c++) {
        const a = r * (nCols + 1) + c;
        const b = (r + 1) * (nCols + 1) + c;
        const d = (r + 1) * (nCols + 1) + (c + 1);
        const e = r * (nCols + 1) + (c + 1);
        if (isFront) {
          indices.push(a, b, d, a, d, e);
        } else {
          indices.push(a, d, b, a, e, d);
        }
      }
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const frontBody = createBaBaTorso(true);
  const backBody = createBaBaTorso(false);
  geometriesToDispose.push(frontBody, backBody);

  root.add(new THREE.Mesh(frontBody, clothMat));
  root.add(new THREE.Mesh(backBody, clothMat));

  deformableMeshes.push(
    { geometry: frontBody, origPositions: new Float32Array(frontBody.attributes.position.array), motionProfile: 'torso' },
    { geometry: backBody, origPositions: new Float32Array(backBody.attributes.position.array), motionProfile: 'torso' }
  );

  // Low round collar binding rim (cổ tròn thấp viền nẹp)
  const collarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0.52, 0.04),
    new THREE.Vector3(0, 0.44, 0.095),
    new THREE.Vector3(0.14, 0.52, 0.04),
  ]);
  const collarGeo = new THREE.TubeGeometry(collarCurve, 20, 0.012, 6, false);
  geometriesToDispose.push(collarGeo);
  root.add(new THREE.Mesh(collarGeo, clothMat));

  // Front center placket with 6 round buttons
  const placketGeo = new THREE.BoxGeometry(0.024, 0.82, 0.012);
  geometriesToDispose.push(placketGeo);
  const placketMesh = new THREE.Mesh(placketGeo, clothMat);
  placketMesh.position.set(0, 0.06, 0.10);
  root.add(placketMesh);

  // 6 Pearl buttons evenly spaced
  const btnGeo = new THREE.SphereGeometry(0.014, 10, 10);
  geometriesToDispose.push(btnGeo);

  const buttonYs = [0.42, 0.28, 0.14, 0.0, -0.14, -0.28];
  buttonYs.forEach(by => {
    const b = new THREE.Mesh(btnGeo, btnMat);
    b.position.set(0, by, 0.112);
    root.add(b);
  });

  // Two Lower Patch Pockets (hai túi đắp thấp đặc trưng của Áo bà ba)
  const createPatchPocket = (isLeft: boolean): THREE.Mesh => {
    const pGeo = new THREE.BoxGeometry(0.11, 0.13, 0.012);
    geometriesToDispose.push(pGeo);
    const pMesh = new THREE.Mesh(pGeo, clothMat);
    const sign = isLeft ? -1 : 1;
    pMesh.position.set(sign * 0.17, -0.19, 0.102);
    return pMesh;
  };

  root.add(createPatchPocket(true));
  root.add(createPatchPocket(false));

  // Raglan sleeves with gentle wrist taper
  const createRaglanSleeve = (isLeft: boolean): THREE.BufferGeometry => {
    const geo = new THREE.BufferGeometry();
    const sign = isLeft ? -1 : 1;
    const nSteps = 16;
    const nRad = 16;
    const startX = sign * 0.33;
    const startY = 0.50;
    const endX = sign * 0.96;
    const endY = -0.04;

    const pos = new Float32Array((nSteps + 1) * (nRad + 1) * 3);
    let vIdx = 0;

    for (let s = 0; s <= nSteps; s++) {
      const t = s / nSteps;
      const cx = startX + t * (endX - startX);
      const cy = startY + t * (endY - startY);
      const r = 0.15 * (1 - t) + 0.085 * t;

      for (let a = 0; a <= nRad; a++) {
        const phi = (a / nRad) * Math.PI * 2;
        pos[vIdx] = cx + Math.cos(phi) * r * 0.85;
        pos[vIdx + 1] = cy + Math.cos(phi) * r * 0.70;
        pos[vIdx + 2] = Math.sin(phi) * (r * 0.85);
        vIdx += 3;
      }
    }

    const indices: number[] = [];
    for (let s = 0; s < nSteps; s++) {
      for (let a = 0; a < nRad; a++) {
        const i0 = s * (nRad + 1) + a;
        const i1 = (s + 1) * (nRad + 1) + a;
        const i2 = (s + 1) * (nRad + 1) + (a + 1);
        const i3 = s * (nRad + 1) + (a + 1);
        indices.push(i0, i1, i2, i0, i2, i3);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  };

  const leftSlv = createRaglanSleeve(true);
  const rightSlv = createRaglanSleeve(false);
  geometriesToDispose.push(leftSlv, rightSlv);

  root.add(new THREE.Mesh(leftSlv, clothMat));
  root.add(new THREE.Mesh(rightSlv, clothMat));

  deformableMeshes.push(
    { geometry: leftSlv, origPositions: new Float32Array(leftSlv.attributes.position.array), motionProfile: 'sleeves-fitted' },
    { geometry: rightSlv, origPositions: new Float32Array(rightSlv.attributes.position.array), motionProfile: 'sleeves-fitted' }
  );

  return {
    root,
    deformableMeshes,
    cleanUp: () => {
      geometriesToDispose.forEach(g => g.dispose());
      clothMat.dispose();
      btnMat.dispose();
      shadowMat.dispose();
    }
  };
}

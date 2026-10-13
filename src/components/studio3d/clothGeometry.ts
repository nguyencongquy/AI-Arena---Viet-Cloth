import * as THREE from 'three';
import type { MeshData } from './model';

export function clothBoundary(data: MeshData) {
  const edges = new Map<string, { a: number; b: number; count: number }>();
  for (let i = 0; i < data.index.length; i += 3) {
    const tri = data.index.slice(i, i + 3);
    for (let j = 0; j < 3; j++) {
      const a = tri[j], b = tri[(j + 1) % 3];
      const key = [data.sourceIndex[a], data.sourceIndex[b]].sort((a, b) => a - b).join(':');
      const edge = edges.get(key);
      if (edge) edge.count++; else edges.set(key, { a, b, count: 1 });
    }
  }
  return [...edges.values()].filter(e => e.count === 1);
}

/** Sewn connected topology: torso, shoulders and sleeves stay one surface.
 * This is a contemporary fitted prototype, not a reconstructed historical rập.
 */
export function createVietnameseCloth(data: MeshData, long: boolean, endY: number, collarMode: 'stand' | 'none' = 'stand') {
  const p = [...data.positions], uv = [...data.uvs]; let index = [...data.index];
  const boundary = clothBoundary(data);
  const neck = boundary.filter(e => [e.a, e.b].every(i => Math.abs(p[i * 3]) < .8 && p[i * 3 + 1] > 3.8));
  const neckY = Math.max(...neck.flatMap(e => [p[e.a * 3 + 1], p[e.b * 3 + 1]]));
  const hem = boundary.filter(e => [e.a, e.b].every(i => p[i * 3 + 1] < .65 && Math.abs(p[i * 3]) < 2.4));
  if (!neck.length || hem.length < 24) throw new Error('Cloth source has no continuous neck/hem boundary.');
  // Continuous sewn topology: preserve closed hem boundary for both short and long silhouettes.

  // Loose, gender-neutral torso: no corset or breast-shaped garment shell.
  for (let i = 0; i < p.length / 3; i++) {
    const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
    const torso = 1 - THREE.MathUtils.smoothstep(Math.abs(x), 1.7, 2.5);
    const ease = Math.exp(-(((y - (neckY - 3.6)) / 2.2) ** 2));
    p[i * 3] = x * (1 + .08 * torso * ease);
    p[i * 3 + 2] = z * (1 + .04 * torso * ease);
    if (long) {
      const straightCut=torso*THREE.MathUtils.smoothstep(neckY-y,.8,1.7);
      const angle=Math.atan2(z-.15,x);
      const hip=THREE.MathUtils.smoothstep(neckY-y,2.5,5);
      // A relaxed envelope must clear bust/under-layers at their outer edge,
      // not just the centerline. Otherwise open-neck forms expose skin through
      // their closed panels even though the neck opening itself is correct.
      const radius=2.12+hip*.25, depth=1.92+hip*.05;
      // The coat's cut has its own ease; never copy a female body's waist/bust shell.
      p[i*3]=THREE.MathUtils.lerp(p[i*3],Math.cos(angle)*radius,straightCut);
      p[i*3+2]=THREE.MathUtils.lerp(p[i*3+2],.15+Math.sin(angle)*depth,straightCut);
    }
    if (long && collarMode === 'stand' && Math.abs(x) < .85 && y > neckY - .7) {
      const blend = THREE.MathUtils.smoothstep(y, neckY - .7, neckY - .42);
      p[i * 3 + 1] = THREE.MathUtils.lerp(y, neckY - .09, blend);
    }
  }

  function extend(edges: typeof boundary, rows: number, vertex: (i: number, t: number) => number[], sideSlits = false) {
    const rings = new Map<number, number[]>();
    for (const { a, b } of edges) for (const i of [a, b]) {
      if (rings.has(i)) continue;
      const ring = [i];
      for (let row = 1; row <= rows; row++) {
        const t = row / rows; ring.push(p.length / 3); p.push(...vertex(i, t));
        uv.push(uv[i * 2], uv[i * 2 + 1] - t * (sideSlits ? .85 : .06));
      }
      rings.set(i, ring);
    }
    for (const { a, b } of edges) {
      const ar = rings.get(a)!, br = rings.get(b)!;
      const side = Math.abs((p[a * 3] + p[b * 3]) / 2) > 1.55 && Math.abs((p[a * 3 + 2] + p[b * 3 + 2]) / 2) < .36;
      for (let row = 0; row < rows; row++) {
        // Open side seams below the hip, not a split down the center like trousers.
        if (sideSlits && side && row > 5) continue;
        // Opposite winding along the sewn edge keeps both sides' normals aligned.
        index.push(ar[row], br[row + 1], br[row], ar[row], ar[row + 1], br[row + 1]);
      }
    }
  }
  if (long) {
    extend(hem, 36, (i, t) => {
      const x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
      const angle = Math.atan2(z, x);
      const folds = Math.sin(angle * 12 + t * .8) * .18 * t;
      return [x * (1 + .12 * t) + Math.cos(angle) * folds,
        THREE.MathUtils.lerp(y, endY + .09 * Math.cos(angle * 2), t),
        z * (1 + .08 * t) + Math.sin(angle) * folds];
    }, true);
    // Stand collar grows from the actual neckline only if collarMode is stand.
    if (collarMode === 'stand') {
      extend(neck, 5, (i, t) => [p[i * 3] * (1 - .05 * t), p[i * 3 + 1] + .34 * t, p[i * 3 + 2] * (1 - .05 * t)]);
    }
  }
  const cuff=boundary.filter(e=>[e.a,e.b].every(i=>Math.abs(data.positions[i*3])>3.3));
  for(const side of [-1,1]) {
    const verts=[...new Set(cuff.flatMap(e=>[e.a,e.b]))].filter(i=>Math.sign(data.positions[i*3])===side);
    if(!verts.length)continue;
    for(let i=0;i<data.positions.length/3;i++){
      if(Math.sign(data.positions[i*3])!==side)continue;
      const t=THREE.MathUtils.smoothstep(Math.abs(data.positions[i*3]),3.0,3.9);
      p[i*3]-=side*.25*t;p[i*3+1]+=.26*t;p[i*3+2]-=.1*t;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index); smoothClothNormals(geometry); geometry.computeBoundingBox();
  geometry.userData.neckY = neckY;
  geometry.userData.sourceHemEdges = hem.length;
  const hemMean=hem.reduce((s,e)=>s+data.positions[e.a*3+1],0)/hem.length;
  const armWeights=new Float32Array(p.length/3);
  for(let i=0;i<data.positions.length/3;i++)if(data.positions[i*3+1]>hemMean+.5)
    armWeights[i]=THREE.MathUtils.smoothstep(Math.abs(data.positions[i*3]),1.85,2.8);
  geometry.userData.armWeights=armWeights;
  return geometry;
}

export function smoothClothNormals(g: THREE.BufferGeometry) {
  g.computeVertexNormals();
  const p=g.getAttribute('position'), n=g.getAttribute('normal');
  let groups=g.userData.normalGroups as number[][] | undefined;
  if (!groups) {
    const map=new Map<string,number[]>();
    for(let i=0;i<p.count;i++) {
      const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*10000)).join(':');
      const group=map.get(key)||[];group.push(i);map.set(key,group);
    }
    groups=[...map.values()].filter(a=>a.length>1);g.userData.normalGroups=groups;
  }
  for(const group of groups) {
    const sum=new THREE.Vector3();for(const i of group)sum.add(new THREE.Vector3().fromBufferAttribute(n,i));sum.normalize();
    for(const i of group)n.setXYZ(i,sum.x,sum.y,sum.z);
  }
}

/** Stable smooth rest-pose sleeve drape; hands and sleeves use identical mapping. */
export function relaxArms(g: THREE.BufferGeometry, shoulderY: number) {
  const p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), side = Math.sign(x);
    const weights=g.userData.armWeights as Float32Array|undefined;
    const weight = weights?weights[i]:THREE.MathUtils.smoothstep(Math.abs(x), 1.85, 2.8);
    if (!weight || y > shoulderY + .3 || y < shoulderY - 5.7) continue;
    const angle = -side * .32 * weight, dx = x - side * 1.65, dy = y - shoulderY;
    p.setXYZ(i, side * 1.65 + dx * Math.cos(angle) - dy * Math.sin(angle),
      shoulderY + dx * Math.sin(angle) + dy * Math.cos(angle), z);
  }
  p.needsUpdate = true; smoothClothNormals(g);
}

// Studio v3 source synchronization.

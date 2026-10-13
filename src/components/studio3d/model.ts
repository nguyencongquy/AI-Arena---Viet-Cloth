import * as THREE from 'three';
import { buildFootwear } from './footwear';
import { relaxArms, smoothClothNormals } from './clothGeometry';
import { buildHeritageDetails, buildInnerTee, buildOuterwear, buildSkirt, buildWearable, buildYem } from './wearables';
import { FEMALE_FORMS, GARMENT_IDS, LONG_FORMS, itemInSlot } from './catalog';
import type { GarmentId, SceneId, WardrobeSlot } from './catalog';

export type ModelGender = 'male' | 'female';
export type StudioTop = GarmentId;
export interface BodyMeasures { height: number; shoulder: number; chest: number; waist: number; hip: number }
export interface StudioLook {
  gender: ModelGender; top: StudioTop; topColor: string; bottomColor: string;
  bottom: 'silk' | 'tailored' | 'denim' | 'cargo' | 'pleated-skirt';
  outer: string | null; under: string | null; shoes: string; glasses: string | null; bag: string | null;
  outerColor: string; underColor: string; shoesColor: string; glassesColor: string; bagColor: string;
  scene: SceneId;
  time: 'day' | 'night'; measures: BodyMeasures;
}
export function defaultLook(top:StudioTop='ao-ngu-than', color?:string|null):StudioLook {
  const gender=FEMALE_FORMS.includes(top)?'female':'male';
  return {gender,top,topColor:/^#[\da-f]{6}$/i.test(color||'')?color!:'#547f80',
    bottom:top==='ao-yem'?'tailored':'silk',bottomColor:top==='ao-yem'?'#31333a':'#ded4bd',
    outer:top==='ao-yem'?'blazer':null,outerColor:'#34343c',under:['ao-tu-than','ao-nhat-binh'].includes(top)?'under-yem':null,underColor:'#d6ada4',
    shoes:'loafers',shoesColor:'#332c29',glasses:null,glassesColor:'#25252b',bag:null,bagColor:'#363335',scene:'atelier',time:'day',measures:{...DEFAULT_BODY[gender]}};
}
/** Fail closed on stale/tampered saved data; never turn arbitrary IDs into asset paths. */
export function readLook(raw:unknown):StudioLook|null {
  if(!raw||typeof raw!=='object')return null;const r=raw as Record<string,unknown>;
  if(!GARMENT_IDS.includes(r.top as GarmentId)||!['male','female'].includes(r.gender as string))return null;
  if(FEMALE_FORMS.includes(r.top as GarmentId)&&r.gender==='male')return null;
  const result=defaultLook(r.top as GarmentId);result.gender=r.gender as ModelGender;
  for(const key of ['topColor','bottomColor','outerColor','underColor','shoesColor','glassesColor','bagColor'] as const) {
    if(r[key]!==undefined&&!/^#[\da-f]{6}$/i.test(String(r[key])))return null;
    if(r[key])result[key]=r[key] as string;
  }
  for(const slot of ['outer','under','bottom','shoes','glasses','bag'] as const) {
    // v1 glasses/bag flags migrate to real item IDs.
    const id=slot==='glasses'&&typeof r[slot]==='boolean'?(r[slot]?'thin-glasses':null):slot==='bag'&&typeof r[slot]==='boolean'?(r[slot]?'mini-bag':null):r[slot];
    if(id===undefined)continue;
    if(id===null&&['outer','under','glasses','bag'].includes(slot)){(result as unknown as Record<string,unknown>)[slot]=null;continue;}
    if(!itemInSlot(slot,id))return null;(result as unknown as Record<string,unknown>)[slot]=id;
  }
  if(['ao-tu-than','ao-nhat-binh'].includes(result.top)&&!result.under)result.under=result.gender==='female'?'under-yem':'tee';
  if(r.scene!==undefined&&!['atelier','gallery','boulevard','courtyard'].includes(String(r.scene)))return null;
  if(r.time!==undefined&&!['day','night'].includes(String(r.time)))return null;
  result.scene=(r.scene as SceneId)||'atelier';result.time=(r.time as StudioLook['time'])||'day';
  result.measures=clampMeasures(r.measures as Partial<BodyMeasures>);return result;
}
export const DEFAULT_BODY: Record<ModelGender, BodyMeasures> = {
  male: { height: 175, shoulder: 43, chest: 96, waist: 82, hip: 96 },
  female: { height: 165, shoulder: 38, chest: 88, waist: 72, hip: 94 },
};
export const MEASURE_LIMITS: Record<keyof BodyMeasures, [number, number]> = {
  height: [155, 190], shoulder: [34, 49], chest: [78, 116], waist: [60, 104], hip: [82, 116],
};
export function clampMeasures(m: Partial<BodyMeasures> | null | undefined): BodyMeasures {
  return Object.fromEntries(Object.entries(MEASURE_LIMITS).map(([key, [min, max]]) => {
    const value = m?.[key as keyof BodyMeasures];
    return [key, Math.min(max, Math.max(min, typeof value === 'number' && Number.isFinite(value) ? value : DEFAULT_BODY.male[key as keyof BodyMeasures]))];
  })) as unknown as BodyMeasures;
}
export interface MeshData { positions: number[]; uvs: number[]; index: number[]; sourceIndex: number[] }
export interface AvatarData {
  body: MeshData; eyes: MeshData; hair: MeshData; eyebrows: MeshData; eyelashes: MeshData;
  shirt: MeshData; trousers: MeshData; shoes: MeshData; joints: Record<string, number[]>;
}
const avatarCache = new Map<ModelGender, Promise<AvatarData>>();
export function loadAvatar(gender: ModelGender) {
  if (!avatarCache.has(gender)) avatarCache.set(gender, fetch(`/studio3dv3/${gender}.json`).then(r => {
    if (!r.ok) throw new Error('Không tải được người mẫu 3D.');
    return r.json();
  }).catch(error => { avatarCache.delete(gender); throw error; }));
  return avatarCache.get(gender)!;
}

function geometry(data: MeshData, filter?: (a: number, b: number, c: number) => boolean) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));
  const index = [];
  for (let i = 0; i < data.index.length; i += 3) {
    const [a,b,c] = data.index.slice(i, i + 3);
    if (!filter || filter(a,b,c)) index.push(a,b,c);
  }
  g.setIndex(index); g.computeVertexNormals();
  // UV seams share topology. Average normals across source indices, not UV indices.
  const normal = g.getAttribute('normal'); const sums = new Map<number, THREE.Vector3>();
  data.sourceIndex.forEach((v, i) => {
    const sum = sums.get(v) || new THREE.Vector3();
    sum.add(new THREE.Vector3().fromBufferAttribute(normal, i)); sums.set(v, sum);
  });
  data.sourceIndex.forEach((v, i) => { const n = sums.get(v)!.normalize(); normal.setXYZ(i, n.x, n.y, n.z); });
  g.userData.armWeights=Float32Array.from(data.positions.filter((_,i)=>i%3===0).map(x=>THREE.MathUtils.smoothstep(Math.abs(x),1.85,2.8)));
  return g;
}
function stretchBody(g: THREE.BufferGeometry, look: StudioLook) {
  const p = g.getAttribute('position'); const defaults = DEFAULT_BODY[look.gender];
  const ratios = { shoulder: look.measures.shoulder / defaults.shoulder, chest: look.measures.chest / defaults.chest,
    waist: look.measures.waist / defaults.waist, hip: look.measures.hip / defaults.hip };
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    // Localized smooth proportional approximation; not a calibrated tailoring model.
    const chest = Math.exp(-(((y - 3.4) / 1.3) ** 2)), waist = Math.exp(-(((y - .8) / 1.3) ** 2));
    const hip = Math.exp(-(((y + 1.3) / 1.4) ** 2)), shoulder = Math.exp(-(((y - 4.7) / .8) ** 2));
    const width = 1 + (ratios.chest - 1) * chest * .65 + (ratios.waist - 1) * waist * .6 + (ratios.hip - 1) * hip * .65 + (ratios.shoulder - 1) * shoulder;
    const depth = 1 + (ratios.chest - 1) * chest + (ratios.waist - 1) * waist + (ratios.hip - 1) * hip;
    p.setXYZ(i, x * width, y, z * depth);
  }
  p.needsUpdate = true; g.computeVertexNormals();
}
function textile(color: string) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = color; ctx.fillRect(0,0,512,512);
  ctx.strokeStyle = '#ffffff38'; ctx.fillStyle = '#ffffff32'; ctx.lineWidth = 1;
  // Code-native jacquard motif. Actual 3D UV texture, not a garment photo.
  for (let x = -50; x < 570; x += 120) for (let y = -60; y < 590; y += 150) {
    ctx.save(); ctx.translate(x + (Math.floor(y / 150) % 2) * 60, y); ctx.rotate(-.4);
    ctx.beginPath(); ctx.moveTo(0,0); ctx.quadraticCurveTo(24,48,0,120); ctx.stroke();
    for (let j = 0; j < 6; j++) {
      ctx.save(); ctx.translate(8 + Math.sin(j) * 6, 14 + j * 16); ctx.rotate(j % 2 ? -.9 : .9);
      ctx.beginPath(); ctx.ellipse(10,0,13,3,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    for (let petal = 0; petal < 5; petal++) {
      ctx.save(); ctx.translate(10,61); ctx.rotate(petal * Math.PI * .4);
      ctx.beginPath(); ctx.ellipse(6,0,6,2.6,0,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(3,3); texture.anisotropy = 8;
  return texture;
}
function silk(color: string) {
  return new THREE.MeshPhysicalMaterial({ map: textile(color), roughness: .56, metalness: .04,
    sheen: .72, sheenRoughness: .65, sheenColor: new THREE.Color('#eee8d9'), side: THREE.DoubleSide });
}
function trousersGeometry(data: MeshData, look: StudioLook) {
  const g=geometry(data);
  const p=g.getAttribute('position');
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const lower=THREE.MathUtils.smoothstep(-y,1.6,6.4),center=Math.sign(x)*(1+lower*.1);
    const width=look.bottom==='silk'?1+lower*.62:look.bottom==='tailored'?1+lower*.33:look.bottom==='cargo'?1+lower*.55:1+lower*.14;
    p.setX(i,center+(x-center)*width);
    if(look.bottom!=='denim')p.setZ(i,z+Math.cos((x-center)*8)*lower*(look.bottom==='silk'?.035:.018));
  }
  smoothClothNormals(g);return g;
}
function addGarmentDetails(root: THREE.Group, cloth: THREE.Mesh, long: boolean, color: string) {
  const p = cloth.geometry.getAttribute('position');
  const neckY = cloth.geometry.userData.neckY as number;
  cloth.updateMatrixWorld(true);
  const ray = new THREE.Raycaster();
  // Project small sewn details onto the actual fabric surface; no debug outlines.
  function frontZ(x: number, y: number) {
    ray.set(new THREE.Vector3(x,y,6),new THREE.Vector3(0,0,-1));
    const hit=ray.intersectObject(cloth,false)[0];
    if(hit)return hit.point.z+.045;
    const candidates: { d: number; z: number }[] = [];
    for (let i = 0; i < p.count; i++) {
      if (p.getZ(i) < .15 || Math.abs(p.getX(i)) > 1.9) continue;
      candidates.push({ d: (p.getX(i)-x)**2 + (p.getY(i)-y)**2, z: p.getZ(i) });
    }
    candidates.sort((a,b)=>a.d-b.d);
    const near = candidates.slice(0,4), weights = near.map(v=>1/(.008+v.d));
    return near.reduce((s,v,i)=>s+v.z*weights[i],0)/weights.reduce((a,b)=>a+b,0)+.025;
  }
  const seamMaterial = new THREE.MeshStandardMaterial({color:new THREE.Color(color).multiplyScalar(.84),roughness:.85});
  const buttonMaterial = new THREE.MeshPhysicalMaterial({color:'#ded0a9',roughness:.34,clearcoat:.4});
  const path: THREE.Vector3[] = [];
  for (let i = 0; i <= 36; i++) {
    const t=i/36, y=neckY-.14-t*(long?neckY-1.15:neckY+.05);
    const x=long?-Math.min(1.22,.05+t*2.4):0;
    path.push(new THREE.Vector3(x,y,frontZ(x,y)));
  }
  const seam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path),72,.015,5,false),seamMaterial);
  seam.name='sewn-closure';root.add(seam);
  for (let i = 0; i < (long?5:6); i++) {
    const t=.08+i*(long?.19:.16), point=new THREE.CatmullRomCurve3(path).getPoint(t);
    const button=new THREE.Mesh(new THREE.SphereGeometry(.068,16,10),buttonMaterial);button.scale.z=.48;
    button.position.copy(point);button.position.z+=.04;button.name='garment-button';root.add(button);
  }
  if (!long) for (const side of [-1,1]) {
    const pos:number[]=[],uv:number[]=[],indices:number[]=[];
    const hemY=cloth.geometry.boundingBox!.min.y;
    for(let row=0;row<=8;row++)for(let col=0;col<=8;col++) {
      const x=side*.87+(col/8-.5)*.68,y=hemY+.35+row/8*.88;
      pos.push(x,y,frontZ(x,y)+.012+Math.sin(col/8*Math.PI)*.018);uv.push(col/8,row/8);
      if(row<8&&col<8){const a=row*9+col;indices.push(a,a+1,a+10,a,a+10,a+9);}
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
    const pocket=new THREE.Mesh(g,cloth.material);pocket.name='sewn-pocket';root.add(pocket);
    const border:number[]=[];
    for(const [row,col] of [[0,0],[0,8],[8,8],[8,0],[0,0]])border.push(...pos.slice((row*9+col)*3,(row*9+col)*3+3));
    const pocketEdge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({length:5},(_,i)=>new THREE.Vector3(...border.slice(i*3,i*3+3) as [number,number,number])),false,'centripetal'),40,.011,5,false),seamMaterial);
    pocketEdge.name='pocket-stitch';root.add(pocketEdge);
  }
}
type FitNode = {box:THREE.Box3; faces?:number[]; left?:FitNode; right?:FitNode};
function fitTree(g:THREE.BufferGeometry):FitNode {
  if(g.userData.fitTree)return g.userData.fitTree;
  const p=g.getAttribute('position'),index=g.getIndex()!;
  const boxes:THREE.Box3[]=[],centers:THREE.Vector3[]=[];
  for(let i=0;i<index.count;i+=3){
    const box=new THREE.Box3();for(let j=0;j<3;j++)box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,index.getX(i+j)));
    boxes.push(box);centers.push(box.getCenter(new THREE.Vector3()));
  }
  function build(faces:number[]):FitNode {
    const box=new THREE.Box3();for(const f of faces)box.union(boxes[f]);
    if(faces.length<=48)return {box,faces};
    const size=box.getSize(new THREE.Vector3()),axis=size.x>size.y&&size.x>size.z?'x':size.y>size.z?'y':'z';
    faces.sort((a,b)=>centers[a][axis]-centers[b][axis]);const mid=faces.length>>1;
    return {box,left:build(faces.slice(0,mid)),right:build(faces.slice(mid))};
  }
  return g.userData.fitTree=build(boxes.map((_,i)=>i));
}
/** Local-space nearest compatible surface. All fitting happens before root scaling. */
function fittingHit(mesh:THREE.Mesh,ray:THREE.Ray,normal:THREE.Vector3,arm:number,maxDistance:number) {
  const g=mesh.geometry,p=g.getAttribute('position'),index=g.getIndex()!,weights=g.userData.armWeights as Float32Array|undefined;
  const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),hit=new THREE.Vector3(),faceNormal=new THREE.Vector3();
  let nearest:THREE.Vector3|null=null,distance=maxDistance;
  const stack=[fitTree(g)];
  while(stack.length){
    const node=stack.pop()!;if(!ray.intersectsBox(node.box))continue;
    if(!node.faces){stack.push(node.left!,node.right!);continue;}
    for(const f of node.faces){
      const ia=index.getX(f*3),ib=index.getX(f*3+1),ic=index.getX(f*3+2);
      if(weights&&Math.abs(arm-(weights[ia]+weights[ib]+weights[ic])/3)>=.4)continue;
      a.fromBufferAttribute(p,ia);b.fromBufferAttribute(p,ib);c.fromBufferAttribute(p,ic);
      faceNormal.subVectors(b,a).cross(c.clone().sub(a)).normalize();
      if(faceNormal.dot(normal)<.15)continue;
      if(!ray.intersectTriangle(a,b,c,false,hit))continue;
      const d=hit.distanceTo(ray.origin);if(d<distance){distance=d;nearest=hit.clone();}
    }
  }
  return nearest;
}
/** Fit in the surface-normal direction after measurements and shared arm pose. */
function fitLayer(mesh:THREE.Mesh, inner:THREE.Mesh[], margin:number) {
  inner.forEach(m=>m.updateMatrixWorld(true));
  smoothClothNormals(mesh.geometry);
  const p=mesh.geometry.getAttribute('position'), n=mesh.geometry.getAttribute('normal');
  const ray=new THREE.Raycaster(), point=new THREE.Vector3(), normal=new THREE.Vector3();
  const armWeights=mesh.geometry.userData.armWeights as Float32Array|undefined;
  const axes=mesh.userData.armAxes as THREE.Vector3[][]|undefined;
  ray.far=2.5;
  for(let i=0;i<p.count;i++) {
    point.fromBufferAttribute(p,i);normal.fromBufferAttribute(n,i).normalize();
    if(normal.lengthSq()<.5)continue;
    const arm=armWeights?.[i]||0;
    const neck=mesh.geometry.userData.neckY as number|undefined;
    // Collar ease is radial around the neck; never project upward onto the jaw.
    if(!mesh.geometry.userData.bib&&neck!==undefined&&point.y>neck-.5&&Math.abs(point.x)<1)
      normal.set(point.x,0,point.z-.05).normalize();
    if(arm>.5&&axes) {
      const joints=axes[point.x>0?0:1];let nearest=new THREE.Vector3(),distance=Infinity;
      for(let j=0;j<joints.length-1;j++){
        const axis=joints[j+1].clone().sub(joints[j]);
        const t=THREE.MathUtils.clamp(point.clone().sub(joints[j]).dot(axis)/axis.lengthSq(),0,1);
        const center=joints[j].clone().addScaledVector(axis,t),d=center.distanceToSquared(point);
        if(d<distance){distance=d;nearest=center;}
      }
      normal.copy(point).sub(nearest).normalize();
    }
    ray.set(point.clone().addScaledVector(normal,1.25),normal.clone().negate());
    let hit:THREE.Vector3|null=null,distance=2.5;
    for(const layer of inner){const candidate=fittingHit(layer,ray.ray,normal,arm,distance);if(candidate){distance=candidate.distanceTo(ray.ray.origin);hit=candidate;}}
    if(!hit)continue;
    const shift=hit.clone().sub(point).dot(normal)+margin;
    if(shift>0&&shift<1.25) { point.addScaledVector(normal,shift);p.setXYZ(i,point.x,point.y,point.z); }
  }
  p.needsUpdate=true;delete mesh.geometry.userData.fitTree;smoothClothNormals(mesh.geometry);mesh.geometry.computeBoundingBox();
}
export interface DressedAvatar { root: THREE.Group; cloth: THREE.Mesh[]; resources: THREE.Texture[]; dispose: () => void }
export async function buildAvatar(look: StudioLook): Promise<DressedAvatar> {
  const data = await loadAvatar(look.gender);
  const root = new THREE.Group(); root.name = 'dressed-avatar';
  const loader = new THREE.TextureLoader(), resources: THREE.Texture[] = [];
  async function texture(name: string) {
    const t = await loader.loadAsync(`/studio3dv3/${name}.png`); t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8; resources.push(t); return t;
  }
  const maps = await Promise.allSettled([
    texture(`${look.gender}-skin`),texture(`${look.gender}-hair`),texture('eyes'),texture('eyebrows'),texture('eyelashes'),texture('shoes'),
  ]);
  if(maps.some(r=>r.status==='rejected')){resources.forEach(t=>t.dispose());throw new Error('Không tải đủ chất liệu người mẫu.');}
  const [skinMap,hairMap,eyeMap,browMap,lashMap,shoeMap]=maps.map(r=>(r as PromiseFulfilledResult<THREE.Texture>).value);
  const armAxes=['l','r'].map(side=>{
    const points=['shoulder','elbow','hand'].map(j=>data.joints[`${side}-${j}`]);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));
    g.userData.armWeights=Float32Array.from(points.map(p=>THREE.MathUtils.smoothstep(Math.abs(p[0]),1.85,2.8)));
    stretchBody(g,look);relaxArms(g,data.joints['l-shoulder'][1]);
    const result=points.map((_,i)=>new THREE.Vector3().fromBufferAttribute(g.getAttribute('position'),i));g.dispose();return result;
  });
  function add(g: THREE.BufferGeometry, material: THREE.Material, name: string) {
    stretchBody(g,look); if(['body','top','outer','under'].includes(name))relaxArms(g,data.joints['l-shoulder'][1]);
    const mesh = new THREE.Mesh(g,material); mesh.name=name;mesh.userData.armAxes=armAxes;mesh.userData.slot=name==='trousers'?'bottom':name; mesh.castShadow=true; mesh.receiveShadow=true; root.add(mesh); return mesh;
  }
  // Body is covered by trousers and shoes; keep continuous shoulders, neck, and arms intact for all garments.
  const bodyMesh=add(geometry(data.body,(a,b,c) => [a,b,c].every(i => {
    const y=data.body.positions[i*3+1];
    // Keep entire torso, neck, shoulders, and arms intact (above pelvis/trousers cutoff)
    return y > -0.65;
  })),new THREE.MeshPhysicalMaterial({map:skinMap,color:new THREE.Color().setRGB(.72,.60,.50),roughness:.52,clearcoat:.04,clearcoatRoughness:.8}), 'body');
  // Transparent cornea must not become opaque and cover the brown iris.
  add(geometry(data.eyes),new THREE.MeshPhysicalMaterial({map:eyeMap,alphaTest:.38,roughness:.18,clearcoat:.3}), 'eyes');
  add(geometry(data.hair),new THREE.MeshStandardMaterial({map:hairMap,color:new THREE.Color().setRGB(.085,.072,.062),roughness:.62,alphaTest:.38,side:THREE.DoubleSide}), 'hair');
  add(geometry(data.eyebrows),new THREE.MeshStandardMaterial({map:browMap,alphaTest:.2,side:THREE.DoubleSide}), 'eyebrows');
  add(geometry(data.eyelashes),new THREE.MeshStandardMaterial({map:lashMap,alphaTest:.2,side:THREE.DoubleSide}), 'eyelashes');
  const topMaterial = silk(look.topColor); resources.push(topMaterial.map!);
  const long=LONG_FORMS.includes(look.top);
  const ankleY=Math.min(...data.shoes.positions.filter((_,i)=>i%3===1))+1.65;
  const top = add(buildWearable(data,look.top,ankleY),topMaterial,'top');
  function addBibTies(bib:THREE.Mesh){
    const p=bib.geometry.getAttribute('position');
    for(const side of [-1,1]){
      const endpoint=side<0?0:40;
      const start=new THREE.Vector3().fromBufferAttribute(p,endpoint);
      const neckBack=new THREE.Vector3(side*.4,4.24,-.68);
      const curve=new THREE.CatmullRomCurve3([start,new THREE.Vector3(side*.57,4.12,.78),neckBack,new THREE.Vector3(0,4.17,-.8)]);
      const tie=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.045,6,false),bib.material);tie.name='bib-neck-tie';tie.userData.slot=bib.userData.slot;root.add(tie);
      const waist=new THREE.CatmullRomCurve3([new THREE.Vector3(side*1.55,1.04,1.07),new THREE.Vector3(side*1.77,1.02,.1),new THREE.Vector3(side*.4,1.01,-.91)]);
      const strap=new THREE.Mesh(new THREE.TubeGeometry(waist,28,.038,6,false),bib.material);strap.userData.slot=bib.userData.slot;root.add(strap);
    }
  }
  const cloth: THREE.Mesh[] = [top];
  top.userData.layerLevel = 1;
  function clothMaterial(color:string,pattern=true) {
    if(pattern){const m=silk(color);resources.push(m.map!);return m;}
    return new THREE.MeshPhysicalMaterial({color,roughness:.78,sheen:.18,side:THREE.DoubleSide});
  }
  let underMesh: THREE.Mesh | null = null;
  if(look.under) {
    const g=look.under==='under-yem'?buildYem(data):buildInnerTee(data.shirt);
    underMesh=add(g,clothMaterial(look.underColor,look.under==='under-yem'),'under');
    underMesh.userData.layerLevel = 0;
    cloth.push(underMesh);
    fitLayer(underMesh,[bodyMesh],.09);
    if(look.under==='under-yem')addBibTies(underMesh);
  }
  fitLayer(top,underMesh?[bodyMesh,underMesh]:[bodyMesh],.13);
  top.userData.fabricColor=look.topColor;
  if(look.top==='ao-yem')addBibTies(top);
  top.userData.detailPoint=(x:number,y:number)=>{
    const defaults=DEFAULT_BODY[look.gender],m=look.measures;
    const chest=Math.exp(-(((y-3.4)/1.5)**2)),waist=Math.exp(-(((y-.8)/1.3)**2));
    const hip=Math.exp(-(((y+1.3)/1.4)**2)),shoulder=Math.exp(-(((y-4.7)/.8)**2));
    const width=1+(m.chest/defaults.chest-1)*chest*.65+(m.waist/defaults.waist-1)*waist*.6+(m.hip/defaults.hip-1)*hip*.65+(m.shoulder/defaults.shoulder-1)*shoulder;
    return new THREE.Vector2(x*width,y);
  };
  for(const detail of buildHeritageDetails(top,look.top)){detail.castShadow=true;detail.receiveShadow=true;root.add(detail);}
  if(['ao-ngu-than','ao-tac','ao-ba-ba'].includes(look.top))addGarmentDetails(root,top,long,look.topColor);
  if(look.outer) {
    const mesh=add(buildOuterwear(data.shirt,look.outer==='cropped-jacket',look.top==='ao-yem'?.20:.32,['ao-tac','ao-nhat-binh','ao-giao-linh'].includes(look.top)),clothMaterial(look.outerColor,false),'outer');
    mesh.userData.layerLevel = 2;
    cloth.push(mesh);
    fitLayer(mesh,underMesh?[bodyMesh,top,underMesh]:[bodyMesh,top],.18);
  }
  const bottomMaterial = new THREE.MeshPhysicalMaterial({color:look.bottomColor,roughness:look.bottom==='denim'?.9:.65,sheen:look.bottom==='silk'?.6:0,side:THREE.DoubleSide});
  // Occlude the waistband/seat beneath the coat; not a cloth collision/fit claim.
  const bottom=add(look.bottom==='pleated-skirt'?buildSkirt(data):trousersGeometry(data.trousers,look),bottomMaterial,'trousers');
  if(look.bottom==='pleated-skirt')cloth.push(bottom);
  root.add(buildFootwear(data.shoes,look.shoes,look.shoesColor,shoeMap));
  if(look.shoes==='mules')add(geometry(data.body,(a,b,c)=>[a,b,c].every(i=>data.body.positions[i*3+1]<-7.35)),new THREE.MeshPhysicalMaterial({map:skinMap,color:new THREE.Color().setRGB(.72,.60,.50),roughness:.52}),'feet');
  if (look.glasses) {
    const faceY=data.joints['l-eye-target'][1], faceZ=data.joints['l-eye-target'][2]+.09;
    const material=new THREE.MeshStandardMaterial({color:look.glassesColor,metalness:.65,roughness:.3});
    const glasses=new THREE.Group();glasses.name='glasses';glasses.userData.slot='glasses';root.add(glasses);
    for(const side of [-1,1]) {
      const frame=new THREE.Mesh(new THREE.TorusGeometry(.27,.018,8,48),material); frame.scale.y=.72;
      frame.position.set(side*.34,faceY,faceZ); glasses.add(frame);
      if(look.glasses==='sunglasses'){const lens=new THREE.Mesh(new THREE.CircleGeometry(.249,40),new THREE.MeshPhysicalMaterial({color:look.glassesColor,roughness:.16,metalness:.3,transparent:true,opacity:.88}));lens.scale.y=.72;lens.position.copy(frame.position);lens.position.z-=.008;glasses.add(lens);}
    }
    const bridge=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.19,8),material); bridge.rotation.z=Math.PI/2;
    bridge.position.set(0,faceY+.05,faceZ);glasses.add(bridge);
  }
  if (look.bag) {
    const bag=new THREE.Group(), leather=new THREE.MeshStandardMaterial({color:look.bagColor,roughness:.85});bag.userData.slot='bag';
    const shape=new THREE.Shape();shape.moveTo(-.55,-.15);shape.lineTo(.55,-.15);
    shape.quadraticCurveTo(.66,-.2,.62,-1.18);shape.quadraticCurveTo(.6,-1.3,.42,-1.3);
    shape.lineTo(-.42,-1.3);shape.quadraticCurveTo(-.6,-1.3,-.62,-1.18);shape.quadraticCurveTo(-.66,-.2,-.55,-.15);
    const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.22,bevelEnabled:true,bevelThickness:.035,bevelSize:.045,bevelSegments:3,steps:1,curveSegments:12}),leather);bag.add(body);
    const handleCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(-.35,-.15,.11),new THREE.Vector3(-.28,.3,.11),new THREE.Vector3(0,.38,.11),new THREE.Vector3(.28,.3,.11),new THREE.Vector3(.35,-.15,.11)]);
    bag.add(new THREE.Mesh(new THREE.TubeGeometry(handleCurve,40,.035,8,false),leather));
    const points=bodyMesh.geometry.getAttribute('position'),anchor=new THREE.Vector3();let count=0;
    for(let i=0;i<points.count;i++)if(points.getX(i)<-2.5&&points.getY(i)<.6){anchor.add(new THREE.Vector3().fromBufferAttribute(points,i));count++;}
    if(count)anchor.divideScalar(count);else anchor.set(-3,.1,1.8);
    bag.position.copy(anchor);bag.position.y-=.25;bag.name='handbag';
    if(look.bag==='tote')bag.scale.set(1.4,1.25,1);
    if(look.bag==='crossbody') {
      bag.position.set(1.8,-.6,1.5);
      const strap=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-1.35,4.2,1.15),new THREE.Vector3(0,2.35,1.65),new THREE.Vector3(1.8,.0,1.6)]),48,.035,8,false),leather);strap.userData.slot='bag';root.add(strap);
    }
    root.add(bag);
  }
  const bounds=new THREE.Box3().setFromObject(root), factor=(look.measures.height/100)/(bounds.max.y-bounds.min.y);
  root.scale.setScalar(factor); root.position.y=-bounds.min.y*factor;
  cloth.forEach(mesh=>{mesh.userData.rest=Float32Array.from(mesh.geometry.getAttribute('position').array);mesh.userData.restNormals=Float32Array.from(mesh.geometry.getAttribute('normal').array);mesh.geometry.computeBoundingBox();mesh.userData.hemY=mesh.geometry.boundingBox!.min.y;});
  function dispose() {
    root.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); for (const m of Array.isArray(object.material)?object.material:[object.material]) m.dispose(); } });
    resources.forEach(t=>t.dispose());
  }
  return { root, cloth, resources, dispose };
}
export function animateCloth(mesh: THREE.Mesh,time: number, enabled: boolean) {
  const rest=mesh.userData.rest as Float32Array, p=mesh.geometry.getAttribute('position');
  if (!p || !rest) return;
  const hemY=typeof mesh.userData.hemY==='number'?mesh.userData.hemY:-5.5;
  const normals=mesh.userData.restNormals as Float32Array;
  const posArray = p.array as Float32Array;
  for(let i=0;i<p.count;i++) {
    const x=rest[i*3],y=rest[i*3+1],z=rest[i*3+2];
    if (!enabled) {
      posArray[i*3]=x; posArray[i*3+1]=y; posArray[i*3+2]=z;
      continue;
    }
    const hem=1-THREE.MathUtils.smoothstep(y,hemY,hemY+2.4), cuff=THREE.MathUtils.smoothstep(Math.abs(x),3.2,4.8);
    const weight=Math.max(hem,cuff*.65);
    const wave=Math.sin(time*1.45+y*.95+x*.6);
    // Bounded visual sway: at most .045 source units, below fitted layer margins.
    const outward=(.015+.015*wave)*weight;
    posArray[i*3]=x+wave*.015*weight+(normals?.[i*3]||0)*outward;
    posArray[i*3+1]=y+(normals?.[i*3+1]||0)*outward;
    posArray[i*3+2]=z+(normals?.[i*3+2]||0)*outward;
  }
  p.needsUpdate=true; smoothClothNormals(mesh.geometry);
}

// Studio v3 source synchronization.

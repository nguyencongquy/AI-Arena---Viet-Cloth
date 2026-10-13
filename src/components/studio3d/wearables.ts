import * as THREE from 'three';
import type { AvatarData, MeshData } from './model';
import type { GarmentId } from './catalog';
import { createVietnameseCloth, smoothClothNormals } from './clothGeometry';

/** Split triangles at the front opening; interpolate UVs and pose weights at sewn edges. */
function clipFrontOpening(g: THREE.BufferGeometry, width: (y: number) => number, frontZ=.38, breaks:number[]=[], center:(y:number)=>number=()=>0) {
  type Vertex = { p: THREE.Vector3; uv: THREE.Vector2; arm: number };
  const p=g.getAttribute('position'), uv=g.getAttribute('uv'), source=g.getIndex()!;
  const weights=g.userData.armWeights as Float32Array;
  const positions:number[]=[], uvs:number[]=[], arms:number[]=[], indices:number[]=[], vertexMap=new Map<string,number>();
  function split(poly:Vertex[], distance:(v:Vertex)=>number):Vertex[] {
    const out:Vertex[]=[];
    for(let i=0;i<poly.length;i++) {
      const a=poly[i], b=poly[(i+1)%poly.length], da=distance(a), db=distance(b);
      if(da>=-1e-8)out.push(a);
      if((da<0)!==(db<0)) {
        let lo=0,hi=1;
        for(let j=0;j<32;j++) { const t=(lo+hi)/2, v={p:a.p.clone().lerp(b.p,t),uv:a.uv,arm:0};
          if((distance(v)<0)===(da<0))lo=t;else hi=t; }
        const t=(lo+hi)/2;
        out.push({p:a.p.clone().lerp(b.p,t),uv:a.uv.clone().lerp(b.uv,t),arm:THREE.MathUtils.lerp(a.arm,b.arm,t)});
      }
    }
    return out;
  }
  function emit(poly:Vertex[]) {
    for(let j=1;j+1<poly.length;j++) {
      const tri=[poly[0],poly[j],poly[j+1]];
      if(new THREE.Vector3().subVectors(tri[1].p,tri[0].p).cross(new THREE.Vector3().subVectors(tri[2].p,tri[0].p)).lengthSq()<1e-14)continue;
      for(const v of tri){
        const key=[v.p.x,v.p.y,v.p.z,v.uv.x,v.uv.y,v.arm].map(n=>Math.round(n*1e6)).join(':');
        let index=vertexMap.get(key);
        if(index===undefined){index=arms.length;vertexMap.set(key,index);positions.push(v.p.x,v.p.y,v.p.z);uvs.push(v.uv.x,v.uv.y);arms.push(v.arm);}
        indices.push(index);
      }
    }
  }
  for(let i=0;i<source.count;i+=3) {
    const tri=[0,1,2].map(j=>{const k=source.getX(i+j);return {p:new THREE.Vector3().fromBufferAttribute(p,k),uv:new THREE.Vector2(uv.getX(k),uv.getY(k)),arm:weights[k]||0};});
    emit(split(tri,v=>frontZ-v.p.z));
    const front=split(tri,v=>v.p.z-frontZ),bands=[-Infinity,...breaks.sort((a,b)=>a-b),Infinity];
    for(let band=0;band<bands.length-1;band++){
      const lo=bands[band],hi=bands[band+1];
      let polygon=front;
      if(Number.isFinite(lo))polygon=split(polygon,v=>v.p.y-lo);
      if(Number.isFinite(hi))polygon=split(polygon,v=>hi-v.p.y);
      const yInside=(y:number)=>Math.max(lo+1e-7,Math.min(hi-1e-7,y));
      emit(split(polygon,v=>center(yInside(v.p.y))-v.p.x-width(yInside(v.p.y))));
      emit(split(polygon,v=>v.p.x-center(yInside(v.p.y))-width(yInside(v.p.y))));
    }
  }
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);
  g.userData.armWeights=Float32Array.from(arms);delete g.userData.normalGroups;
  smoothClothNormals(g);g.computeBoundingBox();
}
function sleeveSection(data:MeshData,x:number) {
  const ys:number[]=[],zs:number[]=[];
  for(let j=0;j<data.positions.length;j+=3)
    if(Math.abs(Math.abs(data.positions[j])-Math.abs(x))<.18){ys.push(data.positions[j+1]);zs.push(data.positions[j+2]);}
  return ys.length?[(Math.min(...ys)+Math.max(...ys))/2,(Math.min(...zs)+Math.max(...zs))/2]:[2,.25];
}
/** A body-conforming bib with sewn neck ties. No sleeves or fabricated long body. */
export function buildYem(data: AvatarData) {
  const rows=44,cols=40,positions:number[]=[],uv:number[]=[],indices:number[]=[];
  // Sample the actual chest surface; a flat diamond cannot convey fabric on a body.
  const p=data.body.positions;
  const front=new Map<number, {x:number;y:number;z:number}[]>();
  for(let i=0;i<p.length;i+=3)if(p[i+2]>.55&&Math.abs(p[i])<1.9&&p[i+1]>-.7&&p[i+1]<4.2) {
    const bucket=Math.round(p[i+1]*4),list=front.get(bucket)||[];list.push({x:p[i],y:p[i+1],z:p[i+2]});front.set(bucket,list);
  }
  const samples=[...front.values()].flat();
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++) {
    const t=row/rows,u=col/cols*2-1;
    // Smooth taper down to a clean tucked-in hem (~1.1 width), avoiding needle tips or degenerate vertices
    let width=t<.22?THREE.MathUtils.lerp(.46,1.6,t/.22):t<.63?1.6:THREE.MathUtils.lerp(1.6,1.08,(t-.63)/.37);
    const y=3.85-t*4.25;
    const ring=samples.filter(v=>Math.abs(v.y-y)<.15);
    if(ring.length)width=Math.min(width,Math.max(...ring.map(v=>Math.abs(v.x)))-.08);
    const x=u*width;
    const candidates=samples.filter(v=>Math.abs(v.y-y)<.45).sort((a,b)=>(a.x-x)**2+(a.y-y)**2-((b.x-x)**2+(b.y-y)**2));
    const near=candidates.slice(0,6),weights=near.map(v=>1/(.005+(v.x-x)**2+(v.y-y)**2));
    const base=near.length?near.reduce((s,v,i)=>s+v.z*weights[i],0)/weights.reduce((a,b)=>a+b,0):1.1;
    const z=base+.075+Math.sin(u*9+t*2)*.025*THREE.MathUtils.smoothstep(t,.5,1);
    positions.push(x,y,z);uv.push(col/cols,t);
    if(row<rows&&col<cols){const a=row*(cols+1)+col;indices.push(a,a+cols+2,a+1,a,a+cols+1,a+cols+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);smoothClothNormals(g);g.computeBoundingBox();
  g.userData.bib=true;g.userData.neckY=3.85;g.userData.armWeights=new Float32Array(positions.length/3);return g;
}
export function buildWearable(data: AvatarData, id: GarmentId, endY: number) {
  if(id==='ao-yem')return buildYem(data);
  const long=id!=='ao-ba-ba';
  const openHeritage=['ao-nhat-binh','ao-giao-linh','ao-tu-than'].includes(id);
  const g=createVietnameseCloth(data.shirt,long,endY,openHeritage?'none':'stand');
  const p=g.getAttribute('position'), neck=g.userData.neckY as number;
  const wide=id==='ao-tac'||id==='ao-nhat-binh'||id==='ao-giao-linh';
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),arm=(g.userData.armWeights as Float32Array)[i]||0;
    if(arm>.1) {
      // Expand around the source sleeve axis, never translate the wrist opening
      // below the hand. Hands and cloth subsequently share the same rest pose.
      const [axis,axisZ]=sleeveSection(data.shirt,x);
      const flare=wide?THREE.MathUtils.smoothstep(Math.abs(x),2.15,4.2)*(id==='ao-tac'?1.55:.9):.14;
      p.setY(i,axis+(y-axis)*(1+flare));
      p.setZ(i,axisZ+(z-axisZ)*(1+.16+flare*.32));
    }
  }
  if(id==='ao-tu-than') {
    // Tứ thân: open neck, back joined, two front flaps separated below waist
    clipFrontOpening(g,y=>y>1.35?Math.max(.14,(y-1.35)*.38):.08+.30*THREE.MathUtils.smoothstep(1.35-y,0,2),.35);
  }
  if(id==='ao-nhat-binh') {
    // Nhật Bình: cut along exact Y-band at right angle (not interpolated to V) with narrow vertical front slit
    const squareBottom = neck - 1.62;
    clipFrontOpening(g,y=>y>=squareBottom?.62:.05,.35,[squareBottom]);
  }
  if(id==='ao-giao-linh') {
    // Giao lĩnh: asymmetric diagonal overlapping lapel line
    clipFrontOpening(g,y=>.65*THREE.MathUtils.clamp((y-(neck-1.6))/1.6,0,1),.35,[neck-1.6],y=>.35*(1-THREE.MathUtils.clamp((y-(neck-1.6))/1.6,0,1)));
  }
  smoothClothNormals(g);g.computeBoundingBox();g.userData.garmentId=id;return g;
}

/** Ribbon collar, overlapping panel, and sash details anchored to top mesh surface after fitting. */
export function buildHeritageDetails(top: THREE.Mesh, id: GarmentId): THREE.Mesh[] {
  const details: THREE.Mesh[] = [];
  const neck = top.geometry.userData.neckY as number;
  top.updateMatrixWorld(true);
  const p = top.geometry.getAttribute('position');
  const ray = new THREE.Raycaster();

  function surfacePoint(x: number, y: number, fallbackZ = 1.35): THREE.Vector3 {
    const mapped=top.userData.detailPoint?.(x,y) as THREE.Vector2|undefined;
    if(mapped){x=mapped.x;y=mapped.y;}
    ray.set(new THREE.Vector3(x, y, 6), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(top, false)[0];
    if (hit) return hit.point.clone().add(new THREE.Vector3(0, 0, 0.035));
    let minDist = Infinity, bestZ = fallbackZ;
    for (let i = 0; i < p.count; i++) {
      const z = p.getZ(i);
      if (z < 0.2) continue;
      const d = (p.getX(i) - x) ** 2 + (p.getY(i) - y) ** 2;
      if (d < minDist) { minDist = d; bestZ = z; }
    }
    return new THREE.Vector3(x, y, bestZ + 0.035);
  }

  function ribbonMesh(pathPoints: THREE.Vector3[], halfWidth: number, material: THREE.Material, name: string): THREE.Mesh {
    const curve = new THREE.CatmullRomCurve3(pathPoints, false, 'centripetal');
    const samples = 36;
    const pos: number[] = [], uvs: number[] = [], indices: number[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const pt = curve.getPoint(t);
      const tangent = curve.getTangent(t).normalize();
      const normal = new THREE.Vector3(0, 0, 1);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      const left = pt.clone().addScaledVector(binormal, halfWidth);
      const right = pt.clone().addScaledVector(binormal, -halfWidth);
      // Reproject both ribbon edges instead of interpolating Z across curved bust/neck.
      const project=(v:THREE.Vector3)=>{
        ray.set(new THREE.Vector3(v.x,v.y,6),new THREE.Vector3(0,0,-1));
        const h=ray.intersectObject(top,false)[0];if(h)v.z=h.point.z+.065;
        return v;
      };
      project(left);project(right);
      pos.push(left.x, left.y, left.z, right.x, right.y, right.z);
      uvs.push(0, t, 1, t);
      if (i < samples) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        indices.push(a, b, d, a, d, c);
      }
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    const mesh = new THREE.Mesh(geom, material);
    mesh.name = name;
    mesh.userData.slot = 'top';
    return mesh;
  }

  if (id === 'ao-nhat-binh') {
    // Wide ribbon collar along square neckline + vertical slit facing down the chest
    const trimMat = new THREE.MeshPhysicalMaterial({ color: '#ba975d', roughness: 0.52, metalness: 0.12, side: THREE.DoubleSide });
    const squareBottom = neck - 1.80;
    const rightBand = [
      surfacePoint(0.79, neck - 0.4),
      surfacePoint(0.79, (neck - 0.4 + squareBottom) / 2),
      surfacePoint(0.79, squareBottom),
    ];
    const leftBand = [
      surfacePoint(-0.79, squareBottom),
      surfacePoint(-0.79, (neck - 0.4 + squareBottom) / 2),
      surfacePoint(-0.79, neck - 0.4),
    ];
    const horizBand = [
      surfacePoint(-0.79, squareBottom),
      surfacePoint(0, squareBottom),
      surfacePoint(0.79, squareBottom),
    ];
    const slitBand = [
      surfacePoint(0, squareBottom),
      surfacePoint(0, squareBottom - 1.2),
      surfacePoint(0, squareBottom - 2.4),
    ];
    details.push(
      ribbonMesh(rightBand, 0.17, trimMat, 'nhat-binh-collar-right'),
      ribbonMesh(leftBand, 0.17, trimMat, 'nhat-binh-collar-left'),
      ribbonMesh(horizBand, 0.17, trimMat, 'nhat-binh-collar-bottom'),
      ribbonMesh(slitBand, 0.045, trimMat, 'nhat-binh-front-slit')
    );
  } else if (id === 'ao-giao-linh') {
    // Overlapping front collar & inner crossing panel
    const mainColor=new THREE.Color(top.userData.fabricColor || '#547f80');
    const trimMat=new THREE.MeshPhysicalMaterial({color:mainColor.multiplyScalar(.72),roughness:.58,sheen:.3,side:THREE.DoubleSide});
    const outerLapel = [
      surfacePoint(-0.68, neck - 0.08),
      surfacePoint(-0.15, neck - 0.95),
      surfacePoint(0.35, neck - 1.6),
      surfacePoint(0.85, neck - 2.85),
      surfacePoint(1.35, neck - 3.75),
    ];
    const innerLapel = [
      surfacePoint(0.68, neck - 0.08),
      surfacePoint(0.28, neck - 0.95),
      surfacePoint(0.2, neck - 1.6),
      surfacePoint(-0.15, neck - 2.1),
    ];
    details.push(
      ribbonMesh(outerLapel, 0.19, trimMat, 'giao-linh-collar-outer'),
      ribbonMesh(innerLapel, 0.14, trimMat, 'giao-linh-collar-inner')
    );
  } else if (id === 'ao-tu-than') {
    // Tứ thân: waist sash tie + decorative front flap ribbons
    const topMat = top.material as THREE.Material;
    const sashMat = new THREE.MeshPhysicalMaterial({ color:new THREE.Color(top.userData.fabricColor || '#547f80').multiplyScalar(.65), roughness: 0.65, side: THREE.DoubleSide });
    const sashBand = [
      surfacePoint(-1.25, 1.25),
      surfacePoint(-0.6, 1.18),
      surfacePoint(0, 1.15),
      surfacePoint(0.6, 1.18),
      surfacePoint(1.25, 1.25),
    ];
    const leftTie = [
      surfacePoint(0, 1.15),
      surfacePoint(-0.15, 0.6),
      surfacePoint(-0.25, -0.2),
      surfacePoint(-0.35, -1.1),
    ];
    const rightTie = [
      surfacePoint(0, 1.15),
      surfacePoint(0.18, 0.55),
      surfacePoint(0.3, -0.25),
      surfacePoint(0.38, -1.15),
    ];
    details.push(
      ribbonMesh(sashBand, 0.075, sashMat, 'tu-than-sash'),
      ribbonMesh(leftTie, 0.045, topMat, 'tu-than-flap-tie-left'),
      ribbonMesh(rightTie, 0.045, topMat, 'tu-than-flap-tie-right')
    );
  }

  return details;
}
/** Open outerwear: connected shoulder and sleeve surface; front reveals Việt phục. */
export function buildOuterwear(data: MeshData, cropped: boolean, clearance: number, wideSleeves=false) {
  const g=createVietnameseCloth(data,false,-1),p=g.getAttribute('position'),neck=g.userData.neckY as number;
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),torso=1-THREE.MathUtils.smoothstep(Math.abs(x),1.8,2.7);
    let nextY=cropped&&y<1?1+(y-1)*.4:y,nextZ=z+Math.sign(z-.1)*clearance*torso;
    const arm=(g.userData.armWeights as Float32Array)[i]||0;
    if(arm>.1){const [axis,axisZ]=sleeveSection(data,x);const flare=wideSleeves?THREE.MathUtils.smoothstep(Math.abs(x),2.15,4.2)*1.65:.35;nextY=axis+(y-axis)*(1+flare);nextZ=axisZ+(z-axisZ)*(1+.4+flare*.32);}
    // Give generous envelope ease over torso and shoulders to encase underlayers cleanly
    p.setXYZ(i,x*(1+clearance*.28*Math.max(torso,arm*.5)),nextY,nextZ);
  }
  const lapelCurve=(y:number)=>Math.min(.65,.28+Math.max(0,y-(neck-2))*.3);
  clipFrontOpening(g,lapelCurve);
  return g;
}
/** Closed crew-neck under-layer: unlike outerwear it has no front cutout. */
export function buildInnerTee(data:MeshData) {
  const g=createVietnameseCloth(data,false,-1),p=g.getAttribute('position');
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const torso=1-THREE.MathUtils.smoothstep(Math.abs(x),1.8,2.6);
    p.setXYZ(i,x*(1-.015*torso),y,z-Math.sign(z-.1)*.045*torso);
  }
  smoothClothNormals(g);g.computeBoundingBox();return g;
}
export function buildSkirt(data: AvatarData) {
  const cols=96,rows=38,pos:number[]=[],uv:number[]=[],index:number[]=[];
  for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++) {
    const t=row/rows,a=col/cols*Math.PI*2,r=1.65+t*.9+Math.cos(a*24)*.075*t;
    pos.push(Math.cos(a)*r,.28-t*7.75,.18+Math.sin(a)*(1+t*.8));uv.push(col/cols,t);
    if(row<rows&&col<cols){const i=row*(cols+1)+col;index.push(i,i+cols+1,i+1,i+1,i+cols+1,i+cols+2);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);smoothClothNormals(g);g.computeBoundingBox();return g;
}

// Studio v3 source synchronization.

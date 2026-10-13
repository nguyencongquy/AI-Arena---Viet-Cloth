import * as THREE from 'three';
import type { MeshData } from './model';

/** Reuse the fitted shoe last, with actual open-back and sole/heel construction. */
export function buildFootwear(data:MeshData,id:string,color:string,map:THREE.Texture) {
  type V={p:THREE.Vector3;uv:THREE.Vector2};
  const floor=Math.min(...data.positions.filter((_,i)=>i%3===1));
  const group=new THREE.Group();group.name='footwear';group.userData.slot='shoes';
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  function cut(poly:V[],distance:(v:V)=>number) {
    const out:V[]=[];
    for(let i=0;i<poly.length;i++){
      const a=poly[i],b=poly[(i+1)%poly.length],da=distance(a),db=distance(b);
      if(da>=0)out.push(a);
      if((da<0)!==(db<0)){const t=da/(da-db);out.push({p:a.p.clone().lerp(b.p,t),uv:a.uv.clone().lerp(b.uv,t)});}
    }
    return out;
  }
  function emit(poly:V[]){for(let j=1;j+1<poly.length;j++)for(const v of [poly[0],poly[j],poly[j+1]]){indices.push(positions.length/3);positions.push(v.p.x,v.p.y+(id==='block-heels'?.3:0),v.p.z);uvs.push(v.uv.x,v.uv.y);}}
  for(let i=0;i<data.index.length;i+=3){
    const tri=data.index.slice(i,i+3).map(k=>({p:new THREE.Vector3(...data.positions.slice(k*3,k*3+3) as [number,number,number]),uv:new THREE.Vector2(...data.uvs.slice(k*2,k*2+2) as [number,number])}));
    if(id==='mules'){
      emit(cut(tri,v=>floor+.14-v.p.y));
      emit(cut(cut(cut(tri,v=>v.p.y-floor-.14),v=>floor+.65-v.p.y),v=>v.p.z-.78));
    }else emit(tri);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();
  const upper=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:id==='sneakers'?null:map,color,roughness:id==='sneakers'?.88:.65,side:THREE.DoubleSide}));upper.name='shoe-upper';group.add(upper);
  const trim=new THREE.MeshStandardMaterial({color:id==='sneakers'?'#dfddd4':color,roughness:.82});
  const ray=new THREE.Raycaster();upper.updateMatrixWorld(true);
  function surface(x:number,z:number){ray.set(new THREE.Vector3(x,0,z),new THREE.Vector3(0,-1,0));return ray.intersectObject(upper,false)[0]?.point.y??floor+.3;}
  for(const side of [-1,1]){
    const foot=data.positions.filter((_,i)=>i%3===0&&Math.sign(data.positions[i])===side);
    const x=(Math.min(...foot)+Math.max(...foot))/2;
    const shape=new THREE.Shape();shape.moveTo(-.34,-.94);shape.quadraticCurveTo(-.46,-.9,-.45,-.5);shape.lineTo(-.43,.67);shape.quadraticCurveTo(-.4,1.08,0,1.1);shape.quadraticCurveTo(.4,1.08,.43,.67);shape.lineTo(.45,-.5);shape.quadraticCurveTo(.46,-.9,.34,-.94);shape.closePath();
    if(id==='sneakers'||id==='mules'){
      const sole=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:id==='sneakers'?.15:.08,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1}),trim);
      sole.rotation.x=Math.PI/2;sole.position.set(x,floor+.13,.82);sole.name='shoe-sole';group.add(sole);
    }
    if(id==='block-heels'){
      const heel=new THREE.Mesh(new THREE.BoxGeometry(.5,.32,.48),trim);heel.position.set(x,floor+.14,.08);heel.name='block-heel';group.add(heel);
      const toe=new THREE.Mesh(new THREE.BoxGeometry(.7,.31,.7),trim);toe.position.set(x,floor+.14,1.38);toe.name='forefoot-platform';group.add(toe);
    }
    if(id==='sneakers'||id==='loafers')for(let row=0;row<(id==='sneakers'?3:1);row++){
      const z=1.03+row*.15,points=[-.28,0,.28].map(dx=>new THREE.Vector3(x+dx,surface(x+dx,z)+.025,z));
      const detail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,id==='sneakers'?.025:.06,6,false),trim);detail.name=id==='sneakers'?'shoe-lace':'loafer-band';group.add(detail);
    }
  }
  group.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;o.userData.slot='shoes';}});
  return group;
}

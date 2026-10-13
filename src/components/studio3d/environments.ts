import * as THREE from 'three';
import type { SceneId } from './catalog';

/** Original stylized sets. Not photographs or digital twins of actual landmarks. */
export function buildEnvironment(id:SceneId, night:boolean) {
  const root=new THREE.Group();root.name='studio-environment';
  const stone=new THREE.MeshStandardMaterial({color:night?'#9a9a9b':'#ded8ca',roughness:.96});
  const pale=new THREE.MeshStandardMaterial({color:night?'#aaa7a3':'#e9e1d2',roughness:.92});
  const dark=new THREE.MeshStandardMaterial({color:'#56645c',roughness:.94});
  const clay=new THREE.MeshStandardMaterial({color:'#b88e72',roughness:.9});
  function block(w:number,h:number,d:number,x:number,y:number,z:number,m:THREE.Material) {
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.receiveShadow=true;mesh.castShadow=true;root.add(mesh);return mesh;
  }
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(32,32),stone);floor.rotation.x=-Math.PI/2;floor.position.y=-.012;floor.receiveShadow=true;root.add(floor);
  if(id==='atelier') {
    block(18,6,.15,0,2.5,-4,pale);
    for(let i=0;i<9;i++)block(.055,4,.065,-3.3+i*.13,1.95,-3.55,clay);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,.012,8,128),clay);ring.position.set(2.8,2.15,-3.84);root.add(ring);
  } else if(id==='gallery') {
    block(15,6,.15,0,2.5,-3.7,pale);
    block(.55,3.7,.7,-2.8,1.83,-2.9,stone);block(.55,3.7,.7,3.2,1.83,-2.9,stone);
    block(1.15,1.6,.05,-1.75,1.8,-3.5,dark);
    block(.55,.45,.08,-1.88,2.04,-3.43,clay);block(.6,.6,.08,-1.55,1.62,-3.43,pale);
    block(1.1,.08,.28,1.9,.62,-2.7,clay);
  } else if(id==='courtyard') {
    block(18,4.5,.2,0,2,-4,pale);
    for(const x of [-3.2,3.2]) {
      block(1.2,2.5,.08,x,1.23,-3.85,dark);
      block(1.34,.07,.15,x,2.5,-3.7,clay);
      for(let i=0;i<12;i++)block(.07,2.4,.13,x-.52+i*.095,1.2,-3.7,clay);
    }
    block(.7,.5,.65,2,.24,-1.8,clay);
    plant(2,-1.8,1.15);
    block(1.6,.065,.5,-2.4,.5,-1.8,clay);
  } else {
    // Central pedestrian axis; modern towers coexist with low façades and trees.
    for(const side of [-1,1])for(let i=0;i<6;i++) {
      const h=2.7+(i%3)*.75,z=-3.8-i*1.8,x=side*(3.25+i*.08);
      block(1.4,h,1.3,x,h/2,z,i%2?pale:stone);
      for(let row=0;row<Math.floor(h/.45);row++)for(let col=0;col<3;col++)block(.18,.23,.012,x+(col-1)*.32,.3+row*.45,z+.66,dark);
      if(i%2===0)plant(side*2.1,z+1.1,1.5);
    }
    for(let i=0;i<12;i++)block(5,.003,.025,0,.0,-1-i*.9,pale);
  }
  function plant(x:number,z:number,height:number) {
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.035,.055,height,10),clay);trunk.position.set(x,height/2,z);root.add(trunk);
    for(let i=0;i<5;i++) {
      const foliage=new THREE.Mesh(new THREE.IcosahedronGeometry(.38,2),dark);foliage.scale.set(1.1,.7,1);
      foliage.position.set(x+Math.sin(i*2.4)*.22,height-.05+i*.09,z+Math.cos(i*2.4)*.18);root.add(foliage);
    }
  }
  // Keep architecture outside the full orbit radius, including rear and side views.
  for(const object of root.children)if(object!==floor)object.position.z-=2.8;
  return {root,dispose(){root.traverse(o=>{if(o instanceof THREE.Mesh)o.geometry.dispose();});[stone,pale,dark,clay].forEach(m=>m.dispose());}};
}

// Studio v3 source synchronization.

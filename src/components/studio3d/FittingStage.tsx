import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { StudioLook, buildAvatar, animateCloth, DressedAvatar } from './model';
import { buildEnvironment } from './environments';
import type { WardrobeSlot } from './catalog';

export interface StageHandle { view: (angle: number) => void; closeUp: () => void; exportImage: () => void }
export const FittingStage = forwardRef<StageHandle, { look: StudioLook; wind: boolean; onSelectSlot?: (slot: WardrobeSlot) => void }>(function FittingStage({look,wind,onSelectSlot},ref) {
  const mount=useRef<HTMLDivElement>(null), engine=useRef<{renderer:THREE.WebGLRenderer;scene:THREE.Scene;camera:THREE.PerspectiveCamera;controls:OrbitControls;key:THREE.DirectionalLight;fill:THREE.DirectionalLight}|null>(null);
  const avatar=useRef<DressedAvatar|null>(null), windRef=useRef(wind), [status,setStatus]=useState('Đang chuẩn bị người mẫu…'), [error,setError]=useState(false);
  const lookRef=useRef(look);lookRef.current=look;windRef.current=wind;
  const selectionRef=useRef(onSelectSlot);selectionRef.current=onSelectSlot;
  const [exportedImage,setExportedImage]=useState<string|null>(null);
  const lookKey=JSON.stringify({...look,time:undefined,scene:undefined});
  const [renderedKey,setRenderedKey]=useState('');
  useImperativeHandle(ref,()=>({
    view(angle) { const e=engine.current;if(!e)return;const distance=4.05,center=lookRef.current.measures.height/200;e.controls.target.set(0,center,0);e.camera.position.set(Math.sin(angle)*distance,center+.14,Math.cos(angle)*distance);e.controls.update(); },
    closeUp() { const e=engine.current;if(!e)return;e.controls.target.set(0,lookRef.current.measures.height/100-.16,.02);e.camera.position.set(0,lookRef.current.measures.height/100-.15,.82);e.controls.update(); },
    exportImage() { const e=engine.current;if(!e||!avatar.current||status)return;e.renderer.render(e.scene,e.camera);
      const source=e.renderer.domElement,ratio=e.renderer.getPixelRatio(),output=document.createElement('canvas');output.width=source.width;output.height=source.height+84*ratio;
      const ctx=output.getContext('2d')!;ctx.fillStyle=lookRef.current.time==='day'?'#f8f5ee':'#e6e5e7';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(source,0,0);
      ctx.textAlign='center';ctx.fillStyle='#24403f';ctx.font=`${28*ratio}px "Cormorant Garamond", Georgia, serif`;
      const names:Record<string,string>={'ao-ba-ba':'Áo bà ba','ao-ngu-than':'Áo ngũ thân','ao-yem':'Áo yếm','ao-tac':'Áo tấc','ao-tu-than':'Áo tứ thân','ao-giao-linh':'Áo giao lĩnh','ao-nhat-binh':'Áo Nhật Bình'};
      ctx.fillText(names[lookRef.current.top],output.width/2,source.height+36*ratio);
      ctx.font=`${10*ratio}px Outfit, sans-serif`;ctx.fillText('V-Styler · Bản thử phối đồ 3D',output.width/2,source.height+60*ratio);
      setExportedImage(output.toDataURL('image/png')); },
  }),[status]);
  useEffect(()=>{
    if(!mount.current)return;
    const host=mount.current, scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(29,1,.01,30);
    let renderer:THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true}); }
    catch {setError(true);setStatus('Trình duyệt không mở được WebGL. Hãy bật tăng tốc phần cứng.');return;}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;
    host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Người mẫu 3D mặc trang phục; kéo để xoay 360 độ');
    camera.position.set(.3,.98,4.05);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.84,0);controls.enableDamping=true;
    controls.enablePan=false;controls.minDistance=.65;controls.maxDistance=4.5;controls.minPolarAngle=Math.PI*.25;controls.maxPolarAngle=Math.PI*.65;
    const environment=new RoomEnvironment(), pmrem=new THREE.PMREMGenerator(renderer), env=pmrem.fromScene(environment,.04);
    scene.environment=env.texture;scene.environmentIntensity=.6;
    const key=new THREE.DirectionalLight('#fff1dc',1.45);key.position.set(-2.5,4,3);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-1.6;key.shadow.camera.right=1.6;key.shadow.camera.top=2.6;key.shadow.camera.bottom=-1;
    key.shadow.bias=-.0002;key.shadow.normalBias=.015;scene.add(key);
    const fill=new THREE.DirectionalLight('#d8e7e9',.75);fill.position.set(3,2,-2);scene.add(fill);
    const floor=new THREE.Mesh(new THREE.CircleGeometry(2,96),new THREE.ShadowMaterial({opacity:.065}));floor.rotation.x=-Math.PI/2;floor.position.y=.001;floor.receiveShadow=true;scene.add(floor);
    engine.current={renderer,scene,camera,controls,key,fill};
    const pointer=new THREE.Vector2(),ray=new THREE.Raycaster();let down=[0,0];
    const pointerDown=(event:PointerEvent)=>{down=[event.clientX,event.clientY];};
    const pointerUp=(event:PointerEvent)=>{
      if(event.button!==0||Math.hypot(event.clientX-down[0],event.clientY-down[1])>5||!avatar.current)return;
      const box=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-box.left)/box.width*2-1,-(event.clientY-box.top)/box.height*2+1);ray.setFromCamera(pointer,camera);
      for(const hit of ray.intersectObject(avatar.current.root,true)) {
        let obj:THREE.Object3D|null=hit.object;
        while(obj&&!obj.userData.slot)obj=obj.parent;
        const slot=obj?.userData.slot;
        if(['top','outer','under','bottom','shoes','glasses','bag'].includes(slot)){selectionRef.current?.(slot);break;}
      }
    };
    renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);
    const resize=()=>{const {width,height}=host.getBoundingClientRect();if(width<1||height<1)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();};
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');let frame=0;
    const render=(ms:number)=>{frame=requestAnimationFrame(render);if(document.hidden)return;controls.update();
      avatar.current?.cloth.forEach(cloth=>animateCloth(cloth,ms/1000,windRef.current&&!reduced.matches));renderer.render(scene,camera);};
    frame=requestAnimationFrame(render);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();avatar.current?.dispose();avatar.current=null;
      renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);
      floor.geometry.dispose();(floor.material as THREE.Material).dispose();env.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();engine.current=null;};
  },[]);
  useEffect(()=>{
    const e=engine.current;if(!e)return;
    const close=e.camera.position.distanceTo(e.controls.target)<1.4;
    const targetY=close?look.measures.height/100-.16:look.measures.height/200;
    e.camera.position.y+=targetY-e.controls.target.y;
    e.controls.target.y=targetY;e.controls.update();
  },[look.measures.height]);
  useEffect(()=>{
    let cancelled=false;const e=engine.current;if(!e)return;
    setError(false);setStatus('Đang mặc trang phục…');
    buildAvatar(look).then(next=>{
      if(cancelled||!engine.current){next.dispose();return;}
      const previous=avatar.current;if(previous){e.scene.remove(previous.root);previous.dispose();}
      e.scene.add(next.root);avatar.current=next;setRenderedKey(lookKey);setStatus('');
    }).catch(error=>{if(!cancelled){console.error('Studio avatar build failed',error);setError(true);setStatus('Không tải được tài nguyên 3D. Kiểm tra kết nối rồi thử lại.');}});
    return()=>{cancelled=true;};
  },[look.gender,look.top,look.topColor,look.bottom,look.bottomColor,look.outer,look.outerColor,look.under,look.underColor,look.shoes,look.shoesColor,look.glasses,look.glassesColor,look.bag,look.bagColor,look.measures]);
  useEffect(()=>{
    const e=engine.current;if(!e)return;
    const set=buildEnvironment(look.scene,look.time==='night');e.scene.add(set.root);
    e.scene.background=new THREE.Color(look.time==='day'?'#eee8db':'#313c42');
    return()=>{e.scene.remove(set.root);set.dispose();};
  },[look.scene,look.time]);
  useEffect(()=>{
    const e=engine.current;if(!e)return;
    e.key.color.set(look.time==='day'?'#fff1dc':'#e9dcff');e.key.intensity=look.time==='day'?1.45:1.15;
    e.fill.color.set(look.time==='day'?'#d8e7e9':'#aec6ef');e.fill.intensity=look.time==='day'?.75:.6;
  },[look.time]);
  return <div className="fitting-stage" data-model={look.gender} data-top={look.top||'base'} data-ready={!status&&renderedKey===lookKey} data-look={JSON.stringify(look)}>
    <div ref={mount} className="fitting-stage__canvas" />
    {status&&<div className={`fitting-stage__status${error?' is-error':''}`} role={error?'alert':'status'}>{status}</div>}
    {exportedImage&&<div className="studio-export-backdrop" onClick={()=>setExportedImage(null)}>
      <div className="studio-export-preview" role="dialog" aria-modal="true" aria-label="Ảnh bộ phối" onClick={event=>event.stopPropagation()} onKeyDown={event=>{
        if(event.key==='Escape')setExportedImage(null);
        if(event.key==='Tab'){
          const controls=event.currentTarget.querySelectorAll<HTMLElement>('button,a');
          const first=controls[0],last=controls[controls.length-1];
          if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
          else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
        }
      }}>
        <button autoFocus onClick={()=>setExportedImage(null)} aria-label="Đóng ảnh bộ phối">×</button>
        <img src={exportedImage} alt="Ảnh bộ phối Việt phục vừa xuất"/>
        <a href={exportedImage} download="v-styler-look.png">Tải PNG</a>
        <p>Có thể mở hoặc lưu ảnh nếu trình duyệt không hỗ trợ tải trực tiếp.</p>
      </div>
    </div>}
  </div>;
});

// Studio v3 source synchronization.

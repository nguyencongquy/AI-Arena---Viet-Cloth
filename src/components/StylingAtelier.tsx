import React, { useEffect, useRef, useState } from 'react';
import { ArrowDownToLine, Bookmark, Check, ChevronRight, Layers, Moon, RotateCcw, Ruler, Shirt, Sun, Wind, X } from 'lucide-react';
import type { GarmentSpecimen } from '../types';
import { GARMENT_ARCHIVE } from '../data/garments';
import { FittingStage, type StageHandle } from './studio3d/FittingStage';
import { DEFAULT_BODY, MEASURE_LIMITS, clampMeasures, defaultLook, readLook, type BodyMeasures, type StudioLook } from './studio3d/model';
import { FEMALE_FORMS, GARMENT_IDS, SCENES, SLOT_NAMES, STYLES, WARDROBE, recommendedLayers, type GarmentId, type StyleId, type WardrobeItem, type WardrobeSlot } from './studio3d/catalog';
import './studio3d/studio.css';
import './studio3d/fusion-studio.css';

interface Props {preselectedGarmentId?:string;preselectedFabricColor?:string|null;onInspectGarment:(garment:GarmentSpecimen)=>void;savedLooks:string[];onToggleSaveLook:(id:string)=>void}
const SWATCHES=['#315c57','#e7ddca','#2c3f4c','#78433f','#bb9c62','#6f765f','#35333a','#c9a5a0'];
const MEASURE_NAMES:Record<keyof BodyMeasures,string>={height:'Chiều cao',shoulder:'Vai',chest:'Ngực',waist:'Eo',hip:'Hông'};
const COLOR_KEYS:Record<WardrobeSlot,keyof StudioLook>={top:'topColor',outer:'outerColor',under:'underColor',bottom:'bottomColor',shoes:'shoesColor',glasses:'glassesColor',bag:'bagColor'};
const STORAGE='v-styler-fusion-look-v3';
const SLOTS:WardrobeSlot[]=['top','under','outer','bottom','shoes','glasses','bag'];

/** Catalog illustrations are separate from the actual 3D garment surface. */
function ItemArt({item,color}:{item:WardrobeItem;color?:string}) {
  const c=color||item.color;
  return <svg viewBox="0 0 100 110" aria-hidden="true" className="fusion-item-art"><g fill={c} stroke="#56665d" strokeWidth=".65" strokeLinejoin="round">
    {item.slot==='bottom'&&(item.shape==='skirt'?<><path d="M31 17h38l16 75H15z"/>{[25,35,45,55,65,75].map(x=><path key={x} d={`M${50+(x-50)*.6} 20L${x} 90`} fill="none" stroke="#ffffff55"/>)}</>:<><path d="M28 17h44l6 76H55l-5-48-5 48H22z"/><path d="M31 25h38M50 27v18" fill="none"/>{item.id==='cargo'&&<path d="M24 54h15v20H24zM61 54h15v20H61z"/>}</>)}
    {(item.slot==='outer'||item.slot==='under')&&<><path d="M33 19l12-6h10l12 6 19 18-10 12-10-9v51H34V40l-10 9-10-12z"/>{item.slot==='outer'?<><path d="M45 14l-7 29 12-10 12 10-7-29M50 33v58" fill="none" stroke="#ede7db"/><path d="M37 69h9M55 69h9" fill="none"/></>:<path d="M44 14q6 12 12 0" fill="none"/>}</>}
    {item.slot==='shoes'&&<><path d="M17 51q16 9 24-6l8 18q7 8 23 10l12 7v10H15l-3-11z"/><path d="M15 83h69" stroke="#efe8d8" fill="none"/>{item.id==='sneakers'&&<path d="M42 63l13 2m-10 3 15 2m-12 3 16 2" stroke="#fff9eb"/>}{item.id==='block-heels'&&<path d="M17 89v11h10V89"/>}</>}
    {item.slot==='glasses'&&<><rect x="14" y="44" width="29" height="22" rx={item.id==='thin-glasses'?10:4}/><rect x="57" y="44" width="29" height="22" rx={item.id==='thin-glasses'?10:4}/><path d="M43 51q7-5 14 0M14 49l-6-5M86 49l6-5" fill="none"/>{item.id==='thin-glasses'&&<><rect x="17" y="47" width="23" height="16" rx="8" fill="#e9eee875"/><rect x="60" y="47" width="23" height="16" rx="8" fill="#e9eee875"/></>}</>}
    {item.slot==='bag'&&<><path d="M26 42h48l4 50H22z"/><path d="M36 44V30q14-20 28 0v14" fill="none" strokeWidth="3"/>{item.id==='crossbody'&&<path d="M24 45q-5-51 32-27l20 32" fill="none" strokeWidth="3"/>}<path d="M28 79h44" fill="none" stroke="#f1e9d877"/></>}
  </g></svg>;
}

export const StudioSection:React.FC<Props>=({preselectedGarmentId,preselectedFabricColor,onInspectGarment,savedLooks,onToggleSaveLook})=>{
  const requested=GARMENT_IDS.includes(preselectedGarmentId as GarmentId)?preselectedGarmentId as GarmentId:'ao-ngu-than';
  const [look,setLook]=useState(()=>defaultLook(requested,preselectedFabricColor));
  const [category,setCategory]=useState<WardrobeSlot>('bottom'),[editing,setEditing]=useState<WardrobeSlot>('top');
  const [wind,setWind]=useState(true),[measureOpen,setMeasureOpen]=useState(false),[notice,setNotice]=useState(''),[style,setStyle]=useState<StyleId|null>(null);
  const stage=useRef<StageHandle>(null),timer=useRef<number>();
  useEffect(()=>{setLook(defaultLook(requested,preselectedFabricColor));setEditing('top');setStyle(null);},[preselectedGarmentId,preselectedFabricColor]);
  useEffect(()=>()=>window.clearTimeout(timer.current),[]);
  const patch=(next:Partial<StudioLook>)=>{setLook(p=>({...p,...next}));setStyle(null);};
  function notify(text:string){setNotice(text);window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>setNotice(''),3200);}
  const garment=GARMENT_ARCHIVE.find(g=>g.id===look.top);
  const currentItem=editing==='top'?null:WARDROBE.find(i=>i.slot===editing&&i.id===look[editing]);
  const editingName=editing==='top'?garment?.name||'Việt phục':currentItem?.name||SLOT_NAMES[editing];
  const selectedColor=look[COLOR_KEYS[editing]] as string;
  const lookId=`fusion-${JSON.stringify(look)}`;
  function chooseItem(item:WardrobeItem){patch({[item.slot]:item.id,[COLOR_KEYS[item.slot]]:item.color} as Partial<StudioLook>);setEditing(item.slot);}
  function chooseTop(top:GarmentId){const gender=FEMALE_FORMS.includes(top)?'female':look.gender;patch({top,gender,measures:gender===look.gender?look.measures:{...DEFAULT_BODY[gender]},under:['ao-tu-than','ao-nhat-binh'].includes(top)?'under-yem':null});setEditing('top');}
  function remove(slot:WardrobeSlot){if(slot==='top'||slot==='bottom'||slot==='shoes')return;if(slot==='under'&&['ao-tu-than','ao-nhat-binh'].includes(look.top))return notify('Giữ lớp trong cho phom áo mở.');patch({[slot]:null});setEditing('top');}
  function applyStyle(id:StyleId){const next=recommendedLayers(look.top,id,look.gender,look.topColor);setLook(p=>({...p,...next}));setStyle(id);setEditing('top');}
  function save(){try{localStorage.setItem(STORAGE,JSON.stringify(look));if(!savedLooks.includes(lookId))onToggleSaveLook(lookId);notify('Đã lưu bộ phối trên trình duyệt này.');}catch{notify('Trình duyệt không cho phép lưu.');}}
  function restore(){try{const saved=readLook(JSON.parse(localStorage.getItem(STORAGE)||'null'));if(!saved)return notify('Chưa có bộ phối hợp lệ.');setLook(saved);setEditing('top');setStyle(null);notify('Đã mở bộ phối.');}catch{notify('Không đọc được bộ phối.');}}
  return <section className={`fusion-studio ${look.time==='night'?'is-night':''}`} aria-label="Styling Studio 3D">
    <header className="fusion-heading"><div><span>V-STYLER / STYLING STUDIO</span><h1>Nếp xưa. <em>Gu của bạn.</em></h1></div><div className="fusion-gender" aria-label="Người mẫu">{(['female','male'] as const).map(g=><button key={g} aria-pressed={look.gender===g} disabled={g==='male'&&FEMALE_FORMS.includes(look.top)} title={g==='male'&&FEMALE_FORMS.includes(look.top)?'Phom này đang có mẫu nữ':undefined} onClick={()=>{patch({gender:g,measures:{...DEFAULT_BODY[g]}});stage.current?.view(0);}}>{g==='female'?'Nữ':'Nam'}</button>)}</div><button className="fusion-save" onClick={save} aria-label="Lưu bộ phối"><Bookmark size={16} fill={savedLooks.includes(lookId)?'currentColor':'none'}/>Lưu</button></header>
    <div className="fusion-workspace">
      <aside className="fusion-closet" aria-label="Tủ đồ theo nhóm">
        <button className="fusion-main-piece" onClick={()=>{setEditing('top');setCategory('top');}}><img src={`/garment-motion/artwork/${look.top}.png`} alt=""/><span><small>VIỆT PHỤC CHỦ ĐẠO</small><strong>{garment?.name}</strong></span><ChevronRight size={17}/></button>
        <div className="fusion-closet-label"><h2>Tủ đồ</h2><Layers size={16}/></div>
        <div className="fusion-categories" role="group" aria-label="Nhóm trang phục">{(['bottom','outer','under','shoes','glasses','bag'] as WardrobeSlot[]).map(slot=><button key={slot} aria-pressed={category===slot} onClick={()=>setCategory(slot)}>{SLOT_NAMES[slot]}</button>)}</div>
        <div className="fusion-product-grid">{category==='top'?GARMENT_IDS.map(id=><button key={id} className="fusion-product" aria-pressed={look.top===id} onClick={()=>chooseTop(id)}><img src={`/garment-motion/artwork/${id}.png`} alt=""/><span>{GARMENT_ARCHIVE.find(g=>g.id===id)?.name}</span>{look.top===id&&<Check size={13}/>}</button>):WARDROBE.filter(i=>i.slot===category).map(item=><button key={item.id} className="fusion-product" aria-pressed={look[item.slot]===item.id} onClick={()=>chooseItem(item)}><ItemArt item={item}/><span>{item.name}</span>{look[item.slot]===item.id&&<Check size={13}/>}</button>)}</div>
        <div className="fusion-look-label"><h2>Một sắc thái khác</h2><small>GỢI Ý PHỐI</small></div><div className="fusion-style-grid">{STYLES.map(s=><button key={s.id} aria-pressed={style===s.id} onClick={()=>applyStyle(s.id)}><span className="fusion-mini-palette">{s.colors.map(c=><i key={c} style={{background:c}}/>)}</span>{s.name}</button>)}</div>
      </aside>
      <div className="fusion-stage">
        <div className="fusion-stage-tools"><div><button aria-label="Xem mặt trước" onClick={()=>stage.current?.view(0)}><RotateCcw size={16}/></button><button aria-label="Xem góc 45 độ" onClick={()=>stage.current?.view(Math.PI/4)}>¾</button><button aria-label="Xem mặt sau" onClick={()=>stage.current?.view(Math.PI)}>180°</button><button aria-label="Cận mặt người mẫu" onClick={()=>stage.current?.closeUp()}>＋</button></div><div><button aria-label="Ban ngày" aria-pressed={look.time==='day'} onClick={()=>patch({time:'day'})}><Sun size={17}/></button><button aria-label="Buổi tối" aria-pressed={look.time==='night'} onClick={()=>patch({time:'night'})}><Moon size={17}/></button><button aria-label="Gió nhẹ" aria-pressed={wind} onClick={()=>setWind(!wind)}><Wind size={17}/></button></div></div>
        <FittingStage ref={stage} look={look} wind={wind} onSelectSlot={setEditing}/><div className="fusion-stage-caption"><span>HERITAGE / REMIX</span><h2>{garment?.name}</h2><p>Kéo để xoay · Chạm món để chỉnh</p></div>
        <div className="fusion-scenes" aria-label="Bối cảnh">{SCENES.map(s=><button key={s.id} aria-pressed={look.scene===s.id} title={s.detail} onClick={()=>patch({scene:s.id})}><i className={`fusion-scene-art scene-${s.id}`}/><span>{s.name}</span></button>)}</div>
      </div>
      <aside className="fusion-editor" aria-label="Chỉnh món đang chọn">
        <div className="fusion-editor-label"><small>ĐANG CHỈNH</small><span>{SLOT_NAMES[editing]}</span></div><div className="fusion-editor-item">{editing==='top'?<img src={`/garment-motion/artwork/${look.top}.png`} alt=""/>:currentItem?<ItemArt item={currentItem} color={selectedColor}/>:<Shirt size={45}/>}<h2>{editingName}</h2></div>
        <div className="fusion-worn" aria-label="Món đang mặc">{SLOTS.filter(slot=>slot==='top'||Boolean(look[slot])).map(slot=><button key={slot} aria-pressed={editing===slot} onClick={()=>setEditing(slot)} title={slot==='top'?garment?.name:WARDROBE.find(i=>i.id===look[slot])?.name}><i style={{background:look[COLOR_KEYS[slot]] as string}}/>{SLOT_NAMES[slot]}</button>)}</div>
        <div className="studio-color-orbit fusion-color" style={{'--fabric':selectedColor} as React.CSSProperties}><input type="color" aria-label={`Màu ${editingName}`} value={selectedColor} disabled={editing!=='top'&&!currentItem} onChange={e=>patch({[COLOR_KEYS[editing]]:e.target.value})}/><span>Sắc riêng</span></div>
        <div className="fusion-swatches">{SWATCHES.map(c=><button key={c} style={{background:c}} aria-label={`Chọn màu ${c}`} aria-pressed={c===selectedColor} disabled={editing!=='top'&&!currentItem} onClick={()=>patch({[COLOR_KEYS[editing]]:c})}/>)}</div>
        <div className="fusion-item-actions"><button onClick={()=>setCategory(editing)}>Thay món <ChevronRight size={14}/></button>{!['top','bottom','shoes'].includes(editing)&&currentItem&&<button onClick={()=>remove(editing)}><X size={14}/>Tháo</button>}</div>
        <button className="fusion-measure" aria-expanded={measureOpen} onClick={()=>setMeasureOpen(!measureOpen)}><Ruler size={15}/>Dáng người<span>{look.measures.height} cm</span></button>
        {measureOpen&&<div className="studio-measures">{Object.entries(MEASURE_LIMITS).map(([key,[min,max]])=><label key={key}><span>{MEASURE_NAMES[key as keyof BodyMeasures]}<output>{look.measures[key as keyof BodyMeasures]} cm</output></span><input type="range" aria-label={MEASURE_NAMES[key as keyof BodyMeasures]} min={min} max={max} value={look.measures[key as keyof BodyMeasures]} onChange={e=>patch({measures:clampMeasures({...look.measures,[key]:Number(e.target.value)})})}/></label>)}<p>Mô phỏng tỷ lệ, không phải số đo may đã kiểm chứng.</p><button onClick={()=>patch({measures:{...DEFAULT_BODY[look.gender]}})}>Đặt lại</button></div>}
        <div className="fusion-secondary-actions"><button onClick={()=>stage.current?.exportImage()}><ArrowDownToLine size={16}/>Xuất ảnh</button><button onClick={restore}>Mở bộ lưu</button></div><button className="fusion-history" onClick={()=>{if(garment)onInspectGarment(garment);}}>Tư liệu Việt phục ↗</button>
      </aside>
    </div><footer className="fusion-footnote">Việt phục trong nhịp sống đương đại.</footer>{notice&&<div className="studio-toast" role="status">{notice}</div>}
  </section>;
};

// Studio v3 source synchronization.

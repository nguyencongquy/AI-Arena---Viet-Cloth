/** Catalog IDs are the contract between wardrobe, recommendations and renderer. */
export type GarmentId = 'ao-ngu-than' | 'ao-tac' | 'ao-nhat-binh' | 'ao-yem' | 'ao-tu-than' | 'ao-giao-linh' | 'ao-ba-ba';
export type WardrobeSlot = 'top' | 'outer' | 'under' | 'bottom' | 'shoes' | 'glasses' | 'bag';
export type SceneId = 'atelier' | 'gallery' | 'boulevard' | 'courtyard';
export type StyleId = 'minimal' | 'street' | 'creative' | 'evening';
export interface WardrobeItem { id: string; name: string; slot: WardrobeSlot; color: string; shape: string; }
export const SLOT_NAMES: Record<WardrobeSlot, string> = {top:'Việt phục',outer:'Áo khoác',under:'Lớp trong',bottom:'Quần & váy',shoes:'Giày',glasses:'Kính',bag:'Túi'};
export const GARMENT_IDS: GarmentId[] = ['ao-ngu-than','ao-tac','ao-nhat-binh','ao-yem','ao-tu-than','ao-giao-linh','ao-ba-ba'];
export const FEMALE_FORMS: GarmentId[] = ['ao-yem','ao-tu-than','ao-nhat-binh'];
export const WARDROBE: WardrobeItem[] = [
  {id:'blazer',name:'Blazer mở',slot:'outer',color:'#34343c',shape:'blazer'},
  {id:'linen-jacket',name:'Khoác linen',slot:'outer',color:'#b7ac92',shape:'blazer'},
  {id:'cropped-jacket',name:'Khoác lửng',slot:'outer',color:'#496074',shape:'blazer'},
  {id:'tee',name:'Áo thun',slot:'under',color:'#e7dfcf',shape:'tee'},
  {id:'under-yem',name:'Yếm lót',slot:'under',color:'#d6ada4',shape:'yem'},
  {id:'silk',name:'Quần lụa',slot:'bottom',color:'#dbcfb4',shape:'trousers'},
  {id:'tailored',name:'Quần âu rộng',slot:'bottom',color:'#31333a',shape:'trousers'},
  {id:'denim',name:'Denim suông',slot:'bottom',color:'#48677a',shape:'trousers'},
  {id:'cargo',name:'Cargo rộng',slot:'bottom',color:'#65705c',shape:'trousers'},
  {id:'pleated-skirt',name:'Váy xếp ly',slot:'bottom',color:'#d5c8af',shape:'skirt'},
  {id:'loafers',name:'Loafer',slot:'shoes',color:'#332c29',shape:'shoe'},
  {id:'sneakers',name:'Sneaker',slot:'shoes',color:'#e5ded0',shape:'shoe'},
  {id:'mules',name:'Mule',slot:'shoes',color:'#393236',shape:'shoe'},
  {id:'block-heels',name:'Giày gót vuông',slot:'shoes',color:'#27262a',shape:'shoe'},
  {id:'sunglasses',name:'Kính đen',slot:'glasses',color:'#25252b',shape:'glasses'},
  {id:'thin-glasses',name:'Gọng mảnh',slot:'glasses',color:'#a18d61',shape:'glasses'},
  {id:'tote',name:'Tote',slot:'bag',color:'#363335',shape:'bag'},
  {id:'mini-bag',name:'Túi nhỏ',slot:'bag',color:'#825443',shape:'bag'},
  {id:'crossbody',name:'Đeo chéo',slot:'bag',color:'#b4a58c',shape:'bag'},
];
export const SCENES: {id:SceneId;name:string;detail:string}[] = [
  {id:'atelier',name:'Atelier',detail:'Ánh sáng mềm'},
  {id:'gallery',name:'Gallery',detail:'Bê tông & nghệ thuật'},
  {id:'boulevard',name:'Phố đương đại',detail:'Lấy cảm hứng từ Nguyễn Huệ'},
  {id:'courtyard',name:'Hiên phố',detail:'Gạch, cây & phố Sài Gòn'},
];
export const STYLES: {id:StyleId;name:string;colors:string[]}[] = [
  {id:'minimal',name:'Minimal',colors:['#476b69','#e1d6bd','#393b39']},
  {id:'street',name:'Street',colors:['#c3b99c','#3c5466','#27292e']},
  {id:'creative',name:'Creative',colors:['#8b4545','#bea07a','#34333e']},
  {id:'evening',name:'Evening',colors:['#273f47','#3b353d','#b5a079']},
];
export function itemInSlot(slot: WardrobeSlot, id: unknown): WardrobeItem | undefined {
  return WARDROBE.find(item=>item.slot===slot && item.id===id);
}
export const LONG_FORMS: GarmentId[] = ['ao-ngu-than','ao-tac','ao-nhat-binh','ao-tu-than','ao-giao-linh'];
/** Curated contemporary combinations. The selected heritage garment remains the anchor. */
type LayerChoice = { under: string | null; outer: string | null; bottom: 'silk' | 'tailored' | 'denim' | 'cargo' | 'pleated-skirt'; shoes: string; glasses: string | null; bag: string | null };
const combinations: Record<GarmentId, Record<StyleId, LayerChoice>> = {
  'ao-ngu-than': {
    minimal: {under:null,outer:null,bottom:'tailored',shoes:'loafers',glasses:null,bag:'tote'},
    street: {under:null,outer:'cropped-jacket',bottom:'denim',shoes:'sneakers',glasses:'sunglasses',bag:'crossbody'},
    creative: {under:null,outer:null,bottom:'cargo',shoes:'mules',glasses:'thin-glasses',bag:'crossbody'},
    evening: {under:null,outer:null,bottom:'silk',shoes:'loafers',glasses:null,bag:'mini-bag'},
  },
  'ao-tac': {
    minimal: {under:null,outer:null,bottom:'silk',shoes:'mules',glasses:null,bag:'mini-bag'},
    street: {under:null,outer:null,bottom:'denim',shoes:'sneakers',glasses:'thin-glasses',bag:'tote'},
    creative: {under:null,outer:null,bottom:'tailored',shoes:'loafers',glasses:'sunglasses',bag:'crossbody'},
    evening: {under:null,outer:null,bottom:'silk',shoes:'block-heels',glasses:null,bag:'mini-bag'},
  },
  'ao-nhat-binh': {
    minimal: {under:'under-yem',outer:null,bottom:'tailored',shoes:'mules',glasses:null,bag:'mini-bag'},
    street: {under:'tee',outer:null,bottom:'denim',shoes:'sneakers',glasses:'sunglasses',bag:'tote'},
    creative: {under:'under-yem',outer:null,bottom:'pleated-skirt',shoes:'loafers',glasses:'thin-glasses',bag:'crossbody'},
    evening: {under:'under-yem',outer:null,bottom:'silk',shoes:'block-heels',glasses:null,bag:'mini-bag'},
  },
  'ao-yem': {
    minimal: {under:null,outer:'linen-jacket',bottom:'tailored',shoes:'mules',glasses:null,bag:'tote'},
    street: {under:null,outer:'cropped-jacket',bottom:'cargo',shoes:'sneakers',glasses:'sunglasses',bag:'crossbody'},
    creative: {under:null,outer:'blazer',bottom:'pleated-skirt',shoes:'loafers',glasses:'thin-glasses',bag:'crossbody'},
    evening: {under:null,outer:'blazer',bottom:'tailored',shoes:'block-heels',glasses:null,bag:'mini-bag'},
  },
  'ao-tu-than': {
    minimal: {under:'under-yem',outer:null,bottom:'pleated-skirt',shoes:'mules',glasses:null,bag:'tote'},
    street: {under:'tee',outer:'cropped-jacket',bottom:'denim',shoes:'sneakers',glasses:'sunglasses',bag:'crossbody'},
    creative: {under:'under-yem',outer:null,bottom:'cargo',shoes:'loafers',glasses:'thin-glasses',bag:'crossbody'},
    evening: {under:'under-yem',outer:null,bottom:'pleated-skirt',shoes:'block-heels',glasses:null,bag:'mini-bag'},
  },
  'ao-giao-linh': {
    minimal: {under:null,outer:null,bottom:'tailored',shoes:'loafers',glasses:null,bag:'tote'},
    street: {under:null,outer:null,bottom:'cargo',shoes:'sneakers',glasses:'sunglasses',bag:'crossbody'},
    creative: {under:null,outer:'linen-jacket',bottom:'silk',shoes:'mules',glasses:'thin-glasses',bag:'mini-bag'},
    evening: {under:null,outer:null,bottom:'tailored',shoes:'loafers',glasses:null,bag:'mini-bag'},
  },
  'ao-ba-ba': {
    minimal: {under:null,outer:null,bottom:'tailored',shoes:'loafers',glasses:'thin-glasses',bag:'tote'},
    street: {under:null,outer:'cropped-jacket',bottom:'cargo',shoes:'sneakers',glasses:'sunglasses',bag:'crossbody'},
    creative: {under:null,outer:'linen-jacket',bottom:'denim',shoes:'mules',glasses:null,bag:'tote'},
    evening: {under:null,outer:'blazer',bottom:'tailored',shoes:'loafers',glasses:null,bag:'mini-bag'},
  },
};

function colorHue(hex: string): number {
  const [r,g,b]=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
  const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
  if(!d)return 0;
  return ((max===r?(g-b)/d+(g<b?6:0):max===g?(b-r)/d+2:(r-g)/d+4)*60)%360;
}
function mutedColor(hue:number,saturation:number,lightness:number):string {
  const h=((hue%360)+360)%360/60,c=(1-Math.abs(2*lightness-1))*saturation,x=c*(1-Math.abs(h%2-1)),m=lightness-c/2;
  const rgb=h<1?[c,x,0]:h<2?[x,c,0]:h<3?[0,c,x]:h<4?[0,x,c]:h<5?[x,0,c]:[c,0,x];
  return '#'+rgb.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
/** Main hue guides restrained companion colors; presets never return top/topColor. */
export function recommendedLayers(top:GarmentId,style:StyleId,gender:'male'|'female',mainColor='#547f80') {
  const selected={...combinations[top][style]};
  if(gender==='male'&&selected.shoes==='block-heels')selected.shoes='loafers';
  const hue=colorHue(mainColor),night=style==='evening';
  const scene:SceneId=style==='street'?'boulevard':style==='creative'?'gallery':night?'courtyard':'atelier';
  const neutral=night?'#302e35':style==='street'?'#3d4853':'#dfd6c5';
  return {...selected,scene,time:night?'night' as const:'day' as const,
    bottomColor:neutral,
    outerColor:style==='minimal'?'#b8ad96':style==='creative'?mutedColor(hue+25,.16,.25):mutedColor(hue,.13,night?.20:.29),
    underColor:mutedColor(hue+styleHueOffset(style),.12,.81),
    shoesColor:selected.shoes==='sneakers'?'#e4dfd3':night?'#26252a':'#3e342e',
    bagColor:style==='creative'?mutedColor(hue+150,.26,.42):night?'#a18b62':style==='street'?'#535e4e':'#7c6654',
    glassesColor:style==='creative'?'#9a865e':'#292e32',
  };
}
function styleHueOffset(style:StyleId):number{return style==='creative'?150:15;}

export type NavTab = 'explore' | 'archive' | 'studio' | 'manifesto';

export type SilhouetteVector = 
  | 'standing-five-panel' 
  | 'wide-sleeve-tac' 
  | 'cross-collar-giao-linh' 
  | 'square-collar-nhat-binh' 
  | 'parallel-doi-kham' 
  | 'modern-retro-lemur'
  | 'standalone-yem'
  | 'four-panel-tu-than'
  | 'ba-ba-tunic';

export type SourceStatus = 'archival photo' | 'artifact' | 'painting' | 'reconstruction' | 'Chưa kiểm chứng' | 'Hiện vật bảo tàng (CC0)';

export interface GarmentImageMetadata {
  imageUrl?: string;
  fallbackImageUrls?: string[];
  altText?: string;
  sourceName?: string;
  sourcePageUrl?: string;
  dateOrPeriod?: string;
  rightsOrLicense?: string;
  isReconstruction?: boolean;
  exhibitNote?: string;
}

export interface ArchiveGarment {
  id: string;
  name: string;
  visualNote: string;
  dynastyPeriod?: string;
  chronologyRange?: string;
  structuralDetail?: string;
  sourceStatus?: string;
  silhouetteVector?: SilhouetteVector;
  imageMetadata?: GarmentImageMetadata;
}

export interface GarmentSpecimen {
  id: string;
  accessionCode: string;
  name: string;
  sinoVietnamese: string;
  englishName: string;
  dynastyPeriod: string;
  chronologyRange: string;
  formalityLevel: 'Trang phục thường nhật & lễ tiết' | 'Đại lễ & Nghi thức cung đình' | 'Lễ phục dân gian cao cấp' | 'Tân thời giao thời 1930s';
  collarStructure: string;
  sleeveStructure: string;
  panelAnatomy: string;
  traditionalFabrics: string[];
  curatorialSummary: string;
  historicalQuotes: {
    quote: string;
    source: string;
  };
  scholarlyCitations: string[];
  silhouetteVector: SilhouetteVector;
  verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE';
  accentHex: string;
  suggestedModernPairings: string[];
  visualNote: string;
  sourceStatus: SourceStatus;
  imageMetadata?: GarmentImageMetadata;
}

export interface OccasionOption {
  id: string;
  name: string;
  vietnameseTitle: string;
  subtitle: string;
  idealHours: string;
  settingVibe: string;
  curatorialContext: string;
}

export interface StyleOption {
  id: string;
  name: string;
  vietnameseName: string;
  moodDescription: string;
  keyAesthetic: string[];
  toneHint: string;
}

export interface AccessoryPairing {
  name: string;
  category: 'Trang sức & phụ kiện' | 'Túi & hành lý' | 'Giày dép' | 'Kính & khăn';
  description: string;
}

export interface CuratedLookSuggestion {
  id: string;
  garmentId: string;
  occasionId: string;
  styleId: string;
  lookTitle: string;
  deckSubtitle: string;
  editorialRationale: string;
  colorHarmony: {
    hex: string;
    name: string;
    usage: 'Màu áo chính' | 'Quần / chân váy phối' | 'Phụ kiện điểm xuyết' | 'Lớp lót / điểm nhấn';
  }[];
  garmentLayeringAdvice: string;
  modernTrousersOrSkirts: string;
  footwear: string;
  accessoriesList: AccessoryPairing[];
  environmentalAtmosphere: {
    venueType: string;
    lightAndClimate: string;
    photogenicMoment: string;
  };
  culturalEtiquetteNote: {
    ruleSummary: string;
    historicalDepth: string;
    verifiedSources: string[];
  };
}

export interface UserUploadedItem {
  fileName: string;
  previewUrl: string;
  customCategory: string;
  notes: string;
}

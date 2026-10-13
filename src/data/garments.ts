import { GarmentSpecimen, ArchiveGarment } from '../types';

export const ARCHIVE_GARMENTS: ArchiveGarment[] = [
  {
    id: 'ao-ngu-than',
    name: 'Áo ngũ thân',
    dynastyPeriod: 'Triều Nguyễn',
    chronologyRange: '1802 – 1945',
    structuralDetail: 'Năm vạt vải · Cổ đứng lập lĩnh · Cài khuy hữu bên phải',
    visualNote: 'Thân áo may từ năm vạt vải, cổ đứng cài năm khuy bên phải, tay chẽn vừa vặn, vạt áo dài quá gối.',
    sourceStatus: 'Hiện vật khảo cứu',
    silhouetteVector: 'standing-five-panel',
    imageMetadata: undefined
  },
  {
    id: 'ao-tac',
    name: 'Áo tấc',
    dynastyPeriod: 'Triều Nguyễn',
    chronologyRange: 'Thế kỷ 19 – 20',
    structuralDetail: 'Lễ phục ngũ thân · Tay thụng rộng buông dài qua tay · Cổ lập lĩnh',
    visualNote: 'Lễ phục ngũ thân có ống tay buông rộng và dài quá tay, cổ đứng cài khuy bên phải.',
    sourceStatus: 'Hiện vật khảo cứu',
    silhouetteVector: 'wide-sleeve-tac',
    imageMetadata: undefined
  },
  {
    id: 'ao-nhat-binh',
    name: 'Áo Nhật Bình',
    dynastyPeriod: 'Cung đình Triều Nguyễn',
    chronologyRange: '1802 – 1945',
    structuralDetail: 'Nẹp cổ to bản chữ nhật · Vạt xẻ đối khâm · Dải kết phụ kiện',
    visualNote: 'Áo vạt mở xẻ ngực, nẹp cổ to bản hình chữ nhật viền từ sau gáy xuống ngực, ngực cài ngọc bội, tay viền dải ngũ sắc.',
    sourceStatus: 'Hiện vật bảo tàng',
    silhouetteVector: 'square-collar-nhat-binh',
    imageMetadata: undefined
  },
  {
    id: 'ao-yem',
    name: 'Áo yếm',
    dynastyPeriod: 'Y phục lót truyền thống dân tộc',
    chronologyRange: 'Cổ truyền đến nay',
    structuralDetail: 'Dáng quả đào/trám mềm mại ôm ngực · Cổ xây tròn · Dây buộc lưng',
    visualNote: 'Tấm yếm đơn lẻ che phần ngực với dây buộc quanh cổ và sau lưng; không có ống tay hay thân áo dài.',
    sourceStatus: 'Hiện vật khảo cứu',
    silhouetteVector: 'standalone-yem',
    imageMetadata: undefined
  },
  {
    id: 'ao-tu-than',
    name: 'Áo tứ thân',
    dynastyPeriod: 'Dân gian Bắc Bộ',
    chronologyRange: 'Thế kỷ 12 – 20',
    structuralDetail: 'Bốn vạt · Hai vạt sau may liền sống lưng · Hai vạt trước buộc bụng',
    visualNote: 'Thân áo gồm bốn vạt vải, hai vạt sau may liền sống lưng, ngực mở lộ yếm đào, hai vạt trước buộc vạt trước bụng cùng thắt lưng bao.',
    sourceStatus: 'Hiện vật khảo cứu',
    silhouetteVector: 'four-panel-tu-than',
    imageMetadata: undefined
  },
  {
    id: 'ao-giao-linh',
    name: 'Áo giao lĩnh',
    dynastyPeriod: 'Thời Lý – Trần – Lê',
    chronologyRange: 'Thế kỷ 11 – 18',
    structuralDetail: 'Cổ chéo vạt đan sang nhau · Vạt rộng buông rủ · Đai thắt lụa mềm',
    visualNote: 'Thân áo dài với hai vạt trước bắt chéo nhau, vạt trái đè lên vạt phải trước ngực, tay thụng buông rủ.',
    sourceStatus: 'Hiện vật khảo cứu',
    silhouetteVector: 'cross-collar-giao-linh',
    imageMetadata: undefined
  },
  {
    id: 'ao-ba-ba',
    name: 'Áo bà ba',
    dynastyPeriod: 'Nam Bộ truyền thống & đương đại',
    chronologyRange: 'Thế kỷ 19 đến nay',
    structuralDetail: 'Áo ngắn ngang hông · Cổ tròn thấp · 6 cúc giữa · 2 túi thấp · Xẻ tà hông',
    visualNote: 'Áo ngắn ngang hông, cổ tròn xẻ ngực với hàng cúc dọc phía trước, hai túi đắp thấp, xẻ tà hai bên hông.',
    sourceStatus: 'Hiện vật bảo tàng (CC0)',
    silhouetteVector: 'ba-ba-tunic',
    imageMetadata: {
      imageUrl: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Costume_Ba_ba%2C_Viet%2C_Ben_Tre%2C_1968%2C_industrial_fabric_-_Vietnamese_Women%27s_Museum_-_Hanoi%2C_Vietnam_-_DSC04104.JPG/960px-Costume_Ba_ba%2C_Viet%2C_Ben_Tre%2C_1968%2C_industrial_fabric_-_Vietnamese_Women%27s_Museum_-_Hanoi%2C_Vietnam_-_DSC04104.JPG',
      fallbackImageUrls: [
        'https://upload.wikimedia.org/wikipedia/commons/3/32/Costume_Ba_ba%2C_Viet%2C_Ben_Tre%2C_1968%2C_industrial_fabric_-_Vietnamese_Women%27s_Museum_-_Hanoi%2C_Vietnam_-_DSC04104.JPG'
      ],
      altText: 'Áo bà ba (Bến Tre, 1968), vải công nghiệp, trưng bày tại Bảo tàng Phụ nữ Việt Nam, ảnh chụp năm 2014',
      sourceName: "Bảo tàng Phụ nữ Việt Nam (Hà Nội) / Wikimedia Commons",
      sourcePageUrl: 'https://commons.wikimedia.org/wiki/File:Costume_Ba_ba,_Viet,_Ben_Tre,_1968,_industrial_fabric_-_Vietnamese_Women%27s_Museum_-_Hanoi,_Vietnam_-_DSC04104.JPG',
      dateOrPeriod: 'Hiện vật: 1968 (Bến Tre) · Chụp trưng bày bảo tàng: 2014',
      rightsOrLicense: 'CC0 1.0 Universal (Public Domain Dedication)',
      exhibitNote: 'Hiện vật áo bà ba xuất xứ Bến Tre năm 1968, may bằng vải công nghiệp, được chụp tại khu trưng bày Bảo tàng Phụ nữ Việt Nam năm 2014. Bản quyền ảnh CC0.',
      isReconstruction: false
    }
  }
];

export const GARMENT_ARCHIVE: GarmentSpecimen[] = [
  {
    id: 'ao-ngu-than',
    accessionCode: 'SPEC-01',
    name: 'Áo ngũ thân',
    sinoVietnamese: '',
    englishName: 'Five-panel tunic',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Trang phục thường nhật & lễ tiết',
    collarStructure: 'Cổ đứng cài năm khuy bên phải',
    sleeveStructure: 'Tay chẽn hoặc tay vừa vặn',
    panelAnatomy: 'Năm vạt vải ghép lại',
    traditionalFabrics: ['Tơ lụa tự nhiên', 'Đũi', 'Gấm'],
    curatorialSummary: 'Thân áo may từ năm vạt vải, cổ đứng cài năm khuy bên phải, vạt áo dài che thân.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'standing-five-panel',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#11383A',
    suggestedModernPairings: [],
    visualNote: 'Thân áo may từ năm vạt vải, cổ đứng cài năm khuy bên phải, vạt áo dài che thân.',
    sourceStatus: 'archival photo'
  },
  {
    id: 'ao-tac',
    accessionCode: 'SPEC-02',
    name: 'Áo tấc',
    sinoVietnamese: '',
    englishName: 'Wide-sleeved gown',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Lễ phục dân gian cao cấp',
    collarStructure: 'Cổ đứng cài khuy bên phải',
    sleeveStructure: 'Ống tay thụng buông rộng và dài',
    panelAnatomy: 'Năm thân vải, tay thụng rộng',
    traditionalFabrics: ['Gấm', 'Sa', 'Lụa'],
    curatorialSummary: 'Áo ngũ thân có ống tay buông rộng và dài, cổ đứng cài khuy bên phải.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'wide-sleeve-tac',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#2E473B',
    suggestedModernPairings: [],
    visualNote: 'Áo ngũ thân có ống tay buông rộng và dài, cổ đứng cài khuy bên phải.',
    sourceStatus: 'archival photo'
  },
  {
    id: 'ao-nhat-binh',
    accessionCode: 'SPEC-03',
    name: 'Áo Nhật Bình',
    sinoVietnamese: '',
    englishName: 'Rectangular-collared robe',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Đại lễ & Nghi thức cung đình',
    collarStructure: 'Nẹp cổ to bản hình chữ nhật',
    sleeveStructure: 'Tay áo dài viền dải màu',
    panelAnatomy: 'Vạt mở xẻ giữa ngực',
    traditionalFabrics: ['Gấm', 'Sa', 'Lụa thêu'],
    curatorialSummary: 'Áo vạt mở xẻ ngực, nẹp cổ to bản hình chữ nhật viền từ sau gáy xuống ngực, cửa tay viền các dải màu.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'square-collar-nhat-binh',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#963D2E',
    suggestedModernPairings: [],
    visualNote: 'Áo vạt mở xẻ ngực, nẹp cổ to bản hình chữ nhật viền từ sau gáy xuống ngực, cửa tay viền các dải màu.',
    sourceStatus: 'artifact'
  },
  {
    id: 'ao-yem',
    accessionCode: 'SPEC-04',
    name: 'Áo yếm',
    sinoVietnamese: '',
    englishName: 'Traditional bodice / undergarment (Yếm)',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Trang phục thường nhật & lễ tiết',
    collarStructure: 'Dây buộc quanh cổ (cổ khoét tròn hoặc cổ nhạn)',
    sleeveStructure: 'Không có ống tay (không tay áo)',
    panelAnatomy: 'Tấm yếm đơn lẻ che phần ngực với dây buộc cổ và lưng; không có ống tay, thân áo dài hay vạt áo choàng',
    traditionalFabrics: ['Lụa', 'Đũi', 'Vải mộc'],
    curatorialSummary: 'Tấm yếm đơn lẻ che phần ngực với dây buộc quanh cổ và sau lưng; không có ống tay, thân áo dài hay vạt áo choàng.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'standalone-yem',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#BFA15F',
    suggestedModernPairings: [],
    visualNote: 'Tấm yếm đơn lẻ che phần ngực với dây buộc quanh cổ và sau lưng; không có ống tay, thân áo dài hay vạt áo choàng.',
    sourceStatus: 'archival photo'
  },
  {
    id: 'ao-tu-than',
    accessionCode: 'SPEC-05',
    name: 'Áo tứ thân',
    sinoVietnamese: '',
    englishName: 'Four-panel tunic',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Trang phục thường nhật & lễ tiết',
    collarStructure: 'Cổ tròn hoặc mở không khuy',
    sleeveStructure: 'Tay áo vừa vặn',
    panelAnatomy: 'Bốn vạt vải, hai vạt trước buông hoặc buộc',
    traditionalFabrics: ['Lụa', 'Đũi', 'Vải nhuộm tự nhiên'],
    curatorialSummary: 'Thân áo gồm bốn vạt vải, hai vạt sau may liền sống lưng, hai vạt trước để buông tự do hoặc buộc trước bụng.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'four-panel-tu-than',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#4A5D52',
    suggestedModernPairings: [],
    visualNote: 'Thân áo gồm bốn vạt vải, hai vạt sau may liền sống lưng, hai vạt trước để buông tự do hoặc buộc trước bụng.',
    sourceStatus: 'archival photo'
  },
  {
    id: 'ao-giao-linh',
    accessionCode: 'SPEC-06',
    name: 'Áo giao lĩnh',
    sinoVietnamese: '',
    englishName: 'Cross-collared robe',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Trang phục thường nhật & lễ tiết',
    collarStructure: 'Cổ chéo vạt trái đè lên vạt phải',
    sleeveStructure: 'Tay áo rộng',
    panelAnatomy: 'Thân áo dài có vạt bắt chéo trước ngực',
    traditionalFabrics: ['Lụa', 'Tơ nõn', 'Vải đũi'],
    curatorialSummary: 'Thân áo dài với hai vạt trước bắt chéo nhau, vạt trái đè lên vạt phải trước ngực.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'cross-collar-giao-linh',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#3D5A5B',
    suggestedModernPairings: [],
    visualNote: 'Thân áo dài với hai vạt trước bắt chéo nhau, vạt trái đè lên vạt phải trước ngực.',
    sourceStatus: 'painting'
  },
  {
    id: 'ao-ba-ba',
    accessionCode: 'SPEC-07',
    name: 'Áo bà ba',
    sinoVietnamese: '',
    englishName: 'Ba Ba tunic',
    dynastyPeriod: 'Truyền thống',
    chronologyRange: '',
    formalityLevel: 'Trang phục thường nhật & lễ tiết',
    collarStructure: 'Cổ tròn hoặc xẻ giữa',
    sleeveStructure: 'Tay dài thuôn gọn',
    panelAnatomy: 'Thân ngắn ngang hông, xẻ tà hai bên',
    traditionalFabrics: ['Lụa', 'Vải ú', 'Gấm'],
    curatorialSummary: 'Áo ngắn ngang hông, cổ tròn hoặc xẻ giữa với hàng cúc dọc phía trước, xẻ tà hai bên hông.',
    historicalQuotes: {
      quote: '',
      source: ''
    },
    scholarlyCitations: [],
    silhouetteVector: 'ba-ba-tunic',
    verifiedImageStatus: 'AWAITING_VERIFIED_ARCHIVAL_IMAGE',
    accentHex: '#2E473B',
    suggestedModernPairings: [],
    visualNote: 'Áo ngắn ngang hông, cổ tròn hoặc xẻ giữa với hàng cúc dọc phía trước, xẻ tà hai bên hông.',
    sourceStatus: 'archival photo'
  }
];

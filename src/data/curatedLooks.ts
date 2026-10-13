import { CuratedLookSuggestion } from '../types';
import { GARMENT_ARCHIVE } from './garments';
import { OCCASIONS, PERSONAL_STYLES } from './occasionsAndStyles';

export const BASE_CURATED_LOOKS: CuratedLookSuggestion[] = [
  {
    id: 'look-ngu-than-gallery-minimal',
    garmentId: 'ao-ngu-than-tay-chen',
    occasionId: 'art-gallery',
    styleId: 'minimalist-contemporary',
    lookTitle: 'Tĩnh Sắc Đương Thời — The Contemporary Gallery Scholar',
    deckSubtitle: 'Phom áo ngũ thân mực chàm tối giản phối cùng quần âu may đo ống đứng và phụ kiện bạc mờ',
    editorialRationale: 'Áo Ngũ Thân màu lam mực (Ink Teal) giữ sự uy nghiêm tĩnh tại, kết hợp cùng quần âu màu đá xám nhạt (Travertine Grey) tạo nên độ tương phản sắc thái 70/30 chuẩn mực bảo tàng. Tối giản hóa tối đa các chi tiết viền để tập trung vào nhịp điệu của 5 chiếc khuy kim loại thẳng hàng.',
    colorHarmony: [
      { hex: '#11383A', name: 'Lam mực ngọc (Ink Teal)', usage: 'Màu áo chính' },
      { hex: '#D8D4C7', name: 'Đá vôi xám nhạt (Travertine)', usage: 'Quần / chân váy phối' },
      { hex: '#BFA15F', name: 'Đồng thau mạ mờ (Antique Brass)', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#FFFFFF', name: 'Bạch ngọc mộc (Pristine Linen)', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: 'Mặc một lớp áo cổ đứng mỏng màu trắng tinh khôi bên trong lộ nhẹ 0.5cm viền cổ (Cổ lót), cài đủ 5 khuy áo từ trên xuống dưới biểu trưng ngũ thường.',
    modernTrousersOrSkirts: 'Quần âu xếp ly đôi ống suông vải len pha lụa (Virgin Wool Blend) màu xám khói, cạp cao giấu khuy.',
    footwear: 'Giày Derby da bê màu đen mờ hoặc Loafer gót thấp đế da khâu tay.',
    accessoriesList: [
      {
        name: 'Clutch cầm tay da sáp phom phong bì',
        category: 'Túi & hành lý',
        description: 'Túi clutch phom phẳng tối giản màu nâu đất sẫm, không logo kim loại nổi.'
      },
      {
        name: 'Khuyên tai / Nhẫn bạc phay xước mờ',
        category: 'Trang sức & phụ kiện',
        description: 'Chế tác bạc 925 bề mặt phay xước mang hình khối học đương đại.'
      },
      {
        name: 'Kính gọng tròn titanium đồi mồi',
        category: 'Kính & khăn',
        description: 'Gợi phong thái của những học giả tân thời đầu thế kỷ 20.'
      }
    ],
    environmentalAtmosphere: {
      venueType: 'Bảo tàng Mỹ thuật hoặc Không gian Triển lãm Thiết kế Đương đại (White Cube Gallery)',
      lightAndClimate: 'Nhiệt độ phòng lạnh 22°C, ánh đèn ray chiếu điểm 3000K ấm tạo bóng đổ sắc nét trên nếp gập lụa.',
      photogenicMoment: 'Góc nghiêng 45 độ tựa lưng vào bức tường trắng hoặc đứng trước tác phẩm hội họa trừu tượng.'
    },
    culturalEtiquetteNote: {
      ruleSummary: 'Quy tắc cài cúc và cổ lót áo Ngũ Thân',
      historicalDepth: 'Theo quy chế thời Nguyễn, người mặc áo ngũ thân luôn giữ nẹp cổ dựng đứng thẳng thớm, thể hiện tâm thế "chính nhân quân tử". Lớp áo lót trong màu trắng không chỉ giữ sạch nẹp áo tơ tằm mà còn biểu thị lòng thanh bạch.',
      verifiedSources: [
        'Trần Quang Đức (2013), Ngàn Năm Áo Mũ, NXB Nhã Nam, tr. 280-292.',
        'Khâm Định Đại Nam Hội Điển Sự Lệ, Quyển 78 (Điển chế Y phục).'
      ]
    }
  },
  {
    id: 'look-tac-evening-indochine',
    garmentId: 'ao-tac-ngu-than-tay-thung',
    occasionId: 'evening-banquet',
    styleId: 'indochine-poetic',
    lookTitle: 'Dạ Khúc Cung Đình — The Twilight Imperial Banquet',
    deckSubtitle: 'Áo Tấc lụa dệt hoa chữ Thọ khoác ngoài đầm suông lụa tơ tằm và ngọc trai nước ngọt',
    editorialRationale: 'Tận dụng độ buông rủ uyển chuyển của ống tay thụng rộng 35cm khi di chuyển. Tông màu rêu phong cổ kính hòa quyện cùng sắc vàng kim mờ của ánh nến, tạo vẻ đài các, dịu dàng đậm chất phụ nữ xứ Thần Kinh.',
    colorHarmony: [
      { hex: '#2E473B', name: 'Rêu phong cố đô (Moss Pine)', usage: 'Màu áo chính' },
      { hex: '#EBE2D0', name: 'Lụa ngà hoa huệ (Ivory Silk)', usage: 'Quần / chân váy phối' },
      { hex: '#A84A36', name: 'Sơn mài chu sa (Vermilion Lacquer)', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#F4ECE1', name: 'Bạch ngọc ánh xà cừ', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: 'Để tà áo buông tự nhiên, khi đứng giao tiếp giữ hai tay đan nhẹ trước bụng để tạo dáng tay thụng hình vòng cung quý phái.',
    modernTrousersOrSkirts: 'Chân váy lụa satin tơ tằm hai lớp suông dài chạm mắt cá chân màu kem sữa.',
    footwear: 'Mule gót nhọn thấp 4cm bọc nhung the hoặc da satin.',
    accessoriesList: [
      {
        name: 'Vòng cổ ngọc trai nước ngọt thắt nút',
        category: 'Trang sức & phụ kiện',
        description: 'Chuỗi ngọc trai tự nhiên hạt nhỡ đem lại nét thanh tân mềm mại.'
      },
      {
        name: 'Túi nan tre đan tay nẹp da thủ công',
        category: 'Túi & hành lý',
        description: 'Chế tác tinh xảo từ làng nghề mây tre đan Phú Vinh kết hợp da bò tự nhiên.'
      },
      {
        name: 'Trâm cài tóc khảm xà cừ hoặc bạc cổ',
        category: 'Trang sức & phụ kiện',
        description: 'Búi tóc thấp kiểu phụ nữ Huế xưa cài chiếc trâm trơn thanh tú.'
      }
    ],
    environmentalAtmosphere: {
      venueType: 'Không gian tiệc Fine Dining Indochine hoặc Dinh thự kiến trúc Pháp cổ',
      lightAndClimate: 'Ánh nến sáp ong vàng mật ấm áp, vòm trần cao với quạt trần gỗ quay chậm rãi.',
      photogenicMoment: 'Khoảnh khắc nâng ly hoặc bước xuống cầu thang gỗ lim dưới ánh đèn chùm cổ điển.'
    },
    culturalEtiquetteNote: {
      ruleSummary: 'Phong thái buông tay thụng của Áo Tấc',
      historicalDepth: 'Áo Tấc là biểu tượng của sự lễ độ. Khi cử hành nghi thức hoặc diện kiến người lớn tuổi, tư thế chắp hai tay lại phía trước ngực giấu bàn tay vào trong lòng tay áo (Thủ lễ) biểu hiện sự khiêm cung, tôn kính tối đa.',
      verifiedSources: [
        'Hội đồng Trị sự Nguyễn Phước Tộc, Nghi lễ và Lễ phục triều Nguyễn (2020).',
        'Trần Quang Đức (2013), Ngàn Năm Áo Mũ, tr. 298-305.'
      ]
    }
  },
  {
    id: 'look-nhat-binh-cafe-neosaigon',
    garmentId: 'ao-nhat-binh',
    occasionId: 'heritage-cafe',
    styleId: 'neo-saigon-street',
    lookTitle: 'Ngọc Các Phố Thị — Neo-Heritage City Bloom',
    deckSubtitle: 'Áo Nhật Bình biến tấu khoác ngoài áo hai dây lụa mộc và quần ống rộng phóng khoáng',
    editorialRationale: 'Giải phóng chiếc áo Nhật Bình khỏi định kiến chỉ mặc trong ngày cưới. Với dải cổ thêu hình chữ nhật độc đáo và viền ngũ sắc ở tay, Nhật Bình đóng vai trò như một tác phẩm nghệ thuật dệt may đương đại đầy kiêu hãnh.',
    colorHarmony: [
      { hex: '#963D2E', name: 'Đỏ chu sa trầm (Cinnabar Lacquer)', usage: 'Màu áo chính' },
      { hex: '#263430', name: 'Xanh mực sẫm (Deep Forest)', usage: 'Quần / chân váy phối' },
      { hex: '#D4B872', name: 'Vàng rơm cung đình (Imperial Gold)', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#FAF6EE', name: 'Trắng mộc đũi tơ', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: 'Mặc áo mở vạt như áo choàng kimono, để lộ lớp camisole lụa mộc dệt trơn bên trong, tạo nhịp điệu chuyển động trẻ trung.',
    modernTrousersOrSkirts: 'Quần suông linen cạp cao màu rêu đen hoặc quần jeans ống đứng selvedge màu xanh thẫm trơn.',
    footwear: 'Loafer đế bánh mì (chunky platform loafer) hoặc guốc mộc đế vuông sơn mài mộc.',
    accessoriesList: [
      {
        name: 'Túi tote da bò thuộc thảo mộc',
        category: 'Túi & hành lý',
        description: 'Túi xách phom hình học tối giản, tôn lên vẻ tự do hiện đại.'
      },
      {
        name: 'Vòng tay bạc khắc họa tiết mây cuộn cổ',
        category: 'Trang sức & phụ kiện',
        description: 'Chi tiết hoa văn chạm trổ thủ công lấy cảm hứng từ chạm khắc đình làng thế kỷ 18.'
      },
      {
        name: 'Kính râm gọng mắt mèo đồi mồi',
        category: 'Kính & khăn',
        description: 'Nốt chấm phá phong cách đường phố Sài Gòn thập niên 60 hòa cùng hiện đại.'
      }
    ],
    environmentalAtmosphere: {
      venueType: 'Quán cà phê biệt thự Pháp cổ ngập bóng nắng hoặc sân thượng view nhìn xuống phố cổ',
      lightAndClimate: 'Nắng chiều xiên 16:30 vàng mật rọi qua tán cây bàng, gió mát nhẹ.',
      photogenicMoment: 'Ngồi bên khung cửa sổ sổ gỗ xanh lá, tay cầm tách cà phê phin gốm sứ Bát Tràng.'
    },
    culturalEtiquetteNote: {
      ruleSummary: 'Ý nghĩa dải ngũ sắc nơi cổ tay áo Nhật Bình',
      historicalDepth: 'Dải ngũ sắc gồm năm dải vải màu xanh lá, đỏ, vàng, trắng, xanh lam (hoặc lục) tượng trưng cho ngũ hành tương sinh: Kim - Mộc - Thủy - Hỏa - Thổ, gửi gắm ước nguyện vạn vật an hòa và trường thọ của vương triều Nguyễn.',
      verifiedSources: [
        'Khâm Định Đại Nam Hội Điển Sự Lệ (Tập 6: Quy chế trang phục cung đình).',
        'Trần Đức Anh Sơn (2014), Mỹ thuật Cung đình Huế, NXB Thuận Hóa.'
      ]
    }
  }
];

export function generateSuggestedLooks(
  garmentId: string,
  occasionId: string,
  styleId: string,
  customItemName?: string
): CuratedLookSuggestion[] {
  const garment = GARMENT_ARCHIVE.find((g) => g.id === garmentId) || GARMENT_ARCHIVE[0];
  const occasion = OCCASIONS.find((o) => o.id === occasionId) || OCCASIONS[0];
  const style = PERSONAL_STYLES.find((s) => s.id === styleId) || PERSONAL_STYLES[0];

  // Look 1: Strict Editorial Signature Look
  const look1: CuratedLookSuggestion = {
    id: `look-curated-1-${garment.id}-${occasion.id}`,
    garmentId: garment.id,
    occasionId: occasion.id,
    styleId: style.id,
    lookTitle: `${garment.name} · Bản Phối Di Sản Chuẩn Mực (${style.vietnameseName})`,
    deckSubtitle: `Tôn vinh nguyên bản đường nét ${garment.collarStructure.slice(0, 30)}... đặt trong nhịp sống ${occasion.vietnameseTitle}`,
    editorialRationale: `Bản phối khai thác sự tương phản thị giác giữa bề mặt chất liệu ${garment.traditionalFabrics[0]} và ngôn ngữ thời trang ${style.name}. Bằng cách tiết chế chi tiết rườm rà, phom dáng ${garment.name} trở thành điểm nhấn thị giác trung tâm tại ${occasion.name}.`,
    colorHarmony: [
      { hex: garment.accentHex, name: `${garment.name} (Chính sắc)`, usage: 'Màu áo chính' },
      { hex: '#ECE8DD', name: 'Parchment ngọc trai (Thạch bản)', usage: 'Quần / chân váy phối' },
      { hex: '#963D2E', name: 'Đỏ son chu sa điểm xuyết', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#FDFCFA', name: 'Lụa mộc trắng ngà', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: `Giữ phom áo ${garment.name} phẳng phiu, cài khuy chỉnh tề để lộ nhẹ viền cổ áo trong. ${garment.panelAnatomy.split('(')[0].trim()}.`,
    modernTrousersOrSkirts: 'Quần âu may đo ống suông cạp cao bằng vải lanh dệt thoi (linen) hoặc len mỏng nhiệt đới màu kem ngà mộc mạc.',
    footwear: 'Giày da Loafer gót thấp đế da khâu tay hoặc dép Mule da trơn phom vuông tối giản.',
    accessoriesList: [
      {
        name: 'Túi xách da cấu trúc hình học tối giản',
        category: 'Túi & hành lý',
        description: 'Túi da thuộc tự nhiên không họa tiết cầu kỳ, phom dáng kiến trúc hiện đại.'
      },
      {
        name: 'Trang sức bạc 925 chạm lọng hoặc ngọc bích',
        category: 'Trang sức & phụ kiện',
        description: 'Khuyên tai dáng hạt hoặc nhẫn bạc bề mặt phay xước mang hơi thở đương đại.'
      },
      {
        name: 'Khăn lụa vuông twilly hoặc đồng hồ mặt số cổ điển',
        category: 'Kính & khăn',
        description: 'Tạo điểm nhấn thị giác nhỏ gọn, hòa quyện phong thái trí thức.'
      }
    ],
    environmentalAtmosphere: {
      venueType: `${occasion.vietnameseTitle} — ${occasion.settingVibe}`,
      lightAndClimate: `Khung giờ lý tưởng: ${occasion.idealHours}. Ánh sáng tự nhiên kết hợp không gian kiến trúc có chiều sâu thị giác.`,
      photogenicMoment: `Góc chụp nửa người hoặc toàn thân tại không gian có nền tường vôi hoặc mảng kính hiện đại, tôn trọn vẹn ${garment.sleeveStructure}.`
    },
    culturalEtiquetteNote: {
      ruleSummary: `Cốt cách nguyên bản của ${garment.name}`,
      historicalDepth: garment.curatorialSummary,
      verifiedSources: garment.scholarlyCitations
    }
  };

  // Look 2: Contemporary Modern Fusion Look
  const look2: CuratedLookSuggestion = {
    id: `look-curated-2-${garment.id}-${occasion.id}`,
    garmentId: garment.id,
    occasionId: occasion.id,
    styleId: style.id,
    lookTitle: `Biến Tấu Phố Thị · Contemporary Street Layering`,
    deckSubtitle: `Phá vỡ giới hạn truyền thống: Diện ${customItemName || garment.name} như một chiếc áo khoác độc bản cho giới trẻ`,
    editorialRationale: `Cách tân cách mặc bằng kỹ thuật layer nhiều lớp (layering). Vạt áo buông hờ hoặc kết hợp cùng trang phục cơ bản (white tank/tee) giúp xóa nhòa khoảng cách giữa cổ phục nghìn năm và trang phục thường nhật của người trẻ hiện đại.`,
    colorHarmony: [
      { hex: '#203429', name: 'Xanh lục rêu trầm (Forest Ink)', usage: 'Màu áo chính' },
      { hex: '#2B2B2B', name: 'Than chì nhung đen (Charcoal)', usage: 'Quần / chân váy phối' },
      { hex: '#BFA15F', name: 'Đồng cổ kim hoàn (Antique Brass)', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#EDE7DC', name: 'Vải đũi tơ mộc', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: 'Để mở cúc ngực trên hoặc mặc khoác ngoài vạt tự do, xắn nhẹ ống tay để lộ cổ tay thanh thoát và phụ kiện trang sức.',
    modernTrousersOrSkirts: 'Quần âu xếp ly rộng (wide-leg trousers) màu xám than chì hoặc chân váy xếp ly dài qua gối.',
    footwear: 'Giày Derby da bóng gót dày (Chunky Derby) hoặc bốt da cổ thấp phong cách minimalist.',
    accessoriesList: [
      {
        name: 'Kính mắt gọng sừng vuông hoặc titanium',
        category: 'Kính & khăn',
        description: 'Đem lại nét thời thượng trí thức (contemporary intellectual look).'
      },
      {
        name: 'Túi tote vải canvas kết hợp da thật',
        category: 'Túi & hành lý',
        description: 'Đựng tài liệu triển lãm hoặc máy ảnh film cho buổi dạo chơi cuối tuần.'
      },
      {
        name: 'Vòng tay bạc khắc chữ thảo hoặc trâm cài ngực áo tối giản',
        category: 'Trang sức & phụ kiện',
        description: 'Thay thế cho khuy cài áo truyền thống nếu mặc theo dạng mở tà.'
      }
    ],
    environmentalAtmosphere: {
      venueType: 'Quán cà phê kiến trúc mở, bảo tàng nghệ thuật hoặc sân vườn di sản',
      lightAndClimate: `${occasion.subtitle}. Khí hậu thoáng đãng, ánh sáng ven tự nhiên.`,
      photogenicMoment: 'Khoảnh khắc bước đi trên vỉa hè lát đá hoặc tựa lan can gỗ ngắm phố phường.'
    },
    culturalEtiquetteNote: {
      ruleSummary: 'Triết lý thích ứng của trang phục truyền thống Việt',
      historicalDepth: 'Lịch sử y phục Việt Nam qua các triều đại Lý, Trần, Lê, Nguyễn luôn là quá trình tiếp biến và sáng tạo không ngừng. Mặc Việt phục trong đời sống hiện đại là sự tiếp nối sống động nhất của di sản văn hóa.',
      verifiedSources: [
        'Trần Quang Đức (2013), Ngàn Năm Áo Mũ, Lời kết: "Sức sống của Y phục dân tộc".',
        'Phạm Đình Hổ, Vũ Trung Tùy Bút, Khảo chép y phục thành Thăng Long.'
      ]
    }
  };

  // Look 3: Monochromatic Poetic Atelier Look
  const look3: CuratedLookSuggestion = {
    id: `look-curated-3-${garment.id}-${occasion.id}`,
    garmentId: garment.id,
    occasionId: occasion.id,
    styleId: style.id,
    lookTitle: `Tơ Tằm Nhàn Du · Poetic Botanical Monochrome`,
    deckSubtitle: `Bảng màu tơ sống nguyên bản và sợi tự nhiên, mang trọn sự an nhiên thư thái`,
    editorialRationale: `Tập trung vào trải nghiệm xúc giác của sợi tự nhiên: lụa Vạn Phúc, đũi Nam Cao và tơ tằm Bảo Lộc. Sự đồng điệu sắc độ từ trên xuống dưới kéo dài thị giác, tôn lên nét khoan thai của người mặc.`,
    colorHarmony: [
      { hex: '#D2C9B8', name: 'Tơ tằm mộc ngà (Raw Ecru Silk)', usage: 'Màu áo chính' },
      { hex: '#B8AFA0', name: 'Cát vàng sỏi đá (Warm Sand)', usage: 'Quần / chân váy phối' },
      { hex: '#11383A', name: 'Lam mực điểm nhấn nhỏ', usage: 'Phụ kiện điểm xuyết' },
      { hex: '#F9F7F1', name: 'Bạch liên hoa', usage: 'Lớp lót / điểm nhấn' }
    ],
    garmentLayeringAdvice: 'Phối đơn sắc (monochrome) cùng tone màu đất ấm, vải có độ rủ tự nhiên không ủi quá cứng ép mép.',
    modernTrousersOrSkirts: 'Quần suông lụa đũi mộc hoặc quần dệt thoi ống đứng xẻ gấu nhẹ.',
    footwear: 'Guốc mộc truyền thống cách điệu quai vải lụa hoặc giày búp bê da mềm đế bệt.',
    accessoriesList: [
      {
        name: 'Quạt xếp giấy điệp / lụa vẽ tay tối giản',
        category: 'Trang sức & phụ kiện',
        description: 'Vật dụng tùy thân vừa làm duyên vừa thanh lọc bầu không khí mùa hè.'
      },
      {
        name: 'Túi cói hoặc làn tre đan tay hoa văn thưa',
        category: 'Túi & hành lý',
        description: 'Sợi thảo mộc tự nhiên mang lại cảm giác mộc mạc và thân thiện môi trường.'
      },
      {
        name: 'Vòng chuỗi hạt gỗ bách xanh hoặc hổ phách mộc',
        category: 'Trang sức & phụ kiện',
        description: 'Hương thơm thảo mộc tự nhiên giúp tinh thần an định và thư thái.'
      }
    ],
    environmentalAtmosphere: {
      venueType: 'Nhà rường Huế, trà quán thiền định hoặc đình làng cổ ngoại thành',
      lightAndClimate: 'Bóng râm râm mát dưới hiên ngói rêu phong, gió thoảng lay động tà áo lụa.',
      photogenicMoment: 'Ngồi thưởng trà bên bàn gỗ thô mộc, góc máy toàn cảnh bắt trọn nhịp sống chậm rãi.'
    },
    culturalEtiquetteNote: {
      ruleSummary: 'Văn hóa chất liệu tơ tằm và nghề dệt thủ công Việt Nam',
      historicalDepth: 'Nghề ươm tơ dệt lụa Việt Nam có bề dày từ thời Hùng Vương. Các làng nghề trứ danh như Vạn Phúc, Nha Xá, Chợ Lầu, Bảo Lộc không chỉ tạo nên tơ lụa mà còn dệt nên cốt cách khiêm nhường, thanh tao của dân tộc.',
      verifiedSources: [
        'Lê Quý Đôn (1777), Vân Đài Loại Ngữ, Khảo cứu sản vật nông nghiệp và tơ tằm Đại Việt.',
        'Viện Khảo cổ học Việt Nam, Báo cáo khai quật mộ hợp táng thời Lê: Kỹ thuật dệt tơ lụa cổ truyền.'
      ]
    }
  };

  return [look1, look2, look3];
}

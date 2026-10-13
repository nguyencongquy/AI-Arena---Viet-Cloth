import { OccasionOption, StyleOption } from '../types';

export const OCCASIONS: OccasionOption[] = [
  {
    id: 'art-gallery',
    name: 'Art Gallery Vernissage',
    vietnameseTitle: 'Khai mạc Triển lãm & Không gian Nghệ thuật',
    subtitle: 'Ánh sáng triển lãm trắng ấm, sàn terrazzo, không gian chiêm ngưỡng nghệ thuật đương đại',
    idealHours: '17:30 – 21:00 (Buổi tối trang nhã)',
    settingVibe: 'Tĩnh lặng, trí thức, thẩm mỹ cao',
    curatorialContext: 'Cần sự đĩnh đạc nhưng phóng khoáng, trang phục có phom dáng chuẩn mực kết hợp phụ kiện tối giản để hòa hợp với bối cảnh thị giác triển lãm.'
  },
  {
    id: 'heritage-cafe',
    name: 'Heritage Neo-Café & Salon',
    vietnameseTitle: 'Cà phê Di sản & Buổi gặp gỡ Cuối tuần',
    subtitle: 'Quán cà phê kiến trúc cổ điển hoặc sân vườn xanh mát giữa lòng đô thị',
    idealHours: '08:30 – 11:30 & 15:00 – 17:30',
    settingVibe: 'Thư thái, thoáng đạt, chụp ảnh tự nhiên',
    curatorialContext: 'Ưu tiên chất liệu tơ tằm thoáng khí hoặc lụa đũi mềm mại, phom dáng thoải mái khi ngồi đàm đạo, bảng màu dịu mắt.'
  },
  {
    id: 'graduation-milestone',
    name: 'Graduation & Life Milestone',
    vietnameseTitle: 'Lễ Tốt nghiệp Đại học & Cột mốc Thanh xuân',
    subtitle: 'Khuôn viên giảng đường, bậc thềm viện bảo tàng hoặc lễ trao bằng trang trọng',
    idealHours: '07:30 – 11:00 (Nắng sớm trong trẻo)',
    settingVibe: 'Trang trọng, tự hào, dấu ấn học thuật',
    curatorialContext: 'Tinh thần tôn vinh cội nguồn văn hóa trong ngày trọng đại tri thức; đề cao tính mực thước của cổ áo và tay áo kín đáo.'
  },
  {
    id: 'creative-workplace',
    name: 'Modern Creative Workplace',
    vietnameseTitle: 'Không gian Làm việc Sáng tạo & Hội thảo',
    subtitle: 'Văn phòng thiết kế, studio kiến trúc, buổi thuyết trình ý tưởng dự án văn hóa',
    idealHours: '09:00 – 17:00',
    settingVibe: 'Chuyên nghiệp, tinh tế, giàu bản sắc cá nhân',
    curatorialContext: 'Biến áo Việt phục thành một item phong cách (statement piece) có tính ứng dụng cao, dễ dàng di chuyển và làm việc văn phòng.'
  },
  {
    id: 'evening-banquet',
    name: 'Intimate Evening Banquet',
    vietnameseTitle: 'Tiệc tối Trang trọng & Dạ tiệc Gia đình',
    subtitle: 'Nhà hàng fine dining Á Đông, tiệc đính hôn ấm cúng, dạ tiệc ánh nến',
    idealHours: '18:30 – 22:30',
    settingVibe: 'Sang trọng, ấm áp, quý phái nhẹ nhàng',
    curatorialContext: 'Khai thác độ óng ả của gấm sa hoặc lụa dệt hoa chìm dưới ánh nến và đèn vàng ấm, tạo chiều sâu thị giác thanh lịch.'
  },
  {
    id: 'heritage-stroll',
    name: 'Heritage Walk & Museum Discovery',
    vietnameseTitle: 'Dạo bước Phố cổ & Bảo tàng Di sản',
    subtitle: 'Khu phố cổ Hà Nội, phố cổ Hội An, lăng tẩm Cố đô Huế, Bảo tàng Mỹ thuật',
    idealHours: '07:00 – 10:00 & 16:00 – 18:00',
    settingVibe: 'Cổ kính, thơ mộng, đối thoại với lịch sử',
    curatorialContext: 'Sự tương tác hữu cơ giữa người mặc với các mảng tường vôi vàng, ngói âm dương và bóng râm cây cổ thụ.'
  }
];

export const PERSONAL_STYLES: StyleOption[] = [
  {
    id: 'minimalist-contemporary',
    name: 'Minimalist Contemporary',
    vietnameseName: 'Tối giản Đương đại',
    moodDescription: 'Giảm bớt chi tiết rườm rà, tập trung vào đường cắt may tinh khôi, hình khối kỷ hà và bảng màu trung tính trang nhã.',
    keyAesthetic: ['Đường nét dứt khoát', 'Phụ kiện kim loại mạ mờ', 'Quần âu may đo tối giản', 'Bảng màu đá & đất'],
    toneHint: 'Dành cho người yêu vẻ đẹp tinh giản, hiện đại và chuẩn mực'
  },
  {
    id: 'neo-saigon-street',
    name: 'Neo-Heritage Urban',
    vietnameseName: 'Đô thị Giao thoa Hiện đại',
    moodDescription: 'Sự tương phản táo bạo giữa phom áo cổ truyền với các item streetwear cao cấp như chunky loafer, túi xách cấu trúc.',
    keyAesthetic: ['Tương phản phom dáng', 'Giày da chunky hoặc loafer đế cao', 'Kính râm gọng vuông', 'Túi đeo chéo da thật'],
    toneHint: 'Phù hợp người trẻ năng động, thích biểu đạt cá tính độc bản'
  },
  {
    id: 'indochine-poetic',
    name: 'Indochine Poetic Elegance',
    vietnameseName: 'Thanh lịch Thơ mộng Đông Dương',
    moodDescription: 'Gợi nhớ vẻ đẹp phong lưu, quý phái của tranh lụa Mai Trung Thứ, Lê Phổ với chất liệu tơ tằm buông rủ và ngọc trai.',
    keyAesthetic: ['Lụa tơ tằm dệt hoa chìm', 'Trang sức ngọc trai hoặc bạc lọng', 'Guốc mộc cách điệu', 'Khăn lụa vuông twilly'],
    toneHint: 'Dành cho tâm hồn lãng mạn, chuộng nét duyên dáng hoài cổ'
  },
  {
    id: 'monochromatic-zen',
    name: 'Monochromatic Silk & Linen',
    vietnameseName: 'Tơ tằm & Đũi Đơn sắc Thư thái',
    moodDescription: 'Bảng màu thuần khiết tone-sur-tone lấy cảm hứng từ thiên nhiên nhiệt đới: xanh rêu trầm, trà xanh, màu parchment ngà, nâu củ nâu.',
    keyAesthetic: ['Chất liệu thô mộc tự nhiên', 'Bảng màu đơn sắc thuần khiết', 'Phụ kiện gốm mộc / sừng tre', 'Dáng đứng thả lỏng'],
    toneHint: 'Phù hợp người tìm kiếm sự an yên, cân bằng và bền vững'
  }
];

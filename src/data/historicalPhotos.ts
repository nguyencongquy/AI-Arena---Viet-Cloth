/** Historical photographs only. Never substitute contemporary reconstructions. */
export type HistoricalPhoto = {
  id: string;
  src: string;
  width: number;
  height: number;
  date: string;
  alt: string;
  caption: string;
  credit: string;
  sourceUrl: string;
  identificationUrl?: string;
  rights: string;
};

const wedding = {
  id: 'wedding-1936', src: '/historical-photos/wedding-1936.jpg', width: 500, height: 750,
  date: '1936', credit: 'Tư liệu gia đình Nguyễn Văn Huyên · qua Wikimedia Commons',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cố_bộ_trưởng_Nguyễn_Văn_Huyên_và_vợ.jpg',
  rights: 'Nguồn Commons ghi phạm vi công cộng (PD Vietnam / PD 1996).',
};

export const HISTORICAL_PHOTOS: Record<string, HistoricalPhoto[]> = {
  'ao-ngu-than': [{ ...wedding,
    alt: 'Ảnh cưới năm 1936: Nguyễn Văn Huyên đứng bên phải, mặc áo ngũ thân; Vi Kim Ngọc đứng bên trái.',
    caption: 'Nguyễn Văn Huyên (bên phải) mặc áo ngũ thân trong lễ cưới với Vi Kim Ngọc. Ảnh giữ nguyên cả hai người để không mất bối cảnh.',
  }],
  'ao-nhat-binh': [{ ...wedding,
    alt: 'Vi Kim Ngọc đứng bên trái trong áo Nhật Bình, cạnh Nguyễn Văn Huyên trong lễ cưới năm 1936.',
    caption: 'Vi Kim Ngọc (bên trái) mặc áo Nhật Bình trong lễ cưới năm 1936. Cùng ảnh với hồ sơ áo ngũ thân, nhưng nhân vật và phom được giới thiệu khác nhau.',
  }],
  'ao-tac': [{
    id: 'tac-1930s', src: '/historical-photos/tac-1930s.jpg', width: 895, height: 1200,
    date: 'Khoảng thập niên 1930–đầu 1940',
    alt: 'Bửu Thạch bên trái trong áo tấc bát bảo; Phạm Gia Thụy bên phải trong mãng bào.',
    caption: 'Bửu Thạch (bên trái) trong áo tấc bát bảo. Người bên phải, Phạm Gia Thụy, mặc mãng bào — không phải cùng loại áo. Niên đại chỉ là khoảng ước tính do nguồn ghi, chưa xác nhận năm chụp.',
    credit: 'Tác giả chưa rõ · bản ảnh qua bộ sưu tập Mạnh Hải / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Prince_Nguyễn_Phúc_Bửu_Thạch_and_Lord_Phạm_Gia_Thụy_at_the_Altar_of_Heaven.jpg',
    identificationUrl: 'https://commons.wikimedia.org/wiki/File:Áo_tấc_bát_bảo_mãng_bào.jpeg',
    rights: 'Nguồn Commons ghi phạm vi công cộng (PD Vietnam / PD 1996). Dùng bản đen trắng, không dùng bản phục chế màu.',
  }],
  'ao-yem': [{
    id: 'yem-1900-1915', src: '/historical-photos/yem-1900-1915.jpg', width: 700, height: 1097,
    date: 'Khoảng 1900–1915',
    alt: 'Bưu ảnh cổ: một phụ nữ ở Hà Nội mặc yếm, cầm nón trên đầu; hai trẻ em đứng cạnh.',
    caption: 'Người phụ nữ mặc yếm ở Hà Nội trong bưu ảnh đầu thế kỷ XX. Tấm yếm và dây buộc hiện rõ; đây là ảnh người mặc, không phải ảnh phục dựng.',
    credit: 'Tác giả chưa rõ · bưu ảnh cổ qua Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:TONKIN_-_Hanoi_-_Servante_Indigene.jpg',
    rights: 'Nguồn Commons ghi phạm vi công cộng (PD-old-70-expired). Chữ in trên bưu ảnh là chú thích thuộc địa nguyên gốc.',
  }],
  'ao-tu-than': [{
    id: 'tonkingirl1-1919-1926', src: '/historical-photos/tonkingirl1-1919-1926.jpg', width: 445, height: 640,
    date: 'Khoảng 1919–1926',
    alt: 'Ảnh đen trắng một phụ nữ miền Bắc ngồi, mặc áo tứ thân mở vạt, để lộ yếm và phần buộc trước bụng.',
    caption: 'Phụ nữ miền Bắc mặc áo tứ thân: vạt mở phía trước, yếm bên trong và phần buộc ngang bụng. Tên phom được đối chiếu với chú thích trong bài khảo cứu của Nguyễn Thị Chân Quỳnh.',
    credit: 'Tác giả chưa rõ · ảnh qua Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Tonkingirl1.jpg',
    identificationUrl: 'https://dcvonline.net/2026/07/13/ao-dai-xua-va-nay-nhung-ngo-nhan/',
    rights: 'Nguồn Commons ghi phạm vi công cộng. Mốc 1919–1926 là khoảng niên đại của nguồn, không phải một năm chụp xác định.',
  }],
  'ao-giao-linh': [{
    id: 'giao-linh-1897', src: '/historical-photos/giao-linh-1897.jpg', width: 2048, height: 1322,
    date: 'Cuối thế kỷ XIX · nguồn ghi 1897',
    alt: 'Bưu ảnh Nam Định: các sĩ tử trong lễ phục cổ giao lĩnh tại kỳ thi, đứng thành hàng.',
    caption: 'Lễ phục giao lĩnh trong bối cảnh khoa cử. Địa danh Nam Định đọc trực tiếp từ chữ in trên bưu ảnh. Nguồn Commons ghi 1897; năm chụp chưa được đối chiếu độc lập. Đây là biến thể lễ phục, không đồng nhất với minh họa đương đại ở giữa.',
    credit: 'Bưu ảnh cổ · bộ sưu tập qua Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Áo_giao_lĩnh_postcard.jpg',
    rights: 'Nguồn Commons ghi phạm vi công cộng (PD Vietnam / PD-old). Giữ nguyên toàn bộ bưu ảnh và chữ in.',
  }],
  'ao-ba-ba': [{
    id: 'ba-ba-viet-bac-1948', src: '/historical-photos/ba-ba-viet-bac-1948.jpg', width: 411, height: 280,
    date: '1948 · Việt Bắc',
    alt: 'Ảnh đen trắng cuộc họp Chính phủ ở Việt Bắc: Phan Anh mặc áo bà ba màu thẫm, đứng phía trái cạnh Hồ Chí Minh.',
    caption: 'Phan Anh mặc áo bà ba màu thẫm, phía trái cạnh Hồ Chí Minh. Chú thích Báo Tuổi Trẻ xác định trực tiếp trang phục; Báo Dân trí và hồ sơ Commons ghi năm 1948. Ảnh nhóm chỉ cho thấy phần thân trên, không dùng để suy diễn toàn bộ mẫu rập.',
    credit: 'Tác giả chưa rõ · tư liệu qua Báo Dân trí / Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:President_Ho_Chi_Minh_with_some_members_of_the_Resistance_Government_in_Việt_Bắc,_1948.jpg',
    identificationUrl: 'https://tuoitre.vn/dat-diu-con-tho-len-non-theo-chong-95269.htm',
    rights: 'Nguồn Commons ghi phạm vi công cộng (PD Vietnam / PD 1996). Bản số hóa 411 × 280 px; giữ nguyên độ phân giải, không tăng nét bằng AI.',
  }],
};

export const BA_BA_RESEARCH_SOURCE = 'https://cand.vn/Tu-lieu-antg/Huyen-thoai-nu-tuong-Nguyen-Thi-Dinh-%28Tiep-theo-ky-truoc%29-i288245/';

import React from 'react';
import { NavTab } from '../types';
import { Sparkles, BookOpen, Compass, ArrowRight } from 'lucide-react';

interface ManifestoSectionProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const ManifestoSection: React.FC<ManifestoSectionProps> = ({ onNavigateTab }) => {
  return (
    <div className="manifesto-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 pb-24">
      {/* Manifesto Header */}
      <div className="border-b border-[rgba(26,36,33,0.12)] pb-6 space-y-3 text-center sm:text-left">
        <div className="text-xs font-ui text-[#5C7266]">
          Tuyên ngôn V-Styler Atelier · Di sản trong nhịp sống nay
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-[#11383A] font-normal leading-tight">
          Sống Cùng Di Sản: Y Phục Dân Tộc Trong Nhịp Sống Đô Thị Hiện Đại
        </h1>
        <div className="text-xs font-ui text-[#718478] pt-1">
          Góc nhìn về di sản trang phục truyền thống trong đời sống đương đại
        </div>
      </div>

      {/* Long-form editorial reading column */}
      <div className="space-y-8 text-[#26372E] text-base leading-relaxed font-ui">
        {/* Drop cap opening */}
        <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-normal first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#11383A]">
          Trong suốt hàng trăm năm lịch sử, trang phục của người Việt chưa từng là những hiện vật tĩnh tại cất kín trong viện bảo tàng. Từ chiếc áo giao lĩnh thời Lý – Trần, áo đối khâm thời Lê Trung Hưng, cho đến áo ngũ thân lập lĩnh thời Nguyễn hay phong trào áo dài tân thời Đông Dương thập niên 1930, mỗi tà áo đều là tấm gương phản chiếu hơi thở thời đại và tâm hồn dân tộc.
        </p>

        <p>
          Hôm nay, thế hệ trẻ Việt Nam đang đứng trước một câu hỏi đẹp đẽ: Làm sao để di sản không chỉ xuất hiện trong những ngày lễ hội một năm đôi lần, mà có thể bước đi tự nhiên, kiêu hãnh trên giảng đường đại học, trong quán cà phê cuối tuần, tại các phòng trưng bày nghệ thuật đương đại hay những buổi dạ tiệc thân mật?
        </p>

        {/* Pull quote */}
        <div className="my-8 py-6 border-y border-[rgba(26,36,33,0.12)] text-center sm:text-left">
          <blockquote className="text-xl sm:text-2xl font-serif italic font-normal text-[#11383A] leading-snug">
            "Mặc Việt phục hôm nay không phải là diễn tuồng hay phục chế nguyên xi quá khứ. Đó là cuộc đối thoại sống động giữa văn hóa truyền thống và thẩm mỹ cá nhân của người trẻ đương thời."
          </blockquote>
          <div className="text-xs font-ui text-[#718478] mt-2">
            — Tuyên ngôn thực hành phong cách V-Styler
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-semibold text-[#11383A]">
            Ba Giới Hạn Đạo Đức Trong Thực Hành Phong Cách
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-[#3E5247]">
            <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.08)]">
              <span className="font-semibold text-[#11383A] block mb-1">
                1. Tôn trọng phom dáng giải phẫu (Anatomical Integrity):
              </span>
              <span>
                Chúng ta có thể tự do phối màu, phối phụ kiện, layer cùng trang phục hiện đại; nhưng cần giữ trọn sự tôn trọng đối với cấu trúc cổ áo (lập lĩnh, giao lĩnh, nhật bình), vạt hò ngũ thân, số lượng khuy cài bên phải và sự ngay ngắn của phom dáng.
              </span>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.08)]">
              <span className="font-semibold text-[#11383A] block mb-1">
                2. Minh bạch căn cứ tham khảo (Scholarly Grounding):
              </span>
              <span>
                Các sơ đồ phom dáng và mô phỏng hình học tại Atelier được tham khảo từ các tài liệu nghiên cứu trang phục dân tộc đã xuất bản, minh bạch giới hạn giữa trang phục thực tế và mô hình minh họa kỹ thuật số.
              </span>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.08)]">
              <span className="font-semibold text-[#11383A] block mb-1">
                3. Tôn vinh các làng nghề dệt thủ công (Textile Heritage):
              </span>
              <span>
                Khuyến khích sử dụng lụa Vạn Phúc, tơ tằm Bảo Lộc, đũi Nam Cao, lãnh Mỹ A — những giá trị vật chất thấm đẫm mồ hôi và tài hoa của các nghệ nhân dệt may truyền thống Việt Nam.
              </span>
            </div>
          </div>
        </div>

        {/* Archival Model Note */}
        <div className="pt-4 border-t border-[rgba(26,36,33,0.12)]">
          <div className="text-xs text-[#52665B] bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.08)] leading-relaxed">
            <strong>Ghi chú thực hành:</strong> Các mô phỏng hình học trong Archive và Studio là công cụ trực quan hóa hỗ trợ nhận diện phom dáng cơ bản và gợi ý phối đồ đương đại. Trải nghiệm tập trung vào tính tương tác thẩm mỹ, không thay thế tài liệu hiện vật gốc.
          </div>
        </div>

        {/* Action card */}
        <div className="pt-6 border-t border-[rgba(26,36,33,0.12)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="font-serif font-semibold text-lg text-[#11383A]">
              Sẵn sàng trải nghiệm phong cách của riêng bạn?
            </div>
            <div className="text-xs text-[#62756B]">
              Bước vào phòng phối đồ để nhận gợi ý phối đồ theo bối cảnh thực tế.
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('studio')}
            className="px-5 py-2.5 text-xs uppercase tracking-wider font-semibold text-[#F8F5EE] bg-[#11383A] hover:bg-[#0c292b] rounded transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4B872]" />
            <span>Mở Phòng Phối Đồ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

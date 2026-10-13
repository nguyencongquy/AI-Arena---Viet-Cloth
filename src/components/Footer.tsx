import React from 'react';
import { NavTab } from '../types';

interface FooterProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="border-t border-[rgba(26,36,33,0.12)] bg-[#F3EFE6] text-[#42554B] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[rgba(26,36,33,0.08)] pb-8">
          <div>
            <div className="text-xl font-serif font-normal text-[#11383A] tracking-tight">
              V-Styler Atelier
            </div>
            <p className="text-xs font-body text-[#63756C] mt-1 max-w-md">
              Xưởng thực hành phong cách y phục truyền thống Việt Nam dành cho thế hệ trẻ. Tôn vinh di sản qua góc nhìn thẩm mỹ đương đại.
            </p>
          </div>

          <nav className="flex items-center gap-6 text-xs font-ui">
            <button
              onClick={() => onNavigateTab('explore')}
              className="text-[#42554B] hover:text-[#11383A] transition-colors cursor-pointer"
            >
              Explore
            </button>
            <button
              onClick={() => onNavigateTab('archive')}
              className="text-[#42554B] hover:text-[#11383A] transition-colors cursor-pointer"
            >
              Việt phục Archive
            </button>
            <button
              onClick={() => onNavigateTab('studio')}
              className="text-[#42554B] hover:text-[#11383A] transition-colors cursor-pointer"
            >
              Styling Studio
            </button>
            <button
              onClick={() => onNavigateTab('manifesto')}
              className="text-[#42554B] hover:text-[#11383A] transition-colors cursor-pointer"
            >
              Manifesto
            </button>
          </nav>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-ui text-[#6C7E75]">
          <div>
            <span>© 2026 V-Styler Atelier. Mọi bản quyền phác thảo hình thái học được bảo lưu.</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-ui">
            <span>Dự án thể nghiệm thực hành phong cách y phục truyền thống Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { GarmentSpecimen } from '../types';
import { ArchivalPlaceholderPlate } from './ArchivalPlaceholderPlate';
import { X, Sparkles, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

interface SpecimenModalProps {
  garment: GarmentSpecimen | null;
  onClose: () => void;
  onSelectForStudio: (garmentId: string) => void;
}

export const SpecimenModal: React.FC<SpecimenModalProps> = ({
  garment,
  onClose,
  onSelectForStudio,
}) => {
  if (!garment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative bg-[#FCFAF6] rounded max-w-3xl w-full border border-[rgba(26,36,33,0.18)] shadow-2xl overflow-hidden my-8">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(26,36,33,0.1)] bg-[#F8F5EE]">
          <div className="flex items-center gap-2 text-xs font-ui text-[#5C7266]">
            <span className="w-2 h-2 rounded-full bg-[#11383A]" />
            <span className="font-semibold text-[#11383A]">{garment.accessionCode}</span>
            <span>· Hồ sơ khảo cứu Việt phục</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#607368] hover:text-[#11383A] rounded hover:bg-[#EBE5D6] transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Header titles */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl sm:text-3xl font-serif text-[#11383A]">
                {garment.name}
              </h2>
              <span className="text-xs font-ui text-[#78887F] px-2 py-0.5 bg-[#F2ECE0] rounded border border-[#DFD6C3]">
                {garment.sinoVietnamese}
              </span>
            </div>
            <div className="text-sm font-serif italic text-[#63766D]">
              {garment.englishName}
            </div>
          </div>

          {/* Blueprint and Fast Facts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5">
              <ArchivalPlaceholderPlate
                accessionCode={garment.accessionCode}
                garmentName={garment.name}
                dynastyPeriod={garment.dynastyPeriod}
                silhouetteVector={garment.silhouetteVector}
                accentHex={garment.accentHex}
                heightClass="h-72"
                showCaption={false}
              />
            </div>

            <div className="md:col-span-7 space-y-4 text-xs font-body">
              <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.08)] space-y-2.5">
                <div>
                  <span className="font-ui text-[#72857A] block text-[11px] font-medium">
                    Niên đại & triều đại
                  </span>
                  <span className="text-[#1A2421] font-medium text-xs leading-relaxed">
                    {garment.dynastyPeriod} ({garment.chronologyRange})
                  </span>
                </div>

                <div>
                  <span className="font-ui text-[#72857A] block text-[11px] font-medium">
                    Cấu trúc cổ áo (Collar)
                  </span>
                  <span className="text-[#1A2421] leading-relaxed">
                    {garment.collarStructure}
                  </span>
                </div>

                <div>
                  <span className="font-ui text-[#72857A] block text-[11px] font-medium">
                    Cấu trúc tay áo (Sleeves)
                  </span>
                  <span className="text-[#1A2421] leading-relaxed">
                    {garment.sleeveStructure}
                  </span>
                </div>

                <div>
                  <span className="font-ui text-[#72857A] block text-[11px] font-medium">
                    Giải phẫu thân vải (Panel anatomy)
                  </span>
                  <span className="text-[#1A2421] leading-relaxed">
                    {garment.panelAnatomy}
                  </span>
                </div>

                <div>
                  <span className="font-ui text-[#72857A] block text-[11px] font-medium">
                    Chất liệu dệt truyền thống
                  </span>
                  <span className="text-[#1A2421] leading-relaxed">
                    {garment.traditionalFabrics.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Curatorial Summary & Historical Quotes */}
          <div className="space-y-4 pt-2 border-t border-[rgba(26,36,33,0.08)]">
            <div className="space-y-2">
              <h3 className="text-xs font-ui font-medium text-[#5C7266]">
                Ý nghĩa biểu tượng & đời sống lễ tiết
              </h3>
              <p className="text-xs sm:text-sm text-[#3E5247] font-body leading-relaxed">
                {garment.curatorialSummary}
              </p>
            </div>

            {/* Historical quote block */}
            <div className="bg-[#F5F0E4] p-4 rounded border-l-3 border-[#11383A] text-xs space-y-1.5 italic font-serif">
              <p className="text-[#2B3B33] leading-relaxed">
                "{garment.historicalQuotes.quote}"
              </p>
              <div className="text-[11px] font-ui not-italic text-[#6B7D72] pt-1">
                — {garment.historicalQuotes.source}
              </div>
            </div>
          </div>

          {/* Scholarly citations */}
          <div className="space-y-2 pt-2 border-t border-[rgba(26,36,33,0.08)]">
            <div className="flex items-center gap-1.5 text-xs font-ui text-[#5C7266]">
              <BookOpen className="w-3.5 h-3.5 text-[#963D2E]" />
              <span>Tài liệu khảo cứu & xác thực:</span>
            </div>
            <ul className="space-y-1 text-xs text-[#52655A] font-body">
              {garment.scholarlyCitations.map((cite, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-[#11383A] font-bold">·</span>
                  <span>{cite}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#F8F5EE] border-t border-[rgba(26,36,33,0.1)] flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-ui font-medium text-[#465A50] hover:text-[#11383A] cursor-pointer"
          >
            Đóng lại
          </button>

          <button
            onClick={() => {
              onClose();
              onSelectForStudio(garment.id);
            }}
            className="px-5 py-2.5 text-xs font-ui font-medium text-[#F8F5EE] bg-[#11383A] hover:bg-[#0c292b] rounded transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D4B872]" />
            <span>Đưa phom áo này vào Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};

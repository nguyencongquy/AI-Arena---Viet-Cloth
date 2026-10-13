import React from 'react';
import { SilhouetteVector } from '../types';

interface ArchivalPlaceholderPlateProps {
  accessionCode: string;
  garmentName: string;
  dynastyPeriod: string;
  silhouetteVector: SilhouetteVector;
  accentHex?: string;
  heightClass?: string;
  showCaption?: boolean;
}

export const ArchivalPlaceholderPlate: React.FC<ArchivalPlaceholderPlateProps> = ({
  accessionCode,
  garmentName,
  dynastyPeriod,
  silhouetteVector,
  accentHex = '#11383A',
  heightClass = 'h-72 sm:h-80',
  showCaption = true,
}) => {
  // Render clean architectural blueprint line art for the silhouette type
  const renderSilhouetteBlueprint = () => {
    switch (silhouetteVector) {
      case 'standing-five-panel':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Center collar standing with 5 buttons */}
            <path d="M 92 36 L 92 48 Q 100 52 108 48 L 108 36" strokeDasharray="1 0" />
            <circle cx="108" cy="42" r="2" fill="currentColor" />
            <circle cx="112" cy="56" r="2" fill="currentColor" />
            <circle cx="116" cy="72" r="2" fill="currentColor" />
            <circle cx="120" cy="90" r="2" fill="currentColor" />
            <circle cx="123" cy="110" r="2" fill="currentColor" />
            {/* Shoulders and tight fitted sleeves (tay chẽn) */}
            <path d="M 92 44 L 46 64 L 28 116 L 38 120 L 58 76 L 76 86 L 68 230 L 132 230 L 124 86 L 142 76 L 162 120 L 172 116 L 154 64 L 108 44" />
            {/* Overlapping flap (Vạt hò) curve */}
            <path d="M 108 48 Q 124 78 124 112 L 124 230" strokeDasharray="3 3" />
            {/* Inner child panel guideline */}
            <path d="M 92 48 L 92 110 L 80 230" strokeDasharray="2 3" opacity="0.5" />
            {/* Hemline and side slit indicator */}
            <line x1="68" y1="160" x2="68" y2="230" strokeWidth="1.8" />
            <line x1="132" y1="160" x2="132" y2="230" strokeWidth="1.8" />
            {/* Accession technical callout labels */}
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              TỶ LỆ THÂN ÁO 5 VẠT · TAY CHẼN
            </text>
          </svg>
        );

      case 'wide-sleeve-tac':
        return (
          <svg viewBox="0 0 240 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Standing collar */}
            <path d="M 112 36 L 112 48 Q 120 52 128 48 L 128 36" />
            {/* Wide flowing sleeves (tay thụng rộng 35-40cm) */}
            <path d="M 112 44 L 60 56 L 12 80 L 12 170 Q 30 174 60 145 L 82 100 L 74 230 L 166 230 L 158 100 L 180 145 Q 210 174 228 170 L 228 80 L 180 56 L 128 44" />
            {/* Center overlap and hem */}
            <path d="M 128 48 Q 146 76 146 115 L 146 230" strokeDasharray="3 3" />
            <line x1="74" y1="170" x2="74" y2="230" strokeWidth="1.8" />
            <line x1="166" y1="170" x2="166" y2="230" strokeWidth="1.8" />
            <circle cx="128" cy="42" r="2" fill="currentColor" />
            <circle cx="134" cy="58" r="2" fill="currentColor" />
            <circle cx="140" cy="76" r="2" fill="currentColor" />
            <text x="120" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              TAY THỤNG ĐẠI LỄ · RỘNG 38CM
            </text>
          </svg>
        );

      case 'square-collar-nhat-binh':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Rectangular wide chest collar plaque (Nhật Bình) */}
            <rect x="82" y="38" width="36" height="74" rx="1" strokeWidth="1.5" />
            <line x1="100" y1="38" x2="100" y2="112" strokeDasharray="2 2" />
            {/* Robe outer frame */}
            <path d="M 82 44 L 42 60 L 22 108 L 36 114 L 62 80 L 62 230 L 138 230 L 138 80 L 164 114 L 178 108 L 158 60 L 118 44" />
            {/* Cuffs with 5-color stripes indication */}
            <line x1="22" y1="102" x2="36" y2="108" strokeWidth="0.8" />
            <line x1="24" y1="96" x2="38" y2="102" strokeWidth="0.8" />
            <line x1="26" y1="90" x2="40" y2="96" strokeWidth="0.8" />
            <line x1="178" y1="102" x2="164" y2="108" strokeWidth="0.8" />
            <line x1="176" y1="96" x2="162" y2="102" strokeWidth="0.8" />
            <line x1="174" y1="90" x2="160" y2="96" strokeWidth="0.8" />
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              NẸP CỔ CHỮ NHẬT · TAY ÁO NGŨ SẮC
            </text>
          </svg>
        );

      case 'cross-collar-giao-linh':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Overlapping V-neck lapel (Giao Lĩnh) */}
            <path d="M 76 36 L 126 100 L 126 230" strokeWidth="1.4" />
            <path d="M 124 36 L 94 74" strokeDasharray="3 3" />
            {/* Wide robe outline */}
            <path d="M 76 36 L 36 56 L 16 112 L 32 118 L 58 84 L 58 230 L 142 230 L 142 84 L 168 118 L 184 112 L 164 56 L 124 36" />
            {/* Belt tie ribbon */}
            <rect x="80" y="112" width="40" height="6" fill="currentColor" opacity="0.3" />
            <path d="M 98 118 L 92 165 M 102 118 L 106 172" strokeWidth="1" />
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              GIAO LÃNH VẠT CHÉO · THẮT LỤA HÔNG
            </text>
          </svg>
        );

      case 'parallel-doi-kham':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Parallel front lapels from neck straight to hem */}
            <line x1="88" y1="36" x2="88" y2="230" strokeWidth="1.4" />
            <line x1="112" y1="36" x2="112" y2="230" strokeWidth="1.4" />
            {/* Outer duster coat frame */}
            <path d="M 88 36 L 44 54 L 26 112 L 40 118 L 68 82 L 68 230 L 132 230 L 132 82 L 160 118 L 174 112 L 156 54 L 112 36" />
            <line x1="68" y1="230" x2="88" y2="230" />
            <line x1="112" y1="230" x2="132" y2="230" />
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              CỔ XẺ SONG SONG ĐỐI KHÂM
            </text>
          </svg>
        );

      case 'standalone-yem':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Neck tie straps reaching around the neck */}
            <path d="M 85 75 Q 80 45 76 35 M 115 75 Q 120 45 124 35" strokeWidth="1" strokeDasharray="2 2" />
            {/* Small front bodice panel covering the chest (rhombus / diamond yếm panel) */}
            <path d="M 85 75 Q 100 80 115 75 L 146 122 L 100 168 L 54 122 Z" strokeWidth="1.6" />
            {/* Side ties for tying behind the back */}
            <path d="M 54 122 Q 35 128 18 136 M 146 122 Q 165 128 182 136" strokeWidth="1" strokeDasharray="2 2" />
            {/* Fine decorative stitching detail along neckline */}
            <path d="M 88 82 Q 100 86 112 82" strokeWidth="0.8" opacity="0.6" />
            {/* Technical label explicitly noting standalone bodice panel: no sleeves, no long body, no robe */}
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              TẤM YẾM CHE NGỰC · DÂY BUỘC CỔ & LƯNG (KHÔNG TAY / KHÔNG VẠT DÀI)
            </text>
          </svg>
        );

      case 'four-panel-tu-than':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Neck opening - no collar buttons */}
            <path d="M 88 38 Q 100 46 112 38" />
            {/* Shoulders and sleeves */}
            <path d="M 88 38 L 48 56 L 30 108 L 40 112 L 60 76 L 76 86 L 76 230 M 124 86 L 124 230 M 112 38 L 152 56 L 170 108 L 160 112 L 140 76 L 124 86" />
            {/* Two front panels open and tied at waist */}
            <path d="M 88 38 L 94 110 L 82 170 L 76 230" />
            <path d="M 112 38 L 106 110 L 118 170 L 124 230" />
            {/* Waist ties/knot */}
            <circle cx="100" cy="115" r="3" fill="currentColor" />
            <path d="M 98 116 Q 92 145 88 175" strokeWidth="1.2" />
            <path d="M 102 116 Q 108 145 112 175" strokeWidth="1.2" />
            {/* Spine seam indication for 2 back panels */}
            <line x1="100" y1="46" x2="100" y2="105" strokeDasharray="2 3" opacity="0.6" />
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              ÁO TỨ THÂN · 4 VẠT THÂN VẢI · BUỘC BỤNG
            </text>
          </svg>
        );

      case 'ba-ba-tunic':
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-85" strokeWidth="1.2">
            {/* Rounded modest neckline and interior binding */}
            <path d="M 88 38 Q 100 45 112 38" strokeWidth="1.4" />
            <path d="M 89 41 Q 100 47 111 41" strokeWidth="0.8" opacity="0.6" />
            {/* Raglan diagonal shoulder seams */}
            <line x1="88" y1="38" x2="72" y2="84" strokeWidth="1.0" strokeDasharray="3 2" opacity="0.7" />
            <line x1="112" y1="38" x2="128" y2="84" strokeWidth="1.0" strokeDasharray="3 2" opacity="0.7" />
            {/* Center front opening slit */}
            <line x1="100" y1="45" x2="100" y2="182" strokeWidth="1.4" />
            {/* Front vertical button row */}
            <circle cx="100" cy="62" r="1.8" fill="currentColor" />
            <circle cx="100" cy="84" r="1.8" fill="currentColor" />
            <circle cx="100" cy="106" r="1.8" fill="currentColor" />
            <circle cx="100" cy="128" r="1.8" fill="currentColor" />
            <circle cx="100" cy="150" r="1.8" fill="currentColor" />
            {/* Body contour with modest waist shape & sleeves */}
            <path d="M 88 38 L 46 56 L 28 116 L 38 122 L 56 78 L 72 84 Q 74 122 71 180 L 100 182 L 129 180 Q 126 122 128 84 L 144 78 L 162 122 L 172 116 L 154 56 L 112 38" />
            {/* Side hip slits */}
            <line x1="71" y1="145" x2="71" y2="180" strokeWidth="2" />
            <line x1="129" y1="145" x2="129" y2="180" strokeWidth="2" />
            {/* Two lower patch pockets (Hallmark of Southern Áo bà ba) */}
            <rect x="79" y="142" width="14" height="18" rx="1" strokeWidth="1.0" />
            <line x1="79" y1="145" x2="93" y2="145" strokeWidth="0.8" />
            <rect x="107" y="142" width="14" height="18" rx="1" strokeWidth="1.0" />
            <line x1="107" y1="145" x2="121" y2="145" strokeWidth="0.8" />
            {/* Sleeve cuffs */}
            <line x1="28" y1="116" x2="38" y2="122" strokeWidth="1.4" />
            <line x1="172" y1="116" x2="162" y2="122" strokeWidth="1.4" />
            <text x="100" y="210" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              ÁO BÀ BA · TAY RAGLAN · 2 TÚI VẠT DƯỚI · XẺ TÀ
            </text>
          </svg>
        );

      case 'modern-retro-lemur':
      default:
        return (
          <svg viewBox="0 0 200 260" className="w-full h-full max-h-56 stroke-current fill-none opacity-80" strokeWidth="1.2">
            {/* Low Mandarin or lotus collar */}
            <path d="M 94 38 Q 100 42 106 38" strokeWidth="1.4" />
            {/* Fitted waist and two flowing panels */}
            <path d="M 94 38 L 52 56 L 36 102 L 46 106 L 68 76 Q 78 110 82 130 L 64 230 L 136 230 L 118 130 Q 122 110 132 76 L 154 106 L 164 102 L 148 56 L 106 38" />
            <line x1="100" y1="42" x2="108" y2="68" strokeDasharray="2 2" />
            <line x1="82" y1="130" x2="118" y2="130" strokeDasharray="1 3" opacity="0.5" />
            <text x="100" y="248" textAnchor="middle" className="text-[8px] font-ui font-medium fill-current stroke-none">
              TÂN THỜI 2 TÀ · CHÍT EO ĐÔNG DƯƠNG
            </text>
          </svg>
        );
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Archival Blueprint Container */}
      <div
        className={`relative ${heightClass} w-full bg-[#F3EFE6] rounded border border-[rgba(26,36,33,0.12)] p-4 flex flex-col items-center justify-between overflow-hidden shadow-inner group`}
      >
        {/* Subtle Archival Grid / Fine Millimeter Grid Lines */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(26, 36, 33, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(26, 36, 33, 0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Top Header: Accession Code & Official Curatorial Specimen Label */}
        <div className="relative z-10 w-full flex items-center justify-between text-[11px] font-ui text-[#4A5D54] border-b border-[rgba(26,36,33,0.08)] pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#11383A] inline-block" />
            <span className="font-semibold text-[#11383A]">{accessionCode}</span>
          </div>
          <span className="text-[10px] text-[#6B7C72]">
            Bản vẽ giải phẫu thị giác
          </span>
        </div>

        {/* Center: Scaled Silhouette Architectural Blueprint */}
        <div
          className="relative z-10 w-full flex-1 flex items-center justify-center p-2 text-[#11383A]"
          style={{ color: accentHex }}
        >
          {renderSilhouetteBlueprint()}
        </div>

        {/* Bottom Banner: Explicit Archival Notice */}
        <div className="relative z-10 w-full pt-2 border-t border-[rgba(26,36,33,0.08)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 text-[11px] text-[#55695E] font-ui">
          <div className="flex items-center gap-1">
            <span className="font-medium text-[#11383A]">Phom dáng:</span>
            <span className="truncate max-w-[150px]">{garmentName}</span>
          </div>
          <div className="text-[#8C765C] text-[10px] bg-[#FAF8F2] px-1.5 py-0.5 border border-[#E5DFD1] rounded font-ui">
            Đang chờ ảnh chụp kiểm định
          </div>
        </div>
      </div>

      {/* Optional Editorial Technical Caption */}
      {showCaption && (
        <div className="mt-2 flex items-center justify-between text-xs text-[#697A70] px-1 font-ui">
          <span className="italic">{dynastyPeriod}</span>
          <span>Hồ sơ khảo cứu Việt phục</span>
        </div>
      )}
    </div>
  );
};

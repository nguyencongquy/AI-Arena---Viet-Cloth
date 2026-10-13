import React, { useState, useEffect } from 'react';
import { GarmentSpecimen, UserUploadedItem, CuratedLookSuggestion } from '../types';
import { GARMENT_ARCHIVE } from '../data/garments';
import { OCCASIONS, PERSONAL_STYLES } from '../data/occasionsAndStyles';
import { generateSuggestedLooks } from '../data/curatedLooks';
import { ArchivalPlaceholderPlate } from './ArchivalPlaceholderPlate';
import { ApprovedGarmentMotion } from './ApprovedGarmentMotion';
import { 
  Sparkles, 
  Upload, 
  Check, 
  Copy, 
  Bookmark, 
  BookmarkCheck, 
  RefreshCw, 
  Palette,
  Sliders,
  Layers,
  Crown,
  Footprints,
  Info
} from 'lucide-react';

interface StudioSectionProps {
  preselectedGarmentId?: string;
  preselectedFabricColor?: string | null;
  onInspectGarment: (garment: GarmentSpecimen) => void;
  savedLooks: string[];
  onToggleSaveLook: (lookId: string) => void;
}

// Layering options for mix & match
interface LayerOption {
  id: string;
  name: string;
  category: string;
  compatibilityNote?: string;
}

const UNDER_LAYERS: LayerOption[] = [
  { id: 'yem-dao', name: 'Yếm đào lụa mộc', category: 'Lớp trong', compatibilityNote: 'Chuẩn mực khi phối cùng Áo tứ thân hoặc khoác ngoài Nhật Bình' },
  { id: 'ao-lot-trang', name: 'Áo lót cổ đứng trắng', category: 'Lớp trong', compatibilityNote: 'Lộ viền cổ 0.5cm thanh tao khi phối Áo ngũ thân & Áo tấc' },
  { id: 'ao-thun-basic', name: 'Áo thun cơ bản', category: 'Lớp trong', compatibilityNote: 'Phong cách đương đại năng động khi mở tà' },
  { id: 'none', name: 'Mặc đơn trực tiếp', category: 'Lớp trong', compatibilityNote: 'Phù hợp áo có cúc kín như Áo bà ba hoặc chất liệu lụa dày' }
];

const BOTTOM_LAYERS: LayerOption[] = [
  { id: 'quan-lua-rong', name: 'Quần lụa ống rộng', category: 'Quần / Váy', compatibilityNote: 'Phom dáng truyền thống buông rủ thanh nhã' },
  { id: 'quan-au-may-do', name: 'Quần âu may đo ống đứng', category: 'Quần / Váy', compatibilityNote: 'Tối giản đương đại cho môi trường làm việc & triển lãm' },
  { id: 'chan-vay-lua', name: 'Chân váy lụa xếp ly dài', category: 'Quần / Váy', compatibilityNote: 'Nữ tính, thướt tha hòa quyện phong vị Đông Dương' },
  { id: 'quan-jeans-suong', name: 'Quần denim suông mộc', category: 'Quần / Váy', compatibilityNote: 'Tương phản cá tính giữa cổ điển và đường phố' }
];

const HEADWEAR_OPTIONS: LayerOption[] = [
  { id: 'khan-van', name: 'Khăn vấn (Khăn đóng)', category: 'Phụ kiện đầu', compatibilityNote: 'Quy chuẩn lễ nghi trang trọng cho Áo ngũ thân và Áo tấc' },
  { id: 'non-ba-tam', name: 'Nón ba tầm / Quai thao', category: 'Phụ kiện đầu', compatibilityNote: 'Biểu tượng duyên dáng của phụ nữ Kinh Bắc bên tà Áo tứ thân' },
  { id: 'tram-bac', name: 'Trâm bạc / Cài tóc tối giản', category: 'Phụ kiện đầu', compatibilityNote: 'Gọn gàng, tinh tế cho không gian hiện đại' },
  { id: 'toc-buong', name: 'Tóc buông tự nhiên', category: 'Phụ kiện đầu', compatibilityNote: 'Thoải mái cho dạo phố và cà phê cuối tuần' }
];

const FOOTWEAR_OPTIONS: LayerOption[] = [
  { id: 'guoc-moc', name: 'Guốc mộc sơn mài', category: 'Giày dép', compatibilityNote: 'Âm thanh lách cách mộc mạc đặc trưng của văn hóa Việt' },
  { id: 'hai-theu', name: 'Hài thêu cung đình', category: 'Giày dép', compatibilityNote: 'Đài các, trang trọng cho các dịp nghi lễ và tiệc tối' },
  { id: 'loafer-da', name: 'Loafer da tối giản', category: 'Giày dép', compatibilityNote: 'Giao thoa phong thái học giả hiện đại' },
  { id: 'mule-thap', name: 'Dép Mule gót thấp', category: 'Giày dép', compatibilityNote: 'Nhẹ nhàng, thanh thoát cho ngày thường' }
];

export const StudioSection: React.FC<StudioSectionProps> = ({
  preselectedGarmentId,
  preselectedFabricColor,
  onInspectGarment,
  savedLooks,
  onToggleSaveLook,
}) => {
  // Primary selections
  const [selectedGarmentId, setSelectedGarmentId] = useState<string>(
    preselectedGarmentId || GARMENT_ARCHIVE[0].id
  );
  const [isCustomUploadActive, setIsCustomUploadActive] = useState<boolean>(false);
  const [uploadedItem, setUploadedItem] = useState<UserUploadedItem | null>(null);
  const [customItemTitle, setCustomItemTitle] = useState<string>('Áo ngũ thân lụa tơ tằm cá nhân');

  const [selectedOccasionId, setSelectedOccasionId] = useState<string>(OCCASIONS[0].id);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(PERSONAL_STYLES[0].id);

  // Mix & Match Layer States
  const [selectedUnderLayer, setSelectedUnderLayer] = useState<string>(UNDER_LAYERS[0].id);
  const [selectedBottomLayer, setSelectedBottomLayer] = useState<string>(BOTTOM_LAYERS[0].id);
  const [selectedHeadwear, setSelectedHeadwear] = useState<string>(HEADWEAR_OPTIONS[0].id);
  const [selectedFootwear, setSelectedFootwear] = useState<string>(FOOTWEAR_OPTIONS[0].id);

  // Output looks state
  const [generatedLooks, setGeneratedLooks] = useState<CuratedLookSuggestion[]>([]);
  const [activeLookIndex, setActiveLookIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Sync if preselectedGarmentId changes from outside
  useEffect(() => {
    if (preselectedGarmentId) {
      setSelectedGarmentId(preselectedGarmentId);
      setIsCustomUploadActive(false);
    }
  }, [preselectedGarmentId]);

  // Regenerate looks when core parameters change
  useEffect(() => {
    handleGenerateLooks();
  }, [selectedGarmentId, selectedOccasionId, selectedStyleId, isCustomUploadActive]);

  const handleGenerateLooks = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const looks = generateSuggestedLooks(
        selectedGarmentId,
        selectedOccasionId,
        selectedStyleId,
        isCustomUploadActive ? customItemTitle : undefined
      );
      setGeneratedLooks(looks);
      setActiveLookIndex(0);
      setIsGenerating(false);
    }, 150);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedItem({
          fileName: file.name,
          previewUrl: reader.result as string,
          customCategory: 'Trang phục Việt cá nhân',
          notes: 'Mẫu vải / áo tải lên phục vụ phối đồ đương đại',
        });
        setIsCustomUploadActive(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentGarment = GARMENT_ARCHIVE.find((g) => g.id === selectedGarmentId) || GARMENT_ARCHIVE[0];
  const currentOccasion = OCCASIONS.find((o) => o.id === selectedOccasionId) || OCCASIONS[0];
  const currentStyle = PERSONAL_STYLES.find((s) => s.id === selectedStyleId) || PERSONAL_STYLES[0];
  const activeLook = generatedLooks[activeLookIndex] || generatedLooks[0];

  const currentUnder = UNDER_LAYERS.find(l => l.id === selectedUnderLayer) || UNDER_LAYERS[0];
  const currentBottom = BOTTOM_LAYERS.find(l => l.id === selectedBottomLayer) || BOTTOM_LAYERS[0];
  const currentHead = HEADWEAR_OPTIONS.find(l => l.id === selectedHeadwear) || HEADWEAR_OPTIONS[0];
  const currentFoot = FOOTWEAR_OPTIONS.find(l => l.id === selectedFootwear) || FOOTWEAR_OPTIONS[0];

  // Styling combination suggestions
  const getCulturalAdvice = () => {
    if (selectedGarmentId === 'ao-tac') {
      return 'Gợi ý kết hợp Áo Tấc cùng Khăn vấn và Hài thêu cho các dịp trang trọng.';
    }
    if (selectedGarmentId === 'ao-tu-than') {
      return 'Gợi ý phối Áo Tứ Thân cùng Yếm đào bên trong ngực và Nón ba tầm / quai thao.';
    }
    if (selectedGarmentId === 'ao-nhat-binh') {
      return 'Áo Nhật Bình có vạt mở xẻ ngực: Gợi ý mặc cùng Yếm hoặc áo lót kín đáo.';
    }
    if (selectedGarmentId === 'ao-ba-ba') {
      return 'Gợi ý phối Áo Bà Ba cùng Quần lụa ống rộng và Guốc mộc hoặc Dép mule.';
    }
    return 'Gợi ý kết hợp Áo Ngũ Thân cùng lớp áo lót trắng bên trong tạo nét ngay ngắn, chỉn chu.';
  };

  const handleCopyStyleNotes = () => {
    if (!activeLook) return;
    const textToCopy = `[V-Styler Atelier] ${activeLook.lookTitle}
Bối cảnh: ${currentOccasion.vietnameseTitle}
Phong cách: ${currentStyle.vietnameseName}
Trang phục chính: ${currentGarment.name}
Lớp lót: ${currentUnder.name}
Quần / Chân váy: ${currentBottom.name}
Phụ kiện đầu: ${currentHead.name}
Giày dép: ${currentFoot.name}
Lời khuyên phối: ${getCulturalAdvice()}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-20">
      {/* Studio Header */}
      <div className="border-b border-[rgba(26,36,33,0.12)] pb-4 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-ui text-[#5C7266]">
          <Sliders className="w-3.5 h-3.5 text-[#11383A]" />
          <span>Styling Studio · Phòng thực hành phối đồ</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-normal text-[#11383A]">
              Phòng Phối Đồ Việt Phục Đương Đại
            </h1>
            <p className="text-xs sm:text-sm font-body text-[#465A50] mt-0.5 max-w-2xl">
              Chọn trang phục, tùy biến các lớp y phục (yếm, áo ngoài, nón, guốc) và bối cảnh để khám phá gợi ý phối đồ đương đại.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateLooks}
              disabled={isGenerating}
              className="px-3.5 py-1.5 text-xs font-ui font-medium text-[#F8F5EE] bg-[#11383A] hover:bg-[#0c292b] rounded transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Làm mới gợi ý</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column (5 Cols): Garment, Layers & Occasion Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* STEP 1: Garment Selection */}
          <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.12)] space-y-3">
            <div className="flex items-center justify-between border-b border-[rgba(26,36,33,0.08)] pb-1.5">
              <span className="text-xs font-ui font-medium text-[#11383A]">
                1. Chọn trang phục di sản
              </span>
              <span className="text-[11px] font-ui text-[#718478]">
                {isCustomUploadActive ? 'Mẫu tự tải' : '7 phom Archive'}
              </span>
            </div>

            {/* Toggle: Archive vs Upload */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#EFE9DC] p-1 rounded font-ui text-xs">
              <button
                onClick={() => setIsCustomUploadActive(false)}
                className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  !isCustomUploadActive
                    ? 'bg-[#11383A] text-[#F8F5EE] shadow-xs'
                    : 'text-[#485B51] hover:text-[#11383A]'
                }`}
              >
                Việt phục Archive
              </button>
              <button
                onClick={() => setIsCustomUploadActive(true)}
                className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                  isCustomUploadActive
                    ? 'bg-[#11383A] text-[#F8F5EE] shadow-xs'
                    : 'text-[#485B51] hover:text-[#11383A]'
                }`}
              >
                Tải lên áo cá nhân
              </button>
            </div>

            {!isCustomUploadActive ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {GARMENT_ARCHIVE.map((garment) => {
                    const isSelected = selectedGarmentId === garment.id;
                    return (
                      <button
                        key={garment.id}
                        onClick={() => setSelectedGarmentId(garment.id)}
                        className={`p-2.5 rounded text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#FCFAF6] border-[#11383A] ring-1 ring-[#11383A] shadow-xs'
                            : 'bg-[#F5F0E4] border-[rgba(26,36,33,0.1)] hover:border-[rgba(26,36,33,0.25)]'
                        }`}
                      >
                        <div className="text-[10px] font-ui text-[#718478] mb-0.5 flex items-center justify-between">
                          <span>{garment.accessionCode}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#11383A]" />}
                        </div>
                        <div className="font-serif font-normal text-xs text-[#11383A] leading-tight">
                          {garment.name}
                        </div>
                        <div className="text-[10px] text-[#63766D] font-body mt-0.5 truncate">
                          {garment.chronologyRange || garment.dynastyPeriod}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Plate Preview */}
                <div className="pt-2 border-t border-[rgba(26,36,33,0.06)]">
                  <div style={{ height: 270 }}><ApprovedGarmentMotion garmentId={currentGarment.id} name={currentGarment.name} paused={false} active fabricColor={selectedGarmentId === preselectedGarmentId ? preselectedFabricColor : null} /></div>
                  {selectedGarmentId === preselectedGarmentId && <p className="text-xs font-ui text-[#63766D] text-center">{preselectedFabricColor ? `Màu vải đã chọn: ${preselectedFabricColor.toUpperCase()}` : 'Màu vải nguyên bản'}</p>}
                  <div className="mt-1.5 flex items-center justify-between text-xs font-ui">
                    <span className="text-[#6A7C71] text-[11px]">
                      {currentGarment.collarStructure.slice(0, 30)}...
                    </span>
                    <button
                      onClick={() => onInspectGarment(currentGarment)}
                      className="text-[#11383A] font-medium hover:underline cursor-pointer text-[11px]"
                    >
                      Hồ sơ di sản →
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="border-2 border-dashed border-[rgba(26,36,33,0.2)] rounded p-4 text-center bg-[#FCFAF6]">
                  {uploadedItem ? (
                    <div className="space-y-2">
                      <div className="w-20 h-20 mx-auto rounded border border-stone-300 overflow-hidden bg-stone-100">
                        <img
                          src={uploadedItem.previewUrl}
                          alt="Uploaded garment preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-xs text-[#2E473B] font-ui">
                        <div className="font-semibold">{uploadedItem.fileName}</div>
                      </div>
                      <label className="text-xs font-ui text-[#11383A] hover:underline cursor-pointer inline-block">
                        <span>Đổi ảnh khác</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-1.5 block">
                      <Upload className="w-5 h-5 text-[#72857A] mx-auto" />
                      <div className="text-xs font-ui font-medium text-[#11383A]">
                        Tải ảnh chụp trang phục hoặc thớ vải
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={customItemTitle}
                  onChange={(e) => setCustomItemTitle(e.target.value)}
                  placeholder="VD: Áo ngũ thân lụa Vạn Phúc..."
                  className="w-full px-2.5 py-1.5 text-xs font-body bg-white border border-[rgba(26,36,33,0.18)] rounded text-[#1A2421]"
                />
              </div>
            )}
          </div>

          {/* STEP 2: Mix & Match Layering Suite */}
          <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.12)] space-y-3">
            <div className="flex items-center gap-1.5 border-b border-[rgba(26,36,33,0.08)] pb-1.5 font-ui">
              <Layers className="w-3.5 h-3.5 text-[#11383A]" />
              <span className="text-xs font-semibold text-[#11383A]">
                2. Phối lớp y phục (Mix & Match Layers)
              </span>
            </div>

            {/* Sub-tray: Lớp trong */}
            <div className="space-y-1">
              <label className="text-[11px] font-ui text-[#5C7266] block">
                Lớp trong (Under-layer):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {UNDER_LAYERS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedUnderLayer(opt.id)}
                    className={`px-2 py-1.5 rounded text-left border text-[11px] font-ui transition-all cursor-pointer ${
                      selectedUnderLayer === opt.id
                        ? 'bg-[#11383A] text-[#F8F5EE] border-[#11383A]'
                        : 'bg-[#FCFAF6] text-[#33463E] border-[rgba(26,36,33,0.1)] hover:border-[#11383A]'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tray: Quần / Chân váy */}
            <div className="space-y-1 pt-1.5 border-t border-[rgba(26,36,33,0.06)]">
              <label className="text-[11px] font-ui text-[#5C7266] block">
                Phần dưới (Bottom wear):
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {BOTTOM_LAYERS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedBottomLayer(opt.id)}
                    className={`px-2 py-1.5 rounded text-left border text-[11px] font-ui transition-all cursor-pointer ${
                      selectedBottomLayer === opt.id
                        ? 'bg-[#11383A] text-[#F8F5EE] border-[#11383A]'
                        : 'bg-[#FCFAF6] text-[#33463E] border-[rgba(26,36,33,0.1)] hover:border-[#11383A]'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-tray: Phụ kiện đầu & Giày dép */}
            <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-[rgba(26,36,33,0.06)]">
              <div className="space-y-1">
                <label className="text-[11px] font-ui text-[#5C7266] flex items-center gap-1">
                  <Crown className="w-3 h-3 text-[#11383A]" />
                  <span>Phụ kiện đầu:</span>
                </label>
                <select
                  value={selectedHeadwear}
                  onChange={(e) => setSelectedHeadwear(e.target.value)}
                  className="w-full text-xs font-ui bg-white border border-[rgba(26,36,33,0.18)] rounded px-2 py-1.5 text-[#1A2421]"
                >
                  {HEADWEAR_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-ui text-[#5C7266] flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-[#11383A]" />
                  <span>Giày / Guốc:</span>
                </label>
                <select
                  value={selectedFootwear}
                  onChange={(e) => setSelectedFootwear(e.target.value)}
                  className="w-full text-xs font-ui bg-white border border-[rgba(26,36,33,0.18)] rounded px-2 py-1.5 text-[#1A2421]"
                >
                  {FOOTWEAR_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cultural Compatibility Indicator */}
            <div className="p-2.5 bg-[#F4EFE4] rounded border border-[rgba(26,36,33,0.08)] flex items-start gap-2 text-[11px] text-[#3A4D43] font-body leading-relaxed">
              <Info className="w-3.5 h-3.5 text-[#11383A] shrink-0 mt-0.5" />
              <span>{getCulturalAdvice()}</span>
            </div>
          </div>

          {/* STEP 3: Occasion & Style Selector */}
          <div className="bg-[#FAF7F0] p-4 rounded border border-[rgba(26,36,33,0.12)] space-y-3">
            <span className="text-xs font-semibold text-[#11383A] block font-ui border-b border-[rgba(26,36,33,0.08)] pb-1.5">
              3. Bối cảnh & thẩm mỹ cá nhân
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              {OCCASIONS.slice(0, 4).map((occ) => {
                const isSelected = selectedOccasionId === occ.id;
                return (
                  <button
                    key={occ.id}
                    onClick={() => setSelectedOccasionId(occ.id)}
                    className={`p-2 rounded text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FCFAF6] border-[#11383A] ring-1 ring-[#11383A]'
                        : 'bg-[#F5F0E4] border-[rgba(26,36,33,0.08)] hover:border-[rgba(26,36,33,0.2)]'
                    }`}
                  >
                    <div className="text-xs font-serif text-[#11383A] truncate font-medium">
                      {occ.vietnameseTitle.split('&')[0]}
                    </div>
                    <div className="text-[10px] text-[#63766D] font-ui truncate mt-0.5">
                      {occ.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Curated Look Summary & Sheet */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Look Tabs */}
          <div className="bg-[#FAF7F0] p-3 rounded border border-[rgba(26,36,33,0.12)] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              {generatedLooks.map((look, index) => {
                const isActive = activeLookIndex === index;
                return (
                  <button
                    key={look.id}
                    onClick={() => setActiveLookIndex(index)}
                    className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#11383A] text-[#F8F5EE] shadow-xs'
                        : 'bg-[#EFE8DA] text-[#485B51] hover:bg-[#E4DBCB]'
                    }`}
                  >
                    Bản phối 0{index + 1}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              {activeLook && (
                <button
                  onClick={() => onToggleSaveLook(activeLook.id)}
                  className={`p-1.5 rounded border transition-colors cursor-pointer inline-flex items-center gap-1 text-xs ${
                    savedLooks.includes(activeLook.id)
                      ? 'bg-[#11383A] text-[#F8F5EE] border-[#11383A]'
                      : 'bg-[#FCFAF6] text-[#485B51] border-[rgba(26,36,33,0.14)] hover:text-[#11383A]'
                  }`}
                >
                  {savedLooks.includes(activeLook.id) ? (
                    <>
                      <BookmarkCheck className="w-3.5 h-3.5 text-[#D4B872]" />
                      <span>Đã lưu</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Lưu lại</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={handleCopyStyleNotes}
                className="p-1.5 rounded border border-[rgba(26,36,33,0.14)] bg-[#FCFAF6] text-[#485B51] hover:text-[#11383A] transition-colors cursor-pointer inline-flex items-center gap-1 text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedToast ? 'Đã sao chép!' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* Dossier Card */}
          {activeLook && (
            <div className="bg-[#FCFAF6] p-5 sm:p-6 rounded border border-[rgba(26,36,33,0.14)] shadow-xs space-y-6">
              {/* Look Header */}
              <div className="border-b border-[rgba(26,36,33,0.1)] pb-4 space-y-1">
                <div className="flex items-center justify-between text-xs font-ui text-[#5C7266]">
                  <span>Bản phối 0{activeLookIndex + 1} · {currentOccasion.vietnameseTitle}</span>
                  <span className="text-[#11383A] font-medium">{currentStyle.vietnameseName}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif text-[#11383A] font-normal">
                  {activeLook.lookTitle}
                </h2>
                <p className="text-xs sm:text-sm font-serif italic text-[#55695F]">
                  "{activeLook.deckSubtitle}"
                </p>
              </div>

              {/* Layer Summary Tray */}
              <div className="p-3.5 bg-[#FAF7F0] rounded border border-[rgba(26,36,33,0.08)] space-y-2">
                <div className="text-xs font-ui font-medium text-[#11383A] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2E473B]" />
                  <span>Cấu trúc các lớp đang chọn:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-ui">
                  <div className="p-2 bg-white rounded border border-[rgba(26,36,33,0.06)]">
                    <span className="text-[10px] text-[#718478] block">Lớp trong</span>
                    <span className="font-medium text-[#11383A] truncate block">{currentUnder.name}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-[rgba(26,36,33,0.06)]">
                    <span className="text-[10px] text-[#718478] block">Áo chính</span>
                    <span className="font-medium text-[#11383A] truncate block">{currentGarment.name}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-[rgba(26,36,33,0.06)]">
                    <span className="text-[10px] text-[#718478] block">Quần / Chân váy</span>
                    <span className="font-medium text-[#11383A] truncate block">{currentBottom.name}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-[rgba(26,36,33,0.06)]">
                    <span className="text-[10px] text-[#718478] block">Phụ kiện & Giày</span>
                    <span className="font-medium text-[#11383A] truncate block">{currentHead.name} · {currentFoot.name}</span>
                  </div>
                </div>
              </div>

              {/* Palette & Harmony */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-ui font-medium text-[#7C694E]">
                  <Palette className="w-3.5 h-3.5 text-[#11383A]" />
                  <span>Hòa sắc di sản (Heritage Palette Harmony)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {activeLook.colorHarmony.map((color, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-sm border border-[rgba(0,0,0,0.15)] shadow-xs shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-[11px] font-ui leading-tight">
                        <div className="font-medium text-[#11383A] truncate">{color.name}</div>
                        <div className="text-[10px] text-[#718478]">{color.usage}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Editorial Rationale */}
              <div className="text-xs font-body text-[#3E5247] leading-relaxed bg-[#F8F5EE] p-3 rounded border border-[rgba(26,36,33,0.07)]">
                <strong>Lý giải giám tuyển: </strong>{activeLook.editorialRationale}
              </div>

              {/* Styling Notes */}
              <div className="pt-2 border-t border-[rgba(26,36,33,0.08)] space-y-1.5 text-xs font-body">
                <div className="font-serif font-medium text-[#11383A]">
                  {activeLook.culturalEtiquetteNote.ruleSummary}
                </div>
                <p className="text-[#4E6157]">
                  {activeLook.culturalEtiquetteNote.historicalDepth}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

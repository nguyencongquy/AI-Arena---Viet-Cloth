import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react';
import { ARCHIVE_GARMENTS } from '../data/garments';
import { ApprovedGarmentMotion } from './ApprovedGarmentMotion';
import { HistoricalPhotos } from './HistoricalPhotos';

const HUE_SOURCE = 'https://svhttdl.hue.gov.vn/tin-trong-tinh/le-don-nhan-danh-hieu-di-san-van-hoa-phi-vat-the-quoc-gia-tri-thuc-may-mac-ao-dai-hue.html';
const PATTERN_SOURCE = 'https://fgtfd.hcmute.edu.vn/Resources/Docs/SubDomain/fgtfd/T%E1%BA%ADp%20san%20FFT/Issue%201%20%282024%29.pdf#page=60';
const COLORS = [['Ngà', '#eee5d4'], ['Thiên thanh', '#799b9d'], ['Lá tre', '#6c8066'], ['Chàm', '#354864'], ['Son', '#963f47'], ['Mực', '#323639']];

export function GarmentDetail({ garmentId, color, onColor, onBack, onStyle }: {
  garmentId: string; color: string | null; onColor: (color: string | null) => void;
  onBack: () => void; onStyle: () => void;
}) {
  const garment = ARCHIVE_GARMENTS.find(g => g.id === garmentId)!;
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const nguthan = garmentId === 'ao-ngu-than', tac = garmentId === 'ao-tac';
  return <section className="garment-detail" aria-label={`Hồ sơ ${garment.name}`}>
    <header className="garment-detail__header">
      <button className="detail-back" onClick={onBack}><ArrowLeft size={18} />Kho Việt phục</button>
      <span>V-Styler Atelier</span>
      <button className="detail-motion" onClick={() => setPaused(!paused)} aria-pressed={paused}>
        {paused ? <Play size={16} /> : <Pause size={16} />}{paused ? 'Chuyển động' : 'Tạm dừng'}
      </button>
    </header>
    <div className="garment-detail__grid">
      <aside className="detail-history" tabIndex={0} aria-label={`Đọc tư liệu ${garment.name}`}>
        <p className="detail-kicker">Dấu xưa</p><h2>Một nếp áo,<br /><em>một câu chuyện.</em></h2>
        {(nguthan || tac) ? <>
          <p>{nguthan ? 'Năm thân vải, cổ đứng và hàng khuy bên phải tạo nên dấu nhận diện của áo ngũ thân. Trang phục dành cho cả nam và nữ.' : 'Áo tấc là dạng áo ngũ thân tay rộng. Khác biệt nằm ở tay thụng, không chỉ ở màu sắc hay họa tiết.'}</p>
          <a className="detail-source" href={PATTERN_SOURCE} target="_blank" rel="noreferrer">Tập san HCMUTE · 2024, tr. 60–61 ↗</a>
          {nguthan && <div className="detail-timeline">
            <article><span>1744</span><h3>Một mốc định chế</h3><p>Theo Sở Văn hóa và Thể thao Huế, chúa Nguyễn Phúc Khoát chọn áo ngũ thân làm thường phục ở Đàng Trong. Đây là mốc định chế, không khẳng định là năm xuất hiện đầu tiên.</p></article>
            <article><span>1837–1945</span><h3>Phổ biến hai miền</h3><p>Nguồn Huế ghi nhận áo ngũ thân phổ biến ở cả Nam và Bắc trong giai đoạn này.</p></article>
            <a className="detail-source" href={HUE_SOURCE} target="_blank" rel="noreferrer">Sở Văn hóa và Thể thao Huế ↗</a>
          </div>}
        </> : <p>{garment.visualNote}</p>}
        <HistoricalPhotos garmentId={garmentId} />
        <div className="detail-research"><h3>Diện mạo đương đại</h3><p>Áo ở giữa là bản minh họa thiết kế. Màu và họa tiết có thể thử theo sở thích, không được coi là màu nguyên gốc của hiện vật.</p></div>
        <button className="detail-text-cta" onClick={onStyle}>Mang nếp áo vào hôm nay <ArrowRight size={18} /></button>
      </aside>
      <div className="detail-specimen"><div className="detail-specimen__art">
        <ApprovedGarmentMotion garmentId={garmentId} name={garment.name} paused={paused} active fabricColor={color} />
      </div><h1>{garment.name}</h1></div>
      <aside className="detail-palette" aria-label="Chọn màu vải">
        <p className="detail-kicker">Sắc riêng</p><h2>Chọn một<br /><em>màu của bạn.</em></h2>
        <div className="detail-swatches">{COLORS.map(([name, hex]) => <button key={hex} style={{ '--swatch': hex } as React.CSSProperties} onClick={() => onColor(hex)} aria-label={`Màu ${name}`} aria-pressed={color === hex} title={name} />)}</div>
        <label className="detail-wheel"><span className="detail-wheel__ring" aria-hidden="true" /><input type="color" aria-label="Chọn màu tùy ý" value={color || '#799b9d'} onChange={event => onColor(event.target.value)} /><span>Màu tùy ý</span></label>
        <p className="detail-color-value" aria-live="polite">{color?.toUpperCase() || 'Màu nguyên bản'}</p>
        <button className="detail-reset" onClick={() => onColor(null)}><RotateCcw size={14} />Về màu nguyên bản</button>
        <div className="detail-palette__bottom"><p>Giữ nếp vải.<br />Thêm sắc của riêng bạn.</p><button className="detail-style-cta" onClick={onStyle}>Phối đồ <ArrowRight size={18} /></button></div>
      </aside>
    </div>
  </section>;
}

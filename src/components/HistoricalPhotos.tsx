import React, { useState } from 'react';
import { BA_BA_RESEARCH_SOURCE, HISTORICAL_PHOTOS, HistoricalPhoto } from '../data/historicalPhotos';

function HistoricalFigure({ photo }: { photo: HistoricalPhoto }) {
  const [failed, setFailed] = useState(false);
  return <figure className="historical-photo">
    <p className="historical-photo__date">{photo.date}</p>
    {failed ? <p role="status">Ảnh chưa tải được. Mở nguồn bên dưới để xem tư liệu.</p> :
      <a href={photo.sourceUrl} target="_blank" rel="noreferrer" aria-label="Mở ảnh nguyên bản và hồ sơ nguồn">
        <img src={photo.src} width={photo.width} height={photo.height} loading="lazy" decoding="async" alt={photo.alt} onError={() => setFailed(true)} />
      </a>}
    <figcaption><p>{photo.caption}</p><span>{photo.credit}</span></figcaption>
    <div className="historical-photo__links">
      <a className="detail-source" href={photo.sourceUrl} target="_blank" rel="noreferrer">Ảnh nguyên bản & nguồn ↗</a>
      {photo.identificationUrl && <a className="detail-source" href={photo.identificationUrl} target="_blank" rel="noreferrer">Đối chiếu tên phom ↗</a>}
    </div>
    <details className="historical-photo__provenance"><summary>Ghi chú tư liệu</summary><p>{photo.rights} Bản số hóa được giữ nguyên; ảnh in ngả nâu được trình bày đơn sắc trên trang. Niên đại ảnh không phải niên đại khởi nguồn trang phục.</p></details>
  </figure>;
}

export function HistoricalPhotos({ garmentId }: { garmentId: string }) {
  const photos = HISTORICAL_PHOTOS[garmentId] || [];
  return <section className="historical-photos" aria-label="Ảnh người xưa mặc trang phục">
    <h3>Trong ảnh xưa</h3>
    {photos.map(photo => <HistoricalFigure key={`${garmentId}:${photo.id}`} photo={photo} />)}
    {!photos.length && <div className="detail-research">
      <p>Chưa bổ sung ảnh người xưa mặc trang phục có hồ sơ nguồn phù hợp. Không thay bằng ảnh hiện đại chuyển đen trắng hoặc ảnh hiện vật chụp gần đây.</p>
      <a className="detail-source" href={BA_BA_RESEARCH_SOURCE} target="_blank" rel="noreferrer">Đọc tư liệu về Nguyễn Thị Định và áo bà ba ↗</a>
    </div>}
  </section>;
}

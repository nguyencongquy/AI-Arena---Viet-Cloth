import React, { useCallback, useEffect, useRef } from 'react';

/** Image-based local fabric deformation; no primitive 3D model or 360° claim. */
export const ApprovedGarmentMotion: React.FC<{
  garmentId: string;
  name: string;
  paused: boolean;
  active: boolean;
  fabricColor?: string | null;
}> = ({ garmentId, name, paused, active, fabricColor = null }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const syncMotion = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: 'v-styler-garment-motion', paused, active, fabricColor }, window.location.origin
    );
  }, [paused, active, fabricColor]);
  useEffect(syncMotion, [syncMotion]);
  return (
    <div role="img" aria-label={`${name} — minh họa concept, tay và tà uốn theo gió`} style={{ width: '100%', height: '100%' }}>
      <iframe ref={frameRef} src={`/garment-motion/index.html?id=${encodeURIComponent(garmentId)}`}
        title={`${name} — chuyển động vải`} aria-hidden="true" tabIndex={-1} onLoad={syncMotion}
        style={{ display: 'block', width: '100%', height: '100%', border: 0, background: 'transparent', pointerEvents: 'none' }} />
    </div>
  );
};

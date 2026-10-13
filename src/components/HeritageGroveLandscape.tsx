import React, { useEffect, useState, useRef } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4';
const POSTER_URL =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png';

export const HeritageGroveLandscape: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mql.addEventListener('change', handleMotionChange);
    return () => mql.removeEventListener('change', handleMotionChange);
  }, []);

  useEffect(() => {
    if (videoRef.current && !prefersReducedMotion && !videoError) {
      videoRef.current.play().catch(() => {
        // Autoplay policy or low power mode caught gracefully
      });
    }
  }, [prefersReducedMotion, videoError]);

  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {prefersReducedMotion || videoError ? (
        <img
          src={POSTER_URL}
          alt="Heritage Grove landscape scene"
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          poster={POSTER_URL}
          onError={() => setVideoError(true)}
          className="w-full h-full object-cover object-center"
        >
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      )}
    </div>
  );
};

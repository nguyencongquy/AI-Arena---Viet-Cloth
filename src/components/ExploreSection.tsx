import React, { useLayoutEffect, useRef } from 'react';
import { NavTab, GarmentSpecimen } from '../types';
import { HeritageGroveLandscape } from './HeritageGroveLandscape';
import './garment-carousel.css';

interface ExploreSectionProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectGarmentForStudio?: (garmentId: string) => void;
  onInspectGarment?: (garment: GarmentSpecimen) => void;
}

export const ExploreSection: React.FC<ExploreSectionProps> = ({
  onNavigateTab,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const hero = heroRef.current;
    if (!hero) return;
    const update = () => {
      const top = hero.getBoundingClientRect().top + window.scrollY;
      hero.style.setProperty('--explore-available-height', `${Math.max(460, window.innerHeight - top)}px`);
    };
    update();
    let frame = 0;
    const scheduleUpdate = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(scheduleUpdate);
    const main = hero.parentElement;
    Array.from(main?.parentElement?.children ?? []).forEach(sibling => {
      if (sibling !== main) observer.observe(sibling);
    });
    window.addEventListener('resize', scheduleUpdate);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', scheduleUpdate); };
  }, []);
  return (
    <div ref={heroRef} className="explore-hero">
      {/* Full-Bleed Heritage Grove Media Background (Fills Entire Hero, Edge to Edge, Top to Bottom) */}
      <HeritageGroveLandscape />

      {/* Hero Content Container Placed in Upper Sky for Maximum Natural Contrast */}
      <div className="explore-hero__content">
        {/* Vietnamese Hero Title (Exact Match) */}
        <h1 className="explore-hero__title">
          <span>Nếp xưa,</span>{' '}<em>phối theo nhịp sống nay.</em>
        </h1>

        {/* Concise Vietnamese Supporting Copy */}
        <p className="explore-hero__intro">
          Việt phục truyền thống, trong nhịp sống hôm nay.
        </p>

        {/* App owns the single cloud passage and navigation lifecycle. */}
        <div className="explore-hero__actions">
          <button
            onClick={() => onNavigateTab('archive')}
            className="explore-hero__primary"
          >
            Khám phá
          </button>
        </div>
      </div>

      {/* Subtle bottom spacer keeping the scenic lake, mountains, and pines visible */}
      <div className="relative z-10 pb-4 sm:pb-6 pointer-events-none" />
    </div>
  );
};

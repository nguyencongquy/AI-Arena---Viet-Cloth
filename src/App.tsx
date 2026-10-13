import React, { useEffect, useRef, useState } from 'react';
import { NavTab, GarmentSpecimen } from './types';
import { Navbar } from './components/Navbar';
import { ExploreSection } from './components/ExploreSection';
import { ArchiveSection } from './components/ArchiveSection';
import { StudioSection } from './components/StylingAtelier';
import { ManifestoSection } from './components/ManifestoSection';
import { SpecimenModal } from './components/SpecimenModal';
import { GarmentDetail } from './components/GarmentDetail';
import { BambooPassage } from './components/BambooPassage';
import './components/garment-carousel.css';

// One owner for cover, navigation, reveal and cleanup. No timer inside Explore.
function CloudPassage({ onCovered, onComplete, kind = 'cloud' }: { onCovered: () => void; onComplete: () => void; kind?: 'cloud' | 'bamboo' }) {
  const callbacks = useRef({ onCovered, onComplete });
  callbacks.current = { onCovered, onComplete };
  useEffect(() => {
    let covered = false, finished = false;
    const cover = () => { if (!covered) { covered = true; callbacks.current.onCovered(); } };
    const finish = () => { if (!finished) { finished = true; cover(); callbacks.current.onComplete(); } };
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coverTimer = window.setTimeout(cover, kind === 'bamboo' ? 1500 : 1150);
    const finishTimer = window.setTimeout(finish, kind === 'bamboo' ? 3200 : 2400);
    const onPreference = () => { if (media.matches) finish(); };
    media.addEventListener('change', onPreference);
    onPreference();
    return () => { window.clearTimeout(coverTimer); window.clearTimeout(finishTimer); media.removeEventListener('change', onPreference); };
  }, [kind]);
  if (kind === 'bamboo') return <BambooPassage />;
  return (
    <div className="cloud-passage" role="status" aria-label="Đang đi qua mây">
      <div className="cloud-passage__veil" />
      {[0, 1, 2].map(depth => (
        <svg key={depth} className={`cloud-plane cloud-plane--${depth}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <radialGradient id={`mist-${depth}`}>
              <stop offset="0" stopColor="#fdfdf9" stopOpacity=".98" />
              <stop offset=".45" stopColor="#d1dcd6" stopOpacity=".84" />
              <stop offset=".72" stopColor="#edf1ec" stopOpacity=".6" />
              <stop offset="1" stopColor="#e9eeec" stopOpacity="0" />
            </radialGradient>
            <filter id={`vapour-${depth}`} x="-10%" y="-10%" width="120%" height="120%">
              <feTurbulence type="fractalNoise" baseFrequency=".006 .012" numOctaves="2" seed={18 + depth * 7} result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="88" xChannelSelector="R" yChannelSelector="G" />
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          <g fill={`url(#mist-${depth})`} filter={`url(#vapour-${depth})`}>
            <ellipse cx="130" cy="250" rx="650" ry="310" /><ellipse cx="410" cy="-20" rx="500" ry="350" />
            <ellipse cx="1330" cy="170" rx="680" ry="370" /><ellipse cx="1570" cy="680" rx="570" ry="530" />
            <ellipse cx="350" cy="960" rx="780" ry="470" /><ellipse cx="-80" cy="680" rx="500" ry="450" />
            <ellipse cx="1030" cy="1080" rx="600" ry="420" />
          </g>
        </svg>
      ))}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('explore');
  const [selectedStudioGarmentId, setSelectedStudioGarmentId] = useState<string | undefined>(undefined);
  const [inspectingGarment, setInspectingGarment] = useState<GarmentSpecimen | null>(null);
  const [savedLookIds, setSavedLookIds] = useState<string[]>(['look-ngu-than-gallery-minimal']);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cloudPassage, setCloudPassage] = useState(false);
  const [passageKind, setPassageKind] = useState<'cloud' | 'bamboo'>('cloud');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [lastArchiveId, setLastArchiveId] = useState<string | undefined>();
  const [colors, setColors] = useState<Record<string, string | null>>({});
  const [studioColor, setStudioColor] = useState<string | null>(null);
  const destination = useRef<() => void>(() => {});
  const transitionLocked = useRef(false);
  const surface = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLElement>(null);
  useEffect(() => {
    if (menuOpen || cloudPassage) surface.current?.setAttribute('inert', '');
    else surface.current?.removeAttribute('inert');
  }, [menuOpen, cloudPassage]);

  const travel = (kind: 'cloud' | 'bamboo', action: () => void) => {
    if (transitionLocked.current) return;
    setMenuOpen(false);
    destination.current = () => { action(); window.scrollTo({ top: 0, behavior: 'instant' }); };
    transitionLocked.current = true; setPassageKind(kind); setCloudPassage(true);
  };
  const navigate = (tab: NavTab) => {
    if (transitionLocked.current) return;
    if (activeTab === 'explore' && tab === 'archive') return travel('cloud', () => { setDetailId(null); setActiveTab(tab); });
    setMenuOpen(false); setDetailId(null); setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => page.current?.focus({ preventScroll: true }));
  };
  const openGarment = (id: string) => {
    travel('bamboo', () => { setLastArchiveId(id); setDetailId(id); setActiveTab('archive'); });
  };

  const handleSelectGarmentForStudio = (garmentId: string) => {
    travel('cloud', () => { setSelectedStudioGarmentId(garmentId); setStudioColor(colors[garmentId] || null); setDetailId(null); setInspectingGarment(null); setActiveTab('studio'); });
  };

  const handleInspectGarment = (garment: GarmentSpecimen) => {
    setInspectingGarment(garment);
  };

  const handleToggleSaveLook = (lookId: string) => {
    setSavedLookIds((prev) =>
      prev.includes(lookId) ? prev.filter((id) => id !== lookId) : [...prev, lookId]
    );
  };

  return (
    <div className="app-shell min-h-screen bg-[#F8F5EE] text-[#1A2421]">
      <Navbar activeTab={activeTab} onSelectTab={navigate} open={menuOpen} onOpenChange={setMenuOpen} disabled={cloudPassage} />
      <div ref={surface} className={`app-surface${menuOpen ? ' is-menu-open' : ''}`}>
      {/* Main Page Canvas */}
      <main ref={page} tabIndex={-1} className="flex-1 app-page" aria-busy={cloudPassage}>
        {activeTab === 'explore' && (
          <ExploreSection
            onNavigateTab={navigate}
            onSelectGarmentForStudio={handleSelectGarmentForStudio}
            onInspectGarment={handleInspectGarment}
          />
        )}

        {activeTab === 'archive' && detailId && <GarmentDetail key={detailId} garmentId={detailId} color={colors[detailId] || null}
          onColor={color => setColors(previous => ({ ...previous, [detailId]: color }))}
          onBack={() => { setDetailId(null); requestAnimationFrame(() => page.current?.focus({ preventScroll: true })); }}
          onStyle={() => handleSelectGarmentForStudio(detailId)} />}
        {activeTab === 'archive' && !detailId && (
          <ArchiveSection
            onOpenGarment={openGarment}
            initialGarmentId={lastArchiveId}
            onSelectGarmentForStudio={handleSelectGarmentForStudio}
            onInspectGarment={handleInspectGarment}
          />
        )}

        {activeTab === 'studio' && (
          <StudioSection
            preselectedGarmentId={selectedStudioGarmentId}
            preselectedFabricColor={studioColor}
            onInspectGarment={handleInspectGarment}
            savedLooks={savedLookIds}
            onToggleSaveLook={handleToggleSaveLook}
          />
        )}

        {activeTab === 'manifesto' && (
          <ManifestoSection
            onNavigateTab={navigate}
          />
        )}
      </main>

      {/* Specimen Detail Modal */}
      <SpecimenModal
        garment={inspectingGarment}
        onClose={() => setInspectingGarment(null)}
        onSelectForStudio={handleSelectGarmentForStudio}
      />
      </div>
      {menuOpen && <button className="navigation-scrim" aria-label="Đóng menu và quay lại nội dung" tabIndex={-1} onClick={() => setMenuOpen(false)} />}
      {cloudPassage && <CloudPassage
        kind={passageKind}
        onCovered={() => destination.current()}
        onComplete={() => {
          transitionLocked.current = false;
          setCloudPassage(false);
          requestAnimationFrame(() => page.current?.focus({ preventScroll: true }));
        }}
      />}
    </div>
  );
}

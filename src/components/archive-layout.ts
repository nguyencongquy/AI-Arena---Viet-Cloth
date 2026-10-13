/** Fit three complete renderer frames, including their existing wind envelopes. */
export function archiveLayout(width: number, height: number) {
  const gap = Math.min(40, Math.max(24, width * .028));
  const edge = 10;
  const neighborScale = .8;
  const specimenWidth = Math.max(1, Math.min(
    height * 1.06,
    (width - 2 * gap - 2 * edge) / (1 + 2 * neighborScale)
  ));
  const step = specimenWidth * (1 + neighborScale) / 2 + gap;
  return { specimenWidth, neighborScale, step, gap, edge };
}

/** A neighboring item selects; only the already selected item opens its dossier. */
export function archiveClickIntent(index: number, selectedIndex: number) {
  return index === selectedIndex ? 'open' : 'select';
}

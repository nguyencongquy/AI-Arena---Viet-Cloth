import React from 'react';

/** Ink-painted depth planes; transition timing stays owned by App. */
export function BambooPassage() {
  return <div className="bamboo-passage" role="status" aria-label="Đang mở lối tre vào hồ sơ áo">
    <div className="bamboo-passage__veil" />
    <div className="bamboo-atmosphere" aria-hidden="true" />
    {(['far', 'middle', 'near'] as const).map((depth, plane) => <React.Fragment key={depth}>
      <svg className={`bamboo-depth bamboo-depth--${depth}`} viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`bamboo-ink-${depth}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={plane === 2 ? '#284b40' : '#7c9683'} />
            <stop offset=".38" stopColor={plane === 2 ? '#57775b' : '#a7b29a'} />
            <stop offset=".72" stopColor={plane === 2 ? '#42654c' : '#869f89'} />
            <stop offset="1" stopColor={plane === 2 ? '#234438' : '#607e6e'} />
          </linearGradient>
        </defs>
        {[0, 1].map(side => <g key={side} transform={side ? 'translate(1600 0) scale(-1 1)' : undefined}>
          {(plane === 0 ? [30, 115, 205, 295, 385, 490] : plane === 1 ? [10, 125, 245, 355] : [35, 190, 315]).map((base, stem) => {
            const bend = (stem % 2 ? -1 : 1) * (48 + plane * 22 + side * 13);
            const xAt = (y: number) => base + bend * Math.pow(1 - y / 1120, 2);
            const width = (plane === 2 ? 14 : plane === 1 ? 9 : 5) + stem % 3 * 2;
            return <g key={base}>
              {Array.from({ length: 9 }, (_, segment) => {
                const y = 1120 - segment * 145, top = y - 140;
                const lower = width * (1 - segment * .045), upper = lower * .955;
                return <g key={segment}>
                  <path fill={`url(#bamboo-ink-${depth})`} d={`M${xAt(y) - lower} ${y} Q${xAt((y + top) / 2) - lower - 1} ${(y + top) / 2} ${xAt(top) - upper} ${top} Q${xAt(top)} ${top - 3} ${xAt(top) + upper} ${top} Q${xAt((y + top) / 2) + lower} ${(y + top) / 2} ${xAt(y) + lower} ${y} Z`} />
                  <path fill="none" stroke={plane === 2 ? '#203f34' : '#78917c'} strokeWidth={plane === 2 ? 2.1 : 1.1} strokeLinecap="round" d={`M${xAt(y) - lower - 2} ${y - 2} Q${xAt(y)} ${y + 3} ${xAt(y) + lower + 2} ${y - 2}`} />
                  <path fill="none" stroke="#d0cfad" strokeOpacity=".48" strokeWidth=".8" d={`M${xAt(y) - lower * .4} ${y - 9} Q${xAt((y + top) / 2) - lower * .45} ${(y + top) / 2} ${xAt(top) - upper * .4} ${top + 8}`} />
                </g>;
              })}
              {[255, 540, 825].map((y, branch) => <g key={y} transform={`translate(${xAt(y)} ${y}) rotate(${(branch + stem + side) % 2 ? -12 : 14}) scale(${branch === 0 ? .85 : 1})`}>
                <g className="bamboo-leaves" style={{ '--leaf-turn': `${stem % 2 ? 3 : -3}deg` } as React.CSSProperties}>
                  <path d="M0 0 Q86 -78 220 -98 M54 -44 Q45 -111 8 -147 M120 -73 Q151 -8 206 22" fill="none" stroke={plane === 2 ? '#365545' : '#79917b'} strokeWidth={plane === 2 ? 2.8 : 1.2} strokeLinecap="round" />
                  {[[-3, -3, -105, 86], [36, -31, -73, 94], [74, -53, -48, 103], [108, -70, -28, 88], [142, -82, 32, 94], [179, -91, -16, 82], [195, -89, 48, 98], [151, -18, 42, 76], [21, -99, -119, 70]].map(([x, leafY, angle, length], leaf) => <g key={leaf} transform={`translate(${x} ${leafY}) rotate(${angle})`}>
                    <path d={`M0 0 Q${length * .3} ${-8 - leaf % 3 * 2} ${length} 0 Q${length * .43} ${10 + leaf % 2 * 3} 0 0`} fill={plane === 2 ? leaf % 3 ? '#3d604c' : '#597652' : '#8b9f84'} />
                    {plane === 2 && <path d={`M2 0 Q${length * .5} 2 ${length - 8} 0`} fill="none" stroke="#b4bb94" strokeOpacity=".36" strokeWidth=".65" />}
                  </g>)}
                </g>
              </g>)}
            </g>;
          })}
        </g>)}
      </svg>
      {plane < 2 && <div className={`bamboo-mist bamboo-mist--${plane}`} aria-hidden="true" />}
    </React.Fragment>)}
  </div>;
}

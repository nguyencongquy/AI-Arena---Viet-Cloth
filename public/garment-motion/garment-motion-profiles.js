/* Contemporary garment artwork. Profiles locate cloth regions, not 3D bodies. */
(function () {
  'use strict';
  const profiles = {
    'ao-ngu-than': {
      name: 'Áo ngũ thân', file: '../ao-ngu-than-approved.png',
      bounds: [0, 58, 1024, 1510], margin: [96, 90], strength: 1,
      left: [.46, .32, .12, .36, .44, .64], right: [.69, .87, .16, .43, .49, .69], hem: [.49, .94],
      anchors: [[.55, .05], [.4, .10], [.72, .12], [.5, .22], [.6, .35]],
      moving: [[.24, .40], [.93, .44], [.45, .91]]
    },
    'ao-tac': {
      name: 'Áo tấc', file: '../ao-tac-concept-v1.png',
      bounds: [40, 64, 1019, 1489], margin: [96, 90], strength: .90,
      left: [.46, .28, .13, .39, .54, .73], right: [.70, .90, .17, .44, .58, .77], hem: [.56, .94],
      anchors: [[.6, .06], [.45, .09], [.72, .12], [.55, .27]],
      moving: [[.22, .47], [.95, .51], [.50, .92]]
    },
    'ao-nhat-binh': {
      name: 'Áo Nhật Bình', file: '../ao-nhat-binh-concept-v2.png',
      bounds: [14, 85, 1018, 1494], margin: [96, 90], strength: .88,
      left: [.46, .28, .14, .37, .46, .65], right: [.70, .91, .16, .40, .49, .68], hem: [.52, .94],
      anchors: [[.59, .07], [.45, .10], [.74, .12], [.60, .23]],
      moving: [[.20, .42], [.94, .43], [.48, .93]]
    },
    'ao-yem': {
      name: 'Áo yếm', file: '../ao-yem-concept-v1.png',
      bounds: [38, 71, 985, 1428], margin: [64, 64], strength: .58,
      left: [.44, .22, .40, .65, .82, .98], right: [.72, .94, .40, .68, .85, .99], hem: [.57, .89],
      neckLeft: [.42, .20, .09, .19, .25, .39], neckRight: [.70, .92, .09, .21, .27, .40],
      anchors: [[.53, .05], [.52, .20], [.57, .28], [.60, .40]],
      moving: [[.24, .21], [.90, .22], [.15, .70], [.92, .78], [.65, .85]]
    },
    'ao-tu-than': {
      name: 'Áo tứ thân', file: '../ao-tu-than-concept-v1.png',
      bounds: [34, 84, 1007, 1440], margin: [96, 90], strength: .92,
      left: [.46, .30, .13, .37, .44, .65], right: [.71, .91, .18, .43, .48, .69], hem: [.43, .91],
      anchors: [[.57, .07], [.43, .10], [.74, .12], [.58, .28], [.62, .32]],
      moving: [[.24, .42], [.94, .44], [.48, .88]]
    },
    'ao-giao-linh': {
      name: 'Áo giao lĩnh', file: '../ao-giao-linh-concept-v1.png',
      bounds: [47, 49, 1015, 1491], margin: [96, 90], strength: .92,
      left: [.46, .28, .13, .38, .45, .66], right: [.70, .91, .18, .43, .50, .70], hem: [.48, .94],
      anchors: [[.56, .05], [.42, .09], [.73, .12], [.55, .23], [.54, .30]],
      moving: [[.23, .42], [.94, .45], [.48, .92]]
    },
    'ao-ba-ba': {
      name: 'Áo bà ba', file: '../ao-ba-ba-concept-v1.png',
      bounds: [20, 212, 1014, 1256], margin: [64, 64], strength: .58,
      left: [.43, .20, .26, .57, .69, .87], right: [.74, .94, .30, .59, .70, .88], hem: [.60, .81],
      anchors: [[.53, .17], [.34, .20], [.78, .23], [.59, .38], [.61, .52]],
      moving: [[.13, .63], [.94, .66], [.56, .80]]
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = profiles;
  else window.GARMENT_MOTION_PROFILES = profiles;
})();

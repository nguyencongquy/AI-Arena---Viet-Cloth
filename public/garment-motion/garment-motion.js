/* Local deformation of one continuous artwork grid. Not a 360° cloth model. */
(function () {
  'use strict';
  const profiles = typeof module !== 'undefined' && module.exports
    ? require('./garment-motion-profiles.js') : window.GARMENT_MOTION_PROFILES;
  const smooth = (a, b, value) => {
    const x = Math.max(0, Math.min(1, (value - a) / (b - a)));
    return x * x * (3 - 2 * x);
  };
  const region = (p, u, v) => p ? smooth(p[0], p[1], u) * smooth(p[2], p[3], v) * (1 - smooth(p[4], p[5], v)) : 0;
  function weights(id, u, v) {
    const p = profiles[id];
    if (!p) throw new Error('Unknown garment profile: ' + id);
    const left = Math.max(region(p.left, u, v), region(p.neckLeft, u, v));
    const right = Math.max(region(p.right, u, v), region(p.neckRight, u, v));
    return { left, right, hem: smooth(p.hem[0], p.hem[1], v) * (1 - Math.max(left, right)) };
  }
  function gust(t) {
    const pulse = .5 + .5 * Math.sin(.72 * t - .5);
    return pulse * pulse * (.82 + .18 * Math.sin(.19 * t + 1.1));
  }
  function displacement(id, u, v, t, w = weights(id, u, v)) {
    const p = profiles[id];
    const leftGust = gust(t - .55 * v), rightGust = gust(t - .75 * v - .25), hemGust = gust(t - 1.6 * v);
    const leftPhase = .9 * t - 4 * v, rightPhase = .9 * t - 4 * v + .7, hemPhase = .72 * t - 5 * v + 3 * u;
    const ripple = Math.sin(1.7 * t - 10 * v + 8 * u);
    const dx = -w.left * (56 * leftGust + 20 * Math.sin(leftPhase))
      - w.right * (40 * rightGust + 18 * Math.sin(rightPhase))
      - w.hem * (56 * hemGust + 22 * Math.sin(hemPhase) + 9 * ripple);
    const dy = -w.left * (48 * leftGust + 16 * Math.sin(leftPhase + .8))
      - w.right * (62 * rightGust + 20 * Math.sin(rightPhase + .8))
      - w.hem * (40 * hemGust + 12 * Math.sin(hemPhase + .7) + 8 * ripple);
    return [p.strength * dx / 1024, p.strength * dy / 1536];
  }

  function fit(id, width, height) {
    const p = profiles[id], b = p.bounds;
    const scale = Math.min(width / (b[2] - b[0] + 2 * p.margin[0]), height / (b[3] - b[1] + 2 * p.margin[1]));
    return { scale, centerX: (b[0] + b[2]) / 2, centerY: (b[1] + b[3]) / 2 };
  }

  // Retain luminance variation (folds/weave), alpha and small ivory closures.
  function recolor(data, hex) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return new Uint8ClampedArray(data);
    const target = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const output = new Uint8ClampedArray(data);
    for (let i = 0; i < output.length; i += 4) {
      if (!data[i + 3]) continue;
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const y = .2126 * r + .7152 * g + .0722 * b;
      // Warm, light, low-chroma highlights include the original ivory buttons.
      if (r > b * 1.1 && Math.max(r, g, b) - Math.min(r, g, b) < .22 && y > .63) continue;
      const shade = Math.min(1, y / .58), highlight = Math.max(0, (y - .58) / .42);
      for (let c = 0; c < 3; c++) output[i + c] = Math.round(255 * (target[c] * shade * (1 - highlight) + highlight));
    }
    return output;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { profiles, weights, displacement, fit, recolor };
    return;
  }

  const id = new URLSearchParams(location.search).get('id') || 'ao-ngu-than';
  const profile = Object.prototype.hasOwnProperty.call(profiles, id) ? profiles[id] : null;
  const canvas = document.getElementById('cloth-canvas'), image = document.getElementById('garment-image');
  const errorLabel = document.getElementById('image-error');
  if (!profile) { errorLabel.hidden = false; errorLabel.textContent = 'Không có phom này.'; return; }
  document.title = profile.name + ' — chuyển động vải';
  image.alt = profile.name + ' — minh họa concept với chất vải';
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = media.matches, active = true, ready = false, failed = false, disposed = false;
  let frame = 0, previousTime = 0, time = 0;
  let render = () => {}, resize = () => {}, free = () => {};
  let observer;
  let fabricColor = null, originalPixels, tintCanvas, applyColor = () => {};
  const fallbackTint = document.createElement('canvas');
  fallbackTint.style.position = 'absolute'; fallbackTint.hidden = true;
  image.parentElement.appendChild(fallbackTint);
  function coloredArtwork() {
    if (!fabricColor) return image;
    if (!tintCanvas) {
      tintCanvas = document.createElement('canvas');
      tintCanvas.width = image.naturalWidth; tintCanvas.height = image.naturalHeight;
      const context = tintCanvas.getContext('2d');
      context.drawImage(image, 0, 0); originalPixels = context.getImageData(0, 0, tintCanvas.width, tintCanvas.height);
    }
    tintCanvas.getContext('2d').putImageData(new ImageData(recolor(originalPixels.data, fabricColor), tintCanvas.width, tintCanvas.height), 0, 0);
    return tintCanvas;
  }
  function updateFallbackColor() {
    if (!failed || !image.naturalWidth) return;
    fallbackTint.hidden = !fabricColor; image.hidden = Boolean(fabricColor);
    if (fabricColor) {
      fallbackTint.width = image.naturalWidth; fallbackTint.height = image.naturalHeight;
      fallbackTint.getContext('2d').drawImage(coloredArtwork(), 0, 0);
    }
    fallbackTint.style.cssText = image.style.cssText;
    fallbackTint.style.position = 'absolute';
  }
  function tick(timestamp) {
    frame = 0;
    if (!ready || paused || !active || failed || disposed || document.hidden) return;
    if (previousTime) time += Math.min((timestamp - previousTime) / 1000, .05);
    previousTime = timestamp;
    render(time);
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame); frame = 0; previousTime = 0;
    if (ready && !paused && active && !failed && !disposed && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function alignImage() {
    if (!image.naturalWidth) return;
    const r = document.getElementById('garment').getBoundingClientRect(), f = fit(id, r.width, r.height);
    // Same crop/fit for static fallback; never collapse into a small thumbnail.
    image.style.width = image.naturalWidth * f.scale + 'px';
    image.style.height = image.naturalHeight * f.scale + 'px';
    image.style.left = r.width / 2 - f.centerX * f.scale + 'px';
    image.style.top = r.height / 2 - f.centerY * f.scale + 'px';
    fallbackTint.style.cssText = image.style.cssText;
    fallbackTint.style.position = 'absolute';
  }
  function fallback() {
    failed = true; ready = false; cancelAnimationFrame(frame); frame = 0;
    canvas.hidden = true; image.hidden = false;
    alignImage(); free(); updateFallbackColor();
  }
  function setup() {
    if (ready || failed || disposed || !image.naturalWidth) return;
    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
    if (!gl) return fallback();
    const buffers = [], textures = [], programs = [], shaders = [];
    let freed = false;
    free = () => {
      if (freed) return;
      freed = true;
      buffers.forEach(b => gl.deleteBuffer(b)); textures.forEach(t => gl.deleteTexture(t));
      programs.forEach(p => gl.deleteProgram(p)); shaders.forEach(s => gl.deleteShader(s));
    };
    try {
      const shader = (type, source) => {
        const s = gl.createShader(type); shaders.push(s);
        gl.shaderSource(s, source); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const program = gl.createProgram(); programs.push(program);
      gl.attachShader(program, shader(gl.VERTEX_SHADER, 'attribute vec2 position; attribute vec2 uv; varying vec2 texCoord; void main(){texCoord=uv;gl_Position=vec4(position,0.,1.);}'));
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, 'precision mediump float; varying vec2 texCoord; uniform sampler2D artwork; void main(){gl_FragColor=texture2D(artwork,texCoord);}'));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      const columns = 80, rows = 120;
      const positions = new Float32Array((columns + 1) * (rows + 1) * 2), uv = new Float32Array(positions.length);
      const vertexWeights = [], indices = [];
      for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
        const i = y * (columns + 1) + x;
        uv[2 * i] = x / columns; uv[2 * i + 1] = y / rows;
        vertexWeights.push(weights(id, x / columns, y / rows));
        if (x < columns && y < rows) { const b = i + columns + 1; indices.push(i, i + 1, b, i + 1, b + 1, b); }
      }
      function buffer(target, data, usage) {
        const b = gl.createBuffer(); buffers.push(b); gl.bindBuffer(target, b); gl.bufferData(target, data, usage); return b;
      }
      const positionBuffer = buffer(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      let attribute = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      buffer(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
      attribute = gl.getAttribLocation(program, 'uv'); gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
      buffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
      const texture = gl.createTexture(); textures.push(texture);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      if (gl.getError() !== gl.NO_ERROR) throw new Error('Artwork texture upload failed');
      gl.uniform1i(gl.getUniformLocation(program, 'artwork'), 0);
      applyColor = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, coloredArtwork());
      };
      let f, width = 1, height = 1;
      render = t => {
        for (let i = 0; i < vertexWeights.length; i++) {
          const u = uv[i * 2], v = uv[i * 2 + 1], d = displacement(id, u, v, t, vertexWeights[i]);
          positions[i * 2] = ((u + d[0]) * image.naturalWidth - f.centerX) * f.scale * 2 / width;
          positions[i * 2 + 1] = -((v + d[1]) * image.naturalHeight - f.centerY) * f.scale * 2 / height;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer); gl.bufferSubData(gl.ARRAY_BUFFER, 0, positions);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
      };
      resize = () => {
        alignImage();
        const r = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 2);
        width = canvas.width = Math.max(1, Math.round(r.width * ratio));
        height = canvas.height = Math.max(1, Math.round(r.height * ratio));
        f = fit(id, width, height); gl.viewport(0, 0, width, height); render(time);
      };
      ready = true; canvas.hidden = false; applyColor(); resize(); image.hidden = true; sync();
    } catch (error) { console.warn('Garment motion unavailable:', error); fallback(); }
  }
  function onMessage(event) {
    // Only our containing app may control this iframe; no command/eval channel.
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'v-styler-garment-motion') return;
    if (typeof event.data.paused === 'boolean') paused = event.data.paused;
    if (typeof event.data.active === 'boolean') active = event.data.active;
    const nextColor = event.data.fabricColor;
    if ((nextColor === null || /^#[0-9a-f]{6}$/i.test(nextColor || '')) && nextColor !== fabricColor) {
      fabricColor = nextColor;
      if (ready) { applyColor(); render(time); }
      else updateFallbackColor();
    }
    sync();
  }
  const onPreference = () => { paused = media.matches; sync(); };
  const onContextLoss = event => { event.preventDefault(); fallback(); };
  const onPageHide = () => {
    disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); free();
    window.removeEventListener('message', onMessage); document.removeEventListener('visibilitychange', sync);
    media.removeEventListener('change', onPreference);
  };
  observer = new ResizeObserver(() => { if (ready) resize(); else alignImage(); });
  observer.observe(document.getElementById('garment'));
  window.addEventListener('message', onMessage); document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', onPreference); canvas.addEventListener('webglcontextlost', onContextLoss);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
  image.addEventListener('load', () => { alignImage(); setup(); });
  image.addEventListener('error', () => { fallback(); errorLabel.hidden = false; });
  // Per-item embedded artwork works on file:// too; exact PNG bytes, no network.
  if (location.protocol === 'file:') {
    const assetScript = document.createElement('script');
    assetScript.src = './artwork/' + id + '.js';
    assetScript.onload = () => { image.src = window.GARMENT_ARTWORK_URI || './artwork/' + id + '.png'; };
    assetScript.onerror = () => { image.src = './artwork/' + id + '.png'; };
    document.head.appendChild(assetScript);
  } else image.src = './artwork/' + id + '.png';
})();

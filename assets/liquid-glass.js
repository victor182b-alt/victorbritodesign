/*
  Vidro líquido do cabeçalho (estilos em liquid-glass.css).
  - Gera um mapa de deslocamento do tamanho da cápsula: nas bordas o fundo é "puxado"
    para dentro, como numa lente, com leve aberração cromática (Chrome/Edge).
  - O reflexo segue o cursor.
  - Ao rolar rápido, a cápsula estica e volta como gelatina.
*/
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const glass = document.createElement('div');
  glass.className = 'lg';
  glass.setAttribute('aria-hidden', 'true');
  header.prepend(glass);

  /* backdrop-filter com url() só funciona em navegadores Chromium */
  const brands = (navigator.userAgentData && navigator.userAgentData.brands) || [];
  const canRefract = brands.some(b => /Chromium/.test(b.brand));

  if (canRefract) {
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.position = 'absolute';
    svg.innerHTML = `
      <filter id="lg-filter" x="0" y="0" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feImage result="map" x="0" y="0" preserveAspectRatio="none"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" data-k="1" result="dr"/>
        <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" data-k=".93" result="dg"/>
        <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
        <feDisplacementMap in="SourceGraphic" in2="map" xChannelSelector="R" yChannelSelector="G" data-k=".86" result="db"/>
        <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/>
        <feBlend in="r" in2="g" mode="screen" result="rg"/>
        <feBlend in="rg" in2="b" mode="screen"/>
      </filter>`;
    document.body.appendChild(svg);
    glass.classList.add('lg--refract');

    const filter = svg.querySelector('filter');
    const image = svg.querySelector('feImage');
    const maps = svg.querySelectorAll('feDisplacementMap');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    /* distância (com sinal) até a borda de um retângulo arredondado centrado na origem */
    const sdf = (x, y, hw, hh, r) => {
      const qx = Math.abs(x) - hw + r;
      const qy = Math.abs(y) - hh + r;
      return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
    };

    const build = () => {
      const w = Math.round(glass.offsetWidth);
      const h = Math.round(glass.offsetHeight);
      if (!w || !h) return;
      const r = h / 2;
      const bezel = Math.min(r, 20);          // largura da borda que refrata
      const strength = Math.min(40, h * .7);  // deslocamento máximo (px)

      canvas.width = w;
      canvas.height = h;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      const hw = w / 2, hh = h / 2;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const px = x + .5 - hw, py = y + .5 - hh;
          const s = sdf(px, py, hw, hh, r);
          let dx = 0, dy = 0;
          if (s < 0 && -s < bezel) {
            /* normal da borda (aponta para fora) */
            const gx = sdf(px + 1, py, hw, hh, r) - sdf(px - 1, py, hw, hh, r);
            const gy = sdf(px, py + 1, hw, hh, r) - sdf(px, py - 1, hw, hh, r);
            const len = Math.hypot(gx, gy) || 1;
            const t = 1 - (-s / bezel);       // 1 na borda, 0 no fim do bisel
            const m = t * t * (3 - 2 * t);    // curva suave, como a lateral de uma lente
            dx = -gx / len * m;
            dy = -gy / len * m;
          }
          d[i] = 128 + dx * 127;
          d[i + 1] = 128 + dy * 127;
          d[i + 2] = 128;
          d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

      filter.setAttribute('width', w);
      filter.setAttribute('height', h);
      image.setAttribute('width', w);
      image.setAttribute('height', h);
      image.setAttribute('href', canvas.toDataURL());
      maps.forEach(m => m.setAttribute('scale', strength * m.dataset.k));
    };

    let raf = 0;
    new ResizeObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(build);
    }).observe(glass);
  }

  /* reflexo seguindo o cursor */
  header.addEventListener('pointermove', e => {
    const box = glass.getBoundingClientRect();
    glass.style.setProperty('--mx', `${e.clientX - box.left}px`);
    glass.style.setProperty('--my', `${e.clientY - box.top}px`);
    glass.classList.add('is-lit');
  });
  header.addEventListener('pointerleave', () => glass.classList.remove('is-lit'));

  /* efeito gelatina: estica com a velocidade da rolagem e volta com uma mola */
  let lastY = window.scrollY, lastT = performance.now();
  let target = 0, value = 0, speed = 0, running = false;

  const tick = () => {
    speed += (target - value) * .18;
    speed *= .72;
    value += speed;
    target *= .85;
    glass.style.scale = `${1 + value * .6} ${1 - value}`;
    if (Math.abs(value) > .0005 || Math.abs(target) > .0005) {
      requestAnimationFrame(tick);
    } else {
      glass.style.scale = '';
      value = speed = target = 0;
      running = false;
    }
  };

  window.addEventListener('scroll', () => {
    const now = performance.now();
    const v = Math.abs(window.scrollY - lastY) / Math.max(now - lastT, 1); // px/ms
    lastY = window.scrollY;
    lastT = now;
    target = Math.min(v * .02, .06);
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }, { passive: true });
})();

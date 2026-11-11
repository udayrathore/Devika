(() => {
  const root = document.documentElement;
  const intro = document.querySelector('#intro');
  const image = document.querySelector('.designer-hero-image-wrap');
  const finalImageScale = '1';
  const targetHash = location.hash;
  const status = document.querySelector('#load-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let sequence = 0;
  let imageAnimation;
  let edges;
  let frame;
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const sceneReady = Promise.allSettled([...document.querySelectorAll('.designer-hero-image')].map(picture => picture.decode()));
  function resetHeroView() {
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function bezier(x1, y1, x2, y2) {
    const coordinate = (t, p1, p2) => 3 * (1-t) * (1-t) * t * p1 + 3 * (1-t) * t * t * p2 + t * t * t;
    return progress => {
      let low = 0, high = 1;
      for (let i = 0; i < 15; i++) {
        const t = (low + high) / 2;
        if (coordinate(t, x1, x2) < progress) low = t; else high = t;
      }
      return coordinate((low + high) / 2, y1, y2);
    };
  }
  const easeArch = bezier(.75, 0, .25, 1);
  const easeDive = bezier(.6, 0, 0, 1);

  function updateFrame() {
    const width = innerWidth - (innerWidth <= 600 ? 28 : 48);
    const height = innerHeight - (innerWidth <= 600 ? 28 : 48);
    const corner = innerWidth <= 600 ? 24 : 36;
    document.querySelector('#intro-border-path').setAttribute('d', `M${corner},0H${width-corner}L${width},${corner}V${height-corner}L${width-corner},${height}H${corner}L0,${height-corner}V${corner}Z`);
  }

  function finishIntro() {
    if (intro.hidden) return;
    const focusWasInIntro = intro.contains(document.activeElement);
    cancelAnimationFrame(frame);
    imageAnimation?.cancel();
    edges?.remove();
    edges = null;
    image.style.transform = '';
    intro.dataset.phase = 'complete';
    root.classList.add('is-revealed');
    document.querySelector('#proposal-content').removeAttribute('inert');
    root.classList.remove('intro-running');
    if (focusWasInIntro) document.querySelector('.brand-seal').focus({preventScroll:true});
    const anchor = targetHash ? document.getElementById(targetHash.slice(1)) : null;
    if (anchor) anchor.scrollIntoView({behavior:'instant', block:'start'});
    document.dispatchEvent(new CustomEvent('hero:intro-end'));
    window.ScrollTrigger?.refresh();
    intro.hidden = true;
    intro.style.clipPath = '';
    status.textContent = 'Welcome to Devika Sakhuja.';
  }

  function archPath(width, top, viewportWidth, viewportHeight) {
    const r = width / 2;
    const cx = viewportWidth / 2;
    return `M${cx-r},${viewportHeight+10}V${top+r}A${r},${r} 0 0 1 ${cx+r},${top+r}V${viewportHeight+10}Z`;
  }

  function reveal(id) {
    resetHeroView();
    return new Promise(resolve => {
      edges = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      edges.classList.add('arch-edges');
      edges.setAttribute('aria-hidden', 'true');
      edges.innerHTML = '<path/><path/>';
      document.body.append(edges);
      intro.classList.add('is-revealing');
      intro.dataset.phase = 'reveal';
      const start = performance.now();
      let imageStarted = false;
      function tick(now) {
        if (sequence !== id) return resolve();
        if (scrollY !== 0 || scrollX !== 0) resetHeroView();
        const elapsed = now - start;
        const w = innerWidth, h = innerHeight;
        const initialWidth = w * (w < 900 ? .32 : .24);
        const middleWidth = w * (w < 900 ? .64 : .36);
        let apertureWidth, top;
        if (elapsed < 1500) {
          const t = easeArch(Math.min(elapsed / 1500, 1));
          apertureWidth = lerp(initialWidth, middleWidth, t);
          top = lerp(h * 1.04, h * .15, t);
        } else {
          const t = easeDive(Math.min((elapsed - 1500) / 2300, 1));
          apertureWidth = lerp(middleWidth, Math.max(w * 2.5, h * 3), t);
          top = lerp(h * .15, -h * 3.5, t);
          if (!imageStarted) {
            imageStarted = true;
            root.classList.add('is-revealed');
            imageAnimation = image.animate([{ transform: 'scale(1)' }, { transform: `scale(${finalImageScale})` }], { duration: 2200, easing: 'cubic-bezier(.4,0,.1,1)', fill: 'forwards' });
          }
        }
        const hole = archPath(apertureWidth, top, w, h);
        intro.style.clipPath = `path(evenodd, "M0,0H${w}V${h}H0Z ${hole}")`;
        const paths = edges.querySelectorAll('path');
        paths[0].setAttribute('d', archPath(apertureWidth + 12, top - 6, w, h));
        paths[1].setAttribute('d', archPath(apertureWidth + 32, top - 16, w, h));
        if (elapsed < 3800) frame = requestAnimationFrame(tick);
        else { finishIntro(); resolve(); }
      }
      frame = requestAnimationFrame(tick);
    });
  }

  async function playIntro() {
    const id = ++sequence;
    cancelAnimationFrame(frame);
    edges?.remove();
    imageAnimation?.cancel();
    intro.hidden = false;
    intro.style.clipPath = '';
    root.classList.add('intro-running');
    intro.dataset.phase = 'loading';
    intro.classList.remove('is-ready', 'is-revealing');
    intro.classList.add('is-short');
    root.classList.remove('is-revealed');
    document.querySelector('#proposal-content').setAttribute('inert', '');
    document.dispatchEvent(new CustomEvent('hero:intro-start'));
    resetHeroView();
    status.textContent = 'Preparing a little magic.';
    updateFrame();
    await Promise.race([Promise.allSettled([sceneReady, document.fonts.ready]), pause(5000)]);
    if (id !== sequence) return;
    resetHeroView();
    if (reducedMotion.matches) { finishIntro(); return; }
    intro.classList.add('is-ready');
    await reveal(id);
  }

  async function skipIntro() {
    const id = ++sequence;
    cancelAnimationFrame(frame);
    await Promise.race([sceneReady, pause(5000)]);
    if (id === sequence) finishIntro();
  }
  document.querySelector('.skip-intro').addEventListener('click', skipIntro);
  document.querySelector('.replay-intro').addEventListener('click', () => {
    playIntro();
    document.querySelector('.skip-intro').focus({preventScroll:true});
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !intro.hidden) skipIntro(); });
  addEventListener('resize', updateFrame, {passive:true});
  addEventListener('pagehide', () => { sequence++; finishIntro(); });
  playIntro().catch(finishIntro);
})();

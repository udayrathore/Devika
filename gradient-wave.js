// Gradient Wave Text on Scroll — resource supplied by the user (Osmo Supply).
gsap.registerPlugin(ScrollTrigger, SplitText);

function initGradientWaveText() {
  document.querySelectorAll('[data-gradient-wave-text]').forEach((heading) => {
    const scrollStart = heading.getAttribute('data-gradient-wave-scroll-start') || 'top 90%';
    const scrollEnd = heading.getAttribute('data-gradient-wave-scroll-end') || 'center 40%';
    const startColor = heading.getAttribute('data-gradient-wave-color-start') || 'rgba(255, 255, 255, 0.2)';
    const waveColor = heading.getAttribute('data-gradient-wave-color-wave') || '#F84131';
    const waveDuration = parseFloat(heading.getAttribute('data-gradient-wave-duration')) || 0.4;
    const scrubValue = parseFloat(heading.getAttribute('data-gradient-wave-scrub')) || 0.1;
    const endColor = getComputedStyle(heading).color;

    new SplitText(heading, {
      type: 'words, chars',
      autoSplit: true,
      onSplit(self) {
        const chars = self.chars;
        const activeChars = new Set();
        const progress = { value: 0 };
        let isReady = false;

        const syncChars = () => {
          const activeCount = Math.round(progress.value * chars.length);
          chars.forEach((char, index) => {
            const isActive = index < activeCount;
            gsap.killTweensOf(char);
            gsap.set(char, {color: isActive ? endColor : startColor});
            if (isActive) activeChars.add(char);
            else activeChars.delete(char);
          });
        };

        const ctx = gsap.context(() => {
          gsap.set(chars, {color: startColor});
          gsap.to(progress, {
            value: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: heading,
              start: scrollStart,
              end: scrollEnd,
              scrub: scrubValue,
              onRefresh: () => {
                isReady = false;
                syncChars();
                requestAnimationFrame(() => { isReady = true; });
              }
            },
            onUpdate: () => {
              if (!isReady) return;
              const activeCount = Math.round(progress.value * chars.length);
              chars.forEach((char, index) => {
                const isActive = index < activeCount;
                if (isActive && !activeChars.has(char)) {
                  activeChars.add(char);
                  gsap.killTweensOf(char);
                  gsap.timeline()
                    .to(char, {color: waveColor, duration: waveDuration * 0.3, ease: 'power2.out'})
                    .to(char, {color: endColor, duration: waveDuration * 0.7, ease: 'power2.in'});
                }
                if (!isActive && activeChars.has(char)) {
                  activeChars.delete(char);
                  gsap.killTweensOf(char);
                  gsap.to(char, {color: startColor, duration: waveDuration * 0.5, ease: 'none'});
                }
              });
            }
          });
        }, heading);
        return ctx;
      }
    });
  });
}

// Keep the supplied animation for normal motion; retain plain headings for reduced motion.
document.addEventListener('DOMContentLoaded', () => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    initGradientWaveText();
  });
});

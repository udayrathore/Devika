// Lakeside hero: natural text scrolling, image zoom, and twilight-to-day blend.
(() => {
  const area = document.querySelector(".designer-hero-scroll-area");
  const scene = area.querySelector(".designer-hero-scene");
  const frame = area.querySelector(".designer-hero-image-wrap");
  const smoothWindow = (progress, start, end) => {
    const t = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  function daylight(progress) {
    const value = smoothWindow(progress, 0.08, 0.92);
    frame.style.setProperty("--daylight", value);
    area.style.setProperty("--daylight", value);
  }
  const sectionNav = document.querySelector(".section-nav");
  new IntersectionObserver((entries) => {
    sectionNav.dataset.onHero = String(entries[0].isIntersecting);
  }).observe(area);
  gsap.registerPlugin(ScrollTrigger);
  Promise.allSettled(
    [...area.querySelectorAll("img")].map((image) => image.decode()),
  ).then(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: area,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => daylight(self.progress),
            onRefresh: (self) => daylight(self.progress),
          },
        })
        .fromTo(scene, { scale: 1 }, { scale: 1.1, ease: "none", duration: 1 });
      return () => daylight(0);
    });
    ScrollTrigger.refresh();
  });
  document.addEventListener("hero:intro-start", () => daylight(0));
  document.addEventListener("hero:intro-end", () => ScrollTrigger.refresh());
})();

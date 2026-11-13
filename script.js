const toggle = document.querySelector("#nav-toggle"),
  links = document.querySelector("#section-links");
function closeNav() {
  links.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  document.querySelector("#nav-symbol").textContent = "＋";
}
toggle.addEventListener("click", () => {
  links.hidden = !links.hidden;
  toggle.setAttribute("aria-expanded", String(!links.hidden));
  document.querySelector("#nav-symbol").textContent = links.hidden ? "＋" : "−";
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) closeNav();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeNav();
    toggle.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".section-nav")) closeNav();
});
const sections = [...document.querySelectorAll("main section")];
const labels = [...document.querySelectorAll("#section-links a")].map((link) =>
  link.textContent.replace(/^(\d+) /, "$1 / "),
);
const observer = new IntersectionObserver(
  (entries) => {
    for (const e of entries)
      if (e.isIntersecting)
        document.querySelector("#current-section").textContent =
          labels[sections.indexOf(e.target)];
  },
  { rootMargin: "-15% 0px -65% 0px" },
);
sections.forEach((s) => observer.observe(s));
let openBeforePrint = [];
window.addEventListener("beforeprint", () => {
  openBeforePrint = [...document.querySelectorAll("details")].filter(
    (d) => d.open,
  );
  document.querySelectorAll("details").forEach((d) => (d.open = true));
});
window.addEventListener("afterprint", () =>
  document
    .querySelectorAll("details")
    .forEach((d) => (d.open = openBeforePrint.includes(d))),
);
document
  .querySelector("#print")
  .addEventListener("click", () => window.print());

// Scroll reveals the photographs inside a sticky, edge-to-edge frame.
(() => {
  const root = document.querySelector(".direction-scroll-stack");
  if (!root || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const slides = [...root.querySelectorAll(".direction-slide")];
  const count = root.querySelector(".direction-stack-count");
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    root.classList.add("is-scroll-driven");
    gsap.set(slides.slice(1), { clipPath: "inset(100% 0% 0% 0%)" });
    const sequence = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top 18%",
        end: "bottom 83%",
        scrub: 0.45,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          count.textContent =
            String(
              Math.min(
                slides.length,
                Math.floor(self.progress * (slides.length - 1)) + 1,
              ),
            ).padStart(2, "0") + " / 05";
        },
      },
    });
    slides.slice(1).forEach((slide, i) => {
      sequence.to(
        slide,
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "none" },
        i,
      );
      sequence.fromTo(
        slide.querySelector("img"),
        { scale: 1.08 },
        { scale: 1, duration: 1, ease: "none" },
        i,
      );
    });
    return () => {
      root.classList.remove("is-scroll-driven");
      count.textContent = "01 / 05";
    };
  });
})();

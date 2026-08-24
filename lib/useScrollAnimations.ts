"use client";
import { useLayoutEffect } from "react";

// Drives .reveal scroll-in animations and [data-count] animated counters,
// shared across every page (see original static HTML's inline <script>).
// Uses useLayoutEffect (not useEffect) so above-the-fold .reveal elements get
// their "in" class added before the browser paints — otherwise every route
// change briefly flashes the whole page at opacity:0 while the effect runs.
export function useScrollAnimations() {
  useLayoutEffect(() => {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
    });

    const fmt = (n: number): string =>
      n >= 1000
        ? Math.round(n).toLocaleString("en-IN")
        : String(Math.round(n));

    const cio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const target = Number(el.dataset.count);
          const suf = el.dataset.suffix || "";
          const dur = 1600;
          let startTs: number | null = null;

          const step = (t: number) => {
            if (!startTs) startTs = t;
            const p = Math.min((t - startTs) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased) + suf;
            if (p < 1) requestAnimationFrame(step);
          };

          requestAnimationFrame(step);
          cio.unobserve(el);
        }),
      { threshold: 0.5 }
    );

    document.querySelectorAll("[data-count]").forEach((el) => cio.observe(el));

    const fallback = setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        if (el.textContent === "0" || el.textContent === "") {
          const target = Number(el.dataset.count);
          const suf = el.dataset.suffix || "";
          el.textContent = fmt(target) + suf;
        }
      });
      document.querySelectorAll<HTMLElement>(".reveal").forEach((el) => {
        el.classList.add("in");
      });
    }, 2500);

    return () => {
      io.disconnect();
      cio.disconnect();
      clearTimeout(fallback);
    };
  }, []);
}

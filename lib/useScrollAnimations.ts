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

    // Reveals a single .reveal element: if it's already in the viewport
    // (the common case for content that just appeared from a filter/tab
    // click rather than a page load), show it immediately instead of
    // waiting on the scroll observer or the 2.5s fallback below.
    const revealIfVisible = (el: Element) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      else io.observe(el);
    };

    document.querySelectorAll(".reveal").forEach(revealIfVisible);

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

    // .reveal/[data-count] elements created after this effect ran (filter
    // results, tab switches, pagination) were never scanned above, so
    // without this they'd sit at opacity:0 until the fallback timer fires
    // once at 2.5s post-load — or forever, if that's already elapsed. Watch
    // the DOM so newly added content reveals itself right away instead of
    // looking stuck/slow.
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(".reveal")) revealIfVisible(node);
          node.querySelectorAll?.(".reveal").forEach(revealIfVisible);
          if (node.matches("[data-count]")) cio.observe(node);
          node.querySelectorAll?.("[data-count]").forEach((el) => cio.observe(el));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

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
      mo.disconnect();
      clearTimeout(fallback);
    };
  }, []);
}

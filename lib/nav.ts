// Resolves an in-page hash link (e.g. "#products") to work from any route —
// on the homepage it stays a plain anchor, elsewhere it points back to "/#products".
export function resolveHref(href: string, pathname: string): string {
  return href.startsWith("#") && pathname !== "/" ? `/${href}` : href;
}

// Native `window.scrollTo({ behavior: "smooth" })` uses a fast, fixed browser
// easing that feels abrupt over short distances. This animates with a gentler
// ease-out curve over a fixed duration so nav-triggered scrolls feel calmer.
export function scrollToTopEased(duration = 600) {
  const start = window.scrollY;
  if (start <= 0) return;
  const startTime = performance.now();
  const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

  const step = (now: number) => {
    const p = Math.min((now - startTime) / duration, 1);
    window.scrollTo(0, start * (1 - easeOutQuint(p)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

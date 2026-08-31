"use client";
import { useRef, useState, type CSSProperties, type MouseEvent } from "react";

// Amazon-style hover magnifier: tracks the cursor and scales the image with
// a matching transform-origin, so the point under the cursor stays put while
// the rest of the image zooms in around it. Click opens the full lightbox.
export default function ProductImageZoom({
  src,
  alt,
  onOpen,
}: {
  src: string;
  alt: string;
  onOpen: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({});

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.2)" });
  };

  return (
    <div
      ref={containerRef}
      className="pdp-zoom-wrap"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseMove={handleMove}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label="Open image viewer"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="pdp-zoom-img" style={hovering ? zoomStyle : undefined} />
      {hovering && (
        <span className="pdp-zoom-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6M8 11h6" />
          </svg>
          Click to enlarge
        </span>
      )}
    </div>
  );
}

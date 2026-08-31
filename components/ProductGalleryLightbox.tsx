"use client";
import { useEffect, useRef, useState, type MouseEvent, type WheelEvent } from "react";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;

export default function ProductGalleryLightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null);

  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const next = () => { setIndex((i) => (i + 1) % images.length); resetView(); };
  const prev = () => { setIndex((i) => (i - 1 + images.length) % images.length); resetView(); };

  const zoomIn = () => setScale((s) => Math.min(s + SCALE_STEP, MAX_SCALE));
  const zoomOut = () => setScale((s) => {
    const next = Math.max(s - SCALE_STEP, MIN_SCALE);
    if (next === MIN_SCALE) setPan({ x: 0, y: 0 });
    return next;
  });

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const startDrag = (e: MouseEvent<HTMLImageElement>) => {
    if (scale <= 1) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y };
  };
  const onDrag = (e: MouseEvent<HTMLImageElement>) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    setPan({ x: d.panX + (e.clientX - d.startX), y: d.panY + (e.clientY - d.startY) });
  };
  const endDrag = () => { dragRef.current = null; };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pdp-lightbox-backdrop" onClick={onClose}>
      <div className="pdp-lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="pdp-lightbox-tool" onClick={zoomOut} disabled={scale <= MIN_SCALE} aria-label="Zoom out">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" />
          </svg>
        </button>
        <span className="pdp-lightbox-zoom-level">{Math.round(scale * 100)}%</span>
        <button type="button" className="pdp-lightbox-tool" onClick={zoomIn} disabled={scale >= MAX_SCALE} aria-label="Zoom in">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6M8 11h6" />
          </svg>
        </button>
        <button type="button" className="pdp-lightbox-tool" onClick={resetView} disabled={scale === 1 && pan.x === 0 && pan.y === 0} aria-label="Reset zoom">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
          </svg>
        </button>
      </div>

      <button type="button" className="pdp-lightbox-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <button type="button" className="pdp-lightbox-arrow left" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      )}

      <div className="pdp-lightbox-stage" onClick={(e) => e.stopPropagation()} onWheel={handleWheel}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt=""
          draggable={false}
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
          }}
          onDoubleClick={() => (scale > 1 ? resetView() : zoomIn())}
        />
      </div>

      {images.length > 1 && (
        <button type="button" className="pdp-lightbox-arrow right" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      )}

      {images.length > 1 && (
        <div className="pdp-lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button type="button" key={src} className={`pdp-lightbox-thumb${i === index ? " active" : ""}`} onClick={() => { setIndex(i); resetView(); }} aria-label={`View image ${i + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      <div className="pdp-lightbox-counter">{index + 1} / {images.length}</div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropToFile, readFileAsDataUrl, containZoom } from "@/lib/admin/imageCrop";

// Processes a batch of just-selected files through the crop tool one at a
// time (rect/square — these are gallery photos, not avatar circles) before
// handing the final cropped files back. `files` is treated as a queue: set
// it (non-empty) to start processing; it's consumed internally and the
// caller gets the result via `onComplete`.
export default function GalleryCropModal({
  files,
  onComplete,
}: {
  files: File[];
  onComplete: (croppedFiles: File[]) => void;
}) {
  const [index, setIndex] = useState(0);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  // True once the admin has actually dragged/wheel-zoomed the image or used
  // the zoom slider (see applyCrop): the library's onCropComplete can lag a
  // purely programmatic zoom change, so the untouched default is only
  // trusted to mean "whole image, no crop" once it's confirmed the admin
  // hasn't actually moved anything yet. Detected at the DOM level, not
  // react-easy-crop's own onCropChange/onZoomChange — those can echo on
  // non-interactive updates too.
  const [touched, setTouched] = useState(false);
  const [results, setResults] = useState<File[]>([]);

  // Defaults to showing the whole photo shrunk to fit ("contain") rather than
  // cropping it to fill the square — nothing the admin uploads gets cut off
  // unless they deliberately zoom in. Any margin left over is filled white by
  // cropToFile. Admins who do want a tighter, edge-to-edge crop can still
  // drag the zoom slider up to 1 ("cover") themselves.
  const onMediaLoaded = useCallback(({ naturalWidth, naturalHeight }: { naturalWidth: number; naturalHeight: number }) => {
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    const fitZoom = containZoom(naturalWidth, naturalHeight);
    setMinZoom(fitZoom);
    setZoom(fitZoom);
  }, []);

  useEffect(() => {
    if (files.length === 0) return;
    setIndex(0);
    setResults([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setNaturalSize(null);
    setTouched(false);
    readFileAsDataUrl(files[0]).then(setRawSrc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const advance = (nextResults: File[]) => {
    const next = index + 1;
    if (next >= files.length) {
      setRawSrc(null);
      onComplete(nextResults);
      return;
    }
    setIndex(next);
    setResults(nextResults);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setMinZoom(1);
    setNaturalSize(null);
    setTouched(false);
    readFileAsDataUrl(files[next]).then(setRawSrc);
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const applyCrop = async () => {
    if (!rawSrc) return;
    // Untouched (still at the default "contain" zoom) means "whole image,
    // no crop" — use the full natural size rather than trusting
    // croppedArea, since react-easy-crop's own onCropComplete can lag a
    // purely programmatic zoom change. Once the admin has genuinely
    // interacted, croppedArea is correct.
    const area = !touched && naturalSize ? { x: 0, y: 0, ...naturalSize } : croppedArea;
    if (!area) return;
    const file = await cropToFile(rawSrc, area, files[index].name);
    advance([...results, file]);
  };

  const skip = () => advance(results);

  if (files.length === 0 || !rawSrc) return null;

  return (
    <div className="admin-crop-overlay">
      <div className="admin-crop-modal">
        <p style={{ fontSize: 13, color: "var(--color-neutral-600)", margin: 0 }}>
          Image {index + 1} of {files.length}
        </p>
        <div
          className="admin-crop-stage"
          onPointerDown={() => setTouched(true)}
          onWheel={() => setTouched(true)}
        >
          <Cropper
            image={rawSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            onMediaLoaded={onMediaLoaded}
          />
        </div>
        <div className="admin-crop-controls">
          <label style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Zoom</label>
          <input
            type="range"
            min={minZoom}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => { setTouched(true); setZoom(Number(e.target.value)); }}
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-ghost" onClick={skip}>Skip</button>
          <button type="button" className="btn btn-primary" onClick={applyCrop}>Use this crop</button>
        </div>
      </div>
    </div>
  );
}

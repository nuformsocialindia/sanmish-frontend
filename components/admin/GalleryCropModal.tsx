"use client";
import { useEffect, useState, useCallback } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropToFile, readFileAsDataUrl } from "@/lib/admin/imageCrop";

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
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [results, setResults] = useState<File[]>([]);

  useEffect(() => {
    if (files.length === 0) return;
    setIndex(0);
    setResults([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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
    readFileAsDataUrl(files[next]).then(setRawSrc);
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const applyCrop = async () => {
    if (!rawSrc || !croppedArea) return;
    const file = await cropToFile(rawSrc, croppedArea, files[index].name);
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
        <div className="admin-crop-stage">
          <Cropper
            image={rawSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="admin-crop-controls">
          <label style={{ fontSize: 13, color: "var(--color-neutral-600)" }}>Zoom</label>
          <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost" onClick={skip}>Skip</button>
          <button type="button" className="btn btn-primary" onClick={applyCrop}>Use this crop</button>
        </div>
      </div>
    </div>
  );
}

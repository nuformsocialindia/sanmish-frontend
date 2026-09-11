"use client";
import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { cropToFile, containZoom } from "@/lib/admin/imageCrop";

export default function ImageCropPicker({
  label,
  currentImageUrl,
  onChange,
  onRemoveExisting,
}: {
  label: string;
  currentImageUrl?: string;
  onChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [rawName, setRawName] = useState("image.jpg");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  // True once the admin has actually dragged/wheel-zoomed the image or used
  // the zoom slider — only relevant if they zoom out below the default (see
  // applyCrop). Detected at the DOM level (onPointerDown/onWheel below),
  // not react-easy-crop's own onCropChange/onZoomChange — those can echo on
  // non-interactive updates too.
  const [touched, setTouched] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  const handleSelect = (file: File | null) => {
    if (!file) return;
    setRemoved(false);
    setRawName(file.name);
    setSelectedName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setRawSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setMinZoom(1);
      setNaturalSize(null);
      setTouched(false);
    };
    reader.readAsDataURL(file);
  };

  // Defaults to a normal full-bleed crop (zoom=1, "cover") — matching every
  // other avatar/logo-style image on the site. minZoom is relaxed below 1
  // so an admin who wants to include more of a non-square photo can zoom
  // out and choose that themselves, instead of it happening as a surprise —
  // it's just not the default, since a letterboxed circle looks worse in
  // practice than a clean, well-composed cover crop for most photos.
  const onMediaLoaded = useCallback(({ naturalWidth, naturalHeight }: { naturalWidth: number; naturalHeight: number }) => {
    setNaturalSize({ width: naturalWidth, height: naturalHeight });
    setMinZoom(containZoom(naturalWidth, naturalHeight));
  }, []);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels);
  }, []);

  const applyCrop = async () => {
    if (!rawSrc) return;
    const area = zoom < 1 && !touched && naturalSize ? { x: 0, y: 0, ...naturalSize } : croppedArea;
    if (!area) return;
    const file = await cropToFile(rawSrc, area, rawName);
    setPreviewUrl(URL.createObjectURL(file));
    onChange(file);
    setRawSrc(null);
  };

  const cancelCrop = () => {
    setRawSrc(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setSelectedName(null);
    setRemoved(true);
    onChange(null);
    onRemoveExisting?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  const shownPreview = removed ? undefined : previewUrl ?? currentImageUrl;

  // Native file inputs never reflect a path we set programmatically (browsers
  // block that for security) — show our own status instead of relying on the
  // input's built-in "No file chosen" label, which is always wrong once a
  // category already has an image saved from a previous session.
  const currentImageName = currentImageUrl ? decodeURIComponent(currentImageUrl.split("/").pop() || "") : null;
  const statusText = removed
    ? "No image"
    : selectedName ?? currentImageName ?? "No image selected";

  return (
    <div className="field" style={{ minWidth: 0 }}>
      <label>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        {shownPreview && (
          <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "1px solid var(--color-neutral-300)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={shownPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
          style={{ display: "none" }}
        />
        <button type="button" className="btn btn-secondary btn-sm" style={{ flexShrink: 0 }} onClick={() => inputRef.current?.click()}>
          Choose file
        </button>
        <span
          title={statusText}
          style={{
            fontSize: 13,
            color: "var(--color-neutral-600)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {statusText}
        </span>
        {shownPreview && (
          <button type="button" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={clearImage}>Remove</button>
        )}
      </div>

      {rawSrc && (
        <div className="admin-crop-overlay">
          <div className="admin-crop-modal">
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
                cropShape="round"
                showGrid={false}
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
              <button type="button" className="btn btn-ghost" onClick={cancelCrop}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={applyCrop}>Use this crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

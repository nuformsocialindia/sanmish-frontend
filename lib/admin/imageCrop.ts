import type { Area } from "react-easy-crop";

// Reads a File into an <img>-loadable data URL, crops the selected region to
// a square canvas, and resolves a JPEG File — used so what the admin sees in
// the crop tool is exactly what gets uploaded, instead of leaving the crop
// to a blind `object-fit: cover` on the public site.
export async function cropToFile(imageSrc: string, area: Area, filename: string, outputSize = 640): Promise<File> {
  const img = new Image();
  img.src = imageSrc;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // `area` isn't always square (e.g. at a zoomed-out "contain" view it's
  // the whole image, in its own natural aspect ratio) — forcing it to fill
  // the full outputSize x outputSize destination would stretch/distort it.
  // Instead scale it down to fit within the square (preserving aspect) and
  // center it, filling the rest with white — a clean margin instead of a
  // black bar (JPEG has no alpha, so any undrawn canvas area turns black)
  // or a warped image, the standard treatment for a photo that doesn't
  // perfectly fill a square.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputSize, outputSize);
  const scale = Math.min(outputSize / area.width, outputSize / area.height);
  const destWidth = area.width * scale;
  const destHeight = area.height * scale;
  const destX = (outputSize - destWidth) / 2;
  const destY = (outputSize - destHeight) / 2;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, destX, destY, destWidth, destHeight);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.92);
  });
  return new File([blob], filename.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

// react-easy-crop's zoom=1 means "cover" the (square) crop area — the
// image's SHORTER side is scaled to fill it, so the longer side overflows
// and gets cut off by default for any non-square image. This computes the
// zoom that instead "contains" the whole image (no cropping) so that's what
// admins see first, with room to zoom in afterwards if they actually want
// to crop tighter. Also usable as the Cropper's `minZoom`, since nothing
// below this value shows anything new — the image is already fully visible.
export function containZoom(naturalWidth: number, naturalHeight: number): number {
  if (!naturalWidth || !naturalHeight) return 1;
  return Math.min(1, Math.min(naturalWidth, naturalHeight) / Math.max(naturalWidth, naturalHeight));
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

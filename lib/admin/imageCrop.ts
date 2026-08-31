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
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outputSize, outputSize);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Crop failed"))), "image/jpeg", 0.92);
  });
  return new File([blob], filename.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

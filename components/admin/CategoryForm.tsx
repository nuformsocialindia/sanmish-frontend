"use client";
import { useState } from "react";
import { assetUrl } from "@/lib/admin/api";
import ImageCropPicker from "@/components/admin/ImageCropPicker";

export const FUEL_TYPES = ["CNG", "CBG", "BIO_GAS", "HYDROGEN", "MULTI_FUEL"] as const;

type CategoryLike = Record<string, unknown> & { id?: string; imageUrl?: string | null };

export default function CategoryForm({
  initial,
  parentOptions,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: CategoryLike | null;
  parentOptions: { id: string; label: string }[];
  onSubmit: (fd: FormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(String(initial?.name ?? ""));
  const [description, setDescription] = useState(String(initial?.description ?? ""));
  const [metaTitle, setMetaTitle] = useState(String(initial?.metaTitle ?? ""));
  const [metaDescription, setMetaDescription] = useState(String(initial?.metaDescription ?? ""));
  const [fuelType, setFuelType] = useState(String(initial?.fuelType ?? ""));
  const [parentId, setParentId] = useState(String(initial?.parentId ?? ""));
  const [priority, setPriority] = useState(String(initial?.priority ?? ""));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    fd.append("name", name);
    if (description) fd.append("description", description);
    if (metaTitle) fd.append("metaTitle", metaTitle);
    if (metaDescription) fd.append("metaDescription", metaDescription);
    if (fuelType) fd.append("fuelType", fuelType);
    if (parentId) fd.append("parentId", parentId);
    if (priority) fd.append("priority", priority);
    if (imageFile) fd.append("image", imageFile);
    else if (imageRemoved) fd.append("removeImage", "true");
    try {
      await onSubmit(fd);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="adm-form-grid cols-3">
      <div className="field full"><label>Name *</label><input className="input" required value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field">
        <label>Parent category</label>
        <select className="input" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">None (top-level)</option>
          {parentOptions.filter((o) => o.id !== initial?.id).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </div>
      <div className="field"><label>Priority</label><input className="input" type="number" value={priority} onChange={(e) => setPriority(e.target.value)} /></div>
      <div className="field">
        <label>Fuel type (root/fuel-family categories only)</label>
        <select className="input" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
          <option value="">— none —</option>
          {FUEL_TYPES.map((f) => <option key={f} value={f}>{f.replace(/_/g, " ")}</option>)}
        </select>
      </div>
      <div className="field"><label>Meta title</label><input className="input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
      <div className="field"><label>Meta description</label><input className="input" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} /></div>
      <div className="field full"><label>Description</label><textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
      <ImageCropPicker
        label="Image"
        currentImageUrl={assetUrl(initial?.imageUrl)}
        onChange={setImageFile}
        onRemoveExisting={() => setImageRemoved(true)}
      />
      <div className="field full adm-form-actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel && <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import { getVenueInfo, saveVenueInfo } from "@/lib/firebase/venue-info-client";
import type { VenueInfo } from "@/types/venue";

const fieldClasses =
  "w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11";
const labelClasses = "mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase";

function AboutSection() {
  const [info, setInfo] = useState<VenueInfo | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getVenueInfo().then(setInfo).catch(() => toast.error("Could not load venue info."));
  }, []);

  async function handleSave() {
    if (!info) return;
    setSaving(true);
    try {
      await saveVenueInfo(info);
      toast.success("Venue info saved.");
    } catch {
      toast.error("Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (!info) return <Loader2 className="size-5 animate-spin text-vrind-text-muted" />;

  return (
    <div className="mb-12">
      <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
        About the Venue
      </p>
      <p className="mb-4 text-xs text-vrind-text-muted">
        This is the copy shown in the hero and the three pillars on the homepage.
      </p>
      <div className="flex flex-col gap-4">
        <div>
          <label className={labelClasses}>Hero description</label>
          <textarea
            rows={2}
            className={fieldClasses}
            value={info.aboutText}
            onChange={(e) => setInfo({ ...info, aboutText: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClasses}>Banquet description</label>
          <textarea
            rows={2}
            className={fieldClasses}
            value={info.banquetDescription}
            onChange={(e) => setInfo({ ...info, banquetDescription: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClasses}>Lawn description</label>
          <textarea
            rows={2}
            className={fieldClasses}
            value={info.lawnDescription}
            onChange={(e) => setInfo({ ...info, lawnDescription: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelClasses}>Capacity text</label>
            <input
              className={fieldClasses}
              value={info.capacityText}
              onChange={(e) => setInfo({ ...info, capacityText: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClasses}>Banquet sq ft</label>
            <input
              type="number"
              className={fieldClasses}
              value={info.banquetAreaSqft}
              onChange={(e) => setInfo({ ...info, banquetAreaSqft: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className={labelClasses}>Lawn sq ft</label>
            <input
              type="number"
              className={fieldClasses}
              value={info.lawnAreaSqft}
              onChange={(e) => setInfo({ ...info, lawnAreaSqft: Number(e.target.value) })}
            />
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex min-h-11 w-fit items-center gap-2 bg-vrind-gold px-5 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save
        </button>
      </div>
    </div>
  );
}

interface ServiceDoc { id: string; name: string; description: string; displayOrder: number; published: boolean; icon: string }
interface FacilityDoc { id: string; name: string; note: string; chargeable: boolean; displayOrder: number; published: boolean }

function ServicesSection() {
  const [items, setItems] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listCollection<Omit<ServiceDoc, "id">>("services"));
    } catch {
      toast.error("Could not load services.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createDoc("services", { name: name.trim(), description: description.trim(), icon: "", published: true, displayOrder: items.length });
      setName(""); setDescription("");
      await refresh();
    } catch {
      toast.error("Could not add service.");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(item: ServiceDoc) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: !i.published } : i)));
    updateDocById("services", item.id, { published: !item.published }).catch(() => refresh());
  }

  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    await deleteDocById("services", id).catch(() => toast.error("Could not delete."));
    refresh();
  }

  return (
    <div>
      <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">Services</p>
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Custom Stage"
          className="flex-1 rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11" />
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description"
          className="flex-1 rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11" />
        <button onClick={handleAdd} disabled={adding} className="flex items-center gap-1.5 bg-vrind-gold px-4 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50">
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </div>
      {loading ? <Loader2 className="mt-6 size-5 animate-spin text-vrind-text-muted" /> : (
        <ul className="mt-4 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <span className={`text-sm ${item.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>{item.name}</span>
                {item.description && <span className="ml-2 text-xs text-vrind-text-muted">{item.description}</span>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => toggle(item)} className="text-vrind-text-muted hover:text-vrind-gold">
                  {item.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button onClick={() => remove(item.id)} className="text-vrind-text-muted hover:text-vrind-error">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {items.length === 0 && <p className="py-6 text-sm text-vrind-text-muted">No services yet.</p>}
        </ul>
      )}
    </div>
  );
}

function FacilitiesSection() {
  const [items, setItems] = useState<FacilityDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [chargeable, setChargeable] = useState(false);
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listCollection<Omit<FacilityDoc, "id">>("facilities"));
    } catch {
      toast.error("Could not load facilities.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      await createDoc("facilities", { name: name.trim(), note: note.trim(), chargeable, published: true, displayOrder: items.length });
      setName(""); setNote(""); setChargeable(false);
      await refresh();
    } catch {
      toast.error("Could not add facility.");
    } finally {
      setAdding(false);
    }
  }

  async function toggle(item: FacilityDoc) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, published: !i.published } : i)));
    updateDocById("facilities", item.id, { published: !item.published }).catch(() => refresh());
  }

  async function remove(id: string) {
    if (!confirm("Delete this facility?")) return;
    await deleteDocById("facilities", id).catch(() => toast.error("Could not delete."));
    refresh();
  }

  return (
    <div className="mt-10">
      <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">Facilities</p>
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Bridal Room"
          className="flex-1 rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (e.g. additional charges apply)"
          className="flex-1 rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11" />
        <label className="flex min-h-11 items-center gap-2 px-2 text-sm text-vrind-text-secondary">
          <input type="checkbox" checked={chargeable} onChange={(e) => setChargeable(e.target.checked)} />
          Chargeable
        </label>
        <button onClick={handleAdd} disabled={adding} className="flex items-center gap-1.5 bg-vrind-gold px-4 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50">
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
        </button>
      </div>
      {loading ? <Loader2 className="mt-6 size-5 animate-spin text-vrind-text-muted" /> : (
        <ul className="mt-4 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <span className={`text-sm ${item.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>{item.name}</span>
                {item.chargeable && <span className="ml-2 text-[10px] uppercase tracking-wide text-vrind-gold-muted">Chargeable</span>}
                {item.note && <span className="ml-2 text-xs text-vrind-text-muted">{item.note}</span>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => toggle(item)} className="text-vrind-text-muted hover:text-vrind-gold">
                  {item.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
                <button onClick={() => remove(item.id)} className="text-vrind-text-muted hover:text-vrind-error">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
          {items.length === 0 && <p className="py-6 text-sm text-vrind-text-muted">No facilities yet.</p>}
        </ul>
      )}
    </div>
  );
}

export default function VenueAdminPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary">Venue &amp; Services</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Shown in the Services &amp; Facilities section on the homepage.
      </p>
      <div className="mt-8">
        <AboutSection />
        <ServicesSection />
        <FacilitiesSection />
      </div>
    </div>
  );
}

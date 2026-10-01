"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Phone, MessageCircle, Archive, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  listInquiries,
  setInquiryStatus,
  setInquiryArchived,
  addContactLogEntry,
} from "@/lib/firebase/inquiries-client";
import { inquiryStatuses, type InquiryStatus } from "@/config/site";
import type { Inquiry } from "@/types/inquiry";

const statusColors: Record<InquiryStatus, string> = {
  NEW: "text-vrind-gold border-vrind-gold/50",
  CONTACTED: "text-blue-400 border-blue-400/40",
  FOLLOW_UP: "text-amber-400 border-amber-400/40",
  CONFIRMED: "text-green-400 border-green-400/40",
  CANCELLED: "text-vrind-text-muted border-vrind-white-border",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | "ALL">("ALL");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      setInquiries(await listInquiries());
      setError(null);
    } catch {
      setError(
        "Could not load inquiries. This usually means Firebase credentials or Firestore rules aren't configured yet in this environment."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (inq.archived !== showArchived) return false;
      if (statusFilter !== "ALL" && inq.status !== statusFilter) return false;
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!inq.name.toLowerCase().includes(s) && !inq.phone.includes(s)) return false;
      }
      return true;
    });
  }, [inquiries, search, statusFilter, showArchived]);

  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  async function handleStatusChange(id: string, status: InquiryStatus) {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await setInquiryStatus(id, status);
    } catch {
      toast.error("Could not update status.");
      refresh();
    }
  }

  async function handleArchiveToggle(id: string, archived: boolean) {
    setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, archived } : i)));
    try {
      await setInquiryArchived(id, archived);
      if (selectedId === id) setSelectedId(null);
    } catch {
      toast.error("Could not update inquiry.");
      refresh();
    }
  }

  async function handleAddNote(id: string) {
    if (!note.trim()) return;
    try {
      await addContactLogEntry(id, note.trim(), "other");
      setNote("");
      refresh();
      toast.success("Note added.");
    } catch {
      toast.error("Could not add note.");
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-vrind-text-primary">Inquiries</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Event availability &amp; quote requests submitted by customers.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* List */}
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-vrind-text-muted" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone"
                  className="w-full rounded-md border border-vrind-white-border bg-vrind-surface py-2.5 pl-9 pr-3 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | "ALL")}
                className="rounded-md border border-vrind-white-border bg-vrind-surface px-3 py-2.5 text-sm text-vrind-text-primary min-h-11"
              >
                <option value="ALL">All statuses</option>
                {inquiryStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <button
                onClick={() => setShowArchived((v) => !v)}
                className={`rounded-md border px-3 py-2.5 text-sm min-h-11 ${
                  showArchived
                    ? "border-vrind-gold text-vrind-gold"
                    : "border-vrind-white-border text-vrind-text-secondary"
                }`}
              >
                {showArchived ? "Archived" : "Active"}
              </button>
            </div>

            {loading ? (
              <div className="mt-10 flex justify-center text-vrind-text-muted">
                <Loader2 className="size-5 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="mt-10 text-sm text-vrind-text-muted">No inquiries found.</p>
            ) : (
              <ul className="mt-4 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
                {filtered.map((inq) => (
                  <li key={inq.id}>
                    <button
                      onClick={() => setSelectedId(inq.id)}
                      className={`flex w-full items-center justify-between gap-4 py-3.5 text-left transition-colors hover:bg-vrind-surface ${
                        selectedId === inq.id ? "bg-vrind-surface" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-vrind-text-primary">
                          {inq.name} <span className="text-vrind-text-muted">· {inq.eventType}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-vrind-text-muted">
                          {inq.phone} · {inq.eventDate ? format(parseISO(inq.eventDate), "d MMM yyyy") : "—"} · {inq.guestCount} guests
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-wide ${statusColors[inq.status]}`}>
                        {inq.status}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Detail panel */}
          <div className="rounded-lg border border-vrind-white-border/60 bg-vrind-surface p-5 lg:sticky lg:top-6 lg:h-fit">
            {!selected ? (
              <p className="text-sm text-vrind-text-muted">Select an inquiry to view details.</p>
            ) : (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-heading text-lg text-vrind-text-primary">{selected.name}</h2>
                  <p className="mt-0.5 text-sm text-vrind-text-muted">{selected.phone}</p>
                  <div className="mt-3 flex gap-2">
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 rounded-md border border-vrind-white-border px-3 py-1.5 text-xs text-vrind-text-secondary hover:border-vrind-gold hover:text-vrind-gold">
                      <Phone className="size-3.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md border border-vrind-white-border px-3 py-1.5 text-xs text-vrind-text-secondary hover:border-vrind-gold hover:text-vrind-gold"
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div><dt className="text-xs text-vrind-text-muted">Event Type</dt><dd className="text-vrind-text-primary">{selected.eventType}</dd></div>
                  <div><dt className="text-xs text-vrind-text-muted">Event Date</dt><dd className="text-vrind-text-primary">{selected.eventDate ? format(parseISO(selected.eventDate), "d MMM yyyy") : "—"}</dd></div>
                  <div><dt className="text-xs text-vrind-text-muted">Guests</dt><dd className="text-vrind-text-primary">{selected.guestCount}</dd></div>
                  <div><dt className="text-xs text-vrind-text-muted">Submitted</dt><dd className="text-vrind-text-primary">{selected.createdAt ? format(parseISO(selected.createdAt), "d MMM, h:mm a") : "—"}</dd></div>
                </dl>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  {selected.cateringRequired && <span className="rounded-sm border border-vrind-white-border px-2 py-1 text-vrind-text-secondary">Catering</span>}
                  {selected.djRequired && <span className="rounded-sm border border-vrind-white-border px-2 py-1 text-vrind-text-secondary">DJ</span>}
                  {selected.decorationRequired && <span className="rounded-sm border border-vrind-white-border px-2 py-1 text-vrind-text-secondary">Decoration</span>}
                  {selected.customStageRequired && <span className="rounded-sm border border-vrind-white-border px-2 py-1 text-vrind-text-secondary">Custom Stage</span>}
                </div>

                {selected.message && (
                  <p className="text-sm leading-relaxed text-vrind-text-secondary">{selected.message}</p>
                )}

                <div>
                  <label className="mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase">Status</label>
                  <select
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as InquiryStatus)}
                    className="w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2 text-sm text-vrind-text-primary min-h-11"
                  >
                    {inquiryStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium tracking-wide text-vrind-text-muted uppercase">
                    Contact Log
                  </label>
                  {selected.contactLog.length > 0 && (
                    <ul className="mb-2 space-y-1.5 text-xs text-vrind-text-secondary">
                      {selected.contactLog.map((entry, i) => (
                        <li key={i}>
                          {format(parseISO(entry.contactedAt), "d MMM")} — {entry.note}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Called, discussed pricing"
                      className="flex-1 rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
                    />
                    <button
                      onClick={() => handleAddNote(selected.id)}
                      className="rounded-md border border-vrind-white-border px-3 text-sm text-vrind-text-secondary hover:border-vrind-gold hover:text-vrind-gold"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => handleArchiveToggle(selected.id, !selected.archived)}
                  className="flex items-center gap-2 self-start text-xs text-vrind-text-muted hover:text-vrind-error"
                >
                  <Archive className="size-3.5" /> {selected.archived ? "Restore" : "Archive"} inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

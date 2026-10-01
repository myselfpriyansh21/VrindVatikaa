"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  listCollection,
  createDoc,
  updateDocById,
  deleteDocById,
} from "@/lib/firebase/firestore-crud";
import type { Faq } from "@/types/faq";

const COLLECTION = "faqs";

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [adding, setAdding] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listCollection<Omit<Faq, "id">>(COLLECTION);
      setFaqs(data);
      setError(null);
    } catch {
      setError("Could not load FAQs. Check Firebase credentials for this environment.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd() {
    if (!question.trim() || !answer.trim()) return;
    setAdding(true);
    try {
      await createDoc(COLLECTION, {
        question: question.trim(),
        answer: answer.trim(),
        published: true,
        displayOrder: faqs.length,
      });
      setQuestion("");
      setAnswer("");
      await refresh();
      toast.success("FAQ added.");
    } catch {
      toast.error("Could not add FAQ.");
    } finally {
      setAdding(false);
    }
  }

  async function togglePublished(faq: Faq) {
    setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, published: !f.published } : f)));
    try {
      await updateDocById(COLLECTION, faq.id, { published: !faq.published });
    } catch {
      toast.error("Could not update FAQ.");
      refresh();
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await deleteDocById(COLLECTION, id);
      refresh();
    } catch {
      toast.error("Could not delete FAQ.");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl text-vrind-text-primary">FAQs</h1>
      <p className="mt-1 text-sm text-vrind-text-muted">
        Shown on the homepage. Unpublished questions stay hidden from visitors.
      </p>

      {error && (
        <p className="mt-6 rounded-md border border-vrind-gold-muted/40 bg-vrind-surface p-4 text-sm text-vrind-text-secondary">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="mt-8 rounded-lg border border-vrind-white-border/60 bg-vrind-surface p-5">
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-vrind-gold uppercase">
              Add FAQ
            </p>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Question"
              className="mb-3 w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none min-h-11"
            />
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer"
              rows={2}
              className="mb-3 w-full rounded-md border border-vrind-white-border bg-vrind-black px-3 py-2.5 text-sm text-vrind-text-primary placeholder:text-vrind-text-muted focus:border-vrind-gold focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-2 bg-vrind-gold px-4 py-2 text-sm font-semibold text-vrind-black hover:bg-vrind-gold-bright disabled:opacity-50"
            >
              {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add
            </button>
          </div>

          {loading ? (
            <Loader2 className="mt-8 size-5 animate-spin text-vrind-text-muted" />
          ) : (
            <ul className="mt-6 divide-y divide-vrind-white-border/60 border-t border-vrind-white-border/60">
              {faqs.map((faq) => (
                <li key={faq.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${faq.published ? "text-vrind-text-primary" : "text-vrind-text-muted line-through"}`}>
                      {faq.question}
                    </p>
                    <p className="mt-1 text-xs text-vrind-text-secondary">{faq.answer}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => togglePublished(faq)} className="text-vrind-text-muted hover:text-vrind-gold" title={faq.published ? "Hide" : "Publish"} aria-label={faq.published ? "Hide" : "Publish"}>
                      {faq.published ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                    </button>
                    <button onClick={() => remove(faq.id)} className="text-vrind-text-muted hover:text-vrind-error" title="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
              {faqs.length === 0 && (
                <p className="py-6 text-sm text-vrind-text-muted">No FAQs yet — add one above.</p>
              )}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, LoaderCircle, ShieldCheck, UploadCloud } from "lucide-react";

import { type ApiError, uploadContract } from "@/lib/api";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isSupportedFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  return ACCEPTED_EXTENSIONS.includes(extension) || ACCEPTED_MIME_TYPES.includes(file.type);
}

export function ContractUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelectedFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!isSupportedFile(file)) {
      setError("Only PDF and DOCX contracts are supported.");
      return;
    }

    setSelectedName(file.name);
    setError(null);
    setIsUploading(true);

    try {
      const response = await uploadContract(file);
      router.push(`/analysis/${response.id}`);
    } catch (uploadError) {
      const apiError = uploadError as ApiError;
      setError(apiError.message);
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-8">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files?.[0] ?? null;
            void handleSelectedFile(file);
          }}
          className={[
            "group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed px-6 py-10 text-center transition",
            isDragging
              ? "border-emerald-500 bg-emerald-50/80"
              : "border-slate-300 bg-[linear-gradient(180deg,rgba(247,250,252,0.96),rgba(240,249,255,0.88))]",
          ].join(" ")}
        >
          <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />
          <div className="mb-5 rounded-full bg-slate-900 p-4 text-white shadow-lg shadow-slate-900/20 transition group-hover:scale-105">
            {isUploading ? (
              <LoaderCircle className="h-7 w-7 animate-spin" />
            ) : (
              <UploadCloud className="h-7 w-7" />
            )}
          </div>

          <p className="max-w-lg text-2xl font-semibold tracking-tight text-slate-950">
            Drop your contract here for instant AI review
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Upload a signed agreement, vendor contract, MSA, or procurement document in PDF or
            DOCX format. We’ll extract the text, score legal risk, and surface the clauses that
            deserve attention.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-600">
              PDF
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-600">
              DOCX
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-emerald-700">
              Secure upload
            </span>
          </div>

          <button
            type="button"
            disabled={isUploading}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <FileUp className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Choose contract"}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void handleSelectedFile(file);
            }}
          />
        </div>

        <div className="mt-4 flex min-h-7 items-center justify-between gap-4 text-sm">
          <span className="text-slate-600">
            {selectedName ? `Selected file: ${selectedName}` : "No file selected yet."}
          </span>
          {error ? <span className="text-right text-rose-600">{error}</span> : null}
        </div>
      </div>

      <aside className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] md:p-8">
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-emerald-300">
          Workflow
        </span>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight">What happens after upload</h2>
        <div className="mt-8 space-y-5">
          {[
            "Contract text is extracted from the uploaded file.",
            "Our analysis engine reviews key legal clauses and obligations.",
            "You get a risk score, summary, and flagged penalty language.",
          ].map((item, index) => (
            <div key={item} className="flex gap-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-emerald-300">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-300">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-400/15 p-2 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Designed for rapid triage</p>
              <p className="text-sm text-slate-400">See exposure before legal review becomes a bottleneck.</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function UploadReportContent() {
  const searchParams = useSearchParams();

  const patientId = searchParams.get("patientId") || "";
  const requestId = searchParams.get("requestId") || "";
  const patientName = searchParams.get("patientName") || "Selected Patient";

  const [reportName, setReportName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!patientId) {
      setMessage("Patient ID missing. Please upload from request row.");
      return;
    }

    if (!file) {
      setMessage("Please select a PDF file.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("reportName", reportName);
    formData.append("patientId", patientId);
    formData.append("requestId", requestId);
    formData.append("file", file);

    try {
      const res = await fetch("/api/reports/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Upload failed");
      } else {
        setMessage("Report uploaded successfully.");
        setReportName("");
        setFile(null);
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl md:p-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Upload Patient Report
        </h1>

        <p className="mt-2 text-sm text-slate-500 md:text-base">
          AMRITA PATHOLOGY · Pathologist Panel
        </p>

        <div className="mt-6 rounded-2xl bg-blue-50 p-5">
          <p className="text-sm text-slate-500">Selected Patient</p>

          <h2 className="mt-1 break-words text-xl font-bold text-blue-700">
            {patientName}
          </h2>

          <p className="mt-2 break-all text-xs text-slate-500">
            Patient ID: {patientId || "Missing"}
          </p>

          {requestId && (
            <p className="mt-1 break-all text-xs text-slate-500">
              Request ID: {requestId}
            </p>
          )}
        </div>

        <form onSubmit={handleUpload} className="mt-8 space-y-5">
          <input
            required
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            placeholder="Report Name, e.g. CBC Report"
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
          />

          <input
            required
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full rounded-xl border p-3 text-sm"
          />

          {message && (
            <div className="rounded-xl bg-slate-100 p-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="animate-pulse text-xl">📄</span>
                <span>Scanning and uploading report...</span>
              </>
            ) : (
              "Upload Report"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function UploadReportLoading() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="rounded-3xl bg-white p-8 text-center shadow-xl">
        <div className="text-3xl">📄</div>
        <p className="mt-3 text-slate-600">Preparing upload page...</p>
      </div>
    </section>
  );
}

export default function UploadReportPage() {
  return (
    <Suspense fallback={<UploadReportLoading />}>
      <UploadReportContent />
    </Suspense>
  );
}
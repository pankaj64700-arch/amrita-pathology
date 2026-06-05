"use client";

import { useEffect, useState } from "react";

interface Report {
  id: string;
  reportName: string;
  fileUrl: string;
  patientId: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();

        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load reports:", error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, []);

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          My Reports
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
          Access and download your pathology reports securely.
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow md:p-6">
        <h3 className="text-xl font-bold">Available Reports</h3>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading reports...</p>
        ) : reports.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
            <p className="text-slate-500">
              No reports available yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-4 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h4 className="font-semibold">
                    {report.reportName}
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded:{" "}
                    {report.createdAt
                      ? new Date(report.createdAt).toLocaleDateString()
                      : report.updatedAt
                      ? new Date(report.updatedAt).toLocaleDateString()
                      : "N/A"}
                  </p>

                  <p className="mt-1 break-all text-xs text-slate-400">
                    Report ID: {report.id}
                  </p>
                </div>

                <a
                  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-center text-sm font-medium text-white"
                >
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
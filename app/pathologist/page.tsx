"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SampleRequest {
  id: string;
  patientName: string;
  phone: string;
  address: string;
  testName: string;
  preferredDate: string;
  status: string;
  userId?: string;
  createdAt: string;
}

interface PathologistStats {
  totalRequests: number;
  pendingRequests: number;
  processingRequests: number;
  completedRequests: number;
  reportsUploaded: number;
}

export default function PathologistDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [stats, setStats] = useState<PathologistStats>({
    totalRequests: 0,
    pendingRequests: 0,
    processingRequests: 0,
    completedRequests: 0,
    reportsUploaded: 0,
  });

  useEffect(() => {
    if (status === "loading") return;

    const role = (session?.user as any)?.role;

    if (!session || (role !== "PATHOLOGIST" && role !== "ADMIN")) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const statsRes = await fetch("/api/pathologist/stats");
        const statsData = await statsRes.json();

        if (statsRes.ok) {
          setStats(statsData);
        }

        const requestsRes = await fetch("/api/sample-requests");
        const requestsData = await requestsRes.json();

        if (requestsRes.ok && Array.isArray(requestsData)) {
          setRequests(requestsData);
        }
      } catch (error) {
        console.error("Failed to load pathologist dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated") {
      const role = (session?.user as any)?.role;

      if (role === "PATHOLOGIST" || role === "ADMIN") {
        loadDashboardData();
      }
    }
  }, [session, status]);

  const filteredRequests = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return requests.filter((request) => {
      const matchesSearch =
        request.patientName.toLowerCase().includes(query) ||
        request.phone.toLowerCase().includes(query) ||
        request.testName.toLowerCase().includes(query) ||
        request.address.toLowerCase().includes(query) ||
        (request.userId || "").toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "ALL" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  async function updateRequestStatus(requestId: string, newStatus: string) {
    const res = await fetch(`/api/sample-requests/${requestId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });

    if (res.ok) {
      setRequests((prev) =>
        prev.map((item) =>
          item.id === requestId
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );
    }
  }

  function getMapUrl(address: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
  }

  if (status === "loading") {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600">Loading pathologist panel...</p>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Sample Collection Requests
        </h1>

        <p className="mt-3 text-sm text-blue-100 md:text-base">
          Search, filter, manage patient requests, and open collection
          addresses directly in Google Maps.
        </p>
      </div>

      

      <div className="mt-6 rounded-2xl bg-white p-5 shadow md:mt-8 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-xl font-bold">Recent Requests</h3>

            <p className="text-sm text-slate-500">
              Search by patient, phone, test, address, or user ID.
            </p>
          </div>

          <a
            href="/pathologist/upload-report"
            className="rounded-xl bg-blue-600 px-5 py-2 text-center text-sm font-medium text-white"
          >
            Upload Report
          </a>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, phone, test, address..."
            className="rounded-xl border p-3 outline-none focus:border-blue-600 md:col-span-2"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border p-3 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COLLECTED">Collected</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading requests...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="mt-6 text-slate-500">
            No matching sample requests found.
          </p>
        ) : (
          <>
            <div className="mt-6 space-y-4 md:hidden">
              {filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">
                        {request.patientName}
                      </h4>

                      <p className="mt-1 text-sm text-slate-500">
                        {request.testName}
                      </p>
                    </div>

                    <select
                      value={request.status}
                      onChange={(e) =>
                        updateRequestStatus(request.id, e.target.value)
                      }
                      className="rounded-lg border px-2 py-1 text-xs"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COLLECTED">COLLECTED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-600">
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {request.phone}
                    </p>

                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(request.preferredDate).toLocaleDateString()}
                    </p>

                    <p>
                      <span className="font-medium">Address:</span>{" "}
                      {request.address}
                    </p>

                    <p className="break-all text-xs text-slate-500">
                      User ID: {request.userId || "Not linked"}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <a
                      href={getMapUrl(request.address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-green-600 px-4 py-2 text-center text-sm text-white"
                    >
                      Open Map
                    </a>

                    <a
                      href={`/pathologist/upload-report?patientId=${
                        request.userId
                      }&requestId=${
                        request.id
                      }&patientName=${encodeURIComponent(
                        request.patientName
                      )}`}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm text-white"
                    >
                      Upload Report
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1150px] border-collapse">
                <thead>
                  <tr className="border-b text-left text-sm text-slate-500">
                    <th className="py-3">User ID</th>
                    <th className="py-3">Patient</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Address</th>
                    <th className="py-3">Test</th>
                    <th className="py-3">Preferred Date</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b">
                      <td className="py-4 text-xs text-slate-500">
                        {request.userId || "Not linked"}
                      </td>

                      <td className="py-4 font-medium">
                        {request.patientName}
                      </td>

                      <td className="py-4">{request.phone}</td>

                      <td className="max-w-xs py-4">
                        <p className="line-clamp-2 text-sm text-slate-600">
                          {request.address}
                        </p>
                      </td>

                      <td className="py-4">{request.testName}</td>

                      <td className="py-4">
                        {new Date(
                          request.preferredDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="py-4">
                        <select
                          value={request.status}
                          onChange={(e) =>
                            updateRequestStatus(request.id, e.target.value)
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COLLECTED">COLLECTED</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="COMPLETED">COMPLETED</option>
                        </select>
                      </td>

                      <td className="py-4">
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={getMapUrl(request.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs text-white"
                          >
                            Open Map
                          </a>

                          <a
                            href={`/pathologist/upload-report?patientId=${
                              request.userId
                            }&requestId=${
                              request.id
                            }&patientName=${encodeURIComponent(
                              request.patientName
                            )}`}
                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white"
                          >
                            Upload Report
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Total Requests</p>
          <h3 className="mt-2 text-3xl font-bold text-blue-700">
            {stats.totalRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Pending</p>
          <h3 className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.pendingRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Processing</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-600">
            {stats.processingRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Completed</p>
          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {stats.completedRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500">Reports</p>
          <h3 className="mt-2 text-3xl font-bold text-cyan-600">
            {stats.reportsUploaded}
          </h3>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  sampleRequests: number;
  reports: number;
}

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

interface LabProfile {
  phone?: string | null;
}

function getStatusStyle(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "CONFIRMED":
      return "bg-blue-100 text-blue-700";
    case "COLLECTED":
      return "bg-purple-100 text-purple-700";
    case "PROCESSING":
      return "bg-orange-100 text-orange-700";
    case "COMPLETED":
      return "bg-green-100 text-green-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "🟡 Pending";
    case "CONFIRMED":
      return "🔵 Confirmed";
    case "COLLECTED":
      return "🟣 Collected";
    case "PROCESSING":
      return "🟠 Processing";
    case "COMPLETED":
      return "🟢 Completed";
    default:
      return status;
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    sampleRequests: 0,
    reports: 0,
  });

  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [labProfile, setLabProfile] = useState<LabProfile | null>(null);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  async function loadDashboardData() {
    try {
      const statsRes = await fetch("/api/dashboard/stats");
      const statsData = await statsRes.json();

      if (statsRes.ok) {
        setStats({
          sampleRequests: statsData.sampleRequests ?? 0,
          reports: statsData.reports ?? 0,
        });
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoadingStats(false);
    }

    try {
      const requestsRes = await fetch("/api/dashboard/requests");
      const requestsData = await requestsRes.json();

      if (requestsRes.ok && Array.isArray(requestsData)) {
        setRequests(requestsData);
      }
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoadingRequests(false);
    }

    try {
      const profileRes = await fetch("/api/pathologist-profile");
      const profileData = await profileRes.json();

      if (profileRes.ok && profileData && !profileData.error) {
        setLabProfile(profileData);
      }
    } catch (error) {
      console.error("Failed to load lab contact:", error);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  function openBookingModal() {
    window.dispatchEvent(new Event("open-booking-modal"));
  }

  const whatsappNumber = labProfile?.phone
    ? labProfile.phone.replace(/\D/g, "")
    : "";

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello, I need help regarding my sample collection or report."
      )}`
    : "";

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Welcome to AMRITA PATHOLOGY
        </h1>

        <p className="mt-3 max-w-2xl text-sm text-blue-100 md:text-base">
          Track your sample collection requests, monitor status updates, and
          download your pathology reports securely.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button
          onClick={openBookingModal}
          className="rounded-2xl bg-white p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="text-3xl">📋</div>
          <h3 className="mt-3 font-bold text-slate-900">
            Book Sample
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Request home collection
          </p>
        </button>

        <a
          href="/dashboard/reports"
          className="rounded-2xl bg-white p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="text-3xl">📄</div>
          <h3 className="mt-3 font-bold text-slate-900">
            My Reports
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Download PDFs
          </p>
        </a>

        <a
          href="/dashboard/profile"
          className="rounded-2xl bg-white p-5 text-left shadow transition hover:-translate-y-1 hover:shadow-md"
        >
          <div className="text-3xl">👤</div>
          <h3 className="mt-3 font-bold text-slate-900">
            Profile
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Update details
          </p>
        </a>

        {whatsappNumber ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-green-600 p-5 text-left text-white shadow transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">🏥</div>
            <h3 className="mt-3 font-bold">
              Contact Lab
            </h3>
            <p className="mt-1 text-xs text-green-50">
              WhatsApp support
            </p>
          </a>
        ) : (
          <div className="rounded-2xl bg-white p-5 text-left shadow">
            <div className="text-3xl">🏥</div>
            <h3 className="mt-3 font-bold text-slate-900">
              Contact Lab
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Number not added
            </p>
          </div>
        )}
      </div>

      {/* <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">My Sample Requests</p>

          <h3 className="mt-2 text-3xl font-bold text-blue-700 md:text-4xl">
            {loadingStats ? "..." : stats.sampleRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">My Reports</p>

          <h3 className="mt-2 text-3xl font-bold text-green-600 md:text-4xl">
            {loadingStats ? "..." : stats.reports}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500">Account Status</p>

          <h3 className="mt-2 text-lg font-semibold text-green-600">
            Active
          </h3>
        </div>
      </div> */}

      <div className="mt-6 rounded-2xl bg-white p-5 shadow md:mt-8 md:p-6">
        <div>
          <h3 className="text-xl font-bold">My Sample Requests</h3>

          <p className="text-sm text-slate-500">
            Track the latest status of your pathology requests.
          </p>
        </div>

        {loadingRequests ? (
          <p className="mt-6 text-slate-500">Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed p-8 text-center">
            <p className="text-slate-500">
              You have not created any sample requests yet.
            </p>

            <button
              onClick={openBookingModal}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2 text-white"
            >
              Book Your First Sample
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-2xl border bg-white p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h4 className="font-semibold">{request.testName}</h4>

                    <p className="mt-1 text-sm text-slate-500">
                      {request.patientName}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      {request.address}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                      request.status
                    )}`}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {request.phone}
                  </p>

                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(request.preferredDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-4 md:mt-8 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <h3 className="text-xl font-bold">Reports</h3>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Download your uploaded pathology reports securely.
          </p>

          <a
            href="/dashboard/reports"
            className="mt-5 inline-block rounded-xl bg-slate-800 px-5 py-2 text-white"
          >
            View Reports
          </a>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <h3 className="text-xl font-bold">Need Help?</h3>

          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Contact AMRITA PATHOLOGY from your patient portal for sample
            collection or report support.
          </p>

          {whatsappNumber ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block rounded-xl bg-green-600 px-5 py-2 text-white"
            >
              Contact Lab
            </a>
          ) : (
            <p className="mt-5 text-sm text-slate-400">
              7459038504
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
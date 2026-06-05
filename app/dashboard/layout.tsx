"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton";

interface CurrentUser {
  name: string;
  email: string;
  phone: string | null;
  role: string;
}

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    address: "",
    testName: "",
    preferredDate: "",
  });

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok) {
          setCurrentUser({
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
          });
        }
      } catch (error) {
        console.error("Failed to load current user:", error);
      }
    }

    loadCurrentUser();
  }, []);

  useEffect(() => {
    function openBookingModal() {
      setBookingOpen(true);
      setMenuOpen(false);
    }

    window.addEventListener("open-booking-modal", openBookingModal);

    return () => {
      window.removeEventListener("open-booking-modal", openBookingModal);
    };
  }, []);

  async function handleBookingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setBookingLoading(true);
    setBookingMessage("");

    try {
      const res = await fetch("/api/sample-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setBookingMessage(data.error || "Failed to book sample request.");
        return;
      }

      setBookingMessage("Sample collection request booked successfully.");

      setForm({
        patientName: "",
        phone: "",
        address: "",
        testName: "",
        preferredDate: "",
      });

      setTimeout(() => {
        setBookingOpen(false);
        setBookingMessage("");
        window.location.reload();
      }, 800);
    } catch {
      setBookingMessage("Something went wrong.");
    } finally {
      setBookingLoading(false);
    }
  }

  const displayName =
    currentUser?.name || session?.user?.name || "Patient User";

  const displayEmail =
    currentUser?.email || session?.user?.email || "No email";

  const displayPhone = currentUser?.phone || "Phone not added";

  const NavLinks = () => (
    <nav className="space-y-2">
      <a
        href="/dashboard"
        className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
      >
        Dashboard
      </a>

      <a
        href="/dashboard/reports"
        className="block rounded-xl px-4 py-3 hover:bg-slate-100"
      >
        My Reports
      </a>

      <a
        href="/dashboard/profile"
        className="block rounded-xl px-4 py-3 hover:bg-slate-100"
      >
        Profile
      </a>

      <LogoutButton
  className="block w-full rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
/>
    </nav>
  );

  return (
    <main className="min-h-screen bg-slate-100">
      {bookingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Book Sample Collection
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Fill the details and our team will process your request.
                </p>
              </div>

              <button
                onClick={() => setBookingOpen(false)}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="mt-6 space-y-4">
              <input
                required
                value={form.patientName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    patientName: e.target.value,
                  })
                }
                placeholder="Patient Name"
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />

              <input
                required
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value,
                  })
                }
                placeholder="Phone Number"
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />

              <textarea
                required
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
                placeholder="Collection Address"
                rows={3}
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />

              <input
                required
                value={form.testName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    testName: e.target.value,
                  })
                }
                placeholder="Test Name, e.g. CBC, LFT, Thyroid"
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />

              <input
                required
                type="date"
                value={form.preferredDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    preferredDate: e.target.value,
                  })
                }
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />

              {bookingMessage && (
                <div className="rounded-xl bg-slate-100 p-3 text-sm">
                  {bookingMessage}
                </div>
              )}

              <button
                disabled={bookingLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <span className="animate-bounce text-xl">⚗️</span>
                    <span>Processing sample request...</span>
                  </>
                ) : (
                  "Book Sample Request"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 border-b bg-white px-4 py-4 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-blue-700">
              AMRITA PATHOLOGY
            </h1>
            <p className="text-xs text-slate-500">Patient Portal</p>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>

        <div className="mt-3 rounded-2xl bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">
            {displayName}
          </p>
          <p className="break-all text-xs text-slate-500">
            {displayEmail}
          </p>
          <p className="text-xs text-slate-500">
            Phone: {displayPhone}
          </p>
        </div>

        {menuOpen && (
          <div className="mt-4 rounded-2xl border bg-white p-3">
            <NavLinks />
          </div>
        )}
      </header>

      <div className="flex">
        <aside className="hidden min-h-screen w-64 flex-col bg-white shadow-lg md:flex">
          <div className="border-b p-6">
            <h1 className="text-xl font-bold text-blue-700">
              AMRITA PATHOLOGY
            </h1>
            <p className="text-sm text-slate-500">Patient Portal</p>
          </div>

          <div className="border-b p-4">
            <div className="rounded-2xl bg-blue-50 p-4">
              <p className="font-semibold text-slate-900">{displayName}</p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {displayEmail}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Phone: {displayPhone}
              </p>
            </div>
          </div>

          <div className="flex-1 p-4">
            <NavLinks />
          </div>
        </aside>

        <section className="w-full flex-1">{children}</section>
      </div>
    </main>
  );
}
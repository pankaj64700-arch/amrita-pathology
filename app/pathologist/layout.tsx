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

export default function PathologistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

  const displayName =
    currentUser?.name || session?.user?.name || "Pathologist User";

  const displayEmail =
    currentUser?.email || session?.user?.email || "No email";

  const displayPhone = currentUser?.phone || "Phone not added";

  const NavLinks = () => (
    <nav className="space-y-2">
      {/* <a
        href="/pathologist"
        className="block rounded-xl bg-blue-50 px-4 py-3 font-medium text-blue-700"
      >
        Sample Requests
      </a>

      <a
        href="/admin/patients"
        className="block rounded-xl px-4 py-3 hover:bg-slate-100"
      >
        Patient Records
      </a> */}

      <LogoutButton
  className="block w-full rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50"
/>
    </nav>
  );

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b bg-white px-4 py-4 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-blue-700">
              AMRITA PATHOLOGY
            </h1>
            <p className="text-xs text-slate-500">Pathologist Panel</p>
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
        <aside className="hidden min-h-screen w-72 flex-col bg-white shadow-lg md:flex">
          <div className="border-b p-6">
            <h1 className="text-xl font-bold text-blue-700">
              AMRITA PATHOLOGY
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Pathologist Panel
            </p>
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
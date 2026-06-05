"use client";

import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  async function loadAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function handleCreate(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to create announcement");
        return;
      }

      setForm({
        title: "",
        description: "",
      });

      setMessage("Announcement created successfully.");

      await loadAnnouncements();
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleAnnouncement(
    id: string,
    active: boolean
  ) {
    await fetch(`/api/admin/announcements/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        active: !active,
      }),
    });

    await loadAnnouncements();
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;

    await fetch(`/api/admin/announcements/${id}`, {
      method: "DELETE",
    });

    await loadAnnouncements();
  }

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          Announcement Management
        </h1>

        <p className="mt-3 text-sm text-blue-100 md:text-base">
          Create offers and notices that appear on the landing page.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white p-5 shadow md:p-6"
        >
          <h3 className="text-xl font-bold">
            Create Announcement
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Add new offers, notices, or patient updates.
          </p>

          <div className="mt-6 space-y-4">
            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="Title"
              className="w-full rounded-xl border p-3"
            />

            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Description"
              rows={4}
              className="w-full rounded-xl border p-3"
            />

            {message && (
              <div className="rounded-xl bg-slate-100 p-3 text-sm">
                {message}
              </div>
            )}

            <button
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 py-3 text-white"
            >
              {saving
                ? "Publishing..."
                : "Publish Announcement"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <h3 className="text-xl font-bold">
            All Announcements
          </h3>

          {loading ? (
            <p className="mt-6">Loading...</p>
          ) : (
            <div className="mt-6 space-y-4">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border p-4"
                >
                  <h4 className="font-semibold">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-sm text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={() =>
                        toggleAnnouncement(
                          item.id,
                          item.active
                        )
                      }
                      className="rounded-xl bg-slate-800 px-4 py-2 text-sm text-white"
                    >
                      {item.active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      onClick={() =>
                        deleteAnnouncement(item.id)
                      }
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
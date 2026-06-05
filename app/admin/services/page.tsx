"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string | null;
  active: boolean;
  createdAt: string;
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
  });

  async function loadServices() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/services", {
        cache: "no-store",
      });

      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setServices(data);
      } else {
        setMessage(data.error || "Failed to load services.");
      }
    } catch (error) {
      console.error("Failed to load services:", error);
      setMessage("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
    });
    setEditingId(null);
  }

  function startEdit(service: Service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      price: service.price || "",
    });
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : "/api/admin/services";

      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          price: form.price.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to save service.");
        return;
      }

      setMessage(
        editingId
          ? "Service updated successfully."
          : "Service added successfully."
      );

      resetForm();
      await loadServices();
    } catch (error) {
      console.error("Save service error:", error);
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleService(service: Service) {
    try {
      await fetch(`/api/admin/services/${service.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !service.active,
        }),
      });

      await loadServices();
    } catch (error) {
      console.error("Toggle service error:", error);
      setMessage("Failed to update service status.");
    }
  }

  async function deleteService(id: string) {
    const confirmed = confirm("Delete this service/package?");
    if (!confirmed) return;

    try {
      await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) {
        resetForm();
      }

      setMessage("Service deleted successfully.");
      await loadServices();
    } catch (error) {
      console.error("Delete service error:", error);
      setMessage("Failed to delete service.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500 p-6 text-white shadow-xl sm:p-8">
          <p className="text-sm font-medium uppercase tracking-wide text-blue-100">
            Admin Panel
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Services & Test Packages
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-blue-100 sm:text-base">
            Add, update, activate, deactivate, and remove pathology services
            shown to patients on the website.
          </p>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingId ? "Edit Service" : "Add New Service"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Keep service details short and clear.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Test / Package Name
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="CBC Test"
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  required
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder="Short service description"
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Price
                </label>
                <input
                  value={form.price}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      price: e.target.value,
                    })
                  }
                  placeholder="₹499"
                  className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {message && (
                <div className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
                  {message}
                </div>
              )}

              <button
                disabled={saving}
                className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Service"
                    : "Add Service"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  All Services
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Total services: {services.length}
                </p>
              </div>

              <button
                onClick={loadServices}
                className="w-fit rounded-xl border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="mt-6 text-sm text-slate-500">
                Loading services...
              </p>
            ) : services.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
                <p className="font-medium text-slate-700">
                  No services added yet.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first pathology service from the form.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-3xl border border-slate-200 p-4 transition hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-base font-bold text-slate-900">
                          {service.name}
                        </h3>

                        <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                          {service.description}
                        </p>

                        <p className="mt-3 text-sm font-semibold text-blue-700">
                          {service.price || "Price not added"}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                          service.active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {service.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
                      <button
                        onClick={() => startEdit(service)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => toggleService(service)}
                        className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
                      >
                        {service.active ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => deleteService(service.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
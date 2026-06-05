"use client";

import { useState } from "react";

export default function RequestSamplePage() {
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    patientName: "",
    phone: "",
    address: "",
    testName: "",
    preferredDate: "",
  });

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

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
        setMessage(data.error);
      } else {
        setMessage(
          "Sample collection request submitted successfully."
        );

        setForm({
          patientName: "",
          phone: "",
          address: "",
          testName: "",
          preferredDate: "",
        });
      }

    } catch {
      setMessage("Something went wrong");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-center">
          Home Sample Collection
        </h1>

        <p className="mt-2 text-center text-slate-500">
          AMRITA PATHOLOGY
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >

          <input
            required
            placeholder="Patient Name"
            value={form.patientName}
            onChange={(e) =>
              setForm({
                ...form,
                patientName: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            required
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <textarea
            required
            placeholder="Address"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            required
            placeholder="Test Name"
            value={form.testName}
            onChange={(e) =>
              setForm({
                ...form,
                testName: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            type="date"
            required
            value={form.preferredDate}
            onChange={(e) =>
              setForm({
                ...form,
                preferredDate: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          {message && (
            <div className="rounded-xl bg-slate-100 p-3">
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 text-white"
          >
            {loading
              ? "Submitting..."
              : "Request Sample Collection"}
          </button>

        </form>

      </div>

    </main>
  );
}
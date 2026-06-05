"use client";

import { useEffect, useState } from "react";

export default function PathologistProfileAdmin() {
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    qualification: "",
    experience: "",
    bio: "",
    photoUrl: "",
    phone: "",
    email: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const res = await fetch(
        "/api/admin/pathologist-profile"
      );

      const data = await res.json();

      if (data) {
        setForm({
          name: data.name || "",
          qualification: data.qualification || "",
          experience: data.experience || "",
          bio: data.bio || "",
          photoUrl: data.photoUrl || "",
          phone: data.phone || "",
          email: data.email || "",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile(
    e: React.FormEvent
  ) {
    e.preventDefault();

    const res = await fetch(
      "/api/admin/pathologist-profile",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    if (res.ok) {
      setMessage(
        "Profile updated successfully."
      );
    }
  }

  if (loading) {
    return (
      <main className="p-10">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          Edit Pathologist Profile
        </h1>

        <form
          onSubmit={saveProfile}
          className="mt-8 space-y-4"
        >
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            placeholder="Qualification"
            value={form.qualification}
            onChange={(e) =>
              setForm({
                ...form,
                qualification:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            placeholder="Experience"
            value={form.experience}
            onChange={(e) =>
              setForm({
                ...form,
                experience:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <textarea
            placeholder="Bio"
            rows={5}
            value={form.bio}
            onChange={(e) =>
              setForm({
                ...form,
                bio: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            placeholder="Photo URL"
            value={form.photoUrl}
            onChange={(e) =>
              setForm({
                ...form,
                photoUrl:
                  e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3"
          />

          {message && (
            <div className="rounded-xl bg-green-100 p-3">
              {message}
            </div>
          )}

          <button className="rounded-xl bg-blue-600 px-6 py-3 text-white">
            Save Profile
          </button>
        </form>
      </div>
    </main>
  );
}
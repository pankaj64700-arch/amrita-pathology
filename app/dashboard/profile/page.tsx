"use client";

import { useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  _count: {
    reports: number;
    sampleRequests: number;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (res.ok) {
          setProfile(data);
          setPhone(data.phone || "");
          setAddress(data.address || "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to update profile");
        return;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              phone: data.user.phone,
              address: data.user.address,
            }
          : prev
      );

      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center p-4">
        <p className="text-slate-600">Loading profile...</p>
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="flex min-h-screen items-center justify-center p-4">
        <p className="text-red-600">Profile not found.</p>
      </section>
    );
  }

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="break-words text-2xl font-bold md:text-3xl">
          {profile.name}
        </h1>

        <p className="mt-2 break-words text-sm text-blue-100 md:text-base">
          {profile.email}
        </p>

        <span className="mt-5 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
          {profile.role}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Sample Requests</p>

          <h3 className="mt-2 text-3xl font-bold text-blue-700">
            {profile._count.sampleRequests}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <p className="text-sm text-slate-500">Reports</p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {profile._count.reports}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-sm text-slate-500">Member Since</p>

          <h3 className="mt-2 text-lg font-semibold text-slate-800">
            {new Date(profile.createdAt).toLocaleDateString()}
          </h3>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 md:mt-8">
        <form
          onSubmit={handleSave}
          className="rounded-2xl bg-white p-5 shadow md:p-6"
        >
          <h3 className="text-xl font-bold">Contact Information</h3>

          <p className="mt-1 text-sm text-slate-500">
            Update your phone number and address for sample collection.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Phone Number
              </label>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Address
              </label>

              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
                rows={4}
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
              />
            </div>

            {message && (
              <div className="rounded-xl bg-slate-100 p-3 text-sm">
                {message}
              </div>
            )}

            <button
              disabled={saving}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 font-medium text-white disabled:opacity-60 sm:w-auto"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl bg-white p-5 shadow md:p-6">
          <h3 className="text-xl font-bold">Account Details</h3>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Name</p>
              <p className="break-words font-medium">{profile.name}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="break-words font-medium">{profile.email}</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">User ID</p>
              <p className="break-all text-sm font-medium">{profile.id}</p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-700">
                AMRITA PATHOLOGY
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Your profile information helps us manage accurate sample
                collection and report delivery.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
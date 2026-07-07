"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "ACCOUNT_DISABLED") {
          setMessage(
            "Your account has been disabled. Please contact AMRITA PATHOLOGY."
          );
        } else {
          setMessage("Invalid email or password");
        }

        setLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role;

      setMessage("Login successful");

setTimeout(() => {
  router.replace("/dashboard");
  router.refresh();
}, 500);
      
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-700">
            AMRITA PATHOLOGY
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
          />

          {message && (
            <div className="rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-700">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="animate-bounce text-xl">💉</span>
                <span>Verifying account...</span>
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <a href="/register" className="font-medium text-blue-600">
            Register
          </a>
        </p>

        <div className="mt-6 rounded-2xl bg-blue-50 p-4 text-center text-xs text-slate-600">
          Secure login for patients, pathologists, and admins.
        </div>
      </div>
    </main>
  );
}

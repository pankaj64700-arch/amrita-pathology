"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Announcement {
  id: string;
  title: string;
  description: string;
}

interface PathologistProfile {
  id: string;
  name: string;
  qualification: string;
  experience: string;
  bio: string;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string | null;
}

type AuthMode = "login" | "register" | null;

export default function HomePage() {
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [profile, setProfile] = useState<PathologistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  const [authMode, setAuthMode] = useState<AuthMode>(null);

  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const [loginMessage, setLoginMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const announcementRes = await fetch("/api/announcements");
        const announcementData = await announcementRes.json();

        if (Array.isArray(announcementData)) {
          setAnnouncements(announcementData);
        }

        const profileRes = await fetch("/api/pathologist-profile");
        const profileData = await profileRes.json();

        if (profileData && !profileData.error) {
          setProfile(profileData);
        }

        const servicesRes = await fetch("/api/services");
        const servicesData = await servicesRes.json();

        if (Array.isArray(servicesData)) {
          setServices(servicesData);
        }
      } catch (error) {
        console.error("Failed to load landing page data:", error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");

    if (auth === "login") {
      setAuthMode("login");
    }

    if (auth === "register") {
      setAuthMode("register");
    }
  }, []);

  const topAnnouncement =
    announcements.length > 0
      ? `${announcements[0].title}: ${announcements[0].description}`
      : "Home sample collection available. New offers will appear here.";

  const pathologistName = profile?.name || "Ankit Kumar Yadav";
  const pathologistBio =
    profile?.bio ||
    "Dedicated pathology professional focused on accurate diagnostics, reliable sample handling, and timely digital report delivery.";
  const pathologistQualification =
    profile?.qualification ||
    "BMLT / DMLT / MLT / Lab Technician Certification";
  const pathologistExperience =
    profile?.experience || "Pathology Lab Operations & Patient Reporting";
  const pathologistPhoto = profile?.photoUrl || "/pathologist.jpg";

  const displayPhone = profile?.phone || "7459038504";
  const displayEmail = profile?.email || "amritapathlab121@gmail.com";

  function closeAuthModal() {
    setAuthMode(null);
    setLoginMessage("");
    setRegisterMessage("");
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoginLoading(true);
    setLoginMessage("");

    try {
      const result = await signIn("credentials", {
        email: loginForm.email,
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "ACCOUNT_DISABLED") {
          setLoginMessage(
            "Your account has been disabled. Please contact AMRITA PATHOLOGY."
          );
        } else {
          setLoginMessage("Invalid email or password");
        }

        setLoginLoading(false);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role;

      setLoginMessage("Login successful");

      if (role === "ADMIN") {
        router.push("/admin");
      } else if (role === "PATHOLOGIST") {
        router.push("/pathologist");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginMessage("Something went wrong. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setRegisterLoading(true);
    setRegisterMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setRegisterMessage(data.error || "Registration failed");
        setRegisterLoading(false);
        return;
      }

      setRegisterMessage("Registration successful. Please login now.");

      setRegisterForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
      });

      setTimeout(() => {
        setAuthMode("login");
        setRegisterMessage("");
      }, 900);
    } catch (error) {
      console.error("Register error:", error);
      setRegisterMessage("Something went wrong. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {authMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {authMode === "login" ? "Login" : "Create Account"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {authMode === "login"
                    ? "Access your secure AMRITA PATHOLOGY portal."
                    : "Register to book samples and download reports."}
                </p>
              </div>

              <button
                onClick={closeAuthModal}
                className="rounded-xl border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setLoginMessage("");
                  setRegisterMessage("");
                }}
                className={`rounded-xl py-2 text-sm font-medium ${
                  authMode === "login"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setAuthMode("register");
                  setLoginMessage("");
                  setRegisterMessage("");
                }}
                className={`rounded-xl py-2 text-sm font-medium ${
                  authMode === "register"
                    ? "bg-white text-blue-700 shadow"
                    : "text-slate-500"
                }`}
              >
                Register
              </button>
            </div>

            {authMode === "login" && (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={loginForm.email}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                {loginMessage && (
                  <div className="rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-700">
                    {loginMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <span className="animate-bounce text-xl">💉</span>
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    "Login"
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="font-medium text-blue-600"
                  >
                    Register
                  </button>
                </p>
              </form>
            )}

            {authMode === "register" && (
              <form onSubmit={handleRegister} className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={registerForm.name}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={registerForm.phone}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      phone: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                <textarea
                  placeholder="Address"
                  rows={3}
                  value={registerForm.address}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      address: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />

                {registerMessage && (
                  <div className="rounded-xl bg-slate-100 p-3 text-center text-sm text-slate-700">
                    {registerMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {registerLoading ? (
                    <>
                      <span className="animate-pulse text-xl">🧬</span>
                      <span>Creating patient profile...</span>
                    </>
                  ) : (
                    "Register"
                  )}
                </button>

                <p className="text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="font-medium text-blue-600"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white">
        Announcement: {topAnnouncement}
      </div>

      <header className="sticky top-0 z-40 border-b bg-white/95 px-4 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-blue-700">
              AMRITA PATHOLOGY
            </h1>

            <p className="text-xs text-slate-500">
              Trusted Diagnostic & Digital Report Center
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setAuthMode("login")}
              className="rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Login
            </button>

            <button
              onClick={() => setAuthMode("register")}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Reliable Pathology Services
          </span>

          <h2 className="mt-6 text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
            Accurate Tests, Secure Reports, Home Sample Collection
          </h2>

          <p className="mt-6 text-lg text-slate-600">
            AMRITA PATHOLOGY provides professional diagnostic services with
            online sample requests and downloadable digital reports.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => setAuthMode("register")}
              className="rounded-2xl bg-blue-600 px-6 py-3 text-center font-medium text-white"
            >
              Create Patient Account
            </button>

            <button
              onClick={() => setAuthMode("login")}
              className="rounded-2xl border px-6 py-3 text-center font-medium"
            >
              Login to Portal
            </button>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-500 p-8 text-white">
            <p className="text-sm text-blue-100">Why patients trust us</p>

            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-white/15 p-4">
                Accurate Laboratory Testing
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                Digital PDF Report Download
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                Home Sample Collection Request
              </div>

              <div className="rounded-2xl bg-white/15 p-4">
                Secure Patient Dashboard
              </div>
            </div>
          </div>
        </div>
      </section>

      {announcements.length > 0 && (
        <section className="px-4 pb-10">
          <div className="mx-auto max-w-7xl rounded-3xl bg-white p-6 shadow">
            <h2 className="text-2xl font-bold text-slate-900">
              Latest Offers & Notices
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border bg-blue-50 p-5"
                >
                  <h3 className="font-semibold text-blue-700">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            Our Services
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-500 md:text-base">
            Services and test packages are managed directly by AMRITA
            PATHOLOGY.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.length > 0 ? (
              services.map((service) => (
                <div
                  key={service.id}
                  className="rounded-2xl border bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="font-semibold text-slate-900">
                    {service.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  {service.price && (
                    <p className="mt-4 text-lg font-bold text-blue-700">
                      ₹{service.price.replace("₹", "").trim()}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
                <h3 className="font-semibold text-slate-800">
                  No services available right now.
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Services added by admin will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-14">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-3xl bg-white p-6 shadow-xl md:grid-cols-[260px_1fr] md:p-8">
          <div className="flex justify-center">
            <div className="h-56 w-56 overflow-hidden rounded-3xl bg-blue-100">
              <img
                src={pathologistPhoto}
                alt={pathologistName}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-blue-700">Pathologist</p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {pathologistName}
            </h2>

            <p className="mt-4 text-slate-600">{pathologistBio}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Qualification</p>
                <p className="font-medium">{pathologistQualification}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Experience</p>
                <p className="font-medium">{pathologistExperience}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Contact</p>
                <p className="font-medium">{displayPhone}</p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Email</p>
                <p className="break-words font-medium">{displayEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 px-4 py-10 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-xl font-bold">AMRITA PATHOLOGY</h3>

            <p className="mt-3 text-sm text-slate-300">
              Trusted pathology services, sample collection, and digital
              reports.
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Contact</h4>

            <p className="mt-3 text-sm text-slate-300">
              Phone: {displayPhone}
            </p>

            <p className="mt-3 text-sm text-slate-300">
              Email: {displayEmail}
            </p>

            <p className="text-sm text-slate-300">
              Address: Tilkath Bazar Pipari Dhanupur Handia Prayagraj
            </p>
          </div>

          <div>
            <h4 className="font-semibold">Important</h4>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Terms & Conditions</li>
              <li>Privacy Policy</li>
              <li>Report Download Rules</li>
              <li>Sample Collection Guidelines</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold">Patient Rules</h4>

            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>Carry valid patient details</li>
              <li>Follow fasting instructions if required</li>
              <li>Reports are available only to logged-in users</li>
              <li>Contact lab for report corrections</li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-700 pt-6 text-center text-sm text-slate-400">
          © 2026 AMRITA PATHOLOGY. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
"use client";

import { useEffect, useState } from "react";

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  _count: {
    reports: number;
    sampleRequests: number;
  };
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRequests: 0,
    totalReports: 0,
  });

  useEffect(() => {
    async function loadPatients() {
      const res = await fetch("/api/admin/patients");
      const data = await res.json();

      if (res.ok) {
        setPatients(data.patients);
        setStats({
          totalPatients: data.totalPatients,
          totalRequests: data.totalRequests,
          totalReports: data.totalReports,
        });
      }
    }

    loadPatients();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold">Patient Records</h1>
          <p className="mt-2 text-blue-100">
            View registered patients, requests, and generated reports.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Registered Patients</p>
            <h2 className="mt-2 text-3xl font-bold text-blue-700">
              {stats.totalPatients}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Total Sample Requests</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-600">
              {stats.totalRequests}
            </h2>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm text-slate-500">Generated Reports</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              {stats.totalReports}
            </h2>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-xl font-bold">Patient Users</h2>

          <div className="mt-5 space-y-4 md:hidden">
            {patients.map((patient) => (
              <div key={patient.id} className="rounded-2xl border p-4">
                <h3 className="font-semibold">{patient.name}</h3>
                <p className="text-sm text-slate-500">{patient.email}</p>
                <p className="mt-2 text-sm">Phone: {patient.phone || "N/A"}</p>
                <p className="text-sm">Requests: {patient._count.sampleRequests}</p>
                <p className="text-sm">Reports: {patient._count.reports}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b text-left text-sm text-slate-500">
                  <th className="py-3">Name</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Phone</th>
                  <th className="py-3">Requests</th>
                  <th className="py-3">Reports</th>
                  <th className="py-3">Joined</th>
                </tr>
              </thead>

              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="py-4 font-medium">{patient.name}</td>
                    <td className="py-4">{patient.email}</td>
                    <td className="py-4">{patient.phone || "N/A"}</td>
                    <td className="py-4">{patient._count.sampleRequests}</td>
                    <td className="py-4">{patient._count.reports}</td>
                    <td className="py-4">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
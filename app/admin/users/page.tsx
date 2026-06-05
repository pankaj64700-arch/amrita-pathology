"use client";

import { useEffect, useMemo, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    reports: number;
    sampleRequests: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  async function loadUsers() {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (res.ok && Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.phone || "").toLowerCase().includes(query);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  async function updateUserRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role } : user
        )
      );
    }
  }

  async function toggleUserStatus(userId: string, currentStatus: boolean) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isActive: !currentStatus }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId
            ? { ...user, isActive: !currentStatus }
            : user
        )
      );
    }
  }

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 to-cyan-500 p-6 text-white shadow-xl md:p-8">
        <h1 className="text-2xl font-bold md:text-3xl">
          User Management
        </h1>

        <p className="mt-3 text-sm text-blue-100 md:text-base">
          Manage patients, pathologists, admins, and account access.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Total Users</p>
          <h3 className="mt-2 text-3xl font-bold text-blue-700">
            {users.length}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Patients</p>
          <h3 className="mt-2 text-3xl font-bold text-green-600">
            {users.filter((u) => u.role === "PATIENT").length}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Pathologists</p>
          <h3 className="mt-2 text-3xl font-bold text-purple-600">
            {users.filter((u) => u.role === "PATHOLOGIST").length}
          </h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-sm text-slate-500">Admins</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-600">
            {users.filter((u) => u.role === "ADMIN").length}
          </h3>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow md:p-6">
        <div>
          <h3 className="text-xl font-bold">All Users</h3>
          <p className="text-sm text-slate-500">
            Search users and manage their role/status.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search name, email, phone..."
            className="rounded-xl border p-3 outline-none focus:border-blue-600 md:col-span-2"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border p-3 outline-none focus:border-blue-600"
          >
            <option value="ALL">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="PATHOLOGIST">Pathologists</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>

        {loading ? (
          <p className="mt-6 text-slate-500">Loading users...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="mt-6 text-slate-500">No users found.</p>
        ) : (
          <>
            <div className="mt-6 space-y-4 md:hidden">
              {filteredUsers.map((user) => (
                <div key={user.id} className="rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="break-all text-sm text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserRole(user.id, e.target.value)
                      }
                      className="w-full rounded-xl border p-3"
                    >
                      <option value="PATIENT">PATIENT</option>
                      <option value="PATHOLOGIST">PATHOLOGIST</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>

                    <button
                      onClick={() =>
                        toggleUserStatus(user.id, user.isActive)
                      }
                      className={`w-full rounded-xl px-4 py-2 text-sm text-white ${
                        user.isActive ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {user.isActive ? "Disable Account" : "Enable Account"}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <p>Phone: {user.phone || "N/A"}</p>
                    <p>Requests: {user._count.sampleRequests}</p>
                    <p>Reports: {user._count.reports}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead>
                  <tr className="border-b text-left text-sm text-slate-500">
                    <th className="py-3">User</th>
                    <th className="py-3">Phone</th>
                    <th className="py-3">Role</th>
                    <th className="py-3">Requests</th>
                    <th className="py-3">Reports</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-4">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          {user.email}
                        </p>
                      </td>

                      <td className="py-4">{user.phone || "N/A"}</td>

                      <td className="py-4">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user.id, e.target.value)
                          }
                          className="rounded-lg border px-3 py-2 text-sm"
                        >
                          <option value="PATIENT">PATIENT</option>
                          <option value="PATHOLOGIST">PATHOLOGIST</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>

                      <td className="py-4">{user._count.sampleRequests}</td>

                      <td className="py-4">{user._count.reports}</td>

                      <td className="py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            user.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>

                      <td className="py-4">
                        <button
                          onClick={() =>
                            toggleUserStatus(user.id, user.isActive)
                          }
                          className={`rounded-lg px-4 py-2 text-sm text-white ${
                            user.isActive ? "bg-red-600" : "bg-green-600"
                          }`}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
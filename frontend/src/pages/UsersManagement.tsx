/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { SidebarAdmin } from "../components/SidebarAdmin"; // Sesuaikan jika nama komponen sidebar kamu berbeda

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // State Pengendali Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // State Input Form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  // Ambil data seluruh user dari API Backend Admin
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("bv_token");

      // URL disesuaikan dengan app.use("/api/admin", adminRoutes) + router.get("/users")
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let rawData = [];
      if (res.data) {
        if (Array.isArray(res.data)) {
          rawData = res.data;
        } else if (res.data.users && Array.isArray(res.data.users)) {
          rawData = res.data.users;
        } else if (res.data.data && Array.isArray(res.data.data)) {
          rawData = res.data.data;
        }
      }
      setUsers(rawData);
    } catch (err) {
      console.error("Gagal memuat data user:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedUserId(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("user");
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);
    setSelectedUserId(user.id);
    setUsername(user.username);
    setEmail(user.email);
    setPassword("");
    setRole(user.role);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("bv_token");

    try {
      if (isEditMode && selectedUserId) {
        // --- PROSES EDIT ---
        const updateData: Record<string, string> = {
          username: username,
          email: email,
          role: role,
        };

        if (password.trim() !== "") {
          updateData.password = password;
        }

        // URL disesuaikan: /api/admin/users/:id
        await axios.put(
          `http://localhost:5000/api/admin/users/${selectedUserId}`,
          updateData,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        alert("User updated successfully!");
      } else {
        // --- PROSES TAMBAH BARU ---
        // URL disesuaikan: /api/admin/users/register
        await axios.post(
          "http://localhost:5000/api/admin/users/register",
          {
            username: username,
            email: email,
            password: password,
            role: role,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        alert("New user created successfully!");
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const backendError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Operation failed";
      alert(`Error Backend: ${backendError}`);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    const token = localStorage.getItem("bv_token");
    try {
      // URL disesuaikan: /api/admin/users/:id
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center font-serif text-neutral-400">
        Loading user catalog...
      </div>
    );

  return (
    <div className="flex bg-[#fbfbfa] min-h-screen">
      {/* Sidebar Admin */}
      <SidebarAdmin />

      {/* Konten Utama */}
      <div className="flex-1 p-8 text-neutral-900">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
            <div>
              <h1 className="font-serif text-3xl">User Management</h1>
              <p className="text-xs text-neutral-400 font-mono mt-1">
                System User Credentials Registry
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-[#2c3e35] text-white px-5 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-emerald-950 transition"
            >
              + Create New User
            </button>
          </div>

          {/* Tabel */}
          <div className="bg-white border border-neutral-200 shadow-sm rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase tracking-wider text-neutral-500 font-bold">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Username</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role Access</th>
                  <th className="py-4 px-6 text-right">Actions Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-sm">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-neutral-50/50 transition"
                    >
                      <td className="py-4 px-6 font-mono text-xs text-neutral-400">
                        #{user.id}
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-900">
                        {user.username}
                      </td>
                      <td className="py-4 px-6 text-neutral-600">
                        {user.email}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-4 text-xs font-semibold uppercase tracking-wider">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-neutral-600 hover:text-black underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-neutral-400 hover:text-red-700 transition"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-xs text-neutral-400 font-serif italic"
                    >
                      No users cataloged inside database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-neutral-200 w-full max-w-md p-8 space-y-6 shadow-2xl">
            <div>
              <h3 className="font-serif text-2xl">
                {isEditMode
                  ? "Modify Profile Registry"
                  : "Register System Volume User"}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-1">
                {isEditMode
                  ? "Updating specific data arrays"
                  : "Inserting new user credentials"}
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-sm focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-sm focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Password{" "}
                  {isEditMode && (
                    <span className="text-neutral-400 font-normal lowercase">
                      (leave blank to keep unchanged)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  required={!isEditMode}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-sm focus:border-black outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-neutral-500 mb-1">
                  Role Permission
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-300 px-3 py-2 text-sm focus:border-black outline-none transition"
                >
                  <option value="user">User Standard</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="pt-4 flex space-x-3 text-xs font-semibold uppercase tracking-widest">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 border border-neutral-300 text-neutral-600 py-3 hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2c3e35] text-white py-3 hover:bg-emerald-950 transition"
                >
                  {isEditMode ? "Save Changes" : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

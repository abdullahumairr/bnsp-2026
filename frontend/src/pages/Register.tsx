/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mengirim data ke backend
      await axios.post("http://localhost:5000/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "user",
      });

      alert("Registrasi berhasil!");
      navigate("/login"); // Pastikan rute ini ada di App.tsx
    } catch (err: any) {
      console.error(err);
      // Menampilkan pesan error dari backend jika ada
      alert(err.response?.data?.message || "Registrasi gagal");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-[#fbfbfa] p-12 flex flex-col justify-center">
        <h1 className="text-5xl font-serif mb-6">
          Join the <br />
          <i>Circle of Readers.</i>
        </h1>
      </div>

      <div className="p-12 flex items-center justify-center">
        <form onSubmit={handleRegister} className="w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-serif">Create Account</h2>
          <input
            type="text"
            placeholder="Full Name"
            required
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            className="w-full p-3 border border-neutral-300"
          />
          <input
            type="email"
            placeholder="Email Address"
            required
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full p-3 border border-neutral-300"
          />
          <input
            type="password"
            placeholder="Password"
            required
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full p-3 border border-neutral-300"
          />
          <button type="submit" className="w-full bg-[#2c3e35] text-white p-3">
            CREATE ACCOUNT
          </button>
        </form>
      </div>
    </div>
  );
};

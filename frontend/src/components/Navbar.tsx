import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export const Navbar: React.FC = () => {
  const { cart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("bv_token");
  const user = JSON.parse(localStorage.getItem("bv_user") || "{}");
  const isLoggedIn = !!token;

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("bv_token");
    localStorage.removeItem("bv_user");
    navigate("/");
  };

  return (
    <nav className="bg-[#fbfbfa] border-b border-neutral-200 sticky top-0 z-50 px-8 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-1">
          <Link
            to="/"
            className="font-serif text-2xl tracking-tight text-neutral-900 font-bold"
          >
            BookVerse<span className="text-emerald-800">.</span>
          </Link>
        </div>

        {/* Menu Tengah */}
        <div className="flex items-center space-x-10 text-xs font-semibold uppercase tracking-widest text-neutral-600">
          <Link
            to="/"
            className={`pb-1 transition hover:text-black border-b-2 ${isActive("/") ? "text-black border-black font-bold" : "border-transparent"}`}
          >
            Home
          </Link>
          <Link
            to="/explore"
            className={`pb-1 transition hover:text-black border-b-2 ${isActive("/explore") ? "text-black border-black font-bold" : "border-transparent"}`}
          >
            Explore
          </Link>
          {isLoggedIn && (
            <Link
              to="/cart"
              className={`relative pb-1 transition flex items-center space-x-1.5 hover:text-black border-b-2 ${isActive("/cart") ? "text-black border-black font-bold" : "border-transparent"}`}
            >
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-[#2c3e35] text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {/* Kalau admin, tampilkan link dashboard */}
          {isLoggedIn && user.role === "admin" && (
            <Link
              to="/admin"
              className={`pb-1 transition hover:text-black border-b-2 ${location.pathname.startsWith("/admin") ? "text-black border-black font-bold" : "border-transparent"}`}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Kanan - Login/Logout */}
        <div className="flex-1 flex justify-end text-xs font-semibold uppercase tracking-widest">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-neutral-400 hover:text-red-700 transition"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="text-neutral-400 hover:text-black transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

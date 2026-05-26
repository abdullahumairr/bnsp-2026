import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const SidebarAdmin: React.FC = () => {
  const loc = useLocation();
  const navigate = useNavigate();

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Books Management", path: "/admin/books" },
    { name: "Users Management", path: "/admin/users" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("bv_token");
    localStorage.removeItem("bv_user");
    navigate("/login");
  };

  return (
    <aside className="w-64 border-r border-neutral-200 min-h-screen bg-[#f5f5f3] p-6 flex flex-col justify-between">
      <div className="space-y-8">
        <div className="font-serif text-xl font-bold tracking-tight px-4">
          BookVerse Admin
        </div>
        <nav className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block px-4 mb-2">
            Menu
          </span>
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 text-sm font-medium transition rounded ${
                loc.pathname === item.path
                  ? "bg-emerald-100/80 text-emerald-950 font-semibold"
                  : "text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        <div className="bg-white/60 p-4 border border-neutral-200 rounded text-xs">
          <div className="font-semibold text-neutral-700">Admin Status</div>
          <div className="text-emerald-700 flex items-center mt-1">
            <span className="w-2 h-2 bg-emerald-600 rounded-full inline-block mr-1.5"></span>
            Operational
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full px-4 py-2.5 text-sm font-medium text-left text-red-600 hover:bg-red-50 border border-red-200 rounded transition flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
};
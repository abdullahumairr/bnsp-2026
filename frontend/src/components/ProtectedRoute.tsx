import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "user" | "admin";
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const token = localStorage.getItem("bv_token");
  const user = JSON.parse(localStorage.getItem("bv_user") || "{}");

  // Belum login → ke /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Route khusus admin, tapi user biasa yang masuk → ke /
  if (allowedRole === "admin" && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Import Pages
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { DetailBook } from "./pages/DetailBook";
import { Cart } from "./pages/Cart";
import { Success } from "./pages/Success";
import { Dashboard } from "./pages/Dashboard";
import { BooksManagement } from "./pages/BooksManagement";
import { UserManagement } from "./pages/UsersManagement";
import { Explore } from "./pages/Explore";

// Redirect ke home/admin kalau sudah login
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("bv_token");
  const user = JSON.parse(localStorage.getItem("bv_user") || "{}");
  if (token) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes - bisa diakses tanpa login */}
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book/:id" element={<DetailBook />} />

          {/* Login & Register - redirect jika sudah login */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* Protected - harus login */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/success"
            element={
              <ProtectedRoute>
                <Success />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/books"
            element={
              <ProtectedRoute allowedRole="admin">
                <BooksManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRole="admin">
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;

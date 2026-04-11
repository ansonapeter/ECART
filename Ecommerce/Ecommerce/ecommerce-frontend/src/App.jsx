import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import Cart           from "./pages/Cart";
import Orders         from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import Payment        from "./pages/Payment";
import Tracking       from "./pages/Tracking";
import ProductDetail  from "./pages/ProductDetail";
import Wishlist       from "./pages/Wishlist";   // ✅ NEW

function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");
  const role  = localStorage.getItem("role");
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "ADMIN") return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public product detail */}
        <Route path="/product/:id" element={<ProductDetail />} />

        {/* Protected user routes */}
        <Route path="/dashboard"         element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/cart"              element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/orders"            element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/payment/:orderId"  element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/tracking/:orderId" element={<ProtectedRoute><Tracking /></ProtectedRoute>} />

        {/* ✅ Wishlist route */}
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

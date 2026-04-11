import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

const STATUS_COLORS = {
  PAID:             { bg: "#e3f2fd", color: "#1565c0" },
  CONFIRMED:        { bg: "#fff3e0", color: "#e65100" },
  SHIPPED:          { bg: "#f3e5f5", color: "#6a1b9a" },
  OUT_FOR_DELIVERY: { bg: "#e0f2f1", color: "#00796b" },
  DELIVERED:        { bg: "#e8f5e9", color: "#2e7d32" },
  CANCELLED:        { bg: "#ffebee", color: "#c62828" },
  RETURN_INITIATED: { bg: "#fff8e1", color: "#f57f17" },
  RETURN_RECEIVED:  { bg: "#ede7f6", color: "#4527a0" },
  REFUNDED:         { bg: "#e8f5e9", color: "#1b5e20" },
  CREATED:          { bg: "#f5f5f5", color: "#616161" },
};

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [otpMap, setOtpMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/admin/orders");
      setOrders(res.data.sort((a, b) => b.id - a.id));
    } catch (err) {
      if (err.response?.status === 403) {
        alert("Access denied. Admin only.");
        navigate("/dashboard");
        return;
      }
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (id, key, apiFn) => {
    const k = `${id}_${key}`;
    if (actionLoading[k]) return;
    setActionLoading((p) => ({ ...p, [k]: true }));
    try {
      await apiFn();
      await fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setActionLoading((p) => { const n = { ...p }; delete n[k]; return n; });
    }
  };

  const isLoading = (id, key) => !!actionLoading[`${id}_${key}`];

  const confirmOrder = (orderId) =>
    runAction(orderId, "confirm", () => API.put(`/admin/orders/${orderId}/confirm`));

  const verifyOtp = (orderId) =>
    runAction(orderId, "otp", () =>
      API.put(`/admin/orders/${orderId}/verify-otp?otp=${otpMap[orderId] || ""}`)
    );

  const receiveReturn = (orderId) =>
    runAction(orderId, "return", () => API.put(`/admin/orders/${orderId}/receive-return`));

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  // Stats
  const revenue = orders
    .filter(o => !["CANCELLED", "REFUNDED", "CREATED"].includes(o.status))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const stats = [
    { icon: "📦", value: orders.length,                                                           label: "Total Orders" },
    { icon: "⏳", value: orders.filter(o => o.status === "PAID").length,                         label: "Awaiting Confirm" },
    { icon: "🚚", value: orders.filter(o => o.status === "OUT_FOR_DELIVERY").length,              label: "Out for Delivery" },
    { icon: "✅", value: orders.filter(o => o.status === "DELIVERED").length,                    label: "Delivered" },
    { icon: "↩️", value: orders.filter(o => ["RETURN_INITIATED","RETURN_RECEIVED"].includes(o.status)).length, label: "Returns" },
  ];

  const filtered = orders.filter((o) => {
    const matchFilter = filter === "ALL" || o.status === filter;
    const matchSearch =
      (o.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(o.id).includes(searchTerm);
    return matchFilter && matchSearch;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f0f2f5; }

        .admin-nav {
          background: #1a1a2e; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          position: sticky; top: 0; z-index: 100;
        }
        .admin-nav .brand { color: white; font-size: 20px; font-weight: 700; }
        .admin-badge { background: #2874f0; color: white; font-size: 11px; padding: 2px 8px; border-radius: 12px; font-weight: 600; }
        .admin-nav .spacer { flex: 1; }
        .nav-refresh { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; margin-right: 6px; }
        .nav-logout  { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; }

        .admin-page { padding: 22px; max-width: 1200px; margin: 0 auto; }

        /* STATS */
        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr)); gap: 12px; margin-bottom: 22px; }
        .stat-card { background: white; border-radius: 8px; padding: 18px; border: 1px solid #e8e8e8; }
        .stat-icon { font-size: 24px; margin-bottom: 8px; }
        .stat-value { font-size: 26px; font-weight: 700; color: #212121; line-height: 1; }
        .stat-label { font-size: 11px; color: #9e9e9e; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .stat-card.revenue .stat-value { font-size: 19px; color: #2e7d32; }

        /* TOOLBAR */
        .admin-toolbar {
          background: white; border-radius: 8px; padding: 14px 18px;
          border: 1px solid #e8e8e8; margin-bottom: 14px;
          display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
        }
        .toolbar-title { font-size: 16px; font-weight: 700; color: #212121; white-space: nowrap; }
        .search-input {
          flex: 1; min-width: 200px; padding: 9px 14px;
          border: 1px solid #e0e0e0; border-radius: 4px;
          font-size: 13px; font-family: 'Poppins', sans-serif;
          outline: none; color: #212121;
        }
        .search-input:focus { border-color: #2874f0; }
        .filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
        .filter-tab {
          padding: 6px 14px; border-radius: 20px; font-size: 12px;
          font-weight: 500; cursor: pointer;
          border: 1.5px solid #e0e0e0; background: white; color: #424242;
          font-family: 'Poppins', sans-serif; transition: all 0.15s;
        }
        .filter-tab:hover { border-color: #2874f0; color: #2874f0; }
        .filter-tab.active { background: #2874f0; color: white; border-color: #2874f0; }

        /* GRID */
        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 12px; }

        /* ORDER CARD */
        .order-card { background: white; border-radius: 8px; border: 1px solid #e8e8e8; overflow: hidden; transition: box-shadow 0.2s; }
        .order-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.09); }

        .card-header {
          padding: 12px 16px; display: flex;
          justify-content: space-between; align-items: center;
          border-bottom: 1px solid #f5f5f5;
        }
        .card-order-id { font-size: 14px; font-weight: 700; color: #212121; }
        .status-pill { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }

        .card-body { padding: 14px 16px; }

        /* User email */
        .user-email { font-size: 12px; color: #9e9e9e; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }

        /* ✅ AMOUNT — now shows real value */
        .order-amount { font-size: 20px; font-weight: 700; color: #212121; margin-bottom: 12px; }
        .order-amount span { font-size: 13px; font-weight: 400; color: #9e9e9e; margin-left: 4px; }

        /* Items list */
        .items-mini { background: #fafafa; border-radius: 4px; padding: 10px 12px; margin-bottom: 14px; }
        .items-mini-row { font-size: 12px; color: #616161; padding: 2px 0; display: flex; justify-content: space-between; }
        .items-mini-row .item-price { color: #212121; font-weight: 500; }
        .items-more { font-size: 12px; color: #9e9e9e; margin-top: 4px; }

        /* Actions */
        .card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .action-btn {
          padding: 8px 16px; border: none; border-radius: 4px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
          display: flex; align-items: center; gap: 5px;
        }
        .action-btn:hover:not(:disabled) { opacity: 0.85; }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-confirm  { background: #2874f0; color: white; }
        .btn-deliver  { background: #4caf50; color: white; }
        .btn-receive  { background: #9c27b0; color: white; }

        .otp-row { display: flex; gap: 8px; align-items: center; width: 100%; }
        .otp-input {
          flex: 1; padding: 8px 12px; border: 1px solid #e0e0e0;
          border-radius: 4px; font-family: 'Poppins', sans-serif;
          font-size: 13px; outline: none; letter-spacing: 2px;
        }
        .otp-input:focus { border-color: #4caf50; }

        .auto-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff3e0; color: #e65100;
          padding: 7px 12px; border-radius: 4px;
          font-size: 12px; font-weight: 500;
        }
        .pulse { width: 8px; height: 8px; background: #fb8c00; border-radius: 50%; animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* Empty */
        .admin-empty { text-align: center; padding: 60px; color: #9e9e9e; font-size: 15px; background: white; border-radius: 8px; border: 1px solid #e8e8e8; }

        /* Skeleton */
        .sk-card { background: white; border-radius: 8px; padding: 20px; height: 200px; border: 1px solid #e8e8e8; }
        .sk { height: 11px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:sh 1.4s infinite; border-radius:4px; margin-bottom:10px; }
        @keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        @media (max-width: 768px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
      `}</style>

      {/* NAV */}
      <nav className="admin-nav">
        <div className="brand">Ecart</div>
        <span className="admin-badge">ADMIN</span>
        <div className="spacer" />
        <button className="nav-refresh" onClick={fetchOrders}>↻ Refresh</button>
        <button className="nav-logout" onClick={handleLogout}>Logout</button>
      </nav>

      <div className="admin-page">

        {/* STATS */}
        <div className="stats-row">
          {stats.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-value">₹{Math.round(revenue).toLocaleString("en-IN")}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="admin-toolbar">
          <span className="toolbar-title">Orders</span>
          <input
            className="search-input"
            placeholder="Search by email or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="filter-tabs">
            {["ALL","PAID","CONFIRMED","OUT_FOR_DELIVERY","DELIVERED","RETURN_INITIATED","CANCELLED"].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f === "ALL" ? "All" : f.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* ORDERS */}
        {loading ? (
          <div className="orders-grid">
            {[1,2,3,4].map((i) => (
              <div className="sk-card" key={i}>
                <div className="sk" style={{ width: "50%" }} />
                <div className="sk" style={{ width: "30%" }} />
                <div className="sk" style={{ width: "70%" }} />
                <div className="sk" style={{ width: "55%" }} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No orders match your filter.</div>
        ) : (
          <div className="orders-grid">
            {filtered.map((order) => {
              const sc = STATUS_COLORS[order.status] || { bg: "#f5f5f5", color: "#616161" };
              const items = order.items || [];

              return (
                <div className="order-card" key={order.id}>

                  {/* HEADER */}
                  <div className="card-header">
                    <span className="card-order-id">Order #{order.id}</span>
                    <span className="status-pill" style={{ background: sc.bg, color: sc.color }}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="card-body">
                    {/* EMAIL */}
                    <div className="user-email">📧 {order.userEmail}</div>

                    {/* ✅ AMOUNT — now correctly populated from backend */}
                    <div className="order-amount">
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                      <span>total</span>
                    </div>

                    {/* ITEMS — now shown */}
                    {items.length > 0 && (
                      <div className="items-mini">
                        {items.slice(0, 3).map((item, i) => (
                          <div className="items-mini-row" key={i}>
                            <span>• {item.productName} × {item.quantity}</span>
                            <span className="item-price">₹{Number((item.price || 0) * item.quantity).toLocaleString("en-IN")}</span>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <div className="items-more">+{items.length - 3} more item{items.length - 3 > 1 ? "s" : ""}</div>
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}
                    <div className="card-actions">
                      {order.status === "PAID" && (
                        <button
                          className="action-btn btn-confirm"
                          disabled={isLoading(order.id, "confirm")}
                          onClick={() => confirmOrder(order.id)}
                        >
                          {isLoading(order.id, "confirm") ? "⏳ Confirming..." : "✓ Confirm Order"}
                        </button>
                      )}

                      {order.status === "CONFIRMED" && (
                        <div className="auto-badge">
                          <div className="pulse" />
                          Auto Shipping In Progress...
                        </div>
                      )}

                      {order.status === "OUT_FOR_DELIVERY" && (
                        <div className="otp-row">
                          <input
                            className="otp-input"
                            placeholder="Enter OTP"
                            value={otpMap[order.id] || ""}
                            onChange={(e) => setOtpMap({ ...otpMap, [order.id]: e.target.value })}
                            maxLength={4}
                          />
                          <button
                            className="action-btn btn-deliver"
                            disabled={isLoading(order.id, "otp") || !otpMap[order.id]}
                            onClick={() => verifyOtp(order.id)}
                          >
                            {isLoading(order.id, "otp") ? "⏳ Verifying..." : "✓ Verify Delivery"}
                          </button>
                        </div>
                      )}

                      {order.status === "RETURN_INITIATED" && (
                        <button
                          className="action-btn btn-receive"
                          disabled={isLoading(order.id, "return")}
                          onClick={() => receiveReturn(order.id)}
                        >
                          {isLoading(order.id, "return") ? "⏳ Processing..." : "📬 Mark Product Received"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default AdminDashboard;

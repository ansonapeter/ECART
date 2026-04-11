import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

// ─── Status display config (matches backend OrderStatus enum exactly) ───────
const STATUS_CONFIG = {
  CREATED:          { label: "Order Placed",       color: "#2874f0", bg: "#e8f0fe", emoji: "📋" },
  PAID:             { label: "Payment Done",        color: "#1565c0", bg: "#e3f2fd", emoji: "💳" },
  CONFIRMED:        { label: "Confirmed",           color: "#e65100", bg: "#fff3e0", emoji: "✅" },
  SHIPPED:          { label: "Shipped",             color: "#6a1b9a", bg: "#f3e5f5", emoji: "📦" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery",    color: "#00796b", bg: "#e0f2f1", emoji: "🚚" },
  DELIVERED:        { label: "Delivered",           color: "#2e7d32", bg: "#e8f5e9", emoji: "🎉" },
  CANCELLED:        { label: "Cancelled",           color: "#c62828", bg: "#ffebee", emoji: "❌" },
  RETURN_INITIATED: { label: "Return In Progress",  color: "#1565c0", bg: "#e3f2fd", emoji: "🔄" },
  RETURN_RECEIVED:  { label: "Return Received",     color: "#00796b", bg: "#e0f2f1", emoji: "📬" },
  REFUNDED:         { label: "Refunded",            color: "#2e7d32", bg: "#e8f5e9", emoji: "💰" },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "#878787", bg: "#f5f5f5", emoji: "•" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: "4px 12px", borderRadius: "12px",
      fontSize: "12px", fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: "5px",
      whiteSpace: "nowrap",
    }}>
      {cfg.emoji} {cfg.label}
    </span>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  // Track which specific action is in-flight per order: { [orderId]: "pay"|"cancel"|"return" }
  const [actionLoading, setActionLoading] = useState({});
  const navigate = useNavigate();

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");
      // Sort newest first
      setOrders(res.data.sort((a, b) => b.orderId - a.orderId));
    } catch {
      alert("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Generic action runner — prevents double-click, refreshes after
  const runAction = async (orderId, actionKey, apiFn, errorMsg) => {
    const key = `${orderId}_${actionKey}`;
    // Prevent double-click
    if (actionLoading[key]) return;

    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      await apiFn();
      await fetchOrders(); // refresh to get updated status
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || errorMsg;
      alert(`❌ ${msg}`);
    } finally {
      setActionLoading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const isLoading = (orderId, actionKey) => !!actionLoading[`${orderId}_${actionKey}`];

  // ─── Actions ──────────────────────────────────────────────────────────────
  const payOrder = (orderId) =>
    runAction(orderId, "pay",
      () => API.post(`/payments/${orderId}`),
      "Payment failed"
    );

  const cancelOrder = (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    runAction(orderId, "cancel",
      () => API.post(`/orders/${orderId}/cancel`),
      "Cancel failed. Order may already be shipped."
    );
  };

  /**
   * FIXED: returnProduct
   * - Guard: only call if status === "DELIVERED" (matches backend check exactly)
   * - Prevents double-click via actionLoading
   * - Shows proper error message from backend response
   */
  const returnProduct = (orderId, currentStatus) => {
    // Extra frontend guard — matches backend: only DELIVERED orders can be returned
    if (currentStatus !== "DELIVERED") {
      alert("Only delivered orders can be returned.");
      return;
    }
    runAction(orderId, "return",
      () => API.post(`/orders/${orderId}/return-product`),
      "Return failed. Only delivered orders can be returned."
    );
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }

        .orders-nav {
          background: #2874f0; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: sticky; top: 0; z-index: 100;
        }
        .orders-nav .brand { color: white; font-size: 20px; font-weight: 700; cursor: pointer; }
        .orders-nav h2 { color: white; font-size: 18px; font-weight: 500; }
        .back-btn {
          margin-left: auto;
          background: transparent; color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.4); padding: 7px 16px;
          border-radius: 2px; cursor: pointer; font-size: 13px;
          font-family: 'Poppins', sans-serif; transition: background 0.2s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.1); }

        .orders-page { max-width: 860px; margin: 0 auto; padding: 22px 16px; }
        .orders-count { font-size: 16px; font-weight: 600; color: #212121; margin-bottom: 16px; }

        /* ── ORDER CARD ── */
        .order-card {
          background: white; border-radius: 4px;
          border: 1px solid #e0e0e0; margin-bottom: 14px;
          overflow: hidden; transition: box-shadow 0.2s;
        }
        .order-card:hover { box-shadow: 0 2px 14px rgba(0,0,0,0.09); }

        .card-header {
          padding: 14px 20px; background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
          display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
        }
        .order-id-col { flex: 1; }
        .order-id { font-size: 14px; font-weight: 700; color: #212121; }
        .order-amount { font-size: 16px; font-weight: 700; color: #212121; margin-left: auto; white-space: nowrap; }

        .card-body { padding: 16px 20px; }

        /* ── ITEMS LIST ── */
        .items-list { margin-bottom: 14px; }
        .item-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid #f9f9f9;
          font-size: 14px;
        }
        .item-row:last-child { border-bottom: none; }
        .item-dot { width: 5px; height: 5px; background: #bdbdbd; border-radius: 50%; flex-shrink: 0; }
        .item-name { flex: 1; color: #424242; }
        .item-meta { color: #878787; font-size: 13px; white-space: nowrap; }

        /* ── META ROW (ETA, return info) ── */
        .order-meta { display: flex; flex-wrap: wrap; gap: 14px; padding: 10px 0; border-top: 1px solid #f5f5f5; margin-bottom: 14px; }
        .eta-text { font-size: 13px; color: #2874f0; font-weight: 500; display: flex; align-items: center; gap: 5px; }
        .return-info { font-size: 13px; font-weight: 500; display: flex; align-items: center; gap: 5px; }
        .return-info.progress { color: #e65100; }
        .return-info.done { color: #2e7d32; }

        /* ── ACTION BUTTONS ── */
        .order-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .action-btn {
          padding: 9px 20px; border: none; border-radius: 2px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          font-family: 'Poppins', sans-serif; transition: opacity 0.2s, transform 0.1s;
          display: flex; align-items: center; gap: 6px;
        }
        .action-btn:hover:not(:disabled) { opacity: 0.87; }
        .action-btn:active:not(:disabled) { transform: scale(0.98); }
        .action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-pay    { background: #fb641b; color: white; }
        .btn-cancel { background: white; color: #616161; border: 1px solid #e0e0e0 !important; }
        .btn-cancel:hover:not(:disabled) { background: #fff5f5; color: #f44336; border-color: #f44336 !important; }
        .btn-return { background: white; color: #2874f0; border: 1.5px solid #2874f0 !important; }
        .btn-return:hover:not(:disabled) { background: #e8f0fe; }
        .btn-track  { background: #2874f0; color: white; }

        /* ── EMPTY / LOADING ── */
        .orders-empty {
          text-align: center; padding: 80px 20px;
          background: white; border-radius: 4px; border: 1px solid #e0e0e0;
        }
        .orders-empty .icon { font-size: 68px; margin-bottom: 18px; }
        .orders-empty h3 { font-size: 20px; font-weight: 500; color: #212121; margin-bottom: 8px; }
        .orders-empty p { color: #878787; font-size: 14px; margin-bottom: 24px; }
        .shop-btn {
          background: #2874f0; color: white; border: none;
          padding: 12px 28px; border-radius: 2px; font-size: 15px;
          font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
        }

        /* ── SKELETON ── */
        .skeleton { background: white; border-radius: 4px; border: 1px solid #e0e0e0; margin-bottom: 14px; padding: 20px; }
        .sk { height: 12px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:sh 1.4s infinite; border-radius:4px; margin-bottom:10px; }
        @keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        /* Spin for loading buttons */
        .spin { display: inline-block; animation: spin 0.8s linear infinite; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        @media (max-width: 600px) {
          .order-amount { font-size: 14px; }
          .action-btn { padding: 8px 14px; font-size: 12px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="orders-nav">
        <div className="brand" onClick={() => navigate("/dashboard")}>Ecart</div>
        <h2>📦 My Orders</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Continue Shopping</button>
      </nav>

      <div className="orders-page">

        {/* LOADING SKELETONS */}
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div className="skeleton" key={i}>
                <div className="sk" style={{ width: "40%" }} />
                <div className="sk" style={{ width: "65%" }} />
                <div className="sk" style={{ width: "50%" }} />
              </div>
            ))}
          </>
        ) : orders.length === 0 ? (

          /* EMPTY STATE */
          <div className="orders-empty">
            <div className="icon">📦</div>
            <h3>No orders yet!</h3>
            <p>Looks like you haven't placed any orders. Start shopping!</p>
            <button className="shop-btn" onClick={() => navigate("/dashboard")}>
              Start Shopping
            </button>
          </div>

        ) : (
          <>
            <p className="orders-count">{orders.length} Order{orders.length !== 1 ? "s" : ""}</p>

            {orders.map((order) => {
              const status = order.status; // e.g. "DELIVERED", "RETURN_INITIATED" etc.

              return (
                <div className="order-card" key={order.orderId}>

                  {/* HEADER */}
                  <div className="card-header">
                    <div className="order-id-col">
                      <div className="order-id">Order #{order.orderId}</div>
                    </div>
                    <StatusBadge status={status} />
                    <div className="order-amount">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="card-body">

                    {/* ITEMS */}
                    <div className="items-list">
                      {(order.items || []).map((item, i) => (
                        <div className="item-row" key={i}>
                          <div className="item-dot" />
                          <div className="item-name">{item.productName}</div>
                          <div className="item-meta">
                            Qty: {item.quantity} &nbsp;|&nbsp;
                            ₹{Number(item.price * item.quantity).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* META: ETA, Return info */}
                    <div className="order-meta">
                      {order.estimatedDeliveryDate &&
                        !["REFUNDED", "CANCELLED", "RETURN_INITIATED", "RETURN_RECEIVED"].includes(status) && (
                          <span className="eta-text">
                            🗓 Expected: {new Date(order.estimatedDeliveryDate).toDateString()}
                          </span>
                        )}

                      {status === "RETURN_INITIATED" && (
                        <span className="return-info progress">🔄 Return picked up — in transit to seller</span>
                      )}
                      {status === "RETURN_RECEIVED" && (
                        <span className="return-info done">📬 Return received by seller</span>
                      )}
                      {status === "REFUNDED" && (
                        <span className="return-info done">💰 Refund has been processed to your account</span>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="order-actions">

                      {/* PAY NOW — only for CREATED */}
                      {status === "CREATED" && (
                        <button
                          className="action-btn btn-pay"
                          disabled={isLoading(order.orderId, "pay")}
                          onClick={() => payOrder(order.orderId)}
                        >
                          {isLoading(order.orderId, "pay")
                            ? <><span className="spin">⏳</span> Processing...</>
                            : "💳 Pay Now"}
                        </button>
                      )}

                      {/* CANCEL — only before shipping */}
                      {["CREATED", "PAID", "CONFIRMED"].includes(status) && (
                        <button
                          className="action-btn btn-cancel"
                          disabled={isLoading(order.orderId, "cancel")}
                          onClick={() => cancelOrder(order.orderId)}
                        >
                          {isLoading(order.orderId, "cancel") ? "Cancelling..." : "Cancel Order"}
                        </button>
                      )}

                      {/*
                        RETURN PRODUCT — only for DELIVERED
                        ✅ KEY FIX:
                        1. Status guard matches backend exactly: status === "DELIVERED"
                        2. Disabled immediately on first click (prevents double-click 400)
                        3. Passes currentStatus to runAction for extra safety
                      */}
                      {status === "DELIVERED" && (
                        <button
                          className="action-btn btn-return"
                          disabled={isLoading(order.orderId, "return")}
                          onClick={() => returnProduct(order.orderId, status)}
                        >
                          {isLoading(order.orderId, "return")
                            ? <><span className="spin">⏳</span> Submitting...</>
                            : "↩ Return Product"}
                        </button>
                      )}

                      {/* TRACK — always available */}
                      <button
                        className="action-btn btn-track"
                        onClick={() => navigate(`/tracking/${order.orderId}`)}
                      >
                        🚚 Track Order
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}

export default Orders;

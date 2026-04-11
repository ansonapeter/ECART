import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

const NORMAL_STEPS = [
  { key: "CREATED",          label: "Order Placed",      icon: "📋", desc: "Your order has been placed successfully" },
  { key: "PAID",             label: "Payment Confirmed", icon: "💳", desc: "Payment received and verified" },
  { key: "CONFIRMED",        label: "Order Confirmed",   icon: "✅", desc: "Seller has confirmed your order" },
  { key: "SHIPPED",          label: "Shipped",           icon: "🏭", desc: "Package dispatched from warehouse" },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery",  icon: "🚚", desc: "Delivery partner is on the way to you" },
  { key: "DELIVERED",        label: "Delivered",         icon: "🎉", desc: "Package delivered successfully" },
];

const RETURN_STEPS = [
  { key: "RETURN_INITIATED", label: "Return Picked Up",  icon: "🔄", desc: "Item collected from your address" },
  { key: "RETURN_RECEIVED",  label: "Return Received",   icon: "📬", desc: "Seller has received the returned item" },
  { key: "REFUNDED",         label: "Refund Processed",  icon: "💰", desc: "Amount refunded to your account" },
];

const CANCEL_STEPS = [
  { key: "CANCELLED",        label: "Order Cancelled",   icon: "❌", desc: "This order has been cancelled" },
  { key: "REFUNDED",         label: "Refund Processed",  icon: "💰", desc: "Amount refunded to your account" },
];

function Tracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState("");

  // useCallback so fetchTracking is stable and can be used in useEffect + button
  const fetchTracking = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    setError("");
    try {
      const res = await API.get(`/tracking/${orderId}`);
      setTracking(res.data || []);
      setLastRefreshed(new Date());
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to load tracking info";
      setError(msg);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, [orderId]);

  // Initial load
  useEffect(() => {
    fetchTracking(false);
  }, [fetchTracking]);

  // Helpers
  const isCompleted = (key) => tracking.some((t) => t.status === key);
  const getTimestamp = (key) => tracking.find((t) => t.status === key)?.timestamp;

  // Determine which step set to show
  const hasCancelled = isCompleted("CANCELLED");
  const hasReturn = RETURN_STEPS.some((s) => isCompleted(s.key));

  let steps = [...NORMAL_STEPS];
  if (hasCancelled) {
    // Show normal steps up to last completed, then cancel steps
    steps = [...NORMAL_STEPS, ...CANCEL_STEPS];
  } else if (hasReturn) {
    steps = [...NORMAL_STEPS, ...RETURN_STEPS];
  }

  // Find last completed index for "CURRENT" badge
  const lastCompletedIdx = steps.reduce(
    (acc, s, i) => (isCompleted(s.key) ? i : acc),
    -1
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }

        /* NAV */
        .track-nav {
          background: #2874f0; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: sticky; top: 0; z-index: 100;
        }
        .track-nav .brand { color: white; font-size: 20px; font-weight: 700; cursor: pointer; }
        .track-nav h2 { color: white; font-size: 18px; font-weight: 500; }
        .back-btn {
          margin-left: auto; background: transparent;
          color: rgba(255,255,255,0.9);
          border: 1px solid rgba(255,255,255,0.4); padding: 7px 16px;
          border-radius: 2px; cursor: pointer; font-size: 13px;
          font-family: 'Poppins', sans-serif;
        }

        /* PAGE */
        .track-page { max-width: 680px; margin: 0 auto; padding: 24px 16px; }

        /* CARD */
        .track-card {
          background: white; border-radius: 4px;
          border: 1px solid #e0e0e0; overflow: hidden;
        }
        .card-header {
          padding: 16px 24px; background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 10px;
        }
        .card-header-left h3 { font-size: 16px; font-weight: 700; color: #212121; }
        .card-header-left p { font-size: 12px; color: #bdbdbd; margin-top: 3px; }

        /* REFRESH BUTTON */
        .refresh-btn {
          display: flex; align-items: center; gap: 7px;
          background: white; color: #2874f0;
          border: 1.5px solid #2874f0; padding: 7px 16px;
          border-radius: 4px; cursor: pointer; font-size: 13px;
          font-weight: 600; font-family: 'Poppins', sans-serif;
          transition: background 0.2s;
        }
        .refresh-btn:hover:not(:disabled) { background: #e8f0fe; }
        .refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .refresh-icon { font-size: 15px; }
        .refresh-icon.spinning { animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        /* ERROR */
        .error-box {
          margin: 20px 24px; padding: 12px 16px;
          background: #fff3f0; border: 1px solid #ffccc7;
          border-radius: 4px; color: #d32f2f; font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }
        .retry-btn {
          margin-left: auto; background: #d32f2f; color: white;
          border: none; padding: 5px 12px; border-radius: 3px;
          cursor: pointer; font-size: 12px; font-family: 'Poppins', sans-serif;
          font-weight: 600;
        }

        /* TIMELINE */
        .timeline { padding: 24px; }
        .tl-item { display: flex; position: relative; }
        .tl-left {
          display: flex; flex-direction: column; align-items: center;
          width: 52px; flex-shrink: 0;
        }
        .tl-icon {
          width: 44px; height: 44px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; position: relative; z-index: 1;
          border: 2px solid transparent; flex-shrink: 0;
          transition: all 0.3s;
        }
        .tl-icon.done   { background: #e8f5e9; border-color: #4caf50; }
        .tl-icon.active {
          background: #e3f2fd; border-color: #2874f0;
          box-shadow: 0 0 0 5px rgba(40,116,240,0.12);
          animation: pulse-ring 2s infinite;
        }
        .tl-icon.pending { background: #f5f5f5; border-color: #e0e0e0; opacity: 0.45; }
        @keyframes pulse-ring {
          0%  { box-shadow: 0 0 0 0 rgba(40,116,240,0.25); }
          70% { box-shadow: 0 0 0 8px rgba(40,116,240,0); }
          100%{ box-shadow: 0 0 0 0 rgba(40,116,240,0); }
        }

        .tl-connector { width: 2px; flex: 1; min-height: 28px; margin: 3px 0; }
        .tl-connector.done    { background: linear-gradient(to bottom, #4caf50, #4caf50); }
        .tl-connector.pending { background: #e8e8e8; }

        .tl-content { flex: 1; padding: 6px 0 28px 16px; }
        .tl-label { font-size: 15px; font-weight: 600; }
        .tl-label.done    { color: #212121; }
        .tl-label.active  { color: #2874f0; }
        .tl-label.pending { color: #c2c2c2; }
        .tl-desc { font-size: 13px; color: #9e9e9e; margin-top: 3px; line-height: 1.5; }
        .tl-time { font-size: 12px; color: #4caf50; font-weight: 600; margin-top: 5px; }
        .current-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #2874f0; color: white;
          font-size: 11px; font-weight: 700; padding: 3px 10px;
          border-radius: 12px; margin-top: 6px;
        }
        .current-dot { width: 6px; height: 6px; background: #ffe082; border-radius: 50%; animation: blink 1s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        /* SKELETON */
        .tl-skeleton { padding: 24px; }
        .sk-item { display: flex; gap: 14px; margin-bottom: 28px; }
        .sk-circle { width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:sh 1.4s infinite; }
        .sk-lines { flex: 1; }
        .sk-line { height: 11px; border-radius: 4px; margin-bottom: 8px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:sh 1.4s infinite; }
        @keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
      `}</style>

      {/* NAV */}
      <nav className="track-nav">
        <div className="brand" onClick={() => navigate("/dashboard")}>Ecart</div>
        <h2>🚚 Track Order</h2>
        <button className="back-btn" onClick={() => navigate("/orders")}>← Back to Orders</button>
      </nav>

      <div className="track-page">
        <div className="track-card">

          {/* HEADER */}
          <div className="card-header">
            <div className="card-header-left">
              <h3>Order #{orderId}</h3>
              {lastRefreshed && (
                <p>Last updated: {lastRefreshed.toLocaleTimeString("en-IN")}</p>
              )}
            </div>

            {/* ✅ FIXED REFRESH BUTTON */}
            <button
              className="refresh-btn"
              disabled={refreshing}
              onClick={() => fetchTracking(true)}
            >
              <span className={`refresh-icon ${refreshing ? "spinning" : ""}`}>↻</span>
              {refreshing ? "Refreshing..." : "Refresh Status"}
            </button>
          </div>

          {/* ERROR STATE */}
          {error && (
            <div className="error-box">
              ⚠ {error}
              <button className="retry-btn" onClick={() => fetchTracking(true)}>Retry</button>
            </div>
          )}

          {/* SKELETON */}
          {loading ? (
            <div className="tl-skeleton">
              {[1, 2, 3, 4, 5].map((i) => (
                <div className="sk-item" key={i}>
                  <div className="sk-circle" />
                  <div className="sk-lines">
                    <div className="sk-line" style={{ width: "45%" }} />
                    <div className="sk-line" style={{ width: "70%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (

            /* TIMELINE */
            <div className="timeline">
              {steps.map((step, index) => {
                const completed = isCompleted(step.key);
                const isActive  = completed && index === lastCompletedIdx;
                const isLast    = index === steps.length - 1;
                const timestamp = getTimestamp(step.key);

                const state = completed ? (isActive ? "active" : "done") : "pending";

                return (
                  <div className="tl-item" key={step.key}>
                    <div className="tl-left">
                      <div className={`tl-icon ${state}`}>{step.icon}</div>
                      {!isLast && (
                        <div
                          className={`tl-connector ${
                            completed && !isActive ? "done" : "pending"
                          }`}
                        />
                      )}
                    </div>

                    <div className="tl-content">
                      <div className={`tl-label ${state}`}>{step.label}</div>
                      <div className="tl-desc">{step.desc}</div>

                      {completed && timestamp && (
                        <div className="tl-time">
                          ✓&nbsp;
                          {new Date(timestamp).toLocaleString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </div>
                      )}

                      {isActive && (
                        <div className="current-badge">
                          <div className="current-dot" />
                          CURRENT STATUS
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Tracking;

import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useState } from "react";

function Payment() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("upi");

  const handlePayment = async () => {
    setLoading(true);
    try {
      await API.post(`/payments/${orderId}`);
      navigate("/orders");
    } catch (error) {
      alert(error.response?.data?.message || "Payment Failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }

        .pay-nav {
          background: #2874f0; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: sticky; top: 0; z-index: 100;
        }
        .pay-nav .brand { color: white; font-size: 20px; font-weight: 700; }
        .pay-nav h2 { color: white; font-size: 17px; font-weight: 500; }
        .pay-nav .secure { margin-left: auto; color: #ffe082; font-size: 13px; display: flex; align-items: center; gap: 6px; }

        .pay-steps {
          background: white; border-bottom: 1px solid #e0e0e0;
          display: flex; align-items: center; padding: 0 24px;
        }
        .pay-step { padding: 14px 20px; font-size: 13px; color: #878787; display: flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent; }
        .pay-step.done { color: #2874f0; border-bottom-color: #2874f0; }
        .pay-step.active { color: #2874f0; font-weight: 600; border-bottom-color: #2874f0; }
        .step-num { width: 20px; height: 20px; border-radius: 50%; background: #2874f0; color: white; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 600; }
        .step-num.done { background: #4caf50; }
        .step-arrow { color: #c2c2c2; padding: 0 4px; }

        .pay-page { max-width: 900px; margin: 0 auto; padding: 20px 16px; display: flex; gap: 16px; align-items: flex-start; }

        .pay-left { flex: 1; display: flex; flex-direction: column; gap: 12px; }

        .pay-card { background: white; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .pay-card-header {
          padding: 14px 20px; background: #2874f0;
          display: flex; align-items: center; gap: 10px;
        }
        .pay-card-header h3 { color: white; font-size: 15px; font-weight: 600; }
        .pay-card-body { padding: 20px; }

        .method-option {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 4px; cursor: pointer;
          border: 1.5px solid #e0e0e0; margin-bottom: 10px;
          transition: border-color 0.2s, background 0.2s;
        }
        .method-option:hover { border-color: #2874f0; background: #f8faff; }
        .method-option.selected { border-color: #2874f0; background: #f0f4ff; }
        .method-option input[type="radio"] { accent-color: #2874f0; width: 16px; height: 16px; }
        .method-icon { font-size: 22px; }
        .method-info h4 { font-size: 14px; font-weight: 600; color: #212121; }
        .method-info p { font-size: 12px; color: #878787; margin-top: 2px; }
        .method-option.disabled { opacity: 0.5; cursor: not-allowed; }

        .secure-badges { display: flex; gap: 12px; flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid #f0f0f0; }
        .badge { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #878787; }

        /* RIGHT */
        .pay-right { width: 320px; flex-shrink: 0; position: sticky; top: 76px; }
        .summary-card { background: white; border: 1px solid #e0e0e0; border-radius: 4px; }
        .summary-header { padding: 14px 20px; background: #fafafa; border-bottom: 1px solid #f0f0f0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #878787; }
        .summary-body { padding: 16px 20px; }
        .summary-row { display: flex; justify-content: space-between; padding: 9px 0; font-size: 14px; color: #212121; border-bottom: 1px solid #f9f9f9; }
        .summary-row.total { font-weight: 700; font-size: 17px; border-bottom: none; border-top: 2px solid #e0e0e0; padding-top: 14px; margin-top: 4px; }
        .summary-row.green { color: #388e3c; }

        .pay-btn {
          width: 100%; padding: 15px; margin-top: 16px;
          background: linear-gradient(to right, #fb641b, #f7a329);
          border: none; border-radius: 4px; color: white;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Poppins', sans-serif; letter-spacing: 0.5px;
          transition: opacity 0.2s;
        }
        .pay-btn:hover { opacity: 0.92; }
        .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .order-info-note { font-size: 12px; color: #878787; text-align: center; margin-top: 10px; }

        @media (max-width: 768px) {
          .pay-page { flex-direction: column; }
          .pay-right { width: 100%; position: static; }
          .pay-steps { overflow-x: auto; }
        }
      `}</style>

      <nav className="pay-nav">
        <div className="brand">Ecart</div>
        <h2>Secure Checkout</h2>
        <span className="secure">🔒 256-bit SSL Encrypted</span>
      </nav>

      {/* Breadcrumb steps */}
      <div className="pay-steps">
        <div className="pay-step done"><span className="step-num done">✓</span> Cart</div>
        <span className="step-arrow">›</span>
        <div className="pay-step done"><span className="step-num done">✓</span> Address</div>
        <span className="step-arrow">›</span>
        <div className="pay-step active"><span className="step-num">3</span> Payment</div>
      </div>

      <div className="pay-page">
        {/* LEFT */}
        <div className="pay-left">
          <div className="pay-card">
            <div className="pay-card-header">
              <span style={{ fontSize: "20px" }}>💳</span>
              <h3>Choose Payment Method</h3>
            </div>
            <div className="pay-card-body">
              {[
                { key: "upi", icon: "📱", title: "UPI", desc: "Pay via Google Pay, PhonePe, BHIM or any UPI app" },
                { key: "card", icon: "💳", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay accepted" },
                { key: "netbanking", icon: "🏦", title: "Net Banking", desc: "All major banks supported" },
                { key: "wallet", icon: "👛", title: "Wallets", desc: "Paytm, Mobikwik, Ola Money" },
              ].map(opt => (
                <div
                  key={opt.key}
                  className={`method-option ${method === opt.key ? "selected" : ""}`}
                  onClick={() => setMethod(opt.key)}
                >
                  <input type="radio" checked={method === opt.key} onChange={() => setMethod(opt.key)} />
                  <span className="method-icon">{opt.icon}</span>
                  <div className="method-info">
                    <h4>{opt.title}</h4>
                    <p>{opt.desc}</p>
                  </div>
                </div>
              ))}
              <div
                className="method-option disabled"
                style={{ marginTop: "4px" }}
              >
                <input type="radio" disabled />
                <span className="method-icon">🏠</span>
                <div className="method-info">
                  <h4>Cash on Delivery</h4>
                  <p>Coming soon for your area</p>
                </div>
              </div>
            </div>
            <div className="secure-badges">
              <span className="badge">🔒 Encrypted</span>
              <span className="badge">✓ PCI Compliant</span>
              <span className="badge">🛡 Fraud Protected</span>
              <span className="badge">↩ Easy Refunds</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="pay-right">
          <div className="summary-card">
            <div className="summary-header">Order Summary</div>
            <div className="summary-body">
              <div className="summary-row">
                <span>Order ID</span>
                <span style={{ fontWeight: 600 }}>#{orderId}</span>
              </div>
              <div className="summary-row green">
                <span>Delivery</span>
                <span>FREE</span>
              </div>
              <div className="summary-row green">
                <span>Discount Applied</span>
                <span>Yes ✓</span>
              </div>
              <div className="summary-row total">
                <span>Amount to Pay</span>
                <span>As per cart</span>
              </div>
            </div>
          </div>

          <button className="pay-btn" onClick={handlePayment} disabled={loading}>
            {loading ? "⏳ Processing Payment..." : "🔒 Pay Securely Now"}
          </button>

          <p className="order-info-note">
            By clicking Pay, you agree to the Terms &amp; Conditions
          </p>
        </div>
      </div>
    </>
  );
}

export default Payment;

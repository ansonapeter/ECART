import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    role: "USER", // default
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setErrorMsg("All fields are required");
      return;
    }
    if (form.password !== form.confirm) {
      setErrorMsg("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      // Backend RegisterRequest expects: name, email, password, role (Role enum: "USER" or "ADMIN")
      await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = (pwd) => {
    if (!pwd) return 0;
    if (pwd.length < 6) return 1;
    if (pwd.length < 10) return 2;
    return 3;
  };
  const s = strength(form.password);
  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#f44336", "#ff9800", "#4caf50"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .reg-root {
          display: flex; min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          background: #f1f3f6;
        }

        .reg-left {
          width: 40%;
          background: linear-gradient(135deg, #2874f0, #0f52ba);
          display: flex; flex-direction: column;
          justify-content: center;
          padding: 60px 50px; color: white;
          position: relative; overflow: hidden;
        }
        .reg-left::before {
          content: ''; position: absolute;
          width: 320px; height: 320px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -70px; right: -70px;
        }
        .reg-left::after {
          content: ''; position: absolute;
          width: 200px; height: 200px; border-radius: 50%;
          background: rgba(255,255,255,0.04);
          bottom: -50px; left: -50px;
        }
        .brand { font-size: 34px; font-weight: 700; letter-spacing: -1px; }
        .brand span {
          font-style: italic; font-weight: 300;
          color: #ffe082; font-size: 13px; display: block; margin-top: 4px;
        }
        .reg-left h2 { font-size: 24px; font-weight: 600; margin: 36px 0 12px; line-height: 1.3; }
        .reg-left p { font-size: 14px; opacity: 0.85; line-height: 1.7; }
        .perk { display: flex; align-items: center; gap: 12px; margin-top: 18px; font-size: 13px; opacity: 0.9; }
        .perk-icon {
          width: 38px; height: 38px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; flex-shrink: 0;
        }

        .reg-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 40px 20px;
        }
        .reg-card {
          background: white; width: 100%; max-width: 440px;
          padding: 40px 36px; border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06);
        }
        .reg-card h3 { font-size: 22px; font-weight: 600; color: #212121; margin-bottom: 4px; }
        .reg-card .sub { font-size: 13px; color: #878787; margin-bottom: 24px; }

        .field { margin-bottom: 18px; }
        .field label {
          display: block; font-size: 12px; font-weight: 600;
          color: #878787; margin-bottom: 7px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .field input {
          width: 100%; padding: 12px 14px;
          border: 1px solid #e0e0e0; border-radius: 4px;
          font-size: 14px; font-family: 'Poppins', sans-serif;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; color: #212121;
        }
        .field input:focus {
          border-color: #2874f0;
          box-shadow: 0 0 0 3px rgba(40,116,240,0.1);
        }

        /* ── ROLE SELECTOR ── */
        .role-section { margin-bottom: 18px; }
        .role-section-label {
          font-size: 12px; font-weight: 600;
          color: #878787; margin-bottom: 10px; display: block;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .role-options { display: flex; gap: 12px; }
        .role-card {
          flex: 1; padding: 16px 10px;
          border: 2px solid #e0e0e0; border-radius: 8px;
          cursor: pointer; text-align: center;
          transition: all 0.18s; background: white;
          display: flex; flex-direction: column;
          align-items: center; gap: 6px;
          position: relative;
        }
        .role-card:hover { border-color: #2874f0; background: #f8faff; }
        .role-card.active { border-color: #2874f0; background: #e8f0fe; }
        .role-card .r-icon { font-size: 28px; }
        .role-card .r-title { font-size: 14px; font-weight: 700; color: #212121; }
        .role-card.active .r-title { color: #2874f0; }
        .role-card .r-desc { font-size: 11px; color: #9e9e9e; line-height: 1.4; }
        .role-tick {
          position: absolute; top: 8px; right: 8px;
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid #c2c2c2;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 700; color: white;
          transition: all 0.15s;
        }
        .role-card.active .role-tick { background: #2874f0; border-color: #2874f0; }

        /* Admin warning */
        .admin-warning {
          background: #fff8e1; border: 1px solid #ffe082;
          border-radius: 4px; padding: 9px 12px;
          font-size: 12px; color: #e65100;
          margin-bottom: 16px;
          display: flex; align-items: flex-start; gap: 7px;
          line-height: 1.5;
        }

        /* Strength */
        .strength-bar { height: 4px; background: #f0f0f0; border-radius: 2px; margin-top: 7px; overflow: hidden; }
        .strength-fill { height: 100%; border-radius: 2px; transition: width 0.3s, background 0.3s; }
        .strength-text { font-size: 11px; margin-top: 4px; font-weight: 500; }

        /* Alerts */
        .error-msg {
          background: #fff3f0; border: 1px solid #ffccc7;
          color: #d32f2f; padding: 11px 14px;
          border-radius: 4px; font-size: 13px; margin-bottom: 16px;
        }
        .success-msg {
          background: #f0fff4; border: 1px solid #b2dfdb;
          color: #1b5e20; padding: 14px;
          border-radius: 4px; font-size: 14px;
          text-align: center; margin-bottom: 16px;
        }

        /* Button */
        .reg-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(to right, #fb641b, #f7a329);
          border: none; border-radius: 4px;
          color: white; font-size: 15px; font-weight: 700;
          font-family: 'Poppins', sans-serif;
          cursor: pointer; letter-spacing: 0.3px;
          transition: opacity 0.2s, transform 0.1s;
        }
        .reg-btn:hover:not(:disabled) { opacity: 0.9; }
        .reg-btn:active:not(:disabled) { transform: scale(0.99); }
        .reg-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .login-link { text-align: center; font-size: 13px; color: #878787; margin-top: 18px; }
        .login-link a { color: #2874f0; font-weight: 600; text-decoration: none; }
        .login-link a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .reg-left { display: none; }
          .reg-right { padding: 16px; }
          .reg-card { padding: 28px 20px; }
        }
      `}</style>

      <div className="reg-root">

        {/* ── LEFT PANEL ── */}
        <div className="reg-left">
          <div className="brand">
            Ecart
            <span>Powered by trust</span>
          </div>
          <h2>Looks like you're new here!</h2>
          <p>Sign up with your email to get started on your shopping journey.</p>
          <div className="perk">
            <div className="perk-icon">🎁</div>
            <span>Exclusive deals for new users</span>
          </div>
          <div className="perk">
            <div className="perk-icon">🚚</div>
            <span>Free delivery on first order</span>
          </div>
          <div className="perk">
            <div className="perk-icon">🔒</div>
            <span>100% secure &amp; encrypted</span>
          </div>
          <div className="perk">
            <div className="perk-icon">⚙️</div>
            <span>Admin panel for store owners</span>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="reg-right">
          <div className="reg-card">
            <h3>Create Account</h3>
            <p className="sub">Join millions of happy shoppers</p>

            {success && (
              <div className="success-msg">
                🎉 Account created successfully! Redirecting to login...
              </div>
            )}
            {errorMsg && (
              <div className="error-msg">⚠ {errorMsg}</div>
            )}

            {/* ── ROLE SELECTOR ── */}
            <div className="role-section">
              <span className="role-section-label">Register as</span>
              <div className="role-options">

                {/* CUSTOMER */}
                <div
                  className={`role-card ${form.role === "USER" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, role: "USER" })}
                >
                  <div className="role-tick">{form.role === "USER" ? "✓" : ""}</div>
                  <div className="r-icon">🛍️</div>
                  <div className="r-title">Customer</div>
                  <div className="r-desc">Browse &amp; buy products</div>
                </div>

                {/* ADMIN */}
                <div
                  className={`role-card ${form.role === "ADMIN" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, role: "ADMIN" })}
                >
                  <div className="role-tick">{form.role === "ADMIN" ? "✓" : ""}</div>
                  <div className="r-icon">⚙️</div>
                  <div className="r-title">Admin</div>
                  <div className="r-desc">Manage store &amp; orders</div>
                </div>

              </div>
            </div>

            {/* Admin warning note */}
            {form.role === "ADMIN" && (
              <div className="admin-warning">
                ⚠️ Admin accounts have full access to order management, delivery verification, and product administration.
              </div>
            )}

            {/* FIELDS */}
            <div className="field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={form.name}
                onChange={update("name")}
              />
            </div>

            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={update("email")}
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={update("password")}
              />
              {form.password.length > 0 && (
                <>
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(s / 3) * 100}%`,
                        background: strengthColor[s],
                      }}
                    />
                  </div>
                  <p className="strength-text" style={{ color: strengthColor[s] }}>
                    {strengthLabel[s]} password
                  </p>
                </>
              )}
            </div>

            <div className="field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={update("confirm")}
              />
            </div>

            <button
              className="reg-btn"
              onClick={handleRegister}
              disabled={loading || success}
            >
              {loading
                ? "Creating Account..."
                : `Create ${form.role === "ADMIN" ? "Admin" : "Customer"} Account`}
            </button>

            <p className="login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

export default Register;

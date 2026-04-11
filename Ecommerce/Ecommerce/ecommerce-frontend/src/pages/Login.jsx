import { useState } from "react";
import API from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please fill in all fields");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const response = await API.post("/auth/login", { email, password });
      const token = response.data.token;
      localStorage.setItem("token", token);
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userEmail", email);
      if (payload.role === "ADMIN") navigate("/admin");
      else navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Poppins', sans-serif;
          background: #f1f3f6;
        }

        /* LEFT PANEL */
        .login-left {
          width: 40%;
          background: linear-gradient(135deg, #2874f0 0%, #0f52ba 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 50px;
          color: white;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: '';
          position: absolute;
          width: 350px; height: 350px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -80px; right: -80px;
        }
        .login-left::after {
          content: '';
          position: absolute;
          width: 250px; height: 250px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -60px; left: -60px;
        }
        .brand-logo {
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -1px;
          margin-bottom: 6px;
        }
        .brand-logo span { font-style: italic; font-weight: 300; color: #ffe082; font-size: 14px; display: block; margin-top: 4px; }
        .login-left h2 {
          font-size: 26px;
          font-weight: 600;
          margin: 40px 0 12px;
          line-height: 1.3;
        }
        .login-left p { font-size: 14px; opacity: 0.85; line-height: 1.7; }
        .feature-list { margin-top: 30px; list-style: none; }
        .feature-list li {
          font-size: 14px;
          padding: 8px 0;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.9;
        }
        .feature-list li::before { content: '✓'; background: rgba(255,255,255,0.2); border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 12px; flex-shrink: 0; }

        /* RIGHT PANEL */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }
        .login-card {
          background: white;
          width: 100%;
          max-width: 400px;
          padding: 40px 36px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 4px 24px rgba(0,0,0,0.06);
        }
        .login-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #212121;
          margin-bottom: 6px;
        }
        .login-card .sub {
          font-size: 13px;
          color: #878787;
          margin-bottom: 28px;
        }
        .field-group { margin-bottom: 22px; position: relative; }
        .field-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #878787;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .field-group input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: border-color 0.2s;
          color: #212121;
        }
        .field-group input:focus { border-color: #2874f0; }
        .eye-btn {
          position: absolute;
          right: 12px; top: 34px;
          background: none; border: none;
          cursor: pointer; color: #878787;
          font-size: 16px;
        }
        .error-msg {
          background: #fff3f0;
          border: 1px solid #ffccc7;
          color: #d32f2f;
          padding: 10px 14px;
          border-radius: 4px;
          font-size: 13px;
          margin-bottom: 18px;
        }
        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(to right, #fb641b, #f7a329);
          border: none;
          border-radius: 4px;
          color: white;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: opacity 0.2s, transform 0.1s;
        }
        .login-btn:hover { opacity: 0.92; }
        .login-btn:active { transform: scale(0.99); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
          color: #bdbdbd;
          font-size: 12px;
        }
        .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #e0e0e0; }
        .register-link {
          text-align: center;
          font-size: 13px;
          color: #878787;
        }
        .register-link a { color: #2874f0; font-weight: 500; text-decoration: none; }
        .register-link a:hover { text-decoration: underline; }
        .terms {
          text-align: center;
          font-size: 11px;
          color: #bdbdbd;
          margin-top: 20px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { padding: 20px; }
        }
      `}</style>

      <div className="login-root">
        {/* LEFT */}
        <div className="login-left">
          <div className="brand-logo">
            Ecart
            <span>Powered by trust</span>
          </div>
          <h2>Login &amp; get access to the best deals</h2>
          <p>Millions of products at your fingertips. Fast delivery, easy returns.</p>
          <ul className="feature-list">
            <li>Fastest delivery in your city</li>
            <li>10 million+ products</li>
            <li>Safe &amp; secure payments</li>
            <li>Easy 7-day return policy</li>
          </ul>
        </div>

        {/* RIGHT */}
        <div className="login-right">
          <div className="login-card">
            <h3>Welcome Back</h3>
            <p className="sub">Sign in to your account</p>

            <div className="field-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>

            {errorMsg && <div className="error-msg">⚠ {errorMsg}</div>}

            <button className="login-btn" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in..." : "Login Securely"}
            </button>

            <div className="divider">OR</div>

            <div className="register-link">
              New to Ecart? <Link to="/register">Create Account</Link>
            </div>

            <p className="terms">
              By continuing, you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;

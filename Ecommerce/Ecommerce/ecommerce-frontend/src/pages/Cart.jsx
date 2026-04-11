import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

// Default address structure
const EMPTY_ADDRESS = {
  name: "",
  phone: "",
  pincode: "",
  address: "",
  city: "",
  state: "",
};

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Address state — persisted in localStorage
  const [address, setAddress] = useState(() => {
    try {
      const saved = localStorage.getItem("ecart_address");
      return saved ? JSON.parse(saved) : EMPTY_ADDRESS;
    } catch {
      return EMPTY_ADDRESS;
    }
  });
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState(EMPTY_ADDRESS);
  const [addressError, setAddressError] = useState("");

  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    try {
      const res = await API.get("/cart");
      setCartItems(res.data);
    } catch {
      alert("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (id) => {
    try {
      await API.delete(`/cart/${id}`);
      fetchCart();
    } catch {}
  };

  const updateQty = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await API.put(`/cart/${id}`, { quantity });
      fetchCart();
    } catch {}
  };

  const placeOrder = async () => {
    // Validate address before placing order
    if (!address.name || !address.phone || !address.address || !address.city || !address.pincode) {
      setShowAddressModal(true);
      setEditAddress(address);
      setAddressError("Please fill in your delivery address before placing the order.");
      return;
    }
    setPlacingOrder(true);
    try {
      const res = await API.post("/orders");
      navigate(`/payment/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  // Address modal handlers
  const openAddressModal = () => {
    setEditAddress({ ...address });
    setAddressError("");
    setShowAddressModal(true);
  };

  const saveAddress = () => {
    if (!editAddress.name.trim()) { setAddressError("Name is required"); return; }
    if (!editAddress.phone.trim() || !/^\d{10}$/.test(editAddress.phone.trim())) {
      setAddressError("Enter a valid 10-digit phone number"); return;
    }
    if (!editAddress.pincode.trim() || !/^\d{6}$/.test(editAddress.pincode.trim())) {
      setAddressError("Enter a valid 6-digit pincode"); return;
    }
    if (!editAddress.address.trim()) { setAddressError("Address is required"); return; }
    if (!editAddress.city.trim()) { setAddressError("City is required"); return; }
    if (!editAddress.state.trim()) { setAddressError("State is required"); return; }

    const toSave = {
      name: editAddress.name.trim(),
      phone: editAddress.phone.trim(),
      pincode: editAddress.pincode.trim(),
      address: editAddress.address.trim(),
      city: editAddress.city.trim(),
      state: editAddress.state.trim(),
    };
    setAddress(toSave);
    localStorage.setItem("ecart_address", JSON.stringify(toSave));
    setShowAddressModal(false);
    setAddressError("");
  };

  const hasAddress = address.name && address.address && address.city;
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity * 1.18, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const discount = totalMRP - totalAmount;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Poppins, sans-serif", color:"#878787" }}>
      Loading your cart...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }

        /* NAV */
        .cart-nav {
          background: #2874f0; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: sticky; top: 0; z-index: 100;
        }
        .cart-nav .brand { color: white; font-size: 20px; font-weight: 700; cursor: pointer; }
        .cart-nav h2 { color: white; font-size: 18px; font-weight: 500; }
        .back-btn { margin-left: auto; background: transparent; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.4); padding: 7px 16px; border-radius: 2px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; }

        /* PAGE */
        .cart-page { max-width: 1100px; margin: 0 auto; padding: 20px 16px; }
        .cart-layout { display: flex; gap: 16px; align-items: flex-start; }

        /* LEFT */
        .cart-left { flex: 2; display: flex; flex-direction: column; gap: 10px; }

        /* ADDRESS STRIP */
        .address-strip {
          background: white; padding: 14px 20px; border-radius: 4px;
          border: 1px solid #e0e0e0;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .address-strip .addr-icon { font-size: 20px; flex-shrink: 0; margin-top: 2px; }
        .addr-details { flex: 1; }
        .addr-details .addr-title { font-size: 13px; font-weight: 600; color: #212121; margin-bottom: 2px; }
        .addr-details .addr-line { font-size: 13px; color: #616161; line-height: 1.5; }
        .addr-details .addr-missing { font-size: 13px; color: #878787; font-style: italic; }
        .change-addr-btn {
          background: none; border: 1px solid #2874f0; color: #2874f0;
          padding: 5px 14px; border-radius: 2px; cursor: pointer;
          font-size: 13px; font-weight: 600; font-family: 'Poppins', sans-serif;
          white-space: nowrap; transition: background 0.2s;
          flex-shrink: 0;
        }
        .change-addr-btn:hover { background: #e8f0fe; }

        /* CART ITEMS */
        .cart-item-card {
          background: white; border-radius: 4px;
          border: 1px solid #e0e0e0;
          padding: 20px; display: flex; gap: 16px; align-items: flex-start;
          transition: box-shadow 0.2s;
        }
        .cart-item-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .item-img { width: 110px; height: 110px; object-fit: contain; flex-shrink: 0; border: 1px solid #f0f0f0; border-radius: 4px; padding: 6px; }
        .item-details { flex: 1; }
        .item-category { font-size: 11px; color: #878787; text-transform: uppercase; letter-spacing: 0.5px; }
        .item-title { font-size: 15px; color: #212121; font-weight: 400; line-height: 1.4; margin: 4px 0 8px; }
        .item-price-row { display: flex; align-items: center; gap: 8px; }
        .item-price { font-size: 18px; font-weight: 700; color: #212121; }
        .item-mrp { font-size: 13px; color: #878787; text-decoration: line-through; }
        .item-off { font-size: 13px; color: #388e3c; font-weight: 500; }
        .item-delivery { font-size: 12px; color: #388e3c; margin-top: 6px; }
        .qty-row { display: flex; align-items: center; margin-top: 14px; width: fit-content; }
        .qty-btn { width: 30px; height: 30px; border: 1px solid #c2c2c2; background: white; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; color: #424242; }
        .qty-btn:first-child { border-radius: 4px 0 0 4px; }
        .qty-btn:last-child { border-radius: 0 4px 4px 0; }
        .qty-count { width: 42px; height: 30px; border: 1px solid #c2c2c2; border-left: none; border-right: none; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; color: #212121; background: white; }
        .item-actions { display: flex; gap: 16px; margin-top: 14px; }
        .remove-btn { background: none; border: none; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; color: #878787; font-weight: 500; padding: 0; }
        .remove-btn:hover { color: #f44336; }

        /* RIGHT SUMMARY */
        .cart-right { width: 340px; flex-shrink: 0; position: sticky; top: 76px; display: flex; flex-direction: column; gap: 12px; }
        .price-card { background: white; border-radius: 4px; border: 1px solid #e0e0e0; }
        .price-card-hdr { padding: 14px 20px; border-bottom: 1px solid #f0f0f0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #878787; }
        .price-card-body { padding: 16px 20px; }
        .price-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; font-size: 15px; color: #212121; border-bottom: 1px solid #f9f9f9; }
        .price-row.green { color: #388e3c; }
        .price-row.total { font-weight: 700; font-size: 18px; border-bottom: none; border-top: 2px solid #e0e0e0; padding-top: 14px; margin-top: 4px; }
        .savings-note { font-size: 13px; color: #388e3c; font-weight: 500; margin-top: 10px; }

        .checkout-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(to right, #fb641b, #f7a329);
          border: none; border-radius: 4px; color: white;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'Poppins', sans-serif; letter-spacing: 0.3px;
          transition: opacity 0.2s;
        }
        .checkout-btn:hover:not(:disabled) { opacity: 0.92; }
        .checkout-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .safe-tag { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 12px; color: #878787; }

        /* EMPTY */
        .cart-empty { text-align: center; padding: 80px 20px; background: white; border-radius: 4px; }
        .cart-empty .icon { font-size: 70px; margin-bottom: 20px; }
        .cart-empty h3 { font-size: 20px; font-weight: 500; color: #212121; margin-bottom: 8px; }
        .cart-empty p { color: #878787; font-size: 14px; margin-bottom: 24px; }
        .shop-btn { background: #2874f0; color: white; border: none; padding: 12px 28px; border-radius: 2px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }

        /* ── ADDRESS MODAL ── */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 16px;
        }
        .modal-box {
          background: white; border-radius: 8px;
          width: 100%; max-width: 520px;
          max-height: 90vh; overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.25);
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn { from{transform:translateY(-20px);opacity:0} to{transform:translateY(0);opacity:1} }
        .modal-header {
          padding: 18px 24px; border-bottom: 1px solid #f0f0f0;
          display: flex; align-items: center; justify-content: space-between;
          background: #2874f0; border-radius: 8px 8px 0 0;
        }
        .modal-header h3 { font-size: 17px; font-weight: 600; color: white; }
        .modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: rgba(255,255,255,0.8); line-height: 1; }
        .modal-body { padding: 20px 24px; }
        .modal-row { display: flex; gap: 12px; }
        .form-field { margin-bottom: 16px; flex: 1; }
        .form-field label { display: block; font-size: 12px; font-weight: 600; color: #878787; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
        .form-field input, .form-field select {
          width: 100%; padding: 11px 14px;
          border: 1px solid #e0e0e0; border-radius: 4px;
          font-size: 14px; font-family: 'Poppins', sans-serif;
          outline: none; color: #212121;
          transition: border-color 0.2s;
        }
        .form-field input:focus, .form-field select:focus { border-color: #2874f0; box-shadow: 0 0 0 3px rgba(40,116,240,0.1); }
        .modal-error { background: #fff3f0; border: 1px solid #ffccc7; color: #d32f2f; padding: 10px 14px; border-radius: 4px; font-size: 13px; margin-bottom: 16px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid #f0f0f0; display: flex; gap: 10px; justify-content: flex-end; }
        .cancel-modal-btn { background: white; color: #878787; border: 1px solid #e0e0e0; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; font-family: 'Poppins', sans-serif; font-weight: 500; }
        .save-addr-btn { background: #2874f0; color: white; border: none; padding: 10px 24px; border-radius: 4px; cursor: pointer; font-size: 14px; font-family: 'Poppins', sans-serif; font-weight: 600; }
        .save-addr-btn:hover { background: #1a5dc9; }

        @media (max-width: 768px) {
          .cart-layout { flex-direction: column; }
          .cart-right { width: 100%; position: static; }
          .modal-row { flex-direction: column; gap: 0; }
        }
      `}</style>

      {/* NAV */}
      <nav className="cart-nav">
        <div className="brand" onClick={() => navigate("/dashboard")}>Ecart</div>
        <h2>🛒 My Cart ({totalItems} items)</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Continue Shopping</button>
      </nav>

      {/* ADDRESS MODAL */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === "modal-overlay") setShowAddressModal(false); }}>
          <div className="modal-box">
            <div className="modal-header">
              <h3>📍 Delivery Address</h3>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>×</button>
            </div>
            <div className="modal-body">
              {addressError && <div className="modal-error">⚠ {addressError}</div>}

              <div className="modal-row">
                <div className="form-field">
                  <label>Full Name *</label>
                  <input type="text" placeholder="John Doe" value={editAddress.name}
                    onChange={(e) => setEditAddress({ ...editAddress, name: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>Phone Number *</label>
                  <input type="tel" placeholder="10-digit mobile" maxLength={10} value={editAddress.phone}
                    onChange={(e) => setEditAddress({ ...editAddress, phone: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>

              <div className="form-field">
                <label>Address (House No., Street, Area) *</label>
                <input type="text" placeholder="e.g. 42, MG Road, Koramangala" value={editAddress.address}
                  onChange={(e) => setEditAddress({ ...editAddress, address: e.target.value })} />
              </div>

              <div className="modal-row">
                <div className="form-field">
                  <label>City *</label>
                  <input type="text" placeholder="e.g. Palakkad" value={editAddress.city}
                    onChange={(e) => setEditAddress({ ...editAddress, city: e.target.value })} />
                </div>
                <div className="form-field">
                  <label>State *</label>
                  <input type="text" placeholder="e.g. Kerala" value={editAddress.state}
                    onChange={(e) => setEditAddress({ ...editAddress, state: e.target.value })} />
                </div>
                <div className="form-field" style={{ maxWidth: "120px" }}>
                  <label>Pincode *</label>
                  <input type="text" placeholder="6-digit" maxLength={6} value={editAddress.pincode}
                    onChange={(e) => setEditAddress({ ...editAddress, pincode: e.target.value.replace(/\D/g, "") })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-modal-btn" onClick={() => setShowAddressModal(false)}>Cancel</button>
              <button className="save-addr-btn" onClick={saveAddress}>Save Address</button>
            </div>
          </div>
        </div>
      )}

      <div className="cart-page">
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="icon">🛒</div>
            <h3>Your cart is empty!</h3>
            <p>Add items to it now to start shopping.</p>
            <button className="shop-btn" onClick={() => navigate("/dashboard")}>Shop Now</button>
          </div>
        ) : (
          <div className="cart-layout">

            {/* LEFT */}
            <div className="cart-left">

              {/* ADDRESS STRIP */}
              <div className="address-strip">
                <div className="addr-icon">📍</div>
                <div className="addr-details">
                  {hasAddress ? (
                    <>
                      <div className="addr-title">Deliver to: {address.name} — {address.pincode}</div>
                      <div className="addr-line">{address.address}, {address.city}, {address.state} &nbsp;|&nbsp; 📞 {address.phone}</div>
                    </>
                  ) : (
                    <div className="addr-missing">No delivery address added. Please add one to proceed.</div>
                  )}
                </div>
                {/* ✅ FIXED: Change button now opens the modal */}
                <button className="change-addr-btn" onClick={openAddressModal}>
                  {hasAddress ? "Change" : "+ Add Address"}
                </button>
              </div>

              {/* CART ITEMS */}
              {cartItems.map((item) => (
                <div className="cart-item-card" key={item.id}>
                  <img className="item-img" src={item.image || "https://via.placeholder.com/110"} alt={item.title} />
                  <div className="item-details">
                    <div className="item-category">{item.category}</div>
                    <div className="item-title">{item.title}</div>
                    <div className="item-price-row">
                      <span className="item-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
                      <span className="item-mrp">₹{Math.round(item.price * 1.18).toLocaleString("en-IN")}</span>
                      <span className="item-off">15% off</span>
                    </div>
                    <div className="item-delivery">✓ Free delivery by Tomorrow</div>
                    <div className="qty-row">
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                      <div className="qty-count">{item.quantity}</div>
                      <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="item-actions">
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>REMOVE</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="cart-right">
              <div className="price-card">
                <div className="price-card-hdr">Price Details</div>
                <div className="price-card-body">
                  <div className="price-row">
                    <span>Price ({totalItems} items)</span>
                    <span>₹{Math.round(totalMRP).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="price-row green">
                    <span>Discount</span>
                    <span>− ₹{Math.round(discount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="price-row green">
                    <span>Delivery Charges</span>
                    <span>FREE</span>
                  </div>
                  <div className="price-row total">
                    <span>Total Amount</span>
                    <span>₹{Math.round(totalAmount).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="savings-note">
                    🎉 You save ₹{Math.round(discount).toLocaleString("en-IN")} on this order
                  </div>
                </div>
              </div>

              <button className="checkout-btn" onClick={placeOrder} disabled={cartItems.length === 0 || placingOrder}>
                {placingOrder ? "⏳ Placing Order..." : "PLACE ORDER"}
              </button>
              <div className="safe-tag">🔒 Safe and Secure Payments</div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default Cart;

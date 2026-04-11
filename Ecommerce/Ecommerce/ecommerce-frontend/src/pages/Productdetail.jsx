import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../api/axios";

const fakeRating   = (id) => (3.8 + (id % 12) * 0.1).toFixed(1);
const fakeReviews  = (id) => 120 + (id % 80) * 23;
const fakeDiscount = (id) => 10 + (id % 4) * 5;

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display:"inline-flex", gap:"2px", alignItems:"center" }}>
      {Array(5).fill(0).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 14 14">
          <polygon
            points="7,1 8.8,5.2 13.4,5.6 10.1,8.4 11.1,13 7,10.5 2.9,13 3.9,8.4 0.6,5.6 5.2,5.2"
            fill={i < full ? "#ff9f00" : (i === full && half ? "#ff9f00" : "#e0e0e0")}
          />
        </svg>
      ))}
    </span>
  );
}

const HIGHLIGHTS   = ["Premium quality material","Original manufacturer warranty","Easy 7-day return policy","100% authentic product"];
const SPEC_LABELS  = ["Brand","Model","Category","In Stock","Seller","Country of Origin"];
const SPEC_VALS    = (p) => [p.category||"—",`ECT-${p.id}`,p.category,p.stock>0?`${p.stock} units`:"Out of Stock","Ecart Official Store","India"];

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [qty, setQty]               = useState(1);
  const [adding, setAdding]         = useState(false);
  const [addedMsg, setAddedMsg]     = useState("");
  const [pincode, setPincode]       = useState("");
  const [deliveryMsg, setDelivery]  = useState("");
  const [activeTab, setActiveTab]   = useState("details");
  const [cartCount, setCartCount]   = useState(0);
  const [wishCount, setWishCount]   = useState(0);
  // wishlist state for this product
  const [wishlisted, setWishlisted] = useState(false);
  const [wishing, setWishing]       = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(res.data);
        // check if this product is already wishlisted
        API.get(`/wishlist/check/${id}`)
          .then(r => setWishlisted(r.data.wishlisted))
          .catch(() => {});
      } catch { setError("Product not found."); }
      finally { setLoading(false); }
    };
    load();
    API.get("/cart").then(r => setCartCount(r.data.length)).catch(() => {});
    API.get("/wishlist").then(r => setWishCount(r.data.length)).catch(() => {});
  }, [id]);

  const showMsg = (msg) => { setAddedMsg(msg); setTimeout(() => setAddedMsg(""), 2500); };

  const addToCart = async () => {
    setAdding(true);
    try {
      await API.post("/cart", { productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, quantity: qty });
      setCartCount(c => c + qty);
      showMsg("✓ Added to cart!");
    } catch { showMsg("Failed. Please login."); }
    finally { setAdding(false); }
  };

  const buyNow = async () => {
    setAdding(true);
    try {
      await API.post("/cart", { productId: product.id, title: product.title, price: product.price, image: product.image, category: product.category, quantity: qty });
      navigate("/cart");
    } catch { navigate("/login"); }
    finally { setAdding(false); }
  };

  // ✅ TOGGLE WISHLIST from product detail
  const toggleWishlist = async () => {
    setWishing(true);
    try {
      if (wishlisted) {
        await API.delete(`/wishlist/product/${product.id}`);
        setWishlisted(false);
        setWishCount(c => c - 1);
        showMsg("Removed from wishlist");
      } else {
        await API.post(`/wishlist/${product.id}`);
        setWishlisted(true);
        setWishCount(c => c + 1);
        showMsg("♥ Saved to wishlist!");
      }
    } catch { showMsg("Please login to use wishlist"); }
    finally { setWishing(false); }
  };

  const checkDelivery = () => {
    if (!/^\d{6}$/.test(pincode)) { setDelivery("Enter a valid 6-digit pincode."); return; }
    const days = 3 + (parseInt(pincode) % 4);
    const date = new Date(); date.setDate(date.getDate() + days);
    setDelivery(`✓ Free delivery by ${date.toDateString()}`);
  };

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Poppins,sans-serif", color:"#878787" }}>Loading product...</div>;
  if (error)   return <div style={{ textAlign:"center", padding:"80px 20px", fontFamily:"Poppins,sans-serif" }}><p style={{ color:"#d32f2f", fontSize:"18px" }}>{error}</p><button onClick={() => navigate("/dashboard")} style={{ marginTop:"16px", background:"#2874f0", color:"white", border:"none", padding:"10px 24px", borderRadius:"4px", cursor:"pointer", fontFamily:"Poppins,sans-serif" }}>← Back</button></div>;

  const discount = fakeDiscount(product.id);
  const mrp      = Math.round(product.price * (100 / (100 - discount)));
  const rating   = parseFloat(fakeRating(product.id));
  const reviews  = fakeReviews(product.id);
  const inStock  = product.stock > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }
        .pd-nav { background: #2874f0; padding: 0 24px; height: 56px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); position: sticky; top: 0; z-index: 100; }
        .pd-nav .brand { color: white; font-size: 20px; font-weight: 700; cursor: pointer; }
        .pd-nav .brand span { font-style: italic; font-weight: 300; color: #ffe082; font-size: 10px; display: block; margin-top: -5px; }
        .nav-gap { flex: 1; }
        .pd-nav-btn { background: white; color: #2874f0; border: none; padding: 7px 14px; border-radius: 2px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins',sans-serif; position: relative; }
        .pd-nav-btn:hover { background: #f0f4ff; }
        .nav-badge { background: #ff6161; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; position: absolute; top: -6px; right: -6px; font-weight: 700; }

        .pd-page { max-width: 1100px; margin: 0 auto; padding: 16px; }
        .breadcrumb { font-size: 13px; color: #878787; margin-bottom: 14px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .bc-link { background: none; border: none; color: #2874f0; cursor: pointer; font-size: 13px; font-family: 'Poppins',sans-serif; padding: 0; }

        .pd-layout { display: flex; gap: 16px; align-items: flex-start; }
        .pd-image-col { width: 360px; flex-shrink: 0; background: white; border: 1px solid #f0f0f0; border-radius: 4px; padding: 24px; position: sticky; top: 72px; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .pd-img-wrap { position: relative; }
        .pd-main-img { width: 280px; height: 280px; object-fit: contain; transition: transform 0.3s; }
        .pd-main-img:hover { transform: scale(1.08); }
        .pd-discount-badge { background: #ff6161; color: white; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 50%; position: absolute; top: 8px; left: 8px; }

        .qty-section { display: flex; align-items: center; gap: 14px; }
        .qty-label { font-size: 14px; color: #878787; font-weight: 500; }
        .qty-ctrl { display: flex; align-items: center; }
        .qty-btn { width: 30px; height: 30px; border: 1px solid #c2c2c2; background: white; cursor: pointer; font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; color: #424242; }
        .qty-btn:first-child { border-radius: 4px 0 0 4px; }
        .qty-btn:last-child  { border-radius: 0 4px 4px 0; }
        .qty-num { width: 42px; height: 30px; border: 1px solid #c2c2c2; border-left: none; border-right: none; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 500; background: white; }
        .stock-warn { font-size: 12px; color: #e65100; font-weight: 500; }
        .out-of-stock { font-size: 14px; color: #f44336; font-weight: 600; padding: 10px 0; }

        /* ✅ BUY BUTTONS ROW — now 3 buttons */
        .buy-row { display: flex; gap: 8px; width: 100%; }
        .btn-cart { flex: 1; padding: 12px 0; background: #ff9f00; border: none; border-radius: 4px; color: white; font-size: 13px; font-weight: 700; font-family: 'Poppins',sans-serif; cursor: pointer; transition: opacity 0.2s; }
        .btn-buy  { flex: 1; padding: 12px 0; background: #fb641b; border: none; border-radius: 4px; color: white; font-size: 13px; font-weight: 700; font-family: 'Poppins',sans-serif; cursor: pointer; transition: opacity 0.2s; }
        .btn-cart:hover:not(:disabled), .btn-buy:hover:not(:disabled) { opacity: 0.88; }
        .btn-cart:disabled, .btn-buy:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ✅ WISHLIST HEART BUTTON */
        .btn-wish {
          width: 44px; height: 44px; border-radius: 50%;
          border: 1.5px solid #e0e0e0; background: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; cursor: pointer; flex-shrink: 0;
          transition: border-color 0.2s, transform 0.15s, background 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .btn-wish:hover:not(:disabled) { transform: scale(1.12); border-color: #f44336; }
        .btn-wish.active { border-color: #f44336; background: #fff5f5; }
        .btn-wish:disabled { opacity: 0.5; cursor: not-allowed; }

        .add-toast { font-size: 13px; font-weight: 500; text-align: center; padding: 8px; border-radius: 4px; width: 100%; }
        .add-toast.ok  { background: #e8f5e9; color: #2e7d32; }
        .add-toast.err { background: #ffebee; color: #c62828; }

        .pd-detail-col { flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .pd-info-card { background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 20px 24px; }
        .pd-category { font-size: 11px; color: #878787; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px; }
        .pd-title { font-size: 20px; font-weight: 500; color: #212121; line-height: 1.4; margin-bottom: 10px; }
        .pd-rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .rating-pill { background: #388e3c; color: white; padding: 3px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 5px; }
        .review-count { font-size: 13px; color: #2874f0; }
        .pd-divider { height: 1px; background: #f0f0f0; margin: 14px 0; }
        .pd-price-row { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
        .pd-price { font-size: 28px; font-weight: 700; color: #212121; }
        .pd-mrp { font-size: 16px; color: #878787; text-decoration: line-through; }
        .pd-disc { font-size: 16px; color: #388e3c; font-weight: 600; }
        .pd-offer { font-size: 13px; color: #878787; margin-bottom: 14px; }

        .delivery-section { background: white; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px 20px; }
        .delivery-section h4 { font-size: 14px; font-weight: 600; color: #212121; margin-bottom: 12px; }
        .pin-row { display: flex; gap: 8px; }
        .pin-input { flex: 1; padding: 9px 14px; border: 1px solid #e0e0e0; border-radius: 4px; font-size: 14px; font-family: 'Poppins',sans-serif; outline: none; color: #212121; }
        .pin-input:focus { border-color: #2874f0; }
        .check-btn { background: none; border: none; color: #2874f0; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'Poppins',sans-serif; }
        .delivery-msg { font-size: 13px; margin-top: 10px; }
        .delivery-msg.ok  { color: #2e7d32; }
        .delivery-msg.err { color: #f44336; }
        .delivery-perks { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
        .delivery-perk { font-size: 12px; color: #424242; display: flex; align-items: center; gap: 4px; }

        .tabs-card { background: white; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden; }
        .tab-bar { display: flex; border-bottom: 1px solid #e0e0e0; }
        .tab-btn { flex: 1; padding: 13px 0; background: white; border: none; font-size: 14px; font-family: 'Poppins',sans-serif; color: #878787; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #2874f0; font-weight: 600; border-bottom-color: #2874f0; }
        .tab-content { padding: 20px 24px; }
        .pd-desc { font-size: 14px; color: #424242; line-height: 1.8; }
        .highlight-list { list-style: none; }
        .highlight-list li { font-size: 14px; color: #424242; padding: 7px 0; border-bottom: 1px solid #f9f9f9; display: flex; align-items: flex-start; gap: 10px; }
        .hl-dot { width: 6px; height: 6px; background: #2874f0; border-radius: 50%; flex-shrink: 0; margin-top: 7px; }
        .specs-table { width: 100%; border-collapse: collapse; }
        .specs-table tr:nth-child(even) td { background: #fafafa; }
        .specs-table td { padding: 10px 12px; font-size: 14px; border-bottom: 1px solid #f0f0f0; }
        .specs-table td:first-child { color: #878787; width: 40%; }
        .specs-table td:last-child { color: #212121; font-weight: 500; }
        .overall-rating { display: flex; align-items: center; gap: 20px; padding: 16px 0; border-bottom: 1px solid #f0f0f0; margin-bottom: 16px; }
        .big-rating { font-size: 48px; font-weight: 700; color: #212121; line-height: 1; }
        .rating-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .rating-bar-label { font-size: 12px; color: #878787; width: 32px; text-align: right; }
        .rating-bar-track { flex: 1; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
        .rating-bar-fill { height: 100%; border-radius: 3px; }
        .review-card { padding: 14px 0; border-bottom: 1px solid #f9f9f9; }
        .reviewer-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .reviewer-avatar { width: 32px; height: 32px; border-radius: 50%; background: #e8f0fe; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #2874f0; flex-shrink: 0; }
        .reviewer-name { font-size: 14px; font-weight: 500; color: #212121; }
        .review-date { font-size: 12px; color: #c2c2c2; margin-left: auto; }
        .review-text { font-size: 14px; color: #424242; line-height: 1.6; }

        @media (max-width: 900px) { .pd-layout { flex-direction: column; } .pd-image-col { width: 100%; position: static; } .pd-main-img { width: 220px; height: 220px; } }
      `}</style>

      {/* NAV */}
      <nav className="pd-nav">
        <div className="brand" onClick={() => navigate("/dashboard")}>
          Ecart <span>India's Marketplace</span>
        </div>
        <div className="nav-gap" />
        <button className="pd-nav-btn" onClick={() => navigate("/wishlist")} style={{ position:"relative" }}>
          {wishlisted ? "❤️" : "🤍"} Wishlist
          {wishCount > 0 && <span className="nav-badge">{wishCount}</span>}
        </button>
        <button className="pd-nav-btn" onClick={() => navigate("/cart")} style={{ position:"relative" }}>
          🛒 Cart
          {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
        </button>
        <button className="pd-nav-btn" onClick={() => navigate("/orders")}>📦 Orders</button>
      </nav>

      <div className="pd-page">
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <button className="bc-link" onClick={() => navigate("/dashboard")}>Home</button>
          <span>›</span>
          <button className="bc-link" onClick={() => navigate("/dashboard")}>{product.category}</button>
          <span>›</span>
          <span style={{ color:"#212121" }}>{product.title.length > 45 ? product.title.slice(0,45)+"…" : product.title}</span>
        </div>

        <div className="pd-layout">
          {/* IMAGE COL */}
          <div className="pd-image-col">
            <div className="pd-img-wrap">
              <img className="pd-main-img" src={product.image || "https://via.placeholder.com/280"} alt={product.title} />
              <span className="pd-discount-badge">{discount}% OFF</span>
            </div>

            {inStock ? (
              <>
                <div className="qty-section">
                  <span className="qty-label">Qty:</span>
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
                    <div className="qty-num">{qty}</div>
                    <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q+1))}>+</button>
                  </div>
                  {product.stock <= 5 && <span className="stock-warn">Only {product.stock} left!</span>}
                </div>

                {/* ✅ 3 BUTTONS: Add to Cart | Buy Now | ♥ Wishlist */}
                <div className="buy-row">
                  <button className="btn-cart" onClick={addToCart} disabled={adding}>
                    🛒 {adding ? "Adding…" : "Add to Cart"}
                  </button>
                  <button className="btn-buy" onClick={buyNow} disabled={adding}>
                    ⚡ Buy Now
                  </button>
                  <button
                    className={`btn-wish ${wishlisted ? "active" : ""}`}
                    onClick={toggleWishlist}
                    disabled={wishing}
                    title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  >
                    {wishlisted ? "❤️" : "🤍"}
                  </button>
                </div>
              </>
            ) : (
              <div className="out-of-stock">Currently Out of Stock</div>
            )}

            {addedMsg && (
              <div className={`add-toast ${addedMsg.startsWith("✓") || addedMsg.startsWith("♥") ? "ok" : "err"}`}>
                {addedMsg}
              </div>
            )}
          </div>

          {/* DETAIL COL */}
          <div className="pd-detail-col">
            <div className="pd-info-card">
              <div className="pd-category">{product.category}</div>
              <h1 className="pd-title">{product.title}</h1>
              <div className="pd-rating-row">
                <div className="rating-pill">{fakeRating(product.id)} <Stars rating={rating} /></div>
                <span className="review-count">{reviews.toLocaleString("en-IN")} ratings &amp; reviews</span>
                {inStock
                  ? <span style={{ fontSize:"13px", color:"#388e3c", fontWeight:600 }}>✓ In Stock</span>
                  : <span style={{ fontSize:"13px", color:"#f44336", fontWeight:600 }}>Out of Stock</span>
                }
              </div>
              <div className="pd-divider" />
              <div className="pd-price-row">
                <span className="pd-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
                <span className="pd-mrp">₹{mrp.toLocaleString("en-IN")}</span>
                <span className="pd-disc">{discount}% off</span>
              </div>
              <p className="pd-offer">+ No Cost EMI available · Bank offers applicable</p>
            </div>

            {/* DELIVERY */}
            <div className="delivery-section">
              <h4>Check Delivery</h4>
              <div className="pin-row">
                <input className="pin-input" type="text" placeholder="Enter 6-digit pincode" maxLength={6}
                  value={pincode} onChange={e => { setPincode(e.target.value.replace(/\D/g,"")); setDelivery(""); }}
                  onKeyDown={e => e.key==="Enter" && checkDelivery()} />
                <button className="check-btn" onClick={checkDelivery}>Check</button>
              </div>
              {deliveryMsg && <p className={`delivery-msg ${deliveryMsg.startsWith("✓") ? "ok" : "err"}`}>{deliveryMsg}</p>}
              <div className="delivery-perks">
                <span className="delivery-perk">🚚 Free Delivery</span>
                <span className="delivery-perk">↩ 7-Day Returns</span>
                <span className="delivery-perk">✓ Authentic</span>
                <span className="delivery-perk">💳 EMI Available</span>
              </div>
            </div>

            {/* TABS */}
            <div className="tabs-card">
              <div className="tab-bar">
                {["details","highlights","specs","reviews"].map(tab => (
                  <button key={tab} className={`tab-btn ${activeTab===tab?"active":""}`} onClick={() => setActiveTab(tab)}>
                    {tab.charAt(0).toUpperCase()+tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="tab-content">
                {activeTab==="details" && (
                  <p className="pd-desc">{product.description || `The ${product.title} is a premium product from the ${product.category} category, crafted for quality and performance. Backed by our 7-day hassle-free return policy.`}</p>
                )}
                {activeTab==="highlights" && (
                  <ul className="highlight-list">
                    {[...HIGHLIGHTS,`Category: ${product.category}`,`Stock: ${product.stock} units`,`Save ₹${(mrp-product.price).toLocaleString("en-IN")} (${discount}% off)`].map((h,i) => (
                      <li key={i}><div className="hl-dot" />{h}</li>
                    ))}
                  </ul>
                )}
                {activeTab==="specs" && (
                  <table className="specs-table"><tbody>
                    {SPEC_LABELS.map((l,i) => <tr key={l}><td>{l}</td><td>{SPEC_VALS(product)[i]}</td></tr>)}
                  </tbody></table>
                )}
                {activeTab==="reviews" && (
                  <div>
                    <div className="overall-rating">
                      <div className="big-rating">{fakeRating(product.id)}</div>
                      <div style={{ flex:1 }}>
                        <Stars rating={rating} />
                        <p style={{ fontSize:"13px", color:"#878787", marginTop:"4px" }}>{reviews.toLocaleString("en-IN")} verified ratings</p>
                        <div style={{ marginTop:"10px" }}>
                          {[5,4,3,2,1].map(s => {
                            const pct = s===5?55:s===4?25:s===3?11:s===2?5:4;
                            return (
                              <div className="rating-bar-row" key={s}>
                                <span className="rating-bar-label">{s} ★</span>
                                <div className="rating-bar-track"><div className="rating-bar-fill" style={{ width:`${pct}%`, background:s>=4?"#388e3c":s===3?"#ff9f00":"#f44336" }} /></div>
                                <span style={{ fontSize:"12px", color:"#878787", width:"32px" }}>{pct}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {[
                      { name:"Riya S.",  stars:5, text:"Absolutely love this! Exactly as described and delivered fast.", date:"3 days ago" },
                      { name:"Kiran M.", stars:4, text:"Good product overall. Packaging was intact, delivery on time.", date:"1 week ago" },
                      { name:"Anand P.", stars:5, text:"Amazing quality! Looks even better in person. Very satisfied.", date:"2 weeks ago" },
                    ].map((r,i) => (
                      <div className="review-card" key={i}>
                        <div className="reviewer-row">
                          <div className="reviewer-avatar">{r.name[0]}</div>
                          <span className="reviewer-name">{r.name}</span>
                          <Stars rating={r.stars} />
                          <span className="review-date">{r.date}</span>
                        </div>
                        <p className="review-text">{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductDetail;

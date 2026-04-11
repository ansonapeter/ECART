import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Wishlist() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [movingId, setMovingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);
  const [toast, setToast]       = useState({ msg: "", type: "ok" });
  const navigate = useNavigate();

  useEffect(() => { fetchWishlist(); }, []);

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/wishlist");
      setItems(res.data);
    } catch {
      showToast("Failed to load wishlist", "err");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 2500);
  };

  const removeItem = async (id) => {
    setRemovingId(id);
    try {
      await API.delete(`/wishlist/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast("Removed from wishlist");
    } catch {
      showToast("Failed to remove", "err");
    } finally {
      setRemovingId(null);
    }
  };

  const moveToCart = async (id) => {
    setMovingId(id);
    try {
      await API.post(`/wishlist/${id}/move-to-cart`);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast("✓ Moved to cart!");
    } catch {
      showToast("Failed to move to cart", "err");
    } finally {
      setMovingId(null);
    }
  };

  const addAllToCart = async () => {
    if (items.length === 0) return;
    try {
      for (const item of items) {
        await API.post(`/wishlist/${item.id}/move-to-cart`);
      }
      setItems([]);
      showToast(`✓ All ${items.length} items moved to cart!`);
    } catch {
      showToast("Some items failed to move", "err");
      fetchWishlist();
    }
  };

  const fakeDiscount = (id) => 10 + (id % 4) * 5;
  const fakeMrp = (price, id) => Math.round(price * (100 / (100 - fakeDiscount(id))));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; background: #f1f3f6; }

        /* NAV */
        .wl-nav {
          background: #2874f0; padding: 0 24px; height: 56px;
          display: flex; align-items: center; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          position: sticky; top: 0; z-index: 100;
        }
        .wl-nav .brand { color: white; font-size: 20px; font-weight: 700; cursor: pointer; }
        .wl-nav .brand span { font-style: italic; font-weight: 300; color: #ffe082; font-size: 10px; display: block; margin-top: -5px; }
        .wl-nav h2 { color: white; font-size: 18px; font-weight: 500; }
        .wl-nav .back-btn { margin-left: auto; background: transparent; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.4); padding: 7px 16px; border-radius: 2px; cursor: pointer; font-size: 13px; font-family: 'Poppins', sans-serif; }

        /* PAGE */
        .wl-page { max-width: 1000px; margin: 0 auto; padding: 20px 16px; }

        /* HEADER ROW */
        .wl-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
        .wl-header h3 { font-size: 17px; font-weight: 600; color: #212121; }
        .wl-header span { font-size: 14px; color: #878787; }
        .add-all-btn {
          background: #2874f0; color: white; border: none;
          padding: 9px 20px; border-radius: 2px; font-size: 13px;
          font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif;
          transition: opacity 0.2s;
        }
        .add-all-btn:hover { opacity: 0.9; }
        .add-all-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* GRID */
        .wl-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 14px;
        }

        /* ITEM CARD */
        .wl-card {
          background: white; border-radius: 4px; border: 1px solid #e0e0e0;
          overflow: hidden; display: flex; flex-direction: column;
          transition: box-shadow 0.2s, transform 0.2s; cursor: pointer;
        }
        .wl-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }

        .wl-img-wrap {
          padding: 20px; height: 180px;
          display: flex; align-items: center; justify-content: center;
          background: white; position: relative;
        }
        .wl-img-wrap img { max-height: 140px; max-width: 100%; object-fit: contain; }

        /* Heart remove button */
        .heart-btn {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%;
          background: white; border: 1px solid #e0e0e0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: transform 0.15s, border-color 0.15s;
          z-index: 2;
        }
        .heart-btn:hover { transform: scale(1.15); border-color: #f44336; }
        .heart-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .wl-info { padding: 12px 14px 14px; flex: 1; display: flex; flex-direction: column; }
        .wl-cat { font-size: 11px; color: #878787; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .wl-title { font-size: 13px; color: #212121; font-weight: 500; line-height: 1.4; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .wl-price-row { display: flex; align-items: baseline; gap: 6px; margin: 8px 0 12px; }
        .wl-price { font-size: 17px; font-weight: 700; color: #212121; }
        .wl-mrp { font-size: 12px; color: #878787; text-decoration: line-through; }
        .wl-off { font-size: 12px; color: #388e3c; font-weight: 600; }

        /* Action buttons */
        .wl-actions { display: flex; gap: 8px; }
        .move-cart-btn {
          flex: 1; padding: 9px 0; background: #ff9f00; color: white;
          border: none; border-radius: 2px; font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Poppins', sans-serif; transition: opacity 0.2s;
        }
        .move-cart-btn:hover:not(:disabled) { opacity: 0.88; }
        .move-cart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .remove-btn {
          padding: 9px 12px; background: white; color: #878787;
          border: 1px solid #e0e0e0; border-radius: 2px; font-size: 13px;
          cursor: pointer; font-family: 'Poppins', sans-serif; transition: all 0.2s;
        }
        .remove-btn:hover:not(:disabled) { color: #f44336; border-color: #f44336; background: #fff5f5; }
        .remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* EMPTY */
        .wl-empty {
          text-align: center; padding: 80px 20px;
          background: white; border-radius: 4px; border: 1px solid #e0e0e0;
        }
        .wl-empty .icon { font-size: 72px; margin-bottom: 18px; }
        .wl-empty h3 { font-size: 20px; font-weight: 500; color: #212121; margin-bottom: 8px; }
        .wl-empty p { font-size: 14px; color: #878787; margin-bottom: 24px; line-height: 1.6; }
        .shop-btn { background: #2874f0; color: white; border: none; padding: 12px 28px; border-radius: 2px; font-size: 15px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; }

        /* SKELETON */
        .sk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .sk-card { background: white; border-radius: 4px; height: 300px; overflow: hidden; }
        .sk { background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:sh 1.4s infinite; }
        .sk-img { height: 180px; }
        .sk-line { height: 11px; border-radius: 4px; margin: 14px 14px 6px; }
        .sk-line.s { width: 55%; }
        @keyframes sh { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        /* TOAST */
        .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); padding: 12px 24px; border-radius: 4px; font-size: 14px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 9999; animation: up 0.3s ease; white-space: nowrap; }
        .toast.ok  { background: #212121; color: white; }
        .toast.err { background: #d32f2f; color: white; }
        @keyframes up { from{transform:translate(-50%,16px);opacity:0} to{transform:translate(-50%,0);opacity:1} }
      `}</style>

      {/* NAV */}
      <nav className="wl-nav">
        <div className="brand" onClick={() => navigate("/dashboard")}>
          Ecart <span>India's Marketplace</span>
        </div>
        <h2>♡ My Wishlist</h2>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Shop More</button>
      </nav>

      <div className="wl-page">

        {loading ? (
          <div className="sk-grid">
            {[1,2,3,4].map(i => (
              <div className="sk-card" key={i}>
                <div className="sk sk-img" />
                <div className="sk sk-line" />
                <div className="sk sk-line s" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="wl-empty">
            <div className="icon">🤍</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love by clicking the heart icon on any product.<br />They'll be right here when you're ready to buy.</p>
            <button className="shop-btn" onClick={() => navigate("/dashboard")}>
              Explore Products
            </button>
          </div>
        ) : (
          <>
            <div className="wl-header">
              <div>
                <h3>My Wishlist</h3>
                <span>{items.length} item{items.length !== 1 ? "s" : ""} saved</span>
              </div>
              <button className="add-all-btn" onClick={addAllToCart}>
                🛒 Move All to Cart
              </button>
            </div>

            <div className="wl-grid">
              {items.map(item => {
                const disc = fakeDiscount(item.productId);
                const mrp  = fakeMrp(item.price, item.productId);
                return (
                  <div
                    className="wl-card"
                    key={item.id}
                    onClick={() => navigate(`/product/${item.productId}`)}
                  >
                    <div className="wl-img-wrap">
                      <img src={item.image || "https://via.placeholder.com/140"} alt={item.title} />
                      {/* Heart remove — stopPropagation so card click doesn't fire */}
                      <button
                        className="heart-btn"
                        title="Remove from wishlist"
                        disabled={removingId === item.id}
                        onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                      >
                        ❤️
                      </button>
                    </div>

                    <div className="wl-info">
                      <div className="wl-cat">{item.category}</div>
                      <div className="wl-title">{item.title}</div>
                      <div className="wl-price-row">
                        <span className="wl-price">₹{Number(item.price).toLocaleString("en-IN")}</span>
                        <span className="wl-mrp">₹{mrp.toLocaleString("en-IN")}</span>
                        <span className="wl-off">{disc}% off</span>
                      </div>
                      <div className="wl-actions" onClick={e => e.stopPropagation()}>
                        <button
                          className="move-cart-btn"
                          disabled={movingId === item.id}
                          onClick={() => moveToCart(item.id)}
                        >
                          {movingId === item.id ? "Moving..." : "🛒 Move to Cart"}
                        </button>
                        <button
                          className="remove-btn"
                          disabled={removingId === item.id}
                          onClick={() => removeItem(item.id)}
                          title="Remove"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {toast.msg && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

export default Wishlist;

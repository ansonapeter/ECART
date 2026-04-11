import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [products, setProducts]       = useState([]);
  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("");
  const [sort, setSort]               = useState("");
  const [priceRange, setPriceRange]   = useState(200000);
  const [loading, setLoading]         = useState(true);
  const [addingId, setAddingId]       = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set()); // productIds in wishlist
  const [wishingId, setWishingId]     = useState(null);
  const [cartCount, setCartCount]     = useState(0);
  const [wishCount, setWishCount]     = useState(0);
  const [toast, setToast]             = useState("");
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "";
  const firstName = userEmail.split("@")[0] || "User";

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }, []);

  useEffect(() => {
    // fetch products (public)
    axios.get("http://localhost:8080/api/products")
      .then(r => setProducts(r.data))
      .finally(() => setLoading(false));

    // fetch cart count
    API.get("/cart")
      .then(r => setCartCount(r.data.length))
      .catch(() => {});

    // fetch wishlist so we can show filled hearts
    API.get("/wishlist")
      .then(r => {
        setWishlistIds(new Set(r.data.map(i => i.productId)));
        setWishCount(r.data.length);
      })
      .catch(() => {});
  }, []);

  // ADD TO CART
  const addToCart = async (e, product) => {
    e.stopPropagation();
    setAddingId(product.id);
    try {
      await API.post("/cart", {
        productId: product.id,
        title:     product.title,
        price:     product.price,
        image:     product.image || product.thumbnail,
        category:  product.category,
        quantity:  1,
      });
      setCartCount(c => c + 1);
      showToast("✓ Added to cart!");
    } catch {
      showToast("Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  // TOGGLE WISHLIST
  const toggleWishlist = async (e, product) => {
    e.stopPropagation();
    setWishingId(product.id);
    try {
      if (wishlistIds.has(product.id)) {
        // remove
        await API.delete(`/wishlist/product/${product.id}`);
        setWishlistIds(prev => { const n = new Set(prev); n.delete(product.id); return n; });
        setWishCount(c => c - 1);
        showToast("Removed from wishlist");
      } else {
        // add
        await API.post(`/wishlist/${product.id}`);
        setWishlistIds(prev => new Set([...prev, product.id]));
        setWishCount(c => c + 1);
        showToast("♥ Added to wishlist!");
      }
    } catch {
      showToast("Please login to use wishlist");
    } finally {
      setWishingId(null);
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const fakeRating   = (id) => (3.8 + (id % 12) * 0.1).toFixed(1);

  let filtered = products.filter(p =>
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
     p.category.toLowerCase().includes(search.toLowerCase())) &&
    (category ? p.category === category : true) &&
    p.price <= priceRange
  );
  if (sort === "low")  filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.title.localeCompare(b.title));

  const categories = [...new Set(products.map(p => p.category))].sort();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Poppins', sans-serif; }

        .nav {
          position: sticky; top: 0; z-index: 100; background: #2874f0;
          display: flex; align-items: center; padding: 0 24px; height: 56px; gap: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .nav-brand { color: white; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; cursor: pointer; }
        .nav-brand span { font-style: italic; font-size: 10px; font-weight: 300; color: #ffe082; display: block; margin-top: -6px; }
        .search-wrap { flex: 1; max-width: 560px; display: flex; align-items: center; background: white; border-radius: 2px; overflow: hidden; }
        .search-wrap input { flex: 1; padding: 10px 16px; border: none; font-size: 14px; font-family: 'Poppins', sans-serif; outline: none; color: #212121; }
        .search-btn { background: #ffe569; border: none; padding: 10px 16px; cursor: pointer; font-size: 16px; color: #2874f0; font-weight: 600; }
        .nav-right { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .nav-btn { background: white; color: #2874f0; border: none; padding: 7px 14px; border-radius: 2px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; display: flex; align-items: center; gap: 6px; position: relative; }
        .nav-btn:hover { background: #f0f4ff; }
        .badge { background: #ff6161; color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 10px; display: flex; align-items: center; justify-content: center; position: absolute; top: -6px; right: -6px; font-weight: 700; }
        .nav-user { color: white; font-size: 13px; white-space: nowrap; }
        .nav-logout { background: transparent; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.4); padding: 6px 12px; border-radius: 2px; font-size: 12px; cursor: pointer; font-family: 'Poppins', sans-serif; }
        .nav-logout:hover { color: white; background: rgba(255,255,255,0.1); }

        .page-body { display: flex; background: #f1f3f6; min-height: calc(100vh - 56px); }

        .sidebar { width: 240px; min-width: 240px; background: white; border-right: 1px solid #e0e0e0; position: sticky; top: 56px; height: calc(100vh - 56px); overflow-y: auto; }
        .sidebar-section { padding: 16px 20px; border-bottom: 1px solid #f0f0f0; }
        .sidebar-title { font-size: 13px; font-weight: 700; color: #212121; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; }
        .cat-item { display: flex; align-items: center; gap: 8px; padding: 7px 0; }
        .cat-item input[type="radio"] { accent-color: #2874f0; width: 14px; height: 14px; }
        .cat-item label { font-size: 13px; color: #424242; cursor: pointer; text-transform: capitalize; }
        .cat-item input:checked + label { color: #2874f0; font-weight: 500; }
        .clear-btn { font-size: 12px; color: #2874f0; background: none; border: none; cursor: pointer; font-family: 'Poppins', sans-serif; font-weight: 500; margin-top: 8px; }
        .price-range-val { font-size: 13px; color: #212121; font-weight: 500; margin-top: 8px; }
        input[type="range"] { width: 100%; accent-color: #2874f0; margin-top: 6px; }

        .main-area { flex: 1; padding: 16px; }
        .toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 10px; }
        .result-count { font-size: 14px; color: #878787; }
        .result-count strong { color: #212121; }
        .sort-select { padding: 8px 14px; border: 1px solid #e0e0e0; border-radius: 2px; font-size: 13px; font-family: 'Poppins', sans-serif; background: white; color: #212121; outline: none; cursor: pointer; }

        /* PRODUCT CARD */
        .product-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
        .product-card {
          background: white; border-radius: 4px; overflow: hidden; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s; border: 1px solid #f0f0f0;
          display: flex; flex-direction: column;
        }
        .product-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-3px); }
        .product-img-wrap {
          padding: 20px; background: white; display: flex; align-items: center;
          justify-content: center; height: 180px; position: relative;
        }
        .product-img-wrap img { max-width: 100%; max-height: 140px; object-fit: contain; }

        /* HEART BUTTON — sits top-right of image */
        .heart-btn {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%;
          background: white; border: 1px solid #e0e0e0;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
          transition: transform 0.15s, border-color 0.15s;
          z-index: 2; line-height: 1;
        }
        .heart-btn:hover { transform: scale(1.18); border-color: #f44336; }
        .heart-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .heart-btn.wishlisted { border-color: #f44336; background: #fff5f5; }

        .product-info { padding: 12px 16px 16px; flex: 1; display: flex; flex-direction: column; }
        .product-category { font-size: 11px; color: #878787; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .product-title { font-size: 13px; color: #212121; font-weight: 500; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
        .product-rating { font-size: 12px; background: #388e3c; color: white; padding: 2px 7px; border-radius: 12px; display: inline-flex; align-items: center; gap: 3px; margin-bottom: 8px; width: fit-content; }
        .product-price { font-size: 17px; font-weight: 600; color: #212121; margin: 6px 0 10px; }
        .product-price small { font-size: 11px; color: #878787; font-weight: 400; }
        .add-cart-btn { width: 100%; padding: 9px 0; border: none; border-radius: 2px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Poppins', sans-serif; transition: background 0.2s; }
        .add-cart-btn.idle { background: #ff9f00; color: white; }
        .add-cart-btn.idle:hover { background: #e67e00; }
        .add-cart-btn.busy { background: #f0f0f0; color: #878787; cursor: not-allowed; }

        /* EMPTY */
        .empty-state { text-align: center; padding: 80px 20px; color: #878787; }
        .empty-state .icon { font-size: 60px; margin-bottom: 16px; }
        .empty-state h3 { font-size: 18px; color: #424242; margin-bottom: 8px; }

        /* SKELETON */
        .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
        .skeleton-card { background: white; border-radius: 4px; overflow: hidden; height: 300px; }
        .skeleton-img  { height: 180px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:shimmer 1.4s infinite; }
        .skeleton-line { height: 12px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200%; animation:shimmer 1.4s infinite; border-radius:4px; margin: 14px 16px 6px; }
        .skeleton-line.short { width: 60%; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

        /* TOAST */
        .toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #212121; color: white; padding: 12px 24px; border-radius: 4px; font-size: 14px; font-family: 'Poppins', sans-serif; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 9999; animation: slideUp 0.3s ease; white-space: nowrap; }
        @keyframes slideUp { from{transform:translate(-50%,20px);opacity:0} to{transform:translate(-50%,0);opacity:1} }

        @media (max-width: 768px) { .sidebar { display: none; } .nav-user { display: none; } }
      `}</style>

      {/* NAVBAR */}
      <nav className="nav">
        <div className="nav-brand" onClick={() => navigate("/dashboard")}>
          Ecart <span>India's Marketplace</span>
        </div>
        <div className="search-wrap">
          <input
            placeholder="Search for products, brands and more"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn">🔍</button>
        </div>
        <div className="nav-right">
          <span className="nav-user">Hi, {firstName} 👋</span>

          {/* WISHLIST NAV BUTTON */}
          <button className="nav-btn" onClick={() => navigate("/wishlist")}>
            {wishCount > 0 ? "❤️" : "🤍"} Wishlist
            {wishCount > 0 && <span className="badge">{wishCount}</span>}
          </button>

          <button className="nav-btn" onClick={() => navigate("/cart")}>
            🛒 Cart
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
          <button className="nav-btn" onClick={() => navigate("/orders")}>📦 Orders</button>
          <button className="nav-logout" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="page-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Filters</div>
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Category</div>
            {categories.map(cat => (
              <div className="cat-item" key={cat}>
                <input type="radio" id={`cat-${cat}`} name="category" checked={category === cat} onChange={() => setCategory(cat)} />
                <label htmlFor={`cat-${cat}`}>{cat}</label>
              </div>
            ))}
            {category && <button className="clear-btn" onClick={() => setCategory("")}>✕ Clear</button>}
          </div>
          <div className="sidebar-section">
            <div className="sidebar-title">Price Range</div>
            <input type="range" min="0" max="200000" value={priceRange} onChange={e => setPriceRange(Number(e.target.value))} />
            <div className="price-range-val">Up to ₹{priceRange.toLocaleString("en-IN")}</div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main-area">
          <div className="toolbar">
            <span className="result-count">Showing <strong>{filtered.length}</strong> results{category && ` in "${category}"`}</span>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="">Sort by: Relevance</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {loading ? (
            <div className="skeleton-grid">
              {Array(8).fill(0).map((_, i) => (
                <div className="skeleton-card" key={i}>
                  <div className="skeleton-img" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map(p => (
                <div
                  className="product-card"
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  title="Click to view product details"
                >
                  <div className="product-img-wrap">
                    <img src={p.image || p.thumbnail} alt={p.title} />

                    {/* ✅ HEART WISHLIST BUTTON */}
                    <button
                      className={`heart-btn ${wishlistIds.has(p.id) ? "wishlisted" : ""}`}
                      title={wishlistIds.has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
                      disabled={wishingId === p.id}
                      onClick={e => toggleWishlist(e, p)}
                    >
                      {wishlistIds.has(p.id) ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <div className="product-info">
                    <div className="product-category">{p.category}</div>
                    <div className="product-title">{p.title}</div>
                    <div className="product-rating">★ {fakeRating(p.id)}</div>
                    <div className="product-price">
                      ₹{Number(p.price).toLocaleString("en-IN")}
                      <small>&nbsp; Free Delivery</small>
                    </div>
                    <button
                      className={`add-cart-btn ${addingId === p.id ? "busy" : "idle"}`}
                      onClick={e => addToCart(e, p)}
                      disabled={addingId === p.id}
                    >
                      {addingId === p.id ? "Adding..." : "Add to Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

export default Dashboard;

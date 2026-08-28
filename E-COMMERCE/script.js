/**
 * ModernShop - Real-Time Reactive E-Commerce Application
 * Features: BroadcastChannel cross-tab synchronization, live inventory tracking,
 * real-time checkout & order progression, interactive stepper, promo codes,
 * and upgraded Store Operations Admin Hub.
 */

// =========================================================
// 1. Initial Product Catalog & State Store
// =========================================================
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Sony WH-1000XM5 Wireless Headphones",
        price: 349.99,
        category: "electronics",
        stock: 12,
        tag: "Hot Deal",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80",
        desc: "Industry-leading noise cancellation with two processors and eight microphones. Ultra-comfortable lightweight design with soft fit leather and 30-hour battery life."
    },
    {
        id: 2,
        name: "Apple Watch Series 9 GPS + Cellular",
        price: 429.00,
        category: "electronics",
        stock: 5,
        tag: "Best Seller",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80",
        desc: "Powerful S9 SiP chip with innovative double-tap gesture. Advanced health sensors, ECG tracking, temperature sensing, and crash detection."
    },
    {
        id: 3,
        name: "Vintage Distressed Denim Jacket",
        price: 89.50,
        category: "clothing",
        stock: 18,
        tag: "Trending",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=700&q=80",
        desc: "Crafted from 100% sustainable organic denim. Classic relaxed fit with antique brass hardware and dual chest flap pockets."
    },
    {
        id: 4,
        name: "Artisan Full-Grain Leather Backpack",
        price: 159.00,
        category: "accessories",
        stock: 4,
        tag: "Limited Stock",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80",
        desc: "Hand-stitched premium Colombian full-grain leather. Dedicated padded 16-inch laptop compartment with water-resistant brass zippers."
    },
    {
        id: 5,
        name: "Nike ZoomX Ultralight Running Sneakers",
        price: 175.00,
        category: "clothing",
        stock: 9,
        tag: "New Drop",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80",
        desc: "Engineered responsive ZoomX foam cushioning with breathable Flyknit upper. Optimal energy return for marathon or daily training."
    },
    {
        id: 6,
        name: "Keychron Q3 Pro Wireless Custom Keyboard",
        price: 199.99,
        category: "electronics",
        stock: 7,
        tag: "Featured",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=700&q=80",
        desc: "Full CNC machined aluminum body, hot-swappable mechanical switches, south-facing RGB, and QMK/VIA programmable macro knob."
    },
    {
        id: 7,
        name: "Classic Polarized Aviator Sunglasses",
        price: 75.00,
        category: "accessories",
        stock: 22,
        tag: "Summer Pick",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=700&q=80",
        desc: "100% UV400 protective polarized lenses with lightweight titanium frame. Glare-reducing coating for crystal clear driving and beach views."
    },
    {
        id: 8,
        name: "Bang & Olufsen Portable Studio Speaker",
        price: 249.00,
        category: "electronics",
        stock: 3,
        tag: "Hot Deal",
        rating: null,
        reviewsCount: 0,
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=700&q=80",
        desc: "Waterproof IP67 construction with True360 omnidirectional sound, integrated voice control, and up to 18 hours of continuous playtime."
    }
];

let productReviews = [];

function loadReviewsFromStorage() {
    const raw = localStorage.getItem("modernshop_product_reviews");
    if (!raw) {
        productReviews = [];
    } else {
        try {
            productReviews = JSON.parse(raw);
            if (Array.isArray(productReviews)) {
                // Filter out any mock seeded reviews
                productReviews = productReviews.filter(r => r.id && !r.id.startsWith("rev_seed_"));
                saveReviewsToStorage(false);
            } else {
                productReviews = [];
            }
        } catch (e) {
            productReviews = [];
        }
    }
}

function saveReviewsToStorage(shouldBroadcast = true) {
    localStorage.setItem("modernshop_product_reviews", JSON.stringify(productReviews));
    if (shouldBroadcast && typeof syncStore !== "undefined") {
        syncStore.broadcast("REVIEWS_UPDATED");
    }
}

const TRACKING_STEPS = ["placed", "processing", "shipped", "delivery", "delivered"];

// Flash Sale State & Real-Time Sync Store
const DEFAULT_FLASH_SALE = {
    isActive: true,
    title: "MID-SEASON MEGA FLASH SALE",
    discountPercent: 25,
    endsAt: Date.now() + 3 * 3600 * 1000 + 45 * 60 * 1000,
    durationHours: 3,
    productIds: [1, 2, 3, 5, 8],
    promoCode: "SAVE20"
};

let flashSaleConfig = { ...DEFAULT_FLASH_SALE };

function loadFlashSaleFromStorage() {
    const raw = localStorage.getItem("modernshop_flash_sale");
    if (raw) {
        try {
            flashSaleConfig = JSON.parse(raw);
        } catch (e) {
            flashSaleConfig = { ...DEFAULT_FLASH_SALE };
        }
    } else {
        flashSaleConfig = { ...DEFAULT_FLASH_SALE };
    }
}

function saveFlashSaleToStorage(shouldBroadcast = true) {
    localStorage.setItem("modernshop_flash_sale", JSON.stringify(flashSaleConfig));
    if (shouldBroadcast && typeof syncStore !== "undefined") {
        syncStore.broadcast("FLASH_SALE_UPDATED", flashSaleConfig);
    }
}

function isProductOnSale(productId) {
    if (!flashSaleConfig || !flashSaleConfig.isActive) return false;
    if (flashSaleConfig.endsAt && Date.now() > flashSaleConfig.endsAt) return false;
    if (!flashSaleConfig.productIds || flashSaleConfig.productIds.length === 0) return true;
    return flashSaleConfig.productIds.includes(Number(productId));
}

function getProductEffectivePrice(product) {
    if (!product) return { originalPrice: 0, effectivePrice: 0, isOnSale: false, discountPercent: 0 };
    const orig = parseFloat(product.price) || 0;
    if (isProductOnSale(product.id)) {
        const disc = Number(flashSaleConfig.discountPercent) || 20;
        const discounted = orig * (1 - disc / 100);
        return {
            originalPrice: orig,
            effectivePrice: Math.round(discounted * 100) / 100,
            isOnSale: true,
            discountPercent: disc
        };
    }
    return {
        originalPrice: orig,
        effectivePrice: orig,
        isOnSale: false,
        discountPercent: 0
    };
}

// Coupons database
const COUPONS = {
    "SAVE20": { type: "percent", value: 0.20, label: "20% OFF" },
    "FREESHIP": { type: "shipping", value: 0, label: "FREE SHIPPING" },
    "FIRST10": { type: "flat", value: 10.00, label: "$10 FLAT OFF" }
};

// =========================================================
// 2. Storage & Cross-Tab Real-Time Sync Engine
// =========================================================
class RealTimeSyncStore {
    constructor() {
        this.channelName = "modernshop_realtime_sync";
        this.channel = null;
        try {
            if (typeof BroadcastChannel !== "undefined") {
                this.channel = new BroadcastChannel(this.channelName);
                this.channel.onmessage = (event) => this.handleIncomingBroadcast(event.data);
            }
        } catch (e) {
            console.warn("BroadcastChannel not supported or restricted, falling back to storage listener", e);
        }

        // Also listen for storage event as a cross-tab fallback
        window.addEventListener("storage", (e) => {
            if (e.key === "modernshop_products") {
                this.onProductsUpdated();
            } else if (e.key === "modernshop_orders") {
                this.onOrdersUpdated();
            } else if (e.key === "modernshop_product_reviews") {
                this.onReviewsUpdated();
            } else if (e.key === "modernshop_flash_sale") {
                this.onFlashSaleUpdated();
            } else if (e.key === "modernshop_live_shoppers") {
                updateLiveShoppersDisplay();
            }
        });
    }

    broadcast(type, payload = {}) {
        const message = { type, payload, timestamp: Date.now() };
        if (this.channel) {
            try {
                this.channel.postMessage(message);
            } catch (err) {
                console.error("Broadcast failed", err);
            }
        }
    }

    handleIncomingBroadcast(data) {
        if (!data || !data.type) return;
        switch (data.type) {
            case "SHOPPER_PRESENCE_UPDATE":
                updateLiveShoppersDisplay(data.payload ? data.payload.count : null);
                break;
            case "REVIEWS_UPDATED":
                this.onReviewsUpdated();
                break;
            case "FLASH_SALE_UPDATED":
                this.onFlashSaleUpdated(data.payload);
                break;
            case "PRODUCT_UPDATED":
            case "PRODUCT_ADDED":
            case "PRODUCT_DELETED":
                this.onProductsUpdated();
                showToast("📦 Catalog updated in real-time across tabs");
                break;
            case "STOCK_DECREMENTED":
                this.onProductsUpdated();
                break;
            case "ORDER_CREATED":
                this.onOrdersUpdated();
                if (isAdminLoggedIn()) {
                    showToast(`🛍️ New live order #${data.payload.orderId} placed!`);
                }
                break;
            case "ORDER_STATUS_CHANGED":
                this.onOrdersUpdated();
                if (currentTrackingOrder && currentTrackingOrder.id === data.payload.orderId) {
                    loadOrderIntoTracker(data.payload.orderId);
                    showToast(`🚚 Order #${data.payload.orderId} status: ${data.payload.newStatus}`);
                }
                break;
        }
    }

    onFlashSaleUpdated(payload = null) {
        loadFlashSaleFromStorage();
        renderProducts(currentFilter, currentSearchQuery, currentSort);
        updateFlashBanner();
        if (isAdminLoggedIn()) {
            renderAdminSalesTab();
        }
        if (payload && payload.isActive) {
            showToast(`⚡ FLASH SALE LIVE: "${payload.title}" (${payload.discountPercent}% OFF)!`);
        }
    }

    onReviewsUpdated() {
        loadReviewsFromStorage();
        renderProducts(currentFilter, currentSearchQuery, currentSort);
        updateStockStats();
        if (activeDetailProductId) {
            viewProduct(activeDetailProductId, false);
        }
    }

    onProductsUpdated() {
        loadProductsFromStorage();
        renderProducts(currentFilter, currentSearchQuery, currentSort);
        updateCartBadge();
        updateStockStats();
        if (isAdminLoggedIn()) {
            renderAdminInventoryTable();
            renderAdminOverview();
        }
        // If product detail is open, re-render detail info
        if (activeDetailProductId) {
            viewProduct(activeDetailProductId, false);
        }
    }

    onOrdersUpdated() {
        loadOrdersFromStorage();
        updateOrdersBadge();
        if (isAdminLoggedIn()) {
            renderAdminOrdersTable();
            renderAdminOverview();
        }
        renderOrdersHistory();
    }
}

const syncStore = new RealTimeSyncStore();

// App State
let products = [];
let cart = [];
let wishlist = [];
let orders = [];
let appliedCoupon = null;
let currentFilter = 'all';
let currentSearchQuery = '';
let currentSort = 'featured';
let inStockOnlyFilter = false;
let activeDetailProductId = null;
let currentTrackingOrder = null;
let liveViewerTimer = null;

// =========================================================
// 3. Local Storage Helpers
// =========================================================
function loadProductsFromStorage() {
    const raw = localStorage.getItem("modernshop_products");
    if (!raw) {
        products = [...DEFAULT_PRODUCTS];
        saveProductsToStorage();
    } else {
        try {
            products = JSON.parse(raw);
        } catch (e) {
            products = [...DEFAULT_PRODUCTS];
        }
    }
}

function saveProductsToStorage(shouldBroadcast = false, type = "PRODUCT_UPDATED") {
    localStorage.setItem("modernshop_products", JSON.stringify(products));
    if (shouldBroadcast) {
        syncStore.broadcast(type);
    }
}

function normalizeOrderTimeline(order) {
    if (!order) return;
    const currentStepIdx = TRACKING_STEPS.indexOf(order.status);
    const baseTime = typeof order.timestamp === "number" && !isNaN(order.timestamp) 
        ? order.timestamp 
        : Date.now() - (Math.max(0, currentStepIdx) * 15 * 60 * 1000);

    if (!order.timeline || typeof order.timeline !== "object") {
        order.timeline = {};
    }

    // Step milestone offsets in minutes relative to placement
    const offsetsMin = [0, 15, 30, 45, 60];

    TRACKING_STEPS.forEach((step, idx) => {
        const val = String(order.timeline[step] || "").trim();
        const isPastOrCurrent = idx <= currentStepIdx;

        // Detect if value is an invalid/mock string like "45m ago", "Tomorrow", "Estimated Thursday", "Just now", etc.
        const isInvalidCompletedVal = !val || 
            val === "Just now" || 
            val === "Pending" || 
            val === "In Queue" || 
            val === "Completed" || 
            val.toLowerCase().includes("ago") || 
            val.toLowerCase().includes("tomorrow") || 
            val.toLowerCase().includes("estimated") || 
            val.toLowerCase().includes("thursday");

        if (isPastOrCurrent) {
            if (isInvalidCompletedVal) {
                const milestoneDate = new Date(baseTime + (offsetsMin[idx] * 60 * 1000));
                order.timeline[step] = milestoneDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
        } else {
            // Future uncompleted step
            if (idx === currentStepIdx + 1 && order.status === "placed") {
                order.timeline[step] = "In Queue";
            } else {
                order.timeline[step] = "Pending";
            }
        }
    });
}

function loadOrdersFromStorage() {
    const raw = localStorage.getItem("modernshop_orders");
    if (!raw) {
        orders = [];
    } else {
        try {
            orders = JSON.parse(raw);
            if (Array.isArray(orders)) {
                orders.forEach(normalizeOrderTimeline);
            } else {
                orders = [];
            }
        } catch (e) {
            orders = [];
        }
    }
}

function saveOrdersToStorage(shouldBroadcast = false, payload = {}) {
    localStorage.setItem("modernshop_orders", JSON.stringify(orders));
    if (shouldBroadcast) {
        syncStore.broadcast("ORDER_CREATED", payload);
    }
}

function loadCartFromStorage() {
    const raw = localStorage.getItem("modernshop_cart");
    cart = raw ? JSON.parse(raw) : [];
}

function saveCartToStorage() {
    localStorage.setItem("modernshop_cart", JSON.stringify(cart));
}

function loadWishlistFromStorage() {
    const raw = localStorage.getItem("modernshop_wishlist");
    wishlist = raw ? JSON.parse(raw) : [];
}

function saveWishlistToStorage() {
    localStorage.setItem("modernshop_wishlist", JSON.stringify(wishlist));
}

// =========================================================
// 4. Initialization & Theme
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadProductsFromStorage();
    loadOrdersFromStorage();
    loadCartFromStorage();
    loadWishlistFromStorage();
    loadReviewsFromStorage();
    loadFlashSaleFromStorage();

    renderProducts();
    updateCart();
    updateWishlistBadge();
    updateOrdersBadge();
    updateStockStats();

    initFlashCountdown();
    startSocialProofToasts();
    initRealTimeShopperPresence();
});

function initTheme() {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    applyThemeState(isDark);
}

function toggleTheme() {
    const isDark = !document.body.classList.contains("dark-mode");
    applyThemeState(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
    showToast(isDark ? "🌙 Switched to Dark Theme" : "☀️ Switched to Light Theme");
}

function applyThemeState(isDark) {
    const body = document.body;
    const container = document.getElementById("themeSvgContainer");
    const label = document.getElementById("themeLabel");

    if (isDark) {
        body.classList.add("dark-mode");
        if (label) label.innerText = "Light";
        if (container) {
            container.innerHTML = `<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#f59e0b;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        }
    } else {
        body.classList.remove("dark-mode");
        if (label) label.innerText = "Dark";
        if (container) {
            container.innerHTML = `<svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#6366f1;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
    }
}

// =========================================================
// 5. Product Rendering, Filter, Search & Sorting
// =========================================================
function renderProducts(filter = currentFilter, searchQuery = currentSearchQuery, sort = currentSort) {
    const grid = document.getElementById("productGrid");
    const countEl = document.getElementById("catalogCount");
    const headingEl = document.getElementById("catalogHeading");
    if (!grid) return;

    grid.innerHTML = "";

    // Filtering
    let filtered = products.filter(p => {
        const matchesCategory = filter === "all" ? true :
                                filter === "sale" ? isProductOnSale(p.id) :
                                p.category === filter;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              p.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStock = inStockOnlyFilter ? p.stock > 0 : true;
        return matchesCategory && matchesSearch && matchesStock;
    });

    // Sorting
    if (sort === "price-low") {
        filtered.sort((a, b) => getProductEffectivePrice(a).effectivePrice - getProductEffectivePrice(b).effectivePrice);
    } else if (sort === "price-high") {
        filtered.sort((a, b) => getProductEffectivePrice(b).effectivePrice - getProductEffectivePrice(a).effectivePrice);
    } else if (sort === "rating") {
        filtered.sort((a, b) => b.rating - a.rating);
    } else if (sort === "stock") {
        filtered.sort((a, b) => b.stock - a.stock);
    }

    if (countEl) countEl.innerText = `Showing ${filtered.length} of ${products.length} products`;
    if (headingEl) {
        headingEl.innerText = filter === "all" ? "All Products" :
                              filter === "sale" ? "⚡ Active Flash Sale & Special Deals" :
                              filter === "electronics" ? "Electronics & Gadgets" :
                              filter === "clothing" ? "Fashion & Apparel" : "Lifestyle Accessories";
    }

    // Update On-Sale badge count in categories nav
    const onSaleCount = products.filter(p => isProductOnSale(p.id)).length;
    const saleCountBadge = document.getElementById("onSaleCountBadge");
    if (saleCountBadge) {
        saleCountBadge.innerText = onSaleCount;
        if (onSaleCount > 0 && flashSaleConfig && flashSaleConfig.isActive) {
            saleCountBadge.classList.remove("hidden");
        } else {
            saleCountBadge.classList.add("hidden");
        }
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon" style="opacity:0.4; margin-bottom:12px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <h3>No matching products found</h3>
                <p>${filter === 'sale' ? 'No products are currently in the active Flash Sale.' : 'Try searching for a different keyword or reset filters.'}</p>
                <button class="hero-primary-btn btn-sm" onclick="resetAllFilters()">Reset Filters</button>
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const isWish = wishlist.includes(p.id);
        const stockStatus = getStockBadgeHtml(p.stock);
        const pReviews = productReviews.filter(r => r.productId === p.id);
        const pReviewCount = pReviews.length;
        const pAvgRating = pReviewCount > 0
            ? (pReviews.reduce((sum, r) => sum + Number(r.stars), 0) / pReviewCount).toFixed(1)
            : null;

        const ratingMarkup = pAvgRating
            ? `<span style="color:#f59e0b; font-size:0.95rem;">★</span> <span>${pAvgRating}</span> <span style="color: var(--text-light); font-size:0.75rem;">(${pReviewCount} ${pReviewCount === 1 ? 'review' : 'reviews'})</span>`
            : `<span style="color:var(--text-light); font-size:0.75rem;">No reviews yet</span>`;

        const priceInfo = getProductEffectivePrice(p);
        let priceMarkup = `<span class="price">$${priceInfo.originalPrice.toFixed(2)}</span>`;
        let saleBadgeMarkup = '';

        if (priceInfo.isOnSale) {
            saleBadgeMarkup = `<span class="card-sale-badge">⚡ SALE -${priceInfo.discountPercent}%</span>`;
            priceMarkup = `
                <div>
                    <div>
                        <span class="sale-price">$${priceInfo.effectivePrice.toFixed(2)}</span>
                        <span class="original-price">$${priceInfo.originalPrice.toFixed(2)}</span>
                    </div>
                    <span class="sale-savings-tag">Save $${(priceInfo.originalPrice - priceInfo.effectivePrice).toFixed(2)}</span>
                </div>
            `;
        }

        const card = document.createElement("div");
        card.className = `card ${priceInfo.isOnSale ? 'card-on-sale' : ''}`;
        card.innerHTML = `
            <div class="card-media" onclick="viewProduct(${p.id})">
                <img src="${p.image}" alt="${p.name}" class="card-img" loading="lazy">
                ${saleBadgeMarkup || `<span class="card-tag-badge">${p.tag || 'Featured'}</span>`}
                <button class="card-wishlist-btn ${isWish ? 'active' : ''}" onclick="toggleWishlist(event, ${p.id})" title="Save to Wishlist" aria-label="Wishlist">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isWish ? '#ef4444' : 'none'}" stroke="${isWish ? '#ef4444' : 'currentColor'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                ${stockStatus}
            </div>
            <div class="card-body">
                <div class="card-meta-top">
                    <span class="card-cat">${p.category}</span>
                    <div class="card-rating">
                        ${ratingMarkup}
                    </div>
                </div>
                <h3 class="card-title" onclick="viewProduct(${p.id})">${p.name}</h3>
                <p class="card-desc">${p.desc}</p>
                <div class="card-footer">
                    <div class="price-box">
                        ${priceMarkup}
                        <span class="stock-status-hint">${p.stock > 0 ? `${p.stock} available` : 'Out of stock'}</span>
                    </div>
                    <button class="add-btn" onclick="addToCart(${p.id})" ${p.stock <= 0 ? 'disabled' : ''}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        ${p.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function getStockBadgeHtml(stock) {
    if (stock <= 0) {
        return `<span class="card-stock-pill stock-out">Out of Stock</span>`;
    } else if (stock <= 5) {
        return `<span class="card-stock-pill stock-low"><span class="pulse-dot" style="background:#d97706;"></span> Only ${stock} Left!</span>`;
    } else {
        return `<span class="card-stock-pill stock-in">In Stock</span>`;
    }
}

function filterProducts(category) {
    currentFilter = category;
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        if (category === "all" && btn.innerText.includes("All Products")) btn.classList.add("active");
        if (category === "sale" && btn.id === "saleFilterBtn") btn.classList.add("active");
        if (category === "electronics" && btn.innerText.includes("Electronics")) btn.classList.add("active");
        if (category === "clothing" && btn.innerText.includes("Fashion")) btn.classList.add("active");
        if (category === "accessories" && btn.innerText.includes("Accessories")) btn.classList.add("active");
    });
    updateFilterBar();
    renderProducts();
}

function handleSearch(query) {
    currentSearchQuery = query.trim();
    const clearBtn = document.getElementById("clearSearchBtn");
    if (clearBtn) {
        if (currentSearchQuery.length > 0) {
            clearBtn.classList.remove("hidden");
        } else {
            clearBtn.classList.add("hidden");
        }
    }
    updateFilterBar();
    renderProducts();
}

function clearSearch() {
    const input = document.getElementById("searchInput");
    if (input) input.value = "";
    currentSearchQuery = "";
    document.getElementById("clearSearchBtn").classList.add("hidden");
    updateFilterBar();
    renderProducts();
}

function handleSortChange(sortVal) {
    currentSort = sortVal;
    renderProducts();
}

function toggleInStockFilter(isChecked) {
    inStockOnlyFilter = isChecked;
    updateFilterBar();
    renderProducts();
}

function updateFilterBar() {
    const bar = document.getElementById("activeFiltersBar");
    const container = document.getElementById("filterTags");
    if (!bar || !container) return;

    let tags = [];
    if (currentFilter !== "all") {
        tags.push(`<span class="filter-chip">${currentFilter} <button onclick="filterProducts('all')">&times;</button></span>`);
    }
    if (currentSearchQuery) {
        tags.push(`<span class="filter-chip">"${currentSearchQuery}" <button onclick="clearSearch()">&times;</button></span>`);
    }
    if (inStockOnlyFilter) {
        tags.push(`<span class="filter-chip">In Stock Only <button onclick="document.getElementById('inStockOnlyCheckbox').checked=false; toggleInStockFilter(false);">&times;</button></span>`);
    }

    if (tags.length > 0) {
        bar.classList.remove("hidden");
        container.innerHTML = tags.join(" ");
    } else {
        bar.classList.add("hidden");
    }
}

function resetAllFilters() {
    currentFilter = "all";
    currentSearchQuery = "";
    inStockOnlyFilter = false;
    currentSort = "featured";

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText.includes("All")) btn.classList.add("active");
    });
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
    const sortSelect = document.getElementById("sortSelect");
    if (sortSelect) sortSelect.value = "featured";
    const inStockBox = document.getElementById("inStockOnlyCheckbox");
    if (inStockBox) inStockBox.checked = false;
    document.getElementById("clearSearchBtn").classList.add("hidden");

    updateFilterBar();
    renderProducts();
    showToast("Filters reset to default");
}

// =========================================================
// 6. Cart Drawer & Calculations Engine
// =========================================================
function toggleCart() {
    const modal = document.getElementById("cartModal");
    if (!modal) return;
    const isFlex = modal.style.display === "flex";
    modal.style.display = isFlex ? "none" : "flex";
    if (!isFlex) updateCart();
}

function addToCart(id, requestedQty = 1) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (product.stock <= 0) {
        showToast(`❌ Sorry, ${product.name} is currently out of stock.`);
        return;
    }

    const priceInfo = getProductEffectivePrice(product);

    const existing = cart.find(item => item.id === id);
    if (existing) {
        if (existing.qty + requestedQty > product.stock) {
            showToast(`⚠️ Only ${product.stock} units available in stock!`);
            existing.qty = product.stock;
        } else {
            existing.qty += requestedQty;
            showToast(`Added another ${product.name} to cart`);
        }
        existing.price = priceInfo.effectivePrice;
    } else {
        const qtyToAdd = Math.min(requestedQty, product.stock);
        cart.push({
            id: product.id,
            name: product.name,
            price: priceInfo.effectivePrice,
            originalPrice: priceInfo.originalPrice,
            isOnSale: priceInfo.isOnSale,
            discountPercent: priceInfo.discountPercent,
            image: product.image,
            qty: qtyToAdd
        });
        showToast(`🛍️ ${product.name} added to cart!`);
    }

    saveCartToStorage();
    updateCart();
    bounceCartBadge();
}

function updateCartQty(id, delta) {
    const item = cart.find(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (!item) return;

    if (delta > 0) {
        if (product && item.qty >= product.stock) {
            showToast(`⚠️ Maximum stock limit reached (${product.stock} units)`);
            return;
        }
        item.qty += 1;
    } else {
        item.qty -= 1;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== id);
            showToast(`Removed from cart`);
        }
    }

    saveCartToStorage();
    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCartToStorage();
    updateCart();
    showToast("Item removed from cart");
}

function updateCart() {
    const itemsEl = document.getElementById("cartItems");
    const countBadge = document.getElementById("cartCount");
    const headerBadge = document.getElementById("cartItemsBadge");
    const subtotalEl = document.getElementById("cartSubtotal");
    const discountRow = document.getElementById("cartDiscountRow");
    const discountEl = document.getElementById("cartDiscount");
    const discountNameEl = document.getElementById("discountCodeName");
    const shippingEl = document.getElementById("cartShipping");
    const taxEl = document.getElementById("cartTax");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("proceedToCheckoutBtn");

    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    if (countBadge) {
        countBadge.innerText = totalQty;
        if (totalQty > 0) countBadge.classList.remove("hidden");
        else countBadge.classList.add("hidden");
    }
    if (headerBadge) headerBadge.innerText = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;

    const stockEl = document.getElementById("statStockTotal");
    if (stockEl) {
        stockEl.innerText = totalQty.toString();
    }

    // Calculate Subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // Free Shipping Progress
    const freeShippingThreshold = 100.00;
    const meterFill = document.getElementById("shippingMeterFill");
    const meterText = document.getElementById("shippingMeterText");
    if (meterFill && meterText) {
        if (subtotal >= freeShippingThreshold || (appliedCoupon && appliedCoupon.type === "shipping")) {
            meterFill.style.width = "100%";
            meterText.innerHTML = `<span class="text-success"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align:middle; margin-right:4px;"><polyline points="20 6 9 17 4 12"></polyline></svg> <strong>Congratulations!</strong> You unlocked Free Shipping!</span>`;
        } else {
            const needed = (freeShippingThreshold - subtotal).toFixed(2);
            const percent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
            meterFill.style.width = `${percent}%`;
            meterText.innerHTML = `Add <strong>$${needed}</strong> more to unlock <strong>Free Shipping!</strong>`;
        }
    }

    // Shipping cost
    let shipping = 0;
    if (subtotal > 0) {
        if (subtotal >= freeShippingThreshold || (appliedCoupon && appliedCoupon.type === "shipping")) {
            shipping = 0.00;
        } else {
            shipping = 15.00;
        }
    }

    // Discount Calculation
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === "percent") {
            discount = subtotal * appliedCoupon.value;
        } else if (appliedCoupon.type === "flat") {
            discount = Math.min(subtotal, appliedCoupon.value);
        }
    }

    // Tax (8%)
    const taxRate = 0.08;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * taxRate;

    // Total
    const total = Math.max(0, taxableAmount + shipping + tax);

    // Update UI numbers
    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;

    if (discount > 0 && discountRow) {
        discountRow.classList.remove("hidden");
        discountEl.innerText = `-$${discount.toFixed(2)}`;
        discountNameEl.innerText = appliedCoupon.code;
    } else if (discountRow) {
        discountRow.classList.add("hidden");
    }

    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }

    // Render cart items
    if (!itemsEl) return;
    itemsEl.innerHTML = "";

    if (cart.length === 0) {
        itemsEl.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon" style="opacity:0.4; margin-bottom:12px;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <p>Your shopping cart is currently empty.</p>
                <button class="hero-primary-btn btn-sm" onclick="toggleCart()">Start Shopping</button>
            </div>
        `;
        return;
    }

    cart.forEach(item => {
        const prod = products.find(p => p.id === item.id);
        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
                ${prod && item.qty >= prod.stock ? `<div class="cart-item-stock-limit"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> Max available stock reached</div>` : ''}
            </div>
            <div class="qty-controls">
                <button class="qty-btn" onclick="updateCartQty(${item.id}, -1)" aria-label="Decrease quantity">-</button>
                <span><strong>${item.qty}</strong></span>
                <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="item-del-btn" onclick="removeFromCart(${item.id})" title="Remove item" aria-label="Remove item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        `;
        itemsEl.appendChild(itemEl);
    });
}

function bounceCartBadge() {
    const badge = document.getElementById("cartCount");
    if (!badge) return;
    badge.style.transform = "scale(1.4)";
    setTimeout(() => badge.style.transform = "scale(1)", 250);
}

function updateCartBadge() {
    const countBadge = document.getElementById("cartCount");
    if (!countBadge) return;
    const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
    countBadge.innerText = totalQty;
    if (totalQty > 0) countBadge.classList.remove("hidden");
    else countBadge.classList.add("hidden");
}

function applyCoupon() {
    const input = document.getElementById("couponInput");
    const msg = document.getElementById("couponMessage");
    if (!input || !msg) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
        msg.innerText = "Please enter a coupon code.";
        msg.className = "coupon-message text-danger";
        msg.classList.remove("hidden");
        return;
    }

    if (COUPONS[code]) {
        appliedCoupon = { ...COUPONS[code], code };
        msg.innerText = `Coupon ${code} applied successfully! (${COUPONS[code].label})`;
        msg.className = "coupon-message text-success";
        msg.classList.remove("hidden");
        showToast(`🎉 Coupon ${code} applied!`);
        updateCart();
    } else {
        msg.innerText = "Invalid promo code. Try SAVE20 or FREESHIP.";
        msg.className = "coupon-message text-danger";
        msg.classList.remove("hidden");
    }
}

// =========================================================
// 7. Product Detail Modal & Live Viewers Simulation
// =========================================================
let detailQty = 1;

function viewProduct(id, shouldOpenModal = true) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    activeDetailProductId = id;
    detailQty = 1;

    document.getElementById("detailImage").src = product.image;
    document.getElementById("detailTitle").innerText = product.name;
    document.getElementById("detailCategory").innerText = product.category;
    document.getElementById("detailDesc").innerText = product.desc;
    const priceInfo = getProductEffectivePrice(product);
    const priceEl = document.getElementById("detailPrice");
    if (priceEl) {
        if (priceInfo.isOnSale) {
            priceEl.innerHTML = `
                <span style="color:#ef4444; font-weight:800;">$${priceInfo.effectivePrice.toFixed(2)}</span>
                <span style="font-size:0.95rem; color:var(--text-muted); text-decoration:line-through; margin-left:6px;">$${priceInfo.originalPrice.toFixed(2)}</span>
                <span class="card-sale-badge" style="position:static; display:inline-block; vertical-align:middle; margin-left:8px; padding:2px 8px;">⚡ SALE -${priceInfo.discountPercent}%</span>
            `;
        } else {
            priceEl.innerText = `$${parseFloat(product.price).toFixed(2)}`;
        }
    }
    document.getElementById("detailTag").innerText = priceInfo.isOnSale ? `⚡ ${priceInfo.discountPercent}% OFF Flash Deal` : (product.tag || "Featured");
    document.getElementById("detailQtyVal").innerText = "1";

    const stockBadge = document.getElementById("detailStockBadge");
    if (stockBadge) {
        if (product.stock <= 0) {
            stockBadge.className = "detail-stock-badge stock-out";
            stockBadge.innerHTML = `Out of Stock`;
        } else if (product.stock <= 5) {
            stockBadge.className = "detail-stock-badge stock-low";
            stockBadge.innerHTML = `<span class="pulse-dot" style="background:#d97706;"></span> Only ${product.stock} Left In Stock!`;
        } else {
            stockBadge.className = "detail-stock-badge stock-in";
            stockBadge.innerHTML = `In Stock (${product.stock} available)`;
        }
    }

    const addBtn = document.getElementById("detailAddBtn");
    if (addBtn) {
        addBtn.disabled = product.stock <= 0;
        addBtn.innerHTML = product.stock <= 0 ? `Sold Out` : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:6px; vertical-align:middle;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> Add to Cart`;
        addBtn.onclick = () => {
            addToCart(product.id, detailQty);
            closeProductModal();
        };
    }

    // Wishlist button state
    const wishBtn = document.getElementById("detailWishBtn");
    const wishSvg = document.getElementById("detailWishSvg");
    const isWish = wishlist.includes(product.id);
    if (wishBtn) {
        if (isWish) {
            wishBtn.classList.add("active");
            if (wishSvg) {
                wishSvg.setAttribute("fill", "#ef4444");
                wishSvg.setAttribute("stroke", "#ef4444");
            }
        } else {
            wishBtn.classList.remove("active");
            if (wishSvg) {
                wishSvg.setAttribute("fill", "none");
                wishSvg.setAttribute("stroke", "currentColor");
            }
        }
    }

    // Calculate product's real reviews
    const pReviews = productReviews.filter(r => r.productId === product.id);
    const pReviewCount = pReviews.length;
    const pAvgRating = pReviewCount > 0
        ? (pReviews.reduce((sum, r) => sum + Number(r.stars), 0) / pReviewCount).toFixed(1)
        : null;

    const starsContainer = document.getElementById("detailRatingStars");
    if (starsContainer) {
        if (pAvgRating) {
            const roundedStars = Math.max(1, Math.min(5, Math.round(Number(pAvgRating))));
            const starsText = "★".repeat(roundedStars) + "☆".repeat(5 - roundedStars);
            starsContainer.innerHTML = `
                <span style="color:#f59e0b; font-size:1.05rem;">${starsText}</span>
                <span class="rating-number" id="detailRatingNumber">${pAvgRating}</span>
                <span class="review-count" id="detailReviewCount">(${pReviewCount} ${pReviewCount === 1 ? 'review' : 'reviews'})</span>
            `;
        } else {
            starsContainer.innerHTML = `
                <span style="color:var(--text-muted); font-size:0.85rem;">No reviews yet</span>
                <span class="review-count" id="detailReviewCount">(0 reviews)</span>
            `;
        }
    }

    const totalCountEl = document.getElementById("detailReviewTotalCount");
    if (totalCountEl) totalCountEl.innerText = pReviewCount;

    // Reset review form state
    const formBox = document.getElementById("reviewFormBox");
    if (formBox) formBox.classList.add("hidden");
    const writeBtn = document.getElementById("writeReviewBtn");
    if (writeBtn) writeBtn.innerText = "+ Write a Review";

    // Render product reviews list
    renderDetailReviewsList(pReviews);

    // Live Viewer Simulation
    simulateLiveViewers();

    if (shouldOpenModal) {
        document.getElementById("productModal").style.display = "flex";
    }
}

let currentAttachedPhoto = "";

function handleReviewPhotoUrlChange(url) {
    const trimmed = (url || "").trim();
    if (trimmed) {
        currentAttachedPhoto = trimmed;
        const previewWrap = document.getElementById("reviewPhotoPreviewWrap");
        const previewImg = document.getElementById("reviewPhotoPreviewImg");
        if (previewImg) previewImg.src = trimmed;
        if (previewWrap) previewWrap.classList.remove("hidden");
    } else {
        const fileInput = document.getElementById("reviewPhotoFile");
        if (!fileInput || !fileInput.value) {
            removeReviewPhotoAttachment();
        }
    }
}

function handleReviewPhotoFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
        showToast("⚠️ Image size exceeds 4MB. Please choose a smaller photo.");
        return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
        currentAttachedPhoto = evt.target.result;
        const previewWrap = document.getElementById("reviewPhotoPreviewWrap");
        const previewImg = document.getElementById("reviewPhotoPreviewImg");
        const urlInput = document.getElementById("reviewPhotoUrl");
        if (previewImg) previewImg.src = currentAttachedPhoto;
        if (previewWrap) previewWrap.classList.remove("hidden");
        if (urlInput) urlInput.value = "";
    };
    reader.readAsDataURL(file);
}

function removeReviewPhotoAttachment() {
    currentAttachedPhoto = "";
    const previewWrap = document.getElementById("reviewPhotoPreviewWrap");
    const previewImg = document.getElementById("reviewPhotoPreviewImg");
    const urlInput = document.getElementById("reviewPhotoUrl");
    const fileInput = document.getElementById("reviewPhotoFile");
    if (previewWrap) previewWrap.classList.add("hidden");
    if (previewImg) previewImg.src = "";
    if (urlInput) urlInput.value = "";
    if (fileInput) fileInput.value = "";
}

function openReviewPhotoLightbox(imgUrl, authorName) {
    const modal = document.getElementById("reviewLightboxModal");
    const img = document.getElementById("lightboxImg");
    const author = document.getElementById("lightboxAuthor");
    if (!modal || !img) return;
    img.src = imgUrl;
    if (author) author.innerText = authorName ? `Photo by ${authorName}` : "Customer Photo";
    modal.style.display = "flex";
}

function closeReviewPhotoLightbox() {
    const modal = document.getElementById("reviewLightboxModal");
    if (modal) modal.style.display = "none";
}

function renderDetailReviewsList(pReviews) {
    const reviewsEl = document.getElementById("detailReviewsList");
    if (!reviewsEl) return;

    if (!pReviews || pReviews.length === 0) {
        reviewsEl.innerHTML = `
            <div class="no-reviews-box">
                <p>No customer reviews yet.</p>
                <small style="color:var(--text-light);">Be the first to share your experience with this item!</small>
            </div>
        `;
        return;
    }

    reviewsEl.innerHTML = pReviews.map(r => `
        <div class="review-item">
            <div class="review-header">
                <span class="reviewer-name">${escapeHtml(r.author || 'Verified Buyer')}</span>
                <span style="color:#f59e0b;">${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
            </div>
            <div class="review-text">${escapeHtml(r.comment || '')}</div>
            ${r.image ? `
                <div class="review-photos-grid">
                    <div class="review-photo-thumb" onclick="openReviewPhotoLightbox('${escapeHtml(r.image)}', '${escapeHtml(r.author)}')" title="Click to view full photo">
                        <img src="${escapeHtml(r.image)}" alt="Customer review photo by ${escapeHtml(r.author)}" loading="lazy">
                        <div class="photo-zoom-overlay">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </div>
                    </div>
                </div>
            ` : ''}
            <div style="font-size:0.72rem; color:var(--text-light); margin-top:6px;">${new Date(r.timestamp).toLocaleDateString()} • Verified Buyer</div>
        </div>
    `).join("");
}

let currentReviewRating = 5;

function setReviewRating(rating) {
    currentReviewRating = Math.max(1, Math.min(5, rating));
    const stars = document.querySelectorAll("#starPicker .picker-star");
    stars.forEach((s) => {
        const val = parseInt(s.getAttribute("data-val"));
        if (val <= currentReviewRating) {
            s.classList.add("active");
        } else {
            s.classList.remove("active");
        }
    });
    const label = document.getElementById("ratingPickerLabel");
    if (label) {
        const labels = ["", "1 Star (Poor)", "2 Stars (Fair)", "3 Stars (Good)", "4 Stars (Very Good)", "5 Stars (Excellent)"];
        label.innerText = labels[currentReviewRating] || `${currentReviewRating} Stars`;
    }
}

function toggleReviewForm() {
    const formBox = document.getElementById("reviewFormBox");
    const writeBtn = document.getElementById("writeReviewBtn");
    if (!formBox) return;

    const isHidden = formBox.classList.contains("hidden");
    if (isHidden) {
        formBox.classList.remove("hidden");
        if (writeBtn) writeBtn.innerText = "✕ Close Form";
        setReviewRating(5);
        removeReviewPhotoAttachment();
        const authorInput = document.getElementById("reviewAuthor");
        if (authorInput) authorInput.focus();
    } else {
        formBox.classList.add("hidden");
        removeReviewPhotoAttachment();
        if (writeBtn) writeBtn.innerText = "+ Write a Review";
    }
}

function submitProductReview() {
    if (!activeDetailProductId) return;
    const authorEl = document.getElementById("reviewAuthor");
    const commentEl = document.getElementById("reviewComment");
    const author = authorEl ? authorEl.value.trim() : "";
    const comment = commentEl ? commentEl.value.trim() : "";

    if (!author) {
        showToast("⚠️ Please enter your name to post a review.");
        if (authorEl) authorEl.focus();
        return;
    }
    if (!comment) {
        showToast("⚠️ Please enter your review comments.");
        if (commentEl) commentEl.focus();
        return;
    }

    const newReview = {
        id: "rev_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
        productId: activeDetailProductId,
        author: author,
        stars: currentReviewRating,
        comment: comment,
        image: currentAttachedPhoto || "",
        timestamp: Date.now()
    };

    productReviews.unshift(newReview);
    saveReviewsToStorage(true);

    if (authorEl) authorEl.value = "";
    if (commentEl) commentEl.value = "";
    removeReviewPhotoAttachment();
    toggleReviewForm();

    // Re-render views
    viewProduct(activeDetailProductId, false);
    renderProducts(currentFilter, currentSearchQuery, currentSort);
    updateStockStats();

    showToast(`⭐ Thank you ${author}! Your ${currentReviewRating}-star review was posted.`);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function adjustDetailQty(delta) {
    const product = products.find(p => p.id === activeDetailProductId);
    if (!product || product.stock <= 0) return;

    const newQty = detailQty + delta;
    if (newQty < 1) return;
    if (newQty > product.stock) {
        showToast(`⚠️ Only ${product.stock} items currently in stock`);
        return;
    }

    detailQty = newQty;
    document.getElementById("detailQtyVal").innerText = detailQty;
}

function toggleDetailWishlist() {
    if (!activeDetailProductId) return;
    toggleWishlist(null, activeDetailProductId);
    const wishBtn = document.getElementById("detailWishBtn");
    const wishSvg = document.getElementById("detailWishSvg");
    const isWish = wishlist.includes(activeDetailProductId);
    if (wishBtn) {
        if (isWish) {
            wishBtn.classList.add("active");
            if (wishSvg) {
                wishSvg.setAttribute("fill", "#ef4444");
                wishSvg.setAttribute("stroke", "#ef4444");
            }
        } else {
            wishBtn.classList.remove("active");
            if (wishSvg) {
                wishSvg.setAttribute("fill", "none");
                wishSvg.setAttribute("stroke", "currentColor");
            }
        }
    }
}

function simulateLiveViewers() {
    clearInterval(liveViewerTimer);
    const viewerEl = document.getElementById("detailViewersCount");
    if (!viewerEl) return;

    let viewers = Math.floor(Math.random() * 12) + 8; // 8 to 20
    viewerEl.innerText = `${viewers} shoppers looking right now`;

    liveViewerTimer = setInterval(() => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        viewers = Math.max(5, Math.min(35, viewers + delta));
        viewerEl.innerText = `${viewers} shoppers looking right now`;
    }, 4500);
}

function closeProductModal() {
    clearInterval(liveViewerTimer);
    document.getElementById("productModal").style.display = "none";
    activeDetailProductId = null;
}

// =========================================================
// 8. Multi-Step Checkout & Order Submission Engine
// =========================================================
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast("Your cart is empty!");
        return;
    }
    // Close cart drawer
    document.getElementById("cartModal").style.display = "none";

    renderCheckoutReview();
    document.getElementById("checkoutModal").style.display = "flex";
}

function closeCheckoutModal() {
    document.getElementById("checkoutModal").style.display = "none";
}

function renderCheckoutReview() {
    const container = document.getElementById("checkoutReviewItems");
    const subtotalEl = document.getElementById("checkoutSubtotal");
    const discountRow = document.getElementById("checkoutDiscountRow");
    const discountEl = document.getElementById("checkoutDiscount");
    const shippingEl = document.getElementById("checkoutShipping");
    const taxEl = document.getElementById("checkoutTax");
    const totalEl = document.getElementById("checkoutTotal");

    if (!container) return;
    container.innerHTML = "";

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const freeShipping = subtotal >= 100 || (appliedCoupon && appliedCoupon.type === "shipping");
    const shipping = freeShipping ? 0 : 15.00;

    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === "percent") discount = subtotal * appliedCoupon.value;
        else if (appliedCoupon.type === "flat") discount = Math.min(subtotal, appliedCoupon.value);
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = taxableAmount * 0.08;
    const total = Math.max(0, taxableAmount + shipping + tax);

    cart.forEach(item => {
        const row = document.createElement("div");
        row.className = "review-item-row";
        row.innerHTML = `
            <span>${item.qty}x ${item.name}</span>
            <strong>$${(item.price * item.qty).toFixed(2)}</strong>
        `;
        container.appendChild(row);
    });

    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (shippingEl) shippingEl.innerText = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    if (taxEl) taxEl.innerText = `$${tax.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${total.toFixed(2)}`;

    if (discount > 0 && discountRow) {
        discountRow.classList.remove("hidden");
        discountEl.innerText = `-$${discount.toFixed(2)}`;
    } else if (discountRow) {
        discountRow.classList.add("hidden");
    }
}

function selectPaymentMethod(method) {
    document.querySelectorAll(".payment-opt").forEach(opt => opt.classList.remove("selected"));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add("selected");
    }
    const cardSection = document.getElementById("cardFieldsSection");
    if (cardSection) {
        if (method === "card") {
            cardSection.style.display = "block";
        } else {
            cardSection.style.display = "none";
        }
    }
}

function formatCardNumber(input) {
    let val = input.value.replace(/\D/g, "");
    val = val.substring(0, 16);
    input.value = val.match(/.{1,4}/g)?.join(" ") || val;
}

function formatExpiry(input) {
    let val = input.value.replace(/\D/g, "");
    if (val.length >= 2) {
        input.value = val.substring(0, 2) + "/" + val.substring(2, 4);
    } else {
        input.value = val;
    }
}

function handleOrderSubmission(event) {
    event.preventDefault();
    if (cart.length === 0) return;

    // Verify stock availability
    for (const item of cart) {
        const product = products.find(p => p.id === item.id);
        if (!product || product.stock < item.qty) {
            showToast(`⚠️ Sorry, "${item.name}" has only ${product ? product.stock : 0} items remaining!`);
            return;
        }
    }

    const submitBtn = document.getElementById("placeOrderSubmitBtn");
    const btnText = document.getElementById("placeOrderBtnText");
    submitBtn.disabled = true;
    btnText.innerText = "Encrypting & Transmitting...";

    setTimeout(() => {
        // Collect customer info
        const name = document.getElementById("custName").value.trim();
        const email = document.getElementById("custEmail").value.trim();
        const address = document.getElementById("custAddress").value.trim();
        const city = document.getElementById("custCity").value.trim();
        const zip = document.getElementById("custZip").value.trim();
        const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "card";

        // Calculate totals
        const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
        const freeShipping = subtotal >= 100 || (appliedCoupon && appliedCoupon.type === "shipping");
        const shipping = freeShipping ? 0 : 15.00;
        let discount = 0;
        if (appliedCoupon) {
            if (appliedCoupon.type === "percent") discount = subtotal * appliedCoupon.value;
            else if (appliedCoupon.type === "flat") discount = Math.min(subtotal, appliedCoupon.value);
        }
        const tax = Math.max(0, subtotal - discount) * 0.08;
        const total = Math.max(0, subtotal - discount + shipping + tax);

        // Generate Order
        const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder = {
            id: orderId,
            timestamp: Date.now(),
            customer: {
                name,
                email,
                address,
                city,
                zip,
                paymentMethod: payMethod === "card" ? "Credit Card" : payMethod === "cod" ? "Cash on Delivery" : "Apple Pay"
            },
            items: [...cart],
            subtotal,
            discount,
            shipping,
            tax,
            total,
            status: "placed",
            timeline: {
                placed: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                processing: "In Queue",
                shipped: "Pending",
                delivery: "Pending",
                delivered: "Pending"
            }
        };

        // Real-time stock decrement
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.stock = Math.max(0, product.stock - item.qty);
            }
        });
        saveProductsToStorage(true, "STOCK_DECREMENTED");

        // Save order and broadcast live
        orders.unshift(newOrder);
        saveOrdersToStorage(true, { orderId: newOrder.id });

        // Clear cart & applied coupon
        cart = [];
        appliedCoupon = null;
        saveCartToStorage();
        updateCart();
        updateOrdersBadge();

        // Reset UI button
        submitBtn.disabled = false;
        btnText.innerText = "Confirm & Place Order";
        closeCheckoutModal();

        // Open Real-Time Order Tracker
        openTrackingModal(newOrder.id);
        showToast(`🎉 Order #${newOrder.id} placed successfully!`);

        // Re-render catalog to show new stock badges
        renderProducts();
        updateStockStats();
    }, 1200);
}

// =========================================================
// 9. Interactive Live Order Tracker
// =========================================================
function openTrackingModal(orderId) {
    loadOrderIntoTracker(orderId);
    document.getElementById("orderTrackingModal").style.display = "flex";
}

function closeTrackingModal() {
    document.getElementById("orderTrackingModal").style.display = "none";
    currentTrackingOrder = null;
}

function loadOrderIntoTracker(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    normalizeOrderTimeline(order);
    currentTrackingOrder = order;

    document.getElementById("trackOrderId").innerText = `Order #${order.id}`;
    document.getElementById("trackStatusBadge").innerText = formatStatusLabel(order.status);
    document.getElementById("trackStatusBadge").className = `meta-value status-pill status-${order.status}`;
    document.getElementById("trackAddress").innerText = `${order.customer.address}, ${order.customer.city}`;
    document.getElementById("trackEta").innerText = order.status === "delivered" ? "Delivered to Customer" : "Expected in 1-2 Business Days";

    // Stepper updates
    const currentStepIndex = TRACKING_STEPS.indexOf(order.status);
    const progressLine = document.getElementById("trackingProgressLine");

    const pct = currentStepIndex >= 0 ? `${(currentStepIndex / (TRACKING_STEPS.length - 1)) * 100}%` : "0%";
    if (progressLine) {
        progressLine.style.width = pct;
        progressLine.style.setProperty("--progress-height", pct);
    }

    TRACKING_STEPS.forEach((step, idx) => {
        const pointEl = document.getElementById(`step-${step}`);
        if (!pointEl) return;

        pointEl.classList.remove("active", "completed");
        if (idx < currentStepIndex) {
            pointEl.classList.add("completed");
        } else if (idx === currentStepIndex) {
            pointEl.classList.add("active");
        }
    });

    // Timestamps
    const timeline = order.timeline || {};
    document.getElementById("stepTimePlaced").innerText = timeline.placed || "Pending";
    document.getElementById("stepTimeProcessing").innerText = timeline.processing || "Pending";
    document.getElementById("stepTimeShipped").innerText = timeline.shipped || "Pending";
    document.getElementById("stepTimeDelivery").innerText = timeline.delivery || "Pending";
    document.getElementById("stepTimeDelivered").innerText = timeline.delivered || "Pending";

    // Items list
    const itemsList = document.getElementById("trackItemsList");
    if (itemsList) {
        itemsList.innerHTML = order.items.map(i => `
            <div style="display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--card-border); padding-bottom:8px;">
                <img src="${i.image}" alt="${i.name}" style="width:48px; height:48px; border-radius:6px; object-fit:cover;">
                <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.88rem;">${i.name}</div>
                    <div style="font-size:0.78rem; color:var(--text-muted);">$${parseFloat(i.price).toFixed(2)} x ${i.qty}</div>
                </div>
                <strong>$${(i.price * i.qty).toFixed(2)}</strong>
            </div>
        `).join("");
    }

    // Receipt breakdown
    document.getElementById("trackReceiptSubtotal").innerText = `$${order.subtotal.toFixed(2)}`;
    document.getElementById("trackReceiptDiscount").innerText = order.discount > 0 ? `-$${order.discount.toFixed(2)}` : "$0.00";
    document.getElementById("trackReceiptShipping").innerText = order.shipping === 0 ? "FREE" : `$${order.shipping.toFixed(2)}`;
    document.getElementById("trackReceiptTax").innerText = `$${order.tax.toFixed(2)}`;
    document.getElementById("trackReceiptTotal").innerText = `$${order.total.toFixed(2)}`;
}

function advanceOrderStep(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const currentIndex = TRACKING_STEPS.indexOf(order.status);
    if (currentIndex < TRACKING_STEPS.length - 1) {
        const nextStatus = TRACKING_STEPS[currentIndex + 1];
        updateOrderStatus(order.id, nextStatus, true);
        showToast(`🚚 Order #${order.id} advanced to: ${formatStatusLabel(nextStatus)}`);
    } else {
        showToast(`✅ Order #${order.id} is already Delivered!`);
    }
}

function simulateNextStep(orderId) {
    if (orderId) {
        advanceOrderStep(orderId);
    } else if (currentTrackingOrder) {
        advanceOrderStep(currentTrackingOrder.id);
    }
}

function formatStatusLabel(status) {
    switch (status) {
        case "placed": return "Order Placed";
        case "processing": return "Processing";
        case "shipped": return "Shipped";
        case "delivery": return "Out for Delivery";
        case "delivered": return "Delivered";
        default: return status;
    }
}

function updateOrderStatus(orderId, newStatus, shouldBroadcast = true) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    order.status = newStatus;
    normalizeOrderTimeline(order);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (order.timeline) {
        order.timeline[newStatus] = nowTime;
    }

    saveOrdersToStorage();
    if (shouldBroadcast) {
        syncStore.broadcast("ORDER_STATUS_CHANGED", { orderId, newStatus });
    }

    if (currentTrackingOrder && currentTrackingOrder.id === orderId) {
        loadOrderIntoTracker(orderId);
    }
    if (isAdminLoggedIn()) {
        renderAdminOrdersTable();
        renderAdminOverview();
    }
    renderOrdersHistory();
    updateOrdersBadge();
}

function deleteOrder(orderId, event) {
    if (event) event.stopPropagation();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) {
        orders.splice(idx, 1);
        saveOrdersToStorage(true);
        if (isAdminLoggedIn()) {
            renderAdminOrdersTable();
            renderAdminOverview();
        }
        renderOrdersHistory();
        updateOrdersBadge();
        showToast(`🗑️ Order #${orderId} removed.`);
    }
}

function clearAllOrders() {
    if (orders.length === 0) {
        showToast("ℹ️ No orders in queue.");
        return;
    }
    orders = [];
    saveOrdersToStorage(true);
    if (isAdminLoggedIn()) {
        renderAdminOrdersTable();
        renderAdminOverview();
    }
    renderOrdersHistory();
    updateOrdersBadge();
    showToast("🗑️ All test orders removed successfully.");
}

// =========================================================
// 10. Customer "My Orders" & Wishlist Drawers
// =========================================================
function openOrdersModal() {
    renderOrdersHistory();
    document.getElementById("ordersHistoryModal").style.display = "flex";
}

function closeOrdersModal() {
    document.getElementById("ordersHistoryModal").style.display = "none";
}

function renderOrdersHistory() {
    updateOrdersBadge();
    const container = document.getElementById("ordersHistoryList");
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon" style="opacity:0.4; margin-bottom:12px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                <p>You have not placed any orders yet.</p>
                <button class="hero-primary-btn btn-sm" onclick="closeOrdersModal()">Start Shopping</button>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(o => `
        <div class="order-history-card">
            <div class="history-card-header">
                <div>
                    <strong>Order #${o.id}</strong>
                    <span style="font-size:0.78rem; color:var(--text-muted); margin-left:8px;">${new Date(o.timestamp).toLocaleDateString()}</span>
                </div>
                <span class="status-pill status-${o.status}">${formatStatusLabel(o.status)}</span>
            </div>
            <div class="history-items-row">
                ${o.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
            </div>
            <div class="history-card-footer">
                <div>Total: <strong>$${o.total.toFixed(2)}</strong></div>
                <button class="btn-secondary-outline" onclick="closeOrdersModal(); openTrackingModal('${o.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:4px;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Live Tracker
                </button>
            </div>
        </div>
    `).join("");
}

function updateOrdersBadge() {
    const badge = document.getElementById("ordersCount");
    if (!badge) return;
    // Count only active / ongoing orders that are NOT delivered yet
    const ongoingOrders = orders.filter(o => o.status !== "delivered");
    badge.innerText = ongoingOrders.length;
    if (ongoingOrders.length > 0) {
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

function openWishlistModal() {
    renderWishlist();
    document.getElementById("wishlistModal").style.display = "flex";
}

function closeWishlistModal() {
    document.getElementById("wishlistModal").style.display = "none";
}

function toggleWishlist(event, id) {
    if (event) event.stopPropagation();
    const index = wishlist.indexOf(id);
    const prod = products.find(p => p.id === id);

    if (index > -1) {
        wishlist.splice(index, 1);
        showToast(`Removed from Wishlist`);
    } else {
        wishlist.push(id);
        showToast(`❤️ Saved ${prod ? prod.name : 'product'} to Wishlist`);
    }

    saveWishlistToStorage();
    updateWishlistBadge();
    renderProducts();
    renderWishlist();
}

function updateWishlistBadge() {
    const badge = document.getElementById("wishlistCount");
    if (!badge) return;
    badge.innerText = wishlist.length;
    if (wishlist.length > 0) {
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

function renderWishlist() {
    const container = document.getElementById("wishlistItemsList");
    const countBadge = document.getElementById("wishlistItemsBadge");
    if (!container) return;

    if (countBadge) countBadge.innerText = `${wishlist.length} Saved`;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon" style="opacity:0.4; margin-bottom:12px;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <p>Your wishlist is currently empty.</p>
                <button class="hero-primary-btn btn-sm" onclick="closeWishlistModal()">Explore Items</button>
            </div>
        `;
        return;
    }

    const savedProducts = products.filter(p => wishlist.includes(p.id));
    container.innerHTML = savedProducts.map(p => `
        <div class="wishlist-card">
            <img src="${p.image}" alt="${p.name}">
            <div class="wishlist-info">
                <h4 style="font-size:0.95rem; margin-bottom:4px;">${p.name}</h4>
                <div style="font-weight:700; color:var(--primary);">$${parseFloat(p.price).toFixed(2)}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</div>
            </div>
            <div class="wishlist-actions">
                <button class="add-btn btn-sm" onclick="addToCart(${p.id});" ${p.stock <= 0 ? 'disabled' : ''}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px; vertical-align:middle;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> Add
                </button>
                <button class="item-del-btn" onclick="toggleWishlist(null, ${p.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `).join("");
}

// =========================================================
// 11. Upgraded Store Operations Admin Hub
// =========================================================
let adminLoggedIn = false;

function isAdminLoggedIn() {
    return adminLoggedIn;
}

function openAdminLogin() {
    document.getElementById("adminPassword").value = "";
    document.getElementById("loginError").classList.add("hidden");
    document.getElementById("adminLoginModal").style.display = "flex";
}

function closeAdminLoginModal() {
    document.getElementById("adminLoginModal").style.display = "none";
}

function getAdminPasskey() {
    return localStorage.getItem("modernshop_admin_passkey") || "CODE123";
}

function setAdminPasskey(newKey) {
    localStorage.setItem("modernshop_admin_passkey", newKey);
}

function verifyAdmin() {
    const key = document.getElementById("adminPassword").value.trim();
    if (key === getAdminPasskey()) {
        adminLoggedIn = true;
        closeAdminLoginModal();
        openAdminPanel();
        showToast("🔓 Authenticated as Store Manager");
    } else {
        document.getElementById("loginError").classList.remove("hidden");
    }
}

function updateAdminPasskey() {
    const currentInput = document.getElementById("currentPasskeyInput");
    const newInput = document.getElementById("newPasskeyInput");
    const confirmInput = document.getElementById("confirmPasskeyInput");
    const feedback = document.getElementById("passkeyFeedbackMsg");

    if (!currentInput || !newInput || !confirmInput) return;

    const currentVal = currentInput.value.trim();
    const newVal = newInput.value.trim();
    const confirmVal = confirmInput.value.trim();

    if (currentVal !== getAdminPasskey()) {
        if (feedback) {
            feedback.innerText = "❌ Current passkey is incorrect.";
            feedback.className = "passkey-feedback text-danger";
            feedback.classList.remove("hidden");
        }
        return;
    }

    if (newVal.length < 4) {
        if (feedback) {
            feedback.innerText = "⚠️ New passkey must be at least 4 characters long.";
            feedback.className = "passkey-feedback text-danger";
            feedback.classList.remove("hidden");
        }
        return;
    }

    if (newVal !== confirmVal) {
        if (feedback) {
            feedback.innerText = "⚠️ New passkey and confirmation do not match.";
            feedback.className = "passkey-feedback text-danger";
            feedback.classList.remove("hidden");
        }
        return;
    }

    setAdminPasskey(newVal);
    document.getElementById("changePasskeyForm").reset();

    if (feedback) {
        feedback.innerText = "✅ Passkey updated successfully! Use your new passkey on next login.";
        feedback.className = "passkey-feedback text-success";
        feedback.classList.remove("hidden");
    }
    showToast("🔐 Administrative passkey updated successfully!");
}

function openAdminPanel() {
    switchAdminTab("overview");
    document.getElementById("adminModal").style.display = "flex";
}

function closeAdminPanel() {
    document.getElementById("adminModal").style.display = "none";
    adminLoggedIn = false;
}

function switchAdminTab(tab) {
    const overviewView = document.getElementById("adminOverviewView");
    const ordersView = document.getElementById("adminOrdersView");
    const inventoryView = document.getElementById("adminInventoryView");
    const formView = document.getElementById("adminFormView");
    const salesView = document.getElementById("adminSalesView");
    const securityView = document.getElementById("adminSecurityView");

    const btnOverview = document.getElementById("btn-tab-overview");
    const btnOrders = document.getElementById("btn-tab-orders");
    const btnInventory = document.getElementById("btn-tab-inventory");
    const btnForm = document.getElementById("btn-tab-form");
    const btnSales = document.getElementById("btn-tab-sales");
    const btnSecurity = document.getElementById("btn-tab-security");

    // Hide all
    [overviewView, ordersView, inventoryView, formView, salesView, securityView].forEach(v => { if (v) v.style.display = "none"; });
    [btnOverview, btnOrders, btnInventory, btnForm, btnSales, btnSecurity].forEach(b => { if (b) b.classList.remove("active"); });

    if (tab === "overview") {
        overviewView.style.display = "block";
        btnOverview.classList.add("active");
        renderAdminOverview();
    } else if (tab === "orders") {
        ordersView.style.display = "block";
        btnOrders.classList.add("active");
        renderAdminOrdersTable();
    } else if (tab === "inventory") {
        inventoryView.style.display = "block";
        btnInventory.classList.add("active");
        renderAdminInventoryTable();
    } else if (tab === "sales") {
        if (salesView) salesView.style.display = "block";
        if (btnSales) btnSales.classList.add("active");
        renderAdminSalesTab();
    } else if (tab === "form") {
        formView.style.display = "block";
        btnForm.classList.add("active");
        if (document.getElementById("formTitle").innerText !== "Edit Product Details") {
            resetAdminForm();
        }
    } else if (tab === "security") {
        if (securityView) securityView.style.display = "block";
        if (btnSecurity) btnSecurity.classList.add("active");
        const feedback = document.getElementById("passkeyFeedbackMsg");
        if (feedback) feedback.classList.add("hidden");
    }

    const orderCounter = document.getElementById("adminOrderCounter");
    if (orderCounter) {
        const undeliveredCount = orders.filter(o => o.status !== "delivered").length;
        orderCounter.innerText = undeliveredCount;
    }
}

function renderAdminOverview() {
    const grossRevEl = document.getElementById("metricGrossRevenue");
    const totalOrdersEl = document.getElementById("metricTotalOrders");
    const aovEl = document.getElementById("metricAov");
    const lowStockEl = document.getElementById("metricLowStock");

    const grossRev = orders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = orders.length;
    const aov = orderCount > 0 ? (grossRev / orderCount) : 0;
    const lowStockCount = products.filter(p => p.stock <= 5).length;

    if (grossRevEl) grossRevEl.innerText = `$${grossRev.toFixed(2)}`;
    if (totalOrdersEl) totalOrdersEl.innerText = orderCount;
    if (aovEl) aovEl.innerText = `$${aov.toFixed(2)}`;
    if (lowStockEl) lowStockEl.innerText = `${lowStockCount} Items`;

    // Render Recent Sales Feed
    const tbody = document.getElementById("adminRecentSalesTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const recentOrders = orders.slice(0, 5);
    if (recentOrders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No sales recorded yet.</td></tr>`;
        return;
    }

    recentOrders.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${o.id}</strong></td>
            <td>${o.customer.name}</td>
            <td>${new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>${o.items.length} items</td>
            <td><strong>$${o.total.toFixed(2)}</strong></td>
            <td><span class="status-pill status-${o.status}">${formatStatusLabel(o.status)}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAdminOrdersTable() {
    const tbody = document.getElementById("adminOrdersTableBody");
    const badge = document.getElementById("totalOrdersBadge");
    const orderCounter = document.getElementById("adminOrderCounter");
    if (!tbody) return;

    const undeliveredCount = orders.filter(o => o.status !== "delivered").length;
    if (badge) badge.innerText = `${undeliveredCount} Undelivered`;
    if (orderCounter) orderCounter.innerText = undeliveredCount;
    tbody.innerHTML = "";

    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No customer orders placed yet.</td></tr>`;
        return;
    }

    orders.forEach(o => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <strong>${o.id}</strong><br>
                <small style="color:var(--text-muted);">${new Date(o.timestamp).toLocaleString()}</small>
            </td>
            <td>
                <strong>${o.customer.name}</strong><br>
                <small style="color:var(--text-muted);">${o.customer.email}</small>
            </td>
            <td>${o.customer.address}, ${o.customer.city}</td>
            <td>${o.items.map(i => `${i.qty}x ${i.name}`).join("<br>")}</td>
            <td><strong>$${o.total.toFixed(2)}</strong><br><small>${o.customer.paymentMethod}</small></td>
            <td>
                <div style="display:flex; align-items:center; gap:6px;">
                    <select class="status-dropdown" onchange="updateOrderStatus('${o.id}', this.value, true)">
                        <option value="placed" ${o.status === 'placed' ? 'selected' : ''}>Placed</option>
                        <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivery" ${o.status === 'delivery' ? 'selected' : ''}>Out for Delivery</option>
                        <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                    ${o.status !== 'delivered' ? `
                        <button class="btn-step-action" onclick="advanceOrderStep('${o.id}')" title="Simulate next tracking step">
                            ⚡ Step
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-del" onclick="deleteOrder('${o.id}', event)" title="Delete / Remove Order">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAdminInventoryTable() {
    const tbody = document.getElementById("adminProductTableBody");
    const badge = document.getElementById("totalProdCount");
    if (!tbody) return;

    if (badge) badge.innerText = `${products.length} Products`;
    tbody.innerHTML = "";

    products.forEach(p => {
        const pReviews = productReviews.filter(r => r.productId === p.id);
        const pReviewCount = pReviews.length;
        const pAvgRating = pReviewCount > 0
            ? (pReviews.reduce((sum, r) => sum + Number(r.stars), 0) / pReviewCount).toFixed(1)
            : null;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>
                <div style="display:flex; align-items:center; gap:12px;">
                    <img src="${p.image}" alt="${p.name}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small style="color:var(--text-muted);">${p.tag || 'Standard'}</small>
                    </div>
                </div>
            </td>
            <td><span class="cat-badge cat-${p.category}">${p.category}</span></td>
            <td>
                <span class="${p.stock <= 5 ? 'text-danger' : 'text-success'}" style="font-weight:700;">
                    ${p.stock} units
                </span>
            </td>
            <td><strong>$${parseFloat(p.price).toFixed(2)}</strong></td>
            <td>${pAvgRating ? `★ ${pAvgRating} (${pReviewCount})` : '<small style="color:var(--text-muted);">No reviews</small>'}</td>
            <td style="text-align:right">
                <button class="btn-icon btn-edit" onclick="prepareAdminEdit(${p.id})" title="Edit Product" aria-label="Edit Product">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </button>
                <button class="btn-icon btn-del" onclick="deleteProduct(${p.id})" title="Delete Product" aria-label="Delete Product">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function prepareAdminEdit(id) {
    const p = products.find(x => x.id === id);
    if (!p) return;

    document.getElementById("formTitle").innerText = "Edit Product Details";
    document.getElementById("editId").value = p.id;
    document.getElementById("editName").value = p.name;
    document.getElementById("editPrice").value = p.price;
    document.getElementById("editStock").value = p.stock;
    document.getElementById("editCat").value = p.category;
    document.getElementById("editTag").value = p.tag || "Featured";
    document.getElementById("editImg").value = p.image;
    document.getElementById("editDesc").value = p.desc;

    switchAdminTab("form");
}

function resetAdminForm() {
    document.getElementById("formTitle").innerText = "Add New Product";
    document.getElementById("editId").value = "";
    document.getElementById("editName").value = "";
    document.getElementById("editPrice").value = "";
    document.getElementById("editStock").value = "15";
    document.getElementById("editCat").value = "electronics";
    document.getElementById("editTag").value = "Featured";
    document.getElementById("editImg").value = "";
    document.getElementById("editDesc").value = "";
}

function saveProductData() {
    const id = document.getElementById("editId").value;
    const name = document.getElementById("editName").value.trim();
    const price = parseFloat(document.getElementById("editPrice").value);
    const stock = parseInt(document.getElementById("editStock").value, 10);
    const cat = document.getElementById("editCat").value;
    const tag = document.getElementById("editTag").value;
    let img = document.getElementById("editImg").value.trim();
    const desc = document.getElementById("editDesc").value.trim();

    if (!name || isNaN(price) || isNaN(stock) || !desc) {
        showToast("⚠️ Please fill all required fields properly");
        return;
    }

    if (!img) {
        img = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80";
    }

    if (id) {
        // Edit existing
        const idx = products.findIndex(p => p.id == id);
        if (idx !== -1) {
            products[idx] = {
                ...products[idx],
                name,
                price,
                stock,
                category: cat,
                tag,
                image: img,
                desc
            };
            saveProductsToStorage(true, "PRODUCT_UPDATED");
            showToast("✅ Product updated & broadcasted in real-time!");
        }
    } else {
        // Add new
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = {
            id: newId,
            name,
            price,
            stock,
            category: cat,
            tag,
            image: img,
            desc,
            rating: 4.9,
            reviewsCount: 1
        };
        products.unshift(newProduct);
        saveProductsToStorage(true, "PRODUCT_ADDED");
        showToast("🚀 New product published & live on store!");
    }

    renderProducts();
    updateStockStats();
    switchAdminTab("inventory");
}

function deleteProduct(id) {
    if (confirm("Are you sure you want to permanently remove this product?")) {
        products = products.filter(p => p.id !== id);
        saveProductsToStorage(true, "PRODUCT_DELETED");
        renderProducts();
        renderAdminInventoryTable();
        updateStockStats();
        showToast("🗑️ Product removed from store");
    }
}

// =========================================================
// 12. Flash Sales Admin Controllers & Real-Time Deal Hub
// =========================================================
let adminSelectedSaleProductIds = [];
let adminSelectedDurationHours = 3;

function renderAdminSalesTab() {
    loadFlashSaleFromStorage();

    const titleInput = document.getElementById("saleCampaignTitle");
    const discountSelect = document.getElementById("saleDiscountSelect");
    const promoInput = document.getElementById("salePromoCode");
    const statusPill = document.getElementById("saleStatusIndicatorPill");
    const sidebarPill = document.getElementById("adminSaleStatusPill");
    const endTimeInput = document.getElementById("saleEndTimeInput");

    if (titleInput) titleInput.value = flashSaleConfig.title || "MID-SEASON MEGA FLASH SALE";
    if (discountSelect) discountSelect.value = String(flashSaleConfig.discountPercent || 25);
    if (promoInput) promoInput.value = flashSaleConfig.promoCode || "SAVE20";

    adminSelectedSaleProductIds = Array.isArray(flashSaleConfig.productIds) && flashSaleConfig.productIds.length > 0
        ? [...flashSaleConfig.productIds]
        : products.map(p => p.id);

    const isLive = flashSaleConfig.isActive && flashSaleConfig.endsAt > Date.now();

    if (statusPill) {
        if (isLive) {
            statusPill.className = "sale-live-pill active";
            statusPill.innerText = "⚡ SALE IS CURRENTLY LIVE";
        } else {
            statusPill.className = "sale-live-pill";
            statusPill.innerText = "● SALE IS INACTIVE";
        }
    }

    if (sidebarPill) {
        if (isLive) {
            sidebarPill.classList.remove("hidden");
        } else {
            sidebarPill.classList.add("hidden");
        }
    }

    if (endTimeInput && flashSaleConfig.endsAt) {
        const d = new Date(flashSaleConfig.endsAt);
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
        endTimeInput.value = localISOTime;
    }

    renderSaleProductChecklist();
    updateAdminTimerPreview();
}

function renderSaleProductChecklist() {
    const tbody = document.getElementById("saleProductSelectionTableBody");
    const selectAllBox = document.getElementById("selectAllSaleCheckbox");
    if (!tbody) return;

    tbody.innerHTML = "";
    const discPercent = Number(document.getElementById("saleDiscountSelect") ? document.getElementById("saleDiscountSelect").value : 25);

    products.forEach(p => {
        const isSelected = adminSelectedSaleProductIds.includes(p.id);
        const salePrice = p.price * (1 - discPercent / 100);

        const tr = document.createElement("tr");
        tr.className = `sale-product-row ${isSelected ? 'selected' : ''}`;
        tr.innerHTML = `
            <td>
                <input type="checkbox" class="sale-prod-checkbox" data-id="${p.id}" ${isSelected ? 'checked' : ''} onchange="toggleSingleSaleProduct(${p.id}, this.checked)">
            </td>
            <td>
                <div style="display:flex; align-items:center;">
                    <img src="${p.image}" alt="${p.name}" class="sale-thumb-img">
                    <div>
                        <strong>${p.name}</strong><br>
                        <small style="color:var(--text-muted);">${p.tag || 'Standard'}</small>
                    </div>
                </div>
            </td>
            <td><span class="cat-badge cat-${p.category}">${p.category}</span></td>
            <td><span class="original-price">$${parseFloat(p.price).toFixed(2)}</span></td>
            <td><strong class="sale-price" style="font-size:0.95rem;">$${salePrice.toFixed(2)}</strong></td>
            <td><span class="${p.stock <= 5 ? 'text-danger' : 'text-success'}">${p.stock} units</span></td>
        `;
        tbody.appendChild(tr);
    });

    if (selectAllBox) {
        selectAllBox.checked = products.length > 0 && adminSelectedSaleProductIds.length === products.length;
    }
}

function toggleSingleSaleProduct(id, isChecked) {
    if (isChecked) {
        if (!adminSelectedSaleProductIds.includes(id)) adminSelectedSaleProductIds.push(id);
    } else {
        adminSelectedSaleProductIds = adminSelectedSaleProductIds.filter(x => x !== id);
    }
    const selectAllBox = document.getElementById("selectAllSaleCheckbox");
    if (selectAllBox) {
        selectAllBox.checked = products.length > 0 && adminSelectedSaleProductIds.length === products.length;
    }
}

function toggleSelectAllSaleProducts(checked) {
    if (checked) {
        adminSelectedSaleProductIds = products.map(p => p.id);
    } else {
        adminSelectedSaleProductIds = [];
    }
    const selectAllBox = document.getElementById("selectAllSaleCheckbox");
    if (selectAllBox) selectAllBox.checked = checked;
    renderSaleProductChecklist();
}

function updateSalePricePreviews() {
    renderSaleProductChecklist();
}

function setSaleDurationPreset(hours) {
    adminSelectedDurationHours = hours;
    document.querySelectorAll(".preset-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.innerText === `${hours}h`) btn.classList.add("active");
    });

    const targetTime = Date.now() + hours * 3600 * 1000;
    const d = new Date(targetTime);
    const tzOffset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);

    const endInput = document.getElementById("saleEndTimeInput");
    if (endInput) endInput.value = localISOTime;

    updateAdminTimerPreview(targetTime);
}

function handleCustomEndTimeChange() {
    const endInput = document.getElementById("saleEndTimeInput");
    if (!endInput || !endInput.value) return;

    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    const customTime = new Date(endInput.value).getTime();
    updateAdminTimerPreview(customTime);
}

function updateAdminTimerPreview(targetTimestamp = null) {
    const display = document.getElementById("adminSaleTimerDisplay");
    if (!display) return;

    let endsAt = targetTimestamp;
    if (!endsAt) {
        const endInput = document.getElementById("saleEndTimeInput");
        if (endInput && endInput.value) {
            endsAt = new Date(endInput.value).getTime();
        } else if (flashSaleConfig && flashSaleConfig.endsAt) {
            endsAt = flashSaleConfig.endsAt;
        } else {
            endsAt = Date.now() + 3 * 3600 * 1000;
        }
    }

    const diff = Math.max(0, endsAt - Date.now());
    const totalSec = Math.floor(diff / 1000);
    const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSec % 60).toString().padStart(2, "0");
    display.innerText = `${h}h : ${m}m : ${s}s`;
}

function launchFlashSaleLive() {
    const titleInput = document.getElementById("saleCampaignTitle");
    const discountSelect = document.getElementById("saleDiscountSelect");
    const promoInput = document.getElementById("salePromoCode");
    const endInput = document.getElementById("saleEndTimeInput");

    const title = titleInput ? titleInput.value.trim() : "MID-SEASON MEGA FLASH SALE";
    const discount = discountSelect ? parseInt(discountSelect.value, 10) : 25;
    const promo = promoInput ? promoInput.value.trim() : "SAVE20";

    let endsAt = Date.now() + 3 * 3600 * 1000;
    if (endInput && endInput.value) {
        endsAt = new Date(endInput.value).getTime();
    }

    if (endsAt <= Date.now()) {
        showToast("⚠️ End time must be set in the future!");
        return;
    }

    if (adminSelectedSaleProductIds.length === 0) {
        showToast("⚠️ Please select at least 1 product to put on sale!");
        return;
    }

    flashSaleConfig = {
        isActive: true,
        title,
        discountPercent: discount,
        endsAt,
        durationHours: adminSelectedDurationHours || 3,
        productIds: [...adminSelectedSaleProductIds],
        promoCode: promo
    };

    saveFlashSaleToStorage(true);
    renderProducts();
    updateFlashBanner();
    renderAdminSalesTab();

    showToast(`⚡ FLASH SALE LIVE: "${title}" broadcasted to all shoppers!`);
}

function endFlashSaleNow() {
    if (confirm("Are you sure you want to end the active Flash Sale immediately?")) {
        flashSaleConfig.isActive = false;
        saveFlashSaleToStorage(true);
        renderProducts();
        updateFlashBanner();
        renderAdminSalesTab();
        showToast("⏹️ Flash sale ended and prices reverted to normal.");
    }
}

// =========================================================
// 13. Dynamic Top Flash Announcement Banner & Social Proof
// =========================================================
function initFlashCountdown() {
    updateFlashBanner();
    setInterval(updateFlashBanner, 1000);
}

function updateFlashBanner() {
    const timerEl = document.getElementById("flashTimer");
    const banner = document.getElementById("flashBanner");
    const badge = document.getElementById("flashBadge");
    const text = document.getElementById("flashText");
    const shopBtn = document.getElementById("flashShopBtn");
    if (!timerEl || !banner) return;

    if (flashSaleConfig && flashSaleConfig.isActive && flashSaleConfig.endsAt) {
        const remainingMs = flashSaleConfig.endsAt - Date.now();
        if (remainingMs > 0) {
            banner.style.display = "flex";
            const totalSec = Math.floor(remainingMs / 1000);
            const h = Math.floor(totalSec / 3600).toString().padStart(2, "0");
            const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, "0");
            const s = (totalSec % 60).toString().padStart(2, "0");
            timerEl.innerText = `${h}h : ${m}m : ${s}s`;

            if (badge) {
                badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block; vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> FLASH SALE LIVE`;
            }
            if (text) {
                text.innerHTML = `<strong>${escapeHtml(flashSaleConfig.title || 'FLASH SALE')}</strong> — Up to <strong>${flashSaleConfig.discountPercent}% OFF</strong> on Selected Items!`;
            }
            if (shopBtn) shopBtn.style.display = "inline-block";
        } else {
            // Expired -> Hide banner completely and revert sale state
            banner.style.display = "none";
            timerEl.innerText = "00h : 00m : 00s";
            if (flashSaleConfig.isActive) {
                flashSaleConfig.isActive = false;
                saveFlashSaleToStorage(true);
                renderProducts();
                if (isAdminLoggedIn()) {
                    renderAdminSalesTab();
                }
            }
        }
    } else {
        // Inactive / Ended by Admin -> Hide banner completely
        banner.style.display = "none";
        timerEl.innerText = "00h : 00m : 00s";
    }

    updateAdminTimerPreview();
}

function closeFlashBanner() {
    const banner = document.getElementById("flashBanner");
    if (banner) banner.style.display = "none";
}

function startSocialProofToasts() {
    const cities = ["New York", "London", "San Francisco", "Austin", "Tokyo", "Berlin", "Toronto", "Sydney"];
    const buyers = ["Alex", "Sophia", "Liam", "Emma", "Oliver", "Lucas", "Maya", "Daniel"];

    setInterval(() => {
        if (products.length === 0) return;
        // Only trigger if cart or checkout is not open to avoid distraction
        const checkoutModal = document.getElementById("checkoutModal");
        if (checkoutModal && checkoutModal.style.display === "flex") return;

        const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
        const randomCity = cities[Math.floor(Math.random() * cities.length)];
        const randomProduct = products[Math.floor(Math.random() * products.length)];

        showToast(`⚡ ${randomBuyer} from ${randomCity} just purchased ${randomProduct.name.split(" ")[0]}!`);
    }, 32000);
}

// =========================================================
// 12. Real-Time Live Shopper Presence & Customer Delight
// =========================================================
const CURRENT_TAB_SHOPPER_ID = "shopper_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now();
let shopperHeartbeatTimer = null;

function initRealTimeShopperPresence() {
    registerCurrentShopper();

    // Heartbeat every 2.5 seconds to refresh presence & purge stale sessions (>6s)
    if (shopperHeartbeatTimer) clearInterval(shopperHeartbeatTimer);
    shopperHeartbeatTimer = setInterval(() => {
        heartbeatShopper();
    }, 2500);

    // Clean up on tab close or page navigate
    window.addEventListener("beforeunload", () => {
        unregisterCurrentShopper();
    });
    window.addEventListener("pagehide", () => {
        unregisterCurrentShopper();
    });

    // Update UI count immediately
    updateLiveShoppersDisplay();
}

function getActiveShoppersMap() {
    const raw = localStorage.getItem("modernshop_live_shoppers");
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw);
        const now = Date.now();
        const valid = {};
        // Prune any tab that hasn't sent a heartbeat in 6 seconds
        Object.keys(parsed).forEach(id => {
            if (now - parsed[id] < 6000) {
                valid[id] = parsed[id];
            }
        });
        return valid;
    } catch (e) {
        return {};
    }
}

function registerCurrentShopper() {
    const shoppers = getActiveShoppersMap();
    shoppers[CURRENT_TAB_SHOPPER_ID] = Date.now();
    localStorage.setItem("modernshop_live_shoppers", JSON.stringify(shoppers));
    if (syncStore) {
        syncStore.broadcast("SHOPPER_PRESENCE_UPDATE", { count: Object.keys(shoppers).length });
    }
    updateLiveShoppersDisplay();
}

function heartbeatShopper() {
    const shoppers = getActiveShoppersMap();
    shoppers[CURRENT_TAB_SHOPPER_ID] = Date.now();
    localStorage.setItem("modernshop_live_shoppers", JSON.stringify(shoppers));
    updateLiveShoppersDisplay();
}

function unregisterCurrentShopper() {
    const shoppers = getActiveShoppersMap();
    delete shoppers[CURRENT_TAB_SHOPPER_ID];
    localStorage.setItem("modernshop_live_shoppers", JSON.stringify(shoppers));
    if (syncStore) {
        syncStore.broadcast("SHOPPER_PRESENCE_UPDATE", { count: Object.keys(shoppers).length });
    }
}

function updateLiveShoppersDisplay(countOverride = null) {
    const userEl = document.getElementById("statLiveUsers");
    if (!userEl) return;

    let count = countOverride;
    if (count === null || count === undefined) {
        const shoppers = getActiveShoppersMap();
        count = Math.max(1, Object.keys(shoppers).length);
    }
    userEl.innerText = count;
}

function calculateCustomerDelight() {
    if (!productReviews || productReviews.length === 0) {
        return "0%";
    }

    const totalStars = productReviews.reduce((sum, r) => sum + Number(r.stars), 0);
    const avgStars = totalStars / productReviews.length;
    const delightPercent = (avgStars / 5.0) * 100;
    return `${delightPercent.toFixed(0)}%`;
}

function updateStockStats() {
    const stockEl = document.getElementById("statStockTotal");
    if (stockEl) {
        const totalQty = (cart || []).reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
        stockEl.innerText = totalQty.toString();
    }

    const delightEl = document.getElementById("statCustomerDelight");
    if (delightEl) {
        delightEl.innerText = calculateCustomerDelight();
    }
}

// =========================================================
// 13. Toast Notification Component
// =========================================================
function showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <span class="pulse-dot"></span>
        <span style="flex:1;">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3800);
}

// Global modal backdrop click dismissal
window.onclick = function(event) {
    const cartModal = document.getElementById("cartModal");
    const productModal = document.getElementById("productModal");
    const checkoutModal = document.getElementById("checkoutModal");
    const trackingModal = document.getElementById("orderTrackingModal");
    const ordersHistoryModal = document.getElementById("ordersHistoryModal");
    const wishlistModal = document.getElementById("wishlistModal");
    const adminLoginModal = document.getElementById("adminLoginModal");
    const adminModal = document.getElementById("adminModal");

    if (event.target === cartModal) toggleCart();
    if (event.target === productModal) closeProductModal();
    if (event.target === checkoutModal) closeCheckoutModal();
    if (event.target === trackingModal) closeTrackingModal();
    if (event.target === ordersHistoryModal) closeOrdersModal();
    if (event.target === wishlistModal) closeWishlistModal();
    if (event.target === adminLoginModal) closeAdminLoginModal();
    if (event.target === adminModal) closeAdminPanel();
};
// Set in js/config.js — local Wi-Fi or permanent cloud API
const API_BASE_URL = window.GSR_API_BASE;

let cart = JSON.parse(localStorage.getItem("gsrCart") || "[]");

function saveCart() {
  localStorage.setItem("gsrCart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (badge) {
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? "flex" : "none";
  }
}

function showAlert(message, type = "success") {
  const existing = document.querySelector(".alert-toast");
  if (existing) existing.remove();

  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show alert-toast`;
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 4000);
}

const API_RETRY_COUNT = 3;
const API_RETRY_DELAY_MS = 800;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkBackendHealth() {
  const res = await fetch(`${API_BASE_URL}/health`, { method: "GET" });
  return res.ok;
}

async function apiRequest(url, options = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= API_RETRY_COUNT; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: { "Content-Type": "application/json", ...options.headers },
        ...options,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message =
          data.message ||
          (data.errors ? Object.values(data.errors).join(", ") : "Request failed");
        throw new Error(message);
      }

      return data;
    } catch (error) {
      lastError = error;
      const isNetwork =
        error.message === "Failed to fetch" ||
        error.name === "TypeError" ||
        error.message.includes("NetworkError");

      if (isNetwork && attempt < API_RETRY_COUNT) {
        await delay(API_RETRY_DELAY_MS * attempt);
        continue;
      }

      if (isNetwork) {
        throw new Error(
          "Cannot connect to backend. 1) Double-click START-BACKEND.bat and keep that window open. 2) Open the site at http://localhost:5500 (not by double-clicking index.html). 3) Refresh this page."
        );
      }
      throw error;
    }
  }

  throw lastError;
}

function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === path);
  });
}

async function loadProducts() {
  const container = document.getElementById("productsContainer");
  const searchInput = document.getElementById("productSearch");

  if (!container) return;

  try {
    const products = await apiRequest("/products");
    renderProducts(products);

    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filtered = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
        renderProducts(filtered);
      });
    }
  } catch (error) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-danger">${error.message}. Ensure the backend is running on port 8080.</div></div>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function renderProducts(products) {
  const container = document.getElementById("productsContainer");

  if (!products.length) {
    container.innerHTML = '<div class="col-12 empty-state"><p>No products found.</p></div>';
    return;
  }

  container.innerHTML = products
    .map(
      (product) => `
    <div class="col-md-6 col-lg-4 mb-4">
      <div class="card product-card h-100">
        <img src="${escapeHtml(product.image || "https://via.placeholder.com/400x200?text=GSR+Product")}" class="card-img-top" alt="${escapeHtml(product.name)}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${escapeHtml(product.name)}</h5>
          <p class="card-text text-muted flex-grow-1">${escapeHtml(product.description || "")}</p>
          <p class="price-tag">₹${Number(product.price).toFixed(2)}</p>
          <button type="button" class="btn btn-primary w-100 btn-add-cart"
            data-id="${product.id}"
            data-name="${escapeHtml(product.name)}"
            data-price="${product.price}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".btn-add-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(
        Number(btn.dataset.id),
        btn.dataset.name,
        Number(btn.dataset.price)
      );
    });
  });
}

function addToCart(id, name, price) {
  cart.push({ id, name, price, addedAt: new Date().toISOString() });
  saveCart();
  showAlert(`<strong>${name}</strong> added to cart!`);
}

function setupConsultationForm() {
  const form = document.getElementById("consultationForm");
  if (!form) return;

  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      problem: document.getElementById("problem").value.trim(),
      mode: document.getElementById("mode").value,
      date: document.getElementById("date").value,
    };

    try {
      const result = await apiRequest("/consultations", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showAlert(`Consultation booked successfully! Reference ID: <strong>#${result.id}</strong>`);
      form.reset();
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

function setupTrackingForm() {
  const form = document.getElementById("trackingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const orderId = document.getElementById("orderId").value.trim();
    const resultBox = document.getElementById("trackingResult");

    try {
      const order = await apiRequest(`/orders/${orderId}`);
      resultBox.innerHTML = `
        <div class="info-card p-4 mt-3">
          <h5>Order #${order.id}</h5>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
        </div>
      `;
      resultBox.classList.remove("d-none");
    } catch (error) {
      resultBox.innerHTML = `<div class="alert alert-danger mt-3">${error.message}</div>`;
      resultBox.classList.remove("d-none");
    }
  });
}

function setupAdminProductForm() {
  const form = document.getElementById("adminProductForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("productName").value.trim(),
      price: parseFloat(document.getElementById("productPrice").value),
      description: document.getElementById("productDescription").value.trim(),
      image: document.getElementById("productImage").value.trim(),
    };

    try {
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      showAlert("Product added successfully!");
      form.reset();
      if (document.getElementById("productsContainer")) {
        loadProducts();
      }
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

function setupAdminOrderForm() {
  const form = document.getElementById("adminOrderForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const orderId = document.getElementById("updateOrderId").value.trim();
    const status = document.getElementById("orderStatus").value;

    try {
      const order = await apiRequest(`/orders/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      showAlert(`Order #${order.id} updated to <strong>${order.status}</strong>`);
      form.reset();
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

async function loadConsultationsAdmin() {
  const tableBody = document.getElementById("consultationsTableBody");
  if (!tableBody) return;

  try {
    const consultations = await apiRequest("/consultations");

    if (!consultations.length) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="text-center text-muted">No consultations yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = consultations
      .map(
        (c) => `
      <tr>
        <td>${c.id}</td>
        <td>${c.name}</td>
        <td>${c.phone}</td>
        <td>${c.problem}</td>
        <td><span class="badge bg-success">${c.mode}</span></td>
        <td>${c.date}</td>
      </tr>
    `
      )
      .join("");
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger">${error.message}</td></tr>`;
  }
}

function setupPlaceOrder() {
  const btn = document.getElementById("placeOrderBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    if (cart.length === 0) {
      showAlert("Your cart is empty. Add products first.", "warning");
      return;
    }

    const customerName = prompt("Enter your name to place an order:");
    if (!customerName) return;

    try {
      const order = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify({ customerName: customerName.trim() }),
      });
      cart = [];
      saveCart();
      showAlert(`Order placed! Your Order ID is <strong>#${order.id}</strong>. Track it on the Tracking page.`);
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

async function showConnectionStatus() {
  const nav = document.querySelector(".navbar .container");
  if (!nav || document.getElementById("apiStatusBadge")) return;

  const badge = document.createElement("span");
  badge.id = "apiStatusBadge";
  badge.className = "badge ms-2 d-none d-lg-inline";
  nav.querySelector(".navbar-brand")?.appendChild(badge);

  try {
    const ok = await checkBackendHealth();
    badge.textContent = ok ? "API Online" : "API Offline";
    badge.className += ok ? " bg-success" : " bg-danger";
  } catch {
    badge.textContent = "API Offline";
    badge.className += " bg-danger";
    badge.title = "Run START-BACKEND.bat, then open http://localhost:5500";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav();
  updateCartBadge();
  showConnectionStatus();
  loadProducts();
  setupConsultationForm();
  setupTrackingForm();
  setupAdminProductForm();
  setupAdminOrderForm();
  loadConsultationsAdmin();
  setupPlaceOrder();
});

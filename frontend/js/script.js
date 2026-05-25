const API_BASE_URL = window.GSR_API_BASE;

const ORDER_STATUS_LABELS = {
  Ordered: "Order placed",
  Processing: "Processing",
  Shipped: "Shipped",
  OutForDelivery: "Out for delivery",
  Delivered: "Delivered",
  Closed: "Closed",
};

function orderStatusLabel(s) {
  return ORDER_STATUS_LABELS[s] || s;
}

let cart = JSON.parse(localStorage.getItem("gsrCart") || "[]");

function getCartCount() {
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
}

function saveCart() {
  localStorage.setItem("gsrCart", JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  const count = getCartCount();
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function showAlert(message, type = "success") {
  const existing = document.querySelector(".alert-toast");
  if (existing) existing.remove();
  const alert = document.createElement("div");
  alert.className = `alert alert-${type} alert-dismissible fade show alert-toast`;
  alert.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 5000);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiRequest(url, options = {}) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          "Content-Type": "application/json",
          ...(typeof getAuthHeaders === "function" ? getAuthHeaders() : {}),
          ...options.headers,
        },
        ...options,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = data.message || (data.errors ? Object.values(data.errors).join(", ") : "Request failed");
        throw new Error(message);
      }
      return data;
    } catch (error) {
      const isNetwork = error.message === "Failed to fetch" || error.name === "TypeError";
      if (isNetwork && attempt < 3) {
        await delay(800 * attempt);
        continue;
      }
      if (isNetwork) {
        throw new Error("Cannot connect to backend. Run START-ALL.bat and open http://localhost:5500");
      }
      throw error;
    }
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

function setActiveNav() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === path);
  });
}

function addToCart(id, name, price, medicineId) {
  const sid = String(id);
  const existing = cart.find((c) => c.id === sid);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: sid, name, price: Number(price), quantity: 1, medicineId: medicineId || name });
  }
  saveCart();
  showAlert(`<strong>${escapeHtml(name)}</strong> added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter((c) => c.id !== String(id));
  saveCart();
  renderCheckoutCart();
}

function updateCartQty(id, qty) {
  const item = cart.find((c) => c.id === String(id));
  if (item) {
    item.quantity = Math.max(1, qty);
    saveCart();
    renderCheckoutCart();
  }
}

function renderCheckoutCart() {
  const container = document.getElementById("checkoutCartItems");
  const totalEl = document.getElementById("checkoutTotal");
  if (!container) return;

  if (!cart.length) {
    container.innerHTML = '<p class="text-muted">Cart is empty. <a href="medicines.html">Add medicines</a></p>';
    if (totalEl) totalEl.textContent = "₹0.00";
    return;
  }

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-line d-flex justify-content-between align-items-center mb-2">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <br><small class="text-muted">₹${item.price.toFixed(2)} × ${item.quantity}</small>
      </div>
      <div class="d-flex align-items-center gap-2">
        <input type="number" min="1" value="${item.quantity}" class="form-control form-control-sm qty-input"
          data-id="${item.id}" style="width:60px">
        <button type="button" class="btn btn-sm btn-outline-danger btn-remove-cart" data-id="${item.id}">×</button>
      </div>
    </div>
  `
    )
    .join("");

  container.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", () => updateCartQty(input.dataset.id, parseInt(input.value, 10)));
  });
  container.querySelectorAll(".btn-remove-cart").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
  });

  if (totalEl) totalEl.textContent = `₹${getCartTotal().toFixed(2)}`;
}

function setupCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  renderCheckoutCart();

  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  if (user?.role === "CUSTOMER") {
    const nameEl = document.getElementById("customerName");
    const phoneEl = document.getElementById("phone");
    const emailEl = document.getElementById("email");
    if (nameEl && user.name) nameEl.value = user.name;
    if (phoneEl && user.phone) phoneEl.value = user.phone;
    if (emailEl && user.email) emailEl.value = user.email;
  } else {
    const savedPhone = localStorage.getItem("gsrPhone");
    if (savedPhone) {
      const phoneInput = document.getElementById("phone");
      if (phoneInput) phoneInput.value = savedPhone;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!cart.length) {
      showAlert("Cart is empty.", "warning");
      return;
    }

    const phone = document.getElementById("phone").value.trim();
    localStorage.setItem("gsrPhone", phone);

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "COD";

    const payload = {
      customerName: document.getElementById("customerName").value.trim(),
      phone,
      email: document.getElementById("email").value.trim() || null,
      address: document.getElementById("address").value.trim(),
      paymentMethod,
      items: cart.map((c) => ({
        productId: c.id,
        medicineId: c.medicineId || c.name,
        productName: c.medicineId || c.name,
        quantity: c.quantity,
        price: c.price,
      })),
    };

    try {
      const order = await apiRequest("/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      cart = [];
      saveCart();
      form.classList.add("d-none");
      document.querySelector(".col-lg-5")?.classList.add("d-none");
      const success = document.getElementById("orderSuccess");
      const msg = document.getElementById("orderSuccessMsg");
      if (success && msg) {
        msg.innerHTML = `Order ID: <strong>#${order.id}</strong><br>Total: ₹${order.totalAmount.toFixed(2)}<br>Payment: ${order.paymentMethod} (${order.paymentStatus})`;
        success.classList.remove("d-none");
      }
      showAlert("Order placed successfully!");
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN");
}

function renderOrderCard(order, showPhone = false) {
  const itemsHtml = (order.items || [])
    .map((i) => `<li><strong>${escapeHtml(i.medicineId || i.productName)}</strong> × ${i.quantity} — ₹${(i.price * i.quantity).toFixed(2)}</li>`)
    .join("");

  return `
    <div class="info-card p-4 mb-3">
      <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
        <h5 class="mb-0">Order #${order.id}</h5>
        <span class="status-badge status-${order.status}">${orderStatusLabel(order.status)}</span>
      </div>
      <p class="mb-1"><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
      ${showPhone ? `<p class="mb-1"><strong>Customer:</strong> ${escapeHtml(order.customerName)} (${escapeHtml(order.phone)})</p>` : ""}
      <p class="mb-1"><strong>Total:</strong> <span class="price-tag">₹${Number(order.totalAmount).toFixed(2)}</span></p>
      <p class="mb-1"><strong>Payment:</strong> ${order.paymentMethod} — <span class="badge bg-${order.paymentStatus === "Paid" ? "success" : "warning"}">${order.paymentStatus}</span></p>
      ${order.address ? `<p class="mb-2 text-muted small"><i class="bi bi-geo-alt"></i> ${escapeHtml(order.address)}</p>` : ""}
      <ul class="mb-0 small">${itemsHtml || "<li>No items</li>"}</ul>
    </div>
  `;
}

function setupOrderHistoryForm() {
  const form = document.getElementById("orderHistoryForm");
  if (!form) return;

  if (typeof requireCustomer === "function" && !requireCustomer()) return;

  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  const phoneInput = document.getElementById("historyPhone");
  if (user?.phone && phoneInput) {
    phoneInput.value = user.phone;
    phoneInput.readOnly = true;
  }

  const savedPhone = localStorage.getItem("gsrPhone");
  if (savedPhone && phoneInput && !phoneInput.value) phoneInput.value = savedPhone;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const phone = document.getElementById("historyPhone").value.trim();
    localStorage.setItem("gsrPhone", phone);
    const list = document.getElementById("ordersList");

    try {
      const orders = await apiRequest(`/orders?phone=${encodeURIComponent(phone)}`);
      if (!orders.length) {
        list.innerHTML = '<div class="empty-state"><p>No orders found for this phone number.</p></div>';
        return;
      }
      list.innerHTML = orders.map((o) => renderOrderCard(o)).join("");
    } catch (error) {
      list.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
    }
  });

  if (savedPhone) form.dispatchEvent(new Event("submit"));
}

async function loadMedicines() {
  const container = document.getElementById("medicinesContainer");
  const searchInput = document.getElementById("medicineSearch");
  if (!container) return;

  try {
    const medicines = await apiRequest("/products");
    const render = (list) => {
      if (!list.length) {
        container.innerHTML = '<div class="col-12 empty-state"><p>No medicines found.</p></div>';
        return;
      }
      container.innerHTML = list
        .map((medicine) => {
          const usage = medicine.usageInstructions || "Follow your doctor's prescribed dosage.";
          const medId = medicine.medicineId || medicine.id;
          const label = medicine.name || medicine.description || "";
          return `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card medicine-card h-100">
            <img src="${escapeHtml(medicine.image || "images/logo.png")}" class="card-img-top" alt="${escapeHtml(medId)}">
            <div class="card-body d-flex flex-column">
              <p class="medicine-id-tag mb-1">${escapeHtml(medId)}</p>
              ${label ? `<p class="card-text text-muted small mb-2">${escapeHtml(label)}</p>` : ""}
              <p class="card-text text-muted flex-grow-1">${escapeHtml(medicine.description || "")}</p>
              <div class="usage-box mb-3">
                <strong><i class="bi bi-clock-history me-1"></i>Usage:</strong>
                <p class="mb-0 small">${escapeHtml(usage)}</p>
              </div>
              <p class="price-tag">₹${Number(medicine.price).toFixed(2)}</p>
              <button type="button" class="btn btn-primary w-100 mb-2 btn-add-cart"
                data-id="${medicine.id}" data-medicine-id="${escapeHtml(medId)}" data-name="${escapeHtml(medId)}" data-price="${medicine.price}">Add to Cart</button>
              <button type="button" class="btn btn-outline-success w-100 btn-set-alarm"
                data-name="${escapeHtml(medId)}" data-usage="${escapeHtml(usage)}">
                <i class="bi bi-alarm me-1"></i>Set Usage Alarm
              </button>
            </div>
          </div>
        </div>`;
        })
        .join("");
      container.querySelectorAll(".btn-add-cart").forEach((btn) => {
        btn.addEventListener("click", () =>
          addToCart(btn.dataset.id, btn.dataset.name, Number(btn.dataset.price), btn.dataset.medicineId)
        );
      });
      container.querySelectorAll(".btn-set-alarm").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (typeof setMedicineAlarm === "function") {
            setMedicineAlarm(btn.dataset.name, btn.dataset.usage);
          } else {
            window.location.href = `alarms.html?medicine=${encodeURIComponent(btn.dataset.name)}&usage=${encodeURIComponent(btn.dataset.usage)}`;
          }
        });
      });
    };
    render(medicines);
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase();
        render(
          medicines.filter(
            (m) =>
              (m.medicineId || "").toLowerCase().includes(q) ||
              (m.name || "").toLowerCase().includes(q) ||
              (m.description || "").toLowerCase().includes(q) ||
              (m.usageInstructions || "").toLowerCase().includes(q)
          )
        );
      });
    }
  } catch (error) {
    container.innerHTML = `<div class="col-12 alert alert-danger">${error.message}</div>`;
  }
}

function setupConsultationForm() {
  const form = document.getElementById("consultationForm");
  if (!form) return;
  const dateInput = document.getElementById("date");
  const feeEl = document.getElementById("consultationFeeDisplay");
  const doctorEl = document.getElementById("doctorNameDisplay");
  const clinic = window.GSR_CLINIC || { consultationFee: 500, defaultDoctor: "Dr. GSR Teja" };
  if (feeEl) feeEl.textContent = `₹${clinic.consultationFee}`;
  if (doctorEl) doctorEl.textContent = clinic.defaultDoctor;
  if (dateInput) dateInput.min = new Date().toISOString().split("T")[0];

  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  const nameInput = document.getElementById("name");
  const phoneInput = document.getElementById("phone");
  if (user?.name && nameInput) nameInput.value = user.name;
  if (user?.phone && phoneInput) phoneInput.value = user.phone;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payNow = document.getElementById("payConsultNow")?.checked ?? true;
    const paymentMethod = document.querySelector('input[name="consultPayment"]:checked')?.value || "UPI";
    try {
      const result = await apiRequest("/consultations/book", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("name").value.trim(),
          phone: document.getElementById("phone").value.trim(),
          problem: document.getElementById("problem").value.trim(),
          date: document.getElementById("date").value,
          doctorName: clinic.defaultDoctor,
          consultationFee: clinic.consultationFee,
          paymentMethod,
          payNow,
        }),
      });
      localStorage.setItem("gsrPhone", document.getElementById("phone").value.trim());
      const payMsg = result.paymentStatus === "Paid" ? "Consultation fee marked paid." : "Pay fee at clinic / before session.";
      showAlert(`Booked with <strong>${escapeHtml(result.doctorName)}</strong>! Ref <strong>#${result.id}</strong>. ${payMsg}`);
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
    const resultBox = document.getElementById("trackingResult");
    try {
      const order = await apiRequest(`/orders/${document.getElementById("orderId").value.trim()}`);
      resultBox.innerHTML = renderOrderCard(order, true);
      resultBox.classList.remove("d-none");
    } catch (error) {
      resultBox.innerHTML = `<div class="alert alert-danger mt-3">${error.message}</div>`;
      resultBox.classList.remove("d-none");
    }
  });
}

/* loadConsultationsAdmin defined in clinic.js for admin panel */

async function loadAdminMedicines() {
  const container = document.getElementById("adminMedicinesList");
  if (!container) return;
  try {
    const medicines = await apiRequest("/products");
    if (!medicines.length) {
      container.innerHTML = '<p class="text-muted">No medicines in database.</p>';
      return;
    }
    container.innerHTML = `
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-success">
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Usage</th>
              <th class="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            ${medicines
              .map(
                (m) => `
              <tr>
                <td><strong class="medicine-id-tag">${escapeHtml(m.medicineId || m.id)}</strong><br><small class="text-muted">${escapeHtml(m.name || m.description || "")}</small></td>
                <td>₹${Number(m.price).toFixed(2)}</td>
                <td class="small">${escapeHtml(m.usageInstructions || "—")}</td>
                <td class="text-end">
                  <button type="button" class="btn btn-sm btn-outline-danger btn-delete-medicine" data-id="${m.id}" data-name="${escapeHtml(m.medicineId || m.id)}">
                    <i class="bi bi-trash"></i> Delete
                  </button>
                </td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>
      </div>`;
    container.querySelectorAll(".btn-delete-medicine").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const name = btn.dataset.name;
        if (!confirm(`Delete medicine ID "${name}"? This cannot be undone.`)) return;
        try {
          await apiRequest(`/products/${btn.dataset.id}`, { method: "DELETE" });
          showAlert(`"${name}" deleted.`);
          loadAdminMedicines();
        } catch (error) {
          showAlert(error.message, "danger");
        }
      });
    });
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function loadOrdersAdmin() {
  const container = document.getElementById("adminOrdersList");
  if (!container) return;
  try {
    const orders = await apiRequest("/orders");
    container.innerHTML = orders.length
      ? orders.map((o) => renderOrderCard(o, true)).join("")
      : '<p class="text-muted">No orders yet.</p>';
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

function setupAdminProductForm() {
  const form = document.getElementById("adminProductForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const medicineId = document.getElementById("productMedicineId").value.trim().toUpperCase();
      const descName = document.getElementById("productName").value.trim();
      await apiRequest("/products", {
        method: "POST",
        body: JSON.stringify({
          medicineId,
          name: descName || medicineId,
          price: parseFloat(document.getElementById("productPrice").value),
          description: document.getElementById("productDescription").value.trim(),
          image: document.getElementById("productImage").value.trim(),
          usageInstructions: document.getElementById("productUsage").value.trim(),
        }),
      });
      showAlert("Medicine added!");
      form.reset();
      loadAdminMedicines();
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
    try {
      const order = await apiRequest(`/orders/${document.getElementById("updateOrderId").value.trim()}`, {
        method: "PUT",
        body: JSON.stringify({ status: document.getElementById("orderStatus").value }),
      });
      showAlert(`Order #${order.id} → ${order.status}`);
      form.reset();
      loadOrdersAdmin();
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
    const ok = (await fetch(`${API_BASE_URL}/health`)).ok;
    badge.textContent = ok ? "API Online" : "API Offline";
    badge.className += ok ? " bg-success" : " bg-danger";
  } catch {
    badge.textContent = "API Offline";
    badge.className += " bg-danger";
  }
}

function renderContactFooter() {
  const c = window.GSR_CONTACT;
  if (!c) return;

  document.querySelectorAll("[data-gsr-email]").forEach((el) => {
    el.innerHTML = `<a href="${c.mailto}" class="text-white text-decoration-none"><i class="bi bi-envelope me-2"></i>${c.email}</a>`;
  });

  const footer = document.querySelector(".footer .container");
  if (!footer || footer.querySelector(".gsr-footer-contact")) return;

  if (!footer.querySelector("h5")?.textContent?.includes("Contact")) {
    const block = document.createElement("p");
    block.className = "text-center mb-2 small gsr-footer-contact";
    block.innerHTML = `<a href="${c.tel}" class="text-white text-decoration-none"><i class="bi bi-telephone-fill me-1"></i>${c.display}</a>`;
    const copy = footer.querySelector(".text-center.mb-0, p.mb-0");
    if (copy) footer.insertBefore(block, copy);
    else footer.appendChild(block);
  }
}

async function getMobileAccessUrl(port) {
  const host = window.location.hostname;
  if (host.startsWith("192.168.") || host.startsWith("10.")) {
    return `${window.location.protocol}//${host}:${port}`;
  }
  try {
    const res = await fetch("mobile-url.txt", { cache: "no-store" });
    if (res.ok) {
      const url = (await res.text()).trim();
      if (url.startsWith("http")) return url;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function renderWhatsAppShortcut() {
  if (!window.GSR_CONTACT) return;
  const homeBtn = document.getElementById("homeWhatsappBtn");
  if (homeBtn) {
    const t = encodeURIComponent("Hello GSR Homeo Care Centre, I need online help.");
    homeBtn.href = `${window.GSR_CONTACT.whatsapp}?text=${t}`;
  }
  if (document.getElementById("gsrWhatsappFloat")) return;
  const float = document.createElement("a");
  float.id = "gsrWhatsappFloat";
  float.className = "gsr-whatsapp-float";
  float.href = `${window.GSR_CONTACT.whatsapp}?text=${encodeURIComponent("Hello GSR Homeo Care Centre")}`;
  float.target = "_blank";
  float.rel = "noopener";
  float.title = "Chat on WhatsApp";
  float.innerHTML = '<i class="bi bi-whatsapp"></i>';
  document.body.appendChild(float);
}

async function renderAccessLinks() {
  const box = document.getElementById("accessLinksBox");
  if (!box || !window.GSR_CONTACT) return;

  const port = window.location.port || "5500";
  const windowsUrl = `http://localhost:${port}`;
  const mobileUrl = await getMobileAccessUrl(port);

  box.innerHTML = `
    <div class="row g-3 text-start">
      <div class="col-md-6">
        <div class="p-3 border rounded bg-white h-100">
          <h6 class="mb-2"><i class="bi bi-windows me-2"></i>Windows (this PC)</h6>
          <a href="${windowsUrl}" class="fw-semibold">${windowsUrl}</a>
        </div>
      </div>
      <div class="col-md-6">
        <div class="p-3 border rounded bg-white h-100">
          <h6 class="mb-2"><i class="bi bi-phone me-2"></i>Mobile (same Wi-Fi)</h6>
          ${
            mobileUrl
              ? `<a href="${mobileUrl}" class="fw-semibold">${mobileUrl}</a>`
              : `<span class="text-muted small">Run <strong>MOBILE-LINK.bat</strong> on PC for your phone link</span>`
          }
        </div>
      </div>
      <div class="col-12 text-center">
        <a href="chat.html" class="btn btn-primary me-2"><i class="bi bi-chat-dots"></i> Online Chat</a>
        <a href="${window.GSR_CONTACT.whatsapp}" class="btn btn-success me-2" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> WhatsApp</a>
        <a href="${window.GSR_CONTACT.tel}" class="btn btn-outline-primary"><i class="bi bi-telephone"></i> Call</a>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.requireAdmin === "true" && typeof requireAdmin === "function") {
    if (!requireAdmin()) return;
  }

  setActiveNav();
  updateCartBadge();
  if (typeof renderAuthNav === "function") renderAuthNav();
  renderContactFooter();
  renderAccessLinks();
  renderWhatsAppShortcut();
  showConnectionStatus();
  loadMedicines();
  setupCheckoutForm();
  setupOrderHistoryForm();
  setupConsultationForm();
  setupTrackingForm();
  setupAdminProductForm();
  setupAdminOrderForm();
  loadConsultationsAdmin();
  loadOrdersAdmin();
  loadAdminMedicines();
});

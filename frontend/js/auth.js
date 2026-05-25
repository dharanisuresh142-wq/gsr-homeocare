const AUTH_TOKEN_KEY = "gsrAuthToken";
const AUTH_USER_KEY = "gsrAuthUser";

/** Same website — add ?staff=1 (not linked for customers) */
const ADMIN_LOGIN_URL = "login.html?staff=1";

function isStaffLoginMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get("staff") === "1" || window.location.hash === "#staff";
}

function initLoginPageMode() {
  if (!document.getElementById("customerLoginArea")) return;

  const staffArea = document.getElementById("staffLoginArea");
  const customerArea = document.getElementById("customerLoginArea");
  const title = document.getElementById("loginPageTitle");

  if (isStaffLoginMode()) {
    customerArea?.classList.add("d-none");
    staffArea?.classList.remove("d-none");
    if (title) title.textContent = "Admin login";
    document.title = "Admin Login | GSR Homeo Care Centre";
  } else {
    customerArea?.classList.remove("d-none");
    staffArea?.classList.add("d-none");
  }
}

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function getAuthUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
  } catch {
    return null;
  }
}

function setAuth(auth) {
  localStorage.setItem(AUTH_TOKEN_KEY, auth.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(auth));
  if (auth.phone) localStorage.setItem("gsrPhone", auth.phone);
}

function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function isLoggedIn() {
  return !!getAuthToken();
}

function isAdmin() {
  return getAuthUser()?.role === "ADMIN";
}

function isCustomer() {
  return getAuthUser()?.role === "CUSTOMER";
}

function getAuthHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function renderAuthNav() {
  const slot = document.getElementById("authNav");
  if (!slot) return;

  const user = getAuthUser();
  if (user) {
    const label = user.role === "ADMIN" ? "Admin" : user.name || user.phone;
    slot.innerHTML = `
      <li class="nav-item dropdown">
        <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">${escapeHtml(label)}</a>
        <ul class="dropdown-menu dropdown-menu-end">
          ${user.role === "ADMIN" ? '<li><a class="dropdown-item" href="admin.html"><i class="bi bi-speedometer2 me-2"></i>Admin Panel</a></li>' : ""}
          ${user.role === "CUSTOMER" ? `
          <li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-heart-pulse me-2"></i>My Health</a></li>
          <li><a class="dropdown-item" href="prescriptions.html"><i class="bi bi-file-medical me-2"></i>Prescriptions</a></li>
          <li><a class="dropdown-item" href="orders.html"><i class="bi bi-bag me-2"></i>My Orders</a></li>
          <li><a class="dropdown-item" href="followups.html"><i class="bi bi-calendar-check me-2"></i>Follow-ups</a></li>` : ""}
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="logoutBtn"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
        </ul>
      </li>`;
    document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
      e.preventDefault();
      await logout();
    });
  } else {
    slot.innerHTML = `
      <li class="nav-item"><a class="nav-link" href="login.html"><i class="bi bi-person me-1"></i>Login</a></li>
      <li class="nav-item"><a class="nav-link" href="login.html#register"><i class="bi bi-person-plus me-1"></i>Register</a></li>`;
  }

  document.querySelectorAll('.nav-link[href="admin.html"]').forEach((link) => {
    link.closest(".nav-item")?.remove();
  });
}

async function logout() {
  try {
    if (typeof apiRequest === "function" && getAuthToken()) {
      await apiRequest("/auth/logout", { method: "POST" });
    }
  } catch {
    /* ignore */
  }
  clearAuth();
  showAlert?.("Logged out successfully", "success");
  const onAdminArea =
    window.location.pathname.includes("admin") || document.body.dataset.requireAdmin === "true";
  window.location.href = onAdminArea ? ADMIN_LOGIN_URL : "index.html";
}

function requireAdmin() {
  if (isAdmin() && getAuthToken()) return true;
  window.location.href = "login.html?staff=1&redirect=admin.html";
  return false;
}

function requireCustomer() {
  if (isCustomer() && getAuthToken()) return true;
  window.location.href = "login.html?redirect=orders.html";
  return false;
}

function openLoginTab(hash) {
  if (hash === "#register") {
    document.querySelector('#loginTabs button[data-bs-target="#registerTab"]')?.click();
  }
}

function setupCustomerLoginPage() {
  const customerForm = document.getElementById("customerLoginForm");
  const registerForm = document.getElementById("registerForm");
  if (!customerForm && !registerForm) return;
  if (isStaffLoginMode()) return;

  openLoginTab(window.location.hash);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect");

  customerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await doLogin(
      {
        username: document.getElementById("customerPhone").value.trim(),
        password: document.getElementById("customerPassword").value,
        loginType: "customer",
      },
      redirect || "index.html"
    );
  });

  registerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const auth = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: document.getElementById("regName").value.trim(),
          phone: document.getElementById("regPhone").value.trim(),
          email: document.getElementById("regEmail").value.trim() || null,
          password: document.getElementById("regPassword").value,
        }),
      });
      setAuth(auth);
      showAlert("Account created! Welcome, " + auth.name);
      window.location.href = redirect || "index.html";
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

function setupAdminLoginPage() {
  const adminForm = document.getElementById("adminLoginForm");
  if (!adminForm) return;

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get("redirect") || "admin.html";

  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await doLogin(
      {
        username: document.getElementById("adminUsername").value.trim(),
        password: document.getElementById("adminPassword").value,
        loginType: "admin",
      },
      redirect
    );
  });
}

async function doLogin(payload, redirectUrl) {
  try {
    const auth = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuth(auth);
    showAlert("Welcome, " + auth.name + "!");
    if (auth.role === "ADMIN") {
      window.location.href = redirectUrl || "admin.html";
    } else {
      window.location.href = redirectUrl || "index.html";
    }
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);

  if (path.endsWith("admin-login.html")) {
    const redirect = params.get("redirect");
    window.location.replace(redirect ? `login.html?staff=1&redirect=${redirect}` : ADMIN_LOGIN_URL);
    return;
  }

  if (path.endsWith("login.html") && (params.get("type") === "admin" || hash === "#staff" || hash === "#admin")) {
    const redirect = params.get("redirect");
    window.location.replace(redirect ? `login.html?staff=1&redirect=${redirect}` : ADMIN_LOGIN_URL);
    return;
  }

  initLoginPageMode();
  renderAuthNav();
  setupCustomerLoginPage();
  setupAdminLoginPage();
  if (hash === "#register") openLoginTab(hash);
});

const AUTH_TOKEN_KEY = "gsrAuthToken";
const AUTH_USER_KEY = "gsrAuthUser";

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
          ${user.role === "CUSTOMER" ? '<li><a class="dropdown-item" href="orders.html"><i class="bi bi-bag me-2"></i>My Orders</a></li>' : ""}
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

  const adminLink = document.querySelector('.nav-link[href="admin.html"]');
  if (adminLink && !isAdmin()) {
    adminLink.closest(".nav-item")?.remove();
  }
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
  window.location.href = "index.html";
}

function requireAdmin() {
  if (isAdmin() && getAuthToken()) return true;
  window.location.href = "login.html?type=admin";
  return false;
}

function requireCustomer() {
  if (isCustomer() && getAuthToken()) return true;
  window.location.href = "login.html?type=customer&redirect=orders.html";
  return false;
}

function setupLoginPage() {
  const customerForm = document.getElementById("customerLoginForm");
  const adminForm = document.getElementById("adminLoginForm");
  const registerForm = document.getElementById("registerForm");

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type") || "customer";
  if (type === "admin") {
    document.querySelector('#loginTabs button[data-bs-target="#adminTab"]')?.click();
  }
  if (window.location.hash === "#register") {
    document.querySelector('#loginTabs button[data-bs-target="#registerTab"]')?.click();
  }

  customerForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await doLogin({
      username: document.getElementById("customerPhone").value.trim(),
      password: document.getElementById("customerPassword").value,
      loginType: "customer",
    });
  });

  adminForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await doLogin({
      username: document.getElementById("adminUsername").value.trim(),
      password: document.getElementById("adminPassword").value,
      loginType: "admin",
    });
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
      window.location.href = "index.html";
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });
}

async function doLogin(payload) {
  try {
    const auth = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setAuth(auth);
    showAlert("Welcome, " + auth.name + "!");
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (auth.role === "ADMIN") window.location.href = redirect || "admin.html";
    else window.location.href = redirect || "index.html";
  } catch (error) {
    showAlert(error.message, "danger");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderAuthNav();
  setupLoginPage();
});

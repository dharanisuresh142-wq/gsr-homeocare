/** Shared navbar brand with logo */
function gsrNavBrand() {
  return `<a class="navbar-brand d-flex align-items-center" href="index.html">
    <img src="images/logo.png" alt="GSR Homeo Care Centre" class="navbar-logo me-2">
    <span class="navbar-brand-text d-none d-md-inline">GSR Homeo Care Centre</span>
  </a>`;
}

function gsrNavLinks() {
  return `
    <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
    <li class="nav-item"><a class="nav-link" href="dashboard.html">My Health</a></li>
    <li class="nav-item"><a class="nav-link" href="consultation.html">Consultation</a></li>
    <li class="nav-item"><a class="nav-link" href="prescriptions.html">Prescriptions</a></li>
    <li class="nav-item"><a class="nav-link" href="medicines.html">Medicines</a></li>
    <li class="nav-item"><a class="nav-link" href="orders.html">Orders</a></li>
    <li class="nav-item"><a class="nav-link" href="alarms.html">Alarms</a></li>
    <li class="nav-item"><a class="nav-link" href="feedback.html">Feedback</a></li>
    <li class="nav-item"><a class="nav-link" href="chat.html">Chat</a></li>
    <li class="nav-item" id="authNav"></li>
    <li class="nav-item ms-lg-2 position-relative">
      <a class="nav-link" href="checkout.html" title="Cart">
        <i class="bi bi-cart3 fs-5"></i>
        <span id="cartCount" class="cart-badge" style="display:none;">0</span>
      </a>
    </li>`;
}

function initGsrNavbar() {
  const nav = document.querySelector(".navbar .container");
  if (!nav || nav.dataset.gsrNavInit) return;
  nav.dataset.gsrNavInit = "1";
  const brand = nav.querySelector(".navbar-brand");
  const ul = nav.querySelector(".navbar-nav");
  if (brand) brand.outerHTML = gsrNavBrand();
  if (ul) ul.innerHTML = gsrNavLinks();
  if (typeof renderAuthNav === "function") renderAuthNav();
}

document.addEventListener("DOMContentLoaded", initGsrNavbar);

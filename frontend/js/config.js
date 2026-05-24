/**
 * GSR Homeocare — API URL config
 * Local: uses your PC IP or localhost
 * Live: uses Render backend (permanent public link)
 */
(function () {
  const LIVE_API = "https://gsr-homeocare-api.onrender.com/api";

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("192.168.") ||
    host.startsWith("10.") ||
    host.endsWith(".local");

  window.GSR_API_BASE = isLocal
    ? `${window.location.protocol}//${host}:8080/api`
    : LIVE_API;

  window.GSR_CONTACT = {
    display: "+91 99480 54618",
    tel: "tel:+919948054618",
    whatsapp: "https://wa.me/919948054618",
  };
})();

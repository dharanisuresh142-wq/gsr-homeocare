const ALARMS_KEY = "gsrMedicineAlarms";

function getAlarms() {
  return JSON.parse(localStorage.getItem(ALARMS_KEY) || "[]");
}

function saveAlarms(alarms) {
  localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
}

function formatAlarmTime(time) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function renderAlarmsList() {
  const list = document.getElementById("alarmsList");
  if (!list) return;

  const alarms = getAlarms();
  if (!alarms.length) {
    list.innerHTML = '<div class="empty-state"><p>No reminders yet. Add one below or set from a medicine card.</p></div>';
    return;
  }

  list.innerHTML = alarms
    .map(
      (a) => `
    <div class="info-card p-4 mb-3 alarm-card" data-id="${a.id}">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h5 class="mb-1"><i class="bi bi-capsule text-success me-2"></i>${escapeHtml(a.medicineName)}</h5>
          <p class="mb-1"><strong>Time:</strong> ${formatAlarmTime(a.time)} ${a.enabled ? '<span class="badge bg-success">Active</span>' : '<span class="badge bg-secondary">Paused</span>'}</p>
          <p class="mb-0 text-muted small"><strong>Usage:</strong> ${escapeHtml(a.usage || "—")}</p>
        </div>
        <div class="btn-group">
          <button type="button" class="btn btn-sm btn-outline-secondary btn-toggle-alarm" data-id="${a.id}">${a.enabled ? "Pause" : "Resume"}</button>
          <button type="button" class="btn btn-sm btn-outline-danger btn-delete-alarm" data-id="${a.id}">Delete</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  list.querySelectorAll(".btn-toggle-alarm").forEach((btn) => {
    btn.addEventListener("click", () => {
      const alarms = getAlarms();
      const item = alarms.find((x) => x.id === btn.dataset.id);
      if (item) {
        item.enabled = !item.enabled;
        saveAlarms(alarms);
        renderAlarmsList();
      }
    });
  });

  list.querySelectorAll(".btn-delete-alarm").forEach((btn) => {
    btn.addEventListener("click", () => {
      saveAlarms(getAlarms().filter((x) => x.id !== btn.dataset.id));
      renderAlarmsList();
      showAlert("Reminder removed.");
    });
  });
}

function setupAlarmForm() {
  const form = document.getElementById("alarmForm");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const prefillName = params.get("medicine");
  const prefillUsage = params.get("usage");
  if (prefillName) document.getElementById("alarmMedicineName").value = decodeURIComponent(prefillName);
  if (prefillUsage) document.getElementById("alarmUsage").value = decodeURIComponent(prefillUsage);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const alarms = getAlarms();
    alarms.push({
      id: crypto.randomUUID(),
      medicineName: document.getElementById("alarmMedicineName").value.trim(),
      usage: document.getElementById("alarmUsage").value.trim(),
      time: document.getElementById("alarmTime").value,
      enabled: true,
      lastFiredDate: null,
    });
    saveAlarms(alarms);
    form.reset();
    renderAlarmsList();
    showAlert("Medicine reminder saved!");
  });
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function fireAlarmNotification(alarm) {
  const body = alarm.usage || "Time to take your medicine.";
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(`GSR — ${alarm.medicineName}`, { body, icon: "images/logo.png" });
  }
  showAlert(`<strong>${escapeHtml(alarm.medicineName)}</strong> — ${escapeHtml(body)}`, "warning");
}

function checkAlarms() {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let alarms = getAlarms();
  let changed = false;

  alarms.forEach((alarm) => {
    if (!alarm.enabled || alarm.time !== current || alarm.lastFiredDate === today) return;
    fireAlarmNotification(alarm);
    alarm.lastFiredDate = today;
    changed = true;
  });

  if (changed) saveAlarms(alarms);
}

function setupNotificationButton() {
  const btn = document.getElementById("enableNotificationsBtn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const ok = await requestNotificationPermission();
    showAlert(ok ? "Notifications enabled for medicine alarms." : "Notifications blocked. You will still see on-screen alerts.", ok ? "success" : "warning");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderAlarmsList();
  setupAlarmForm();
  setupNotificationButton();
  checkAlarms();
  setInterval(checkAlarms, 30000);
});

/** Called from medicines page */
function setMedicineAlarm(name, usage) {
  const url = `alarms.html?medicine=${encodeURIComponent(name)}&usage=${encodeURIComponent(usage || "")}`;
  window.location.href = url;
}

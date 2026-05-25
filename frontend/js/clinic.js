/** Patient portal & admin clinic features */

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

function getPatientPhone() {
  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  if (user?.phone) return user.phone.replace(/\s+/g, "").trim();
  return (localStorage.getItem("gsrPhone") || "").trim();
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    i < rating ? '<i class="bi bi-star-fill text-warning"></i>' : '<i class="bi bi-star text-muted"></i>'
  ).join("");
}

function renderPrescriptionCard(rx) {
  const meds = (rx.medicines || [])
    .map(
      (m) => `
    <li class="mb-2">
      <strong class="medicine-id-tag">${escapeHtml(m.medicineId || m.medicineName)}</strong>
      ${m.medicineName && m.medicineId ? ` — ${escapeHtml(m.medicineName)}` : ""}
      <br><small>Dosage: ${escapeHtml(m.dosage || "—")} · ${escapeHtml(m.duration || "")}</small>
      <div class="usage-box mt-1 small"><i class="bi bi-info-circle me-1"></i>${escapeHtml(m.howToUse || "Follow doctor instructions.")}</div>
      <button type="button" class="btn btn-sm btn-outline-primary mt-1 btn-rx-alarm" data-name="${escapeHtml(m.medicineName || m.medicineId)}" data-usage="${escapeHtml(m.howToUse || m.dosage || "")}">
        <i class="bi bi-alarm"></i> Set alarm
      </button>
    </li>`
    )
    .join("");

  return `
  <div class="pro-card mb-3">
    <div class="d-flex justify-content-between flex-wrap gap-2 mb-2">
      <h6 class="mb-0"><i class="bi bi-file-medical text-primary me-2"></i>Prescription #${rx.id}</h6>
      <span class="badge bg-primary-subtle text-primary">${escapeHtml(rx.doctorName || "Doctor")}</span>
    </div>
    <p class="small text-muted mb-2">${rx.createdAt ? new Date(rx.createdAt).toLocaleString("en-IN") : ""}</p>
    ${rx.notes ? `<p class="small">${escapeHtml(rx.notes)}</p>` : ""}
    <ul class="list-unstyled mb-0">${meds || '<li class="text-muted">No medicines listed</li>'}</ul>
  </div>`;
}

function renderConsultationCard(c) {
  const paid = c.paymentStatus === "Paid";
  return `
  <div class="pro-card mb-3">
    <div class="d-flex justify-content-between flex-wrap gap-2">
      <h6 class="mb-0">Consultation #${c.id}</h6>
      <span class="badge ${paid ? "bg-success" : "bg-warning text-dark"}">${paid ? "Fee paid" : "Payment pending"}</span>
    </div>
    <p class="mb-1"><i class="bi bi-person-badge me-1"></i><strong>Doctor:</strong> ${escapeHtml(c.doctorName || window.GSR_CLINIC?.defaultDoctor || "Doctor")}</p>
    <p class="mb-1"><strong>Date:</strong> ${c.date} · <strong>Fee:</strong> ₹${Number(c.consultationFee || 500).toFixed(0)}</p>
    <p class="mb-1 text-muted small">${escapeHtml(c.problem)}</p>
    ${c.nextFollowUpDate ? `<p class="mb-0"><i class="bi bi-calendar-check text-success me-1"></i><strong>Next follow-up:</strong> ${c.nextFollowUpDate}</p>` : ""}
  </div>`;
}

function renderFollowUpCard(f) {
  const done = f.status === "Completed";
  return `
  <div class="pro-card mb-3 ${done ? "opacity-75" : ""}">
    <div class="d-flex justify-content-between">
      <h6 class="mb-1">${escapeHtml(f.doctorName)}</h6>
      <span class="badge bg-${done ? "secondary" : "info"}">${escapeHtml(f.status)}</span>
    </div>
    <p class="mb-1"><i class="bi bi-calendar me-1"></i>${f.scheduledDate}</p>
    ${f.notes ? `<p class="small text-muted mb-0">${escapeHtml(f.notes)}</p>` : ""}
  </div>`;
}

async function loadPatientDashboard() {
  const box = document.getElementById("patientDashboard");
  if (!box) return;

  const phone = getPatientPhone();
  if (!phone || phone.length < 10) {
    box.innerHTML = `<div class="alert alert-info">Enter your phone on <a href="login.html">Login</a> or book a consultation to see your records.</div>`;
    return;
  }

  box.innerHTML = '<p class="text-muted">Loading your health records…</p>';

  try {
    const [consultations, prescriptions, orders, followups, feedback] = await Promise.all([
      apiRequest(`/consultations?phone=${encodeURIComponent(phone)}`).catch(() => []),
      apiRequest(`/prescriptions?phone=${encodeURIComponent(phone)}`).catch(() => []),
      apiRequest(`/orders?phone=${encodeURIComponent(phone)}`).catch(() => []),
      apiRequest(`/followups?phone=${encodeURIComponent(phone)}`).catch(() => []),
      apiRequest(`/feedback?phone=${encodeURIComponent(phone)}`).catch(() => []),
    ]);

    const nextFu = consultations.find((c) => c.nextFollowUpDate);

    box.innerHTML = `
      <div class="row g-4 mb-4">
        <div class="col-6 col-md-3"><div class="stat-tile"><div class="stat-num">${consultations.length}</div><div class="stat-label">Consultations</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-tile"><div class="stat-num">${prescriptions.length}</div><div class="stat-label">Prescriptions</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-tile"><div class="stat-num">${orders.length}</div><div class="stat-label">Orders</div></div></div>
        <div class="col-6 col-md-3"><div class="stat-tile stat-tile-accent"><div class="stat-num">${nextFu ? "✓" : "—"}</div><div class="stat-label">Next follow-up</div></div></div>
      </div>
      ${nextFu ? `<div class="alert alert-success"><i class="bi bi-calendar-check me-2"></i>Next follow-up on <strong>${nextFu.nextFollowUpDate}</strong> with ${escapeHtml(nextFu.doctorName)}</div>` : ""}
      <div class="row g-4">
        <div class="col-lg-6">
          <h5 class="pro-section-title">Recent consultations</h5>
          ${consultations.length ? consultations.slice(0, 3).map(renderConsultationCard).join("") : '<p class="text-muted">No consultations yet. <a href="consultation.html">Book now</a></p>'}
        </div>
        <div class="col-lg-6">
          <h5 class="pro-section-title">Prescribed medicines</h5>
          ${prescriptions.length ? prescriptions.slice(0, 2).map(renderPrescriptionCard).join("") : '<p class="text-muted">Prescriptions appear after your doctor visit.</p>'}
        </div>
        <div class="col-lg-6">
          <h5 class="pro-section-title">Your orders</h5>
          ${orders.length ? orders.slice(0, 2).map((o) => typeof renderOrderCard === "function" ? renderOrderCard(o) : "").join("") : '<p class="text-muted">No orders yet.</p>'}
        </div>
        <div class="col-lg-6">
          <h5 class="pro-section-title">Follow-ups</h5>
          ${followups.length ? followups.map(renderFollowUpCard).join("") : '<p class="text-muted">No follow-ups scheduled.</p>'}
        </div>
      </div>`;

    box.querySelectorAll(".btn-rx-alarm").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (typeof setMedicineAlarm === "function") setMedicineAlarm(btn.dataset.name, btn.dataset.usage);
        else window.location.href = `alarms.html?medicine=${encodeURIComponent(btn.dataset.name)}`;
      });
    });
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

async function loadMyPrescriptions() {
  const box = document.getElementById("myPrescriptionsList");
  if (!box) return;
  const phone = getPatientPhone();
  if (!phone || phone.length < 10) {
    box.innerHTML = '<p class="text-muted">Login or save your phone to view prescriptions.</p>';
    return;
  }
  try {
    const list = await apiRequest(`/prescriptions?phone=${encodeURIComponent(phone)}`);
    box.innerHTML = list.length ? list.map(renderPrescriptionCard).join("") : '<p class="text-muted">No prescriptions yet.</p>';
    bindRxAlarms(box);
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

function bindRxAlarms(container) {
  container.querySelectorAll(".btn-rx-alarm").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (typeof setMedicineAlarm === "function") setMedicineAlarm(btn.dataset.name, btn.dataset.usage);
      else window.location.href = `alarms.html?medicine=${encodeURIComponent(btn.dataset.name)}`;
    });
  });
}

async function loadMyFollowups() {
  const box = document.getElementById("myFollowupsList");
  if (!box) return;
  const phone = getPatientPhone();
  if (!phone || phone.length < 10) {
    box.innerHTML = '<p class="text-muted">Login to view follow-ups.</p>';
    return;
  }
  try {
    const list = await apiRequest(`/followups?phone=${encodeURIComponent(phone)}`);
    box.innerHTML = list.length ? list.map(renderFollowUpCard).join("") : '<p class="text-muted">No follow-ups scheduled yet.</p>';
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

function setupFeedbackForm() {
  const form = document.getElementById("feedbackForm");
  if (!form) return;
  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  if (user?.name) document.getElementById("fbName").value = user.name;
  if (user?.phone) document.getElementById("fbPhone").value = user.phone;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/feedback", {
        method: "POST",
        body: JSON.stringify({
          patientName: document.getElementById("fbName").value.trim(),
          patientPhone: document.getElementById("fbPhone").value.trim(),
          rating: parseInt(document.getElementById("fbRating").value, 10),
          message: document.getElementById("fbMessage").value.trim(),
        }),
      });
      showAlert("Thank you! Your feedback was submitted.");
      form.reset();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  });
}

/* ——— Admin ——— */

async function loadAdminPatients() {
  const box = document.getElementById("adminPatientsList");
  if (!box) return;
  try {
    const patients = await apiRequest("/patients");
    if (!patients.length) {
      box.innerHTML = '<p class="text-muted">No patients yet.</p>';
      return;
    }
    box.innerHTML = `<div class="table-responsive"><table class="table table-hover mb-0">
      <thead><tr><th>Name</th><th>Phone</th><th>Consults</th><th>Orders</th><th>Rx</th><th></th></tr></thead>
      <tbody>${patients
        .map(
          (p) => `<tr>
          <td>${escapeHtml(p.name || "—")}</td>
          <td>${escapeHtml(p.phone)}</td>
          <td>${p.consultationCount}</td>
          <td>${p.orderCount}</td>
          <td>${p.prescriptionCount}</td>
          <td><button type="button" class="btn btn-sm btn-primary btn-view-patient" data-phone="${escapeHtml(p.phone)}">View</button></td>
        </tr>`
        )
        .join("")}</tbody></table></div>`;
    box.querySelectorAll(".btn-view-patient").forEach((btn) => {
      btn.addEventListener("click", () => openPatientDetail(btn.dataset.phone));
    });
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

async function openPatientDetail(phone) {
  const box = document.getElementById("adminPatientDetail");
  if (!box) return;
  box.classList.remove("d-none");
  box.innerHTML = '<p class="text-muted">Loading…</p>';
  try {
    const d = await apiRequest(`/patients/${encodeURIComponent(phone)}`);
    box.innerHTML = `
      <h5 class="mb-3"><i class="bi bi-person-vcard me-2"></i>${escapeHtml(d.name || "Patient")} — ${escapeHtml(d.phone)}</h5>
      <div class="row g-3">
        <div class="col-md-6"><h6>Consultations (${(d.consultations || []).length})</h6>
          ${(d.consultations || []).slice(0, 5).map(renderConsultationCard).join("") || "<p class='small text-muted'>None</p>"}
        </div>
        <div class="col-md-6"><h6>Prescriptions (${(d.prescriptions || []).length})</h6>
          ${(d.prescriptions || []).slice(0, 3).map(renderPrescriptionCard).join("") || "<p class='small text-muted'>None</p>"}
        </div>
        <div class="col-12"><h6>Orders</h6>
          ${(d.orders || []).map((o) => typeof renderOrderCard === "function" ? renderOrderCard(o, true) : "").join("") || "<p class='small text-muted'>None</p>"}
        </div>
        <div class="col-md-6"><h6>Follow-ups</h6>${(d.followUps || []).map(renderFollowUpCard).join("") || "<p class='small text-muted'>None</p>"}</div>
        <div class="col-md-6"><h6>Feedback</h6>
          ${(d.feedback || [])
            .map((f) => `<div class="small mb-2">${renderStars(f.rating)} ${escapeHtml(f.message)}</div>`)
            .join("") || "<p class='small text-muted'>None</p>"}
        </div>
      </div>`;
    bindRxAlarms(box);
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

function setupAdminPrescriptionForm() {
  const form = document.getElementById("adminPrescriptionForm");
  if (!form) return;

  const addLine = () => {
    const wrap = document.getElementById("rxMedicineLines");
    const row = document.createElement("div");
    row.className = "rx-line row g-2 mb-2 align-items-end";
    row.innerHTML = `
      <div class="col-md-3"><input class="form-control form-control-sm rx-med-id" placeholder="Medicine ID" required></div>
      <div class="col-md-3"><input class="form-control form-control-sm rx-med-name" placeholder="Name"></div>
      <div class="col-md-2"><input class="form-control form-control-sm rx-dosage" placeholder="Dosage"></div>
      <div class="col-md-2"><input class="form-control form-control-sm rx-how" placeholder="How to use"></div>
      <div class="col-md-2"><button type="button" class="btn btn-sm btn-outline-danger btn-remove-rx-line">×</button></div>`;
    wrap.appendChild(row);
    row.querySelector(".btn-remove-rx-line").addEventListener("click", () => row.remove());
  };

  document.getElementById("btnAddRxLine")?.addEventListener("click", addLine);
  if (!document.querySelector(".rx-line")) addLine();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const medicines = [...document.querySelectorAll(".rx-line")].map((row) => ({
      medicineId: row.querySelector(".rx-med-id")?.value.trim(),
      medicineName: row.querySelector(".rx-med-name")?.value.trim(),
      dosage: row.querySelector(".rx-dosage")?.value.trim(),
      howToUse: row.querySelector(".rx-how")?.value.trim(),
      duration: "As prescribed",
    }));
    try {
      await apiRequest("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          patientPhone: document.getElementById("rxPatientPhone").value.trim(),
          patientName: document.getElementById("rxPatientName").value.trim(),
          doctorName: document.getElementById("rxDoctorName").value.trim() || window.GSR_CLINIC?.defaultDoctor,
          notes: document.getElementById("rxNotes").value.trim(),
          medicines,
        }),
      });
      showAlert("Prescription saved for patient.");
      form.reset();
      document.getElementById("rxMedicineLines").innerHTML = "";
      addLine();
      loadAdminPatients();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  });
}

function setupAdminFollowUpForm() {
  const form = document.getElementById("adminFollowUpForm");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await apiRequest("/followups", {
        method: "POST",
        body: JSON.stringify({
          patientPhone: document.getElementById("fuPhone").value.trim(),
          patientName: document.getElementById("fuName").value.trim(),
          doctorName: document.getElementById("fuDoctor").value.trim(),
          scheduledDate: document.getElementById("fuDate").value,
          notes: document.getElementById("fuNotes").value.trim(),
          status: "Scheduled",
        }),
      });
      showAlert("Follow-up scheduled.");
      form.reset();
      loadAdminFollowups();
    } catch (err) {
      showAlert(err.message, "danger");
    }
  });
}

async function loadAdminFollowups() {
  const box = document.getElementById("adminFollowupsList");
  if (!box) return;
  try {
    const list = await apiRequest("/followups");
    box.innerHTML = list.length
      ? `<div class="table-responsive"><table class="table table-sm mb-0"><thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th></th></tr></thead><tbody>${list
          .map(
            (f) => `<tr>
            <td>${escapeHtml(f.patientName)}<br><small>${escapeHtml(f.patientPhone)}</small></td>
            <td>${escapeHtml(f.doctorName)}</td>
            <td>${f.scheduledDate}</td>
            <td>${escapeHtml(f.status)}</td>
            <td>
              <button class="btn btn-xs btn-success btn-fu-done" data-id="${f.id}">Done</button>
            </td>
          </tr>`
          )
          .join("")}</tbody></table></div>`
      : '<p class="text-muted">No follow-ups.</p>';
    box.querySelectorAll(".btn-fu-done").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await apiRequest(`/followups/${btn.dataset.id}`, { method: "PUT", body: JSON.stringify({ status: "Completed" }) });
        loadAdminFollowups();
      });
    });
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

async function loadAdminFeedback() {
  const box = document.getElementById("adminFeedbackList");
  if (!box) return;
  try {
    const list = await apiRequest("/feedback");
    box.innerHTML = list.length
      ? list
          .map(
            (f) => `<div class="pro-card mb-2 p-3">
            <div class="mb-1">${renderStars(f.rating)} <strong>${escapeHtml(f.patientName)}</strong> · ${escapeHtml(f.patientPhone)}</div>
            <p class="mb-0 small">${escapeHtml(f.message)}</p>
            <small class="text-muted">${f.createdAt ? new Date(f.createdAt).toLocaleString("en-IN") : ""}</small>
          </div>`
          )
          .join("")
      : '<p class="text-muted">No feedback yet.</p>';
  } catch (e) {
    box.innerHTML = `<div class="alert alert-danger">${e.message}</div>`;
  }
}

async function loadConsultationsAdmin() {
  const tableBody = document.getElementById("consultationsTableBody");
  if (!tableBody) return;
  try {
    const consultations = await apiRequest("/consultations");
    tableBody.innerHTML = consultations.length
      ? consultations
          .map(
            (c) => `<tr>
          <td class="small">${c.id}</td>
          <td>${escapeHtml(c.name)}</td>
          <td>${c.phone}</td>
          <td class="small">${escapeHtml(c.problem)}</td>
          <td>${escapeHtml(c.doctorName || "—")}</td>
          <td>₹${Number(c.consultationFee || 500).toFixed(0)}</td>
          <td><span class="badge bg-${c.paymentStatus === "Paid" ? "success" : "warning"}">${c.paymentStatus}</span></td>
          <td>${c.date}</td>
          <td>${c.nextFollowUpDate || "—"}</td>
          <td><button class="btn btn-sm btn-outline-primary btn-set-followup" data-id="${c.id}" data-phone="${escapeHtml(c.phone)}" data-name="${escapeHtml(c.name)}">Set F/U</button></td>
        </tr>`
          )
          .join("")
      : '<tr><td colspan="10" class="text-center text-muted">No consultations.</td></tr>';

    tableBody.querySelectorAll(".btn-set-followup").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const date = prompt("Next follow-up date (YYYY-MM-DD):");
        if (!date) return;
        try {
          await apiRequest(`/consultations/${btn.dataset.id}`, {
            method: "PUT",
            body: JSON.stringify({ nextFollowUpDate: date }),
          });
          const fuPhone = document.getElementById("fuPhone");
          const fuName = document.getElementById("fuName");
          if (fuPhone) fuPhone.value = btn.dataset.phone;
          if (fuName) fuName.value = btn.dataset.name;
          showAlert("Follow-up date saved on consultation.");
          loadConsultationsAdmin();
        } catch (err) {
          showAlert(err.message, "danger");
        }
      });
    });
  } catch (error) {
    tableBody.innerHTML = `<tr><td colspan="10" class="text-danger">${error.message}</td></tr>`;
  }
}

function setupAdminClinic() {
  setupAdminPrescriptionForm();
  setupAdminFollowUpForm();
  loadAdminPatients();
  loadAdminFollowups();
  loadAdminFeedback();
}

document.addEventListener("DOMContentLoaded", () => {
  loadPatientDashboard();
  loadMyPrescriptions();
  loadMyFollowups();
  setupFeedbackForm();
  if (document.getElementById("adminPatientsList")) {
    setupAdminClinic();
    loadConsultationsAdmin();
    const doc = document.getElementById("rxDoctorName");
    const fuDoc = document.getElementById("fuDoctor");
    const def = window.GSR_CLINIC?.defaultDoctor || "Dr. GSR Teja";
    if (doc && !doc.value) doc.value = def;
    if (fuDoc && !fuDoc.placeholder) fuDoc.placeholder = def;
  }
});

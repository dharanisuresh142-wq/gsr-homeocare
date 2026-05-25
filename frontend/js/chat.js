let chatPollTimer = null;

function getChatPhone() {
  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  const phoneEl = document.getElementById("chatPhone");
  if (user?.phone && phoneEl) {
    phoneEl.value = user.phone;
    phoneEl.readOnly = true;
  }
  const saved = localStorage.getItem("gsrPhone");
  if (saved && phoneEl && !phoneEl.value) phoneEl.value = saved;
  return phoneEl?.value.trim() || "";
}

function getChatName() {
  const user = typeof getAuthUser === "function" ? getAuthUser() : null;
  const nameEl = document.getElementById("chatName");
  if (user?.name && nameEl && !nameEl.value) nameEl.value = user.name;
  return nameEl?.value.trim() || "Customer";
}

function getChatMessageText() {
  return document.getElementById("chatInput")?.value.trim() || "";
}

function buildWhatsAppUrl(message) {
  if (!window.GSR_CONTACT) return "#";
  const name = getChatName();
  const phone = getChatPhone();
  const text = message || "Hello GSR Homeo Care Centre, I need online help.";
  const full = `Hello, I am ${name} (${phone}). ${text}`;
  return `${window.GSR_CONTACT.whatsapp}?text=${encodeURIComponent(full)}`;
}

function updateWhatsAppLinks() {
  const openBtn = document.getElementById("whatsappOpenBtn");
  const hint = document.getElementById("whatsappHint");
  if (openBtn) openBtn.href = buildWhatsAppUrl(getChatMessageText() || "Hello, I need online consultation.");
  if (hint && window.GSR_CONTACT) hint.textContent = `Clinic WhatsApp: ${window.GSR_CONTACT.display}`;
}

function renderChatMessages(messages) {
  const box = document.getElementById("chatMessages");
  if (!box) return;
  if (!messages.length) {
    box.innerHTML = '<p class="text-muted text-center mb-0">No messages yet. Send on website or WhatsApp.</p>';
    return;
  }
  box.innerHTML = messages
    .map((m) => {
      const isAdmin = m.senderRole === "ADMIN";
      const channel =
        m.channel === "WHATSAPP"
          ? '<span class="badge bg-success ms-1"><i class="bi bi-whatsapp"></i> WhatsApp</span>'
          : '<span class="badge bg-primary ms-1">Website</span>';
      const time = m.sentAt ? new Date(m.sentAt).toLocaleString("en-IN") : "";
      return `
      <div class="chat-bubble ${isAdmin ? "chat-bubble-admin" : "chat-bubble-customer"} mb-2">
        <div class="small fw-semibold">${escapeHtml(m.senderName)} ${isAdmin ? "(Clinic)" : ""} ${channel}</div>
        <div>${escapeHtml(m.message)}</div>
        <div class="chat-time">${time}</div>
      </div>`;
    })
    .join("");
  box.scrollTop = box.scrollHeight;
}

async function loadChatMessages() {
  const phone = getChatPhone();
  if (!phone || phone.length < 10) return;
  localStorage.setItem("gsrPhone", phone);
  try {
    const messages = await apiRequest(`/chat?phone=${encodeURIComponent(phone)}`);
    renderChatMessages(messages);
  } catch (error) {
    const box = document.getElementById("chatMessages");
    if (box) box.innerHTML = `<div class="alert alert-danger small mb-0">${error.message}</div>`;
  }
}

async function sendChatMessage(channel) {
  const phone = getChatPhone();
  const name = getChatName();
  const text = getChatMessageText();
  if (!phone || phone.length < 10) {
    showAlert("Enter your phone number first.", "warning");
    return false;
  }
  if (!text) {
    showAlert("Type a message first.", "warning");
    return false;
  }
  await apiRequest("/chat", {
    method: "POST",
    body: JSON.stringify({ phone, name, message: text, channel }),
  });
  document.getElementById("chatInput").value = "";
  await loadChatMessages();
  return true;
}

function setupChatPage() {
  const form = document.getElementById("chatForm");
  const phoneEl = document.getElementById("chatPhone");
  const chatInput = document.getElementById("chatInput");
  if (!form) return;

  updateWhatsAppLinks();
  chatInput?.addEventListener("input", updateWhatsAppLinks);

  phoneEl?.addEventListener("change", () => {
    loadChatMessages();
    if (chatPollTimer) clearInterval(chatPollTimer);
    chatPollTimer = setInterval(loadChatMessages, 8000);
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      await sendChatMessage("APP");
      showAlert("Message sent on website chat.");
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });

  document.getElementById("whatsappSendBtn")?.addEventListener("click", async () => {
    const waUrl = buildWhatsAppUrl(getChatMessageText());
    try {
      const ok = await sendChatMessage("WHATSAPP");
      if (ok) {
        showAlert("Saved! Opening WhatsApp…");
        window.open(waUrl, "_blank");
      }
    } catch (error) {
      showAlert(error.message, "danger");
    }
  });

  const saved = localStorage.getItem("gsrPhone");
  if (saved && phoneEl) {
    phoneEl.value = saved;
    loadChatMessages();
    chatPollTimer = setInterval(loadChatMessages, 8000);
  }
}

async function loadAdminChatInbox() {
  const container = document.getElementById("adminChatInbox");
  const threadBox = document.getElementById("adminChatThread");
  if (!container) return;

  try {
    const threads = await apiRequest("/chat/inbox");
    if (!threads.length) {
      container.innerHTML = '<p class="text-muted">No chats yet.</p>';
      return;
    }
    container.innerHTML = `<div class="list-group">${threads
      .map(
        (t) => `
      <button type="button" class="list-group-item list-group-item-action text-start admin-chat-thread-btn"
        data-phone="${escapeHtml(t.threadId)}">
        <strong>${escapeHtml(t.threadId)}</strong><br>
        <small class="text-muted">${escapeHtml(t.lastMessage || "")}</small>
      </button>`
      )
      .join("")}</div>`;

    container.querySelectorAll(".admin-chat-thread-btn").forEach((btn) => {
      btn.addEventListener("click", () => openAdminChatThread(btn.dataset.phone, threadBox));
    });
  } catch (error) {
    container.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

async function openAdminChatThread(phone, threadBox) {
  if (!threadBox) return;
  threadBox.dataset.phone = phone;
  const waLink = window.GSR_CONTACT
    ? `${window.GSR_CONTACT.whatsapp}?text=${encodeURIComponent(`Hello, this is GSR Homeocare replying to your online enquiry (${phone}).`)}`
    : "#";
  threadBox.innerHTML = `<p class="text-muted">Loading chat for ${escapeHtml(phone)}…</p>`;
  try {
    const messages = await apiRequest(`/chat?phone=${encodeURIComponent(phone)}`);
    threadBox.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
        <strong>Chat: ${escapeHtml(phone)}</strong>
        <a href="${waLink}" class="btn btn-sm btn-success" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> WhatsApp</a>
      </div>
      <div class="chat-messages-admin mb-2" style="max-height:220px;overflow-y:auto">
        ${messages
          .map((m) => {
            const ch =
              m.channel === "WHATSAPP"
                ? '<i class="bi bi-whatsapp text-success"></i>'
                : '<i class="bi bi-chat text-primary"></i>';
            return `
          <div class="small mb-2 ${m.senderRole === "ADMIN" ? "text-end" : ""}">
            ${ch} <span class="badge ${m.senderRole === "ADMIN" ? "bg-success" : "bg-secondary"}">${escapeHtml(m.senderName)}</span>
            ${escapeHtml(m.message)}
          </div>`;
          })
          .join("")}
      </div>
      <form id="adminChatReplyForm" class="input-group">
        <input type="text" class="form-control" id="adminChatReply" placeholder="Reply on website chat..." required>
        <button type="submit" class="btn btn-success">Send</button>
      </form>`;

    document.getElementById("adminChatReplyForm")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = document.getElementById("adminChatReply").value.trim();
      try {
        await apiRequest("/chat", {
          method: "POST",
          body: JSON.stringify({
            phone,
            name: "GSR Admin",
            message: text,
            channel: "APP",
          }),
        });
        openAdminChatThread(phone, threadBox);
        loadAdminChatInbox();
      } catch (err) {
        showAlert(err.message, "danger");
      }
    });
  } catch (error) {
    threadBox.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
}

function setupAdminChatSection() {
  if (!document.getElementById("adminChatInbox")) return;
  loadAdminChatInbox();
}

document.addEventListener("DOMContentLoaded", () => {
  setupChatPage();
  setupAdminChatSection();
});

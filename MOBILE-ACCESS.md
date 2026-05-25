# Open GSR Homeocare on Mobile

**Clinic contact:** +91 99480 54618

---

## Your links

| Device | Link |
|--------|------|
| **Windows (PC)** | http://localhost:5500 |
| **Mobile (same Wi-Fi)** | http://192.168.1.106:5500 |

Run **`MOBILE-LINK.bat`** if the mobile link stops working (Wi-Fi IP may change).

---

## Steps

1. Double-click **`RUN-ALL.bat`** on your PC (keep both windows open)
2. On PC browser: open **http://localhost:5500**
3. On phone: connect to **same Wi-Fi**, open **http://192.168.1.106:5500**

---

## If phone cannot connect

1. **Same Wi-Fi** — phone and PC must be on the same network
2. **Do not use `localhost` on phone** — use the `192.168.x.x` link only
3. **Firewall** — allow Python (port 5500) and Java (port 8080):
   ```powershell
   netsh advfirewall firewall add rule name="GSR Frontend" dir=in action=allow protocol=TCP localport=5500
   netsh advfirewall firewall add rule name="GSR Backend" dir=in action=allow protocol=TCP localport=8080
   ```
4. Run **`MOBILE-LINK.bat`** for the latest IP address

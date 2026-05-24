# GSR Homeocare — Deploy Step by Step (START HERE)

Follow these steps **in order**. Each step takes 5–10 minutes.

Your final public website will be:
**https://YOUR-SITE-NAME.netlify.app**

---

## BEFORE YOU START — checklist

- [ ] Email for sign-ups (Gmail is fine)
- [ ] Project folder: `c:\Users\dhara\OneDrive\Desktop\mano`
- [ ] You already have Netlify site ID: `01KSCFG9VAXK1QP763YZQJCTWW`

---

# STEP 1 — MongoDB Atlas (database)

1. Open: **https://www.mongodb.com/atlas**
2. **Sign up** (free) or log in
3. Create a **free cluster** (M0) → any region → Create
4. **Database Access** → Add user:
   - Username: `gsradmin`
   - Password: **create a strong password** → **Save password somewhere!**
5. **Network Access** → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`)
6. **Database** → **Connect** → **Drivers** → copy connection string

It looks like:
```
mongodb+srv://gsradmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. Edit it — add database name before `?`:
```
mongodb+srv://gsradmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority
```

**SAVE THIS** — you need it in Step 3.  
✅ Step 1 done when you have the connection string.

---

# STEP 2 — GitHub (upload your code)

Git is not installed on your PC. Use **GitHub website upload** (easy):

1. Open: **https://github.com** → Sign up / Log in
2. Click **+** (top right) → **New repository**
3. Name: **`gsr-homeocare`**
4. Leave **Public** → **Create repository**
5. Click **"uploading an existing file"**
6. Drag these folders/files from `mano` folder:
   - `backend` folder
   - `frontend` folder
   - `database` folder
   - `render.yaml`
   - `netlify.toml`
   - `README.md`
   - `.gitignore`
7. **Do NOT upload:** `tools`, `oracleJdk-26`, `backend/target`, `backend/data`
8. Click **Commit changes**

✅ Step 2 done when repo shows files at:  
`https://github.com/YOUR-USERNAME/gsr-homeocare`

---

# STEP 3 — Render (backend API)

1. Open: **https://render.com** → Sign up with **GitHub**
2. **New +** → **Blueprint**
3. Connect repository **`gsr-homeocare`**
4. Render finds `render.yaml` → shows service **gsr-homeocare-api**
5. Click **Environment** → add:
   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | your full Atlas connection string from Step 1 |
6. Click **Apply** or **Create**
7. Wait **5–15 minutes** for deploy (first time is slow)

8. Test in browser:
   ```
   https://gsr-homeocare-api.onrender.com/api/health
   ```
   You should see:
   ```json
   {"status":"UP","database":"CONNECTED","databaseProduct":"MongoDB"}
   ```

✅ Step 3 done when health check shows **UP**.

---

# STEP 4 — Netlify (your public website)

You already have a Netlify site. Connect it to GitHub:

1. Open: **https://app.netlify.com**
2. Open your site (ID: `01KSCFG9VAXK1QP763YZQJCTWW`)
3. **Site configuration** → **Build & deploy** → **Continuous deployment**
4. **Link repository** → choose **GitHub** → authorize → select **`gsr-homeocare`**
5. Build settings:
   | Setting | Value |
   |---------|--------|
   | Branch | `main` |
   | Base directory | *(leave empty)* |
   | Build command | *(leave empty)* |
   | Publish directory | **`frontend`** |
6. Click **Deploy site**
7. Wait 1–2 minutes

8. **Site configuration** → **Domain management** → **Options** → **Edit site name**
   - Set name to: **`gsr-homeocare`** (if available)
   - Your link: **https://gsr-homeocare.netlify.app**

9. Open your site on **phone** (mobile data, not only Wi-Fi)

✅ Step 4 done when website loads with green **API Online** badge.

---

# STEP 5 — Fix API link (if products don't load)

If website loads but products fail:

1. Open Render dashboard → copy your exact API URL (e.g. `https://gsr-homeocare-api.onrender.com`)
2. On GitHub, edit file: **`frontend/js/config.js`**
3. Line 7 — set:
   ```javascript
   const LIVE_API = "https://YOUR-RENDER-URL.onrender.com/api";
   ```
4. Save → Netlify auto-redeploys in 1–2 min

---

# YOUR FINAL LINKS

| What | URL |
|------|-----|
| **Share with customers** | `https://gsr-homeocare.netlify.app` |
| **API (backend)** | `https://gsr-homeocare-api.onrender.com` |
| **Health check** | `https://gsr-homeocare-api.onrender.com/api/health` |

---

# TROUBLESHOOTING

| Problem | Fix |
|---------|-----|
| Netlify "Page not found" | Publish directory must be **`frontend`** |
| API Offline on site | Render backend not running — check Step 3 health URL |
| Render build failed | Check Render **Logs** tab |
| MongoDB error | Wrong password in `MONGODB_URI` or IP not allowed in Atlas |
| First visit slow (~30 sec) | Render free tier wakes from sleep — normal |
| `gsr-homeocare.netlify.app` not found | Rename site in Netlify OR use the URL Netlify gave you |

---

# QUICK TEST AFTER DEPLOY

1. Open website on phone
2. Go to **Products** — see 3 items
3. Go to **Consultation** — submit a test booking
4. Go to **Admin** — see the consultation

---

# NEED HELP?

Tell your assistant (Agent mode):
- Your GitHub username
- Your Netlify site URL (from dashboard)
- Your Render API URL
- Any error message from Render Logs or Netlify Deploy log

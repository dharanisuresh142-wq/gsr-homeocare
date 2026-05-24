# GSR Homeocare — Permanent Public Website Link

Share this **professional link** with anyone on any phone (Android, iPhone), anywhere in the world.

---

## Your permanent links (after deploy)

| Service | Professional URL |
|---------|------------------|
| **Website (share this)** | **https://gsr-homeocare.netlify.app** |
| **API (backend)** | **https://gsr-homeocare-api.onrender.com** |

> Names like `gsr-homeocare.netlify.app` are free and look professional.  
> You can rename on Netlify to e.g. `gsr-homeocare-clinic.netlify.app`

---

## One-time setup (about 20 minutes)

### Step 1 — MongoDB Atlas (database)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → sign up free
2. Create cluster → **Connect** → copy connection string
3. Replace `<password>` with your DB password
4. **Network Access** → Add IP → **Allow access from anywhere** (`0.0.0.0/0`)

Example URI:
```
mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority
```

---

### Step 2 — Deploy backend (Render)

1. Push project to **GitHub** (create repo, upload `mano` folder)
2. Go to [render.com](https://render.com) → Sign up free → **New +** → **Blueprint**
3. Connect GitHub repo → Render reads `render.yaml` automatically
4. Add environment variable:
   - **Key:** `MONGODB_URI`
   - **Value:** your Atlas connection string
5. Click **Apply** → wait 5–10 min for deploy
6. Your API URL: **https://gsr-homeocare-api.onrender.com**
7. Test: open **https://gsr-homeocare-api.onrender.com/api/health**

---

### Step 3 — Deploy frontend (Netlify)

1. Go to [netlify.com](https://www.netlify.com) → Sign up free
2. **Add new site** → **Import from Git** → select your GitHub repo
3. Settings:
   - **Base directory:** *(leave empty)*
   - **Publish directory:** `frontend`
   - **Build command:** *(leave empty)*
4. **Deploy site**
5. Netlify gives a URL like `random-name.netlify.app`
6. **Site settings** → **Change site name** → set: **`gsr-homeocare`**
7. Final link: **https://gsr-homeocare.netlify.app**

---

### Step 4 — Update API URL (if Render name differs)

Edit `frontend/js/config.js` line 7 if your Render URL is different:
```javascript
const LIVE_API = "https://gsr-homeocare-api.onrender.com/api";
```
Push to GitHub → Netlify auto-redeploys.

---

## Share with customers

Send this message:

> **GSR Homeocare Clinic**  
> Book consultation, shop products, track orders:  
> **https://gsr-homeocare.netlify.app**

Works on **any phone**, **any network**, **no app install**.

---

## Custom domain (optional, more professional)

Buy a domain e.g. `gsrhomeocare.com` from Namecheap/GoDaddy:

| Platform | Setting |
|----------|---------|
| Netlify | Domain settings → Add custom domain → `www.gsrhomeocare.com` |
| Render | Custom domain → `api.gsrhomeocare.com` |

Then update `config.js` LIVE_API to your API subdomain.

---

## Free tier notes

| Platform | Limit |
|----------|-------|
| Netlify | Free forever for static sites |
| Render | Free tier sleeps after 15 min idle — first visit may take ~30 sec to wake |
| MongoDB Atlas | 512 MB free |

---

## Quick checklist

- [ ] MongoDB Atlas URI ready
- [ ] Code on GitHub
- [ ] Render backend deployed + health check OK
- [ ] Netlify frontend deployed
- [ ] Site name set to `gsr-homeocare`
- [ ] Test on Android with mobile data (not Wi-Fi)

---

## Need help?

If deploy fails, check:
1. `MONGODB_URI` is correct on Render
2. Atlas allows `0.0.0.0/0` IP access
3. Render logs: Dashboard → your service → Logs

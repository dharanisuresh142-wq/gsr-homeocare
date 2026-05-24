# Render failed deploy — fix on THIS screen

You are on: **gsr-homeocare-api** → Events shows **Failed deploy**

## Do these in order (same page)

### 1) Environment variables
Left menu → **Environment** (or **Settings** → **Environment**)

Click **Add Environment Variable** — add ALL 3:

**Variable 1**
- Key: `MONGODB_URI`
- Value: `mongodb+srv://dharanisuresh142_db_user:GsrHomeocare2026@cluster0.nszjrd6.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority&appName=Cluster0`

**Variable 2**
- Key: `SPRING_PROFILES_ACTIVE`
- Value: `mongodb`

**Variable 3**
- Key: `APP_MONGODB_ORGANIZATION_ID`
- Value: `6a126d53e091a2b24b63a82c`

Click **Save, rebuild, and deploy** (or Save Changes).

---

### 2) Manual Deploy
Top right → **Manual Deploy** → **Deploy latest commit**

Wait 10–15 minutes.

---

### 3) Check Logs (if fails again)
Left menu → **Logs** → scroll to bottom → read red error.

---

### 4) Test
https://gsr-homeocare-api.onrender.com/api/health

Must show: `"status":"UP"`

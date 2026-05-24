# Render deploy failed — fix in 3 steps

## Step 1 — Add MongoDB URI (most common cause)

1. Render → **gsr-homeocare** blueprint → click service **gsr-homeocare-api**
2. Left menu → **Environment**
3. Add variable:
   - **Key:** `MONGODB_URI`
   - **Value:** your full Atlas string (password included, with `/gsr_homeocare_db`)
4. **Save Changes**

Example:
```
mongodb+srv://dharanisuresh142_db_user:YOUR_PASSWORD@cluster0.nszjrd6.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority&appName=Cluster0
```

## Step 2 — See the real error (logs)

1. On the failed deploy row → click **Create web service gsr-homeocare-api**
2. Open **Logs** tab
3. Read the red error at the bottom

Common errors:
| Log says | Fix |
|----------|-----|
| `MONGODB_URI` / connection refused | Add Step 1 + Atlas Network Access 0.0.0.0/0 |
| Docker build failed | Use updated `render.yaml` (Java build, not Docker) |
| Out of memory | Free tier — wait and retry |

## Step 3 — Redeploy

1. Blueprint page → **Manual sync** (top right)
   OR
2. Service → **Manual Deploy** → Deploy latest commit

Wait 5–10 minutes until status is **Live**.

## Test

Open: https://gsr-homeocare-api.onrender.com/api/health

Should show: `"status":"UP"`

# MongoDB Atlas setup for GSR Homeocare

Organization ID: **6a126d53e091a2b24b63a82c**  
Database name: **gsr_homeocare_db**

## 1. Atlas connection string

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Open your organization (`6a126d53e091a2b24b63a82c`)
3. **Database** → **Connect** → **Drivers**
4. Copy the connection string, e.g.:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/
   ```
5. Edit `backend/src/main/resources/application-mongodb.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority
   ```

Or set environment variable (recommended):
```powershell
setx MONGODB_URI "mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/gsr_homeocare_db?retryWrites=true&w=majority"
```
Then restart the backend.

## 2. Network access

In Atlas → **Network Access** → add your IP (or `0.0.0.0/0` for development only).

## 3. Seed data (optional)

```bash
mongosh "YOUR_CONNECTION_STRING" --file database/gsr_homeocare_mongodb.js
```

## 4. Collections

| Collection      | Purpose              |
|-----------------|----------------------|
| `products`      | Shop products        |
| `consultations` | Booking requests     |
| `orders`        | Customer orders      |

Each document includes `organizationId: 6a126d53e091a2b24b63a82c`.

## 5. Local MongoDB (without Atlas)

Install MongoDB Community, then run backend with profile `mongodb-local` or leave default (uses `mongodb://localhost:27017/gsr_homeocare_db`).

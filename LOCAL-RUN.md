# Run GSR Homeocare locally (no deploy)

## One-click start

Double-click **`RUN-ALL.bat`** in the project folder.

- PC: http://localhost:5500
- Phone (same Wi-Fi): use the IP shown in the black window, e.g. http://192.168.1.106:5500

Keep both command windows open (backend + frontend).

## MongoDB

Local run uses **MongoDB Atlas** via `mongodb-uri.txt` (not committed to Git).

1. Copy `mongodb-uri.example.txt` → `mongodb-uri.txt`
2. Paste your Atlas connection string (one line)

## Login

| Role | How to login |
|------|----------------|
| **Admin** | http://localhost:5500/login.html → Admin tab · user `admin` · password `GsrAdmin2026` |
| **Customer** | Register tab (first time) or Customer tab with phone + password |

- **My Orders** requires customer login
- **Admin panel** requires admin login
- Use **Logout** from the menu when signed in

## New features

| Page | URL | What it does |
|------|-----|----------------|
| Products | `/products.html` | Browse, add to cart |
| Checkout | `/checkout.html` | Delivery details + payment (COD, UPI, Card, Online) |
| My Orders | `/orders.html` | Order history by phone number |
| Tracking | `/tracking.html` | Track by order ID |
| Admin | `/admin.html` | All orders, update status, products |

## API

- Health: http://localhost:8080/api/health
- Orders: `GET /api/orders?phone=`, `POST /api/orders`

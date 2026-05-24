# GSR Homeocare System

A full-stack medical business web application for a Homeocare and physiotherapy clinic. It supports product browsing, consultation booking, order placement, order tracking, and an admin panel.

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | HTML, CSS, JavaScript, Bootstrap 5                |
| Backend  | Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Validation |
| Database | MySQL                                             |

## Project Structure

```
mano/
├── frontend/          # Static web UI
│   ├── index.html
│   ├── products.html
│   ├── consultation.html
│   ├── tracking.html
│   ├── admin.html
│   ├── css/style.css
│   └── js/script.js
├── backend/           # Spring Boot REST API
│   ├── pom.xml
│   └── src/main/java/com/gsr/Homeocare/
└── README.md
```

## Prerequisites

1. **Java JDK 17+**
2. **Maven 3.8+**
3. **MySQL 8+**
4. A modern browser (Chrome, Edge, Firefox)
5. **VS Code** or **IntelliJ IDEA** (optional, for editing)

## Database Setup

### Option A — Embedded H2 (default, no MySQL needed)

The backend starts with profile **`h2`**. Data is stored in:

`backend/data/gsr_homeocare_db.mv.db`

- No MySQL installation required
- Sample products are added automatically on first run
- H2 console: **http://localhost:8080/h2-console**  
  - JDBC URL: `jdbc:h2:file:./data/gsr_homeocare_db`  
  - User: `sa`  
  - Password: *(empty)*

### Option B — MySQL (production)

1. Start MySQL Server.
2. Run the SQL script:

```bash
mysql -u root -p < database/gsr_homeocare_db.sql
```

Or open `database/gsr_homeocare_db.sql` in MySQL Workbench and execute it.

3. Edit `backend/src/main/resources/application-mysql.properties` with your password.

4. Start backend with MySQL:

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

Or double-click **`run-backend-mysql.bat`**.

Tables are also auto-created by JPA (`ddl-auto=update`).

## Quick Start (Windows)

1. **Start MySQL** and set your password in `backend/src/main/resources/application.properties`.
2. **Backend:** double-click `backend/run-backend.bat` (or run from IntelliJ).
3. **Frontend:** double-click `frontend/run-frontend.bat` (or use VS Code Live Server).
4. Open **http://localhost:5500** in your browser.

## Backend Setup & Run

### Using IntelliJ IDEA

1. Open the `backend` folder as a Maven project.
2. Wait for dependencies to download.
3. Run `GsrHomeocareApplication.java`.
4. API runs at: **http://localhost:8080**

### Using Command Line

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

## Frontend Setup & Run

The frontend is static HTML. Serve it with any local HTTP server (required for API calls from some browsers).

### Option 1: VS Code Live Server

1. Open the `frontend` folder in VS Code.
2. Install the **Live Server** extension.
3. Right-click `index.html` → **Open with Live Server**.

### Option 2: Python HTTP Server

```bash
cd frontend
python -m http.server 5500
```

Open: **http://localhost:5500**

### API URL

The frontend calls `http://localhost:8080/api`. Change it in `frontend/js/script.js` if your backend runs on a different host/port:

```javascript
const API_BASE_URL = "http://localhost:8080/api";
```

## REST API Endpoints

| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | `/api/products`           | List all products        |
| POST   | `/api/products`           | Add a new product        |
| GET    | `/api/consultations`      | List all consultations   |
| POST   | `/api/consultations`      | Book a consultation      |
| GET    | `/api/orders/{id}`        | Get order by ID          |
| POST   | `/api/orders`             | Create a new order       |
| PUT    | `/api/orders/{id}`        | Update order status      |

### Sample Requests

**Create consultation:**
```json
POST /api/consultations
{
  "name": "John Doe",
  "phone": "9876543210",
  "problem": "Back pain",
  "mode": "online",
  "date": "2026-05-25"
}
```

**Create order:**
```json
POST /api/orders
{
  "customerName": "John Doe"
}
```

**Update order status:**
```json
PUT /api/orders/1
{
  "status": "Shipped"
}
```

## Application Features

### Public Pages
- **Home** — Clinic overview, services, hero section
- **Products** — Dynamic product list, search, add-to-cart (localStorage)
- **Consultation** — Book online/offline appointments
- **Tracking** — Track order status by ID

### Admin Panel
- Add products
- Update order status
- View all consultation bookings

## Default Sample Data

On first startup, the backend seeds three sample products if the database is empty.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Products not loading | Start backend first; check green **API Online** badge in navbar |
| Connection failed | Use default H2 profile (`run-backend.bat`); no MySQL required |
| CORS errors | Use Live Server or `run-frontend.bat`, not `file://` |
| MySQL connection refused | Use H2 default, or fix `application-mysql.properties` and start MySQL service |
| Java/Maven not found | Install JDK 17+ and Maven, or run from IntelliJ IDEA |
| Validation errors | Check API response message for field-level details |

## License

Educational / demonstration project for GSR Homeocare & Physiotherapy Clinic.

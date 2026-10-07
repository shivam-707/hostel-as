# AuraHostel - Campus Hostel Administration System

An enterprise-grade, modern, scalable Hostel Administration System tailored specifically to your campus layout, featuring a high-performance backend, production MySQL schema, and a modern React frontend design system.

---

## 🏛️ Campus Architecture & Scale

The system is configured precisely for your campus requirements:

- **5 Hostel Blocks**:
  1. **Aravali Boys Hostel (Block A / BH-1)** - 80 Rooms, 200 Beds
  2. **Nilgiri Boys Hostel (Block B / BH-2)** - 80 Rooms, 200 Beds
  3. **Shivalik Boys Hostel (Block C / BH-3)** - 80 Rooms, 200 Beds
  4. **Vindhya Boys Hostel (Block D / BH-4)** - 80 Rooms, 200 Beds
  5. **Ganga Girls Hostel (Block G / GH-1)** - 80 Rooms, 200 Beds
- **Campus Capacity Totals**:
  - **Total Rooms**: 400 Rooms (80 rooms per hostel × 5 hostels)
  - **Total Bed Capacity**: 1,000 Students (800 Boys capacity + 200 Girls capacity)
- **Room Breakdown per Hostel (80 Rooms / 4 Floors)**:
  - **20 Rooms**: 2-Seater AC (Ground & 1st Floor, 10/floor) → 40 Beds
  - **20 Rooms**: 2-Seater Non-AC (Ground & 1st Floor, 10/floor) → 40 Beds
  - **20 Rooms**: 3-Seater AC (2nd & 3rd Floor, 10/floor) → 60 Beds
  - **20 Rooms**: 3-Seater Non-AC (2nd & 3rd Floor, 10/floor) → 60 Beds
  - **Total per Hostel**: 80 Rooms, 200 Beds
- **Administration & Wardens**:
  - **1 Chief Warden**: Dr. Rajesh Sharma (Dean Student Affairs, Overall Oversight)
  - **5 Dedicated Resident Hostel Wardens**:
    - Aravali Boys Hostel: Prof. Vikram Malhotra
    - Nilgiri Boys Hostel: Dr. Amit Verma
    - Shivalik Boys Hostel: Prof. Suresh Kulkarni
    - Vindhya Boys Hostel: Dr. Manoj Nair
    - Ganga Girls Hostel: Dr. Sunita Deshmukh

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 18 with Vite
  - Modern Vanilla CSS Design System with dark/light themes, glassmorphism, responsive grids, and micro-animations
  - Lucide Icons
- **Backend**:
  - Node.js & Express
  - `mysql2/promise` with connection pooling, transaction safety, and parameterized queries
  - Automatic database initialization & schema migrations
  - Built-in resilient storage engine providing zero-downtime operation
- **Database**:
  - **MySQL 8.1** on `127.0.0.1:3306`
  - Database name: `hostel_db`
  - Production DDL schema in `server/src/db/schema.sql`

---

## 🚀 Running the Project

### 1. Backend Server
```bash
cd server
npm install
npm start
# Server listens on http://localhost:5000
```

### 2. Frontend Application
```bash
cd client
npm install
npm run dev
# Frontend listens on http://localhost:3000
```

---

## 🗄️ MySQL Database Setup & Configuration

1. The SQL DDL schema is located in:
   [server/src/db/schema.sql](file:///d:/shivam/Hostel%20Administration%20System/server/src/db/schema.sql)
2. In the web interface, click the **"Storage Engine Active" / "MySQL Live"** button in the top navigation bar at any time to open the MySQL Database Configuration modal:
   - Enter your MySQL password
   - Click **"Connect to MySQL"**
   - The system will immediately create `hostel_db`, load the tables, and synchronize.
3. Alternatively, update `server/.env`:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=hostel_db
   ```

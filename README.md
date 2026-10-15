# 🎓 PlacePro Cloud

> **Next-Generation Campus Placement & Recruitment Management Platform**

PlacePro Cloud is a full-stack campus placement and recruitment portal connecting students, placement cells, and recruiters with automated workflows, eligibility filtering, mock assessment tests, and interview tracking.

---

## 🌟 Key Features

- **Multi-Role Portal:** Separate dashboards tailored for Students, Placement Admins, and Company Recruiters.
- **Drive Management:** Recruiter/Admin job posting with automated eligibility criteria (CGPA, backlogs, department, passout year).
- **Online Mock Assessments:** Practice technical and aptitude MCQs with real-time timers and instant scoring.
- **Resume & Profile Hub:** Comprehensive student profiles, education history, and portfolio links.
- **Interview & Application Tracking:** Real-time application statuses (Applied, Shortlisted, Interviewed, Selected/Rejected).
- **Notifications:** Campus-wide drive announcements and real-time status alerts.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router v6, Chart.js, Bootstrap 5 & Icons, Axios
- **Backend:** Node.js, Express.js, JWT Authentication, Multer
- **Database:** MySQL 8 with connection pooling (`mysql2`)
- **Cloud/Media (Optional):** Cloudinary for resume/document storage, Google Gemini AI for smart resume feedback

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MySQL Server (v8+)
- Git

### 2. Clone the Repository
```bash
git clone https://github.com/<your-username>/placepro-cloud.git
cd placepro-cloud
```

### 3. Database Setup
1. Create and populate the database using the schema file:
   - Import `backend/database/schema.sql` into your MySQL instance.
2. In `backend/.env`, set your MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=placepro_cloud
   JWT_SECRET=placepro_super_secret_jwt_key_2024
   CLIENT_URL=http://localhost:5173
   ```
3. Seed sample data:
   ```bash
   cd backend
   npm run seed
   ```

### 4. Run Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend runs at `http://localhost:5000`.

### 5. Run Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 👥 Demo Credentials (after running `npm run seed`)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@placepro.com` | `admin123` |
| **Recruiter** | `recruiter@tcs.com` | `admin123` |
| **Student** | `student@test.com` | `admin123` |

---

## 📄 License
This project is licensed under the MIT License.

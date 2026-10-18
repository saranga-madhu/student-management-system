# 🎓 Student Management System

A full-stack web application for managing students, lecturers, courses, and enrollments — built with **Spring Boot** and **Next.js**, secured with **JWT authentication**.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Java 21, Spring Boot, Spring Security, JWT, Spring Data JPA, PostgreSQL, Maven |
| **Frontend** | Next.js 16, TypeScript, Tailwind CSS, Axios |

---

## ✨ Features

- 🔐 JWT-based login with role-based access (Admin, Staff, Student)
- 👩‍🎓 Student management — add, view, update, delete
- 👨‍🏫 Lecturer management
- 📚 Course management
- 📋 Student enrollment into courses
- 👤 User profile management

---

## 📁 Project Structure

```
student-management-system/
├── backend/       # Spring Boot REST API
│   ├── src/
│   │   └── main/java/com/gamage/student_management/
│   │       ├── controller/   # API endpoints
│   │       ├── entity/       # Database models
│   │       ├── service/      # Business logic
│   │       ├── repository/   # Data access
│   │       ├── dto/          # Request/Response objects
│   │       └── security/     # JWT & auth config
│   └── pom.xml
│
└── frontend/      # Next.js App
    ├── app/
    │   ├── login/
    │   ├── dashboard/
    │   ├── students/
    │   ├── lecturers/
    │   ├── courses/
    │   └── profile/
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Java 21+
- Node.js 18+
- PostgreSQL

### Backend

1. Create a PostgreSQL database:
```sql
CREATE DATABASE student_management;
```

2. Set environment variables:
```env
DB_URL=jdbc:postgresql://localhost:5432/student_management
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
ADMIN_PASSWORD=your_admin_password
STAFF_REGISTRATION_CODE=your_code
FRONTEND_URL=http://localhost:3000
```

3. Run:
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
API runs at `http://localhost:8080`

### Frontend

1. Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

2. Run:
```bash
cd frontend
npm install
npm run dev
```
App runs at `http://localhost:3000`

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `ADMIN` | Full access to all features |
| `STAFF` | Manage students and enrollments |
| `STUDENT` | View own profile and courses |

> The **admin** account is auto-created on first startup using `ADMIN_PASSWORD`. Default username: `admin`

---

## 📄 License

This project is for educational purposes.

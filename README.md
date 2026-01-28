# 🌐 DevConnect - Social Networking for Developers

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://dev-connect-sigma-five.vercel.app/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

**DevConnect** is a specialized full-stack social platform designed for developers to share insights, showcase projects, and engage in real-time technical discussions. 

> **Note:** This project is currently in active development 🛠️. New features and performance optimizations are being pushed weekly.

---

## 🚀 Key Features

- **Real-time Interactions:** Instant notifications for likes and comments powered by **Socket.io**.
- **Developer Profiles:** Customizable profiles featuring professional details, profile pictures (Cloudinary), and activity feeds.
- **Dynamic Content:** Create, edit, and delete posts with full media support and interactive comment sections.
- **Secure Authentication:** Robust JWT-based auth with HTTP-only cookies and secure password hashing.
- **Advanced Admin Suite:** Dedicated dashboard for user management, system health monitoring, and audit logs.
- **Modern UI/UX:** Responsive design built with **Tailwind CSS** and **Shadcn UI**, including a dark mode toggle.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Shadcn UI, Axios, Framer Motion |
| **Backend** | Node.js, Express.js, Socket.io, Zod (Validation), Multer |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Testing** | Jest, Supertest (Backend), Playwright (E2E) |
| **DevOps** | Vercel (Deployment), Cloudinary (Media), GitHub Actions (CI) |

---


## 📐 System Architecture

DevConnect is built on a decoupled architecture for scalability:
- **Client:** A high-performance SPA built with Vite.
- **API:** A RESTful Node.js server using a Service-Controller pattern for clean code separation.
- **Real-time:** A WebSocket layer for bi-directional event handling.
- **Security:** Implements Helmet.js for header protection, express-rate-limit to prevent abuse, and Zod for strict schema validation.

---

## 📄 API Documentation

The backend includes full OpenAPI/Swagger documentation.
- **Live Swagger UI:** [https://dev-connect-sigma-five.vercel.app/api-docs](https://dev-connect-sigma-five.vercel.app/api-docs)

---

## 🧪 Testing & Quality Assurance

Quality is a priority. This project includes:
- **Integration Tests:** Testing API endpoints and database logic with Jest.
- **E2E Testing:** Automated user flow testing with Playwright.
- **Validation:** 100% of incoming request data is validated via Zod schemas.

To run tests locally:
```bash
cd BACKEND
npm test

👨‍💻 Author
Vamshi Krishna Ramagani 2025 B.Tech IT Graduate | Aspiring Full-Stack Developer

LinkedIn: https://www.linkedin.com/in/vamshi-krishna-ramagani-88871431b/

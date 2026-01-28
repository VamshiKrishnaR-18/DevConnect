# 👨‍💻 DevConnect

> **The Social Platform for Developers.**
> Network, share projects, and collaborate in real-time.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Now-2ea44f?style=for-the-badge&logo=vercel)](https://dev-connect-sigma-five.vercel.app/)
![Tech Stack](https://img.shields.io/badge/MERN-Stack-blue?style=flat&logo=react)
![Build Status](https://img.shields.io/badge/Build-Passing-success)
![License](https://img.shields.io/badge/License-ISC-yellow)

**🔗 Live URL:** [https://dev-connect-sigma-five.vercel.app/](https://dev-connect-sigma-five.vercel.app/)

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#-tech-stack)
- [⚙️ Prerequisites](#-prerequisites)
- [🚀 Installation & Setup](#-installation--setup)
- [🔧 Environment Variables](#-environment-variables)
- [🏃‍♂️ Running the App](#-running-the-app)
- [🧪 Testing](#-testing)
- [🛡️ Admin Panel](#-admin-panel)
- [📚 API Documentation](#-api-documentation)
- [📂 Project Structure](#-project-structure)

---

## ✨ Key Features

- **🔐 Advanced Authentication**: Secure JWT-based auth (Access + Refresh Tokens) with password reset functionality.
- **📱 Dynamic Social Feed**: Create rich posts with text, images, and videos. Supports infinite scrolling and media optimization.
- **⚡ Real-time Interaction**: Instant notifications, likes, and comments powered by **Socket.io**.
- **👤 Developer Profiles**: Showcase GitHub stats, portfolios, and technical skills in a customizable profile.
- **🛡️ Admin Dashboard**: Dedicated administrative control for managing users and content, secured with role-based access.
- **☁️ Cloud Media**: Seamless image and video uploads utilizing **Cloudinary** for storage and optimization.

---

## 🛠️ Tech Stack

### **Frontend**
- **Core**: React 19, Vite
- **Styling**: Tailwind CSS
- **State & Data**: React Query (@tanstack/react-query), Context API
- **Routing**: React Router DOM
- **Deployment**: Vercel

### **Backend**
- **Server**: Node.js, Express 5.x
- **Database**: MongoDB, Mongoose
- **Validation**: Zod
- **API Docs**: Swagger / OpenAPI
- **Real-time**: Socket.io

---

## ⚙️ Prerequisites

Ensure you have the following installed:
- **Node.js** (v18+)
- **npm** (or yarn/pnpm)
- **MongoDB** (Local instance or Atlas connection string)
- **Cloudinary Account** (API Key & Secret)

---

## 🚀 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/VamshiKrishnaR-18/DevConnect.git](https://github.com/VamshiKrishnaR-18/DevConnect.git)
   cd DevConnect

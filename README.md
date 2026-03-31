<h1 align="center">📌 DevHuntr</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Express.js-Backend-gray?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

## 🧾 Project Description
**DevHuntr** is a modern, full-stack platform designed to discover, review, and track the best developer tools, SaaS products, and APIs on the market. It provides a community-driven marketplace where users can upvote trending tech, write detailed reviews, and securely manage product life cycles through role-based access.

## 🌐 Live URLs
- **Frontend Application:** [https://devhuntrclient.vercel.app](https://devhuntrclient.vercel.app)
- **Backend API:** [https://devhuntrserver.onrender.com](https://devhuntrserver.onrender.com)

## ✨ Features
- **Public Product Discovery:** Browse featured and trending developer products.
- **Role-Based Access Control (RBAC):** Dedicated, secure access layers for Users, Moderators, and Administrators utilizing JWT.
- **Dynamic Actionable Dashboards:** Parallel-routed dashboard interfaces tailored for specific admin and moderator roles.
- **Community Engagement:** Robust product upvoting, comprehensive reviewing, commenting, and reporting capabilities.
- **Secure File Uploads:** Integrated image upload services (ImgBB) for user avatars and product galleries.
- **Premium Subscriptions:** Stripe-powered payment integrations for premium platform features.
- **Performance Optimized:** Server-Side Rendering (SSR) via Next.js for lightning-fast metrics and SEO performance.

## 🛠️ Technologies Used

### Frontend (Client)
- **Core:** Next.js 16 (App Router), React 19
- **Styling UI:** Tailwind CSS v4, Shadcn UI, Radix UI
- **Forms & Validation:** React-Hook-Form, Zod
- **API Handling:** Axios / Native Fetch with structured generic services

### Backend (Server)
- **Core:** Node.js, Express.js (TypeScript)
- **Database & ORM:** PostgreSQL, Prisma ORM
- **Validation:** Zod
- **Security:** JWT Authentication, bcrypt, CORS
- **Integrations:** Stripe Webhooks API

## 📂 Folder Structure

The project is divided into two distinct repositories to separate concerns and simplify deployments.

**Frontend Repository ([DevHuntr_Client](https://github.com/AbuBakkarSiddique007/DevHuntr_Client))**
```text
DevHuntr_Client/
├── public/                 # Static assets
└── src/
    ├── app/                # Next.js App Router & Parallel Routes
    ├── components/         # Reusable UI & Dashboard components
    ├── context/            # React Context (Auth)
    └── services/           # Backend API interaction methods
```

**Backend Repository ([DevHuntr_Server](https://github.com/AbuBakkarSiddique007/DevHuntr_Server))**
```text
DevHuntr_Server/
├── prisma/                 # Database schemas and migrations
└── src/
    ├── app/                # Route, Middleware, and Module configurations
    ├── module/             # Domain logic (Auth, User, Product, Payment)
    └── server.ts           # DB Init and Server starting point
```

## 🔐 Environment Variables

You need to establish environment configurations for both applications.

### Client (`DevHuntr_Client/.env.local`)
Create an `.env.local` file inside the root of the client directory:
```env
# The URL pointing to your running Express backend
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Image Uploading Service Key
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here
```

### Server (`DevHuntr_Server/.env`)
Create a `.env` file inside the root of the server directory:
```env
# Environment type (development / production)
NODE_ENV=development
PORT=5000

# PostgreSQL Database Connections string
DATABASE_URL="postgresql://user:password@localhost:5432/devhuntr?sslmode=require"

# JWT Auth
JWT_SECRET="your_highly_secure_jwt_secret"
JWT_EXPIRES_IN="1d"

# Allowed Client Origin
CLIENT_URL="http://localhost:3000"

# Stripe Integrations
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## ⚙️ Setup Instructions

To get this project running locally on your machine, follow these instructions to setup both the Server and Client independently.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL installed and running
- Git

### 1. Setup the Server Database & Backend

Open a terminal and clone the Server repository:
```bash
git clone https://github.com/AbuBakkarSiddique007/DevHuntr_Server.git
cd DevHuntr_Server
pnpm install

# IMPORTANT: Make sure you have created your .env file as instructed above!

# Generate the Prisma Client
npx prisma generate

# Push the Prisma schema to your PostgreSQL database
npx prisma db push

# Start the development server
pnpm run dev
```
The API should now be running locally at `http://localhost:5000`.

### 2. Setup the Next.js Frontend

Open a **new** terminal window, keeping the server running in the background. Then, clone the Client repository:
```bash
git clone https://github.com/AbuBakkarSiddique007/DevHuntr_Client.git
cd DevHuntr_Client
pnpm install

# IMPORTANT: Make sure you have created your .env.local file as instructed above!

# Start the Next.js development environment
pnpm run dev
```
The Next.js application will safely connect to your API and be available at `http://localhost:3000`.

## 🚀 Deployment Info

- **Frontend Deployment:** Hosted natively via [Vercel](https://vercel.com). Deploy securely by pushing changes to your GitHub branch and configuring dynamic Next.js variables on the Vercel dashboard.
- **Backend Deployment:** Hosted via [Render](https://render.com). The Express app is optimized to be deployed as a web-service pointing to a hosted PostgreSQL instance.

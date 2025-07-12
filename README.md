
# ScanMyMeal

## Overview

**ScanMyMeal** is a real-time food ordering web application designed to streamline the ordering process for users while providing admins with powerful tools to manage their restaurant. Built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), it offers a smooth and interactive user experience.

---

## 🚀 Features

- Full-Stack Web App for real-time food ordering

### Tech Stack:
- **Frontend**: Next.js, React.js, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Other Tools**: Cloudinary (image uploads), Stripe (payment gateway), Redux (state management), JWT (authentication)

### Core Features:
- ✅ User Authentication (Signup, Login, Forgot Password)
- ✅ Admin Panel (Manage Categories, Subcategories, Products, Orders, Users)
- ✅ Product Management (CRUD with Cloudinary uploads)
- ✅ Cart & Checkout (COD and Online Payments via Stripe)
- ✅ Order Tracking (View Past & Upcoming Orders)
- ✅ Profile Management (Edit profile, avatar upload)
- ✅ Search & Browse (Products by Category/Subcategory)
- ✅ Responsive, Modern UI with animations & icons

### Advanced Functionalities:
- 🚀 Dynamic Content Management via Admin Panel
- 🚀 Cloudinary integration for optimized image handling
- 🚀 Nodemailer integration for mail sending
- 🚀 Secure authentication with JWT & refresh tokens
- 🚀 User-friendly forms, toast notifications, and interactivity

**Purpose**: A platform for users to seamlessly browse, order, and manage food items, while admins can control all data dynamically.

---

## 💻 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Redux Toolkit, Axios, Lucide-React, React Icons, Framer Motion, React Infinite Scroll, Typewriter Animation
- **Backend**: Node.js, Express.js, MongoDB, Cloudinary, JWT, Bcrypt.js, Stripe, Multer, Nodemailer
- **Other Libraries**: Cookie Parser, Morgan, Helmet, Dotenv, Cors

.

---

## 💻 Tech Stack

- **Frontend**: React.js, Tailwind CSS, Redux Toolkit, Axios, Lucide-React, React Icons, Framer Motion, React Infinite Scroll, Typewriter Animation
- **Backend**: Node.js, Express.js, MongoDB, Cloudinary, JWT, Bcrypt.js, Stripe, Multer, Nodemailer
- **Other Libraries**: Cookie Parser, Morgan, Helmet, Dotenv, Cors

---

## 📂 Project Structure

``` bash
/server
  /config
    conn.js
    stripe.js
  /controllers
    userController.js
    addressController.js
    adminController.js
    ...
    ...
  /helpers
    tryMailer.js
  /middlewares
    auth.js
    admin.js
    multer.js
  /models
    userModel.js
    addressModel.js
    adminModel.js
    ...
    ...
  /routes
    userRouter.js
    addressRouter.js
    adminRouter.js
    ...
    ...
  /templates
    sentOtpTemplate.js
    verifymailTemplate.js
    ...
  /utils
    generateOTP.js
    ...
    ...
  server.js

/frontend
  /app
    /admin
    /cancel
    /category
    ...
    ...
  /Components
    AccountSuspention.js
    AddAddress.js
    AddMoreDetails.js
    ...
    ...
  /hooks
    changePath.js
    useMobile.js
    usePath.js
  /provider
    GlobalProvider.js
  /public
    /assets
    /common
    /store
    /utils
  .env
  package.json
```

---

## 🛠️ Setup & Installation

1. Clone the repository:

```bash
git clone https://github.com/rishabh-060/scan-my-meal.git
cd scan-my-meal
```

2. Setup Backend:

```bash
cd backend
npm install
npm run start
```

3. Setup Frontend:

```bash
cd frontend
npm install
npm run dev
```

4. Configure `.env` files for both backend and frontend with your variables (MongoDB URI, JWT secrets, Cloudinary keys, etc.).

5. Visit `http://localhost:3000` to explore the application.

---

## 📫 Contact

For any queries, reach out to:

- **Email**: [verma.rishabh924@gmail.com](mailto:verma.rishabh924@gmail.com)
- **LinkedIn**: [Rishabh Verma](https://linkedin.com/in/rishabh-verma-277530223/)
- **Project URL**: [ScanMyMeal](https://scanmymeal.netlify.app/)

---

## 📝 License

MIT License

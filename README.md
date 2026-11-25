# ShopNova — Full-Stack E-Commerce Store

A full-stack MERN E-Commerce web application featuring Role-Based Access Control (Admin & Customer), product search and category filtering, a slide-over shopping cart, and end-to-end order tracking.

## Live Demo
- **Live Store:** [View Live Demo](https://ecommerce-store-xhsx.vercel.app/)

## Screenshots
[./screenshots/store1.png]
[./screenshots/store2.png]
[./screenshots/admin1.png]
[./screenshots/admin2.png]
[./screenshots/admin3.png]

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs
- **Database:** MongoDB Atlas (Mongoose)
- **Deployment:** Vercel (Frontend) & Render (Backend)

## Key Features
- Role-based authentication (`user` and `admin`) secured with JWT and bcrypt
- Public storefront with live search and category filtering
- Interactive slide-over cart drawer with quantity controls and checkout
- Customer order history (`Pending`, `Shipped`, `Delivered`)
- Protected Admin Dashboard to add/delete products and update order statuses

## Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/AMANDEEPKUMAR242924/ecommerce-store.git](https://github.com/AMANDEEPKUMAR242924/ecommerce-store.git)
   Backend (server/): npm install → add PORT, MONGO_URI, and JWT_SECRET in .env → npm run dev

Frontend (client/): npm install → npm run dev
🛠️ Urban Vogue Backend
The Urban Vogue Backend is a powerful RESTful API that supports a full-featured e-commerce platform. It handles user authentication, product and order management, and integrates with PayPal for payments.

🚀 Features
User registration & login (with hashed passwords and JWT)

Role-based access control (admin & customer)

Product catalog management (CRUD)

Category and size filtering

Cart & wishlist functionality

Order placement & tracking

PayPal payment integration

RESTful API with structured error handling

MongoDB for data persistence

📦 Tech Stack
Node.js + Express

MongoDB + Mongoose

JWT for authentication

Cloudinary (optional image handling)

CORS for frontend communication

dotenv for environment config

Zod or Yup for validation (optional)

📁 Project Structure
urban-vogue-backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── app.js
├── .env
├── package.json
└── README.md

⚙️ Installation
# Clone the repository
git clone https://github.com/your-username/urban-vogue-backend.git
cd urban-vogue-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

🔐 Environment Variables
Make sure your .env file includes:
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
PAYPAL_CLIENT_ID=your_paypal_client_id

🧪 Running the Project
# Development mode
npm run dev

# Production build
npm run build
npm start

📬 API Endpoints (Examples)
| Method | Endpoint           | Description                | Auth Required |
| ------ | ------------------ | -------------------------- | ------------- |
| POST   | /api/auth/register | Register a new user        | ❌             |
| POST   | /api/auth/login    | User login                 | ❌             |
| GET    | /api/products      | Get all products           | ❌             |
| POST   | /api/products      | Create product             | ✅ Admin       |
| GET    | /api/orders/user   | Get orders for logged user | ✅             |
| POST   | /api/orders        | Create new order           | ✅             |


🔒 Auth Structure
JWT Token is stored in cookies.

Role-based guards for admin routes.

Middleware for token validation.

🧹 Linting & Formatting
npm run lint

✅ To-Do / Improvements
 Add refresh tokens

 Add Stripe as payment alternative

 Integrate Swagger for documentation

 Add review and rating system

📄 License
This project is licensed under the MIT License.
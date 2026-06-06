# BookReview — Backend

REST API for the BookReview platform. Handles authentication, book management, and reviews.

---

## Tech Stack

- **Node.js + Express 5** — server framework
- **Prisma ORM** — database access layer
- **PostgreSQL via Neon** — serverless database
- **Cloudinary** — image storage and delivery
- **JWT** — access token authentication
- **Nodemailer** — transactional email (verification, password reset)
- **Bcryptjs** — password hashing
- **Multer** — file upload handling
- **Zod** — request validation
- **Sentry** — error monitoring and tracking
- **Groq SDK** — AI-powered review summarization via Llama 3

---

## Features

- JWT authentication with refresh token rotation
- Email verification on registration via Nodemailer
- Book CRUD with Cloudinary image uploads
- Review system with one review per user per book (editable)
- Auto-calculated `avgRating` and `reviewCount` on books
- Paginated book listing with search and sort
- Lightweight book search endpoint for header dropdown
- Optional auth middleware for public endpoints
- Dashboard stats (total books, reviews, members)
- Production error monitoring via Sentry

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudinary](https://cloudinary.com) account

### Installation

```bash
git clone https://github.com/Harlloh/Bookish-server
cd Bookish-server
npm install
```

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
PORT=5001
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
GROQ_API_KEY=your_groq_api_key
```

### Generating JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this twice to generate separate secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET`.

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Running Locally

```bash
npm run start
```

### Running in Production

```bash
npm run start:prod
```

---

## Error Monitoring

This project uses [Sentry](https://sentry.io) for error tracking in production. Sentry is initialized in `instrument.js`, which is imported before anything else in `server.js` to ensure all errors are captured from startup.

The `Sentry.expressErrorHandler()` middleware is registered after all routes to automatically capture errors thrown inside route handlers.

---

## API Endpoints

### Auth

| Method | Endpoint                    | Description          | Auth |
| ------ | --------------------------- | -------------------- | ---- |
| POST   | `/auth/register`            | Register new user    | ❌   |
| POST   | `/auth/login`               | Login                | ❌   |
| POST   | `/auth/logout`              | Logout               | ✅   |
| POST   | `/auth/refresh`             | Refresh access token | ❌   |
| GET    | `/auth/verify-email/:token` | Verify email         | ❌   |

### Books

| Method | Endpoint                | Description                              | Auth |
| ------ | ----------------------- | ---------------------------------------- | ---- |
| GET    | `/books`                | Get all books (paginated, search, sort)  | ❌   |
| GET    | `/books/:id`            | Get book by ID with reviews              | ❌   |
| POST   | `/books`                | Add a new book                           | ✅   |
| POST   | `/books/search`         | Lightweight title search for dropdown    | ❌   |
| GET    | `/books/:id/ai-summary` | Get AI-generated summary of book reviews | ❌   |

### Reviews

| Method | Endpoint                   | Description          | Auth |
| ------ | -------------------------- | -------------------- | ---- |
| POST   | `/reviews/add-review/:id`  | Add review to a book | ✅   |
| PUT    | `/reviews/edit-review/:id` | Edit your review     | ✅   |

### Dashboard

| Method | Endpoint     | Description                        | Auth     |
| ------ | ------------ | ---------------------------------- | -------- |
| GET    | `/dashboard` | Get stats, recent books, top rated | Optional |

### Profile

| Method | Endpoint   | Description                                     | Auth |
| ------ | ---------- | ----------------------------------------------- | ---- |
| GET    | `/profile` | Get current user profile with books and reviews | ✅   |

---

## Project Structure

```
src/
├── config/
│   ├── controllers/
│   │   ├── authControllers.js
│   │   ├── bookControllers.js
│   │   ├── dashboardControllers.js
│   │   ├── reviewControllers.js
│   │   └── userControllers.js
│   └── db.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   ├── booksRoutes.js
│   ├── dashboardRoutes.js
│   ├── reviewRoutes.js
│   └── userRoutes.js
├── utils/
│   └── cloudinary.js
├── instrument.js
└── server.js
prisma/
└── schema.prisma
```

---

## Deployment

Recommended platforms: **Railway** or **Render**.

Set all environment variables from `.env.example` in your platform dashboard.

Build command:

```bash
npm run build
```

Start command:

```bash
npm run start:prod
```

---

## Author

**Allo Olorunfemi**

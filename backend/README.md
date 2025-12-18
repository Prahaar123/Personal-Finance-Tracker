# Finance Tracker Backend API

Advanced Personal Finance Tracker backend built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT (access & refresh tokens)
- Transaction management (CRUD operations)
- Category management (default + custom categories)
- Budget tracking with alerts
- Recurring transactions
- Dashboard analytics
- Reports (CSV & PDF export)
- RESTful API architecture

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT & Bcrypt
- **Export**: json2csv, PDFKit

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance-tracker
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# For macOS (with Homebrew)
brew services start mongodb-community

# For Ubuntu
sudo systemctl start mongod

# For Windows
net start MongoDB
```

### 4. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account

### Transactions
- `GET /api/transactions` - Get all transactions (with pagination & filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/:id/summary` - Get category spending summary

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create/update budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/history/:categoryId` - Get budget history

### Recurring Transactions
- `GET /api/recurring` - Get all recurring transactions
- `GET /api/recurring/:id` - Get single recurring transaction
- `POST /api/recurring` - Create recurring transaction
- `PUT /api/recurring/:id` - Update recurring transaction
- `DELETE /api/recurring/:id` - Delete recurring transaction
- `POST /api/recurring/generate` - Generate transactions from recurring

### Dashboard
- `GET /api/dashboard` - Get dashboard summary

### Analytics
- `GET /api/analytics/income-expense` - Get income vs expense analytics
- `GET /api/analytics/category-breakdown` - Get category breakdown
- `GET /api/analytics/daily-trends` - Get daily spending trends

### Reports
- `GET /api/reports/csv` - Export transactions as CSV
- `GET /api/reports/pdf` - Export transactions as PDF

## Database Models

### User
- name, email, password (hashed)
- currency preference
- financial goals (monthly savings)
- refresh token

### Transaction
- user reference
- amount, type (income/expense)
- category reference
- date, notes

### Category
- user reference (null for default categories)
- name, type, icon, color
- isDefault flag

### Budget
- user, category references
- amount, spent
- month, year

### RecurringTransaction
- user, category references
- amount, type, frequency
- dayOfMonth, notes
- enabled flag, lastGenerated date

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Access & refresh token system
- Protected API routes
- Input validation
- Error handling middleware

## Development Notes

- All routes require authentication except register, login, and refresh
- Transactions automatically update budget spent amounts
- Default categories are created on user registration
- Recurring transactions can be auto-generated monthly
- Budget alerts trigger at 80% and 100% thresholds
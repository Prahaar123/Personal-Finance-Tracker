# Advanced Personal Finance Tracker

A full-stack web application that helps users manage their personal finances by tracking income and expenses, setting budgets, analyzing spending patterns, and exporting financial reports.

This project is built with a modern MERN-style architecture and focuses on clean authentication, real-world data modeling, and practical financial insights.

## Live Demo
https://personal-finance-tracker-v1.vercel.app

## Features

### Authentication & Security
- User registration and login with JWT authentication
- Access and refresh token system
- Password hashing with bcrypt
- Protected API routes

### Transaction Management
- Add, edit, and delete income/expense transactions
- Category-based organization
- Date tracking and notes
- Advanced filtering and search
- Pagination support

### Category Management
- Default categories (10 pre-configured)
- Custom category creation
- Icon and color customization
- Category-wise spending summaries

### Budget Management
- Set monthly budgets per category
- Real-time budget tracking
- Visual progress indicators
- Alert system (80% and 100% thresholds)
- Budget history tracking

### Analytics & Insights
- Income vs Expense line charts
- Category breakdown pie charts
- Daily spending trends
- Monthly and yearly views
- Interactive visualizations with Recharts

### Recurring Transactions
- Set up monthly recurring income/expenses
- Auto-generation on specified day of month
- Enable/disable functionality
- Manual generation trigger

### Reports & Export
- CSV export with transaction details
- PDF export with summary and charts
- Custom date range selection
- Filter by transaction type

### User Profile
- Update personal information
- Set preferred currency (8 currencies supported)
- Define monthly savings goals
- Account deletion option

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with TypeScript
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **State Management**: React Context API

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Export**: PDFKit, json2csv
- **CORS**: cors middleware

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- pnpm (or npm/yarn)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
cd /workspace
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - MONGODB_URI
# - JWT_ACCESS_SECRET
# - JWT_REFRESH_SECRET
# - PORT (default: 5000)
# - FRONTEND_URL (default: http://localhost:5173)
```

### 3. Frontend Setup

```bash
cd ../shadcn-ui

# Install dependencies
pnpm install
```

### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd shadcn-ui
pnpm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
/workspace
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Transaction.js        # Transaction schema
│   │   ├── Category.js           # Category schema
│   │   ├── Budget.js             # Budget schema
│   │   └── RecurringTransaction.js
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   ├── recurringController.js
│   │   ├── dashboardController.js
│   │   ├── analyticsController.js
│   │   └── reportController.js
│   ├── routes/
│   │   └── [all route files]
│   ├── utils/
│   │   └── generateToken.js      # JWT token utilities
│   ├── .env.example
│   ├── server.js                 # Express app entry
│   └── package.json
├── shadcn-ui/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/             # Login & Register
│   │   │   ├── Dashboard/        # Dashboard view
│   │   │   ├── Transactions/     # Transaction management
│   │   │   ├── Categories/       # Category management
│   │   │   ├── Budgets/          # Budget management
│   │   │   ├── Analytics/        # Charts & analytics
│   │   │   ├── Recurring/        # Recurring transactions
│   │   │   ├── Reports/          # Export functionality
│   │   │   ├── Profile/          # User profile
│   │   │   ├── Layout/           # Sidebar & Layout
│   │   │   └── Common/           # Shared components
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── services/
│   │   │   └── api.js            # API service layer
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # Entry point
│   └── package.json
└── README.md
```

## 🔑 API Endpoints

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
- `GET /api/transactions` - Get all transactions (paginated)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create/update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/history/:categoryId` - Get budget history

### Recurring Transactions
- `GET /api/recurring` - Get all recurring transactions
- `POST /api/recurring` - Create recurring transaction
- `PUT /api/recurring/:id` - Update recurring transaction
- `DELETE /api/recurring/:id` - Delete recurring transaction
- `POST /api/recurring/generate` - Generate transactions

### Dashboard
- `GET /api/dashboard` - Get dashboard summary

### Analytics
- `GET /api/analytics/income-expense` - Income vs expense data
- `GET /api/analytics/category-breakdown` - Category breakdown
- `GET /api/analytics/daily-trends` - Daily trends

### Reports
- `GET /api/reports/csv` - Export as CSV
- `GET /api/reports/pdf` - Export as PDF

## 🎨 Default Categories

### Income Categories
- 💰 Salary
- 💼 Freelance
- 📈 Investment

### Expense Categories
- 🍔 Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎮 Entertainment
- 📄 Bills & Utilities
- 🏥 Healthcare
- 📚 Education

## 💡 Usage Tips

1. **Getting Started**: Register an account to begin tracking your finances
2. **Add Transactions**: Use the Transactions page to record all income and expenses
3. **Set Budgets**: Define monthly budgets for expense categories to stay on track
4. **Monitor Analytics**: Check the Analytics page for visual insights into spending patterns
5. **Recurring Transactions**: Set up recurring items like salary or rent for automatic tracking
6. **Export Reports**: Generate CSV or PDF reports for record-keeping or tax purposes

## 🔒 Security Features

- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt
- Protected API routes with authentication middleware
- Token refresh mechanism for seamless user experience
- Secure password requirements (minimum 6 characters)

## 🌐 Supported Currencies

- USD - US Dollar
- EUR - Euro
- GBP - British Pound
- INR - Indian Rupee
- JPY - Japanese Yen
- CNY - Chinese Yuan
- AUD - Australian Dollar
- CAD - Canadian Dollar

## 📝 Environment Variables

### Backend (.env)
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

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### CORS Errors
- Verify FRONTEND_URL in backend .env
- Check that both frontend and backend are running

### JWT Token Errors
- Clear browser localStorage
- Re-login to get fresh tokens
- Verify JWT secrets are set in .env

## 🚀 Deployment

### Backend Deployment
1. Set environment variables on your hosting platform
2. Ensure MongoDB is accessible
3. Run `npm install` and `npm start`

### Frontend Deployment
1. Update API_URL in `src/services/api.js`
2. Run `pnpm run build`
3. Deploy the `dist` folder to your hosting service

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on the repository.

---


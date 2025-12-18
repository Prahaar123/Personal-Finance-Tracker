# Advanced Personal Finance Tracker - Development Plan

## Tech Stack
- **Frontend**: React.js, Chart.js, Axios, JWT handling
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt
- **Architecture**: REST API, MVC pattern

## Project Structure
```
/workspace
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── Budget.js
│   │   └── RecurringTransaction.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── transactionController.js
│   │   ├── categoryController.js
│   │   ├── budgetController.js
│   │   ├── recurringController.js
│   │   ├── dashboardController.js
│   │   ├── analyticsController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── transactions.js
│   │   ├── categories.js
│   │   ├── budgets.js
│   │   ├── recurring.js
│   │   ├── dashboard.js
│   │   ├── analytics.js
│   │   └── reports.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── pdfGenerator.js
│   │   └── csvGenerator.js
│   ├── .env.example
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── RecentTransactions.jsx
│   │   │   ├── Transactions/
│   │   │   │   ├── TransactionList.jsx
│   │   │   │   ├── TransactionForm.jsx
│   │   │   │   └── TransactionFilters.jsx
│   │   │   ├── Categories/
│   │   │   │   ├── CategoryList.jsx
│   │   │   │   └── CategoryForm.jsx
│   │   │   ├── Budgets/
│   │   │   │   ├── BudgetList.jsx
│   │   │   │   ├── BudgetForm.jsx
│   │   │   │   └── BudgetAlert.jsx
│   │   │   ├── Analytics/
│   │   │   │   ├── Analytics.jsx
│   │   │   │   ├── IncomeExpenseChart.jsx
│   │   │   │   ├── CategoryChart.jsx
│   │   │   │   └── TrendChart.jsx
│   │   │   ├── Recurring/
│   │   │   │   ├── RecurringList.jsx
│   │   │   │   └── RecurringForm.jsx
│   │   │   ├── Reports/
│   │   │   │   └── Reports.jsx
│   │   │   ├── Profile/
│   │   │   │   └── Profile.jsx
│   │   │   ├── Layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Layout.jsx
│   │   │   └── Common/
│   │   │       ├── ProtectedRoute.jsx
│   │   │       ├── Loading.jsx
│   │   │       └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
└── README.md
```

## Development Tasks

### 1. Project Setup ✓
- Initialize backend with Express, MongoDB, JWT dependencies
- Initialize frontend with React, Chart.js, Axios
- Configure folder structure

### 2. Database Models
- User model (email, password, currency, financialGoals)
- Transaction model (user, amount, type, category, date, notes)
- Category model (user, name, type, icon, color, isDefault)
- Budget model (user, category, amount, month, year)
- RecurringTransaction model (user, amount, type, category, frequency, enabled)

### 3. Backend Authentication
- User registration with password hashing
- Login with JWT access & refresh tokens
- Token refresh endpoint
- Auth middleware for protected routes
- Logout functionality

### 4. Backend API Routes
- Auth routes (register, login, refresh, logout)
- User routes (profile, update, delete)
- Transaction routes (CRUD, list with pagination)
- Category routes (CRUD, list)
- Budget routes (CRUD, alerts)
- Recurring routes (CRUD, auto-generate)
- Dashboard routes (summary stats)
- Analytics routes (charts data)
- Report routes (CSV, PDF export)

### 5. Frontend Authentication
- Login page with form validation
- Register page with form validation
- Auth context for global state
- JWT token storage and refresh
- Protected route component
- Logout functionality

### 6. Frontend Dashboard
- Dashboard layout with sidebar
- Stat cards (income, expenses, balance, savings)
- Budget utilization display
- Recent transactions list
- Responsive design

### 7. Transaction Management
- Transaction list with pagination
- Add transaction form
- Edit transaction modal
- Delete confirmation
- Category selection dropdown
- Date picker integration
- Form validation

### 8. Category Management
- Category list display
- Add custom category form
- Edit category
- Delete category (with validation)
- Icon and color picker
- Default categories seeding

### 9. Budget Management
- Budget list by category
- Set monthly budget form
- Budget progress bars
- Threshold alerts (80%, 100%)
- Budget history view

### 10. Analytics & Charts
- Income vs Expense line chart
- Category breakdown pie chart
- Daily spending bar chart
- Monthly/Yearly view toggle
- Chart.js implementation

### 11. Recurring Transactions
- Recurring transaction list
- Add recurring transaction form
- Enable/disable toggle
- Auto-generation cron logic
- Edit and delete functionality

### 12. Reports & Export
- Date range selector
- CSV export functionality
- PDF export with charts
- Report preview
- Download functionality

### 13. Search & Filters
- Date range filter
- Category filter dropdown
- Income/Expense type filter
- Sort by date/amount
- Search by notes

### 14. Testing & Integration
- API endpoint testing
- Frontend-backend integration
- Error handling
- Loading states
- Toast notifications
- Responsive design testing
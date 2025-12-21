require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const transactionRoutes = require("./routes/transactions");
const categoryRoutes = require("./routes/categories");
const budgetRoutes = require("./routes/budgets");
const recurringRoutes = require("./routes/recurring");
const dashboardRoutes = require("./routes/dashboard");
const analyticsRoutes = require("./routes/analytics");
const reportRoutes = require("./routes/reports");

connectDB();

const app = express();

/* =======================
   ✅ CORRECT CORS SETUP
   ======================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://personal-finance-tracker-v1.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow Postman / server-to-server
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// IMPORTANT: handle preflight
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   ROUTES
   ======================= */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Finance Tracker API is running" });
});

// Error handler (LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

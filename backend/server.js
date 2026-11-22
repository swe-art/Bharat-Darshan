
require("dotenv").config();
console.log("Environment Variables Loaded:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routers/authRoutes");
const bookingRoutes = require("./routers/Bookingroutes");
const contactRoutes = require("./routers/contactRoute");
const reviewRoutes = require("./routers/reviewRoutes");
const adminRoutes = require("./routers/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authentication routes
app.use("/api/auth", authRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.get("/", (req, res) => {
    res.send("Travel Website Backend is Running!");
});

const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on port 5000");
        });

    } catch (error) {
        console.log("Server Error:", error.message);
    }
};

startServer();

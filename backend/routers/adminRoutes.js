
const express = require("express");
const router = express.Router();

const User = require("../models/user");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");
const Review = require("../models/Review");

const {
    verifyToken,
    adminOnly
} = require("../middleware/authMiddleware");

// Protect all admin routes
router.use(verifyToken, adminOnly);

// 1. Dashboard statistics
router.get("/stats", async (req, res) => {
    try {
        const [
            totalUsers,
            totalBookings,
            pendingBookings,
            totalContacts,
            totalReviews
        ] = await Promise.all([
            User.countDocuments(),
            Booking.countDocuments(),
            Booking.countDocuments({ status: "Pending" }),
            Contact.countDocuments(),
            Review.countDocuments()
        ]);

        res.json({
            totalUsers,
            totalBookings,
            pendingBookings,
            totalContacts,
            totalReviews
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard statistics"
        });
    }
});

// 2. Get all users
router.get("/users", async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json(users);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users"
        });
    }
});

// 3. Get all bookings
router.get("/bookings", async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 });

        res.json(bookings);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch bookings"
        });
    }
});

// 4. Update booking status
router.patch("/bookings/:id", async (req, res) => {
    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Pending",
            "Confirmed",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid booking status"
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json({
            message: "Booking status updated",
            booking
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update booking"
        });
    }
});

// 5. Get all contact enquiries
router.get("/contacts", async (req, res) => {
    try {
        const contacts = await Contact.find()
            .sort({ createdAt: -1 });

        res.json(contacts);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch contacts"
        });
    }
});

// 6. Get all reviews
router.get("/reviews", async (req, res) => {
    try {
        const reviews = await Review.find()
            .sort({ createdAt: -1 });

        res.json(reviews);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
});

module.exports = router;

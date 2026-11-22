
const express = require("express");
const router = express.Router();

const Booking = require("../models/Booking");

// CREATE BOOKING API
router.post("/", async (req, res) => {
    try {
        const {
            fullName,
            email,
            destination,
            travelDate,
            travelers,
            packageType,
            specialRequests
        } = req.body;

        // Check required fields
        if (
            !fullName ||
            !email ||
            !destination ||
            !travelDate ||
            !travelers
        ) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Validate number of travelers
        if (Number(travelers) < 1) {
            return res.status(400).json({
                message: "At least one traveler is required"
            });
        }

        // Validate travel date
        const date = new Date(travelDate);

        if (isNaN(date.getTime()) || date <= new Date()) {
            return res.status(400).json({
                message: "Please select a valid future travel date"
            });
        }

        // Save booking in MongoDB
        const booking = await Booking.create({
            fullName,
            email,
            destination,
            travelDate: date,
            travelers,
            packageType,
            specialRequests
        });

        res.status(201).json({
            message: "Booking submitted successfully!",
            booking
        });

    } catch (error) {
        console.error("Booking Error:", error);

        res.status(500).json({
            message: "Booking failed",
            error: error.message
        });
    }
});

module.exports = router;

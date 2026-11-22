
const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// POST: Submit a review
router.post("/", async (req, res) => {
    try {
        const { name, country, rating, comment } = req.body;

        if (!name || !rating || !comment) {
            return res.status(400).json({
                message: "Name, rating and comment are required"
            });
        }

        const numericRating = Number(rating);

        if (!Number.isInteger(numericRating) ||
            numericRating < 1 ||
            numericRating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        const review = await Review.create({
            name,
            country,
            rating: numericRating,
            comment
        });

        res.status(201).json({
            message: "Review submitted successfully!",
            review
        });

    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({
            message: "Failed to submit review"
        });
    }
});

// GET: Fetch all reviews
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });

        res.status(200).json(reviews);

    } catch (error) {
        console.error("Fetch Reviews Error:", error);
        res.status(500).json({
            message: "Failed to fetch reviews"
        });
    }
});

module.exports = router;

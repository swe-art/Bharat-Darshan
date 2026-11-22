
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },

    destination: {
        type: String,
        required: true
    },

    travelDate: {
        type: Date,
        required: true
    },

    travelers: {
        type: Number,
        required: true,
        min: 1
    },

    packageType: {
        type: String,
        enum: ["Standard", "Luxury", "Customized"],
        default: "Standard"
    },

    specialRequests: {
        type: String,
        default: ""
    },

    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Cancelled"],
        default: "Pending"
    }

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

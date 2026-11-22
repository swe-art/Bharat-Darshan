
const API_URL = "http://localhost:5000/api";

// ------------------------------------
// ADMIN LOGIN
// ------------------------------------

const adminLoginForm = document.getElementById("adminLoginForm");

if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const loginMessage = document.getElementById("loginMessage");
        const loginButton = document.getElementById("loginButton");

        try {
            loginButton.disabled = true;
            loginButton.textContent = "Logging in...";
            loginMessage.textContent = "";

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Adjust these fields if your login API returns a different structure.
            const user = data.user || data.data?.user;
            const token = data.token || data.data?.token;

            if (!user || user.role !== "admin") {
                throw new Error("Access denied. Admin account required.");
            }

            if (!token) {
                throw new Error("Authentication token not received.");
            }

            localStorage.setItem("adminToken", token);
            localStorage.setItem("adminUser", JSON.stringify(user));

            window.location.href = "dashboard.html";

        } catch (error) {
            loginMessage.textContent = error.message;
            loginMessage.style.color = "red";
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Login";
        }
    });
}

// ------------------------------------
// DASHBOARD AUTHENTICATION
// ------------------------------------

const bookingsContainer = document.getElementById("bookingsContainer");

if (bookingsContainer) {
    const token = localStorage.getItem("adminToken");

    if (!token) {
        window.location.href = "admin-login.html";
    } else {
        loadDashboard();
    }
}

// ------------------------------------
// API REQUEST HELPER
// ------------------------------------

async function adminFetch(endpoint, options = {}) {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(`${API_URL}/admin${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "admin-login.html";
        throw new Error("Your admin session is invalid. Please log in again.");
    }

    if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
    }

    return data;
}

// ------------------------------------
// LOAD ALL DASHBOARD DATA
// ------------------------------------

async function loadDashboard() {
    try {
        await Promise.all([
            loadStats(),
            loadBookings(),
            loadUsers(),
            loadContacts(),
            loadReviews()
        ]);
    } catch (error) {
        console.error("Dashboard loading error:", error);
    }
}

// ------------------------------------
// LOAD STATISTICS
// ------------------------------------

async function loadStats() {
    const stats = await adminFetch("/stats");

    document.getElementById("totalUsers").textContent = stats.totalUsers;
    document.getElementById("totalBookings").textContent = stats.totalBookings;
    document.getElementById("pendingBookings").textContent = stats.pendingBookings;
    document.getElementById("totalContacts").textContent = stats.totalContacts;
    document.getElementById("totalReviews").textContent = stats.totalReviews;
}

// ------------------------------------
// HELPER TO CREATE TABLES SAFELY
// ------------------------------------

function displayTable(containerId, columns, rows) {
    const container = document.getElementById(containerId);
    container.replaceChildren();

    if (!rows.length) {
        container.textContent = "No records found.";
        return;
    }

    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";

    const header = document.createElement("tr");

    columns.forEach(column => {
        const th = document.createElement("th");
        th.textContent = column.label;
        th.style.padding = "12px";
        th.style.textAlign = "left";
        th.style.backgroundColor = "#4B0000";
        th.style.color = "white";
        header.appendChild(th);
    });

    table.appendChild(header);

    rows.forEach(row => {
        const tr = document.createElement("tr");

        columns.forEach(column => {
            const td = document.createElement("td");
            td.style.padding = "12px";
            td.style.borderBottom = "1px solid #ddd";

            if (column.render) {
                column.render(td, row);
            } else {
                td.textContent = row[column.key] ?? "—";
            }

            tr.appendChild(td);
        });

        table.appendChild(tr);
    });

    container.appendChild(table);
}

// ------------------------------------
// LOAD BOOKINGS
// ------------------------------------

async function loadBookings() {
    const bookings = await adminFetch("/bookings");

    displayTable("bookingsContainer", [
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Destination", key: "destination" },
        {
            label: "Travel Date",
            render: (td, booking) => {
                td.textContent = booking.travelDate
                    ? new Date(booking.travelDate).toLocaleDateString()
                    : "—";
            }
        },
        { label: "Travelers", key: "travelers" },
        {
            label: "Status",
            render: (td, booking) => {
                const select = document.createElement("select");

                ["Pending", "Confirmed", "Cancelled"].forEach(status => {
                    const option = document.createElement("option");
                    option.value = status;
                    option.textContent = status;
                    select.appendChild(option);
                });

                select.value = booking.status || "Pending";

                select.addEventListener("change", async () => {
                    try {
                        await adminFetch(`/bookings/${booking._id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ status: select.value })
                        });

                        alert("Booking status updated!");
                    } catch (error) {
                        alert(error.message);
                        select.value = booking.status || "Pending";
                    }
                });

                td.appendChild(select);
            }
        }
    ], bookings);
}

// ------------------------------------
// LOAD USERS
// ------------------------------------

async function loadUsers() {
    const users = await adminFetch("/users");

    displayTable("usersContainer", [
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Role", key: "role" },
        {
            label: "Joined Date",
            render: (td, user) => {
                td.textContent = user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "—";
            }
        }
    ], users);
}

// ------------------------------------
// LOAD CONTACT MESSAGES
// ------------------------------------

async function loadContacts() {
    const contacts = await adminFetch("/contacts");

    displayTable("contactsContainer", [
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Message", key: "message" },
        { label: "Status", key: "status" }
    ], contacts);
}

// ------------------------------------
// LOAD REVIEWS
// ------------------------------------

async function loadReviews() {
    const reviews = await adminFetch("/reviews");

    displayTable("reviewsContainer", [
        { label: "Name", key: "name" },
        { label: "Country", key: "country" },
        { label: "Rating", key: "rating" },
        { label: "Comment", key: "comment" }
    ], reviews);
}

// ------------------------------------
// LOGOUT
// ------------------------------------

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        window.location.href = "admin-login.html";
    });
}

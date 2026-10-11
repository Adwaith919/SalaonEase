const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            success: true,
            message: "SalonEase database connected successfully!",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});


// ===============================
// REGISTER CUSTOMER
// ===============================
app.post("/api/register", async (req, res) => {

    try {
        const { name, email, phone, password } = req.body;

        // Check required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all fields."
            });
        }

        // Check whether email already exists
        const existingCustomer = await pool.query(
            "SELECT Customer_ID FROM CUSTOMER WHERE Email = $1",
            [email]
        );

        if (existingCustomer.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert customer
        const result = await pool.query(
            `INSERT INTO CUSTOMER
            (Name, Email, Phone, Password)
            VALUES ($1, $2, $3, $4)
            RETURNING Customer_ID, Name, Email, Phone`,
            [name, email, phone, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: "Registration successful!",
            customer: result.rows[0]
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Registration failed.",
            error: error.message
        });
    }
});

// ===============================
// CHECK CUSTOMER DATA
// ===============================
app.get("/api/check-customers", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT Customer_ID, Name, Email, Phone
            FROM CUSTOMER
            ORDER BY Customer_ID DESC
            LIMIT 10
        `);

        res.json({
            success: true,
            customers: result.rows
        });

    } catch (error) {
        console.error("Customer query error:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===============================
// ADMIN - GET ALL CUSTOMERS
// ===============================

app.get("/api/admin/customers", async (req, res) => {
    try {

        const result = await pool.query(`
            SELECT
                Customer_ID,
                Name,
                Email,
                Phone,
                Created_At
            FROM CUSTOMER
            ORDER BY Customer_ID ASC
        `);

        res.json({
            success: true,
            customers: result.rows
        });

    } catch (error) {

        console.error("Admin customers error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load customers.",
            error: error.message
        });
    }
});

// GET ALL EMPLOYEES FOR ADMIN
app.get("/api/admin/employees", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                Employee_ID,
                Name,
                Phone,
                Specialization,
                Status
            FROM EMPLOYEE
            ORDER BY Employee_ID ASC
        `);

        res.json({
            success: true,
            employees: result.rows
        });

    } catch (error) {

        console.error(
            "Admin employees error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load employees.",
            error: error.message
        });
    }
});

// UPDATE EMPLOYEE
app.put("/api/admin/employees/:id", async (req, res) => {

    const employeeId = req.params.id;
    const { name, phone, specialization, status } = req.body;

    if (!name || !phone || !specialization) {
        return res.status(400).json({
            success: false,
            message: "Name, phone and specialization are required."
        });
    }

    try {

        const result = await pool.query(
            `
            UPDATE EMPLOYEE
            SET
                Name = $1,
                Phone = $2,
                Specialization = $3,
                Status = $4
            WHERE Employee_ID = $5
            RETURNING
                Employee_ID,
                Name,
                Phone,
                Specialization,
                Status
            `,
            [
                name,
                phone,
                specialization,
                status || "Active",
                employeeId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.json({
            success: true,
            message: "Employee updated successfully.",
            employee: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Update employee error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to update employee.",
            error: error.message
        });
    }
});

// ===============================
// LOGIN CUSTOMER
// ===============================
app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email and password."
            });
        }

        // Find customer by email
        const result = await pool.query(
            `SELECT Customer_ID, Name, Email, Phone, Password
             FROM CUSTOMER
             WHERE Email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const customer = result.rows[0];

        // Compare entered password with hashed password
        const passwordMatch = await bcrypt.compare(
            password,
            customer.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        // Login successful
        res.json({
            success: true,
            message: "Login successful!",
            customer: {
                id: customer.customer_id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Login failed.",
            error: error.message
        });
    }
});
// ===============================
// GET ALL SERVICES
// ===============================
app.get("/api/services", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                Service_ID,
                Service_Name,
                Description,
                Price,
                Duration,
                Status
            FROM SERVICE
            WHERE Status = 'Active'
            ORDER BY Service_ID
        `);

        res.json({
            success: true,
            services: result.rows
        });

    } catch (error) {

        console.error("Services query error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load services.",
            error: error.message
        });

    }
});
// CREATE APPOINTMENT
app.post("/api/appointments", async (req, res) => {
    try {

        const {
            customerId,
            employeeId,
            serviceId,
            appointmentDate,
            appointmentTime,
            notes
        } = req.body;

        // Check required fields
        if (
            !customerId ||
            !employeeId ||
            !serviceId ||
            !appointmentDate ||
            !appointmentTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required appointment details."
            });
        }

        // Get service price from database
        const serviceResult = await pool.query(
            `SELECT Price
             FROM SERVICE
             WHERE Service_ID = $1
             AND Status = 'Active'`,
            [serviceId]
        );

        if (serviceResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Selected service was not found."
            });
        }

        const amount = serviceResult.rows[0].price;

        // Insert appointment
        const result = await pool.query(
            `INSERT INTO APPOINTMENT
            (
                Customer_ID,
                Employee_ID,
                Service_ID,
                Appointment_Date,
                Appointment_Time,
                Status,
                Amount,
                Notes
            )
            VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7)
            RETURNING
                Appointment_ID,
                Customer_ID,
                Employee_ID,
                Service_ID,
                Appointment_Date,
                Appointment_Time,
                Status,
                Amount,
                Notes`,
            [
                customerId,
                employeeId,
                serviceId,
                appointmentDate,
                appointmentTime,
                amount,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            appointment: result.rows[0]
        });

    } catch (error) {

        console.error("Appointment creation error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create appointment.",
            error: error.message
        });
    }
});
// GET CUSTOMER APPOINTMENTS

// GET APPOINTMENTS FOR A CUSTOMER
app.get("/api/appointments/customer/:customerId", async (req, res) => {
    try {
        const customerId = Number(req.params.customerId);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID."
            });
        }

        const result = await pool.query(
            `SELECT
                a.Appointment_ID,
                a.Appointment_Date,
                a.Appointment_Time,
                a.Status,
                a.Amount,
                a.Notes,
                s.Service_ID,
                s.Service_Name,
                s.Duration,
                e.Employee_ID,
                e.Name AS Employee_Name,
                e.Specialization
             FROM APPOINTMENT a
             INNER JOIN SERVICE s
                ON a.Service_ID = s.Service_ID
             INNER JOIN EMPLOYEE e
                ON a.Employee_ID = e.Employee_ID
             WHERE a.Customer_ID = $1
             ORDER BY
                a.Appointment_Date DESC,
                a.Appointment_Time DESC`,
            [customerId]
        );

        res.json({
            success: true,
            appointments: result.rows
        });

    } catch (error) {
        console.error("Customer appointments error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load appointments.",
            error: error.message
        });
    }
});


/* ================= CUSTOMER DASHBOARD STATISTICS ================= */

app.get("/api/appointments/customer/:customerId/stats", async (req, res) => {
    try {
        const customerId = Number(req.params.customerId);

        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid customer ID."
            });
        }

        const result = await pool.query(
            `SELECT
                COUNT(*) FILTER (
                    WHERE (a.Appointment_Date::date + a.Appointment_Time) > NOW()
                    AND LOWER(a.Status) NOT IN ('cancelled', 'completed')
                ) AS upcoming_count,

                COUNT(*) FILTER (
                    WHERE LOWER(a.Status) = 'completed'
                ) AS completed_count,

                COALESCE(
                    SUM(
                        CASE
                            WHEN LOWER(a.Status) = 'completed'
                            THEN COALESCE(a.Amount, 0)
                            ELSE 0
                        END
                    ),
                    0
                ) AS total_spent

            FROM APPOINTMENT a
            WHERE a.Customer_ID = $1`,
            [customerId]
        );

        res.json({
            success: true,
            statistics: result.rows[0]
        });

    } catch (error) {
        console.error("Customer dashboard statistics error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to load dashboard statistics."
        });
    }
});

// ===============================
// START SERVER
// ===============================
const PORT = 3000;
// ================= CREATE PAYMENT =================

app.post("/api/payments", async (req, res) => {

    try {

        const {
            appointmentId,
            amount,
            paymentMethod
        } = req.body;


        // Validate required fields

        if (!appointmentId || !paymentMethod) {

            return res.status(400).json({
                success: false,
                message: "Please provide all payment details."
            });

        }


        // Check whether appointment exists

        const appointmentResult = await pool.query(
            `SELECT Appointment_ID, Amount
             FROM APPOINTMENT
             WHERE Appointment_ID = $1`,
            [appointmentId]
        );


        if (appointmentResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });

        }


        // Check whether payment already exists

        const existingPayment = await pool.query(
            `SELECT Payment_ID
             FROM PAYMENT
             WHERE Appointment_ID = $1`,
            [appointmentId]
        );


        if (existingPayment.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Payment already exists for this appointment."
            });

        }


        // Generate transaction ID

        const transactionId =
            "TXN" + Date.now();


        // Insert payment

        const result = await pool.query(
            `INSERT INTO PAYMENT
            (
                Appointment_ID,
                Amount,
                Payment_Method,
                Payment_Status,
                Transaction_ID
            )
            VALUES ($1, $2, $3, 'Paid', $4)
            RETURNING
                Payment_ID,
                Appointment_ID,
                Amount,
                Payment_Method,
                Payment_Date,
                Payment_Status,
                Transaction_ID`,
            [
                appointmentId,
                appointmentResult.rows[0].amount,
                paymentMethod,
                transactionId
            ]
        );


        // Update appointment status

        await pool.query(
            `UPDATE APPOINTMENT
             SET Status = 'Confirmed'
             WHERE Appointment_ID = $1`,
            [appointmentId]
        );


        res.status(201).json({

            success: true,

            message: "Payment successful!",

            payment: result.rows[0]

        });


    } catch (error) {

        console.error("Payment creation error:", error);

        res.status(500).json({

            success: false,

            message: "Failed to process payment.",

            error: error.message

        });

    }

});
// ================= GET APPOINTMENT FOR PAYMENT =================

app.get("/api/appointments/:appointmentId", async (req, res) => {

    try {

        const appointmentId = req.params.appointmentId;

        const result = await pool.query(
            `SELECT
                a.Appointment_ID,
                a.Appointment_Date,
                a.Appointment_Time,
                a.Status,
                a.Amount,

                s.Service_ID,
                s.Service_Name,
                s.Duration,

                e.Employee_ID,
                e.Name AS Employee_Name,
                e.Specialization

             FROM APPOINTMENT a

             INNER JOIN SERVICE s
                ON a.Service_ID = s.Service_ID

             INNER JOIN EMPLOYEE e
                ON a.Employee_ID = e.Employee_ID

             WHERE a.Appointment_ID = $1`,
            [appointmentId]
        );


        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });

        }


        res.json({
            success: true,
            appointment: result.rows[0]
        });


    } catch (error) {

        console.error(
            "Appointment details error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load appointment.",
            error: error.message
        });

    }

});

// ================= CREATE FEEDBACK =================

app.post("/api/feedback", async (req, res) => {

    try {

        const {
            appointmentId,
            rating,
            comments
        } = req.body;


        // Validate required fields

        if (!appointmentId || !rating || !comments) {

            return res.status(400).json({
                success: false,
                message: "Please provide appointment, rating and feedback."
            });

        }


        // Check appointment exists

        const appointmentResult = await pool.query(
            `SELECT Appointment_ID
             FROM APPOINTMENT
             WHERE Appointment_ID = $1`,
            [appointmentId]
        );


        if (appointmentResult.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });

        }


        // Check whether feedback already exists

        const existingFeedback = await pool.query(
            `SELECT Feedback_ID
             FROM FEEDBACK
             WHERE Appointment_ID = $1`,
            [appointmentId]
        );


        if (existingFeedback.rows.length > 0) {

            return res.status(400).json({
                success: false,
                message: "Feedback has already been submitted for this appointment."
            });

        }


        // Insert feedback

        const result = await pool.query(
            `INSERT INTO FEEDBACK
            (
                Appointment_ID,
                Rating,
                Comments
            )
            VALUES ($1, $2, $3)
            RETURNING
                Feedback_ID,
                Appointment_ID,
                Rating,
                Comments,
                Feedback_Date`,
            [
                appointmentId,
                rating,
                comments
            ]
        );


        res.status(201).json({

            success: true,

            message: "Feedback submitted successfully!",

            feedback: result.rows[0]

        });


    } catch (error) {

        console.error(
            "Feedback creation error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to submit feedback.",

            error: error.message

        });

    }

});
// ================= ADMIN DASHBOARD =================

app.get("/api/admin/dashboard", async (req, res) => {

    try {

        // ================= TOTAL CUSTOMERS =================

        const customersResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM CUSTOMER`
        );


        // ================= TOTAL EMPLOYEES =================

        const employeesResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM EMPLOYEE
             WHERE Status = 'Active'`
        );


        // ================= TOTAL SERVICES =================

        const servicesResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM SERVICE
             WHERE Status = 'Active'`
        );


        // ================= TODAY'S APPOINTMENTS =================

        const todayResult = await pool.query(
            `SELECT COUNT(*) AS total
             FROM APPOINTMENT
             WHERE Appointment_Date = CURRENT_DATE
             AND Status <> 'Cancelled'`
        );


        // ================= RECENT APPOINTMENTS =================

        const appointmentsResult = await pool.query(
            `SELECT
                a.Appointment_ID,
                a.Appointment_Date,
                a.Appointment_Time,
                a.Status,
                a.Amount,

                c.Name AS Customer_Name,

                s.Service_Name,

                e.Name AS Employee_Name

             FROM APPOINTMENT a

             INNER JOIN CUSTOMER c
                ON a.Customer_ID = c.Customer_ID

             INNER JOIN SERVICE s
                ON a.Service_ID = s.Service_ID

             INNER JOIN EMPLOYEE e
                ON a.Employee_ID = e.Employee_ID

             ORDER BY
                a.Appointment_Date DESC,
                a.Appointment_Time DESC

             LIMIT 5`
        );


        // ================= THIS MONTH'S REVENUE =================

        const revenueResult = await pool.query(
            `SELECT
                COALESCE(SUM(Amount), 0) AS revenue

             FROM PAYMENT

             WHERE Payment_Status = 'Paid'

             AND EXTRACT(
                 MONTH FROM Payment_Date
             ) = EXTRACT(
                 MONTH FROM CURRENT_DATE
             )

             AND EXTRACT(
                 YEAR FROM Payment_Date
             ) = EXTRACT(
                 YEAR FROM CURRENT_DATE
             )`
        );


        // ================= SEND RESPONSE =================

        res.json({

            success: true,

            statistics: {

                customers:
                    Number(
                        customersResult.rows[0].total
                    ),

                employees:
                    Number(
                        employeesResult.rows[0].total
                    ),

                services:
                    Number(
                        servicesResult.rows[0].total
                    ),

                todayAppointments:
                    Number(
                        todayResult.rows[0].total
                    ),

                revenue:
                    Number(
                        revenueResult.rows[0].revenue
                    )

            },

            recentAppointments:
                appointmentsResult.rows

        });


    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to load admin dashboard.",

            error:
                error.message

        });

    }

});

// DELETE CUSTOMER
app.delete("/api/admin/customers/:id", async (req, res) => {
    const customerId = req.params.id;

    try {
        const result = await pool.query(
            `
            DELETE FROM CUSTOMER
            WHERE Customer_ID = $1
            RETURNING Customer_ID, Name
            `,
            [customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer deleted successfully.",
            customer: result.rows[0]
        });

    } catch (error) {
        console.error("Delete customer error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to delete customer.",
            error: error.message
        });
    }
});

// UPDATE CUSTOMER
app.put("/api/admin/customers/:id", async (req, res) => {

    const customerId = req.params.id;
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
        return res.status(400).json({
            success: false,
            message: "Name, email and phone are required."
        });
    }

    try {

        const result = await pool.query(
            `
            UPDATE CUSTOMER
            SET
                Name = $1,
                Email = $2,
                Phone = $3
            WHERE Customer_ID = $4
            RETURNING Customer_ID, Name, Email, Phone, Created_At
            `,
            [name, email, phone, customerId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Customer not found."
            });
        }

        res.json({
            success: true,
            message: "Customer updated successfully.",
            customer: result.rows[0]
        });

    } catch (error) {

        console.error("Update customer error:", error);

        // Duplicate email
        if (error.code === "23505") {
            return res.status(400).json({
                success: false,
                message: "This email address is already registered."
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to update customer.",
            error: error.message
        });
    }
});

// DELETE EMPLOYEE
app.delete("/api/admin/employees/:id", async (req, res) => {

    const employeeId = req.params.id;

    try {

        const result = await pool.query(
            `
            DELETE FROM EMPLOYEE
            WHERE Employee_ID = $1
            RETURNING Employee_ID, Name
            `,
            [employeeId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found."
            });
        }

        res.json({
            success: true,
            message: "Employee deleted successfully.",
            employee: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Delete employee error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete employee.",
            error: error.message
        });
    }
});

// ADD NEW EMPLOYEE
app.post("/api/admin/employees", async (req, res) => {

    const {
        name,
        phone,
        specialization,
        status
    } = req.body;

    if (!name || !phone || !specialization) {
        return res.status(400).json({
            success: false,
            message: "Name, phone and specialization are required."
        });
    }

    try {

        const result = await pool.query(
            `
            INSERT INTO EMPLOYEE
                (Name, Phone, Specialization, Status)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                Employee_ID,
                Name,
                Phone,
                Specialization,
                Status
            `,
            [
                name.trim(),
                phone.trim(),
                specialization.trim(),
                status || "Active"
            ]
        );

        res.status(201).json({
            success: true,
            message: "Employee added successfully.",
            employee: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Add employee error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to add employee.",
            error: error.message
        });
    }
});

// GET ALL SERVICES FOR ADMIN
app.get("/api/admin/services", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                Service_ID,
                Service_Name,
                Description,
                Price,
                Duration,
                Status
            FROM SERVICE
            ORDER BY Service_ID ASC
        `);

        res.json({
            success: true,
            services: result.rows
        });

    } catch (error) {

        console.error(
            "Admin services error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load services.",
            error: error.message
        });
    }
});

// UPDATE SERVICE
app.put("/api/admin/services/:id", async (req, res) => {

    const serviceId = req.params.id;

    const {
        service_name,
        description,
        price,
        duration,
        status
    } = req.body;

    if (
        !service_name ||
        price === undefined ||
        !duration
    ) {
        return res.status(400).json({
            success: false,
            message: "Service name, price and duration are required."
        });
    }

    try {

        const result = await pool.query(`
            UPDATE SERVICE
            SET
                Service_Name = $1,
                Description = $2,
                Price = $3,
                Duration = $4,
                Status = $5
            WHERE Service_ID = $6
            RETURNING
                Service_ID,
                Service_Name,
                Description,
                Price,
                Duration,
                Status
        `, [
            service_name.trim(),
            description ? description.trim() : null,
            price,
            duration,
            status || "Active",
            serviceId
        ]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Service not found."
            });

        }

        res.json({
            success: true,
            message: "Service updated successfully.",
            service: result.rows[0]
        });

    } catch (error) {

        console.error("Update service error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update service.",
            error: error.message
        });

    }

});

// DELETE SERVICE
app.delete("/api/admin/services/:id", async (req, res) => {

    const serviceId = req.params.id;

    try {

        const result = await pool.query(`
            DELETE FROM SERVICE
            WHERE Service_ID = $1
            RETURNING Service_ID, Service_Name
        `, [serviceId]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Service not found."
            });

        }

        res.json({
            success: true,
            message: "Service deleted successfully.",
            service: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Delete service error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to delete service.",
            error: error.message
        });

    }

});

// ADD SERVICE
app.post("/api/admin/services", async (req, res) => {

    const {
        service_name,
        description,
        price,
        duration,
        status
    } = req.body;

    if (
        !service_name ||
        price === undefined ||
        !duration
    ) {
        return res.status(400).json({
            success: false,
            message: "Service name, price and duration are required."
        });
    }

    try {

        const result = await pool.query(`
            INSERT INTO SERVICE
            (
                Service_Name,
                Description,
                Price,
                Duration,
                Status
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                Service_ID,
                Service_Name,
                Description,
                Price,
                Duration,
                Status
        `, [
            service_name.trim(),
            description ? description.trim() : null,
            price,
            duration,
            status || "Active"
        ]);

        res.status(201).json({
            success: true,
            message: "Service added successfully.",
            service: result.rows[0]
        });

    } catch (error) {

        console.error(
            "Add service error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to add service.",
            error: error.message
        });

    }

});

// GET ALL APPOINTMENTS FOR ADMIN
app.get("/api/admin/appointments", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT
                a.Appointment_ID,
                a.Customer_ID,
                a.Employee_ID,
                a.Service_ID,
                a.Appointment_Date,
                a.Appointment_Time,
                a.Status,
                a.Amount,
                a.Notes,

                c.Name AS Customer_Name,
                c.Email AS Customer_Email,

                e.Name AS Employee_Name,

                s.Service_Name

            FROM APPOINTMENT a

            JOIN CUSTOMER c
                ON a.Customer_ID = c.Customer_ID

            JOIN EMPLOYEE e
                ON a.Employee_ID = e.Employee_ID

            JOIN SERVICE s
                ON a.Service_ID = s.Service_ID

            ORDER BY
                a.Appointment_ID ASC
        `);

        res.json({
            success: true,
            appointments: result.rows
        });

    } catch (error) {

        console.error(
            "Admin appointments error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Unable to load appointments.",
            error: error.message
        });

    }

});

// UPDATE APPOINTMENT FOR ADMIN
app.put("/api/admin/appointments/:id", async (req, res) => {
    const appointmentId = req.params.id;

    const {
        customer_id,
        employee_id,
        service_id,
        appointment_date,
        appointment_time,
        status,
        amount,
        notes
    } = req.body;

    if (
        !customer_id ||
        !employee_id ||
        !service_id ||
        !appointment_date ||
        !appointment_time ||
        !status ||
        amount === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "All appointment fields are required."
        });
    }

    const validStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment status."
        });
    }

    if (Number(amount) < 0 || isNaN(Number(amount))) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a valid non-negative number."
        });
    }

    try {
        // Check customer
        const customerCheck = await pool.query(
            `SELECT Customer_ID
             FROM CUSTOMER
             WHERE Customer_ID = $1`,
            [customer_id]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Customer not found."
            });
        }

        // Check employee
        const employeeCheck = await pool.query(
            `SELECT Employee_ID
             FROM EMPLOYEE
             WHERE Employee_ID = $1`,
            [employee_id]
        );

        if (employeeCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Employee not found."
            });
        }

        // Check service
        const serviceCheck = await pool.query(
            `SELECT Service_ID
             FROM SERVICE
             WHERE Service_ID = $1`,
            [service_id]
        );

        if (serviceCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Service not found."
            });
        }

        // Update appointment
        const result = await pool.query(
            `
            UPDATE APPOINTMENT
            SET
                Customer_ID = $1,
                Employee_ID = $2,
                Service_ID = $3,
                Appointment_Date = $4,
                Appointment_Time = $5,
                Status = $6,
                Amount = $7,
                Notes = $8
            WHERE Appointment_ID = $9
            RETURNING
                Appointment_ID,
                Customer_ID,
                Employee_ID,
                Service_ID,
                Appointment_Date,
                Appointment_Time,
                Status,
                Amount,
                Notes
            `,
            [
                customer_id,
                employee_id,
                service_id,
                appointment_date,
                appointment_time,
                status,
                amount,
                notes || null,
                appointmentId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment updated successfully.",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Update appointment error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to update appointment.",
            error: error.message
        });
    }
});

// DELETE APPOINTMENT FOR ADMIN
app.delete("/api/admin/appointments/:id", async (req, res) => {
    const appointmentId = req.params.id;

    try {
        const result = await pool.query(
            `
            DELETE FROM APPOINTMENT
            WHERE Appointment_ID = $1
            RETURNING Appointment_ID
            `,
            [appointmentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found."
            });
        }

        res.json({
            success: true,
            message: "Appointment deleted successfully.",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Delete appointment error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to delete appointment.",
            error: error.message
        });
    }
});

// ADD APPOINTMENT FOR ADMIN
app.post("/api/admin/appointments", async (req, res) => {
    const {
        customer_id,
        employee_id,
        service_id,
        appointment_date,
        appointment_time,
        status,
        amount,
        notes
    } = req.body;

    if (
        !customer_id ||
        !employee_id ||
        !service_id ||
        !appointment_date ||
        !appointment_time ||
        !status ||
        amount === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "All appointment fields are required."
        });
    }

    const validStatuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid appointment status."
        });
    }

    if (Number(amount) < 0 || isNaN(Number(amount))) {
        return res.status(400).json({
            success: false,
            message: "Amount must be a valid non-negative number."
        });
    }

    try {
        // Check customer
        const customerCheck = await pool.query(
            `SELECT Customer_ID
             FROM CUSTOMER
             WHERE Customer_ID = $1`,
            [customer_id]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Customer not found."
            });
        }

        // Check employee
        const employeeCheck = await pool.query(
            `SELECT Employee_ID
             FROM EMPLOYEE
             WHERE Employee_ID = $1`,
            [employee_id]
        );

        if (employeeCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Employee not found."
            });
        }

        // Check service
        const serviceCheck = await pool.query(
            `SELECT Service_ID
             FROM SERVICE
             WHERE Service_ID = $1`,
            [service_id]
        );

        if (serviceCheck.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Service not found."
            });
        }

        // Insert appointment
        const result = await pool.query(
            `
            INSERT INTO APPOINTMENT
            (
                Customer_ID,
                Employee_ID,
                Service_ID,
                Appointment_Date,
                Appointment_Time,
                Status,
                Amount,
                Notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                Appointment_ID,
                Customer_ID,
                Employee_ID,
                Service_ID,
                Appointment_Date,
                Appointment_Time,
                Status,
                Amount,
                Notes
            `,
            [
                customer_id,
                employee_id,
                service_id,
                appointment_date,
                appointment_time,
                status,
                amount,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Appointment added successfully.",
            appointment: result.rows[0]
        });

    } catch (error) {
        console.error("Add appointment error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to add appointment.",
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`SalonEase server running at http://localhost:${PORT}`);
});
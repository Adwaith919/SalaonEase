# SalonEase — Online Salon Booking System

## 1. Project Overview

SalonEase is a web-based salon appointment booking and management system developed as a Database Management Systems (DBMS) project. It allows customers to explore salon services and book appointments while enabling administrators to manage appointments and monitor salon operations.

The application uses PostgreSQL for persistent data storage, Node.js and Express.js for backend processing, and HTML, CSS, and JavaScript for the user interface.

## 2. Objectives

- Provide an online platform for salon appointment booking.
- Maintain customer, employee, service, and appointment records.
- Allow customers to view their appointments and booking statistics.
- Enable administrators to create, view, update, and delete appointments.
- Demonstrate relational database design, SQL queries, joins, primary keys, foreign keys, and integrity constraints.

## 3. Features

### Customer
- Customer registration and login.
- Browse salon services.
- Book salon appointments.
- View upcoming and previous appointments.
- View appointment statistics and spending information.

### Administrator
- View appointments stored in the database.
- Add new appointments.
- Edit appointment details and booking status.
- Delete appointments.
- Search and filter appointments by status.

### Database
- Persistent storage using PostgreSQL.
- Primary and foreign key relationships.
- Unique customer email constraint.
- Required-field, amount, duration, and status validation.
- Relational queries joining customer, employee, service, and appointment data.

## 4. Technology Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database administration | pgAdmin 4 |
| PostgreSQL driver | `pg` |
| Password hashing | `bcryptjs` |
| Environment configuration | `dotenv` |

## 5. Database Design

The main database tables are:

### CUSTOMER
Stores customer information, including customer ID, name, email, phone number, and password hash.

### EMPLOYEE
Stores employee information, including employee ID, name, phone number, specialization, and status.

### SERVICE
Stores salon service information, including service ID, service name, price, duration, and status.

### APPOINTMENT
Stores appointment information, including appointment ID, customer ID, employee ID, service ID, appointment date, appointment time, status, amount, and notes.

### Relationships

- One customer can have multiple appointments.
- One employee can be assigned to multiple appointments.
- One service can be selected for multiple appointments.
- Each appointment references one customer, one employee, and one service.

The appointment table uses foreign keys to reference the other three tables. Customer, employee, and service details are retrieved through SQL joins rather than being unnecessarily duplicated in every appointment record.

## 6. Database Normalization

The database is designed around separate entities to reduce redundant data and improve consistency.

- **First Normal Form (1NF):** Fields store individual values rather than repeating groups.
- **Second Normal Form (2NF):** The main tables use single-column primary keys, avoiding partial dependencies on composite keys.
- **Third Normal Form (3NF):** Customer, employee, and service attributes are maintained in their respective tables rather than being repeatedly stored in the appointment table.

The appointment amount is retained as a booking snapshot so the recorded charge can remain associated with the appointment even if the service price changes later.

## 7. Prerequisites

Install the following before running the application:

- Node.js and npm
- PostgreSQL
- pgAdmin 4 (recommended for database administration)

## 8. Installation and Setup

### Step 1: Open the project

Open the SalonEase project directory in VS Code or a terminal.

### Step 2: Install dependencies

Run:

```bash
npm install
```

If the project does not have a `package.json` file, install the dependencies used by the application:

```bash
npm install express pg bcryptjs dotenv
```

### Step 3: Create the PostgreSQL database

Create a database in PostgreSQL and configure the application to use it. Ensure the required tables, constraints, and sample records are present.

Use the SQL schema or setup script supplied with the project, if available.

### Step 4: Configure environment variables

Create or update the `.env` file in the project root with your local PostgreSQL connection details. For example:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
PORT=3000
```

Use the actual variable names expected by `server.js`. Replace the example password with your own database password. Do not commit `.env` or real credentials to a public repository.

### Step 5: Start the server

Run:

```bash
node server.js
```

The application should be available at:

http://localhost:3000

Keep the terminal running while using the application.

## 9. Testing

The following features have been tested during development:

- Database connectivity through the application.
- Customer registration and login.
- Customer dashboard statistics and appointment display.
- Admin appointment listing from PostgreSQL.
- Admin appointment creation, editing, and deletion.
- Customer booking visibility in the customer dashboard and admin panel.
- Database integrity checks for duplicate normalized email values and invalid appointment references.

The results depend on the database configuration and records used during testing.

## 10. API Overview

The application includes API endpoints for customer authentication, services, customer appointments, and administrative appointment management.

Examples of verified endpoints include:

```text
GET /api/admin/appointments
GET /api/appointments/customer/:customerId
GET /api/appointments/customer/:customerId/stats
GET /api/services
```

The admin appointment management interface also uses POST, PUT, and DELETE requests to create, update, and remove appointments.

For endpoint details, refer to the route definitions in `server.js`.

## 11. Project Structure

The project contains frontend HTML pages, stylesheets, JavaScript files, a Node.js backend, and database configuration.

Typical files include:

```text
SalonEase/
├── server.js
├── package.json
├── .env
├── README.md
├── admin.html
├── admin-appointments.html
├── dashboard.html
├── services.html
└── css/
    └── style.css
```

The actual folder structure may contain additional pages, scripts, and assets.

## 12. Security and Limitations

- Keep database credentials in environment variables.
- Store passwords as secure hashes rather than plaintext.
- Validate user input on the server.
- Use appropriate authentication and authorization checks for administrative routes.
- Do not expose database credentials or private customer information in public repositories.
- For production deployment, configure HTTPS, session security, and suitable access controls.

## 13. Conclusion

SalonEase demonstrates how a web application can integrate a relational database with customer-facing booking functionality and administrative management. The project applies DBMS concepts such as entity relationships, primary keys, foreign keys, SQL joins, normalization, and integrity constraints in a practical salon management scenario.

**Project:** SalonEase — Online Salon Booking System  
**Purpose:** Academic DBMS project
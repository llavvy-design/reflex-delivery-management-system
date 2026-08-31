# Reflex Delivery Management System

> A full-stack delivery management platform for coordinating retailers, dispatchers, and riders through a secure, role-based workflow with real-time delivery updates.

---

## Overview

**Reflex** is a full-stack delivery management system designed to coordinate the complete delivery lifecycle between three primary user roles:

- **Retailers** create and manage deliveries.
- **Dispatchers** coordinate deliveries and assign them to riders.
- **Riders** manage assigned deliveries and update their delivery status.

The system combines a **React frontend**, **Node.js/Express backend**, **PostgreSQL database**, and **Socket.IO real-time communication**.

The project also includes:

- JWT authentication
- Role-based authorization
- Retailer ownership protection
- Delivery lifecycle management
- Delivery confirmation
- Rider availability management
- Input validation
- API security hardening
- Real-time event notifications
- Automated backend testing

---

## Key Features

### Retailer

- Register and log in
- Create deliveries
- View deliveries
- View individual delivery details
- Edit eligible deliveries
- Cancel eligible deliveries
- Confirm delivered deliveries using a confirmation code
- View delivery confirmation information

### Dispatcher

- View delivery statistics
- View deliveries
- Filter deliveries
- Assign deliveries to riders
- View riders

### Rider

- View assigned deliveries
- Update rider availability
- Update assigned delivery status
- View relevant delivery information

### Real-Time Updates

Reflex uses **Socket.IO** to provide real-time delivery notifications for relevant users and roles.

Examples include:

- Delivery created
- Delivery assigned
- Delivery status updated
- Delivery cancelled
- Delivery confirmed

---

# System Architecture

Reflex uses a separated frontend/backend architecture with PostgreSQL for persistent data and Socket.IO for real-time communication.

```text
React + Vite Frontend
        |
        | REST API
        v
Node.js + Express Backend
        |
        +--------------------------+
        |                          |
        | SQL                      | Socket.IO
        v                          v
PostgreSQL Database          Real-Time Events
```

### Backend Structure

The backend follows a layered structure:

```text
Routes
  |
  v
Controllers
  |
  v
Services
  |
  v
PostgreSQL
```

The major backend responsibilities are separated into:

- **Routes** - define API endpoints
- **Controllers** - handle HTTP requests and responses
- **Services** - contain application and business logic
- **Middleware** - authentication and request protection
- **Sockets** - real-time communication
- **Config** - database configuration

---

# Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| **React** | User interface |
| **Vite** | Development server and production builds |
| **React Router** | Client-side routing |
| **Axios** | HTTP/API communication |
| **Socket.IO Client** | Real-time communication |

## Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express** | REST API framework |
| **PostgreSQL** | Relational database |
| **pg** | PostgreSQL client for Node.js |
| **bcrypt** | Password hashing |
| **jsonwebtoken** | JWT authentication |
| **Socket.IO** | Real-time communication |

## Testing

| Technology | Purpose |
|---|---|
| **Jest** | Automated testing |
| **Supertest** | HTTP endpoint testing |
| **Socket.IO Client** | Socket integration testing |

---

# User Roles

Reflex has three primary user roles.

## Retailer

The retailer creates and manages delivery requests.

Typical responsibilities include:

- Creating deliveries
- Viewing deliveries
- Editing eligible deliveries
- Cancelling eligible deliveries
- Confirming completed deliveries

## Dispatcher

The dispatcher coordinates the delivery operation.

Typical responsibilities include:

- Viewing delivery activity
- Viewing statistics
- Assigning deliveries
- Monitoring riders

## Rider

The rider executes assigned deliveries.

Typical responsibilities include:

- Viewing assigned deliveries
- Updating availability
- Updating delivery status

Role and ownership checks are enforced on the **backend**, while the frontend also provides role-based route protection.

> **Security principle:** Frontend restrictions improve user experience, but backend authorization remains the authoritative security boundary.

---

# Delivery Lifecycle

A normal delivery follows this lifecycle:

```text
Pending
   |
   v
Assigned
   |
   v
Picked Up
   |
   v
Delivered
```

Eligible deliveries may also be cancelled:

```text
Pending or Assigned
         |
         v
     Cancelled
```

The backend validates delivery status transitions and rejects invalid state changes.

For example:

```text
Assigned -> Delivered
```

is rejected because the rider must first move the delivery through the required lifecycle.

---

# Delivery Confirmation

Once a delivery reaches:

```text
Delivered
```

the retailer can confirm the delivery using the confirmation code.

The confirmation workflow includes:

1. Verify the delivery exists.
2. Verify the retailer owns the delivery.
3. Verify the delivery is in `Delivered` status.
4. Validate the confirmation code.
5. Prevent duplicate confirmation.
6. Record the confirmation in PostgreSQL.

The `confirmations` table also enforces one confirmation per delivery through a unique constraint.

## Security Consideration

Confirmation codes are **not included in Socket.IO event payloads**.

This prevents sensitive confirmation information from being unnecessarily exposed through real-time events.

---

# Authentication and Authorization

## Authentication

Reflex uses **JWT-based authentication**.

Passwords are hashed with **bcrypt** before being stored.

The JWT intentionally contains minimal claims:

```json
{
  "userId": 44,
  "role": "retailer"
}
```

The token is configured to expire after **one hour**.

---

## Session Revalidation

The frontend does not permanently trust the user object stored in the browser.

When the application is refreshed:

```text
Stored JWT
    |
    v
GET /api/auth/me
    |
    v
JWT verification
    |
    v
User retrieved from PostgreSQL
    |
    v
Full user profile restored
```

This ensures that the session is validated by the backend instead of relying solely on stale client-side state.

---

## Expired Authentication

If the current authentication token becomes invalid during application use:

```text
API request
    |
    v
Authentication failure
    |
    v
Frontend detects expired authentication
    |
    +-- Clear session
    +-- Disconnect Socket.IO
    +-- Redirect to /login
```

---

# Authorization

Authorization is enforced according to both **role** and **resource ownership**.

Examples include:

- Retailers cannot access dispatcher-only operations.
- Riders cannot assign deliveries.
- Dispatchers cannot perform rider-only delivery updates.
- Retailers cannot access another retailer's delivery.
- Retailers cannot edit another retailer's delivery.
- Retailers cannot cancel another retailer's delivery.
- Retailers cannot confirm another retailer's delivery.

The frontend also protects role-specific routes.

For example:

```text
Retailer    -> /retailer
Rider       -> /rider
Dispatcher  -> /dispatcher
```

Attempting to access another role's protected frontend route redirects the user to the correct dashboard.

---

# Real-Time Communication

Reflex uses **Socket.IO** for real-time updates.

Socket connections are authenticated using the user's JWT during the Socket.IO handshake.

Authenticated users are placed into:

```text
user:{userId}
role:{role}
```

Riders additionally receive:

```text
rider:{userId}
```

## Current Event Types

```text
delivery:created
delivery:assigned
delivery:status_updated
delivery:cancelled
delivery:confirmed
```

Events are scoped to the relevant users and roles.

For example, a rider assignment notification is sent to:

```text
rider:{assigned_rider_id}
```

rather than being broadcast to every connected rider.

---

# Database Design

Reflex uses PostgreSQL with four primary tables:

```text
users
   |
   +-- deliveries.created_by
   +-- deliveries.assigned_rider_id
   +-- confirmations.confirmed_by
   +-- delivery_status_history.changed_by

deliveries
   |
   +-- confirmations.delivery_id
   +-- delivery_status_history.delivery_id
```

## Tables

### `users`

Stores user identity, authentication information, role, and rider availability.

### `deliveries`

Stores customer information, delivery details, assigned rider, confirmation code, status, and creation time.

### `delivery_status_history`

Records delivery status changes and the user who performed each change.

### `confirmations`

Records completed delivery confirmations.

---

## Database Constraints

The schema includes:

- Primary keys
- Unique email constraint
- Foreign keys
- Delivery status constraints
- Role constraints
- Rider availability constraints
- Unique confirmation per delivery
- Delivery lookup indexes

---

# Database Schema and Reproducibility

The repository contains the canonical current schema at:

```text
backend/database/baseline_schema.sql
```

The baseline schema was generated from the working PostgreSQL database and committed to the repository so the database structure can be reproduced independently of the original development machine.

Incremental SQL changes are stored under:

```text
backend/database/migrations/
```

> **Current limitation:** The project does not currently include an automated migration runner. The SQL migration files document incremental schema changes, while `baseline_schema.sql` represents the current complete schema.

---

# Project Structure

```text
reflex/
|
+-- backend/
|   |
|   +-- database/
|   |   +-- baseline_schema.sql
|   |   +-- migrations/
|   |
|   +-- src/
|   |   +-- config/
|   |   +-- controllers/
|   |   +-- middleware/
|   |   +-- routes/
|   |   +-- services/
|   |   +-- sockets/
|   |   +-- server.js
|   |
|   +-- tests/
|
+-- frontend/
    |
    +-- src/
    |   +-- components/
    |   +-- context/
    |   +-- pages/
    |   +-- services/
    |   +-- sockets/
    |
    +-- package.json
```

---

# Prerequisites

Before running Reflex, install:

- **Node.js**
- **npm**
- **PostgreSQL**

---

# Getting Started

## 1. Clone the Repository

```powershell
git clone <repository-url>
cd reflex
```

---

# Backend Setup

Move into the backend directory:

```powershell
cd backend
```

Install dependencies:

```powershell
npm.cmd install
```

---

## Configure Environment Variables

Create:

```text
backend/.env
```

using:

```text
backend/.env.example
```

Example configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reflex
DB_USER=postgres
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173
```

> **Never commit `.env` to Git.**

---

# Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE reflex;
```

Connect to it:

```text
\c reflex
```

Load the canonical schema:

```powershell
psql -U postgres -d reflex -f .\backend\database\baseline_schema.sql
```

If PostgreSQL was installed manually from binary archives and `psql` is not available on your system `PATH`, run it using the full path to your PostgreSQL `psql.exe`.

For example:

```powershell
& "C:\path\to\psql.exe" -U postgres -d reflex -f .\backend\database\baseline_schema.sql
```

---

# Run the Backend

Development mode:

```powershell
npm.cmd run dev
```

Normal start:

```powershell
npm.cmd start
```

The backend uses port `5000` by default.

Health endpoint:

```text
http://localhost:5000/api/health
```

---

# Frontend Setup

Open a second terminal and move into the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm.cmd install
```

Create:

```text
frontend/.env
```

using:

```text
frontend/.env.example
```

Example:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

# Run the Frontend

Start the Vite development server:

```powershell
npm.cmd run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

# Testing

From the backend directory:

```powershell
npm.cmd test
```

For open-handle diagnostics:

```powershell
npm.cmd test -- --detectOpenHandles
```

## Current Verified Test Status

```text
Test Suites: 5 passed
Tests:       83 passed
```

The test suite covers:

- Authentication
- Registration validation
- Authorization
- Delivery lifecycle
- Delivery validation
- Retailer ownership
- Rider availability
- Cancellation
- Delivery confirmation
- Socket.IO authentication
- Socket.IO event isolation
- Session/current-user retrieval
- Malformed JSON handling
- Oversized request handling

---

# Frontend Production Build

To create a production build:

```powershell
cd frontend
npm.cmd run build
```

The generated output is placed in:

```text
frontend/dist/
```

---

# HTTP Security and Reliability

Current API hardening includes:

- CORS restricted through `FRONTEND_URL`
- Socket.IO CORS restricted through the configured frontend origin
- JSON request body limited to **1 MB**
- Express `X-Powered-By` header disabled
- Centralized API error handling
- Malformed JSON rejection
- Oversized request rejection
- Controlled API error responses
- JWT authentication
- Role-based backend authorization
- Resource ownership checks

Production dependency audit currently reports:

```text
found 0 vulnerabilities
```

using:

```powershell
npm.cmd audit --omit=dev
```

---

# API Overview

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

## Riders

```text
GET   /api/users/riders
GET   /api/users/riders/me
PATCH /api/users/riders/me/availability
```

## Deliveries

```text
POST   /api/deliveries
GET    /api/deliveries
GET    /api/deliveries/stats
GET    /api/deliveries/:id
PATCH  /api/deliveries/:id
POST   /api/deliveries/:id/cancel
POST   /api/deliveries/:id/assign
PATCH  /api/deliveries/:id/status
GET    /api/deliveries/:id/history
POST   /api/deliveries/:id/confirm
GET    /api/deliveries/:id/confirmation
```

Protected endpoints require authentication.

---

# Design Decisions

## Why PostgreSQL?

The system has strongly related entities such as:

```text
users
deliveries
confirmations
delivery_status_history
```

and relies on:

- Foreign-key relationships
- Unique constraints
- Status constraints
- Transactional operations

A relational database fits these requirements well.

---

## Why Socket.IO?

Polling repeatedly asks the server whether something changed.

Socket.IO allows the server to push relevant events when changes occur.

This is useful for events such as:

```text
Delivery created
Delivery assigned
Delivery status changed
Delivery cancelled
Delivery confirmed
```

---

## Why Backend Authorization?

Frontend route protection can be bypassed by manually calling the API.

Therefore, the backend validates:

```text
Who is the user?
What is their role?
Do they own the resource?
Are they allowed to perform this operation?
```

---

# Trade-Offs and Current Limitations

Reflex is intentionally kept relatively simple to remain understandable, testable, and manageable as a project prototype.

## Database Migrations

There is currently no automated migration runner.

**Acceptable because:** the repository includes a canonical database baseline and the incremental SQL files remain documented.

**Future improvement:** introduce a proper migration framework and automated migration execution.

## Session Strategy

The frontend currently uses JWT access tokens stored in `sessionStorage`.

**Benefit:** simple client-side session handling and automatic token attachment.

**Trade-off:** `sessionStorage` is accessible to JavaScript running in the page, so stronger production session strategies may be appropriate.

**Future improvement:** evaluate secure cookie-based sessions or a more advanced access-token/refresh-token strategy.

## Scaling Real-Time Communication

The current Socket.IO design is suitable for the current application architecture.

**Future improvement:** for multiple backend instances, introduce distributed Socket.IO infrastructure and a shared event/coordination mechanism.

## Abuse Protection

Advanced rate limiting and brute-force protection are not currently implemented.

**Future improvement:** introduce rate limiting and additional protection around authentication and confirmation-code attempts.

---

# Verified Quality Checks

The following checks have been performed during development:

| Check | Result |
|---|---|
| Backend test suite | 83/83 passing |
| Socket tests with open-handle detection | Passing |
| Frontend production build | Successful |
| Production dependency audit | 0 vulnerabilities |
| Frontend role protection | Manually verified |
| Session restoration after refresh | Verified |
| Invalid token handling | Verified |
| Socket event isolation | Verified |
| Database baseline | Captured and committed |

---

# Development Notes

The project uses `npm.cmd` in PowerShell commands throughout the development workflow because the project was developed in a Windows PowerShell environment.

For example:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
npm.cmd run build
```

On systems where the normal npm command resolves correctly, the equivalent commands may also be used:

```text
npm install
npm test
npm run dev
npm run build
```

---

# Future Roadmap

Potential future improvements include:

- Automated database migrations
- Rate limiting and abuse protection
- Refresh-token rotation
- Stronger production session management
- Distributed Socket.IO infrastructure
- CI/CD automation
- Improved observability and monitoring
- Database backup and recovery procedures
- More extensive concurrency testing
- Production secrets management
- Mobile clients
- Push notifications

These items are **future improvements**, not current implemented features.

---

# Project Status

Reflex currently provides a working end-to-end delivery workflow:

```text
Retailer
   |
   | Create delivery
   v
Dispatcher
   |
   | Assign rider
   v
Rider
   |
   | Pick up and deliver
   v
Delivered
   |
   | Confirmation code
   v
Retailer
   |
   v
Confirmed
```

The system combines:

**role-based access + delivery lifecycle management + database integrity + real-time communication + automated testing + security hardening**

---

## Author

**Lavine Lornah**

GitHub: **llavvy-design**

---

> **Reflex - Connecting the delivery workflow from creation to confirmation.**
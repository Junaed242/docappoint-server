# DocAppoint API Server

This is the backend resource API for the **DocAppoint** Doctor Appointment Manager. Built with Node.js, Express, and MongoDB, this decoupled server manages medical specialist profiles and secures sensitive patient appointment CRUD operations using a JWT-based signature verification middleware.

## 🚀 Live API Link
**Live API URL:** [https://docappoint-server-ten.vercel.app](https://docappoint-server-ten.vercel.app)

## 🌟 Key Features
- **JWT Verification Middleware:** Uses a cryptographic handshake to verify JSON Web Tokens (JWTs) sent by the client. It decodes the payload locally, ensuring secure authorization for bookings.
- **MongoDB Atlas Integration:** Connects to a cloud-hosted MongoDB cluster using the latest Node.js driver, managing connections efficiently inside a unified `run` execution block.
- **Dynamic Search Filtering:** Implements case-insensitive, partial-match database queries (`$regex`) to support search filtering on doctor names directly from database indexes.
- **RESTful Appointment CRUD Endpoints:** Restricts actions such as booking additions, modifications, and cancellations behind authentication, while keeping public physician profiles open and easily cacheable.
- **CORS Configuration:** Configured to securely handle cross-origin resource requests, enabling safe and restricted data exchange between the backend port and the Next.js frontend port.

## 🛠️ Technology Stack
- **Runtime Environment:** Node.js
- **Backend Framework:** Express.js
- **Database Engine:** MongoDB Driver
- **Security & Decryption:** `jose-cjs` for JWKS public key handshake)
- **Environment Management:** `dotenv`

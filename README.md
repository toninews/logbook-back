🎯 Project Purpose

This project was created to simulate a real-world backend system running in a production-like environment.

The main goals were to practice and demonstrate:

REST API design with pagination and filtering

Docker networking between multiple services

MongoDB integration in a containerized setup

Basic security mechanisms such as rate limiting

Real VPS deployment, troubleshooting, and maintenance

📘 Logbook API

Logbook API is a backend service designed to manage logs/tasks in a simple, secure, and scalable way.

It was built with real-world production concerns in mind, including security, data integrity, containerized deployment, and fault tolerance.

The API allows users to create, list, search, paginate, and logically delete logs through a RESTful interface.
The application runs fully containerized with Docker and is deployed on a Linux VPS, closely simulating a real production environment.

This project was developed as a portfolio piece to demonstrate practical backend skills, focusing on API design, database integration, Docker networking, and defensive programming.

✨ Features
Core Functionality

Log Management: Create, list, search, and soft-delete logs

Pagination: Paginated responses for better performance and scalability

Search Engine: Search logs by title, content, or tags

Soft Delete: Logical deletion to preserve historical data

Security & Reliability

Rate Limiting: Protection against API abuse and brute-force attacks

Default: 5 requests per minute per IP

Input Validation: Required fields validation for critical operations

Error Handling: Consistent error responses with proper HTTP status codes

Technical Features

RESTful API architecture

MongoDB using the native Node.js driver

Fully Dockerized environment

Dedicated Docker network for inter-container communication

Automatic container restart on failure (restart: unless-stopped)

📡 API Endpoints
Get Logs (Paginated & Searchable)
GET /logs/getList?page=1&search=

Create Log
POST /logs/insertTask

Request Body:

{
"title": "Example title",
"content": "Example content",
"tags": ["docker", "node", "mongodb"]
}

Soft Delete Log
DELETE /logs/:id

Description:
Performs a logical deletion, preserving the record in the database instead of physically removing it.

🛡️ Basic Security Layer

This project includes a custom security layer focused on protecting the API from abuse:

Custom in-memory rate limiting middleware

IP-based request tracking

Configurable request limits per IP

HTTP 429 (Too Many Requests) response on abuse detection

🗑️ Logical Deletion Strategy

Instead of physically deleting records from the database, this API applies logical deletion:

Records are marked with isDeleted: true

Deletion timestamps are stored

Data history is preserved

Safer for audits, analytics, and future recovery

🚀 Conclusion

This project represents a complete backend solution, covering the full lifecycle from local development to production deployment.

Throughout its implementation, real-world best practices were applied, including:

Containerized architecture with Docker

Logical deletion to preserve data integrity

Rate limiting to protect against API abuse

Clean and maintainable RESTful endpoints

Deployment and operation on a real VPS environment

The purpose of this project is not only to deliver functionality, but also to demonstrate practical backend development skills, production awareness, and problem-solving experience.

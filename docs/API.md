# API Documentation — Assisted Venture Growth Platform

The platform uses a RESTful API built with Node.js and Express. It serves as the primary interface for the frontend, handling authentication, business logic, and database interactions via Supabase.

## Base URL

**Development:**
```
http://localhost:3001/api
```

**Production:**
```
https://api.your-domain.com/api
```

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header.

```http
Authorization: Bearer <your-access-token>
```

Tokens are obtained via the `/auth/login` or `/auth/signup` endpoints.

---

## Response Format

Standard success response:
```json
{
  "data": { ... }, // Or direct object/array depending on endpoint
  "message": "Optional success message"
}
```

Standard error response:
```json
{
  "error": "Error message description",
  "details": [ ... ] // Optional validation details
}
```

---

## Endpoints

### 🔐 Authentication

#### Register New User
Create a new user account.
- **URL:** `/auth/signup`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "full_name": "John Doe",
    "role": "entrepreneur" // Optional (default: entrepreneur)
  }
  ```

#### Login
Authenticate an existing user.
- **URL:** `/auth/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** Returns user object and session (tokens).

#### Get Current User
Retrieve profile of the currently authenticated user.
- **URL:** `/auth/me`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`

#### Logout
Invalidate the current session.
- **URL:** `/auth/logout`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`

#### Refresh Token
Get a new access token using a refresh token.
- **URL:** `/auth/refresh`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "refresh_token": "..."
  }
  ```

---

### 🚀 Ventures

#### List Ventures
Get a list of ventures. Entrepreneurs see only their own; VSMs/Committee see all.
- **URL:** `/ventures`
- **Method:** `GET`
- **Query Params:**
  - `status`: Filter by status (e.g., `submitted`, `approved`)
  - `program`: Filter by program name
  - `limit`: Number of results (default 50)
  - `offset`: Pagination offset (default 0)

#### Create Venture
Start a new venture application.
- **URL:** `/ventures`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "My New Venture",
    "program": "Accelerate",
    "growth_current": { ... },
    "growth_target": { ... },
    "commitment": { ... }
  }
  ```

#### Get Venture Details
Get full details for a specific venture.
- **URL:** `/ventures/:id`
- **Method:** `GET`

#### Update Venture
Update venture details.
- **URL:** `/ventures/:id`
- **Method:** `PUT`
- **Body:** Partial venture object.

#### Submit Venture
Submit a draft venture for review.
- **URL:** `/ventures/:id/submit`
- **Method:** `POST`

#### Delete Venture
Delete a venture (Owner/Admin only).
- **URL:** `/ventures/:id`
- **Method:** `DELETE`

---

### 🌊 Streams

#### List Venture Streams
Get all streams associated with a venture.
- **URL:** `/ventures/:id/streams`
- **Method:** `GET`

#### Create Stream
Add a new stream to a venture.
- **URL:** `/ventures/:id/streams`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "stream_name": "Market Research",
    "status": "Work in Progress"
  }
  ```

#### Update Stream
Update a stream's status or name.
- **URL:** `/streams/:id`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "status": "Done"
  }
  ```

#### Delete Stream
Remove a stream.
- **URL:** `/streams/:id`
- **Method:** `DELETE`

---

### ❤️ System

#### Health Check
Check API status.
- **URL:** `/health`
- **Method:** `GET`
- **Response:**
  ```json
  {
    "status": "ok",
    "service": "Wadhwani Ventures API",
    "version": "1.0.0"
  }
  ```

---

## Error Codes

| Status Code | Description |
|---|---|
| **200** | OK - Request succeeded |
| **201** | Created - Resource created successfully |
| **204** | No Content - Action succeeded (e.g., delete) |
| **400** | Bad Request - Validation failed |
| **401** | Unauthorized - Invalid or missing token |
| **403** | Forbidden - Insufficient permissions |
| **404** | Not Found - Resource does not exist |
| **500** | Internal Server Error - Server-side issue |

## Rate Limiting

API is currently rate-limited to 100 requests per minute per IP to prevent abuse.

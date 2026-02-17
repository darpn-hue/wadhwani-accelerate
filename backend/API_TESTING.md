# Backend API Testing Guide

## Base URL
```
http://localhost:3001/api
```

## Authentication Endpoints

### 1. Signup
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "role": "entrepreneur"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the access_token from the response for subsequent requests!**

### 3. Get Current User
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Venture Endpoints

### 1. Create Venture
```bash
curl -X POST http://localhost:3001/api/ventures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "My Awesome Venture",
    "founder_name": "John Doe",
    "program": "Accelerate",
    "growth_current": {
      "product": "Mobile App",
      "geography": "India",
      "segment": "B2C",
      "revenue": "10 Lakhs"
    },
    "growth_target": {
      "product": "Web + Mobile",
      "geography": "Global",
      "segment": "B2B + B2C",
      "revenue": "1 Crore"
    },
    "growth_focus": "Product expansion and market reach",
    "commitment": {
      "investment": "50 Lakhs",
      "teamSize": 5,
      "progress": "MVP launched, 1000 users"
    },
    "blockers": "Need help with fundraising and scaling",
    "support_request": "Looking for mentorship in product-market fit"
  }'
```

### 2. Get All Ventures
```bash
# Get all ventures
curl -X GET http://localhost:3001/api/ventures \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# With filters
curl -X GET "http://localhost:3001/api/ventures?status=submitted&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Single Venture
```bash
curl -X GET http://localhost:3001/api/ventures/VENTURE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Venture
```bash
curl -X PUT http://localhost:3001/api/ventures/VENTURE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Updated Venture Name",
    "blockers": "Updated blockers"
  }'
```

### 5. Submit Venture
```bash
curl -X POST http://localhost:3001/api/ventures/VENTURE_ID/submit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Delete Venture
```bash
curl -X DELETE http://localhost:3001/api/ventures/VENTURE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Stream Endpoints

### 1. Get Venture Streams
```bash
curl -X GET http://localhost:3001/api/ventures/VENTURE_ID/streams \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 2. Create Stream
```bash
curl -X POST http://localhost:3001/api/ventures/VENTURE_ID/streams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "stream_name": "Money & Capital",
    "status": "Need some advice"
  }'
```

### 3. Update Stream
```bash
curl -X PUT http://localhost:3001/api/streams/STREAM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "Work in Progress"
  }'
```

### 4. Delete Stream
```bash
curl -X DELETE http://localhost:3001/api/streams/STREAM_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Health Check

```bash
curl -X GET http://localhost:3001/api/health
```

## Testing Workflow

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test health endpoint:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Signup a new user:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
   ```

4. **Login and save token:**
   ```bash
   TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}' \
     | jq -r '.session.access_token')
   ```

5. **Create a venture:**
   ```bash
   curl -X POST http://localhost:3001/api/ventures \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"name":"Test Venture","program":"Accelerate"}'
   ```

6. **Get all ventures:**
   ```bash
   curl -X GET http://localhost:3001/api/ventures \
     -H "Authorization: Bearer $TOKEN"
   ```

## Expected Responses

### Success Response (200)
```json
{
  "ventures": [...],
  "total": 5
}
```

### Created Response (201)
```json
{
  "venture": { "id": "...", "name": "..." }
}
```

### Error Response (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "error": "No authorization token provided"
}
```

## Notes

- All protected endpoints require `Authorization: Bearer <token>` header
- Entrepreneurs can only access their own ventures
- VSM and committee members can access all ventures
- Validation errors return 400 with detailed field errors
- Authentication errors return 401
- Permission errors return 403

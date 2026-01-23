# Function Registry Service – CloudFunc (Phase 1 & Phase 2)

This project implements the **Function Registry Service**, which is part of **Phase 1 of the CloudFunc project**.

The purpose of this service is to **store and retrieve metadata about functions** using a PostgreSQL database.  
This service was developed as part of Phase 1 and extended in Phase 2 to integrate with the Gateway Service by providing function lookup capabilities.


---

##  Role & Scope

**Role:** Junior 2 – Function Registry Service  

This service was developed independently as part of Phase 1, where each module is implemented and demonstrated separately.

---

##  What This Service Does

- Runs an HTTP server using Express
- Connects to a PostgreSQL database using the `pg` library
- Stores function metadata in a database table
- Exposes REST APIs to register and fetch functions

---

##  Database Design

### Database: `functionsdb`

### Table: `functions`

| Column | Description |
|------|------------|
| id | Unique function ID (auto-generated) |
| name | Name of the function |
| owner | Owner of the function |
| image | Docker image name |
| created_at | Timestamp when function was registered |

---

##  API Endpoints

### Register a Function

**Endpoint:**  

POST /registerFunction

**Request Body (JSON):**
```json
{
  "name": "helloFunction",
  "owner": "max",
  "image": "hello-image:v1"
}

```

Response:
```json
{
  "message": "Function registered successfully",
  "data": {
    "id": 1,
    "name": "helloFunction",
    "owner": "max",
    "image": "hello-image:v1",
    "created_at": "2025-..."
  }
}
```

Get All Registered Functions

Endpoint:
```
GET /functions
```
Response:
```
[
  {
    "id": 1,
    "name": "helloFunction",
    "owner": "max",
    "image": "hello-image:v1",
    "created_at": "2025-..."
  }
]
```
---

## Phase 2 – Gateway Integration

In Phase 2, the Function Registry Service acts as a metadata lookup service for the Gateway.

The Gateway queries this service to:
- Verify whether a function exists
- Retrieve the container image associated with the function

### Get Function Metadata by Name

**Endpoint:**
GET /function/:name
```
**Example Request:**
GET /function/helloFunction
```

**Successful Response:**
```json
{
  "name": "helloFunction",
  "owner": "max",
  "image": "hello-image:v1"
}
```
```
If Function Not Found:
```
{
  "error": "Function not found"
}
```
Status Code:404

 ## Technologies Used :

Node.js

Express.js

PostgreSQL

Docker

pg (PostgreSQL client)

Postman (for API testing)


## How to Run the Service:

### Prerequisites:

Node.js installed
Docker Desktop installed and running

Step 1: Run PostgreSQL using Docker
```
docker run --name postgres-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=admin123 -e POSTGRES_DB=functionsdb -p 5432:5432 -d postgres:15
```

Step 2: Create the Database Table
```
docker exec -it postgres-db psql -U admin -d functionsdb
```
```
CREATE TABLE functions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Exit:
```
\q
```

Step 3: Install Dependencies
```
npm install express pg
```
Step 4: Run the Server
```
node index.js
```

Expected output:
```
Function Registry Service running on port 3000
```

## Testing the APIs:

APIs were tested using Postman.
POST /registerFunction → Insert function metadata
GET /functions → Retrieve all stored functions


## Data Persistence:

Data is stored in PostgreSQL running inside Docker
Data persists across server restarts
Data is removed only if the PostgreSQL container is deleted

## Future Enhancements:

Input validation
Authentication & authorization
Service-to-service integration
Docker volumes for production persistence


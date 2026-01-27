# Function Registry Service – CloudFunc (Phase 1 , Phase 2 & Phase 3)

"This project implements the **Function Registry + Job Registry**"

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


## Phase 3 - Job Registry Service (Asynchronous Execution)

### Phase 3 – Asynchronous Execution using Job Registry + RabbitMQ

n Phase 3, CloudFunc moves from synchronous execution (direct container execution) to a fully asynchronous serverless workflow.  

The Gateway no longer executes functions directly.
Instead, every invocation becomes a job, and Workers execute jobs asynchronously.  

As Junior-2, my responsibility in Phase 3 was to build the Job Registry Service, which stores and tracks all jobs created during invocation.


### Chnages in the Phase-3

**Before (Phase 2):**

Gateway → Registry → Container Manager → Runner → User
(Request is executed immediately.)

**Now (Phase 3):**

Gateway → Job Registry (creates job) → RabbitMQ
Worker → Job Registry (updates job) → Container Manager → Runner
User → Job Registry (polls job status)

This enables:

asynchronous execution

retries

failures

timeouts

job-based execution

worker scaling


### Role of Job Registry :

The Job Registry Service is the database + API layer that stores:

job status

job input

job result

job errors

timestamps

retry count

It is the source of truth for all job execution stages.

## Phase 3 Database Design
**Table:** `jobs`
| Column          | Description                              |
|-----------------|------------------------------------------|
| job_id          | Unique job ID (UUID)                     |
| function_name   | Name of function being executed          |
| payload         | Input data for the function              |
| status          | queued / running / completed / failed    |
| result          | Output returned by the function          |
| error           | Error message if execution failed        |
| attempts        | Number of execution attempts             |
| submitted_at    | Timestamp when job was created           |
| completed_at    | Timestamp when job completed             |


This table is created using the `schema.sql` script.


## Phase 3 Job Registry API Endpoints

### 1.Create a Job
  
  `POST /jobs`

  Used by the Gateway to create a job when a function is invoked.

  ```
  {
  "functionName": "hellophase3",
  "payload": { "name": "Alice" }
}
```
Response:
```
{
  "job_id": "uuid",
  "function_name": "hellophase3",
  "status": "queued",
  "submitted_at": "timestamp"
}
```

### 2. Fetch Job Status

`GET /jobs/:jobId`

Used by:

User

Gateway

Worker

To track progress and get final result.

Response Example:

```
{
  "job_id": "uuid",
  "status": "completed",
  "result": { "message": "Hello Nikitha" },
  "completed_at": "timestamp"
}
```
### 3.Update Job Status

`PATCH /jobs/:jobId`

Used by the Worker to update:

running

completed

failed

error

attempts

result

Example (worker sets job running):
```
{
  "status": "running"
}
```
Example (job completed):

```
{
  "status": "completed",
  "result": { "message": "Hello" },
  "completed_at": "2026-01-27T10:00:00Z"
}
```
Example (job failed):

```
{
  "status": "failed",
  "error": "Timeout error",
  "attempts": 1
}
```
## Phase 3 – Updated Architecture:

```
User → Gateway → POST /jobs → Job Registry  
                     ↓
                RabbitMQ Queue
                     ↓
Worker → GET job → Job Registry  
Worker → Container Manager → Runner  
Worker → PATCH job → Job Registry  
User → GET /jobs/:id → Job Registry
```
The Job Registry is central to the entire asynchronous system.

## Technologies Used in Phase 3

Node.js / Express.js

PostgreSQL (via Docker)

uuid library

RabbitMQ (not part of Junior-2 code but interacts with Registry)

Worker Service (updates jobs via PATCH)


### Testing Phase-3 Job Registry APIs

Create Job:
```
POST http://localhost:4000/jobs
```
Fetch Status:
```
GET http://localhost:4000/jobs/<jobId>
```
Update Job:
```
PATCH http://localhost:4000/jobs/<jobId>
```
All endpoints tested using Postman.


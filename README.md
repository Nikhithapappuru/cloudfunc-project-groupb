
<div align="center">

<h1>☁️ CloudFunc</h1>

<p><strong>A mini serverless backend platform for registering and invoking functions — without managing servers.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
</p>

<p>
  <a href="#overview">Overview</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#services">Services</a> •
  <a href="#request-flow">Request Flow</a> •
  <a href="#installation">Installation</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#database-schema">Database Schema</a>
</p>

</div>

---

## Overview

CloudFunc executes functions **asynchronously** using message queues and worker processes — similar to AWS Lambda. It is built with a **microservices architecture** and uses containerized execution environments to ensure scalability and fault tolerance.

**What you can do with CloudFunc:**

- 📦 Register cloud functions with Docker images
- ⚡ Invoke functions asynchronously via REST API
- 🔍 Track job status and retrieve execution results
- 🐳 Execute functions in isolated container environments
- ♻️ Benefit from warm container reuse for faster cold starts

---

## Architecture
````
Client
  │
  ▼
Gateway Service (Port 3000)
  │   API key auth, job creation
  ▼
RabbitMQ Queue  ──────────────────────────┐
  │                                       │
  ▼                                       │
Worker Processes                          │
  │   Fetches jobs, handles retries       │
  ▼                                       │
Container Manager (Port 3001)             │
  │   Starts/reuses warm containers       │
  ▼                                       │
Function Runner (Port 4001)               │
  │   Executes function code              │
  ▼                                       │
Function Registry (Port 4000) ◄───────────┘
  │   PostgreSQL — stores functions & jobs
````

---

## Services

### 1. 🔀 Gateway Service `PORT 3000`
Entry point for all client requests.
- API key authentication
- Function invocation & job creation
- Publishes execution requests to RabbitMQ
- Exposes job status endpoints

### 2. 🗄️ Function Registry Service `PORT 4000`
Manages metadata and job records in PostgreSQL.
- Register and store function metadata
- Track job status (`queued` → `running` → `completed` / `failed`)
- Store and serve execution results

### 3. 📨 RabbitMQ Queue `Queue: executions`
Message broker between gateway and workers.
- Queues execution jobs asynchronously
- Buffers requests during traffic spikes

### 4. ⚙️ Worker Manager
Continuously listens to the queue and processes jobs.
- Fetches jobs from RabbitMQ
- Forwards execution requests to the container manager
- Updates results in the registry
- Handles retries on failure
- Multiple workers run in parallel for throughput

### 5. 🐳 Container Manager `PORT 3001`
Controls the execution environment.
- Starts containers for new function invocations
- Reuses **warm containers** to reduce latency
- Removes idle containers to free resources

### 6. 🏃 Function Runner `PORT 4001`
Responsible for executing function logic.
- Runs function code in isolation
- Measures execution time
- Returns result or structured error

---

## Request Flow
````
1. Client sends POST /invoke with function name and payload
       │
2. Gateway verifies API key, checks function exists, creates job
       │
3. Job message published to RabbitMQ queue
       │
4. Worker picks up the job and calls the Container Manager
       │
5. Container Manager starts or reuses a warm container
       │
6. Function Runner executes the function and returns result
       │
7. Worker updates job status and result in the Registry
       │
8. Client polls GET /jobs/:jobId to retrieve the result
````

**Example invocation message (RabbitMQ payload):**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "functionName": "addNumbers",
  "payload": {
    "a": 5,
    "b": 10
  }
}
```

**Example execution result:**
```json
{
  "success": true,
  "result": 15,
  "executionTime": "2ms"
}
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Web Framework | Express.js |
| Message Broker | RabbitMQ |
| Database | PostgreSQL |
| Containerization | Docker |
| Key Libraries | `axios`, `amqplib`, `uuid`, `pg` |

---

## Installation

### Prerequisites

Make sure the following are installed on your system:

- [Node.js](https://nodejs.org/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [RabbitMQ](https://www.rabbitmq.com/)

### Environment Configuration

Create a `.env` file in the gateway service directory:
```env
GATEWAY_API_KEY=your_secret_key
```

---

## Running the System

Start services in the following order:

#### Step 1 — Start PostgreSQL
```bash
sudo service postgresql start
```

#### Step 2 — Start RabbitMQ
```bash
rabbitmq-server
```

#### Step 3 — Start Function Registry
```bash
node registry.js
# Running at http://localhost:4000
```

#### Step 4 — Start Function Runner
```bash
node runner.js
# Running at http://localhost:4001
```

#### Step 5 — Start Container Manager
```bash
node manager.js
# Running at http://localhost:3001
```

#### Step 6 — Start Workers
```bash
node worker.js
# Workers start listening automatically
```

#### Step 7 — Start Gateway Service
```bash
node gateway.js
# Running at http://localhost:3000
```

---

## API Documentation

### Health Check
````
GET /
````
**Response:** `Gateway Service is running`

---

### Invoke a Function
````
POST /invoke
````

**Headers:**
````
X-API-Key: your_api_key
````

**Request Body:**
```json
{
  "function_name": "addNumbers",
  "payload": {
    "a": 1,
    "b": 2
  }
}
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

### Get Job Status
````
GET /jobs/:jobId
````

**Headers:**
````
X-API-Key: your_api_key
````

**Response:**
```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "result": 3
}
```

---

### Register a Function
````
POST /registerFunction
````

**Request Body:**
```json
{
  "name": "addNumbers",
  "owner": "user1",
  "image": "node-add:v1"
}
```

---

## Database Schema

### `functions` table

| Column | Type | Description |
|---|---|---|
| `id` | UUID | Unique function ID (auto-generated) |
| `name` | VARCHAR | Name of the function |
| `owner` | VARCHAR | Owner of the function |
| `image` | VARCHAR | Docker image name |
| `created_at` | TIMESTAMP | Registration timestamp |

### `jobs` table

| Column | Type | Description |
|---|---|---|
| `job_id` | UUID | Unique job identifier |
| `function_name` | VARCHAR | Name of the function invoked |
| `payload` | JSONB | Input data for the function |
| `status` | ENUM | `queued` / `running` / `completed` / `failed` |
| `result` | JSONB | Output returned by the function |
| `error` | TEXT | Error message if execution failed |
| `attempts` | INT | Number of execution attempts |
| `submitted_at` | TIMESTAMP | Job creation time |
| `completed_at` | TIMESTAMP | Job completion time |

---

## Key Features

| Feature | Description |
|---|---|
| ⚡ Async Execution | Functions are queued and processed without blocking the client |
| ♻️ Warm Containers | Container reuse reduces cold start latency |
| 🔁 Fault Tolerance | Workers retry failed jobs automatically |
| 📈 Scalability | Multiple workers process jobs in parallel |
| 🔐 API Key Auth | Gateway enforces key-based authentication |
| 🧩 Microservices | Each concern is a separate, independently runnable service |

---

## Concepts Demonstrated

CloudFunc is a learning-oriented project that showcases key **distributed systems** concepts:

- **Microservices architecture** — loosely coupled services with single responsibilities
- **Asynchronous job processing** — decoupled request handling via message queues
- **Queue-based load leveling** — RabbitMQ buffers work during traffic spikes
- **Container lifecycle management** — spinning up, reusing, and tearing down execution environments
- **Scalable worker pools** — horizontal scaling through parallel worker processes

---

<div align="center">
  <sub>Built with ❤️ · CloudFunc · Group B</sub>
</div>
````

# CloudFunc Gateway Service

The **Gateway Service** is the **API entry point** for the CloudFunc platform.  
It receives client requests, validates them, communicates with the **Function Registry**, and dispatches execution jobs to **RabbitMQ** for asynchronous processing by worker nodes.

This service acts as the **public interface of the system**, handling authentication, request validation, and job submission.

---

# Overview

The gateway provides a REST API that allows clients to:

- Invoke registered cloud functions
- Track execution status of jobs
- Authenticate requests using an API key

It integrates with the following components:

- **Function Registry** – verifies whether a function exists and stores job metadata
- **RabbitMQ Queue** – distributes execution jobs to workers
- **Worker Processes** – consume jobs from the queue and execute functions

---

# System Architecture
Client-> Gateway Service (Port 3000)-> RabbitMQ Queue->Workers->Container Manager->Docker Container (Function Execution)


---

# Architecture Flow

1. Client sends a request to invoke a function.
2. Gateway verifies the API key.
3. Gateway checks the **Function Registry** to ensure the function exists.
4. A job entry is created in the registry database.
5. The job is pushed to the **RabbitMQ queue**.
6. A worker consumes the job from the queue.
7. The worker executes the function using the execution service.
8. The worker updates the job status in the registry.
9. The client can check the job status using the job ID.

---

# Environment Variables

Create a `.env` file and configure the following variable:

GATEWAY_API_KEY=your_secret_api_key

Every request must include the API key in the header:

X-API-Key: your_secret_api_key

---

# Configuration
PORT = 3000

REGISTRY_URL = http://localhost:4000

RABBITMQ_URL = amqp://localhost

QUEUE_NAME = executions

---

# Dependencies

The service uses the following Node.js packages:

- **express** – REST API server
- **axios** – HTTP client for communicating with the Function Registry
- **amqplib** – RabbitMQ messaging library
- **uuid** – generates unique job IDs

Install dependencies using:
npm install

---

# RabbitMQ Setup

RabbitMQ must be running before starting the gateway.

You can run RabbitMQ using Docker:
docker run -p 5672:5672 rabbitmq

The gateway publishes jobs to the queue: executions

---

Navigate to the gateway directory: cd gateway

Start the service: node gateway.js

The server will start on: http://localhost:3000

---

# API Endpoints

---

# Health Check

Endpoint:
GET /

Response:

```json
Gateway Service is running
```
## Invoke Function
Endpoint
```
POST /invoke
```
Headers:
```
Content-Type: application/json
X-API-Key: <your_api_key>
```
Request Body:
```
{
  "function_name": "exampleFunction",
  "payload": {
    "data": "sample input"
  }
}
```
Response (202 Accepted):
```
{
  "jobId": "generated-uuid"
}
```
## Get Job Status
Endpoint:
```
GET /jobs/:jobId
```
Headers:
```
X-API-Key: <your_api_key>
```
Example Response:
```
{
  "jobId": "12345",
  "function_name": "exampleFunction",
  "status": "completed",
  "result": "output data"
}
```
## Job Lifecycle
A job moves through the following states:

queued → running → completed

The gateway creates the job with status queued.

Workers execute the function and update the job status.

The registry stores the final result.

## Error Handling
Possible error responses include:

**401 Unauthorized**: Invalid or missing API key.

**400 Bad Request**: Missing function_name or payload.

**404 Not Found**: Job ID does not exist.

**500 Internal Server Error**: Gateway or registry communication failure.

## Role in CloudFunc System
The gateway is responsible for:

-Handling incoming client requests

-Authenticating API calls

-Validating function invocation requests

-Communicating with the Function Registry

-Publishing execution jobs to RabbitMQ

-Providing job status tracking

-This service enables asynchronous and scalable function execution within the CloudFunc platform.



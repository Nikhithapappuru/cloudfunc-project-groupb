# 🚀 CloudFunc — Gateway Service

The **Gateway Service** is the public-facing API entry point for the CloudFunc platform. It authenticates requests, validates function invocations, and dispatches asynchronous execution jobs to worker nodes via RabbitMQ.

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Configuration](#configuration)
- [Running the Service](#running-the-service)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [Invoke a Function](#invoke-a-function)
  - [Get Job Status](#get-job-status)
- [Job Lifecycle](#job-lifecycle)
- [Error Responses](#error-responses)
- [Role in the CloudFunc System](#role-in-the-cloudfunc-system)

---

## Overview

The Gateway Service provides a REST API for clients to:

- **Invoke** registered cloud functions
- **Track** asynchronous job execution status
- **Authenticate** via API key

It integrates with:

- **Function Registry** — verifies that a function exists and stores job metadata
- **RabbitMQ** — distributes execution jobs to worker nodes
- **Worker Processes** — consume and execute jobs, then report results back to the registry

---

## System Architecture

```
Client
  │
  ▼
Gateway Service (Port 3000)
  │
  ├──► Function Registry (validates function, stores job)
  │
  └──► RabbitMQ Queue
             │
             ▼
          Workers
             │
             ▼
      Container Manager
             │
             ▼
    Docker Container (Function Execution)
```

### Architecture Flow

1. Client sends a function invocation request to the Gateway.
2. Gateway validates the **API key**.
3. Gateway queries the **Function Registry** to confirm the function exists.
4. Gateway creates a job entry in the registry with status `queued`.
5. Gateway publishes the job to the **RabbitMQ** `executions` queue.
6. A **Worker** picks up the job from the queue.
7. Worker executes the function using the execution service.
8. Worker updates the job status in the **Function Registry**.
9. Client polls the Gateway for the job result using the returned `jobId`.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [RabbitMQ](https://www.rabbitmq.com/) running on `amqp://localhost`
- **Function Registry** service running on `http://localhost:4000`

You can run RabbitMQ via Docker:

```bash
docker run -p 5672:5672 rabbitmq
```

### Installation

```bash
# Navigate to the gateway directory
cd gateway

# Install dependencies
npm install
```

**Dependencies used:**

| Package    | Purpose                                        |
|------------|------------------------------------------------|
| `express`  | REST API server                                |
| `axios`    | HTTP client for Function Registry communication |
| `amqplib`  | RabbitMQ messaging                             |
| `uuid`     | Unique job ID generation                       |

### Environment Variables

Create a `.env` file in the `gateway/` directory:

```env
GATEWAY_API_KEY=your_secret_api_key
```

Every request must include this key in the header:

```
X-API-Key: your_secret_api_key
```

### Configuration

| Variable       | Default                 | Description                        |
|----------------|-------------------------|------------------------------------|
| `PORT`         | `3000`                  | Port the gateway listens on        |
| `REGISTRY_URL` | `http://localhost:4000` | URL of the Function Registry       |
| `RABBITMQ_URL` | `amqp://localhost`      | RabbitMQ connection URL            |
| `QUEUE_NAME`   | `executions`            | Name of the RabbitMQ queue         |

---

## Running the Service

```bash
node gateway.js
```

The server will start at: **http://localhost:3000**

> ⚠️ Make sure RabbitMQ and the Function Registry are running before starting the gateway.

---

## API Reference

### Health Check

Confirms the service is up and running.

```
GET /
```

**Response:**

```
200 OK

Gateway Service is running
```

---

### Invoke a Function

Submits a function invocation job for asynchronous execution.

```
POST /invoke
```

**Headers:**

```
Content-Type: application/json
X-API-Key: <your_api_key>
```

**Request Body:**

```json
{
  "function_name": "exampleFunction",
  "payload": {
    "data": "sample input"
  }
}
```

**Response — `202 Accepted`:**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000"
}
```

Use the returned `jobId` to poll for the job result.

---

### Get Job Status

Retrieves the current status and result of a submitted job.

```
GET /jobs/:jobId
```

**Headers:**

```
X-API-Key: <your_api_key>
```

**Response — `200 OK`:**

```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "function_name": "exampleFunction",
  "status": "completed",
  "result": "output data"
}
```

---

## Job Lifecycle

A job transitions through the following states:

```
queued  ──►  running  ──►  completed
```

| State       | Set By   | Description                                     |
|-------------|----------|-------------------------------------------------|
| `queued`    | Gateway  | Job created and pushed to RabbitMQ              |
| `running`   | Worker   | Job picked up and execution has started         |
| `completed` | Worker   | Function executed and result stored in registry |

---

## Error Responses

| Status Code | Reason                                                  |
|-------------|---------------------------------------------------------|
| `401`       | Missing or invalid `X-API-Key` header                   |
| `400`       | Missing `function_name` or `payload` in request body    |
| `404`       | Job ID not found in the registry                        |
| `500`       | Internal error — gateway or registry communication failure |

---

## Role in the CloudFunc System

The Gateway Service is the **sole public interface** of the CloudFunc platform. It is responsible for:

- Accepting and authenticating incoming client requests
- Validating function invocation inputs
- Communicating with the Function Registry to verify functions and store job metadata
- Publishing execution jobs to RabbitMQ for asynchronous worker consumption
- Exposing job status endpoints for clients to track execution progress

This design enables **scalable, decoupled, asynchronous** function execution across the CloudFunc platform.

# Cloudfunc-Project-GroupB
CloudFunc is a **mini serverless backend platform** that enables users to register and invoke functions without managing servers.
The platform executes functions asynchronously using **message queues and worker processes**, similar to modern serverless platforms like AWS Lambda.
The system is designed using **microservices architecture**, containerized execution environments, and a job queue to support scalable and reliable function execution.

## Table of Contents
Overview

System Architecture

Services

Request Flow

Technology Stack

Project Structure

Installation

Environment Configuration

Running the System

API Documentation

Database Schema

Future Improvements

## Overview
CloudFunc allows users to:

-Register cloud functions

-Invoke functions asynchronously

-Execute functions in containerized environments

-Track job status and retrieve results

Instead of executing functions directly, requests are queued and processed by worker processes, ensuring scalability and fault tolerance.

## System Architecture
Client -> Gateway Service -> RabbitMQ Queue -> Worker Processes -> Container Manager -> Function Runner -> Function Registry (PostgreSQL)

## Services
## 1. Gateway Service

The Gateway Service acts as the entry point for all client requests.

**Responsibilities**:
-API-key authentication

-Function invocation

-Job creation

-Sending execution requests to RabbitMQ

-Providing job status APIs

Port: **3000**


## 2. Function Registry Service

The Function Registry manages metadata and job records.

**Responsibilities**:

-Register functions

-Store job information

-Track job execution status

-Store execution results

Port: **4000**

Database: PostgreSQL

## 3. RabbitMQ Queue
RabbitMQ acts as a message broker between the gateway and workers.

**Responsibilities:**

-Queue execution jobs

-Handle asynchronous processing

-Buffer requests during high traffic

Queue Name: executions

## 4. Worker Manager
Workers continuously listen to the queue and process jobs.

**Responsibilities:**

-Fetch jobs from RabbitMQ

-Send execution requests to the container manager

-Update job results in the registry

-Handle retries on failure

-Multiple workers run in parallel to increase throughput.

## 5. Container Manager
The Container Manager controls the execution environment.

**Responsibilities:**

-Start containers for functions

-Reuse warm containers

-Remove idle containers

-Forward execution requests to the runner

Port: **3001**

## 6. Function Runner
The Function Runner is responsible for executing function logic.

**Responsibilities:**

-Execute the function code

-Measure execution time

-Return result or error

Port: **4001**

## Request Flow
**1. Function Invocation**

A client sends a request to invoke a function.

POST /invoke

Example:
```json
"function_name": "addNumbers", "payload": { "a": 5, "b": 10 } 
```
**2. Gateway Processing**

The gateway:

-Verifies the API key

-Checks if the function exists

-Creates a job in the registry

-Sends the job to RabbitMQ

## 3. Job Queue
The job is placed in the RabbitMQ queue.

Example message:
```json
{
  "jobId": "uuid",
  "functionName": "addNumbers",
  "payload": {
    "a": 5,
    "b": 10
  }
}
```
## 4. Worker Processing
Workers consume jobs from the queue and send execution requests to the container manager.

## 5. Container Execution
The container manager:

-Starts or reuses a container

-Sends the request to the function runner

## 6. Function Execution
The runner executes the function logic and returns the result.

Example response:
```json
{
  "success": true,
  "result": 15,
  "executionTime": "2ms"
}
```

## 7. Job Completion
The worker updates the registry with:

-job status

-result

-error (if any)

Users can retrieve the result using the job ID.

## Technology Stack
**Backend:**

-Node.js

-Express.js

**Messaging:**

-RabbitMQ

**Database:**

PostgreSQL

**Containerization:**

-Docker

-Libraries:

-axios

-amqplib

-uuid

-pg

## Installation
**Prerequisites**

Install the following:

-Node.js

-Docker

-PostgreSQL

-RabbitMQ

## Environment Configuration
Create a .env file for the gateway service:
```
GATEWAY_API_KEY=your_secret_key
```
## Running the System
Start services in the following order.

## 1. Start PostgreSQL
```
sudo service postgresql start
```
## 2. Start RabbitMQ
```
rabbitmq-server
```
## 3. Start Function Registry
```
node registry.js
```
Runs on: **http://localhost:4000**

## 4. Start Function Runner
```
node runner.js
```
Runs on: **http://localhost:4001**

## 5. Start Container Manager
```
node manager.js
```
Runs on: **http://localhost:3001**

## 6. Start Workers
```
node worker.js
```

Workers start automatically.

## 7. Start Gateway Service
```
node gateway.js
```
Runs on: **http://localhost:3000**

## API Documentation
***Health Check***

GET /

Response:
Gateway Service is running

***Invoke Function***

POST /invoke

Headers:
```
X-API-Key: your_api_key
```
Body:
```json
{
  "function_name": "addNumbers",
  "payload": {
    "a": 1,
    "b": 2
  }
}
```
Response:
```json
{
  "jobId": "uuid"
}
```
***Get Job Status***

GET /jobs/:jobId

Headers:
```json
X-API-Key: your_api_key
```
Response:
```json
{
  "job_id": "...",
  "status": "completed",
  "result": 3
}
```
***Register Function***

POST /registerFunction

Body:
```json
{
  "name": "addNumbers",
  "owner": "user1",
  "image": "node-add:v1"
}
```

## Database Schema

**Table:** `functions`

| Column | Description |
|------|------------|
| id | Unique function ID (auto-generated) |
| name | Name of the function |
| owner | Owner of the function |
| image | Docker image name |
| created_at | Timestamp when function was registered |


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

## Key Features

Serverless function execution

Microservices architecture

Asynchronous job processing

Worker-based execution model

Container reuse with warm container pools

Fault-tolerant job processing

Scalable queue-based architecture

## Summary
CloudFunc is a **serverles**s execution platform that demonstrates how modern cloud providers execute functions on demand using queues, workers, and containerized environments.

It highlights key distributed systems concepts including:

microservices

asynchronous processing

job queues

container management

scalable backend architecture

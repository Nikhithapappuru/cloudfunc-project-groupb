
# Gateway Service – CloudFunc (Phase 2)

This project implements the **Gateway Service**, which acts as an entry point for invoking serverless functions in **Phase 2 of the CloudFunc project**.

The Gateway’s primary role is to **authenticate requests, validate inputs, and forward function invocation requests** to the appropriate container runtime after consulting the Function Registry Service.

---

## Role & Scope

**Role:** Junior 2 – Gateway Integration  

This service is responsible for:
- Receiving function invocation requests
- Interacting with the Function Registry to fetch function metadata
- Forwarding requests to the appropriate container runtime

---

## What This Service Does

- Runs an HTTP server using Express.js
- Accepts invocation requests via POST /invoke
- Calls the Function Registry Service to:
  - Verify whether a function exists
  - Retrieve the container image associated with the function
- Forwards the request payload to the container runtime
- Returns the execution result to the client

---

## API Endpoints

### Invoke a Function

**Endpoint:**  
POST /invoke

**Request Body (JSON):**
```json
{
  "function_name": "helloFunction",
  "payload": {
    "param1": "value1",
    "param2": "value2"
  }
}
```
Successful Response:
```json
{
  "function": "helloFunction",
  "result": {
    "output": "Hello World",
    "status": "success"
  }
}
```
Error Responses:
Missing parameters:
```json
{
  "error": "function_name and payload are required"
}
```
Status Code: 400
Function not found in registry:
```json
{
  "error": "Function exists but container image not found"
}
```
Health Check
Endpoint:
GET /
Response:
```json
Gateway Service is running
```
## How the Service Works
JWT Verification: Placeholder middleware checks authentication.
Input Validation: Ensures function_name and payload are present.
Registry Lookup: Queries the Function Registry at /function/:name to fetch the container image.
Container Invocation: Forwards the request payload to the container runtime at /execute along with the image name.
Response Handling: Returns the execution result or an error to the client.

## How the Service Works
1. JWT Verification: Placeholder middleware checks authentication.
2. Input Validation: Ensures function_name and payload are present.
3. Registry Lookup: Queries the Function Registry at /function/:name to fetch the container image.
4. container Invocation: Forwards the request payload to the container runtime at /execute along with the image name.
5. Response Handling: Returns the execution result or an error to the client.

## Technologies Used
Node.js
Express.js
Axios (for HTTP calls)
Function Registry Service
Container Runtime (for executing functions)
Postman (for API testing)

## How to Run the Service
## Prerequisites:
Node.js installed
Function Registry Service running on port 4000
Container Runtime running on port 5000
Steps:
Install dependencies:
```
npm install express axios
```
Run the Gateway Service:
```
node gateway.js
```
Expected output:
```
Gateway Service running on port 3000
```
## Future Enhancements
Proper JWT authentication
Input validation and sanitization
Retry mechanism for container execution
Logging and monitoring
Service-to-service secure communication

Gateway Service – CloudFunc (Phase 1 & Phase 2)
This project implements the Gateway Service, which acts as the entry point for the CloudFunc system.
The Gateway is responsible for receiving function invocation requests from clients and coordinating with backend services to execute them.
It was developed in Phase 1 as a basic request-handling service and extended in Phase 2 to integrate with the Function Registry and Container Runtime.
Role & Scope
Role: Junior 1 – Gateway Service
This service was developed independently as part of Phase 1, and later integrated with other services in Phase 2 to enable end-to-end function invocation.
What This Service Does
Runs an HTTP server using Express
Accepts function invocation requests from clients
Validates request structure
Communicates with the Function Registry Service to fetch function metadata
Forwards execution requests to the Container Runtime
Returns execution results back to the client
API Endpoint
Invoke a Function
Endpoint:
POST /invoke
Request Body (JSON):
{
  "function_name": "helloFunction",
  "payload": {
    "x": 10,
    "y": 20
  }
}
Response (Example):
{
  "message": "Function invoked successfully",
  "result": {
    "output": "Hello World"
  }
}
Execution Flow
Client sends a request to the Gateway with:
Function name
Input payload
Gateway calls the Function Registry Service to:
Check if the function exists
Retrieve the container image name
If the function exists:
Gateway forwards the request and payload to the Container Runtime
The execution result is returned back through the Gateway to the client.
Error Handling
The Gateway returns appropriate errors for:
Missing or invalid request body
Function not found in the registry
Failure in backend services
Example error response:
{ "error": "Function not found" }
Status Code: 404
Service Ports
Gateway Service: 3000
Function Registry Service: 4000
Container Runtime: 5000
Technologies Used
Node.js
Express.js
Axios (for service-to-service communication)
Docker
Postman (for API testing)
How to Run the Service
Prerequisites
Node.js installed
Docker Desktop installed and running
Function Registry Service running
Step 1: Install Dependencies
npm install express axios
Step 2: Run the Server
node index.js
Expected Output:
Gateway Service running on port 3000
Testing the API
APIs were tested using Postman.
POST /invoke → Invokes a registered function via the Gateway
Requires the function to be already registered in the Function Registry
Phase 2 – Integration Summary
In Phase 2, the Gateway acts as the orchestrator between client requests and backend services.
It integrates with:
Function Registry for function metadata lookup
Container Runtime for executing the function
The Gateway itself does not store function data or execute code directly.
Future Enhancements
Authentication and authorization
Request rate limiting
Async invocation support
Better error propagation
Logging and monitoring

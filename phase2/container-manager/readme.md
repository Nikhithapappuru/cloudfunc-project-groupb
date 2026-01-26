# Container Manager Service (Junior 3)

This service is part of Phase 1 of the CloudFunc project.
The Container Manager is responsible for dynamically creating, running, and removing Docker containers.

It demonstrates the core concept of CloudFunc: container lifecycle management.

---

## Responsibilities

- Expose an API endpoint to spawn a test container
- Create a Docker container dynamically
- Run a simple command inside the container
- Automatically stop and remove the container after execution

---

## Requirements

- Node.js installed
- Docker Desktop installed and running
- Internet connection (to pull Docker images)

Install required dependencies:

npm install express dockerode

---

## How to Run

Start Docker Desktop and make sure Docker is running.

Run the service:

node manager.js

The service will start on port 4000.

---

## How to Test (Using Browser)

Open the following URL in the browser:

http://localhost:4000/spawnTestContainer

---

## Expected Output

Browser output:

Container executed and removed successfully

Terminal output:

Container Manager running on port 4000

---

## Verification

To verify that the container was removed automatically, run:

docker ps -a

The test container should not be listed.

---

## Project Structure

container-manager/
manager.js
README.md

---

## Notes

- The service uses Docker SDK (dockerode) to manage containers.
- The Alpine image is used for testing.
- Containers are temporary and are removed after execution.
- This service works independently and is not integrated with other CloudFunc services in Phase 1.

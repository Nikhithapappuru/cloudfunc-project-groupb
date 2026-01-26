// Import required modules
const express = require("express");
const { exec } = require("child_process"); 
// exec allows us to run docker commands from Node.js

const app = express();
app.use(express.json()); // Parse JSON body

// Port where Junior 3 service runs
const PORT = 9000;

// Fixed port where Function Runner listens
const FUNCTION_PORT = 5050;

// API to start container if not already running
app.post("/start-container", (req, res) => {

    // Image name sent by Junior 4
    const { image } = req.body;
  
    // Validation
    if (!image) {
      return res.status(400).json({ error: "Image name required" });
    }
    // Check if any container is already running using this image
    const checkCmd =
        `docker ps --filter "ancestor=${image}" --format "{{.ID}}"`;

    exec(checkCmd, (err, stdout) => {

    // If docker command fails
        if (err) {
        return res.status(500).json({ error: "Docker error" });
        }

            // If container already exists, reuse it
        if (stdout.trim()) {
            return res.json({ status: "already running" });
        }
            // If container is NOT running → start new container
        const runCmd =
            `docker run -d -p ${FUNCTION_PORT}:${FUNCTION_PORT} ${image}`;

        exec(runCmd, err2 => {

            if (err2) {
            return res
                .status(500)
                .json({ error: "Container start failed" });
            }

        // Success response
            res.json({ status: "container started" });
        });
    });
});    

// Start Junior 3 server
app.listen(PORT, () => {
    console.log(`Junior 3 running on port ${PORT}`);
  });
  

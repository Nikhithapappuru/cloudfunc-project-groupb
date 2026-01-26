const express = require("express");
const axios = require("axios"); 
// axios is used to make HTTP requests

const app = express();
app.use(express.json());

// Ports
const PORT = 6000;           // Junior 4 runs here
const J3_PORT = 9000;        // Junior 3 service
const FUNCTION_PORT = 5050;  // Function Runner

// Execute API
app.post("/execute", async (req, res) => {

    // Image name + input data
    const { image, payload } = req.body;
  
    // Validation
    if (!image) {
      return res.status(400).json({ error: "Image required" });
    }
    try {
        // Step 1: Ask Junior 3 to ensure container is running
        await axios.post(
          `http://localhost:${J3_PORT}/start-container`,
          { image }
        );
            // Step 2: Send payload to Function Runner container
        const response = await axios.post(
            `http://localhost:${FUNCTION_PORT}/run`,
            payload
        );
            // Step 3: Return result to Gateway
        res.json({
            success: true,
            result: response.data
        });
    
    } catch (err) {
                // Error handling
        res.status(500).json({
            success: false,
            error: "Execution failed"
        });
    }
});

// Start Junior 4 server
app.listen(PORT, () => {
    console.log(`Junior 4 running on port ${PORT}`);
});
  
  
  
  

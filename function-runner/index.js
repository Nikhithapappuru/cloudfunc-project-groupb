const express = require("express");

const app = express();
app.use(express.json());

// Fixed port (important)
const PORT = 5050;

// Actual function endpoint
app.post("/run", (req, res) => {

    // Example input
    const { a, b } = req.body;
  
    // Business logic
    const result = a + b;
  
    // Send output
    res.json({ result });
});

// Start function runner
app.listen(PORT, () => {
    console.log(`Function Runner running on port ${PORT}`);
});
  

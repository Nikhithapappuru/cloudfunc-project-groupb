const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

app.use(express.json());

// JWT middleware placeholder
function verifyJWT(req, res, next) {
  console.log("JWT verification placeholder");
  next();
}

app.post("/invoke", verifyJWT, async (req, res) => {
  try {
    const { function_name, payload } = req.body;

    if (!function_name || payload === undefined) {
      return res.status(400).json({
        error: "function_name and payload are required"
      });
    }

    console.log("Invoke request received:", function_name);

    // Call Function Registry
    const registryResponse = await axios.get(
      `http://localhost:4000/function/${function_name}`
    );

    const imageName = registryResponse.data.container_image;

    if (!imageName) {
      return res.status(404).json({
        error: "Function exists but container image not found"
      });
    }

    console.log("Resolved container image:", imageName);

    // Forward request to container runtime
    const containerResponse = await axios.post(
      "http://localhost:5000/execute",
      {
        image: imageName,
        payload
      }
    );

    return res.status(200).json({
      function: function_name,
      result: containerResponse.data
    });

  } catch (error) {
    console.error("Gateway error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data
      });
    }

    return res.status(500).json({
      error: "Internal Gateway Error"
    });
  }
});

app.get("/", (req, res) => {
  res.send("Gateway Service is running");
});

app.listen(PORT, () => {
  console.log(`Gateway Service running on port ${PORT}`);
});

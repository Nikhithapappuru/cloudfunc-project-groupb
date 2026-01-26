const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Placeholder JWT verification function
function verifyJWT(req, res, next) {
  console.log("JWT verification placeholder called");
  next(); // allow request to continue
}

// POST /invoke route
app.post("/invoke", async (req, res) => {

  const { functionName, input } = req.body;

  if (!functionName || !input) {
    return res.status(400).send("Missing functionName or input");
  }

  console.log("Incoming invoke request:");
  console.log(req.body);

  try {

    const registryResponse = await axios.get(
      `http://localhost:4000/function/${functionName}`
    );

    const functionData = registryResponse.data;

    console.log("Function metadata received from Registry:");
    console.log(functionData);

    res.json({
      message: "Gateway processed request successfully",
      function: functionData,
      inputReceived: input
    });

  } catch (error) {

    console.error(error.message);

    res.status(500).send("Error communicating with Function Registry");
  }

});

// Start server
app.listen(PORT, () => {
  console.log("Gateway Service running on port", PORT);
});

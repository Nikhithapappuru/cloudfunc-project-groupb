const express = require("express");

const app = express();
app.use(express.json());

// -----------------------------
// HEALTH CHECK
// -----------------------------

app.get("/health", (req, res) => {
  res.status(200).send("Runner is healthy");
});

// -----------------------------
// FUNCTION EXECUTION
// -----------------------------

app.post("/run", async (req, res) => {

  const startTime = Date.now();

  try {

    const input = req.body;

    // SAMPLE FUNCTION LOGIC (replace later)
    // Example: sum numbers

    const result = input.a + input.b;

    const execTime = Date.now() - startTime;

    res.json({
      success: true,
      result: result,
      error: null,
      executionTime: execTime + "ms"
    });

  } catch (err) {

    const execTime = Date.now() - startTime;

    res.json({
      success: false,
      result: null,
      error: err.message,
      executionTime: execTime + "ms"
    });
  }

});

// -----------------------------
// START RUNNER
// -----------------------------

app.listen(4000, () => {
  console.log("Runner running on port 4000");
});

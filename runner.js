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

    const { code, payload } = req.body;

    const fn = new Function("payload", code);

    const result = fn(payload);

    const execTime = Date.now() - startTime;

    res.json({
      success: true,
      result,
      error: null,
      executionTime: execTime + "ms"
    });

  } catch (err) {

    res.json({
      success: false,
      result: null,
      error: err.message
    });
  }

});

// -----------------------------
// START RUNNER
// -----------------------------

app.listen(4001, () => {
  console.log("Runner running on port 4001");
});

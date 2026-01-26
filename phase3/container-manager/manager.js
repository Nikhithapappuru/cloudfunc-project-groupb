const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// -----------------------------
// WARM CONTAINER POOL
// -----------------------------

// functionName -> containerId
const containerPool = new Map();

// containerId -> lastUsedTime
const lastUsed = new Map();

// -----------------------------
// START CONTAINER
// -----------------------------

function startContainer(functionName) {

  return new Promise((resolve) => {

    // Fake container id for now
    if (containerPool.has(functionName)) {

      const cid = containerPool.get(functionName);

      console.log("Reusing warm container:", cid);

      lastUsed.set(cid, Date.now());

      return resolve(cid);
    }

    const fakeContainerId = "local-runner";

    console.log("Using local runner as container");

    containerPool.set(functionName, fakeContainerId);
    lastUsed.set(fakeContainerId, Date.now());

    resolve(fakeContainerId);
  });
}



// -----------------------------
// CLEANUP IDLE CONTAINERS
// -----------------------------

setInterval(() => {

  console.log("Running cleanup job...");

  for (let [fn, cid] of containerPool.entries()) {

    const last = lastUsed.get(cid);

    const idleTime = Date.now() - last;

    if (idleTime > 5 * 60 * 1000) { // 5 minutes

      console.log("Removing idle container:", cid);

      exec(`docker stop ${cid}`);
      exec(`docker rm ${cid}`);

      containerPool.delete(fn);
      lastUsed.delete(cid);
    }
  }

}, 60 * 1000); // Every 1 minute

// -----------------------------
// EXECUTE FUNCTION API
// -----------------------------

app.post("/execute", async (req, res) => {

  const { functionName, payload } = req.body;

  try {

    const containerId = await startContainer(functionName);

    const runnerURL = `http://localhost:4000/run`; 
    // assuming runner exposed on 4000

    // TIMEOUT CONFIG (30 seconds)
    const response = await axios.post(
      runnerURL,
      payload,
      { timeout: 30000 }
    );

    lastUsed.set(containerId, Date.now());

    res.json(response.data);

  } catch (err) {

    console.log("Execution timeout or error");

    res.status(500).json({
      success: false,
      error: "Function execution timeout",
    });
  }

});

// -----------------------------
// START SERVER
// -----------------------------

app.listen(3000, () => {
  console.log("Container Manager running on port 3000");
});

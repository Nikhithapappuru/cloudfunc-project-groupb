const express = require("express");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// ---------------- CONFIG ----------------

const REGISTRY_URL = "http://localhost:4000";

// ---------------- WARM CONTAINER POOL ----------------

const containerPool = new Map(); // functionName -> containerId
const lastUsed = new Map(); // containerId -> timestamp

// ---------------- CHECK CONTAINER RUNNING ----------------

function isContainerRunning(containerId) {

  return new Promise((resolve) => {

    exec(
      `docker inspect -f "{{.State.Running}}" ${containerId}`,
      (err, stdout, stderr) => {

        if (err) {
          return resolve(false);
        }

        resolve(stdout.trim() === "true");
      }
    );

  });

}

// ---------------- EXECUTE FUNCTION INSIDE CONTAINER ----------------

function executeInContainer(containerId, payload) {

  return new Promise((resolve, reject) => {

    const payloadStr = JSON.stringify(payload).replace(/"/g, '\\"');

    const cmd = `docker exec ${containerId} node function.js "${payloadStr}"`;

    exec(cmd, (err, stdout, stderr) => {

      if (err) {

        console.error("Docker execution error:", stderr);

        return reject(err);
      }

      try {

        const parsed = JSON.parse(stdout);

        resolve(parsed);

      } catch (e) {

        console.error("Invalid JSON output:", stdout);

        reject(e);
      }

    });

  });

}

// ---------------- START CONTAINER ----------------

async function startContainer(functionName, image, payload) {

  return new Promise(async (resolve, reject) => {

    // Check if warm container exists
    if (containerPool.has(functionName)) {

      const cid = containerPool.get(functionName);

      const running = await isContainerRunning(cid);

      if (running) {

        console.log("Reusing warm container:", cid);

        lastUsed.set(cid, Date.now());

        try {

          const result = await executeInContainer(cid, payload);

          return resolve(result);

        } catch (err) {

          return reject(err);
        }

      } else {

        console.log("Container stopped, removing:", cid);

        exec(`docker rm ${cid}`);

        containerPool.delete(functionName);
        lastUsed.delete(cid);
      }
    }

    // ---------------- START NEW CONTAINER ----------------

    console.log("Starting new container for:", functionName);

    exec(
      `docker run -d --entrypoint sleep ${image} infinity`,
      async (err, stdout, stderr) => {

        if (err) {

          console.error("Container start failed:", err);

          return reject(err);
        }

        const containerId = stdout.trim();

        containerPool.set(functionName, containerId);
        lastUsed.set(containerId, Date.now());

        try {

          const result = await executeInContainer(containerId, payload);

          resolve(result);

        } catch (e) {

          reject(e);
        }

      }
    );

  });

}

// ---------------- CLEANUP IDLE CONTAINERS ----------------

setInterval(() => {

  console.log("Running cleanup job...");

  for (let [fn, cid] of containerPool.entries()) {

    const last = lastUsed.get(cid);

    const idleTime = Date.now() - last;

    if (idleTime > 5 * 60 * 1000) {

      console.log("Removing idle container:", cid);

      exec(`docker stop ${cid}`);
      exec(`docker rm ${cid}`);

      containerPool.delete(fn);
      lastUsed.delete(cid);
    }

  }

}, 60000);


// ---------------- EXECUTE FUNCTION ----------------

app.post("/execute", async (req, res) => {

  try {

    const { functionName, payload } = req.body;

    if (!functionName) {

      return res.status(400).json({
        success: false,
        error: "functionName required"
      });

    }

    // Get function metadata from registry
    const fn = await axios.get(`${REGISTRY_URL}/function/${functionName}`);

    const image = fn.data.image;

    const result = await startContainer(functionName, image, payload);

    res.json({
      success: true,
      result: result.result,
      error: null
    });

  } catch (err) {

    console.error("Execution error:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });

  }

});

// ---------------- HEALTH CHECK ----------------

app.get("/health", (req, res) => {
  res.send("Container Manager Healthy");
});

// ---------------- START SERVER ----------------

app.listen(3001, () => {
  console.log("Container Manager running on port 3001");
});
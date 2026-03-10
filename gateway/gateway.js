const express = require("express");
const axios = require("axios");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

// ---------- CONFIG ----------
const REGISTRY_URL = "http://localhost:4000";
const RABBITMQ_URL = "amqp://localhost";
const QUEUE_NAME = "executions";

// ---------- MIDDLEWARE ----------
app.use(express.json());

function verifyAPIKey(req, res, next) {
  const apiKey = req.header("X-API-Key");
  const expectedKey = process.env.GATEWAY_API_KEY;

  if (!expectedKey) {
    console.error("GATEWAY_API_KEY not set");
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}

// ---------- RABBITMQ ----------
let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("✅ Connected to RabbitMQ");
  } catch (err) {
    console.error("❌ RabbitMQ connection failed:", err.message);
    process.exit(1);
  }
}

connectRabbitMQ();

// ---------- ROUTES ----------

// Health check
app.get("/", (req, res) => {
  res.send("Gateway Service is running");
});

// INVOKE FUNCTION (ASYNC)
app.post("/invoke", verifyAPIKey, async (req, res) => {
  try {
    const { function_name, payload } = req.body;

    if (!function_name || payload === undefined) {
      return res.status(400).json({
        error: "function_name and payload are required"
      });
    }

    const jobId = uuidv4();
    console.log("Invoke request:", function_name, "JobID:", jobId);

    // 1. Check function exists in registry
    await axios.get(`${REGISTRY_URL}/function/${function_name}`);

    // 2. Create job in registry
    await axios.post(`${REGISTRY_URL}/jobs`, {
      jobId,
      function_name: function_name,
      payload,
      status: "queued"
    });

    // 3. Publish job to RabbitMQ
    const message = {
      jobId,
      functionName: function_name,
      payload
    };

    channel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    // 4. Respond immediately
    return res.status(202).json({ jobId });

  } catch (error) {
  console.error("FULL ERROR:", error);

  if (error.response) {
    console.error("Registry Response Data:", error.response.data);
    console.error("Registry Status:", error.response.status);

    return res.status(error.response.status).json({
      error: error.response.data
    });
  }

  return res.status(500).json({
    error: "Internal Gateway Error"
  });
}
});

// GET JOB STATUS
app.get("/jobs/:jobId", verifyAPIKey, async (req, res) => {
  try {
    const { jobId } = req.params;

    const response = await axios.get(
      `${REGISTRY_URL}/jobs/${jobId}`
    );

    return res.status(200).json(response.data);

  } catch (error) {
    return res.status(404).json({
      error: "Job not found"
    });
  }
});

// ---------- START SERVER ----------
app.listen(PORT, () => {
  console.log(`🚀 Gateway Service running on port ${PORT}`);
});

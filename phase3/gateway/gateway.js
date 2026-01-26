const express = require("express");
const amqp = require("amqplib");

const app = express();
app.use(express.json());

const QUEUE = "cloudfunc_jobs";

let channel;

// --------------------
// CONNECT TO RABBITMQ
// --------------------

async function connectQueue() {

  const connection = await amqp.connect("amqp://localhost");

  channel = await connection.createChannel();

  await channel.assertQueue(QUEUE);

  console.log("Gateway connected to RabbitMQ");
}

connectQueue();

// --------------------
// INVOKE FUNCTION API
// --------------------

app.post("/invoke", async (req, res) => {

  const job = {
    functionName: req.body.functionName,
    payload: req.body.payload
  };

  channel.sendToQueue(
    QUEUE,
    Buffer.from(JSON.stringify(job))
  );

  res.json({
    message: "Job submitted successfully"
  });
});

// --------------------

app.listen(5000, () => {
  console.log("Gateway running on port 5000");
});

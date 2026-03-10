const amqp = require("amqplib");
const axios = require("axios");
const { fork } = require("child_process");

const QUEUE = "executions";
const WORKER_COUNT = 3;

// ---------------------------
// MASTER PROCESS
// ---------------------------

if (process.argv[2] !== "child") {

  console.log("Starting Worker Manager...");

  for (let i = 1; i <= WORKER_COUNT; i++) {

    fork(__filename, ["child", `Worker-${i}`]);
  }

  return;
}

// ---------------------------
// CHILD WORKER PROCESS
// ---------------------------

const workerName = process.argv[3];

async function startWorker() {

  const connection = await amqp.connect("amqp://localhost");

  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE);

  console.log(`${workerName} waiting for jobs...`);

  channel.consume(QUEUE, async (msg) => {

    const job = JSON.parse(msg.content.toString());

    console.log(`${workerName} received job:`, job);

    try {

     const response = await axios.post(
      "http://localhost:3001/execute",
      job
    );

    console.log(`${workerName} result:`, response.data);

    // update registry with result
    await axios.patch(
    `http://localhost:4000/jobs/${job.jobId}`,
    {
      status: "completed",
      result: response.data.result
    }
    );

    channel.ack(msg);
  } catch (err) {

      console.log(`${workerName} failed job`, err.message);

      channel.nack(msg,false,false);
    }

  });
}

startWorker();

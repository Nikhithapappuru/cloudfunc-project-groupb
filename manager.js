const express = require("express");
const Docker = require("dockerode");
const axios = require("axios");

const app = express();
const docker = new Docker();

app.use(express.json());

const PORT = 4000;
const FUNCTION_RUNNER_IMAGE = "function-runner";
const FUNCTION_RUNNER_PORT = 5000;

app.post("/execute", async (req, res) => {
  try {
    const inputData = req.body;

    const container = await docker.createContainer({
      Image: FUNCTION_RUNNER_IMAGE,
      ExposedPorts: {
        "5000/tcp": {}
      },
      HostConfig: {
        PortBindings: {
          "5000/tcp": [{ HostPort: "5000" }]
        }
      }
    });

    await container.start();

    await new Promise(resolve => setTimeout(resolve, 2000));

    const response = await axios.post(
      "http://localhost:5000/run",
      inputData
    );

    await container.stop();
    await container.remove();

    res.json({
      status: "success",
      functionOutput: response.data
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Function execution failed");
  }
});

app.listen(PORT, () => {
  console.log(`Container Manager running on port ${PORT}`);
});

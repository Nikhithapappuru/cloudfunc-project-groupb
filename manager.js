const express = require("express");
const Docker = require("dockerode");

const app = express();
const docker = new Docker(); 
const PORT = 4000;

app.get("/spawnTestContainer", async (req, res) => {
  try {
    const container = await docker.createContainer({
      Image: "alpine",
      Cmd: ["echo", "Hello from CloudFunc"],
      Tty: false
    });

    await container.start();

    await container.wait(); 

    await container.remove(); 

    res.send("Container executed and removed successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error running container");
  }
});

app.listen(PORT, () => {
  console.log(`Container Manager running on port ${PORT}`);
});

const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const app = express();
app.use(express.json());

// ---------------- DATABASE ----------------

const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "functionsdb",
  password: "admin123",
  port: 5432,
});

// ---------------- REGISTER FUNCTION ----------------

app.post("/registerFunction", async (req, res) => {

  try {

    const { name, owner, image, code } = req.body;

    if (!name || !image || !code) {
      return res.status(400).json({
        error: "name, image and code are required"
      });
    }

    // Insert function into database
    const result = await pool.query(
      "INSERT INTO functions (name, owner, image, code) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, owner || "admin", image, code]
    );

    // ---------------- BUILD DIRECTORY ----------------

    const buildDir = path.join(__dirname, "..", "temp-build", name);
    fs.mkdirSync(buildDir, { recursive: true });

    // ---------------- CREATE function.js ----------------

    const functionFile = `
const payload = JSON.parse(process.argv[2] || "{}");

function run(payload){
 ${code}
}

let result;

try{
 result = run(payload);
}catch(err){
 console.error(err);
 result = null;
}

console.log(JSON.stringify({result}));
`;

    fs.writeFileSync(path.join(buildDir, "function.js"), functionFile);

    // ---------------- CREATE Dockerfile ----------------

    const dockerfile = `
FROM node:18

WORKDIR /app

COPY function.js .

CMD ["sleep","infinity"]
`;

    fs.writeFileSync(path.join(buildDir, "Dockerfile"), dockerfile);

    // ---------------- BUILD DOCKER IMAGE ----------------

    exec(`docker build -t ${image} ${buildDir}`, (err, stdout, stderr) => {

      if (err) {
        console.error("Docker build failed:", err);
        return;
      }

      console.log("Docker image built:", image);

      // Delete temporary build directory
      fs.rmSync(buildDir, { recursive: true, force: true });

      console.log("Temporary build files deleted");

    });

    res.json({
      message: "Function registered successfully",
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ error: err.message });

  }

});

// ---------------- LIST FUNCTIONS ----------------

app.get("/functions", async (req, res) => {

  try {

    const result = await pool.query("SELECT * FROM functions");

    res.json(result.rows);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ---------------- GET FUNCTION ----------------

app.get("/function/:name", async (req, res) => {

  try {

    const { name } = req.params;

    const result = await pool.query(
      "SELECT name, owner, image, code FROM functions WHERE name=$1",
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Function not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ---------------- CREATE JOB ----------------

app.post("/jobs", async (req, res) => {

  try {

    const { jobId, function_name, payload, status } = req.body;

    const result = await pool.query(
      "INSERT INTO jobs (job_id, function_name, payload, status) VALUES ($1,$2,$3,$4) RETURNING *",
      [jobId, function_name, JSON.stringify(payload), status || "queued"]
    );

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ---------------- GET JOB ----------------

app.get("/jobs/:jobId", async (req, res) => {

  try {

    const { jobId } = req.params;

    const result = await pool.query(
      "SELECT * FROM jobs WHERE job_id=$1",
      [jobId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ---------------- UPDATE JOB ----------------

app.patch("/jobs/:jobId", async (req, res) => {

  try {

    const { jobId } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    for (let key in updates) {

      fields.push(`${key}=$${index}`);

      values.push(
        key === "result" || key === "error"
          ? JSON.stringify(updates[key])
          : updates[key]
      );

      index++;

    }

    values.push(jobId);

    const query = `
      UPDATE jobs
      SET ${fields.join(", ")}
      WHERE job_id=$${index}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

});

// ---------------- START SERVER ----------------

app.listen(4000, () => {
  console.log("Function Registry Service running on port 4000");
});


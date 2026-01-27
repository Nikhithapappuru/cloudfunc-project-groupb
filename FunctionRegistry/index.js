const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());


const pool = new Pool({
  user: "admin",
  host: "localhost",
  database: "functionsdb",
  password: "admin123",
  port: 5432,
});


app.post("/registerFunction", async (req, res) => {
  try {
    const { name, owner, image } = req.body;

    const result = await pool.query(
      "INSERT INTO functions (name, owner, image) VALUES ($1, $2, $3) RETURNING *",
      [name, owner, image]
    );

    res.json({
      message: "Function registered successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/functions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM functions");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("Function Registry Service running on port 4000");
});


app.get("/function/:name", async (req, res) => {
  try {
    const { name } = req.params;

    const result = await pool.query(
      "SELECT name, owner, image FROM functions WHERE name = $1",
      [name]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Function not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const { v4: uuidv4 } = require("uuid");

app.post("/jobs", async (req, res) => {
  try {
    const { functionName, payload } = req.body;

    const jobId = uuidv4();

    const result = await pool.query(
      "INSERT INTO jobs (job_id, function_name, payload, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [jobId, functionName, JSON.stringify(payload), "queued"]
    );

    res.json(result.rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await pool.query(
      "SELECT * FROM jobs WHERE job_id = $1",
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

app.patch("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    for (let key in updates) {
      fields.push(`${key} = $${index}`);
      values.push(
        key === "result" || key === "error"
          ? JSON.stringify(updates[key])
          : updates[key]
      );
      index++;
    }

    values.push(jobId);

    const query = `
      UPDATE jobs SET ${fields.join(", ")}
      WHERE job_id = $${index}
      RETURNING *;
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


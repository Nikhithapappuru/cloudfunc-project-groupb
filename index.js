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

app.listen(3000, () => {
  console.log("Function Registry Service running on port 3000");
});

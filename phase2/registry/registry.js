const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "cloudfunc123",
  database: "cloudfunc",
  port: 5432
});

app.post("/registerFunction", async (req, res) => {
  const { name, owner, image } = req.body;

  if (!name || !owner || !image) {
    return res.status(400).send("Missing fields");
  }

  try {
    const query =
      "INSERT INTO functions (name, owner, image) VALUES ($1, $2, $3)";
    await pool.query(query, [name, owner, image]);

    res.send("Function registered successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/functions", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM functions");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.get("/function/:name", async (req, res) => {
  const functionName = req.params.name;

  try {
    const query = "SELECT * FROM functions WHERE name = $1";
    const result = await pool.query(query, [functionName]);

    if (result.rows.length === 0) {
      return res.status(404).send("Function not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});


app.listen(4000, () => {
  console.log("Function Registry running on port 4000");
});

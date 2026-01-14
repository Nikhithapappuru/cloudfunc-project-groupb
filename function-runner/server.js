const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

app.post("/run", (req, res) => {
  const { operation, a, b, text } = req.body;

  let result;

  if (operation === "add") {
    result = a + b;
  } else if (operation === "uppercase") {
    result = text.toUpperCase();
  } else {
    return res.status(400).json({
      error: "Unsupported operation"
    });
  }

  res.json({
    status: "success",
    output: result
  });
});

app.listen(PORT, () => {
  console.log(`Function Runner listening on port ${PORT}`);
});

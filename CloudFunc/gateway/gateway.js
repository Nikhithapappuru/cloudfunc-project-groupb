const express= require("express");
const app= express();
const PORT=3000;

app.use(express.json());

// Placeholder JWT verification middleware
function verifyJWT(req,res,next) {
    console.log("JWT Verification placeholder");
    next();
}

// Invoke endpoint
app.post("/invoke", verifyJWT, (req,res)=>{
    console.log("Incoming request data:",req.body);
    res.status(200).json({
       message: "gateway request received"
    })
})

// Health check
app.get("/", (req, res) => {
  res.send("Gateway Service is running");
});

//START SERVER
app.listen(PORT, ()=>{
    console.log(`Gateway Service running on port ${PORT}`);
});

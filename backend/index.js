const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const http = require("http");

const MTSRoutes = require("./routes/MTSRoutes");
const PSRoutes = require("./routes/PSRoutes");
const BWRoutes = require("./routes/BWRoutes");
const MBRoutes = require("./routes/MBRoutes");
const RPRoutes = require("./routes/RPRoutes");
const TV5Routes = require("./routes/TV5Routes");
const ABSCBNRoutes = require("./routes/ABSCBNRoutes");
const GMARoutes = require("./routes/GMARoutes");

const app = express();
dotenv.config();

const server = http.createServer(app);

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  console.log(req.path, req.method);
  next();
});

app.use("/api/mt", MTSRoutes);
app.use("/api/ps", PSRoutes);
app.use("/api/bw", BWRoutes);
app.use("/api/mb", MBRoutes);
app.use("/api/rp", RPRoutes);
app.use("/api/tv", TV5Routes)
app.use("/api/abs", ABSCBNRoutes);
app.use("/api/gma", GMARoutes);

server.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);

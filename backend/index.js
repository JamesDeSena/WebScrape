const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const path = require("path");

const routes = {
  mt: require("./routes/MTRoutes"),
  ps: require("./routes/PSRoutes"),
  bw: require("./routes/BWRoutes"),
  mb: require("./routes/MBRoutes"),
  rp: require("./routes/RPRoutes"),
  tv: require("./routes/TV5Routes"),
  abs: require("./routes/ABSCBNRoutes"),
  gma: require("./routes/GMARoutes"),
  inq: require("./routes/InqRoutes"),
  translate: require("./routes/TranslationRoutes"),
  paraphrase: require("./routes/ParaphraseRoutes"),
  gemini: require("./routes/GeminiRoutes"),
};

const app = express();
dotenv.config();

// Update the path to point to the cert directory
const pfxPath = path.join(__dirname, 'cert', '21tJ9tHUVUCrWVF8lM8ypg-main-11a461e6f3331c293bce4defe5f129cdff58531c-temp.pfx');
const passphrase = 'QTAyUtiCdLhaaDK9o1VpTNKS8tOlHS1w/FbGpIhP118=';

const options = {
  pfx: fs.readFileSync(pfxPath),
  passphrase: passphrase,
};

// Middlewares
app.use(express.json());
app.use(cors({
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, " +
    "x-client-key, x-client-token, x-client-secret, Authorization"
  );
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/mt", routes.mt);
app.use("/api/ps", routes.ps);
app.use("/api/bw", routes.bw);
app.use("/api/mb", routes.mb);
app.use("/api/rp", routes.rp);
app.use("/api/tv", routes.tv);
app.use("/api/abs", routes.abs);
app.use("/api/gma", routes.gma);
app.use("/api/inq", routes.inq);
app.use("/api/translate", routes.translate);
app.use("/api/paraphrase", routes.paraphrase);
app.use("/api/gemini", routes.gemini);

// Server setup
const PORT = process.env.PORT || 443;
https.createServer(options, app).listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

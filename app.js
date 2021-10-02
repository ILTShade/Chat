// import
const path = require("path");
const express = require("express");
var fs = require("fs");
var fsr = require("file-stream-rotator");
const morgan = require("morgan");

// init app
const app = express();

// logger
var log_dir = path.join(__dirname, "logs");
fs.existsSync(log_dir) || fs.mkdirSync(log_dir);
var access_log_stream = fsr.getStream({
  date_format: "YYYYMMDD",
  filename: path.join(log_dir, "webchat_%DATE%.log"),
  frequency: "daily",
  verbose: false
});
// morgan.format("webchat", "[webchat] :method :url :status :res[content-length] :response-time ms");
app.use(morgan("combined", {stream: access_log_stream}));

// template and engine
app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "ejs");

// router
app.get('/', (req, res) => {
  res.render("chat", {});
});

// 404 error
app.use("/errors", express.static("errors"));
app.all("*", (req, res) => {
  res.redirect("/errors/404.html")
})

// other error
app.use(function (err, req, res, next){
  console.error(err.stack);
  res.status(500).send("Error");
})

// listen
const server = app.listen(1234, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log(`Server on localhost:${port}`);
});
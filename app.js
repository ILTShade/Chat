// import
const path = require("path");
const express = require("express");
const express_ws = require("express-ws");
const fs = require("fs");
const fsr = require("file-stream-rotator");
const morgan = require("morgan");
const public_ip = require("public-ip");
const md5 = require("md5");
const moment = require("moment");

// get ip
var ip = "0.0.0.0";
public_ip.v4().then((get_ip) => {ip = get_ip; console.log(`ip is ${ip}`);});

// init app
const app = express();
express_ws(app);

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
  res.render("chat", {"ip": ip, "port": server.address().port});
});
function momentum() {
  var time = Date.now();
  return moment(time).format("YYYYMMDD-HH:mm:ss");
}
app.ws("/web_socket", function (ws, req) {
  let user_id = req.ip.toString() + momentum();
  let user_code = md5(user_id);
  access_log_stream.write(`init user id ${user_id} as ${user_code}\n`);
  ws.on("message", function(msg) {
    access_log_stream.write(`${momentum()}, ${user_code} send message: ${msg}\n`)
  })
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
  var port = server.address().port;
  console.log(`Server on ${ip}:${port}`);
});
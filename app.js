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
const database = require("./src/database");
const names = require("./src/names");

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
  public_ip.v4().then((ip) => {
    res.render("chat", {"ip": ip, "port": server.address().port});
  })
});
function momentum() {
  var time = Date.now();
  return moment(time).format("YYYYMMDD-HH:mm:ss");
};
const ws_clients = new Array();
const nick_names = {};
function transfer_one_message(ws, user_code, date, message) {
  if (user_code in nick_names) {
    nick_name = nick_names[user_code];
    transfer(ws, nick_name, date, message);
  } else {
    database.find_nick_name(user_code).then((res) => {
      nick_names[user_code] = res[0]["name"];
      transfer(ws, res[0]["name"], date, message);
    })
  }
  function transfer(ws, nick_name, date, message) {
    if (ws.readyState == 1) {
      transfer_data = JSON.stringify({
        "nick_name": nick_name,
        "date": date,
        "content": message
      });
      ws.send(transfer_data);
    }
  }
  // console.log(ws_clients[i]);
};
app.ws("/web_socket", function (ws, req) {
  // init
  let user_id = req.ip.toString() + momentum();
  let user_code = md5(user_id);
  access_log_stream.write(`init user id ${user_id} as ${user_code}\n`);
  nick_name = names.get_name();
  database.add_user(user_code, nick_name);

  // set id and user
  ws_clients.push(ws);
  nick_names[user_code] = nick_name;
  ws.send(JSON.stringify({"your_name": nick_name}));

  // on message
  ws.on("message", function(message) {
    access_log_stream.write(`${momentum()}, ${user_code} send message: ${message}\n`);
    let date = new Date().toLocaleString();
    database.add_message(user_code, date, message).then((res) => {
      for (let i=0; i<ws_clients.length; i++) {
        transfer_one_message(ws_clients[i], user_code, date, message);
      }
    });
  })
  // init all message
  database.find_message().then((messages) => {
    for (let i=0; i<messages.length; i++){
      transfer_one_message(ws, messages[i]["code"], messages[i]["time"], messages[i]["message"]);
    }
  });
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
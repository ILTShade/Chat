// import
const path = require('path');
const express = require('express');

const app = express();

// 设置包含模板的文件夹（'templates'）
app.set("views", path.join(__dirname, "templates"));
// 设置视图引擎
app.set("view engine", "ejs");

app.get('/', (req, res) => {
  res.render("chat", {});
});

app.listen(1234, () => {
  console.log('示例应用正在监听 3000 端口!');
});
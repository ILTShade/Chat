const fs = require('fs');
const path = require("path");

const names = [];
try {
  // read contents of the file
  const data = fs.readFileSync(path.join(__dirname, "../static/names.txt"), "utf-8");
  // split the contents by new line
  const lines = data.split(/\r?\n/);
  // print all lines
  lines.forEach((line) => {
    names.push(line);
  });
} catch (err) {
  console.error(err);
}

function get_name() {
  len = names.length;
  index = Math.min(Math.round(Math.random() * len), len - 1);
  return names[index];
}

module.exports = {
  get_name: get_name
}
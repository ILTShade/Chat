const mysql = require("mysql");
const util = require("util");

// db config and new database
const config = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "sunhanbo123",
  database: "WebChat"
}
const pool = mysql.createPool(config);

const query = async (sql) => {
  // return new promise
  return new Promise((resolve, reject) => {
    pool.getConnection(function(err, connection){
      if (err) {
        reject(err)
      } else {
        connection.query(sql, (err, sql_res) => {
          if (err) {
            reject(err);
          } else {
            let output = JSON.parse(JSON.stringify(sql_res));
            // console.log(output);
            resolve(output);
          }
          // connection release
          connection.release();
        })
      }
    })
  }).catch((error) => {
    console.log(error);
  })
}

// add user
const add_user = async (user_code, nick_name) => {
  let init_table = "CREATE TABLE IF NOT EXISTS `users`(`code` varchar(64) PRIMARY KEY, `name` varchar(64) NOT NULL)DEFAULT CHARSET=utf8;";
  let exist = "select count(*) from `users` where `code`='${user_code}';";
  let insert = util.format("INSERT INTO `users` (`code`, `name`) VALUES('%s', '%s');", user_code, nick_name);
  let update = util.format("UPDATE `users` SET `name`='%s' where `code`='%s';", user_code, nick_name);
  await query(init_table);
  exist_flag = await query(exist);
  if (exist_flag[0]["count(*)"] == 0) {
    res = await query(insert);
  } else {
    res = await query(update);
  }
}

// add message
const add_message = async (user_code, date, message) => {
  let init_table = "CREATE TABLE IF NOT EXISTS `messages`(`code` varchar(64), `date` varchar(64) NOT NULL, `message` varchar(256) NOT NULL)DEFAULT CHARSET=utf8;";
  let insert = util.format("INSERT INTO `messages` (`code`, `date`, `message`) VALUES('%s', '%s', '%s');", user_code, date, message);
  await query(init_table);
  res = await query(insert);
  return res;
}

// find all messages
const find_message = async () => {
  let exist = "SHOW TABLES LIKE '%messages%';";
  exist_flag = await query(exist);
  if (exist_flag.length == 0) {
    return [];
  }
  let find = "SELECT * from `messages`;"
  res = await query(find);
  return res;
}

// find nick names
const find_nick_name = async (user_code) => {
  let name = util.format("select `name` from `users` where `code`='%s';", user_code);
  res = await query(name);
  return res;
}


module.exports = {
  add_user: add_user,
  add_message: add_message,
  find_message: find_message,
  find_nick_name: find_nick_name
}

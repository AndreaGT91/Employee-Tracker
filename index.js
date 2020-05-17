require('dotenv').config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const PORT = process.env.PORT || 3306;

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",
  port: PORT,
  user: "root",
  password: process.env.PASSWORD,
  database: "employee_trackerDB"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  queryUser();
});

// Function that does actual prompting
async function doPrompt(promptType, promptMsg, promptChoices) {
  return inquirer.prompt([{
    type: promptType,
    name: "data",
    message: promptMsg,
    choices: promptChoices
  }]);
};

async function queryUser() {

};
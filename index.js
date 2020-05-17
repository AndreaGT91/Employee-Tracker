require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
// const art = require("ascii-art");
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

// Main function that controls flow
async function queryUser() {
  let keepGoing = true;
  const topMenu = ["View", "Add", "Update", "Remove", "Exit"];
  const nextMenu = ["Employee", "Role", "Department", "Back"];
  const empViewMenu = ["All Employees", "Employees By Department", "Employees By Manager", "Back"];

  console.log("\n *** Welcome to Employee Tracker *** \n");
// console.log(art.style("Employee Tracker", "framed"));

  while (keepGoing) {
    let result = null;
    let action = await doPrompt("list", "What would you like to do?", topMenu);

    // Make sure they didn't select 'Exit'
    if (action.data != topMenu[topMenu.length-1]) {
      let table = await doPrompt("list", action.data + " which type of item?", nextMenu);
      
      // Make sure they didn't select 'Back'
      if (table.data != nextMenu[nextMenu.length-1]) {
        switch (action.data) {
          case topMenu[0] :
            result = await viewItems(table.data);
            break;
          case topMenu[1] :
            result = await addItems(table.data);
            break;
          case topMenu[2] :
            result = await updateItems(table.data);
            break;
          case topMenu[3] :
            result = await removeItems(table.data);
            break;
        };
      };
    }
    else {
      keepGoing = false; // If they selected 'Exit', end loop
    };
  };
  connection.end();
};

async function viewItems(table) {
  return null
};

async function addItems(table) {
  return null

};

async function updateItems(table) {
  return null

};

async function removeItems(table) {
  return null

};
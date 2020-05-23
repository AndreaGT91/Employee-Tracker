require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
// const art = require("ascii-art");
const tableMenu = ["Employee", "Role", "Department", "Back"];

// create the connection information for the sql database
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
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

  console.log("\n *** Welcome to Employee Tracker *** \n");
// console.log(art.style("Employee Tracker", "framed"));

  while (keepGoing) {
    let result = null;
    let action = await doPrompt("list", "What would you like to do?", topMenu);

    // Make sure they didn't select 'Exit'
    if (action.data != topMenu[topMenu.length-1]) {
      let table = await doPrompt("list", action.data + " which type of item?", tableMenu);

      // Make sure they didn't select 'Back'
      if (table.data != tableMenu[tableMenu.length-1]) {
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
  const viewMenu = ["Employees By ID", "Employees By Name", "Employees By Department", "Employees By Manager", "Back"];
  const empQuery = `SELECT employee.id AS 'ID', 
    employee.first_name AS 'First Name', 
    employee.last_name AS 'Last Name', 
    role.title AS 'Title', 
    LPAD(CONCAT('$', FORMAT(role.salary, 2)), 12, ' ') AS 'Salary', 
    department.name AS 'Department', 
    IFNULL(CONCAT(manager.last_name, ', ', manager.first_name), '') AS 'Manager'
    FROM employee
    LEFT JOIN role ON employee.role_id=role.id
    LEFT JOIN department ON role.department_id=department.id
    LEFT JOIN employee AS manager ON employee.manager_id=manager.id`;
  const roleQuery = `SELECT role.id AS 'ID',
    role.title AS 'Title',
    LPAD(CONCAT('$', FORMAT(role.salary, 2)), 12, ' ') AS 'Salary',
    department.name AS 'Department'
    FROM role
    LEFT JOIN department ON role.department_id=department.id;`;
  const deptQuery = `SELECT department.id AS 'ID',
    department.name AS 'Name',
    IFNULL(CONCAT(employee.last_name, ', ', employee.first_name), '') AS 'Manager'
    FROM department
    LEFT JOIN employee ON department.manager_id=employee.id;`;
  let result = null;

  switch (table) {
    case tableMenu[0] : // Employee
      let choice = await doPrompt("list", "Which employee report would you like?", viewMenu);
      // Check to see if they picked 'Back'
      if (choice.data != viewMenu[viewMenu.length-1]) {
        switch(choice.data) {
          case viewMenu[0] : // By ID - default order
            connection.query(empQuery, function(err,res) {
              if (err) throw err;
              console.table("Employees By ID", res);
            });
            break;
          case viewMenu[1] : // By Name
            connection.query(empQuery + " ORDER BY employee.last_name, employee.first_name", function(err,res) {
              if (err) throw err;
              console.table("Employees By Name", res);
            });
          break;
          case viewMenu[2] : // By Department
            connection.query(empQuery + " ORDER BY department.name, employee.id", function(err,res) {
              if (err) throw err;
              console.table("Employees By Department", res);
            });
          break;
          case viewMenu[3] : // By Manager
            connection.query(empQuery + " ORDER BY manager.last_name, manager.first_name, employee.id", function(err,res) {
              if (err) throw err;
              console.table("Employees By Manager", res);
            });
          break;
        };
      };
    case tableMenu[1] : // Role
      connection.query(roleQuery, function(err,res) {
        if (err) throw err;
        console.table("Employee Roles", res);
      });
      break;
    case tableMenu[2] : // Department
    connection.query(deptQuery, function(err,res) {
      if (err) throw err;
      console.table("Departments", res);
    });
    break;
  };
  return result
};

async function addItems(table) {
  connection.query("SELECT * FROM employee", function(err,res) {
    if (err) throw err;
    console.table('Employees', res);
  });
  return null

};

async function updateItems(table) {
  return null

};

async function removeItems(table) {
  return null

};
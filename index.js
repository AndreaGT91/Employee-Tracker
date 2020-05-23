require("dotenv").config();
require("console.table");
const mysql = require("mysql");
const inquirer = require("inquirer");
const figlet = require('figlet');

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
async function doPrompt(promptType, promptMsg, promptChoices, promptDefault) {
  return inquirer.prompt([{
    type: promptType,
    name: "data",
    message: promptMsg,
    default: promptDefault,
    choices: promptChoices
  }]);
};

// Main function that controls flow
async function queryUser() {
  let keepGoing = true;
  const topMenu = ["View", "Add", "Update", "Remove", "Exit"];

  // Display app name as ascii art
  figlet("Employee Tracker", async function(err, data) {
    if (err) {
      console.log("\n *** Welcome to Employee Tracker *** \n");
      return;
    };
    console.log(data, "\n");

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
  });

  connection.end();
};

// Displays the various reports
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
        switch (choice.data) {
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

// Adds items to table
async function addItems(table) {
  switch (table) {
    case tableMenu[0] : // Add employee
      let first_name = await doPrompt("input", "Employee's First Name?");
      let last_name = await doPrompt("input", "Employee's Last Name?");
      first_name = first_name.data.trim();
      last_name = last_name.data.trim();
      if ((first_name === "") && (last_name === "")) {
        console.log("Employee must have either first or last name.");
      }
      else if (listRoles()) {
        let role_id = await doPrompt("number", "Enter employee's role ID:");
        role_id = parseInt(role_id.data);
          
        if (!isNaN(role_id) && listEmployees()) {
          let manager_id = await doPrompt("number", "Enter employee's manager's ID:");
          manager_id = parseInt(manager_id.data);

          if (!isNaN(manager_id)) {
            connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?);", 
              [first_name, last_name, role_id, manager_id], function(err, result) {
              if (err) throw err;
              console.log("Added " + first_name + " " + last_name);
            });
          }
          else {
            console.log(manager_id + " is not a valid ID.");
          };
        }
        else if (isNaN(role_id)) {
          console.log(role_id + " is not a valid role ID.");
        }
        else {
          console.log("Cannot retrieve list of possible managers at this time.");
        };
      }
      else {
        console.log("Cannot retrieve list of roles at this time.");
      };
      break;
    case tableMenu[1] : // Add role
      let title = await doPrompt("input", "What is the role title?");
      title = title.data.trim();
      if (title === "") {
        console.log("Role title cannot be blank.");
      }
      else {
        let salary = await doPrompt("number", "What is the salary for this role?");
        salary = parseFloat(salary.data);
        if (isNaN(salary)) {
          salary = 0.0;
        };

        if (listDepts()) {
          let department_id = await doPrompt("number", "What is the department ID for this role?");
          department_id = parseInt(department_id.data);

          if (!isNaN(department_id)) {
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);", 
            [title, salary, department_id], function(err, result) {
            if (err) throw err;
            console.log("Added " + title);
          });
          }
          else {
            console.log(department_id + " is not a valid department ID.");
          };
        }
        else {
          console.log("Cannot retrieve list of departments at this time.");
        };
      };
      break;
    case tableMenu[2] : // Add department
      let name = await doPrompt("input", "What is the department name?");
      name = name.data.trim();
      if (name === "") {
        console.log("Department name cannot be blank.");
      }
      else if (listEmployees()) {
        let manager_id = await doPrompt("number", "Enter employee ID of manager for this department:");
        manager_id = parseInt(manager_id.data);
        
        if (!isNaN(manager_id)) {
          connection.query("INSERT INTO department (manager_id, name) VALUES (?, ?);", 
            [manager_id, name], function(err, result) {
            if (err) throw err;
            console.log("Added " + name);
          });
        }
        else {
          console.log(manager_id + " is not a valid employee ID.");
        };
      }
      else {
        console.log("Cannot retrieve list of possible managers at this time.");
      };
      break;
  };
  return null
};

// Updates items in tables
async function updateItems(table) {
  switch (table) {
    case tableMenu[0] : // Update employee
      if (listEmployees()) {
        let id = await doPrompt("number", "Enter employee ID to update:");
        id = parseInt(id.data);
        
        if (!isNaN(id)) {
          connection.query("SELECT * FROM employee WHERE id=?;", [id], async function(err,res) {
            if (err) throw err;
            let first_name = await doPrompt("input", "Employee's First Name?", null, res[0].first_name);
            let last_name = await doPrompt("input", "Employee's Last Name?", null, res[0].last_name);
            first_name = first_name.data.trim();
            last_name = last_name.data.trim();
            if ((first_name === "") && (last_name === "")) {
              console.log("Employee must have either first or last name.");
            }
            else if (listRoles()) {
              let role_id = await doPrompt("number", "Enter employee's role ID:", null, res[0].role_id);
              role_id = parseInt(role_id.data);
                
              if (!isNaN(role_id) && listEmployees()) {
                let manager_id = await doPrompt("number", "Enter employee's manager's ID:", null, res[0].manager_id);
                manager_id = parseInt(manager_id.data);

                if (!isNaN(manager_id)) {
                  connection.query("UPDATE employee SET first_name=?, last_name=?, role_id=?, manager_id=? WHERE id=?;", 
                    [first_name, last_name, role_id, manager_id, id], function(err, result) {
                    if (err) throw err;
                    console.log("Updated " + first_name + " " + last_name);
                  });
                }
                else {
                  console.log(manager_id + " is not a valid ID.");
                };
              }
              else if (isNaN(role_id)) {
                console.log(role_id + " is not a valid role ID.");
              }
              else {
                console.log("Cannot retrieve list of possible managers at this time.");
              };
            }
            else {
              console.log("Cannot retrieve list of roles at this time.");
            };
          });
        }
        else {
          console.log(id + " is not a valid employee ID.");
        };
      }
      else {
        console.log("Cannot retrieve list of employees at this time.");
      };
      break;
    case tableMenu[1] : // Update role
      if (listRoles()) {
        let id = await doPrompt("number", "Enter role ID to update:");
        id = parseInt(id.data);
        
        if (!isNaN(id)) {
          connection.query("SELECT * FROM role WHERE id=?;", [id], async function(err,res) {
            if (err) throw err;
            let title = await doPrompt("input", "What is the role title?", null, res[0].title);
            title = title.data.trim();
            if (title === "") {
              console.log("Role title cannot be blank.");
            }
            else {
              let salary = await doPrompt("number", "What is the salary for this role?", null, res[0].salary);
              salary = parseFloat(salary.data);
              if (isNaN(salary)) {
                salary = 0.0;
              };

              if (listDepts()) {
                let department_id = await doPrompt("number", "What is the department ID for this role?", null, res[0].department_id);
                department_id = parseInt(department_id.data);

                if (!isNaN(department_id)) {
                  connection.query("UPDATE role SET title=?, salary=?, department_id=? WHERE id=?;", 
                    [title, salary, department_id, id], function(err, result) {
                    if (err) throw err;
                    console.log("Updated " + title);
                  });
                }
                else {
                  console.log(department_id + " is not a valid department ID.");
                };
              }
              else {
                console.log("Cannot retrieve list of departments at this time.");
              };
            };
          });
        }
        else {
          console.log(id + " is not a valid role ID.");
        };
      }
      else {
        console.log("Cannot retrieve list of roles at this time.");
      };
      break;
    case tableMenu[2] : // Update department
    if (listDepts()) {
      let id = await doPrompt("number", "Enter department ID to update:");
      id = parseInt(id.data);
      
      if (!isNaN(id)) {
        connection.query("SELECT * FROM department WHERE id=?;", [id], async function(err,res) {
          if (err) throw err;
          let name = await doPrompt("input", "What is the department name?", null, res[0].name);
          name = name.data.trim();
          if (name === "") {
            console.log("Department name cannot be blank.");
          }
          else if (listEmployees()) {
            let manager_id = await doPrompt("number", "What is the manager ID for this role?", null, res[0].manager_id);
            manager_id = parseInt(manager_id.data);

            if (!isNaN(manager_id)) {
              connection.query("UPDATE department SET name=?, manager_id=? WHERE id=?;", 
                [name, manager_id, id], function(err, result) {
                if (err) throw err;
                console.log("Updated " + name);
              });
            }
            else {
              console.log(manager_id + " is not a valid manager ID.");
            };
          }
          else {
            console.log("Cannot retrieve list of employees at this time.");
          };
        });
      }
      else {
        console.log(id + " is not a valid department ID.");
      };
    }
    else {
      console.log("Cannot retrieve list of departments at this time.");
    };
    break;
  };
  return null
};

// Deletes items from tables
async function removeItems(table) {
  switch (table) {
    case tableMenu[0] : // Delete employee
      if (listEmployees()) {
        let id = await doPrompt("number", "Enter employee ID to delete:");
        id = parseInt(id.data);
        
        if (!isNaN(id)) {
          connection.query("DELETE FROM employee WHERE id=?;", [id], function(err, result) {
            if (err) throw err;
            if (result.affectedRows > 0) {
              console.log("Deleted employee " + id);
              // TODO: error check that this employee was not a manager
            }
            else {
              console.log("Employee ID " + id + " not found.");
            };
          });
        }
        else {
          console.log(id + " is not a valid employee ID.");
        };
      }
      else {
        console.log("Unable to retrieve list of employees at this time.");
      };
      break;
    case tableMenu[1] : // Delete role
      if (listRoles()) {
        let id = await doPrompt("number", "Enter role ID to delete:");
        id = parseInt(id.data);
        
        if (!isNaN(id)) {
          connection.query("DELETE FROM role WHERE id=?;", [id], function(err, result) {
            if (err) throw err;
            if (result.affectedRows > 0) {
              console.log("Deleted role " + id);
              // TODO: error check that this role not in use
            }
            else {
              console.log("Role ID " + id + " not found.");
            };
          });
        }
        else {
          console.log(id + " is not a valid role ID.");
        };
      }
      else {
        console.log("Unable to retrieve list of roles at this time.");
      };
      break;
    case tableMenu[2] : // Delete department
      if (listDepts()) {
        let id = await doPrompt("number", "Enter department ID to delete:");
        id = parseInt(id.data);
        
        if (!isNaN(id)) {
          connection.query("DELETE FROM department WHERE id=?;", [id], function(err, result) {
            if (err) throw err;
            if (result.affectedRows > 0) {
              console.log("Deleted department " + id);
              // TODO: error check that this department not in use
            }
            else {
              console.log("Department ID " + id + " not found.");
            };
          });
        }
        else {
          console.log(id + " is not a valid department ID.");
        };
      }
      else {
        console.log("Unable to retrieve list of departments at this time.");
      };
      break;
  };
  return null
};

// Displays list of employees for selection purposes
async function listEmployees() {
  const empListQuery = `SELECT employee.id, employee.last_name, employee.first_name FROM employee 
    ORDER BY last_name, first_name;`;

  connection.query(empListQuery, function(err,res) {
    if (err) throw err;
    console.table("\n Employees", res);
    return res;
  });
};

// Displays list of roles for selection purposes
async function listRoles() {
  const roleListQuery = `SELECT role.id, department.name, role.title, employee.last_name, employee.first_name
    FROM role
    LEFT JOIN department ON role.department_id=department.id
    LEFT JOIN employee ON department.manager_id=employee.id
    ORDER BY department.name, role.title;`;

  connection.query(roleListQuery, async function(err,res) {
    if (err) throw err;
    console.table("\n Roles", res);
    return res;
  });
};

// Displays list of departments for selection purposes
async function listDepts() {
  const deptListQuery = `SELECT department.id AS 'ID',
    department.name AS 'Name',
    IFNULL(CONCAT(employee.last_name, ', ', employee.first_name), '') AS 'Manager'
    FROM department
    LEFT JOIN employee ON department.manager_id=employee.id;`;

  connection.query(deptListQuery, async function(err,res) {
    if (err) throw err;
    console.table("\n Departments", res);
    return res;
  });
};
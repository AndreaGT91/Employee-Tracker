USE employee_trackerDB;

-- Query to display all employee information
SELECT employee.id AS 'ID', 
	employee.first_name AS 'First Name', 
  employee.last_name AS 'Last Name', 
  role.title AS 'Title', 
  LPAD(CONCAT('$', FORMAT(role.salary, 2)), 12, ' ') AS 'Salary', 
  department.name AS 'Department', 
  IFNULL(CONCAT(manager.last_name, ', ', manager.first_name), '') AS 'Manager'
FROM employee
LEFT JOIN role ON employee.role_id=role.id
LEFT JOIN department ON role.department_id=department.id
LEFT JOIN employee AS manager ON employee.manager_id=manager.id;

-- ORDER BY employee.last_name, employee.first_name
-- ORDER BY department.name, employee.id
-- ORDER BY manager.last_name, manager.first_name, employee.id

-- Query to display all roles
SELECT role.id AS 'ID',
  role.title AS 'Title',
  LPAD(CONCAT('$', FORMAT(role.salary, 2)), 12, ' ') AS 'Salary',
  department.name AS 'Department'
FROM role
LEFT JOIN department ON role.department_id=department.id;

-- Query to display all departments
SELECT department.id AS 'ID',
  department.name AS 'Name',
  IFNULL(CONCAT(employee.last_name, ', ', employee.first_name), '') AS 'Manager'
FROM department
LEFT JOIN employee ON department.manager_id=employee.id;
  
-- Query to get list of roles for 'add employee'
SELECT role.id, role.title, department.name, employee.last_name, employee.first_name, employee.id AS manager_id
FROM role
LEFT JOIN department ON role.department_id=department.id
LEFT JOIN employee ON department.manager_id=employee.id;

USE employee_trackerDB;

INSERT INTO department (name) VALUE ("Development"), ("Management"), ("Marketing"), 
  ("Human Resources"), ("Sales"), ("Customer Support");

INSERT INTO role (title, salary, department_id) VALUE
  ("Manager", 100000, 1), ("Engineer", 75000, 1),
  ("President", 300000, 2), ("Vice President", 150000, 2),
  ("Manager", 100000, 3), ("Marketing Specialist", 50000, 3),
  ("Manager", 100000, 4), ("HR Specialist", 50000, 4),
  ("Manager", 100000, 5), ("Salesman", 50000, 5),
  ("Manager", 100000, 6), ("CS Specialist", 50000, 6);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE
  ("Big", "Cheese", 3, null), ("Secondary", "Cheese", 4, 1),
  ("Fred", "Flinstone", 1, 2), ("Barney", "Rubble", 2, 3),
  ("Wilma", "Flinstone", 5, 2), ("Betty", "Rubble", 6, 5),
  ("Velma", "Dinkley", 7, 2), ("Daphne", "Blake", 8, 7),
  ("Cosmo", "Spacely", 9, 2), ("George", "Jetson", 10, 9),
  ("Fred", "Jones", 11, 2), ("Shaggy", "Rogers", 12, 11);

UPDATE department SET manager_id = 3 WHERE id = 1;
UPDATE department SET manager_id = 1 WHERE id = 2;
UPDATE department SET manager_id = 5 WHERE id = 3;
UPDATE department SET manager_id = 7 WHERE id = 4;
UPDATE department SET manager_id = 9 WHERE id = 5;
UPDATE department SET manager_id = 11 WHERE id = 6;

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;
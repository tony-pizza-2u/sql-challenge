

const mysql = require('mysql2');
const inquirer = require('inquirer');
var Table = require('cli-table3');

//Connect to database
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'password',
    database: 'employee_tracker'
});

function showMainMenu() {

    inquirer.prompt([
        {
            type: 'list',
            name: 'command',
            message: 'What do you want to do?',
            choices: [
                'View All Departments',
                'View All Roles',
                'View All Employees',
                'Add A Department',
                'Add A Role',
                'Add An Employee',
                'Update An Employee Role',
                'Quit'
            ],
            loop: false
        }
    ]).then((answer) =>{

        switch (answer.command) {

            case 'View All Departments':
                viewAllDepartments();
                break;
    
            case 'View All Roles':
                viewAllRoles();
                break;
    
            case 'View All Employees':
                viewAllEmployees();
                break;
    
            case 'Add A Department':
                addDepartment();
                break;
    
            case 'Add A Role':
                addRole();
                break;
    
            case 'Add An Employee':
                addEmployee();
                break;
    
            case 'Update An Employee Role':
                updateRole();
                break;
    
            case 'Quit':
                process.exit(0);
    
        }

    });

}

function viewAllDepartments(){

    connection.query(
        'SELECT * FROM department',
        function (err, results, fields) {

            var table = new Table({
                head: ['ID', 'Name']
            });
            
            for(i = 0; i < results.length; i++){
                table.push([results[i].id, results[i].name]);
            }

            console.log(table.toString());
            console.log('\n');

            showMainMenu();

        }
    );

}

function viewAllRoles(){

    connection.query(
        'SELECT role.id, role.title, role.salary, department.name as department FROM role INNER JOIN department on role.department_id = department.id',
        function (err, results, fields) {

            var table = new Table({
                head: ['ID', 'Title', 'Salary', 'Department']
            });
            
            for(i = 0; i < results.length; i++){
                table.push([results[i].id, results[i].title, results[i].salary, results[i].department]);
            }

            console.log(table.toString());
            console.log('\n');

            showMainMenu();

        }
    );

}

function viewAllEmployees(){

    connection.query(
        'SELECT employee.id, employee.first_name, employee.last_name, role.title, role.salary, department.name as department, manager.first_name as manager_first_name, manager.last_name as manager_last_name FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id',
        function (err, results, fields) {

            if(err){
                console.log(err);
            } else {

                var table = new Table({
                    head: ['ID', 'Name', 'Title', 'Salary', 'Department', 'Manager']
                });
                
                for(i = 0; i < results.length; i++){
                    table.push([
                        results[i].id, 
                        results[i].first_name + ' ' + results[i].last_name, 
                        results[i].title,
                        results[i].salary,
                        results[i].department,
                        results[i].manager_first_name + ' ' + results[i].manager_last_name
                    ]);
                }
    
                console.log(table.toString());

            }

            console.log('\n');

            showMainMenu();

        }
    );

}

function addDepartment(){

    inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the department?'
        }
    ]).then((answer) => {

        var name = answer.name;

        connection.query(
            'INSERT INTO department (name) VALUES (?)', 
            [name],
            function (err, results){

                if(err){
                    console.log(err);
                }

                viewAllDepartments(); 

            });

    });

}

function addRole(){

    var role = {
        title: null,
        salary: null,
        department_id: null
    }

    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the title of the role?'
        }
    ]).then((titleAnswer) => {

        role.title = titleAnswer.title;

        inquirer.prompt([
            {
                type: 'number',
                name: 'salary',
                message: 'What is the salary of the role in dollars?'
            }
        ]).then((salaryAnswer) => {

            role.salary = salaryAnswer.salary;

            connection.query(
                'SELECT id, name FROM department',
                function (err, results, fields) {

                    var departments = new Array();

                    for(var i = 0; i < results.length; i++){
                        
                        departments.push({
                            name: results[i].name, 
                            value: results[i].id
                        });

                    }

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'department_id',
                            message: 'Which Department is the employee in?',
                            choices: departments,
                            loop: false
                        }
                    ]).then((departmentAnswer) => {
        
                        role.department_id = departmentAnswer.department_id;
        
                        connection.query(
                            'INSERT INTO role (title, salary, department_id) VALUES (?,?,?)', 
                            [role.title, role.salary, role.department_id],
                            function (err, results){
                
                                if(err){
                                    console.log(err);
                                }
                
                                viewAllRoles(); 
                
                            });

                    });                    
                    
                }
            );
            
        });

    });

}

function addEmployee(){

    var employee = {
        firstName: null,
        lastName: null,
        role_id: null,
        manager_id: null
    }

    inquirer.prompt([
        {
            type: 'input',
            name: 'firstName',
            message: 'What is first name of the employee?'
        }
    ]).then((firstNameAnswer) => {

        employee.firstName = firstNameAnswer.firstName;

        inquirer.prompt([
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the last name of the employee?'
            }
        ]).then((lastNameAnswer) => {

            employee.lastName = lastNameAnswer.lastName;

            connection.query(
                'SELECT id, title FROM role',
                function (err, results, fields) {

                    var roles = new Array();

                    for(var i = 0; i < results.length; i++){
                        
                        roles.push({
                            name: results[i].title, 
                            value: results[i].id
                        });

                    }

                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'role_id',
                            message: 'Which role does the employee have?',
                            choices: roles,
                            loop: false
                        }
                    ]).then((roleAnswer) => {
        
                        if(roleAnswer.role_id){
                            employee.role_id = roleAnswer.role_id;
                        }

                        connection.query(
                            'SELECT id, first_name, last_name FROM employee',
                            function (err, results, fields) {

                                var managers = new Array();

                                for(var i = 0; i < results.length; i++){
                                    
                                    managers.push({
                                        name: results[i].first_name + ' ' + results[i].last_name, 
                                        value: results[i].id
                                    });
            
                                }

                                inquirer.prompt([
                                    {
                                        type: 'list',
                                        name: 'manager_id',
                                        message: 'What is the id of the employee\'s manager?',
                                        choices: managers,
                                        loop: false
                                    }
                                ]).then((managerAnswer) =>{
                
                                    if(managerAnswer.manager_id){
                                        employee.manager_id = managerAnswer.manager_id;
                                    }
                
                                    connection.query(
                                        'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', 
                                        [employee.firstName, employee.lastName, employee.role_id, employee.manager_id],
                                        function (err, results){
                            
                                            if(err){
                                                console.log(err);
                                            }
                            
                                            viewAllEmployees();
                            
                                        }
                                    );

                                });

                            }
                        );
            
                    });
                }
            );
            
        });

    });

}

function updateRole(){

    var employee_id;
    var role_id;

    connection.query(
        'SELECT id, first_name, last_name FROM employee',
        function (err, results){

            if(err){
                console.log(err);
            } else {

                var employees = new Array();

                for(var i = 0; i < results.length; i++){
                    employees.push({
                        name: results[i].first_name + ' ' + results[i].last_name,
                        value: results[i].id
                    });
                }

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'employee_id',
                        message: 'Which employee are you updating?',
                        choices: employees,
                        loop: false
                    }
                ]).then((employeeAnswer) =>{

                    if(employeeAnswer.employee_id){
                        employee_id = employeeAnswer.employee_id;
                    }

                    connection.query(
                        'SELECT id, title FROM role',
                        function (err, results){

                            if(err){
                                console.log(err);
                            } else {

                                var roles = new Array();

                                for(var i = 0; i < results.length; i++){
                                    roles.push({
                                        name: results[i].title,
                                        value: results[i].id
                                    });
                                }

                                inquirer.prompt([
                                    {
                                        type: 'list',
                                        name: 'role_id',
                                        message: 'Which role does this employee have?',
                                        choices: roles,
                                        loop: false
                                    }
                                ]).then((roleAnswer) =>{

                                    if(roleAnswer.role_id){
                                        role_id = roleAnswer.role_id;
                                    }

                                    connection.query(
                                        'UPDATE employee SET role_id = ? WHERE id = ?',
                                        [role_id, employee_id],
                                        function (err, results){

                                            if(err){
                                                console.log(err);
                                            } else {
                                                viewAllEmployees();
                                            }
                                        }
                                    );                                    

                                });

                            }

                        }
                    );

                });                

            }

        }
    );

}

showMainMenu();

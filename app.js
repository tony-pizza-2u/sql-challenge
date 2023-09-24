
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


const mainMenu = async () => {

    let command = await showCommands();

    processCommand(command.command);

};

mainMenu();

function showCommands() {

    return inquirer.prompt([
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
            ]
        }
    ]);

}

function processCommand(command) {

    switch (command) {

        case 'View All Departments':

            connection.query(
                'SELECT * FROM department',
                function (err, results, fields) {

                    var table = new Table({
                        head: ['ID', 'Name']
                    });
                    
                    for(i = 0; i < results.length -1; i++){
                        table.push([results[i].id, results[i].name]);
                    }

                    console.log(table.toString());

                    mainMenu();
                }
            );

            break;

        case 'View All Roles':

            connection.query(
                'SELECT * FROM role',
                function (err, results, fields) {

                    var table = new Table({
                        head: ['ID', 'Title', 'Salary', 'Department_ID']
                    });
                    
                    for(i = 0; i < results.length -1; i++){
                        table.push([results[i].id, results[i].title, results[i].salary, results[i].department_id]);
                    }

                    console.log(table.toString());

                    mainMenu();

                }
            );

            break;
        case 'View All Employees':

            connection.query(
                'SELECT * FROM employee',
                function (err, results, fields) {

                    var table = new Table({
                        head: ['ID', 'Title', 'Salary', 'Department_ID']
                    });
                    
                    for(i = 0; i < results.length -1; i++){
                        table.push([results[i].id, results[i].first_name, results[i].last_name, results[i].role_id, results[i].manager_id]);
                    }

                    console.log(table.toString());

                    mainMenu();
                }
            );

            break;

        case 'Add A Department':
            console.log("AAD");
            mainMenu();
            break;

        case 'Add A Role':
            console.log('AAR');
            mainMenu();
            break;

        case 'Add An Employee':
            console.log('AAE');
            mainMenu();
            break;

        case 'Update An Employee Role':
            console.log('UAER');
            mainMenu();
            break;

        case 'Quit':
            process.exit(0);

    }


}

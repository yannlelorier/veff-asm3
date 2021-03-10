//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

//Tell express to use the body parser module
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Tell express to use cors -- enables CORS for this backend
app.use(cors());


//The following is an example of an array of three boards. 
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] }
];

var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];

//These functions ensure that the ids will be unique.
function countBoards() {
    let max = 0;
    for (let i=0;i<boards.length; i++) {
        if (max < parseInt(boards[i].id)) {
            max = parseInt(boards[i].id);
        }
    }
    return max+1;
}

function countTasks() {
    let max = 0;
    for (let i=0;i<tasks.length; i++) {
        if (max < parseInt(tasks[i].id)) {
            max = parseInt(tasks[i].id);
        }
    }
    return max+1;
}

var boardCount = countBoards();
var taskCount = countTasks();

//Your endpoints go here

//Inital page redirects to boards by default
app.get('/', function(req, res) {
    res.redirect('/api/v1/boards/');
})

//get all boards
app.get('/api/v1/boards/', function(req, res) {
    try {
        let resArray = [];

        for (let i=0; i<boards.length; i++){
            resArray.push({
                'id':boards[i].id,
                'name':boards[i].name,
                'description':boards[i].description
            });
        }
        
        return res.status(200).send(resArray);

    }catch (err){
        res.status(400).json({
            message: "Oops, something went wrong.",
            err
        });
    }

})

//getting a specific board
app.get('/api/v1/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;

    try {
        let i;
        for (i=0; i<boards.length; i++) {
            if(boards[i].id === boardId) {
                res.status(200).json(boards[i]);
                return;
            }
        }
        res.status(404).send('oopsies no board found.');
    } catch (err) {
        res.status(400).json({
            message: "Some error occured",
            err
        });
    }
})

//create a board

app.post('/api/v1/boards/', async(req, res) => {
    const name = await req.body.name;
    const description = await req.body.description;

    if (req.body.name !== undefined) {
        let newBoard = {
            id: boardCount.toString(),
            name: name,
            description: description,
            tasks: []
        }
        boardCount++;
        boards.push(newBoard);
        res.status(201).send(newBoard);

    }else {
        return res.status(405).send('Name cannot be empty');
    }
    
})


// update a board
app.post('/api/v1/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;

    const name = req.body.name;
    const description = req.body.description;
    
    if (name === undefined || description === undefined) {
        return res.status(405).send('Name or description cannot be empty');
    }else {
        let i;
        for (i=0; i<boards.length; i++) {
            if (boards[i].id === boardId) {
                if (boards[i].tasks.length === 0) {
                    return res.status(405).send('The tasks associated to this board must be deleted first!');
                }
                
                let updatedBoard = {
                    id: boardId,
                    name: req.body.name,
                    description: req.body.description,
                    tasks: boards[i].tasks
                }
                boards.splice(i, 1);
                boards.push(updatedBoard);
                return res.status(201).send(updatedBoard);
            }
        }
        return res.status(404).send('Board '+ boardId +' not found.')
    }
})


app.delete('/api/v1/boards/:boardId/', function(req, res) {
    const boardId = req.params.boardId;
    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex > -1){
        const allTasksNotArchived = boards[boardIndex].tasks.some(id => tasks && tasks[id] && tasks[id].archived === false);
        if(!allTasksNotArchived){
            boards.splice(boardIndex, 1);
            return res.status(200).send(boards);
        }
      }
      return res.status(405).send('Board contains tasks');
    })

//getting the tasks assigned to a specific board
app.get('/api/v1/boards/:boardId/tasks/', function(req, res) {
    let boardId = req.params.boardId;
    let sort = req.query.sort;
    let resArray = [];

    let i;
    let j;


    for (i=0; i<boards.length; i++) {
            if (boards[i].id === boardId) {
                for (j=0; j<boards[i].tasks.length; j++) {
                    resArray.push(tasks[boards[i].tasks[j]]);
                }
            }
    }

    if(!sort){
        return res.status(200).send(resArray);
    } else if (sort === 'id') {
        const sorted = resArray.sort((a,b) => a.id > b.id);
        return res.status(200).send(sorted);
    } else if (sort === 'taskName') {
         const sorted = resArray.sort((a,b) => ('' + a.taskName).localeCompare(b.taskName));
         return res.status(200).send(sorted);
         
        } else if (sort === 'dateCreated') {
         const sorted = resArray.sort((a,b) => a.dateCreated.getTime() - b.dateCreated.getTime());
         return res.status(200).send(sorted);
     }else {
         return res.status(404).send('Unrecognized sorting argument. Check your query');
    }
})


app.get('/api/v1/boards/:boardId/tasks/:taskId/', function(req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;
    let i;
    let j;

    for (i=0; i<boards.length; i++) {
        if (boards[i].id === boardId) {
            for (j=0; j<boards[i].tasks.length; j++) {
                let thisTask = boards[i].tasks[j];   

                if (parseInt(taskId) === parseInt(thisTask)) {
                    return res.status(200).send(tasks[thisTask]);
                }
            }
        }else {
            return res.status(404).send('No boardId matches the one in the query.');
        }
    } 
    return res.status(404).send('No task found with that ID for this board.');
    
})


//post new tasks
app.post('/api/v1/boards/:boardId/tasks/', (req, res) => {
    let boardId = req.params.boardId;
    const taskName = req.body.taskName

    let i;
    for (i=0; i<boards.length; i++) {
        if (boards[i].id === boardId) {
            var aDate = new Date()
            let today = new Date(Date.UTC(aDate.getFullYear(), aDate.getMonth(), aDate.getDate(), aDate.getHours(), aDate.getMinutes(), aDate.getSeconds()));

            let resJson = {
                id: taskCount.toString(),
                boardId: boardId,
                taskName: taskName,
                dateCreated: today,
                archived: false
            }
            boards[i].tasks.push(resJson.id);
            tasks.push(resJson);
            taskCount++;
            return res.status(201).send(resJson);
        }
    }
    return res.status(405).send('Bad Action');
})

//delete task //TODO ask if delete or archive is enough
app.delete('/api/v1/boards/:boardId/tasks/:taskId', function(req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;

    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex === -1){
        return res.status(400).send('The board was not found')
    }
    const taskIndex = tasks.findIndex(item => item.id === taskId);
    if(taskIndex === -1){
        return res.status(400).send('The task was not found')
    }
    const deletedTask = tasks[taskIndex];
    boards[boardIndex].tasks.splice(taskId,1);
    tasks.splice(taskIndex,1);
    res.status(200).send(deletedTask);
    
})

// update task
app.patch('/api/v1/boards/:boardId/tasks/:taskId/', function (req, res) {
    //params
    const boardId = req.params.boardId;
    const taskId = req.params.taskId;

    //body
    let taskName = req.body.taskName;
    let taskBoardId = req.body.boardId;
    let archived = req.body.archived;

    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex === -1){
        return res.status(400).send('The board was not found')
    }

    const taskIndex = tasks.findIndex(item => item.id === taskId);
    if(taskIndex === -1){
        return res.status(400).send('The task was not found')
    }

     if(typeof taskName === "string"){
        tasks[taskIndex].taskName = taskName
    }
    if(typeof taskBoardId === "string"){
        const newBoardIndex = boards.findIndex(item => item.id === taskBoardId.toString());
        if(newBoardIndex === -1 && taskBoardId){
            return res.status(400).send('The destination board was not found')
        }
        tasks[taskIndex].boardId = taskBoardId.toString()
        
        //remove task from current board
        boards[boardIndex].tasks = boards[boardIndex].tasks.filter(s => s !== taskId);
        
        // add task to new board
        boards[newBoardIndex].tasks.push(taskId);
    }
    if(typeof archived === "boolean" ){
        tasks[taskIndex].archived = archived
    } 

    const returnedTask = tasks.findIndex(item => item.id === taskId)
    res.status(200).send(tasks[returnedTask]);
})

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
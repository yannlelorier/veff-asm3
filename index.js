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

//get all boards (checked with Postman)
app.get('/api/v1/boards/', function(req, res) {
    try {
        let resArray = [];

        for (let i=0; i<boards.length; i++){
            resArray.push({
                id:boards[i].id,
                name:boards[i].name,
                description:boards[i].description
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

//getting a specific board (checked with PM)
app.get('/api/v1/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;

    try {
        let i;
        for (i=0; i<boards.length; i++) {
            if(boards[i].id === boardId) {
                let copiedBoard = boards[i];
                for (let j=0; j<copiedBoard.tasks.length; j++) {
                    if (tasks[copiedBoard.tasks[j]].archived !== true) {
                        copiedBoard.tasks[j] = tasks[copiedBoard.tasks[j]];
                    }else {
                        copiedBoard.tasks.splice(j,1);
                    }
                }
                res.status(200).json(copiedBoard);
                return;
            }
        }
        res.status(404).send({message:'oopsies no board was found.'});
    } catch (err) {
        res.status(400).json({
            message: "Some error occured",
            err
        });
    }
})

//create a board (checked with PM)
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
        return res.status(405).send({message:'Name cannot be empty'});
    }
    
})


// update a board (checked with PM)
app.post('/api/v1/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;

    const name = req.body.name;
    const description = req.body.description;
    
    if (name === undefined || description === undefined) {
        return res.status(405).send({message:'Name or description cannot be empty'});
    }else {
        let i;
        for (i=0; i<boards.length; i++) {
            if (boards[i].id === boardId) {
                if (boards[i].tasks.length !== 0) {
                    return res.status(405).send({message:'The tasks associated to this board must be deleted first!'});
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
        return res.status(404).send({message:'Board '+ boardId +' not found.'})
    }
})

//delete one board (checked with PM)
app.delete('/api/v1/boards/:boardId/', function(req, res) {
    const boardId = req.params.boardId;
    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex > -1){
        const allTasksNotArchived = boards[boardIndex].tasks.some(id => tasks && tasks[id] && tasks[id].archived === false);
        if(!allTasksNotArchived){
            let deletedBoard = boards.splice(boardIndex, 1);
            return res.status(200).send(deletedBoard);
        }
    }
    return res.status(405).send({message:'Board contains tasks'});
})

// delete all boards (checked with PM)
app.delete('/api/v1/boards/', function(req, res) {
    let deletedBoards = boards;
    for (let i=0; i<boards.length; i++) {
        for (let j=0; j<boards[i].tasks.length; j++) {
            tasks[boards[i].tasks[j]].archived = true;
            deletedBoards[i].tasks[j] = tasks[deletedBoards[i].tasks[j]]
        }
    }
    boards = [];
    return res.status(200).send(deletedBoards);
})

//getting the tasks assigned to a specific board (checked with PM)
app.get('/api/v1/boards/:boardId/tasks/', function(req, res) {
    let boardId = req.params.boardId;
    let sort = req.query.sort;
    let resArray = [];
    let foundBoard = false;

    let i;
    let j;

    for (i=0; i<boards.length; i++) {
        if (boards[i].id === boardId) {
            foundBoard = true;
            for (j=0; j<boards[i].tasks.length; j++) {
                //do not send archived tasks
                if (tasks[boards[i].tasks[j]].archived === false) {
                    resArray.push(tasks[boards[i].tasks[j]]);
                }
            }
        }
    }
    if (!foundBoard) {
        return res.status(404).send({message:'Could not find board with id '+ boardId})
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
         return res.status(400).send({message:'Unrecognized sorting argument. Check your query'});
    }
})

// getting a task for a specific board (checked with PM)
app.get('/api/v1/boards/:boardId/tasks/:taskId/', function(req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;
    let i;
    let j;

    for (i=0; i<boards.length; i++) {
        if (boards[i].id === boardId) {
            for (j=0; j<boards[i].tasks.length; j++) {
                let thisTask = boards[i].tasks[j];
                //do not send archived tasks
                if (parseInt(taskId) === parseInt(thisTask) && tasks[thisTask].archived !== true) {
                    return res.status(200).send(tasks[thisTask]);
                }
            }
            return res.status(404).send({message:'No unarchived task found with id '+taskId});
        }
    }
    return res.status(404).send({message:'No board was found with id '+ boardId});
    
})


//post new tasks (checked with PM)
app.post('/api/v1/boards/:boardId/tasks/', (req, res) => {
    let boardId = req.params.boardId;
    const taskName = req.body.taskName

    if (taskName === undefined || taskName === '') {
        return res.status(400).send({message:'Bad request: You must provide a non-empty taskName'})
    }

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
    return res.status(404).send({message:'The Board id '+ boardId +' was not found'});
})

//delete task (checked with PM)
app.delete('/api/v1/boards/:boardId/tasks/:taskId', function(req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;

    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex === -1){
        return res.status(404).send({message:'The board with id '+boardId+' was not found'})
    }
    const taskIndex = tasks.findIndex(item => item.id === taskId);
    if(taskIndex === -1){
        return res.status(404).send({message:'The task with id '+taskId+' for board id '+boardId+' was not found'})
    }
    const deletedTask = tasks[taskIndex];
    boards[boardIndex].tasks.splice(taskId,1);
    tasks.splice(taskIndex,1);
    res.status(200).send(deletedTask);
    
    
})

// update task (checked with PM)
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
        return res.status(404).send({message:'The board was not found'})
    }

    const taskIndex = tasks.findIndex(item => item.id === taskId);
    if(taskIndex === -1){
        return res.status(404).send({message:'The task was not found'})
    }

    if(typeof taskName === "string"){
        tasks[taskIndex].taskName = taskName
    }
    if(typeof taskBoardId === "string" && !isNaN(parseInt(taskBoardId)) || typeof taskBoardId === "number"){
        const newBoardIndex = boards.findIndex(item => item.id === taskBoardId.toString());
        if(newBoardIndex === -1 && taskBoardId){
            return res.status(404).send({message:'The destination board was not found'})
        }
        tasks[taskIndex].boardId = taskBoardId.toString()
        
        //remove task from current board
        boards[boardIndex].tasks = boards[boardIndex].tasks.filter(s => s !== taskId);
        
        // add task to new board
        boards[newBoardIndex].tasks.push(taskId);
    }else {
        return res.status(405).send({message:'BoardId \''+taskBoardId+'\' is not a number'})
    }
    if(typeof archived === "boolean"){
        tasks[taskIndex].archived = archived
    }else if (typeof archived === "string") {
        if (archived.toLowerCase() === 'true') {
            tasks[taskIndex].archived = true;
        }else if (archived.toLowerCase() === 'false') {
            tasks[taskIndex].archived = false;
        }
        else{
            return res.status(405).send({message:'archived should be a boolean (or boolean string: \'true\' or \'false\')'});
        }
    }

    const returnedTask = tasks.findIndex(item => item.id === taskId)
    res.status(200).send(tasks[returnedTask]);
})

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
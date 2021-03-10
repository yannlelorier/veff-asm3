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

//TODO correct this
var boardCount = boards.length+1;
var taskCount = tasks.length;

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

    if (req.body.name !== '') {
        let newBoard = {
            id: boardCount.toString(),
            name: name,
            description: description,
            tasks: []
        }
        boardCount++;
        boards.push(newBoard);
        console.log("Created a new board.");
        res.status(200).send(newBoard);

    }else {
        return res.status(405).send('Name cannot be empty');
    }
    
})

//TODO update a board
app.post('/api/v1/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;
    
    if (req.body.name !== '') {
        let newBoard = {
            id: boardCount,
            name: req.body.name,
            description: req.body.description,
            tasks: []
        }
        boardCount++;
        boards = {...boards, newBoard};
        return res.status(200).send(newBoard);

    }else {
        return res.status(405).send('Name cannot be empty');
    }
})

// TODO delete a specific board
app.delete('/api/v1/boards/:boardId/', function(req, res) {
    const boardId = req.params.boardId;
    const boardIndex = boards.findIndex(item => item.id === boardId);
    if(boardIndex > -1){
        const allTasksNotArchived = boards[boardIndex].tasks.some(id => tasks[id].archived === false);
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
    let resArray = [];

    let i;
    let j;

    if (!req.query.sort) {
        for (i=0; i<boards.length; i++) {
            if (boards[i].id === boardId) {
                for (j=0; j<boards[i].tasks.length; j++) {
                    resArray.push(tasks[boards[i].tasks[j]]);
                }
            }
        }
    }
    //TODO sort argument
    // else if (req.query.sort === 'id') {
    //     for (i=0; i<boards.length; i++) {
    //     }
    // }else if (req.query.sort === 'taskName') {

    // } else if (req.query.sort === 'dateCreated') {

    // }else {
    //     return res.status(404).send('Unrecognized sorting argument. Check your query');
    // }

    return res.status(200).send(resArray)
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

//TODO post tasks
app.post('/api/v1/boards/:boardId/tasks/', function(req, res) {
    res.status(200);
})

//TODO delete task
app.delete('/api/v1/boards/:boardId/tasks/:taskId', function(req, res) {
    res.status(200);
})

//TODO add update task

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
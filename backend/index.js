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
    res.redirect('/boards/');
})

//get all boards
app.get('/boards/', function(req, res) {
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
app.get('/boards/:boardId/', function(req, res) {
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
app.post('/boards/', async(req, res) => {
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
        res.sendStatus(200);

    }else {
        return res.status(405).send('Name cannot be empty');
    }
    
})

//TODO update a board
app.post('/boards/:boardId/', function(req, res) {
    let boardId = req.params.boardId;
    
    if (req.body.name !== '') {
        let newBoard = {
            id: boardCount,
            name: req.body.name,
            description: req.body.description,
            tasks: []
        }
        boardCount++;
        boards.push(boards);
        return res.status(200).send(newBoard);

    }else {
        return res.status(405).send('Name cannot be empty');
    }
})

// TODO delete a specific board
app.delete('/boards/:boardId/', function(req, res) {
    res.status(200);
})

//getting the tasks assigned to a specific board
app.get('/boards/:boardId/tasks/', function(req, res) {
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

app.get('/boards/:boardId/tasks/:taskId/', function(req, res) {
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
app.post('/boards/:boardId/tasks/', async(req, res) => {
    let boardId = req.params.boardId;
    const taskName = await req.body.taskName

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
            console.log(boards[i].tasks);
            console.log(tasks);
            return res.sendStatus(200);
        }
    }
    return res.status(405).send('Bad Action');
})

//delete task
app.delete('/boards/:boardId/tasks/:taskId', function(req, res) {
    let boardId = req.params.boardId;
    let taskId = req.params.taskId;

    let i;
    let j;
    for (i=0; i<boards.length; i++) {
        console.log(typeof(boardId));
        console.log(typeof(boards[i].id));
        if (boardId === boards[i].id) {
            for (j=0; j<boards[i].tasks.length; j++) {
                if (taskId === boards[i].tasks[j]) {
                    boards[i].tasks = boards[i].tasks.splice(j,j);
                    console.log("board tasks"+boards[i].tasks);

                    //archiving in tasks
                    let k;
                    for (k=0; k<tasks.length; k++) {
                        if (taskId === tasks[k].id) {
                            tasks[k].archived = true;
                            console.log("tasks " + tasks);
                            return res.status(200).send(tasks[k])
                        }
                    }

                }
            }
        }
    }
    return res.status(404).send('The boardId or the taskId were not found.')

})

//TODO add update task

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});
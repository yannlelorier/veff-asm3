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

//Your endpoints go here

//Inital page redirects to boards by default
app.get('/', function(req, res) {
    res.redirect('/boards/');
})

//get all boards
app.get('/boards/', function(req, res) {
    res.status(200);
    try {
        res.status(200).json({
            //TODO only send ID, name and description
            data: boards

        });
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
        let board = boards.find(board => board.id === boardId);
        res.status(200).json({
            data: board
        });
    } catch (err) {
        res.status(400).json({
            message: "Some error occured",
            err
        });
    }
})

//create a board
app.post('/boards/', function(req, res) {
    res.status(200);
})

//update a board
app.post('/boards/:boardId/', function(req, res) {
    res.status(200);
})

//delete a specific board
app.delete('/boards/:boardId/', function(req, res) {
    res.status(200);
})

//getting the tasks assigned to a specific board
app.get('boards/:boardId/tasks/', function(req, res) {
    res.status(200);
})

app.get('boards/:boardId/tasks/:taskId', function(req, res) {
    res.status(200);
})

app.post('boards/:boardId/tasks/', function(req, res) {
    res.status(200);
})

app.delete('boards/:boardId/tasks/:taskId', function(req, res) {
    res.status(200);
})

//TODO add update

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});